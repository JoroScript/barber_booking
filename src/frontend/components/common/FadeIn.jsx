import { useEffect, useRef, useState } from "react";

export default function FadeIn({children,duration=0}){
const [isVisible,setIsVisible] = useState(false);
const elementRef = useRef(null);

useEffect(()=>{
    const observer = new IntersectionObserver(
        ([entry])=>{
            if(entry.isIntersecting){
                setTimeout(() => {
                    setIsVisible(true)
                }, duration);
            }
        },
        {
            threshold: 0.1
        }
    )

    if(elementRef.current){
        observer.observe(elementRef.current);
    }
    return ()=>{
        if(elementRef.current){
            observer.unobserve(elementRef.current)
        }
    }
},[duration])

    return(
        <div
        ref={elementRef}
        className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"}`}
        >
            {children}
        </div>
    )
}