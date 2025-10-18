import Lottie from "lottie-react";
import SandyLoading from "../../assets/SandyLoading.json";

function LoadingScreen({
  message = "Please wait, processing your request...",
  size = 160,
}) {
  return (
    <div className="flex flex-col items-center justify-center h-72">
      <div style={{ width: size, height: size }}>
        <Lottie animationData={SandyLoading} loop autoplay />
      </div>
      <p className="mt-4 text-gray-200 font-futuristic text-sm animate-pulse drop-shadow-[0_0_5px_#22c55e]">
        {message}
      </p>
    </div>
  );
}

export default LoadingScreen;
