// pages/articles/[id].tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../utils/api";


interface Article {

  id:number;

  title:string;

  abstract?:string;

  specialty?:string;

  keywords?:string;

  pdf?:string;

  published_date?:string;
  volume?:string|number;
  issue?:string|number;
  doi?:string;
  article_type?:string;

  author?:{
    username?:string;
    full_name?:string;
    university?:string;
  };
  co_authors?:Array<{id:number|string; username?:string; full_name?:string; university?:string}>;
  co_author_contributions?:Array<{user:{id:number|string; username?:string; full_name?:string; university?:string}; contribution_roles?:string[]}>;

}



export default function ArticleDetail(){


  const router = useRouter();

  const { id } = router.query;


  const [article,setArticle] =
    useState<Article | null>(null);


  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{


    if(id){

      loadArticle();

    }


  },[id]);




  async function loadArticle(){


    try{


      const response =
        await api.get(
          `/articles/${id}/`
        );


      setArticle(
        response.data
      );


    }catch(error){


      console.log(
        "Article loading error",
        error
      );


    }finally{


      setLoading(false);


    }


  }





  if(loading){

    return(

      <Layout>

        <div className="p-10">

          Loading article...

        </div>

      </Layout>

    );

  }





  if(!article){


    return(

      <Layout>

        <div className="p-10">

          Article not found.

        </div>

      </Layout>

    );

  }





  return(


    <Layout>


      <section className="page-shell py-12">
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <strong>RSJH is free.</strong> This publication is openly accessible. RSJH does not charge students for submission, peer review, or publication.
        </div>

        <article className="light-panel rounded-3xl p-8">



          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Published</span>
            {article.article_type && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{article.article_type.replace(/_/g, " ")}</span>}
          </div>

          <h1 className="mt-4 text-3xl font-bold">{article.title}</h1>




          <div className="mt-5 text-gray-600">


            <p>

              Author:{" "}

              {
                article.author?.full_name ||
                article.author?.username ||
                "Unknown"
              }

            </p>



            <p>

              University:{" "}

              {
                article.author?.university ||
                "Not provided"
              }

            </p>



            <p>

              Specialty:{" "}

              {
                article.specialty ||
                "General Medicine"
              }

            </p>

            {article.co_authors && article.co_authors.length > 0 && (
              <div className="mt-5">
                <p className="font-semibold text-gray-800">Co-authors</p>
                <div className="mt-2 space-y-2">
                  {article.co_authors.map((co) => {
                    const contribution = article.co_author_contributions?.find((c) => String(c.user?.id) === String(co.id));
                    return (
                      <div key={co.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">{co.full_name || co.username}</p>
                        <p className="text-xs text-slate-500">{co.university || "RSJH contributor"}</p>
                        {contribution?.contribution_roles?.length ? <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Contributions:</span> {contribution.contribution_roles.join(", ")}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>





          <h2 className="text-xl font-bold mt-8">

            Abstract

          </h2>


          <p className="mt-3">

            {
              article.abstract ||
              "No abstract available."
            }

          </p>





          {
            article.keywords && (

              <div className="mt-6">

                <strong>
                  Keywords:
                </strong>

                {" "}

                {article.keywords}

              </div>

            )
          }





          {
            article.pdf && (

              <div className="mt-8">


                <a

                  href={article.pdf}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="
                    bg-blue-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                  "

                >

                  Read / download PDF

                </a>


              </div>

            )
          }




        </article>



      </section>


    </Layout>


  );


}