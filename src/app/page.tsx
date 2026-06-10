import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-20 bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
        
        {/* Playful Badge */}
        <div className="inline-block px-4 py-1.5 font-bold border-2 border-black rounded-full bg-[#FFD166] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2">
          🎉 Welcome to the Skill Economy
        </div>

        {/* Hero Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-black leading-[1.1]">
          Trade What You <span className="text-[#EF476F]">Know</span>.<br/>
          Learn What You <span className="underline decoration-8 decoration-[#118AB2] underline-offset-8">Don't</span>.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-xl font-medium text-gray-700 mt-4 leading-relaxed">
          Strade is the ultimate marketplace for exchanging abilities. Match with users to teach your expertise, coordinate schedules, and chat to start learning. No money involved—just pure knowledge sharing.
        </p>

        {/* CTA Buttons Pointing to Real Routes */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8">
          <Link
            href="/skill"
            className="px-8 py-4 text-lg font-black text-black bg-[#06D6A0] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl"
          >
            Find a Skill Match
          </Link>
          <Link
            href="/schedules"
            className="px-8 py-4 text-lg font-black text-black bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl"
          >
            View Schedules
          </Link>
        </div>

        {/* Example Skill Tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 max-w-3xl">
          {['🎨 Graphic Design', '💻 Web Development', '🎸 Guitar Lessons', '🗣️ Spanish Tutoring', '🍳 Culinary Arts', '📈 Marketing'].map((skill) => (
            <span 
              key={skill} 
              className="px-4 py-2 text-sm font-bold border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-[#FFD166] hover:-translate-y-0.5 transition-all cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>

      </section>
    </div>
  );
}