#!/usr/bin/env python
# coding: utf-8

# In[29]:


# Import dotenv, os and Pinecone
from dotenv import load_dotenv
load_dotenv()
import os
from pinecone import Pinecone, ServerlessSpec
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests 
import logging
logging.basicConfig(level = logging.INFO)
app= Flask(__name__)
CORS(app)



# In[30]:


# Connect to the pinecone index
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("rmp-rag")


# In[27]:


@app.route('/add_professor', methods=['POST'])

def add_professor_handler():
    logging.info(f"Received request: {request.json}")

    # Get professor's information by scrapping the provided RMP link
    data = request.json
    url=data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

        }
        page = requests.get(url, headers=headers)

        if page.status_code!=200:
            return jsonify({'error': 'Failed to retrieve page', 'status_code': page.status_code}), page.status_code

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(page.content, 'html.parser')

        name = soup.find(class_="NameTitle__Name-dowf0z-0 cfjPUG").getText()
        rating = soup.find(class_="RatingValue__Numerator-qw8sqy-2 liyUjw").getText()
        subject = soup.find(class_="TeacherDepartment__StyledDepartmentLink-fl79e8-0 iMmVHb").getText()
        ratings = soup.find(class_="Comments__StyledComments-dzzyvm-0 gRjWel")
        reviews= [rev.getText() for rev in ratings]
        review = {
            "professor": name,
            "subject": subject,
            "stars": rating,
            "review": reviews,

        }

        print(review)

        from langchain.embeddings import HuggingFaceEmbeddings
        processed_data = []
        # Load the pretrained model
        model= HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        # Create embeddings (numerical sematic relationship of words)

        embedding = model.embed_query(review["review"][0])

        processed_data.append({
            "values": embedding,
            "id": review["professor"],
            "metadata":{
                "review": review["review"],
                "subject": review["subject"],
                "stars": review["stars"]
            }
        })

        # Insert embedding into vector database
        index.upsert(
            vectors = processed_data,
            namespace = "ns1"
        )

        return jsonify({"message": "Successfully added!", "review": review  }),200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__== '__main__':
    app.run(port=5000)


# In[ ]:




