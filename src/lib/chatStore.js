import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
    chatId : null,
    user:null,
    user2:null,
    isCurrentUserBlocked : false,
    isReceiverBlocked : false,
    
    changeChat: (chatId,user) => {
        const currentUser = useUserStore.getState().currentUser;

        // CHECK ID THE CURRENT USER IS BLOCKED
        if(user.blocked.includes(currentUser.id)){
            return set({
                chatId,
                user : null,
                user2 : user,
                isCurrentUserBlocked : true,
                isReceiverBlocked : false
            })
        }
        
        // CHECK ID THE RECEIVER IS BLOCKED
        else if(currentUser.blocked.includes(user.id)){
            return set({
                chatId,
                user : user,
                user2 : user,
                isCurrentUserBlocked : false,
                isReceiverBlocked : true
            })
        }

        else { 
         return set({
            chatId,
            user,
            user2 : user,
            isCurrentUserBlocked : false,
            isReceiverBlocked : false
        })}
    },

    changeBlock : ()=> {
        set(state => ({...state,isReceiverBlocked : !state.isReceiverBlocked}))
    }
  }))