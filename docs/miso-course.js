/* Titles transcribed from the supplied PDF contents, PDF pages 2–4.
   Teaching groups stay stable so existing saved lesson positions are preserved. */
(function(root){
 const section=(number,title,page,lessons=[])=>({number,title,page,lessons});
 const later=(number,title,page,rows)=>({id:'chapter-'+number,number,title,page,sections:[],outline:rows.map((r,i)=>section(`${number}.${i+1}`,r[0],r[1]))});
 root.MISO_COURSE={title:'Text & Tests 5',chapters:[{
  id:'complex-numbers',number:1,title:'Complex Numbers',page:1,
  source:'../Complex%20Numbers.pdf',sourcePageOffset:5,sections:root.MISO_CHAPTERS,
  outline:[
   section('', 'Start here · gentle foundations',null,['line','negative','map','square','root']),
   section('1.1','Irrational numbers',1,['surd']),
   section('1.2','Complex numbers',6,['complex','z','negative-square','define-i','addition','subtract','parts','multiply','book-product']),
   section('1.3','Division and equality of complex numbers',9,['mirror','cancel-i','divide']),
   section('1.4','Argand diagram – modulus',13,['distance','modulus']),
   section('1.5','Transformations of complex numbers',16,['quarter','twice','cycle']),
   section('1.6','Conjugate roots theorem',22,['roots-equation','complete-square']),
   section('1.7','Polar form of a complex number',25,['polar','trig','polar-book','radians']),
   section('1.8','Products and quotients of complex numbers in polar form',29,['polar-product','polar-divide']),
   section('1.9','De Moivre’s theorem',31,['powers']),
   section('1.10','Applications of de Moivre’s theorem',34,['four-roots','cube-roots','identity','triple']),
   section('','Revision exercises',38)
  ]
 },
 later(2,'Geometry 2: Enlargements and Constructions',43,[['Enlargements',43],['Constructions',50]]),
 later(3,'Integration',66,[['Antidifferentiation',66],['Integrating exponential and trigonometric functions',71],['Applications of integration',75],['Definite integrals',77],['Finding areas by integration',81],['Average value of a function',89]]),
 later(4,'Applications of Differential Calculus',101,[['Tangents: increasing and decreasing functions',101],['Stationary points',106],['Graphs of the derived (or slope) function',112],['Maximum and minimum problems',117],['Rates of change',124],['Related rates of change',128]]),
 later(5,'Financial Maths',141,[['Compound interest',141],['Depreciation',146],['Instalment savings (annuities)',149],['Loans – mortgages',156]]),
 later(6,'Length, Area, Volume',163,[['Revision',163],['Sectors of circles',168],['3-Dimensional objects',173],['Trapezoidal rule for calculating area',181]]),
 later(7,'Probability 2',195,[['Tree diagrams',195],['Probability distributions: expected value',200],['Bernoulli trials: binomial distribution',206],['How to show events are independent',212],['Probability involving permutations and combinations',216],['Probability simulations',219]]),
 later(8,'Functions and Graphs',230,[['Introduction to functions',230],['Composition of functions',239],['Types of functions',242],['Inverse functions',248],['Sketching the graphs of functions',253],['Exponential and logarithmic functions',262],['Related graphs',269]]),
 later(9,'Statistics 2',282,[['Scatter diagrams',282],['Measuring correlation: line of best fit',288],['The normal distribution',295],['Normal probability distributions',303]]),
 later(10,'Inferential Statistics',315,[['Confidence interval for population proportion',315],['Hypothesis testing for population proportion',323],['Sampling distribution of the mean: the central limit theorem',326],['Confidence interval for a population mean',334],['Hypothesis testing for a population mean',339]])
 ]};
 const revisionPages=[59,94,132,158,186,223,273,309,346];
 root.MISO_COURSE.chapters.slice(1).forEach((c,i)=>c.outline.push(section('','Revision exercises',revisionPages[i])));
 if(typeof module!=='undefined')module.exports=root.MISO_COURSE;
})(typeof window!=='undefined'?window:globalThis);
