import { useEffect, useState } from "react";
import api from "../utils/api";


export default function ResearchAnalytics(){

const [data,setData]=useState<any>(null);


useEffect(()=>{

api.get("/analytics/")
.then(res=>{
setData(res.data)
})

},[]);



if(!data){

return <p>Loading analytics...</p>

}



return(

<div className="grid md:grid-cols-4 gap-6">


<div className="light-panel rounded-3xl p-6">
<h3>Published Articles</h3>
<p className="text-3xl font-bold">
{data.published_articles}
</p>
</div>


<div className="light-panel rounded-3xl p-6">
<h3>Researchers</h3>
<p className="text-3xl font-bold">
{data.total_researchers}
</p>
</div>


<div className="light-panel rounded-3xl p-6">
<h3>Universities</h3>
<p className="text-3xl font-bold">
{data.universities}
</p>
</div>


<div className="light-panel rounded-3xl p-6">
<h3>Research Areas</h3>
<p className="text-3xl font-bold">
{data.research_areas}
</p>
</div>


</div>

)

}