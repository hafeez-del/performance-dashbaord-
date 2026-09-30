const{sign,same,need}=require('./_lib');
module.exports=(req,res)=>{
 const m=need(['DASH_USER','DASH_PASS','AUTH_SECRET']);if(m.length)return res.status(500).json({error:'Server is missing setting(s): '+m.join(', ')});
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const{u,p}=req.body||{};
 if(same(u||'',process.env.DASH_USER)&&same(p||'',process.env.DASH_PASS))return res.json({token:sign()});
 res.status(401).json({error:'Username or password is incorrect. Try again.'});
};
