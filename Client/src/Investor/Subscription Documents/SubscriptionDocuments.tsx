import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useInvestorFunds } from "../../FundManager/hooks/useInvestorFunds";
import { useAppSelector } from "../../Redux/hooks";
import CustomTable from "../../Components/Table/CustomTable";

type Props = {};

const SubscriptionDocuments = (props: Props) => {
  const [fundsData, setFundsData] = useState<Partial<FormData[]>>([]);
  const { user } = useAuth();

  const { isLoading, error, refreshInvestorFunds } = useInvestorFunds();
  const funds = useAppSelector((state) => state.investorFunds.funds);

  useEffect(() => {
    console.log("Funds data:", funds);
    if (funds && funds?.length > 0) {
      setFundsData(funds);
    }
    console.log("fundsData:", fundsData);
  }, [isLoading, funds, user]);

  console.log("Funds from Redux:", fundsData);
  const data = [
    {
      name: "Project Alpha",
      fundSize: "$20,000",
      investors: [
        {
          status: false,
          documentUrl:
            "https://jameswhitelabel.s3.eu-north-1.amazonaws.com/funds/1750858340584-Testing%20PDF.pdf",
        },
      ],
    },
    {
      name: "Project Beta",
      fundSize: "$35,000",
      investors: [
        {
          status: true,
          documentUrl:
            "https://jameswhitelabel.s3.eu-north-1.amazonaws.com/funds/1750858340584-Testing%20PDF.pdf",
        },
      ],
    },
  ];

  const columns = [
    {
      title: "Project Name",
      key: "name",
    },
    {
      title: "Total Funding Amount",
      key: "fundSize",
    },
    {
      title: "Status",
      key: "status",
      render: (row) => (
        <span>{row.investors[0].status ? "Signed" : "Pending"}</span>
      ),
    },
    {
      title: "Details",
      key: "action",
      render: (row) =>
        row.investors[0].status === true ? (
          <button className="bg-theme-sidebar-accent text-white  px-4 py-3 rounded-[10px] cursor-default min-w-[130px]">
            Signed
          </button>
        ) : (
          <button className="bg-[#9E9E9E]  text-white  px-4 py-3 rounded-[10px] cursor-default min-w-[130px]">
            Sign Now
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Funding List
        </h1>
      </div>
      <CustomTable columns={columns} data={data} />;
    </div>
  );
};

export default SubscriptionDocuments;
