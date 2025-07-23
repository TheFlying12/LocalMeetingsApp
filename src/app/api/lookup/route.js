import cityCouncilMap from '@/data/cityCouncilMap.json'
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

    const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=
        ${process.env.G_Search_Key}&cx=017576662512468239146:omuauf_lfve&
        q=${city}%20${state}%20city%20council%20agenda`)
    
    const data = await response.json()
    for(var i = 0; i<data.items.length; i++){
        
    }



    return Response.json({
        city,
        state,
        councilInfo
    });
   

}