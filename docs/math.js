(function(root) {
  'use strict';
  const clean = n => Math.abs(n) < 1e-10 ? 0 : n;
  const fmt = n => Number(clean(n).toFixed(3)).toString().replace('-', '−');
  const complex = (a,b) => {
    a=clean(a); b=clean(b);
    const imaginary = Math.abs(b) === 1 ? 'i' : fmt(Math.abs(b))+'i';
    if (!b) return fmt(a);
    if (!a) return (b<0?'−':'')+imaginary;
    return `${fmt(a)} ${b<0?'−':'+'} ${imaginary}`;
  };
  const mul=(a,b,c,d)=>[clean(a*c-b*d),clean(a*d+b*c)];
  const divide=(a,b,c,d)=> c*c+d*d===0 ? null : [(a*c+b*d)/(c*c+d*d),(b*c-a*d)/(c*c+d*d)];
  const arg=(a,b)=> a===0&&b===0 ? null : (Math.atan2(b,a)<=-Math.PI ? Math.PI : Math.atan2(b,a));
  const polar=(r,degree)=>[clean(r*Math.cos(degree*Math.PI/180)),clean(r*Math.sin(degree*Math.PI/180))];
  const roots=(r,degree,n)=>Array.from({length:n},(_,k)=>polar(Math.pow(r,1/n),(degree+360*k)/n));
  const surd=n=>{let factor=1; for(let j=1;j*j<=n;j++) if(n%(j*j)===0) factor=j; const left=n/(factor*factor); return left===1?String(factor):(factor===1?'':factor)+'√'+left;};
  const api={clean,fmt,complex,mul,divide,arg,polar,roots,surd};
  root.MathLab=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
