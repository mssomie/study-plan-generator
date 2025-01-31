export async function POST(req){

    // try{
        const body = await req.json()
        const {url} = body
        console.log('body: ', body)
   
    
        const response = await fetch('http://127.0.0.1:5000/add_professor',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url})
        });
        console.log('response: ', response)
        
        if (response.ok){
            const contentType = response.headers.get('Content-Type')
            let data;
            if (contentType && contentType.includes('application/json')){
                data = await response.json()
            }else{
                data = await response.text()
            }

            console.log("response was okay", data)
            return new Response(JSON.stringify({message: 'URL submitted successfully', data}), 
            {status: 200,
             headers: {'Content-Type': 'application/json'}
            })
        }else{
            console.error("error response: ", response)
            return new Response(JSON.stringify({messgae:'Error submitting getting URL'}
                
            ), {
                status:500,
                headers: {'Content-Type': 'application/json'}
            })
        }
    // }
    // catch(err){
    //     console.log('error: ', err)
    //     return new Response(JSON.stringify({error: err}),{
    //         status: 500,
    //         headers: {'Content-Type': 'application/json'}
    //     })
    // }

}