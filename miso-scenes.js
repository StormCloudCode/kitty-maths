/* Original picture cues and small manipulatives. Existing narration is unchanged. */
(function(root){
 'use strict';
 const cues={
  line:['Help Kitty find her toy on a shelf.','0 is the middle spot. Move right to count 1, 2, 3. The marks tell you where the toy is.'],
  negative:['The toy can be left of the middle, too.','Start at 0. Two spaces left is −2: “negative two”. The minus sign tells us which side.'],
  map:['Now the toy is on the room’s floor.','One number cannot tell us both across and up the picture. We need two directions.'],
  complex:['Write a tiny address for Kitty’s toy.','3 + 2i stores “3 across, 2 up”. Here i marks the second direction; it is not a metre or a physical object.'],
  z:['Give that toy’s address a short name.','Let z mean the whole address, 3 + 2i. A letter can hold a number so we do not have to keep rewriting it.'],
  square:['Let’s make a little square rug for Kitty.','3 pieces across and 3 rows use 3 * 3 = 9 pieces. Squaring helps us work out how much fabric covers it.'],
  root:['You have 9 fabric pieces. How wide can the rug be?','A square root works backwards: find the equal side lengths that use those 9 pieces. Slide the edge and watch the rug change.'],
  'negative-square':['Could any ordinary number, times itself, give −1?','Try the slider. Positive * positive is positive; negative * negative is positive too. And 0 * 0 = 0.'],
  'define-i':['We need a new kind of number to solve a new problem.','No real number squares to −1. We define i by i * i = −1. A turning arrow gives us a picture of this rule.'],
  quarter:['Imagine turning a game character to face a new direction.','Multiplying a complex number by i turns its arrow a quarter-turn anticlockwise. Its length stays the same.'],
  twice:['Two left turns make the character face backwards.','Start at 1. One * i takes you to i. Another * i takes you to −1. That is i * i = −1 in the picture.'],
  cycle:['Can you turn all the way back to the start?','Four quarter-turns make one full turn. Powers of i keep cycling through the same four positions.'],
  addition:['Plan two short walks for a toy robot.','Combine the across movements, then the up movements. The result tells you where both walks finish.'],
  subtract:['The robot needs to undo part of its journey.','Subtracting a movement means doing its opposite. Undoing 2 right and 2 down means 2 left and 2 up.'],
  parts:['Keep the robot’s two direction counters separate.','Across joins across. Up joins up. Watch 4 + 3 become 7, while 3 + (−2) becomes 1.'],
  multiply:['Build the answer from four small pairs.','Every part of the first number meets every part of the second. Tap through the four boxes; only the i * i pair changes into −1.'],
  'book-product':['The numbers are bigger, but the four-box recipe is the same.','Work on just the highlighted pair. Then gather the ordinary numbers and the i parts separately.'],
  mirror:['Picture the toy reflected across a horizontal mirror.','3 right stays 3 right. 2 up becomes 2 down. This reflected number, 3 − 2i, is called the conjugate.'],
  'cancel-i':['A number and its mirror can cancel the i parts.','In the product below, −10i and +10i add to zero. See what remains after they cancel.'],
  divide:['Make a tricky fraction easier without changing its value.','Like multiplying top and bottom by 2, multiplying both by the same nonzero conjugate keeps the fraction equal.'],
  distance:['How much ribbon reaches straight to Kitty’s toy?','The floor plan goes 3 across and 4 up. The direct diagonal is shorter than walking along both edges.'],
  modulus:['Give that straight ribbon length a maths name.','The modulus is distance from 0. The bars in |3 + 4i| ask for length, not the direction of the arrow.'],
  surd:['Make a square rug from four equal square patches.','Each patch has area 3. Four patches have area 12, and two patch edges fit along the big edge: √12 = 2√3.'],
  'roots-equation':['Find every starting arrow that squares to −25.','Both 5i and −5i work. Squaring doubles the direction angle and squares the length. This is an arrow model, not negative fabric area.'],
  'complete-square':['Imagine an “add 1, then square” machine.','Work backwards: the value before squaring can be i or −i. Undo “add 1” by subtracting 1.'],
  polar:['Aim a torch across a floor plan.','You can give its target as “across and up”, or as “distance and angle”. Polar form uses distance and angle.'],
  trig:['How far across and up does the torch point?','Cosine gives the across fraction of its length; sine gives the up fraction. The angle decides those fractions.'],
  'polar-book':['Turn the torch into the upper-left part of the map.','At 120°, the across part is negative and the up part is positive. The full arrow still has length 2.'],
  radians:['Measure a turn using a piece of string.','Wrap a string as long as the radius around the circle’s edge. That arc makes 1 radian. A half-circle takes π radii.'],
  'polar-product':['Give a game arrow a turn-and-stretch instruction.','Multiply lengths: 2 * 3. Add turns: 30° + 60°. The new arrow has length 6 and points straight up.'],
  'polar-divide':['Undo the turn-and-stretch instruction.','Divide length 6 by 3, and subtract 60° from 90°. The arrow returns to length 2 at 30°.'],
  powers:['Repeat the same game-arrow instruction three times.','Each press stretches by 2 and turns 30°. Repeating a multiplication is what a power means.'],
  'four-roots':['Which four starting arrows return to 1 after power 4?','Evenly spaced starting directions collapse onto the same final direction when their angles are multiplied by 4.'],
  'cube-roots':['Find three different starting arrows for the same result.','Cubing each length-2 arrow gives length 8. Tripling each direction ends at 90°, allowing for full turns.'],
  identity:['Describe a double turn in two matching ways.','Move the angle slider. The two across-position readings match. This picture checks examples; the full explanation gives the algebra.'],
  triple:['Now compare a triple turn with its formula.','Move the angle slider and compare the up-position readings. This is useful when describing repeated turns; the equality holds beyond these examples.']
 };
 const modes={z:'address','define-i':'turn',parts:'parts','cancel-i':'cancel',divide:'divide',modulus:'distance',surd:'surd','roots-equation':'roots','complete-square':'machine',radians:'radians','polar-product':'product','polar-divide':'quotient',identity:'double',triple:'triple'};
 const api={cues,modes};if(typeof module!=='undefined')module.exports=api;if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id);let current,value=0;
 const nice=n=>Math.abs(n)<.0005?'0':String(Math.round(n*1000)/1000).replace('-','−');
 const text=(x,y,t,extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" ${extra}>${t}</text>`;
 const svg=(body,label)=>`<svg viewBox="0 0 400 220" role="img" aria-label="${label}">${body}</svg>`;
 function dial(degrees,length=1,max=1,other=null){
  const a=degrees*Math.PI/180,x=200+78*length/max*Math.cos(a),y=108-78*length/max*Math.sin(a);
  let body='<circle cx="200" cy="108" r="78" fill="#f5e8f4" stroke="#d5bdd9"/><path d="M104 108 H296 M200 12 V204" stroke="#cbb8d0"/>';
  if(other!==null){const b=other*Math.PI/180;body+=`<path d="M200 108 L${200+78*Math.cos(b)} ${108-78*Math.sin(b)}" stroke="#c99c69" stroke-width="4"/>`;}
  body+=`<path d="M200 108 L${x} ${y}" stroke="#855180" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="8" fill="#855180"/>`;
  return svg(body+text(329,113,'right +')+text(70,113,'left −')+text(200,10,'up +')+text(200,219,'down −'),`An arrow of length ${length} at ${degrees} degrees anticlockwise from right`);
 }
 function drawing(){const mode=modes[current.id];
  switch(mode){
   case 'address':return {picture:svg('<rect x="98" y="17" width="204" height="168" rx="12" fill="#f6e7f1" stroke="#d5b7ce"/>'+[0,1,2,3,4,5].map(k=>`<path d="M${112+k*34} 30 V170" stroke="#e2cddd"/>`).join('')+[0,1,2,3,4].map(k=>`<path d="M112 ${34+k*34} H282" stroke="#e2cddd"/>`).join('')+'<path d="M112 170 H214" stroke="#9162ac" stroke-width="5"/><path d="M214 170 V102" stroke="#b36288" stroke-width="5"/>'+text(163,193,'3 across')+text(262,139,'2 up')+'<circle cx="214" cy="102" r="12" fill="#d88c62"/>'+text(185,57,value?'z = 3 + 2i':'Kitty’s toy')+text(112,216,'start: 0'),'A floor plan showing three spaces right and two up'),caption:value?'z names the whole number. The 3 and 2i are its two parts.':'Trace across first, then up. Both instructions describe one place.'};
   case 'turn':{const labels=['1','i','−1','−i'];return {picture:dial(value*90),caption:`${value===0?'Start':value+' quarter-turn'+(value>1?'s':'')}: ${labels[value%4]}${value===2?' → i * i = −1':''}. Multiplication by i is the turn instruction.`};}
   case 'parts':return {picture:`<div class="pair-lanes"><div><span>ACROSS</span><b>4 + 3</b><strong>${value?'7':'?'}</strong></div><div><span>UP / i PART</span><b>3 + (−2)</b><strong>${value?'1':'?'}</strong></div></div>`,caption:value?'Put the two results together: 7 + 1i = 7 + i.':'Two separate counters. Add within each row, not across the rows.'};
   case 'cancel':return {picture:`<div class="cancellation"><span>4</span><span class="${value?'cancelled':''}">+10i</span><span class="${value?'cancelled':''}">−10i</span><span>+25</span></div><div class="scene-equation">${value?'4 + 25 = 29':'(2 − 5i) * (2 + 5i)'}</div>`,caption:value?'Opposite i parts cancel. Also, (−5i) * (5i) = −25 * (−1) = +25.':'Expand the four pairs. Which two pieces are opposites?'};
   case 'divide':return {picture:`<div class="fraction-machine"><div class="fraction"><span>${value?'(3 + 4i) * (2 + 5i)':'3 + 4i'}</span><span>${value?'(2 − 5i) * (2 + 5i)':'2 − 5i'}</span></div><b>=</b><div class="fraction"><span>${value?'−14 + 23i':'same value'}</span><span>${value?'29':'new form'}</span></div></div>`,caption:value?'Top: 6 + 15i + 8i − 20 = −14 + 23i. Bottom: 4 + 25 = 29.':'Use 2 + 5i on both top and bottom. Their ratio is 1, so the fraction keeps its value.'};
   case 'distance':return {picture:svg('<path d="M115 190 H250 V10 Z" fill="#eeddf0" stroke="#bb94bd" stroke-width="2"/>'+`<path d="${value?'M115 190 L250 10':'M115 190 H250 V10'}" fill="none" stroke="#855180" stroke-width="6"/>`+text(182,214,'3 metres')+text(297,108,'4 metres')+text(145,80,value?'5 m ribbon':'7 m walk'),'Right triangle with edges three and four and diagonal five'),caption:value?'Straight ribbon: √(3 * 3 + 4 * 4) = √25 = 5 metres.':'Along both edges: 3 + 4 = 7 metres. Toggle to the straight ribbon.'};
   case 'surd':return {picture:`<div class="surd-rug ${value?'joined':''}"><span>area 3</span><span>area 3</span><span>area 3</span><span>area 3</span></div><div class="scene-equation">${value?'whole edge = √3 + √3 = 2√3':'each small edge = √3'}</div>`,caption:value?'The whole area is 12. Its edge is √12. This picture shows why √12 = 2√3.':'There are two small patch edges along each large edge. Join the four patches.'};
   case 'roots':return {picture:dial(value?270:90,5,5)+`<div class="scene-equation">(${value?'−5i':'5i'}) * (${value?'−5i':'5i'}) = −25</div>`,caption:'The two starting arrows point in opposite directions. Both give −25 when squared.'};
   case 'machine':return {picture:`<div class="machine"><span>${value?'−1 − i':'−1 + i'}</span><b>+ 1 →</b><span>${value?'−i':'i'}</span><b>square →</b><span>−1</span></div>`,caption:'Follow one answer through the machine. Switch the answer: both routes finish at −1.'};
   case 'radians':{const r=value*Math.PI/180,large=value>180?1:0,x=200+78*Math.cos(r),y=108-78*Math.sin(r);return {picture:svg('<circle cx="200" cy="108" r="78" fill="#f5e8f4" stroke="#d5bdd9"/><path d="M200 108 H278" stroke="#855180" stroke-width="4"/>'+`<path d="M278 108 A78 78 0 ${large} 0 ${x} ${y}" fill="none" stroke="#b36288" stroke-width="7"/><path d="M200 108 L${x} ${y}" stroke="#b36288" stroke-width="3"/>`+text(200,214,`${value}° = ${value===180?'π':nice(r)} radians`),'Angle measured by arc length divided by radius'),caption:`Arc length / radius = ${nice(r)}. ${value===180?'Half a circle: 180° = π radians.':'A radian is an angle unit, like degrees, using the radius as the measuring stick.'}`};}
   case 'product':case 'quotient':{const after=mode==='product'?!!value:!value,deg=after?90:30,len=after?6:2;return {picture:dial(deg,len,6),caption:`Length ${len}, angle ${deg}°. ${mode==='product'?'Multiply length by 3; add 60° to the angle.':'Divide length by 3; subtract 60° from the angle.'}`};}
   case 'double':case 'triple':{const a=value*Math.PI/180,n=mode==='double'?2:3,l=mode==='double'?Math.cos(2*a):Math.sin(3*a),r=mode==='double'?Math.cos(a)**2-Math.sin(a)**2:3*Math.sin(a)-4*Math.sin(a)**3;return {picture:dial(value*n,1,1,value)+`<div class="reading-pair"><span>${mode==='double'?'cos(2θ)':'sin(3θ)'}<b>${nice(l)}</b></span><span>${mode==='double'?'cos²θ − sin²θ':'3sinθ − 4sin³θ'}<b>${nice(r)}</b></span></div>`,caption:`θ (“theta”) = ${value}°. Gold: original arrow. Plum: ${n} times the angle. Readings are rounded; matching examples are not a proof.`};}
  }return null;
 }
 function controls(){switch(modes[current.id]){
  case 'radians':return `<label>Angle <input data-scene-slider type="range" min="0" max="315" step="15" value="${value}" aria-label="String angle in degrees"></label>`;
  case 'double':case 'triple':return `<label>Angle θ <input data-scene-slider type="range" min="0" max="180" step="5" value="${value}" aria-label="Original angle theta in degrees"></label>`;
  default:return `<button type="button" data-scene-action>${{address:'Show / hide the address',turn:'Turn a quarter · * i',parts:'Combine / separate',cancel:'Cancel / restore the opposites',divide:'Apply / undo the conjugate',distance:'Walk / straight ribbon',surd:'Join / separate the patches',roots:'Try the other starting arrow',machine:'Try the other answer',product:'Apply / undo turn and stretch',quotient:'Undo / reapply turn and stretch'}[modes[current.id]]}</button>`;
 }}
 function repaint(){const d=drawing();if(!d||!$('scene-drawing'))return;$('scene-drawing').innerHTML=d.picture;$('scene-caption').textContent=d.caption;}
 document.addEventListener('click',e=>{if(!e.target.closest('[data-scene-action]'))return;value=modes[current.id]==='turn'?(value+1)%5:1-value;repaint();});
 document.addEventListener('input',e=>{if(!e.target.matches('[data-scene-slider]'))return;value=+e.target.value;repaint();});
 root.MisoScenes={update(step){current=step;value=modes[step.id]==='radians'?180:['double','triple'].includes(modes[step.id])?30:0;const c=cues[step.id];$('scene-purpose').textContent=c[0];$('scene-bridge').textContent=c[1];},visual(step){if(step.id!==current?.id||!modes[step.id])return '';const d=drawing();return `<section class="mini-scene" aria-label="Explore a picture before choosing"><div id="scene-drawing">${d.picture}</div><div class="scene-controls">${controls()}</div><p id="scene-caption" aria-live="polite">${d.caption}</p></section>`;}};
})(typeof window!=='undefined'?window:globalThis);
