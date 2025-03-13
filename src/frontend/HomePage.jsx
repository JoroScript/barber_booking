import HeroComponent from "./HeroComponent";
import "./styles/animations.css";
import BusinessCard from "./components/common/BusinessCard";   
import DiagonalCatcher from "./components/common/DiagonalCatcher/DiagonalCatcher";
   
export default function HomePage()
    {
     return   <main className="py-12 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <HeroComponent />
      <DiagonalCatcher/>
      <h1 className="text-3xl my-36 font-black text-center">ЗАПОЗНАЙ СЕ С БРЪСНАРИТЕ</h1>

      <div className="flex w-full flex-wrap gap-12">
        <BusinessCard name={""} info={""} specific={""}/>
        <BusinessCard/>
        <BusinessCard/>
      </div>
    </main>
    }