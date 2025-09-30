import { useState } from "react";
import { ChevronDown } from "lucide-react"; // icon (comes from lucide-react)

const faqs = [
  {
    question: "What is WaBoss?",
    answer:
      "WaBoss is a platform where you can earn money by monetizing your WhatsApp or doing micro tasks. Just connect your WhatsApp, and you’ll get paid every time your number is used for sending OTPs, marketing messages, or promo status updates.",
  },
  {
    question: "How do I earn with WaBoss?",
    answer:
      "Every time your WhatsApp sends a message through our system (like OTP or marketing messages), you earn Rp.30 per message. You can track your earnings directly from the dashboard.",
  },
  {
    question: "Where does the money come from?",
    answer:
      "Our partner platform, Maxyprime.com, provides affordable WhatsApp messaging for businesses. They share revenue with WaBoss users whose numbers are being used to send messages.",
  },
  {
    question: "Is it safe and legal?",
    answer:
      "Yes. WaBoss does not allow any activities that break Indonesian law or ITE regulations. No political campaigns, gambling promotion, spam, or vulgar content are allowed.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "You can withdraw your balance into real cash through the withdrawal feature on your dashboard. Just follow the instructions there.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-galindo text-center text-green-600 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl shadow-sm"
          >
            <button
              className="flex items-center justify-between w-full p-4 text-left font-medium text-white"
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
              <div className="p-4 text-white font-sans rounded-b-xl">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
