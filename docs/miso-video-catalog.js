/* Original curation notes. Metrics are a dated snapshot, not quality scores.
   Primary evidence: public YouTube watch-page metadata, checked 2026-09-28.
   No remote requests are made by this file. See VIDEO-SOURCES.md. */
(function(root){
 const videos={
  line:['RSJOTBJlKNA','The Number Line','Math Antics',612,954056,8620,'A visual introduction to marks, order and positions.'],
  negative:['OAoLCXpao6s','Negative Numbers','Math Antics',506,3562304,25793,'Build the meaning of numbers on either side of zero.'],
  map:['9Uc62CuQjc4','Graphing on the Coordinate Plane','Math Antics',614,4195828,57315,'Find a place using two coordinates, with diagrams.'],
  algebra:['NybHckSEQBI','What Is Algebra?','Math Antics',726,11378045,164060,'A foundation for letters, expressions and equations.'],
  square:['B4zejSI8zho','Exponents and Square Roots','Math Antics',668,2425488,38281,'Connect a repeated multiplication with the operation that undoes it.'],
  imaginary:['A254hF5QqOk','Why Complex Numbers? The Imaginary Unit','Eddie Woo',597,79742,1030,'A classroom explanation of introducing i. Part 3 of a wider series.'],
  geometry:['5PcpBw5Hbwo','Complex Number Fundamentals','3Blue1Brown',4930,2138329,39939,'A long, human-led visual lesson about complex-number geometry. Watch in small pieces.','The creator lists three written corrections: the first complex-plane sketch has 2i where it should say −2i; the final angle-sum identity should end in sin(beta), not sin(alpha); Q9 is missing i inside the brackets.'],
  operations:['OQz1ydBcQSA','Complex Numbers — Basic Operations','The Organic Chemistry Tutor',5015,1833322,28006,'An extended worked-example lesson. Use it as a reference; you do not need to finish it in one sitting.'],
  distance:['WqhlG3Vakw8','The Pythagorean Theorem','Math Antics',775,3408586,42373,'Connect a right triangle with finding an unknown length.'],
  surds:['2mejAHKMBiM','Simplifying Square Roots','Math Antics',721,1027083,17663,'Work through square factors and exact root expressions.'],
  equations:['83WrPCagHRg','Solving Quadratic Equations with Imaginary Numbers','The Organic Chemistry Tutor',499,82376,1477,'Worked equations with imaginary answers. Revisit the i lesson first if needed.'],
  completing:['McDdEw_Fb5E','Beautiful Visual Explanation of Completing the Square','Eddie Woo',213,234587,7304,'See why the algebra is called completing the square. This is a visual foundation, not the full complex-roots lesson.'],
  polar:['J6TnZxUUzqU','Complex Numbers in Polar — De Moivre’s Theorem','The Organic Chemistry Tutor',3887,1288828,18795,'Detailed conversions and worked polar products/quotients. This link is the public 65-minute lesson, not the paid extended version.'],
  trig:['57VrEiEPD1I','The Unit Circle — Basic Introduction','The Organic Chemistry Tutor',768,516328,8636,'Connect sine and cosine to positions on a circle.'],
  radians:['CHCWXAkozHM','What Exactly Is a Radian?','The Organic Chemistry Tutor',725,209635,3553,'Use radius and arc length to understand an angle unit.'],
  roots:['HhlD7sX5Tp8','Roots of Complex Numbers','Patrick J / PatrickJMT',361,529139,2959,'The general nth-root method, worked through with square roots. Apply the same rule with n = 3 or n = 4 in Kitty.'],
  double:['SE5SBTgrwH8','Double Angle Identities and Formulas','The Organic Chemistry Tutor',1096,884478,10851,'Derive and use double-angle formulas. A companion to Kitty’s complex-number derivation.'],
  triple:['I1myAqBFm7g','sin(3x) and cos(3x), Using De Moivre’s Theorem','blackpenredpen',469,73895,1756,'A human whiteboard walkthrough of the triple-angle derivation.']
 };
 // [primary, alternative, primary start in seconds]. Starts are YouTube-listed chapters.
 const links={line:['line','negative'],negative:['negative','line'],map:['map','algebra'],complex:['imaginary','geometry'],z:['algebra','operations'],square:['square','surds'],root:['square','distance'],'negative-square':['negative','imaginary'],'define-i':['imaginary','geometry'],quarter:['geometry','polar'],twice:['geometry','imaginary'],cycle:['imaginary','geometry'],addition:['operations','geometry'],subtract:['operations','geometry'],parts:['operations','algebra'],multiply:['operations','geometry'],'book-product':['operations','geometry'],mirror:['operations','geometry'],'cancel-i':['operations','geometry'],divide:['operations','geometry'],distance:['distance','square'],modulus:['distance','operations'],surd:['surds','square'],'roots-equation':['equations','imaginary'],'complete-square':['completing','equations'],polar:['polar','trig',0],trig:['trig','polar'],'polar-book':['polar','trig',1878],radians:['radians','trig'],'polar-product':['polar','geometry',2262],'polar-divide':['polar','operations',2873],powers:['polar','geometry',351],'four-roots':['roots','polar'],'cube-roots':['roots','polar'],identity:['double','geometry'],triple:['triple','double']};
 const catalog={checked:'2026-09-28',videos:Object.fromEntries(Object.entries(videos).map(([key,v])=>[key,{id:v[0],title:v[1],teacher:v[2],seconds:v[3],views:v[4],likes:v[5],note:v[6],caution:v[7]||''}])),links};
 root.MISO_VIDEO_CATALOG=catalog;if(typeof module!=='undefined')module.exports=catalog;
})(typeof window!=='undefined'?window:globalThis);
