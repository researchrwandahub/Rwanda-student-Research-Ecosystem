import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import api from "../../../../utils/api";


interface Assignment {
  id: number;
  article: number;
  article_title: string;
  article_author: string;
  article_status: string;
  pdf: string;
}



export default function ReviewManuscript() {

  const router = useRouter();

  const { id } = router.query;


  const [assignment, setAssignment] =
    useState<Assignment | null>(null);


  const [recommendation, setRecommendation] =
    useState("");


  const [comment, setComment] =
    useState("");


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    if (id) {
      loadAssignment();
    }

  }, [id]);



  async function loadAssignment() {

    try {

      const res = await api.get(
        `/assignments/${id}/`
      );


      setAssignment(res.data);


    } catch (error) {

      console.log(
        "Loading assignment error",
        error
      );


    } finally {

      setLoading(false);

    }

  }



  async function submitReview() {


    if (!assignment) return;


    if (!recommendation) {
      alert("Please select a recommendation");
      return;
    }

    if (!comment.trim()) {
      alert("Please add comments to the author before submitting the review.");
      return;
    }



    try {


      await api.post(

        "/reviews/",

        {

          article: assignment.article,

          recommendation,

          comments_to_author: comment

        }

      );



      alert(
        "Review submitted successfully"
      );


      router.push(
        "/dashboard/reviewer"
      );


    } catch (error) {


      console.log(
        "Submit review error",
        error
      );


      alert(
        "Unable to submit review"
      );

    }

  }




  if (loading) {

    return (

      <DashboardLayout
        role="reviewer"
        title="Review Manuscript"
      >

        <div className="p-10">
          Loading manuscript...
        </div>


      </DashboardLayout>

    );

  }



  if (!assignment) {

    return (

      <DashboardLayout
        role="reviewer"
        title="Review Manuscript"
      >

        <div className="p-10">
          Manuscript not found.
        </div>


      </DashboardLayout>

    );

  }




  return (

    <DashboardLayout

      role="reviewer"

      title="Review Manuscript"

    >


      <div className="border rounded-xl p-6">


        <h1 className="text-2xl font-bold mb-4">

          {assignment.article_title}

        </h1>



        <p>

          Author:{" "}

          {assignment.article_author}

        </p>



        <p>

          Status:{" "}

          {assignment.article_status}

        </p>





        <a

          href={assignment.pdf}

          target="_blank"

          rel="noopener noreferrer"

          className="
            inline-block
            mt-6
            bg-blue-700
            text-white
            px-6
            py-3
            rounded-xl
          "

        >

          Download Manuscript PDF


        </a>





        <h2 className="text-xl font-bold mt-8 mb-4">

          Recommendation

        </h2>





        <div className="flex flex-wrap gap-4">


          {
            [
              "accept",
              "minor_revision",
              "major_revision",
              "reject"

            ].map((option)=>(


              <button

                key={option}

                onClick={() =>
                  setRecommendation(option)
                }


                className={`
                  px-4
                  py-3
                  rounded-xl
                  border
                  ${
                    recommendation === option
                    ?
                    "bg-blue-700 text-white"
                    :
                    "bg-white"
                  }
                `}

              >

                {option.replace(/_/g," ")}


              </button>


            ))

          }


        </div>





        <h2 className="text-xl font-bold mt-8 mb-3">

          Comments to Author

        </h2>



        <textarea

          value={comment}

          onChange={(e)=>
            setComment(e.target.value)
          }


          placeholder="Write constructive comments that the author will be able to read on their RSJH dashboard..."

          className="
            w-full
            border
            rounded-xl
            p-4
            min-h-[150px]
          "

        />





        <button

          onClick={submitReview}

          className="
            mt-6
            bg-green-700
            text-white
            px-6
            py-3
            rounded-xl
          "

        >

          Submit Review


        </button>



      </div>


    </DashboardLayout>

  );

}