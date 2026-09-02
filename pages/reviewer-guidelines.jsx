import Link from "next/link";


export default function ReviewerGuidelines(){


const reviewerGroups = [

{
title:"Academic Reviewers",
text:
"Senior lecturers and medical educators who provide expertise in scientific quality, academic standards, and medical education."
},

{
title:"Research Experts",
text:
"Researchers with experience in study design, data analysis, methodology, and scientific publication."
},

{
title:"Clinical Specialists",
text:
"Healthcare professionals who evaluate clinical relevance, patient care implications, and practical application."
},

{
title:"Student Research Reviewers",
text:
"Experienced medical students involved in research activities who contribute to peer review under appropriate academic mentorship."
}

];



const responsibilities = [

"Evaluate manuscripts objectively and fairly",

"Provide constructive scientific feedback",

"Maintain confidentiality of submitted research",

"Identify methodological strengths and weaknesses",

"Report ethical concerns or research misconduct",

"Complete reviews within the agreed timeline"

];



const evaluation = [

"Research originality and importance",

"Scientific methodology and study design",

"Accuracy of results and interpretation",

"Ethical approval and participant protection",

"Quality of discussion and conclusions",

"Contribution to healthcare knowledge"

];



const decisions = [

{
title:"Accept",
color:"bg-green-100",
text:"The manuscript meets scientific and ethical standards."
},

{
title:"Minor Revision",
color:"bg-blue-100",
text:"Small corrections are required before publication."
},

{
title:"Major Revision",
color:"bg-yellow-100",
text:"Important improvements are needed before reconsideration."
},

{
title:"Reject",
color:"bg-red-100",
text:"The manuscript does not currently meet publication standards."
}

];



return (

<div className="bg-white">



{/* HERO */}

<section className="relative bg-gray-950 text-white py-24 overflow-hidden">


<div className="absolute inset-0 opacity-10">

<div className="grid grid-cols-8 gap-3 rotate-45 scale-150">


{
Array.from({length:48}).map((_,i)=>(

<div
key={i}
className="h-8 border border-yellow-400"
>

</div>

))
}


</div>

</div>



<div className="relative max-w-6xl mx-auto px-6 text-center">


<p className="text-yellow-400 font-semibold tracking-widest">

RSJH PEER REVIEW SYSTEM

</p>


<h1 className="text-5xl font-bold mt-4">

Reviewer Guidelines

</h1>



<p className="max-w-3xl mx-auto mt-6 text-gray-300 text-lg">


Protecting scientific integrity through responsible,
transparent, and constructive peer review.


</p>


</div>


</section>









{/* INTRO */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Guardians of Scientific Quality

</h2>


<p className="mt-5 text-gray-700 leading-relaxed">


Reviewers are essential partners in maintaining the quality
of Rwanda Student Journal for Health. They help authors improve
their work while ensuring published research meets accepted
scientific and ethical standards.


</p>



<p className="mt-4 text-gray-700 leading-relaxed">


RSJH follows a collaborative review approach where expertise
from senior academics, researchers, clinicians, and experienced
student researchers contributes to better scientific communication.


</p>


</div>


</section>









{/* REVIEW NETWORK */}

<section className="bg-gray-100 py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold text-center">

RSJH Reviewer Network

</h2>



<div className="grid md:grid-cols-4 gap-6 mt-10">


{
reviewerGroups.map((item,index)=>(


<div
key={index}
className="bg-white rounded-3xl p-7 border hover:shadow-xl transition"
>


<div className="text-3xl">

🔎

</div>


<h3 className="mt-5 font-bold text-blue-950">

{item.title}

</h3>


<p className="mt-4 text-gray-600 text-sm">

{item.text}

</p>


</div>


))
}


</div>


</div>


</section>









{/* RESPONSIBILITIES */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Reviewer Responsibilities

</h2>



<div className="grid md:grid-cols-2 gap-5 mt-8">


{
responsibilities.map((item,index)=>(


<div
key={index}
className="border rounded-2xl p-5 flex gap-3"
>


<span className="text-yellow-600 font-bold">

✓

</span>


<p>

{item}

</p>


</div>


))
}


</div>


</div>


</section>









{/* EVALUATION */}

<section className="bg-blue-950 text-white py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

How Reviewers Evaluate Manuscripts

</h2>



<div className="grid md:grid-cols-2 gap-5 mt-8">


{
evaluation.map((item,index)=>(


<div
key={index}
className="bg-white/10 rounded-xl p-5"
>

{index+1}. {item}

</div>


))
}


</div>


</div>


</section>









{/* DECISION */}

<section className="py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Reviewer Recommendations

</h2>



<div className="grid md:grid-cols-4 gap-6 mt-8">


{
decisions.map((item,index)=>(


<div
key={index}
className={`${item.color} rounded-3xl p-6`}
>


<h3 className="font-bold text-xl">

{item.title}

</h3>


<p className="mt-3 text-sm">

{item.text}

</p>


</div>


))
}


</div>


</div>


</section>









{/* ETHICS */}

<section className="bg-green-900 text-white py-16">


<div className="max-w-5xl mx-auto px-6 text-center">


<h2 className="text-3xl font-bold">

Research Integrity Comes First

</h2>


<p className="mt-5 text-green-100">


RSJH reviewers contribute to building trust in African
medical research by protecting confidentiality,
fairness, and scientific honesty.


</p>


<div className="mt-8 text-5xl">

🩺 🔬 🌍

</div>


</div>


</section>









<section className="py-12 text-center">


<h2 className="text-2xl font-bold">

Join the RSJH Reviewer Community

</h2>


<Link

href="/contact"

className="inline-block mt-6 bg-gray-950 text-white px-10 py-3 rounded-xl"

>

Contact Editorial Office

</Link>


</section>



</div>

);

}