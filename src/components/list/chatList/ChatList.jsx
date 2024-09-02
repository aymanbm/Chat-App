import { useCallback, useEffect, useMemo, useState } from "react";
import "./chatList.css"
import AddUser from "../addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { toast } from "react-toastify";
const ChatList =  () => {
    const [addMode, setAddMode] = useState(false);
    const [chat, setChat] = useState([]);
    const [newChat, setNewChat] = useState([]);
    const {currentUser} = useUserStore();
    const {changeChat, chatId, user,user2, isCurrentUserBlocked,isReceiverBlocked} = useChatStore();
    
    let sendNotToast;

    function sendToast(chat){
        sendNotToast = toast.info(<p onClick={()=>handleSelect(chat)}><strong>{chat.user.username}</strong> has send you a message</p>)
        return sendNotToast
    }

    
    useEffect(()=>{
        const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async(res) => {
            const item = res.data().chats;

            const promisses = item.map(async(item)=>{

                const UserDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(UserDocRef);

                const user = userDocSnap.data();

                return {...item,user}
            })
            const chatData = await Promise.all(promisses);
            
            setChat(chatData.sort((a,b)=> b.updateAt - a.updateAt));
            setNewChat(chatData.sort((a,b)=> b.updateAt - a.updateAt));

            // chatData.forEach((item)=>{

            //     if(item.user.blocked.includes(currentUser.id) || currentUser.blocked.includes(item.user.id)){
            //         console.log(item);

            //         toast.dismiss(sendNotToast);
            //     }
            // })
           
        
            
        });
        
        
        return ()=>{
            unsub();
          };
    },[currentUser.id,isCurrentUserBlocked, isReceiverBlocked])
    
    
    const handleSelect = async(chatte)=>{    
        const userChats = chat&&chat.map((item)=>{
            const {user, ...rest} = item;
            return rest;
        })
        
        const chatIndex = userChats.findIndex((item)=>item.chatId === chatte.chatId);
        
        userChats[chatIndex].isSeen = true;

        const userChatRef = doc(db, "userchats",currentUser.id);
        try{
            await updateDoc(userChatRef,{
                chats:userChats,
            });
        }catch(err){
            console.log(err);
            
        }
        changeChat(chatte.chatId, chatte.user)
        

        toast.dismiss(sendNotToast);
    }
    
    const handleItem = useMemo(()=>{
        return chat&&chat.map((chat)=>{
                
            if(!chat?.isSeen){
                sendToast(chat);
            }
            
            return <div className="item" key={chat.chatId} 
            onClick={()=>handleSelect(chat)}
            style={{backgroundColor : chat?.isSeen ? "transparent" : "#5183fe"}}>
                <img src={chat.user.blocked.includes(currentUser.id) ?"./avatar.png": chat.user.avatar || "./avatar.png"} alt="" />
                <div className="texts">
                    <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
                    <p>{chat.lastMessage}</p>
                </div>
            </div>
        })
    },[chat])

    const handleSearchUser = (e)=>{
        if(e.target.value.trim() === ""){
            setChat(newChat);
        }else{
            setChat((prev) => {
                return prev.filter((item)=>item.user.username.toLowerCase().includes(e.target.value.toLowerCase()))
        })
    }
}
    return ( 
        <div className="chatList" >
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder="Search" onChange={handleSearchUser}/>
                </div>
                <img src={addMode?"./minus.png":"./plus.png"} className="add" onClick={()=> setAddMode((prev => !prev))} alt="" />
            </div>
            <div className="listItems" >
                {
                    handleItem
                }
                
            </div>
            {addMode && <AddUser/>}
        </div>
     );
}
export default ChatList;

