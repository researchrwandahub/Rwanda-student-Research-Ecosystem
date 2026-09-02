import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../utils/api";


export default function CreateArticle() {

  const router = useRouter();


  const [form, setForm] = useState({

    title: "",
    abstract: "",
    keywords: "",
    specialty: "",
    year: new Date().getFullYear(),

  });


  const [pdf, setPdf] = useState<File | null>(null);

  const [message, setMessage] = useState("");



  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ){

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  }




  async function submitArticle(
    e: React.FormEvent
  ){

    e.preventDefault();


    try{


      const data = new FormData();


      data.append(
        "title",
        form.title
      );


      data.append(
        "abstract",
        form.abstract
      );


      data.append(
        "keywords",
        form.keywords
      );


      data.append(
        "specialty",
        form.specialty
      );


      data.append(
        "year",
        String(form.year)
      );


      if(pdf){

        data.append(
          "pdf",
          pdf
        );

      }
console.log("TOKEN:", localStorage.getItem("rmsjToken"));
console.log("Submitting article...");


      await api.post(
        "/articles/",
        data,
        {
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );



      setMessage(
        "Manuscript submitted successfully"
      );


      setTimeout(()=>{

        router.push(
          "/dashboard/author"
        );

      },1500);



    }catch(error:any){

      console.log(
        error.response?.data
      );


      setMessage(
        "Submission failed"
      );

    }

  }





return (

<DashboardLayout
 role="author"
 title="Submit Manuscript"
>


<div className="bg-white rounded-xl shadow p-8 max-w-3xl">


<h1 className="text-2xl font-bold mb-6">
Submit New Manuscript
</h1>



<form
onSubmit={submitArticle}
className="grid gap-5"
>


<label>
Title

<input

className="border rounded-xl p-3 w-full"

name="title"

value={form.title}

onChange={handleChange}

required

/>

</label>




<label>

Abstract

<textarea

className="border rounded-xl p-3 w-full"

rows={6}

name="abstract"

value={form.abstract}

onChange={handleChange}

required

/>

</label>




<label>

Keywords

<input

className="border rounded-xl p-3 w-full"

name="keywords"

placeholder="Example: malaria, infection, Rwanda"

value={form.keywords}

onChange={handleChange}

/>

</label>




<label>

Specialty

<input

className="border rounded-xl p-3 w-full"

name="specialty"

placeholder="Example: Cardiology"

value={form.specialty}

onChange={handleChange}

/>

</label>




<label>

Year

<input

type="number"

className="border rounded-xl p-3 w-full"

name="year"

value={form.year}

onChange={handleChange}

/>

</label>




<label>

Upload Manuscript PDF

<input

type="file"

accept="application/pdf"

onChange={(e)=>

setPdf(
e.target.files?.[0] || null
)

}

/>

</label>




<button

className="bg-blue-600 text-white rounded-xl p-3"

type="submit"

>

Submit Manuscript

</button>



</form>



{

message &&

<p className="mt-4">

{message}

</p>

}



</div>



</DashboardLayout>

);

}