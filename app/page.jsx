'use client';
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {

  const [expand, setExpand] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const {selectedChat} = useAppContext()
  const containerRef = useRef(null)

  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  },[selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])



  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        <Sidebar expand={expand} setExpand={setExpand}/>
        
        {/* Mobile overlay when sidebar is open */}
        {expand && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setExpand(false)}
          />
        )}
        
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-20 sm:pb-8 bg-[#292a2d] text-white relative min-h-0">
          {/* Mobile header */}
          <div className="md:hidden absolute px-3 sm:px-4 top-4 sm:top-6 flex items-center justify-between w-full z-30">
            <Image onClick={()=> (expand ? setExpand(false) : setExpand(true))}
             className="rotate-180 w-6 h-6" src={assets.menu_icon} alt=""/>
            <div className="flex items-center gap-2">
              <Image className="opacity-70 w-5 h-5" src={assets.chat_icon} alt=""/>
              <span className="text-sm font-medium">Nexachat</span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-16 sm:mt-0">
              <div className="flex items-center gap-3 mb-3">
                <Image src={assets.logo_icon} alt="" className="h-12 sm:h-16"/>
                <p className="text-xl sm:text-2xl font-medium">Hi, I'm Nexachat.</p>
              </div>
              <p className="text-sm mt-2 px-4">How can I help you today?</p>
            </div>
          ):(
          <div ref={containerRef}
          className="relative flex flex-col items-center justify-start w-full mt-16 sm:mt-20 max-h-full overflow-y-auto pb-4"
          > 
          <p className="fixed top-16 sm:top-8 border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6 text-sm sm:text-base bg-[#292a2d]/80 backdrop-blur-sm z-20">{selectedChat?.name}</p>
          {messages.map((msg, index)=>(
            <Message key={index} role={msg.role} content={msg.content}/>
          ))}
          {
            isLoading && (
              <div className="flex gap-3 sm:gap-4 max-w-3xl w-full py-3 px-2">
                <Image className="h-8 w-8 sm:h-9 sm:w-9 p-1 border border-white/15 rounded-full flex-shrink-0"
                 src={assets.logo_icon} alt="Logo"/>
                 <div className="loader flex justify-center items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                 </div>
              </div>
            )
          }
            
          </div>
        )
        }
        <div className="w-full max-w-3xl px-2 sm:px-4">
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading}/>
        </div>
        <p className="text-xs absolute bottom-2 sm:bottom-1 text-gray-500 text-center px-4">Nexachat AI-generated, for reference only</p>

        </div>
      </div>
    </div>
  );
}
