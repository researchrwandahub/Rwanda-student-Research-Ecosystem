import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../utils/api";


export default function Manuscripts() {

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadArticles(){

      try {

        const response = await api.get(
          "/articles/my/"
        );

        setArticles(response.data);


      } catch(error){

        console.log(error);

      } finally {

        setLoading(false);

      }

    }


    loadArticles();


  }, []);



  return (

    <DashboardLayout
      role="author"
      title="My Manuscripts"
    >

      <div className="bg-white rounded-xl shadow p-6">


        <h1 className="text-2xl font-bold mb-6">
          My Manuscripts
        </h1>



        {loading && (

          <p>
            Loading manuscripts...
          </p>

        )}



        {!loading && articles.length === 0 && (

          <p className="text-gray-500">
            You have not submitted any manuscripts yet.
          </p>

        )}



        <div className="grid gap-4">


        {articles.map((article)=>(

          <div
            key={article.id}
            className="border rounded-xl p-4"
          >

            <h2 className="font-bold">
              {article.title}
            </h2>


            <p>
              Status: {article.state}
            </p>


          </div>


        ))}


        </div>


      </div>


    </DashboardLayout>

  );

}