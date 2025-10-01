import { useState } from "react";
import { ChevronDown } from "lucide-react"; // icon (comes from lucide-react)

const faqs = [
  {
    question: "Apa itu Waboss?",
    answer:
      "WaBoss adalah web app tempat kamu bisa dapetin penghasilan tambahan dari WhatsApp.",
  },
  {
    question: "Bagaimana cara dapet duit di WaBoss?",
    answer:
      "Setiap kali WhatsApp kamu sukses ngirim pesan (kayak OTP atau pesan promo), kamu dapet Rp.30 per pesan. Semakin banyak tugas yang selesai, semakin besar juga penghasilan kamu.",
  },
  {
    question: "Apa saya perlu membalas chat atau ngobrol sama customer?",
    answer:
      "Tidak perlu. Semua berjalan otomatis. Kamu tidak perlu membalas siapa pun — WaBoss yang urus kirimannya.",
  },
  {
    question: "Apakah Aman menggunakan webapp WaBoss?",
    answer:
      "Aman. WaBoss cuma pake nomor WhatsApp kamu buat ngirim tugas yang udah disetujui. Kita nggak pernah ngakses chat pribadi atau kontak kamu.",
  },
  {
    question: "Bagaimana cara tarik saldo?",
    answer:
      "Saldo bisa ditarik kapan aja ke rekening bank lokal kamu. Minimum penarikan saldo adalah Rp.50.000",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl quicksand-title text-center text-green-600 mb-6">
        Pertanyaan Umum
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl shadow-sm bg-linear-45 from-[#272f6d] to-[#191e45]"
          >
            <button
              className="cursor-pointer flex items-center justify-between w-full p-4 text-left quicksand-title text-white"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <ChevronDown
                className={`h-5 w-5 transform transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="text-white quicksand-content rounded-b-xl m-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
