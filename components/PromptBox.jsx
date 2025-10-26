import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image'
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const PromptBox = ({setIsLoading, isLoading}) => {

    const [prompt, setPrompt] = useState('');
    const [deepThinkActive, setDeepThinkActive] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [abortController, setAbortController] = useState(null);
    const {user, chats, setChats, selectedChat, setSelectedChat} = useAppContext();

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            sendPrompt(e);
        }
    }

    const stopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
        setIsLoading(false);
    };

    const sendPrompt = async (e)=>{
        const promptCopy = prompt;
        const controller = new AbortController();
        setAbortController(controller);

        try {
            e.preventDefault();
            
            if(!user) return toast.error('Login to send message');
            if(isLoading) return toast.error('Wait for the previous prompt response');

            setIsLoading(true)
            setPrompt("")

            const userPrompt = {
                role: "user",
                content: prompt,
                timestamp: Date.now(),
            }

            // saving user prompt in chats array

            setChats((prevChats)=> prevChats.map((chat)=> chat._id === selectedChat._id ?
             {
                ...chat,
                messages: [...chat.messages, userPrompt]
            }: chat
        ))
        // saving user prompt in selected chat

        setSelectedChat((prev)=> ({
            ...prev,
            messages: [...prev.messages, userPrompt]
        }))

        const {data} = await axios.post('/api/chat/ai', {
            chatId: selectedChat._id,
            prompt,
            deepThink: deepThinkActive,
            search: searchActive
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        })

        if(data.success){
            // Update chat name if provided
            if (data.chatName && data.chatName !== selectedChat.name) {
                setSelectedChat(prev => ({ ...prev, name: data.chatName }));
                setChats(prevChats => prevChats.map(chat => 
                    chat._id === selectedChat._id 
                        ? { ...chat, name: data.chatName, messages: [...chat.messages, data.data] }
                        : chat
                ));
            } else {
                setChats((prevChats)=>prevChats.map((chat)=>chat._id === selectedChat._id ? {...chat, messages: [...chat.messages, data.data]} : chat))
            }

            const message = data.data.content;
            const messageTokens = message.split(" ");
            let assistantMessage = {
                role: 'assistant',
                content: "",
                timestamp: Date.now(),
            }

            setSelectedChat((prev) => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
            }))

            // Much faster rendering - reduced delay from 100ms to 20ms
            for (let i = 0; i < messageTokens.length; i++) {
               setTimeout(()=>{
                if (!controller.signal.aborted) {
                    assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
                    setSelectedChat((prev)=>{
                        const updatedMessages = [
                            ...prev.messages.slice(0, -1),
                            assistantMessage
                        ]
                        return {...prev, messages: updatedMessages}
                    })
                }
               }, i * 20) // Reduced from 100ms to 20ms for 5x faster rendering
                
            }
        }else{
            toast.error(data.message);
            setPrompt(promptCopy);
        }

        } catch (error) {
            if (error.name === 'AbortError') {
                toast.error('Generation stopped');
            } else {
                toast.error(error.message);
                setPrompt(promptCopy);
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    }

  return (
    <form onSubmit={sendPrompt}
     className={`w-full ${selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-3 sm:p-4 rounded-2xl sm:rounded-3xl mt-4 transition-all mx-2 sm:mx-0`}>
        <textarea
        onKeyDown={handleKeyDown}
        className='outline-none w-full resize-none overflow-hidden break-words bg-transparent text-sm sm:text-base placeholder:text-gray-400'
        rows={2}
        placeholder='Message Nexachat' required 
        onChange={(e)=> setPrompt(e.target.value)} value={prompt}/>

        <div className='flex items-center justify-between text-xs sm:text-sm mt-2'>
            <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
                <p onClick={() => setDeepThinkActive(!deepThinkActive)}
                   className={`flex items-center gap-1.5 sm:gap-2 text-xs border px-2 py-1 rounded-full cursor-pointer transition whitespace-nowrap ${
                    deepThinkActive 
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                        : 'border-gray-300/40 hover:bg-gray-500/20'
                   }`}>
                    <Image className='h-4 sm:h-5 w-4 sm:w-5' src={assets.deepthink_icon} alt=''/>
                    <span className="hidden sm:inline">DeepThink (R1)</span>
                    <span className="sm:hidden">R1</span>
                </p>
                <p onClick={() => setSearchActive(!searchActive)}
                   className={`flex items-center gap-1.5 sm:gap-2 text-xs border px-2 py-1 rounded-full cursor-pointer transition whitespace-nowrap ${
                    searchActive 
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                        : 'border-gray-300/40 hover:bg-gray-500/20'
                   }`}>
                    <Image className='h-4 sm:h-5 w-4 sm:w-5' src={assets.search_icon} alt=''/>
                    Search
                </p>
            </div>

            <div className='flex items-center gap-1.5 sm:gap-2'>
            <Image className='w-3.5 sm:w-4 cursor-pointer' src={assets.pin_icon} alt=''/>
            {isLoading ? (
                <button onClick={stopGeneration} className="bg-red-500 hover:bg-red-600 rounded-full p-1.5 sm:p-2 cursor-pointer transition">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="6" y="4" width="8" height="12" rx="1"/>
                    </svg>
                </button>
            ) : (
                <button className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-1.5 sm:p-2 cursor-pointer transition`}>
                    <Image className='w-3 sm:w-3.5 aspect-square' src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt=''/>
                </button>
            )}
            </div>
        </div>
    </form>
  )
}

export default PromptBox
