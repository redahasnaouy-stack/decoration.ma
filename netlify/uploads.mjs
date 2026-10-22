export function decodeImage(body){
if(typeof body.data!=='string'||body.data.length>2800000)throw Error('Image trop volumineuse (2 Mo maximum).');
const bytes=Buffer.from(body.data,'base64');
if(!bytes.length||bytes.length>2*1024*1024)throw Error('Image trop volumineuse ou vide.');
const mime=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'image/webp':null;
if(!mime)throw Error('Format non accepté. Utilisez JPEG, PNG ou WebP.');
return{bytes,mime};
}
export const validImage=value=>typeof value==='string'&&(!value||/^https:\/\//.test(value)||/^\/api\/images\/[a-f0-9-]{36}$/.test(value)||/^\/assets\/[a-z0-9-]+\.jpg$/.test(value));
