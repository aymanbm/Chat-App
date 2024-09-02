import { useState } from "react";
import "./login.css"
import { toast } from "react-toastify";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Upload from "../../lib/Upload";
const Login = () => {
    const [avatar, setAvatar] = useState({
        file:null,
        url:"",
    })

    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        
        if(e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            })
            console.log(avatar.file);
            
        }
    }

    const handleRegister = async(e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

        const {username, email, password} = Object.fromEntries(formData);
        try{
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const imgURL = await Upload(avatar.file)
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar:imgURL,
                id : res.user.uid,
                blocked:[]
              });
            
            await setDoc(doc(db,"userchats",res.user.uid),{
                chats:[],
            })
            toast.success("Account Created! You can loging now!");
        }catch(err){
            toast.error("Something went Wrong!");
        }finally{
            setLoading(false);
        }
    }

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true); 
        const formData = new FormData(e.target);
        const {email, password} = Object.fromEntries(formData);
        try{

            await signInWithEmailAndPassword(auth,email,password)
            toast.success("Successfuly logged in!");
        }catch(err){
            console.log(err);
            toast.error("Something went Wrong!");
        }finally{
            setLoading(false);
        }
    }
    return ( 
        <div className="login">
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                <input type="text" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button disabled={loading}>{loading?"Loading...":"Sign In"}</button>
                </form>
            </div>
            <div className="seperator">

            </div>
            <div className="item">
            <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                <label htmlFor="file">
                    <img src={avatar.url || "./avatar.png"} alt="" />
                    Uploan an Image</label>
                <input type="file" id="file" onChange={handleAvatar} hidden/>
                <input type="text" placeholder="Username" name="username" />
                <input type="text" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button disabled={loading}>{loading?"Loading...":"Sign Up"}</button>
                </form>
            </div>
        </div>
     );
}

export default Login;