import cityCouncilMap from '@/data/cityCouncilMap.json'

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
    console.log(geoData)
    const city = place["place name"];
    const state = place["state"];

    // const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${city},_${state}`);
    // const wikiData = await wikiRes.json();
    // const fun_fact = wikiData.extract

    const cityKey = `${city}, ${state}`
    const councilInfo = cityCouncilMap[cityKey]
    if (!councilInfo) {


        // return Response.json({ error: 'City not supported' }, { status: 404 });
    }

    return Response.json({
        city,
        state,
        //fact: fun_fact || 'No fun fact available',
        councilInfo
    });
   

}