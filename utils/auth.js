import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export function useAuth(requiredRole=null){

    const router = useRouter();

    const [loading,setLoading]=useState(true);

    const [user,setUser]=useState(null);



    useEffect(()=>{


        const token =
        localStorage.getItem("rmsjToken");



        const role =
        localStorage.getItem("rmsjRole");



        if(!token){

            router.replace("/auth/login");

            return;

        }



        setUser({

            role:role

        });



        if(
            requiredRole &&
            role !== requiredRole
        ){

            router.replace("/");

            return;

        }



        setLoading(false);



    },[]);



    return {

        user,

        loading

    };

}