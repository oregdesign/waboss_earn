import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "Ubah WhatsApp Jadi Cuan !",
    text: "WaBoss bikin WhatsApp kamu bisa jadi mesin penghasil uang. Cukup hubungkan akun WhatsApp kamu!",
    bg: "bg-[url('/src/assets/mslide1.png')] bg-cover h-[200px] w-full rounded-xl",
  },
  {
    id: 2,
    title: "Link Your WhatsApp 📱",
    text: "Quickly connect multiple numbers and track them in real-time.",
    bg: "bg-gradient-to-r from-[#272f6d] to-[#3f4dd2]",
  },
  {
    id: 3,
    title: "Grow Smarter 🌱",
    text: "Send messages, check earnings, and scale without hassle.",
    bg: "bg-gradient-to-r from-[#3f4dd2] to-[#191e45]",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  const nextSlide = () =>
    setCurrent(current === slides.length - 1 ? 0 : current + 1);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 flex flex-col items-center transition-transform duration-700 ${
            index === current ? "translate-x-0" : "translate-x-full"
          } ${slide.bg}`}
        >
          <h2 className="text-2xl md:text-3xl font-galindo mt-4 mb-4 ml-14 text-right text-white">{slide.title}</h2>
          <p className="ml-32 pr-6 font-sans text-right text-sm md:text-lg opacity-90 text-white">{slide.text}</p>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/70"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/70"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
