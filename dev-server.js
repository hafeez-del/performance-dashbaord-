// Local preview: serves the site and runs the /api functions. Usage: npm run dev
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname.startsWith('/api/')){
  let b='';q.on('data',c=>b+=c);q.on('end',()=>{try{q.body=b?JSON.parse(b):{}}catch{q.body={}}
   r.status=c=>(r.statusCode=c,r);r.json=o=>(r.setHeader('Content-Type','application/json'),r.end(JSON.stringify(o)));
   try{require('./api/'+path.basename(u.pathname)+'.js')(q,r)}catch(e){r.status(404).json({error:'No such API: '+u.pathname})}});return}
 const f=path.join(__dirname,u.pathname==='/'?'index.html':path.normalize(u.pathname));
 if(!f.startsWith(__dirname)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.statusCode=404;return r.end('Not found')}
 r.setHeader('Content-Type',T[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);
}).listen(3000,()=>console.log('Open http://localhost:3000'));
