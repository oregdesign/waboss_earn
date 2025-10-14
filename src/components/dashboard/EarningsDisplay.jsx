const EarningsDisplay = ({ earnings, earningsLoading }) => {
  return (
    <div className="bg-[#191e45] row-span-2 col-start-4 row-start-1 rounded-xl pt-6">
      {/* Your earnings and total sent JSX here... */}
      <h2 className="text-xl font-futuristic font-bold text-neonGreen mb-4 ml-4"></h2>
      <div className="w-full">
      <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Total Penghasilan</p>
      <p className="text-5xl font-mono font-bold text-green-600 mb-4 ml-4 pb-4">
        {earningsLoading
          ? "..."
          : new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(earnings.total_earnings || 0)}
      </p>
      </div>
      <div className="w-full">
      <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Jumlah Pesan Terkirim</p>
      <p className="text-4xl font-mono font-bold text-[#f18c27] mb-4 ml-4 pb-4">
        {earningsLoading ? "..." : `${earnings.total_sent || 0}`}
      </p>
      </div>
    </div>
  );
};

export default EarningsDisplay;