const h=require('http'),f=require('fs'),P=require('path');
const R=__dirname;
const T={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const PORT=process.env.PORT||3001;
h.createServer((q,s)=>{
  let u=decodeURIComponent((q.url||'/').split('?')[0]);
  if(u.endsWith('/')) u+='index.html';
  let fp=P.normalize(P.join(R,u));
  if(!fp.startsWith(R)){ s.writeHead(403); return s.end('forbidden'); }
  f.readFile(fp,(e,d)=>{
    if(e){ s.writeHead(404,{'Content-Type':'text/html;charset=utf-8'}); return s.end('<h1>404</h1>'); }
    s.writeHead(200,{'Content-Type':T[P.extname(fp).toLowerCase()]||'application/octet-stream'}); s.end(d);
  });
}).listen(PORT,()=>console.log('Statik sunucu hazir: http://localhost:'+PORT));
