export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const zip = searchParams.get('zip');

    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!geoRes) {
        return Response.json({error: 'Invalid Zip Code'}, {status: 400});
    }

    const geoData = await geoRes.json();
    const place = geoData.places?.[0];
    const city = place["place name"];
    const state = place["state"];

    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${city},_${state}`);
    const wikiData = await wikiRes.json();
    const fun_fact = wikiData.extract
   // console.log("FUN FACT", wikiData.extract);

    return Response.json({
        city,
        state,
        fact: fun_fact || 'No fun fact available'
    });
   

}