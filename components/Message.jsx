import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'

const Message = ({role, content}) => {

    useEffect(()=>{
        Prism.highlightAll()
    }, [content])

    const copyMessage = ()=>{
        navigator.clipboard.writeText(content)
        toast.success('Message copied to clipboard')
    }

  return (
    <div className='flex flex-col items-center w-full max-w-3xl text-sm px-2 sm:px-0'>
      <div className={`flex flex-col w-full mb-6 sm:mb-8 ${role === 'user' && 'items-end'}`}>
        <div className={`group relative flex w-full max-w-full sm:max-w-2xl py-3 rounded-xl ${role === 'user' ? 'bg-[#414158] px-3 sm:px-5' : 'gap-2 sm:gap-3'}`}>
            <div className={`opacity-0 group-hover:opacity-100 absolute ${role === 'user' ? '-left-12 sm:-left-16 top-2.5' : 'left-8 sm:left-9 -bottom-6'} transition-all`}>
                <div className='flex items-center gap-1 sm:gap-2 opacity-70'>
                    {
                        role === 'user' ? (
                            <>
                            <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-3.5 sm:w-4 cursor-pointer'/>
                            <Image src={assets.pencil_icon} alt='' className='w-4 sm:w-4.5 cursor-pointer'/>
                            </>
                        ):(
                            <>
                            <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-4 sm:w-4.5 cursor-pointer'/>
                            <Image src={assets.regenerate_icon} alt='' className='w-3.5 sm:w-4 cursor-pointer'/>
                            <Image src={assets.like_icon} alt='' className='w-3.5 sm:w-4 cursor-pointer'/>
                            <Image src={assets.dislike_icon} alt='' className='w-3.5 sm:w-4 cursor-pointer'/>
                            </>
                        )
                    }
                </div>
            </div>
            {
                role === 'user' ? 
                (
                    <span className='text-white/90 text-sm sm:text-base leading-relaxed'>{content}</span>
                )
                :
                (
                    <>
                    <Image src={assets.logo_icon} alt='' className='h-8 w-8 sm:h-9 sm:w-9 p-1 border border-white/15 rounded-full flex-shrink-0 mt-0.5'/>
                    <div className='space-y-4 w-full min-w-0 overflow-hidden'>
                        <div className="prose prose-sm sm:prose-base prose-invert max-w-none break-words">
                          <Markdown>{content}</Markdown>
                        </div>
                    </div>
                    </>
                )
            }
        </div>
      </div>
    </div>
  )
}

export default Message
