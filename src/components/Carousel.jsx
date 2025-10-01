import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "Ubah WhatsApp Jadi Cuan !",
    text: "WaBoss bikin WhatsApp kamu bisa jadi mesin penghasil uang. Cukup hubungkan akun WhatsApp kamu, langsung bisa mulai dapet penghasilan tanpa perlu jualan atau cari-cari klien. WhatsApp kamu yang kerja, kamu tinggal nikmatin hasilnya.",
    bg: "bg-[url('/src/assets/slide1.svg')] bg-no-repeat",
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
          <h2 className="quicksand-title text-2xl md:text-3xl mb-4 text-right text-green-600">{slide.title}</h2>
          <p className="font-sans text-center text-sm md:text-lg opacity-90 text-white">{slide.text}</p>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 bg-black/10 text-white p-2 rounded-full hover:bg-black/70"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 bg-black/10 text-white p-2 rounded-full hover:bg-black/70"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 px-2 mx-2 rounded-full cursor-pointer ${
              current === index ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
