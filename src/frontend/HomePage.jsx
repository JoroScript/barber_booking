import HeroComponent from "./HeroComponent";

   
   
export default function HomePage()
    {
     return   <main>
      <HeroComponent />
      <section className="mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-white">Our Services</h2>
      </section>
    </main>
    }