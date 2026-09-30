const crypto=require('crypto');
const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const sig=x=>crypto.createHmac('sha256',process.env.AUTH_SECRET).update(x).digest('base64url');
const sign=()=>{const e=String(Date.now()+12*36e5);return e+'.'+sig(e)};
const verify=t=>{const[e,s]=String(t||'').split('.');if(!e||!s||+e<Date.now())return false;const a=Buffer.from(sig(e)),b=Buffer.from(s);return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const same=(a,b)=>{const h=x=>crypto.createHash('sha256').update(String(x)).digest();return crypto.timingSafeEqual(h(a),h(b))};
const need=n=>n.filter(k=>!process.env[k]);
const num=v=>typeof v==='number'?v:(typeof v==='string'&&/^\s*\$?[\d,]+(\.\d+)?\s*$/.test(v)?parseFloat(v.replace(/[$,]/g,'')):0);
const rng=v=>{if(typeof v!=='string')return null;const n=(v.match(/\d[\d,]*(?:\.\d+)?/g)||[]).map(x=>parseFloat(x.replace(/,/g,'')));return n.length>=2?n.slice(0,2):null};
const cell=(r,i)=>(r&&r[i]!==undefined?r[i]:'');
function parse(t,b){
 const re=/^([A-Za-z]+)\s*-\s*(\d{4})$/;
 const hi=t.findIndex(r=>(r||[]).some(c=>re.test(String(c).trim()))),si=t.findIndex(r=>String(cell(r,0)).trim().toUpperCase()==='SNO');
 if(hi<0||si<0)throw new Error('Targets tab: could not find the month header row (e.g. "NOVEMBER - 2025") or the "SNO" row.');
 const months=[];t[hi].forEach((c,col)=>{const m=re.exec(String(c).trim());const k=m?MON.indexOf(m[1].slice(0,3).toUpperCase()):-1;if(k>=0)months.push({col,label:MN[k]+' '+m[2].slice(2)})});
 const bi=b.findIndex(r=>String(cell(r,0)).trim().toUpperCase()==='MM');
 if(bi<0)throw new Error('Bonus tab: could not find the header row starting with "MM".');
 let bm=[];(b[bi]||[]).forEach((c,col)=>{if(col===0||c==='')return;const d=typeof c==='number'?new Date(Date.UTC(1899,11,30)+c*864e5):new Date(c);if(!isNaN(d))bm.push({col,label:MN[d.getUTCMonth()]+' '+String(d.getUTCFullYear()).slice(2)})});
 const brows=b.slice(bi+1);
 while(bm.length&&brows.every(r=>!num(cell(r,bm[bm.length-1].col))))bm.pop();
 const stores=[];
 t.slice(si).forEach((r,i)=>{if(i>0&&(cell(r,0)===''||cell(r,1)===''))return;
  let name=String(cell(r,1)).trim();if(i===0&&/store name/i.test(name))name='Store 0 (name missing in sheet)';
  const mo=months.map(m=>{const c=[0,1,2,3,4].map(k=>cell(r,m.col+k));return{t:rng(c[0])||num(c[0]),bv:rng(c[1])||num(c[1]),p:num(c[2]),f:num(c[3]),b:num(c[4])}});
  const br=brows[i];stores.push({id:i,name,mm:br?String(cell(br,0)).trim():'_',mo,mb:bm.map(m=>num(cell(br,m.col)))})});
 return{months:months.map(m=>m.label),bmonths:bm.map(m=>m.label),stores,updated:new Date().toISOString()};
}
async function fromScript(e){
 const r=await fetch(e.SCRIPT_URL+(e.SCRIPT_URL.includes('?')?'&':'?')+'key='+encodeURIComponent(e.SCRIPT_KEY||''));
 let j;try{j=await r.json()}catch{throw new Error('Apps Script did not return data. In Deploy > Manage deployments, set "Who has access" to Anyone, then redeploy.')}
 if(j.error)throw new Error('Apps Script said: '+j.error);
 return parse(j.targets||[],j.bonus||[]);
}
async function fetchSheet(){
 const e=process.env;if(e.SCRIPT_URL)return fromScript(e);
 constq=n=>'ranges='+encodeURIComponent("'"+n+"'");
 const u=`https://sheets.googleapis.com/v4/spreadsheets/${e.SHEET_ID}/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&${q(e.TARGETS_TAB||'Targets vs acheived')}&${q(e.BONUS_TAB||'MM wise bonus distribution')}&key=${e.GOOGLE_API_KEY}`;
 const r=await fetch(u),j=await r.json();
 if(!r.ok)throw new Error('Google Sheets said: '+(j.error&&j.error.message||r.status));
 return parse(j.valueRanges[0].values||[],j.valueRanges[1].values||[]);
}
module.exports={sign,verify,same,need,parse,fetchSheet};
