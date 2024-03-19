import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useShowToast from './useShowToast'

const useGetUserProfile = () => {
 
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const {username} = useParams()
    const showToast = useShowToast()

    useEffect(()=>{
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/${username}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                 
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.error) {
                        showToast("Error", data.error, "error");
                        console.log(data.error);
                        return;
                    }      
                    setUser(data);
                } else {
                    throw new Error("Response is not in JSON format");
                }
            } catch (error) {
                showToast("Error", error.message, "error");
                console.error(error);
            }finally{
                setLoading(false)
            }
        };
        getUser()

    },[username,showToast])

    return {loading,user}
}

export default useGetUserProfile

