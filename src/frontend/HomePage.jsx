import HeroComponent from "./HeroComponent";
import "./styles/animations.css";
import BusinessCard from "./components/common/BusinessCard";   
import DiagonalCatcher from "./components/common/DiagonalCatcher/DiagonalCatcher";
import FadeIn from "./components/common/FadeIn";
export default function HomePage()
    {
     return   <main className="py-12 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <HeroComponent />
      <DiagonalCatcher/>
      <h1 className="text-3xl my-36 font-black text-center">ЗАПОЗНАЙ СЕ С БРЪСНАРИТЕ</h1>
      <div className="container  my-36 mx-auto px-12">
        <div className="flex flex-wrap md:justify-center items-stretch gap-8 md:gap-12">
          <FadeIn duration={600}>
            <BusinessCard name={"Мирослав"} info={"Младши бръснар"} specific={"Специалист в класически подстригвания"}/>
          </FadeIn>
          <FadeIn duration={800}>
            <BusinessCard name={"Радослав"} info={"Старши бръснар"} specific={"Специалист в модерни прически"}/>
          </FadeIn>
          <FadeIn duration={1000}>
            <BusinessCard name={"Симеон"} info={"Опитен бръснар"} specific={"Майстор на бради и фейд подстригвания"}/>
          </FadeIn>
          
        </div>
      </div>
    </main>
    }