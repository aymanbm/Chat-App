import { arrayUnion, collection ,doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore"
import "./addUser.css"
import { db } from "../../../lib/firebase"
import { useState } from "react"
import { create } from "zustand"
import { useUserStore } from "../../../lib/userStore"
const AddUser = () => {
    const [user, setUser] = useState(null)
    const { currentUser} = useUserStore();

    const handleSearch = async(e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try{
                
                    const userRef = collection(db, "users");
                    const q = query(
                        userRef,
                        where("id", "!=", currentUser.id),
                        where("username", "==", username)  
                    );
                    
                    const querySnapshot = await getDocs(q);

                    if(!querySnapshot.empty){
                        const userChatsRef2 = collection(db, "userchats");
                        const docUserChatsSnap = await getDoc(doc(userChatsRef2, currentUser.id))

                        const chatItem = docUserChatsSnap.data().chats.
                        find((item)=>item.receiverId === querySnapshot.docs[0].data().id)

                        const friendStatue = chatItem ? chatItem.friends : false;
                        setUser({
                            ...querySnapshot.docs[0].data(),
                            friends : friendStatue,
                        })

                        
                    }else{
                        setUser(null)
                    }

                    
                    
                // }
                
                
            
        }catch(err){
            console.log(err)
        }
    }

    const handleAdd = async() => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        try{
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef,{
                createdAt: serverTimestamp(),
                messages:[],
            })

            await updateDoc(doc(userChatsRef, currentUser.id),{
                chats:arrayUnion({
                    chatId : newChatRef.id,
                    lastMessage : "",
                    friends : true,
                    receiverId : user.id,
                    updateAt : Date.now(),
                })
            })

            await updateDoc(doc(userChatsRef, user.id),{
                chats:arrayUnion({
                    chatId : newChatRef.id,
                    lastMessage : "",
                    friends : true,
                    receiverId : currentUser.id,
                    updateAt : Date.now(),
                })
            })
            setUser(null)
        }catch(err){
            console.log(err);
            
        }
    }
    return ( 
        <div className="addUser">
            
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username..." name="username" />
                <button>Search</button>
            </form>
            {user&&<div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd} disabled={user.friends&&user.friends}>{user.friends&&user.friends ? "Already a freind": "Add User"}</button>
            </div>}
        </div>
     );
}

export default AddUser;