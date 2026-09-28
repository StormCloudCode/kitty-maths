/* Original short explanations; Google links are searches, not quoted answers. */
(function(root){
 const help={
  line:['What is a number line?','It is a row of equally spaced marks. A number tells you which mark to use. Zero is our chosen starting mark.','Start at 0. Three moves right land at 3.','number line explained for beginners'],
  negative:['What does a negative number mean?','A minus sign places a number on the other side of zero from a positive number. On this line, that is the left side.','−2 is two equal spaces left of 0. +2 is two right.','negative numbers number line simple explanation'],
  map:['Why do we need two coordinates?','An across number chooses a column. An up number chooses a row. Together they pick one place on a flat map.','(3, 2) means 3 across, then 2 up from the starting point.','coordinates horizontal vertical explained'],
  complex:['What is a complex number?','It combines a real part and an imaginary part. On our map they are the across and up coordinates. “Imaginary” is the name of a type of number, not “pretend”.','In 3 + 2i, the real part is 3 and the imaginary part is 2. The term 2i means 2 * i.','complex numbers real imaginary parts simple explanation'],
  z:['Why use the letter z?','A letter can be a short name for a number. The equals sign says the expressions on its two sides have the same value.','If z = 3 + 2i, wherever we see z in this question we can use the whole 3 + 2i.','what does z mean in complex numbers'],
  square:['What does “squared” mean?','Multiply a number by itself. For a square rug, equal width and height make this the calculation for its area.','3² = 3 * 3 = 9. It does not mean 3 * 2.','why square a number area of a square'],
  root:['Why take a square root?','It lets us work backwards from a square’s area to its side length. The square-root sign asks for the non-negative answer when the area is non-negative.','A square with area 9 has side length √9 = 3, because 3 * 3 = 9.','square root real life area side length simple explanation'],
  'negative-square':['Why can’t a real number square to −1?','Positive * positive is positive. Negative * negative is also positive. Zero * zero is zero. These cover all real numbers, so their squares cannot be negative.','(−2) * (−2) = 4. This is different from −(2 * 2), which is −4.','why no real number squared is negative'],
  'define-i':['Which numbers multiply by themselves to give −1?','No real number does. We extend our number system with i, pronounced “eye”, defined by i * i = −1. Both i and −i solve the square equation.','i * i = −1. Also, (−i) * (−i) = i² = −1. So z² = −1 has two answers: i and −i.','what number multiplied by itself gives -1 i and -i'],
  quarter:['What does multiplying by i do?','On the complex plane it turns a point 90° anticlockwise around zero, without changing its distance from zero. It is a turn, not an upward addition.','Start at 1 on the right. 1 * i = i, now above zero.','multiplication by i rotation 90 degrees explained'],
  twice:['Why do two turns give −1?','Two quarter-turns make a half-turn. Starting at 1 on the right, a half-turn puts us at −1 on the left.','1 * i = i. Then i * i = −1.','why i squared equals minus one rotation'],
  cycle:['Why do powers of i repeat?','Each multiplication by i adds another quarter-turn. Four quarter-turns bring us back to the start.','i, i² = −1, i³ = −i, i⁴ = 1. Then i⁵ = i again.','powers of i cycle explained'],
  addition:['How do I add two complex numbers?','Add real parts to real parts, and imaginary parts to imaginary parts. On a map, combine across movements separately from up movements.','(2 + i) + (2 + 2i) = (2 + 2) + (1 + 2)i = 4 + 3i.','adding complex numbers like terms explained'],
  subtract:['Why does subtracting a negative add?','Subtracting undoes a movement. Undoing a downward move sends you upward. A minus before brackets reverses every term inside.','(3 + i) − (2 − 2i) = 3 + i − 2 + 2i = 1 + 3i.','subtracting complex numbers negative signs brackets'],
  parts:['What are “like terms”?','They are terms of the same kind, so their amounts can be combined. Keep ordinary real numbers separate from multiples of i.','(4 + 3i) + (3 − 2i) = 7 + 1i = 7 + i.','complex numbers collecting like terms'],
  multiply:['Why are there four multiplications?','Each of the two terms in the first bracket multiplies each of the two in the second. That gives four pairs. This is the distributive rule.','(1 + i)(1 + i) = 1 + i + i + i² = 1 + 2i − 1 = 2i.','multiplying complex numbers four products distributive property'],
  'book-product':['Why does the last product become positive?','There are two minus signs to handle: one from multiplying the coefficients, and one from replacing i² with −1.','(5i) * (−3i) = −15i² = (−15) * (−1) = 15.','multiplying complex numbers i squared negative signs'],
  mirror:['What is a conjugate?','Keep the real part and reverse the sign of the imaginary part. On the complex plane this reflects the point across the real axis.','The conjugate of 3 + 2i is 3 − 2i. The bar in z̄ means “conjugate of z”.','complex conjugate reflection simple explanation'],
  'cancel-i':['Why multiply by a conjugate?','The two imaginary cross-terms cancel, leaving a real result. This gives us a useful way to simplify a complex denominator.','(2 − 5i)(2 + 5i) = 4 + 10i − 10i − 25i² = 29.','why complex number times conjugate is real'],
  divide:['Why multiply both top and bottom?','Multiplying both by the same non-zero number keeps a fraction’s value unchanged. Use the denominator’s conjugate to make the bottom real.','1/2 = 2/4. For (3 + 4i)/(2 − 5i), multiply top AND bottom by 2 + 5i.','dividing complex numbers conjugate numerator denominator'],
  distance:['Why use Pythagoras here?','Across and up form a right angle. The straight ribbon is the sloping side. Pythagoras relates these three lengths.','3² + 4² = 9 + 16 = 25. The straight length is √25 = 5, not 3 + 4.','Pythagorean theorem 3 4 5 distance explained'],
  modulus:['What do the vertical bars mean?','For a complex number, |z| means its modulus: straight-line distance from zero. It is a non-negative real number.','|3 + 4i| = √(3² + 4²) = 5. The two bars are not a division sign.','modulus of complex number vertical bars explained'],
  surd:['Why keep a root instead of a decimal?','A rounded decimal loses exactness. A surd keeps an irrational root exact, and sometimes we can simplify it using a square factor.','√12 = √(4 * 3) = 2√3. This product rule is being used for non-negative real numbers.','simplifying surds square root 12 exact value'],
  'roots-equation':['Why are there two answers?','Squaring a number and squaring its negative give the same result. The symbol ± means write both choices, not a single new number.','(5i)² = −25 and (−5i)² = −25. So z² = −25 gives z = 5i or z = −5i.','complex quadratic equation two roots plus or minus'],
  'complete-square':['What is the whole thing being squared?','The brackets say that z + 1 is one group. First find that group’s possible values, then undo the +1 to find z.','(z + 1)² = −1 → z + 1 = i or −i → z = −1 + i or −1 − i.','completing square complex roots z plus 1 squared minus 1'],
  polar:['What is polar form?','It locates a point using distance from zero and a turn angle. That is another way to describe the same point as across-and-up coordinates.','Distance r = 2 and angle θ = 90° place the point at 2i. θ is pronounced “theta”.','polar form complex numbers radius argument explained'],
  trig:['What are cosine and sine doing?','They connect an angle to the across and up parts of a direction. Multiply each ratio by the radius to get the actual coordinates.','Across = r * cos θ. Up = r * sin θ. For r = 2 and θ = 60°, across = 1 and up = √3.','sine cosine unit circle coordinates simple explanation'],
  'polar-book':['What does “cis” mean?','It is only a shorthand: cis θ = cos θ + i * sin θ. Multiplying by r scales the across and up coordinates.','2 * cis 120° = 2 * (cos 120° + i * sin 120°) = −1 + √3i.','cis theta complex numbers polar form meaning'],
  radians:['Why use radians as well as degrees?','Both measure turns. A radian uses the circle’s own radius as its measuring unit: one radian subtends an arc as long as that radius.','A half-turn is 180° = π radians. A full turn is 360° = 2π radians.','radians meaning arc length radius degrees simple explanation'],
  'polar-product':['Why add the angles?','Each multiplication applies a turn and a stretch. Successive turns add; successive scale factors multiply.','(2 cis 30°) * (3 cis 60°) = 6 cis 90° = 6i.','complex multiplication polar multiply moduli add arguments'],
  'polar-divide':['What does division undo?','It reverses a turn and a stretch. Divide the lengths and subtract the angles. The divisor must not be zero.','(6 cis 90°) / (3 cis 60°) = 2 cis 30°.','complex division polar divide moduli subtract arguments'],
  powers:['What does De Moivre’s rule save us?','An integer power repeats the same multiplication. Instead of expanding many brackets, raise the radius to that power and multiply the angle by it.','(2 cis 30°)³ = 2³ cis(3 * 30°) = 8 cis 90° = 8i.','De Moivre theorem integer powers simple explanation'],
  'four-roots':['Why are there four roots of 1?','Raising a non-zero complex number to the fourth power multiplies its angle by four. Four different starting directions can therefore finish at 1.','The roots are 1, i, −1 and −i. Each has fourth power 1; their angles are 90° apart.','fourth roots of unity four complex roots explained'],
  'cube-roots':['Why add full turns before dividing?','Angles that differ by 360° end in the same direction. Dividing those totals by three reveals three distinct starting directions.','For 8i, divide 90°, 450° and 810° by 3: 30°, 150° and 270°. All three roots have length 2.','cube roots of complex numbers add 360 degrees explained'],
  identity:['Are cos²θ and cos(2θ) the same?','No. cos²θ means take the cosine, then square that result. cos(2θ) means double the angle first, then take its cosine.','At θ = 60°, cos²θ = (1/2)² = 1/4, but cos(2θ) = cos 120° = −1/2.','difference cos squared theta cos 2 theta'],
  triple:['Are sin³θ and sin(3θ) the same?','No. sin³θ means cube the sine value. sin(3θ) means take the sine of triple the angle. The triple-angle identity relates them.','sin(3θ) = 3 * sin θ − 4 * sin³θ. The brackets and raised 3 mean different operations.','difference sin cubed theta sin 3 theta triple angle']
 };
 root.MISO_HELP=help;
 if(typeof module!=='undefined')module.exports=help;
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id),dialog=$('help-dialog');let current,opener;
 const google=q=>'https://www.google.com/search?q='+encodeURIComponent(q);
 function pause(){document.dispatchEvent(new Event('miso:help-open'));root.MisoYouTube?.pause();}
 function open(token){
  if(!current)return;const h=help[current.id];opener=document.activeElement;pause();
  $('help-title').textContent=token?`${token[0]} — ${token[1]}`:h[0];
  $('help-question').textContent=token?h[0]:'';$('help-question').hidden=!token;
  $('help-meaning').textContent=h[1];$('help-example').textContent=h[2];
  $('help-google').href=google(token?`${token[1]} ${h[3]}`:h[3]);
  dialog.showModal();
 }
 $('quick-help').onclick=()=>open();$('help-close').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 $('lesson-google').addEventListener('click',pause);$('help-google').addEventListener('click',pause);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-help-token]');if(b&&current)open(current.tokens[Number(b.dataset.helpToken)]);});
 root.MisoHelp={update(step){current=step;$('lesson-google').href=google(help[step.id][3]);$('lesson-google').setAttribute('aria-label','Search Google: '+help[step.id][0]);}};
})(typeof window!=='undefined'?window:globalThis);
