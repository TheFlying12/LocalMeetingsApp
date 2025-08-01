import OpenAI from 'openai'
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

require('dotenv').config();

export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const city = searchParams.get('city');
    const state = searchParams.get('state')
    
    console.log("city: ", city)
    console.log("state: ", state)

    // var response = null
    // const query = `${city} ${state} city council site:.gov`;
    // try{
        
    //     response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.api_key}&cx=${process.env.g_cx_id}&q=${query}`)
    //     //response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${process.env.g_cx_id}&key=${process.env.G_SEARCH_KEY}`)
    // }
    // catch(e){
    //     console.log("failed at google search API")
    //     console.error(e)
    // }    

    // console.log(response)

    // // const data = await response.json()

    // console.log(data)

    const systemPrompt = 'Based on the city and state, find the council meetings website and get their meetings and agendas'
    const userPrompt = `${city}, ${state}`
    const openaiRes = await client.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ],
    });
    
    const bestUrl = openaiRes

    console.log(`OPEN AI API RESPONSE: ${bestUrl}`)


    return Response.json({
        city,
        state,
        bestUrl
    });
   

}