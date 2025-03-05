import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { isAsyncFunction } from 'util/types';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

let domainPDDL, problemPDDL;
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptEngineeringPrompt = `Hey Athena, below is summarized, some research on effective study strategies.

*   **Testing Effect and Retrieval Practice**:
    *   **Intervening Tests**: Implement regular tests between initial learning and final assessments to improve memory retention.
    *   **Spaced Retrieval**: Space out retrieval trials to ensure full engagement of cognitive processes during each attempt, which enhances retention compared to massed retrieval.
    *   **Complete Retrieval**: Prioritize complete retrieval events, such as free recall, as they enhance memory performance more effectively than less complete methods like cued recall or recognition.

*   **Optimizing Study Conditions**:
    *   **Time Management**: Manage study time efficiently by setting goals and minimizing distractions.
    *   **Solo Study**: Study alone to improve knowledge retention.
    *   **Varied Resources**: Use multiple learning resources and technology.
    *   **Peer Teaching**: Engage in peer teaching to reinforce understanding.

*   **Strategic Use of Study Materials**:
    *   **Lecture Slides**: Use lecture slides with personal notes for regular study and exam preparation.
    *   **Previous Exams**: Review previous exam questions when preparing for exams.

*   **Understanding the Testing Effect**:
    *   **Retrieval vs. Restudying**: Recognize that retrieval practice through testing is more effective than simply restudying material.
    *   **Effortful Retrieval**: Promote effortful retrieval, as the more difficult the retrieval, the greater the benefit to memory.
    *   The **completeness of retrieval events** set the parameters for the testing phenomenon
    *   **Address potential bias**: By broadening the cued-recall and recognition intervening tests

*   **Motivation and Mindset**:
    *   **Self-Gratification**: Maintain motivation through self-gratification and fulfilling personal or family aspirations.

Generate the study plans with these strategies in mind, guiding the students to optimal studying. 

`

const systemPrompts = {
  zeroShot: `You are Athena, an AI assistant that helps students generate study plans. Generate based on the given prompt`,
  promptEngineering: promptEngineeringPrompt,
  pddlPlanner: `Convert the following problem into a PDDL problem description`,
};

async function zeroShotWorkflow(prompt) {
  const response = await groqClient.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompts.zeroShot },
      { role: 'user', content: prompt },
    ],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });
  return response.choices[0].message.content;
}

async function promptEngineeringWorkflow(prompt) {
  const response = await groqClient.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompts.promptEngineering },
      { role: 'user', content: prompt },
    ],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  return response.choices[0].message.content;
}

const systemPrompt = `Generate both a domain and problem PDDL file based on the user's prompt. The domain and problem files must be compatible with each other. Use the following format:

### Domain PDDL
(define (domain study-planning)
  (:requirements :strips :typing)
  (:types 
    topic study-day
  )
  (:predicates 
    (know ?topic - topic)
    (studied ?topic - topic ?study-day - study-day)
    (available ?study-day - study-day)
  )
  (:action study
    :parameters (?topic - topic ?study-day - study-day)
    :precondition (and (available ?study-day) (not (know ?topic)))
    :effect (and (know ?topic) (studied ?topic ?study-day))
  )
)

### Problem PDDL
(define (problem trigonometry-study-plan)
  (:domain study-planning)
  (:objects 
    trig-angles trig-identities trig-equations - topic
    day1 day2 day3 day4 day5 day6 day7 day8 day9 day10 day11 day12 day13 day14 - study-day
  )
  (:init 
    (available day1)
    (available day2)
    (available day3)
    (available day4)
    (available day5)
    (available day6)
    (available day7)
    (available day8)
    (available day9)
    (available day10)
    (available day11)
    (available day12)
    (available day13)
    (available day14)
    (not (know trig-angles))
    (not (know trig-identities))
    (not (know trig-equations))
  )
  (:goal 
    (and 
      (know trig-angles)
      (know trig-identities)
      (know trig-equations)
    )
  )
)

Ensure that the domain and problem files are compatible. Do not print out anything else but the PDDL code/text as what you generate is automatically appended into a PDDL file and run. 
If you add extra comments, the code won't run. Also, don't use any floating-point numbers or unsupported requirements like :numeric-fluents, as that could cause issues.`;


async function generatePDDL(userPrompt) {
  const response = await groqClient.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  // Extract domain and problem PDDL from the response
  const fullResponse = response.choices[0].message.content;
  domainPDDL = fullResponse.split('### Domain PDDL')[1].split('### Problem PDDL')[0].trim();
  problemPDDL = fullResponse.split('### Problem PDDL')[1].trim();

  
  return { domainPDDL, problemPDDL };
}

