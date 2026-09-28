const assert=require('node:assert/strict');
const M=require('../math.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const pair=(a,b)=>a.forEach((v,i)=>near(v,b[i]));
const pow=(p,n)=>{let value=[1,0];for(let k=0;k<n;k++)value=[value[0]*p[0]-value[1]*p[1],value[0]*p[1]+value[1]*p[0]];return value;};
pair(M.mul(3,5,4,-3),[27,11]);
pair(M.divide(3,4,2,-5),[-14/29,23/29]);
assert.equal(M.divide(1,2,0,0),null);
assert.equal(M.arg(0,0),null);
near(M.arg(-1,0),Math.PI);
near(M.arg(-1,-0),Math.PI);
near(M.arg(-1,1),3*Math.PI/4);
assert.equal(M.surd(48),'4√3');assert.equal(M.surd(75),'5√3');assert.equal(M.surd(1),'1');assert.equal(M.surd(100),'10');
assert.equal(M.complex(0,-1),'−i');assert.equal(M.complex(3,0),'3');assert.equal(M.complex(0,0),'0');
pair(pow([1,Math.sqrt(3)],9),[-512,0]);
pair(pow([3,2],2),[5,12]);pair(pow([-3,-2],2),[5,12]);
for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++){
 const p=M.mul(a,b,a,-b);pair(p,[a*a+b*b,0]);
 for(const [c,d]of [[2,3],[-1,4],[0,-2]])pair(M.mul(...M.divide(a,b,c,d),c,d),[a,b]);
}
for(let n=2;n<=6;n++)for(const r of [1,4,8,16])for(const t of [-180,-90,0,90,180]){
 const roots=M.roots(r,t,n);for(const root of roots)pair(pow(root,n),M.polar(r,t));
 for(let j=0;j<n;j++)for(let k=j+1;k<n;k++)assert.ok(Math.hypot(roots[j][0]-roots[k][0],roots[j][1]-roots[k][1])>1e-6);
}
for(let a=-3;a<=3;a++)if(a)for(let b=-3;b<=3;b++)for(let c=-3;c<=3;c++){
 const D=b*b-4*a*c;
 const roots=D<0?[[-b/(2*a),Math.sqrt(-D)/(2*Math.abs(a))],[-b/(2*a),-Math.sqrt(-D)/(2*Math.abs(a))]]:[[(-b+Math.sqrt(D))/(2*a),0],[(-b-Math.sqrt(D))/(2*a),0]];
 for(const [x,y] of roots)pair([a*(x*x-y*y)+b*x+c,2*a*x*y+b*y],[0,0]);
}
for(let d=-180;d<=180;d+=5){const t=d*Math.PI/180,c=Math.cos(t),s=Math.sin(t);near(Math.cos(2*t),c*c-s*s);near(Math.sin(2*t),2*s*c);near(Math.sin(3*t),3*s-4*s**3);}
console.log('PASS: worked arithmetic, polar quadrants, all displayed quadratic cases in test range, conjugates, division round trips, roots, identities and formatting.');
