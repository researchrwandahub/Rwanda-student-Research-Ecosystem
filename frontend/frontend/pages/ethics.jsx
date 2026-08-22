import Link from "next/link";


export default function Ethics(){


const principles = [

{
title:"Research Integrity",
icon:"🔬",
text:
"RSJH promotes honest, accurate, and responsible reporting of research findings. Authors must present original work and avoid fabrication, falsification, or manipulation of data."
},


{
title:"Authorship Responsibility",
icon:"✍️",
text:
"Authors should have meaningful contributions to the research process and take responsibility for the accuracy and integrity of their manuscript."
},


{
title:"Patient Protection",
icon:"🩺",
text:
"Research involving patients must respect confidentiality, privacy, dignity, and informed consent requirements."
},


{
title:"Fair Peer Review",
icon:"⚖️",
text:
"All manuscripts are evaluated objectively based on scientific quality, regardless of author background, institution, or location."
},


{
title:"Transparency",
icon:"📖",
text:
"Authors must disclose funding sources, conflicts of interest, and any information that may influence research interpretation."
},


{
title:"Responsible Publication",
icon:"🌍",
text:
"RSJH supports research that contributes positively to Rwanda, Africa, and global healthcare improvement."
}

];



const misconduct = [

"Plagiarism or unauthorized copying of published work",

"Fabrication or falsification of research data",

"Duplicate submission or duplicate publication",

"Improper authorship claims",

"Undisclosed conflicts of interest",

"Violation of research participant rights"

];



const ethicsWorkflow = [

"Ethical approval obtained when required",

"Manuscript submitted with declarations",

"Editorial ethical screening",

"Peer review and quality assessment",

"Publication after ethical compliance"

];




return (

<div className="bg-white">



{/* HERO */}

<section className="relative bg-green-950 text-white py-24 overflow-hidden">


<div className="absolute inset-0 opacity-10">

<div className="grid grid-cols-7 gap-4 rotate-12 scale-150">


{
Array.from({length:42}).map((_,i)=>(

<div
key={i}
className="h-10 border border-yellow-400"
/>

))
}


</div>

</div>




<div className="relative max-w-6xl mx-auto px-6 text-center">


<p className="text-yellow-300 font-semibold tracking-widest">

RSJH VALUES

</p>


<h1 className="text-5xl font-bold mt-4">

Publication Ethics

</h1>


<p className="max-w-3xl mx-auto mt-6 text-green-100 text-lg">


Building trust in medical research through honesty,
responsibility, transparency, and respect for human dignity.


</p>


</div>


</section>









{/* INTRO */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Our Commitment to Ethical Science

</h2>


<p className="mt-5 text-gray-700 leading-relaxed">


The Rwanda Student Journal for Health (RSJH) believes that
quality research depends on ethical responsibility.
Every published article should contribute reliable knowledge
that improves healthcare and benefits communities.


</p>



<p className="mt-4 text-gray-700 leading-relaxed">


RSJH follows principles of transparency, fairness,
confidentiality, and responsible scientific communication.


</p>


</div>


</section>









{/* PRINCIPLES */}

<section className="bg-gray-50 py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold text-center">

Core Ethical Principles

</h2>



<div className="grid md:grid-cols-3 gap-6 mt-10">


{
principles.map((item,index)=>(


<div

key={index}

className="bg-white rounded-3xl border p-7 hover:shadow-lg transition"

>


<div className="text-4xl">

{item.icon}

</div>


<h3 className="mt-5 text-xl font-bold text-green-900">

{item.title}

</h3>


<p className="mt-4 text-gray-600 text-sm leading-relaxed">

{item.text}

</p>


</div>


))
}


</div>


</div>


</section>









{/* MISCONDUCT */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Research Misconduct

</h2>


<p className="mt-4 text-gray-700">

RSJH does not tolerate practices that compromise scientific
integrity.


</p>



<div className="grid md:grid-cols-2 gap-5 mt-8">


{
misconduct.map((item,index)=>(


<div

key={index}

className="bg-red-50 rounded-xl p-5"

>


<span className="text-red-700 font-bold">

×

</span>

{" "}

{item}


</div>


))
}


</div>


</div>


</section>









{/* ETHICAL PROCESS */}

<section className="bg-blue-950 text-white py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Ethical Publication Process

</h2>



<div className="grid md:grid-cols-5 gap-5 mt-10">


{
ethicsWorkflow.map((item,index)=>(


<div

key={index}

className="bg-white/10 rounded-2xl p-5 text-center"

>


<div className="h-12 w-12 rounded-full bg-yellow-400 text-blue-950 mx-auto flex items-center justify-center font-bold">

{index+1}

</div>


<p className="mt-4 text-sm">

{item}

</p>


</div>


))
}


</div>


</div>


</section>









{/* RWANDA AFRICA */}

<section className="bg-green-900 text-white py-16">


<div className="max-w-5xl mx-auto px-6 text-center">


<h2 className="text-3xl font-bold">

Ethics for Rwanda and African Health Research

</h2>


<p className="mt-5 text-green-100">


RSJH recognizes the importance of protecting communities,
respecting local contexts, and promoting research that
addresses real healthcare challenges across Rwanda and Africa.


</p>


<div className="mt-8 text-5xl">

🇷🇼 🧬 🌍

</div>


</div>


</section>









{/* LINK */}

<section className="py-12 text-center">


<h2 className="text-2xl font-bold">

Learn More About RSJH Policies

</h2>


<Link

href="/reviewer-guidelines"

className="inline-block mt-6 bg-green-900 text-white px-10 py-3 rounded-xl"

>

Reviewer Guidelines

</Link>


</section>



</div>


);

}