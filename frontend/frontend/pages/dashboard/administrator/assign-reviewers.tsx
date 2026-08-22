import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../utils/api";


interface Article {

    id:number;
    title:string;
    status:string;

}


interface Reviewer {

    id:number;
    username:string;
    full_name:string;

}



export default function AssignReviewers(){


const [articles,setArticles]=useState<Article[]>([]);

const [reviewers,setReviewers]=useState<Reviewer[]>([]);


const [article,setArticle]=useState("");

const [reviewer,setReviewer]=useState("");

const [loading,setLoading]=useState(true);





useEffect(()=>{

loadData();

},[]);






async function loadData(){


try{


const [
articlesResponse,
usersResponse

]=await Promise.all([


api.get("/articles/"),


api.get("/users/?role=reviewer")


]);




setArticles(

articlesResponse.data.results ||
articlesResponse.data

);




setReviewers(

usersResponse.data.results ||
usersResponse.data

);



}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


}








async function assignReviewer(){



try{


await api.post(

"/assignments/",

{


article:article,

reviewer:reviewer


}

);




alert(
"Reviewer assigned successfully"
);



setArticle("");

setReviewer("");



}



catch(error){


console.log(error);


alert(
"Failed to assign reviewer"
);


}



}







if(loading){


return(

<DashboardLayout

role="administrator"

title="Assign Reviewers"

>

Loading...


</DashboardLayout>


)

}





return(


<DashboardLayout

role="administrator"

title="Assign Reviewers"

>


<div className="
bg-white
rounded-2xl
shadow
p-8
max-w-3xl
">



<h2 className="
text-2xl
font-bold
mb-6
">

Assign Manuscript Reviewer

</h2>





<label className="block mb-2 font-semibold">

Select Manuscript

</label>


<select

value={article}

onChange={
e=>setArticle(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mb-6
"

>


<option value="">

Choose article

</option>


{

articles.map(item=>(


<option

key={item.id}

value={item.id}

>

{item.title}

</option>


))


}


</select>







<label className="block mb-2 font-semibold">

Select Reviewer

</label>



<select

value={reviewer}

onChange={
e=>setReviewer(e.target.value)
}

className="
w-full
border
rounded-xl
p-3
mb-6
"

>


<option value="">

Choose reviewer

</option>



{

reviewers.map(user=>(


<option

key={user.id}

value={user.id}

>

{user.full_name || user.username}

</option>


))


}



</select>






<button

onClick={assignReviewer}

disabled={!article || !reviewer}

className="
bg-blue-700
text-white
px-8
py-3
rounded-xl
disabled:bg-gray-400
"

>

Assign Reviewer

</button>





</div>


</DashboardLayout>


);


}