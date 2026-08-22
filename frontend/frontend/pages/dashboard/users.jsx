import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../utils/api";


export default function UsersManagement() {


    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);



    async function loadUsers() {

        try {

            const response = await api.get(
                "/users/"
            );


            setUsers(
                response.data.results || response.data
            );


        } catch (error) {

            console.log(
                "Loading users error:",
                error
            );

        } finally {

            setLoading(false);

        }

    }





    async function updateStatus(id, status) {


        try {


            await api.patch(

                `/users/${id}/`,

                {
                    account_status: status
                }

            );


            setUsers(

                users.map(user =>

                    user.id === id

                    ?

                    {
                        ...user,
                        account_status: status
                    }

                    :

                    user

                )

            );


        } catch(error) {


            console.log(
                error
            );


            alert(
                "Unable to update account status"
            );

        }

    }





    async function updateRole(id, role) {
        try {
            const response = await api.post(`/users/${id}/set-role/`, { role });
            setUsers(users.map(user => user.id === id ? response.data : user));
        } catch(error) {
            console.log(error);
            alert("Unable to update user role");
        }
    }

    useEffect(()=>{

        loadUsers();

    },[]);






    return (

        <DashboardLayout

            role="administrator"

            title="Users Management"

        >


            <div className="
                bg-white
                rounded-3xl
                shadow
                p-8
            ">


                <h1 className="
                    text-3xl
                    font-bold
                    text-blue-900
                ">

                    RSJH Users

                </h1>



                <p className="
                    text-gray-600
                    mt-2
                ">

                    Manage RSJH users and assign controlled roles, including Reviewer, Editor and Editor-in-Chief.

                </p>





                {

                loading ?

                <p className="mt-8">

                    Loading users...

                </p>


                :


                <div className="
                    mt-8
                    space-y-5
                ">


                {

                users.map(user=>(


                <div

                    key={user.id}

                    className="
                    border
                    rounded-2xl
                    p-6
                    flex
                    justify-between
                    items-center
                    "

                >


                    <div>


                        <h2 className="
                            font-bold
                            text-lg
                        ">

                        {user.full_name || user.username}

                        </h2>


                        <p className="
                            text-gray-500
                        ">

                        {user.email}

                        </p>


                        <p className="mt-2 text-blue-700">
                          Current role: <span className="font-semibold">{user.role}</span>
                        </p>

                        <select
                          value={user.role}
                          onChange={(e)=>updateRole(user.id, e.target.value)}
                          className="mt-3 border rounded-xl px-3 py-2 bg-white"
                          disabled={user.id === undefined}
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Author</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="editor">Editor</option>
                          <option value="editor_in_chief">Editor-in-Chief</option>
                          <option value="administrator">Administrator</option>
                        </select>


                        <p>

                        Status:
                        
                        <span className="
                            font-semibold
                        ">

                        {" "}{user.account_status}

                        </span>

                        </p>


                    </div>





                    <div className="
                        flex
                        gap-3
                    ">



                    {
                    user.account_status === "active"

                    ?

                    <button

                    onClick={()=>updateStatus(
                        user.id,
                        "inactive"
                    )}

                    className="
                    bg-yellow-500
                    text-white
                    px-4
                    py-2
                    rounded-xl
                    "

                    >

                    Deactivate

                    </button>


                    :


                    <button

                    onClick={()=>updateStatus(
                        user.id,
                        "active"
                    )}

                    className="
                    bg-green-600
                    text-white
                    px-4
                    py-2
                    rounded-xl
                    "

                    >

                    Activate

                    </button>

                    }



                    <button

                    onClick={()=>updateStatus(
                        user.id,
                        "suspended"
                    )}

                    className="
                    bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded-xl
                    "

                    >

                    Suspend

                    </button>




                    </div>


                </div>


                ))

                }



                </div>


                }



            </div>



        </DashboardLayout>

    );

}