import DashboardLayout from "../../components/DashboardLayout";


export default function AssignReviewers(){


return(

<DashboardLayout
role="administrator"
title="Assign Reviewers"
>


<div className="bg-white rounded-3xl shadow p-8">


<h1 className="text-3xl font-bold text-blue-900">

Assign Reviewers

</h1>


<p className="mt-3 text-gray-600">

Assign qualified reviewers to submitted manuscripts.

</p>



<div className="mt-8 border rounded-xl p-6">


<p className="text-gray-500">

Manuscripts waiting for reviewer assignment will appear here.

</p>


</div>


</div>


</DashboardLayout>


);


}