async function pddlPlannerWorkflow(userPrompt) {
  try {
    // Generate PDDL files
    const { domainPDDL, problemPDDL } = await generatePDDL(userPrompt);
    console.log("Generated domain PDDL:", domainPDDL);
    console.log("Generated problem PDDL:", problemPDDL);

    // Save PDDL files
    const domainFile = savePDDLToFile(domainPDDL, 'domain.pddl');
    const problemFile = savePDDLToFile(problemPDDL, 'problem.pddl');

    // Run Fast Downward
    const rawPlan = await runFastDownward(domainFile, problemFile);
    const unformattedPlan = extractSolution(rawPlan);
    const plan = unformattedPlan.join('\n');

    // Clean up temporary files
    cleanupFiles([domainFile, problemFile]);
    const naturalPlan = generateNaturalResponse(userPrompt, plan)



    return naturalPlan;
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function generateNaturalResponse(userPrompt, pddlPlan) {
  const response = await groqClient.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `This study plan: ${pddlPlan} was generated by the fast downward planner in response to the prompt gotten from the users. Kindly convert into natural language so the users will understand it. `
      },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  // Return natural language plan
  return response.choices[0].message.content;
}
function extractSolution(output) {
  const lines = output.split('\n');
  const actionRegex = /^([a-zA-Z_-]+)\s+([a-zA-Z0-9_-]+\s*)+\(\d+\)$/;

  const solutionSteps = lines
    .filter(line => actionRegex.test(line))
    .map(line => line.replace(/\(\d+\)$/, '').trim());

  return solutionSteps;
}

// Save PDDL Files Locally
const fs = require('fs');
const path = require('path');

function savePDDLToFile(content, fileName) {
  // Path to tmp
  const tmpDir = path.join(process.cwd(), 'tmp');

  // Create path if it does not exist
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const filePath = path.join(tmpDir, fileName);
  console.log("FILE PATH: ", filePath);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Pass PDDL to Fast Downward
const { exec } = require('child_process');

function runFastDownward(domainFile, problemFile) {
  return new Promise((resolve, reject) => {
    const fastDownwardPath = '/Users/queenmother/Documents/Workspace/study-plan-generator/downward/fast-downward.py';
    const command = `${fastDownwardPath} --alias lama-first ${domainFile} ${problemFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}

function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

async function measureWorkflow(workflowFn, prompt){
  const startTime = Date.now();
  let result, failure = false, errorMessage = null;

  try{
    result = await workflowFn(prompt);
  }
  catch (error){
    console.error('Workflow failed: ', error);
    result = null;
    failure = true;
    errorMessage = error.message;
  }

  const endTime = Date.now();
  const timeTaken = endTime - startTime;

  return {result, timeTaken, failure, errorMessage};
}
export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch (error) {
    return new NextResponse('Invalid JSON data', { status: 400 });
  }

  if (!Array.isArray(data.messages)) {
    return new NextResponse('Invalid messages format', { status: 400 });
  }

  const userPrompt = data.messages[data.messages.length - 1].content;

  try {
    // Run the different workflows in parallel
    const [zeroShot, promptEngineering, pddlPlanner] =
      // await Promise.all([
      //   zeroShotWorkflow(userPrompt),
      //   promptEngineeringWorkflow(userPrompt),
      //   pddlPlannerWorkflow(userPrompt),
      // ]);

      await Promise.all([
        measureWorkflow(zeroShotWorkflow, userPrompt),
        measureWorkflow(promptEngineeringWorkflow, userPrompt),
        measureWorkflow(pddlPlannerWorkflow, userPrompt),

      ])
      // Save to Firestore
      const promptRef = await addDoc(collection(db, 'prompts'), {
        prompt: userPrompt,
        zeroShotResponse: zeroShot.result,
        promptEngineeringResponse: promptEngineering.result,
        pddlPlannerResponse: pddlPlanner.result,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, 'performance'), {
        promptId: promptRef.id,
        zeroShotTime: zeroShot.timeTaken,
        promptEngineeringTime: promptEngineering.timeTaken,
        pddlPlannerTime: pddlPlanner.timeTaken,
        zeroShotFailure: zeroShot.failure,
        promptEngineeringFailure: promptEngineering.failure,
        pddlPlannerFailure: pddlPlanner.failure,
        zeroShotError: zeroShot.errorMessage,
        promptEngineeringError: promptEngineering.errorMessage,
        pddlPlannerError: pddlPlanner.errorMessage,
        timestamp: serverTimestamp(),
        
      })  

      // Save generated PDDLs into firebase

    await addDoc(collection(db, 'pddls'), {
      promptId: promptRef.id,
      domainPddl: domainPDDL,
      problemPddl: problemPDDL,
    })

    
    return NextResponse.json({
      zeroShot: {
        result: zeroShot.result,
        error: zeroShot.failure ? zeroShot.errorMessage: null,
      },
      pddlPlanner: {
        result: pddlPlanner.result,
        error: pddlPlanner.failure ? pddlPlanner.errorMessage: null,
      },
      promptEngineering: {
        result: promptEngineering.result,
        error: promptEngineering.failure ? promptEngineering.errorMessage: null,
      },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}