import Link from "next/link";


export default function AuthorGuidelines() {


const manuscriptTypes = [

{
title:"Original Research Articles",
text:"New research findings in clinical medicine, public health, biomedical sciences, and healthcare innovation."
},

{
title:"Review Articles",
text:"Evidence-based summaries and discussions of important medical and healthcare topics."
},

{
title:"Case Reports",
text:"Unique clinical cases that provide important educational lessons for healthcare professionals."
},

{
title:"Medical Education & Student Research",
text:"Research projects, innovations, and educational studies developed by medical students and young researchers."
}

];



const preparation = [

"Title page with authors and institutional affiliations",

"Structured abstract with Background, Methods, Results, and Conclusion",

"Clear introduction explaining the research question",

"Detailed methodology allowing reproducibility",

"Accurate results presentation and scientific discussion",

"References following accepted academic standards"

];



const ethics = [

"Institutional ethical approval when required",

"Informed consent for patient-related information",

"Protection of participant confidentiality",

"Declaration of conflicts of interest",

"Disclosure of funding sources",

"Original work without plagiarism"

];



const submissionSteps = [

"Prepare your manuscript",

"Submit through RSJH online submission system",

"Editorial screening and ethical check",

"Peer review by qualified reviewers",

"Revision and final publication"

];



return (

<div className="bg-white">



{/* HERO */}

<section className="relative overflow-hidden bg-blue-950 text-white py-24">


<div className="absolute inset-0 opacity-10">

<div className="grid grid-cols-6 gap-4 rotate-12 scale-150">

{
Array.from({length:36}).map((_,i)=>(

<div
key={i}
className="h-10 border border-white"
/>

))
}

</div>

</div>



<div className="relative max-w-6xl mx-auto px-6 text-center">


<p className="text-yellow-300 font-semibold tracking-widest">

RSJH AUTHOR PORTAL

</p>


<h1 className="text-5xl font-bold mt-4">

Author Guidelines

</h1>


<p className="max-w-3xl mx-auto mt-6 text-blue-100 text-lg">


Your research. Your experience. Your contribution to
Rwanda and Africa's healthcare knowledge.


</p>


</div>

</section>









{/* HUMAN MESSAGE */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Every Research Idea Matters

</h2>


<p className="mt-5 text-gray-700 leading-relaxed">


Across Rwanda and Africa, medical students, healthcare
workers, and researchers observe health challenges every
day. RSJH provides a platform where these observations can
be transformed into scientific evidence.


</p>


<p className="mt-4 text-gray-700 leading-relaxed">


Whether you are reporting a clinical experience, analysing
healthcare challenges, or presenting innovative research,
RSJH welcomes contributions that improve healthcare.


</p>


</div>


</section>









{/* MANUSCRIPT TYPES */}

<section className="bg-gray-50 py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold text-blue-950 text-center">

Manuscripts Accepted by RSJH

</h2>



<div className="grid md:grid-cols-4 gap-6 mt-10">


{
manuscriptTypes.map((item,index)=>(


<div
key={index}
className="bg-white rounded-3xl p-7 border hover:shadow-xl transition"
>


<div className="text-3xl">

📚

</div>


<h3 className="mt-5 font-bold text-blue-900">

{item.title}

</h3>


<p className="mt-3 text-gray-600 text-sm">

{item.text}

</p>


</div>


))
}


</div>


</div>


</section>









{/* PREPARATION */}

<section className="py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Preparing Your Manuscript

</h2>



<div className="mt-8 space-y-4">


{
preparation.map((item,index)=>(


<div
key={index}
className="flex gap-4 items-center bg-blue-50 p-5 rounded-2xl"
>


<div className="h-10 w-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">

{index+1}

</div>


<p className="text-gray-700">

{item}

</p>


</div>


))
}


</div>


</div>


</section>









{/* ETHICS */}

<section className="bg-green-900 text-white py-16">


<div className="max-w-5xl mx-auto px-6">


<h2 className="text-3xl font-bold">

Research Ethics and Responsibility

</h2>


<p className="mt-4 text-green-100">

RSJH promotes responsible research that respects
participants, communities, and scientific integrity.


</p>



<div className="grid md:grid-cols-2 gap-4 mt-8">


{
ethics.map((item,index)=>(


<div
key={index}
className="bg-white/10 rounded-xl p-5"
>

✓ {item}

</div>


))
}


</div>


</div>


</section>









{/* SUBMISSION JOURNEY */}

<section className="py-16">


<div className="max-w-6xl mx-auto px-6">


<h2 className="text-3xl font-bold">

From Research Idea to Publication

</h2>



<div className="grid md:grid-cols-5 gap-5 mt-10">


{
submissionSteps.map((step,index)=>(


<div
key={index}
className="border rounded-2xl p-6 text-center"
>


<div className="h-12 w-12 mx-auto rounded-full bg-yellow-500 text-blue-950 font-bold flex items-center justify-center">

{index+1}

</div>


<p className="mt-4 text-sm text-gray-700">

{step}

</p>


</div>


))
}


</div>


</div>


</section>









{/* RWANDA IDENTITY */}

<section className="bg-blue-950 text-white py-16">


<div className="max-w-5xl mx-auto px-6 text-center">


<h2 className="text-3xl font-bold">

Building Rwanda's Scientific Voice

</h2>


<p className="mt-5 text-blue-100">


RSJH supports the next generation of African healthcare
researchers by creating opportunities for students and young
professionals to share evidence from their communities.


</p>


<div className="mt-8 text-5xl">

🇷🇼 🩺 🌍

</div>


</div>


</section>









{/* SUBMIT BUTTON */}

<section className="py-12 text-center">


<h2 className="text-2xl font-bold">

Ready to Share Your Research?

</h2>


<Link
href="/submit"
className="inline-block mt-6 bg-blue-900 text-white px-10 py-3 rounded-xl"
>

Submit Manuscript

</Link>


</section>



</div>

);

}