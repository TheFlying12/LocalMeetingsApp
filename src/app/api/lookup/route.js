import OpenAI from 'openai'
const client = new OpenAI();

require('dotenv').config
//console.log(process.env)

export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const zip = searchParams.get('zip');

    console.log("ZIP received:", zip);

    if (!zip || zip.length < 5) {
      console.log("Invalid ZIP format");
      return Response.json({ error: 'Invalid ZIP format' }, { status: 400 });
    }

    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    console.log("Zippopotam.us status:", geoRes.status);

    if (!geoRes.ok) {
      console.log("Zippopotam API failed for ZIP:", zip);
      return Response.json({ error: 'ZIP not found' }, { status: 404 });
    }

    const geoData = await geoRes.json();
    const place = geoData.places?.[0];
    //console.log(geoData)
    const city = place["place name"];
    const state = place["state"];

    const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=
        ${process.env.G_Search_Key}&cx=017576662512468239146:omuauf_lfve&
        q=${city}%20${state}%20city%20council%20agenda`)
    
    const data = await response.json()
    let urlList = Array()
    for(var i = 0; i<6 ; i++){
        urlList.push(data.items[i].link)
    }

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