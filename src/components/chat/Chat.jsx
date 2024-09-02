import { useEffect, useRef, useState } from "react";
import "./chat.css"
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import Upload from "../../lib/Upload";
import { toast } from "react-toastify";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
const Chat =  () => {
    const [userInf, setUserInfo] = useState();
    const [chat, setChat] = useState();
    const [opene, setOpene] = useState(false);
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);

    const [img, setImg] = useState({
        file:null,
        url:null
    });
    const {chatId, user,isCurrentUserBlocked,isReceiverBlocked,user2, changeChat} = useChatStore();
    const {currentUser} = useUserStore();
    
    const endRef = useRef(null);
    const handleEmoji = (e) => {
        setText((prev)=> prev + e.emoji);
        setOpene(false);
    }
    const handleImg = (e) => {
        
        if(e.target.files[0]){
            setImg({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            })            
        }
    }
    useEffect(()=>{
        endRef.current?.scrollIntoView({behavior: "smooth"});
    },[chat,img])

    useEffect(()=>{
        const unSub = onSnapshot(
            doc(db, "chats", chatId), (res)=>{
                setChat(res.data());
                
            }
        )
        
        const unSub2 = onSnapshot(
            doc(db, "users", user2.id), (res)=>{
                    changeChat(chatId,res.data());
                    
            }
        )

        return ()=>{
            unSub();
            unSub2();
        }
    },[chatId])
    
    const handleSend = async()=>{
        if(text === "" && !img.file) return;

        let imgUrl = null;

        if(img.file){
            imgUrl = await Upload(img.file)
        }
        try{

            await updateDoc(doc(db,"chats",chatId),{
                messages: arrayUnion({
                    senderId: currentUser?.id,
                    text,
                    createAt : new Date(),
                    ...(imgUrl && {img : imgUrl}),
                })
            })

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async(id)=>{

                const userChatsRef = doc(db, "userchats", id)
                const userChatsSnapshot = await getDoc(userChatsRef);

                if(userChatsSnapshot.exists()){
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(c=>c.chatId === chatId)

                    userChatsData.chats[chatIndex].lastMessage = img.file && text === "" ?"has send you an image":text 
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id?true:false, 
                    userChatsData.chats[chatIndex].updateAt = Date.now() 

                    await updateDoc(userChatsRef,{
                        chats: userChatsData.chats
                    })
                }
            })
            
        }catch(err){
            console.log(err);
            
        }

        setImg({
            file:null,
            url:""
        })

        setText("")
        
    }
    
    
    return ( 
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt=""  />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum, dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                
                {chat?.messages.map((message)=>{
                
                    return <div className={message.senderId === currentUser?.id ?"message own":"message"} key={message?.createAt}>
                        <div className="texts">
                       {
                        message.img &&<>
                        <Button onClick={()=>setOpen(`${message.img}`)} className="modalBtn">
                             <img src={message.img} alt="" className="modalImg" style={{cursor:"pointer"}}/>
                        </Button>
                        <Modal opened={open === `${message.img}`} withCloseButton={false} onClose={()=>setOpen(null)} className="modalDiv" >
                        {message.img && <img src={message.img} style={{height:"100%",width:"100%",cursor:"pointer"}} alt=""/>}
                </Modal>
                        </>
                                                    
                    }
                            {message.text!==""&&
                                <p>
                                    {message.text}
                                </p>}
                            {/* <span>1 min ago</span> */}

                        </div>
                    </div>
            })}{img.url &&
                (<div className="message own" ref={endRef}>
                        <div className="texts">
                            <img src={img.url} alt="" className="uploadImg"/>
                        </div>
                    </div>)
            }
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id="file" hidden onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked} />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt=""/>
                </div>
                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't send a message" : "Type a message..."} value={text} 
                onChange={(e)=>setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
                <div className="emoji">
                    <img src="./emoji.png" onClick={()=>setOpene(prev => !prev)} alt="" />
                    <div className="picker">
                        <EmojiPicker open={opene} onEmojiClick={handleEmoji}/>
                    </div>
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
     );
}
export default Chat;

