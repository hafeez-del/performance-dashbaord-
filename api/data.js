const{verify,need,fetchSheet}=require('./_lib');
module.exports=async(req,res)=>{
 const m=need(['AUTH_SECRET','SHEET_ID','GOOGLE_API_KEY']);if(m.length)return res.status(500).json({error:'Server is missing setting(s): '+m.join(', ')});
 if(!verify((req.headers.authorization||'').replace('Bearer ','')))return res.status(401).json({error:'Please sign in again.'});
 try{res.setHeader('Cache-Control','private, max-age=30');res.json(await fetchSheet())}catch(e){res.status(502).json({error:e.message})}
};
