import OpenAI from 'openai'
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

require('dotenv').config();

export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const zip = searchParams.get('zip');

    //console.log("ZIP received:", zip);

    if (!zip || zip.length != 5) {
      console.log("Invalid ZIP format");
      return Response.json({ error: 'Invalid ZIP format' }, { status: 400 });
    }
    var geoRes = null
    try{
        geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    }
    catch(e){
        console.log("failed at zippopotam ZIP request")
        console.error(e)
    }
    //console.log("Zippopotam.us status:", geoRes.status);

    if (!geoRes.ok) {
      console.log("Zippopotam API failed for ZIP:", zip);
      return Response.json({ error: 'ZIP not found' }, { status: 404 });
    }

    const geoData = await geoRes.json();
    const place = geoData.places?.[0];
    //console.log(geoData)
    const city = place["place name"];
    const state = place["state"];
    
    console.log("city: ", city)

    var response = null
    
    try{
        response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.G_SEARCH_KEY}&cx=${process.env.g_cx_id}=${city}+${state}+city+council+agenda`)
    }
    catch(e){
        console.log("failed at google search API")
        console.error(e)
    }    

    console.log(response)

    const data = await response.json()

    console.log(data)

    const systemPrompt = 'Based on the list of URLs provided, select the best one to get meeting schedules and agendas'
    const openaiRes = await client.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ],
    response_format: "json"
    });
    
    const bestUrl = JSON.parse(openaiRes.choices[0].message.content).selected_url;

    return Response.json({
        city,
        state,
        bestUrl
    });
   

}