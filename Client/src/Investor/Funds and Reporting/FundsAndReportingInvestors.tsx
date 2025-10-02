import React, { useEffect, useState } from "react";
import { PiCoins, PiCoinsBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import BasicLoader from "../../Components/Loader/BasicLoader";
import { useAuth } from "../../Context/AuthContext";
import { useInvestorFunds } from "../../FundManager/hooks/useInvestorFunds";
import { useAppSelector } from "../../Redux/hooks";
import type { InvestorFundSummary } from "../../API/Endpoints/Funds/funds";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";

const FundsAndReportingInvestors: React.FC = () => {
  const [fundsData, setFundsData] = useState<InvestorFundSummary[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { isLoading } = useInvestorFunds();
  const funds = useAppSelector((state) => state.investorFunds.funds);

  useEffect(() => {
    if (funds && funds?.length > 0) {
      setFundsData(funds);
    }
  }, [isLoading, funds, user]);

  if (isLoading) {
    return <BasicLoader />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0 font-poppins">
          Funds
        </h1>
      </div>

      {/* Content Section - Fund Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12  xl:gap-8 2xl:gap-16 pt-4 2xl:mr-32 xl:mr-0  h-full">
        {fundsData.length > 0 ? (
          <>
            {fundsData?.map((fund) => (
              <div key={fund.id} className="relative mt-8 h-full">
                {/* Circular Icon positioned at top-left */}
                <div className="absolute -top-8 left-6 w-16 h-16 bg-white rounded-full border-2 border-theme-sidebar-accent flex items-center justify-center z-10 ">
                  <PiCoinsBold
                    className="text-theme-sidebar-accent "
                    size={28}
                  />
                </div>

                {/* Card */}
                <div className=" rounded-3xl border-2 border-theme-sidebar-accent p-6 pt-8 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col justify-between">
                  {/* Card Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-base lg:text-xl font-poppins font-medium text-theme-primary-text">
                      {fund.name}
                    </h2>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 mb-8">
                    {/* <div className="flex items-start gap-3">
                      <div className="min-w-[20px]">
                        <img src="/assets/projectName.png" alt="project icon" />
                      </div>
                      <span className="text-sm lg:text-base font-medium text-theme-secondary-text">
                        {fund.fundType}
                      </span>
                    </div> */}

                    <div className="flex items-start gap-3 ">
                      <div className="min-w-[20px]">
                        <img
                          src="/assets/description.png"
                          alt="description icon"
                        />
                      </div>
                      <span className="text-sm lg:text-base font-medium text-theme-secondary-text">
                        {fund.fundDescription}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Separator */}
                  <div className="border-t border-theme-sidebar-accent mb-8"></div>

                  {/* Fund Statistics */}
                  <div className="space-y-4 mb-8">

                    <div className="flex justify-between items-center">
                      <span className="text-sm lg:text-base font-medium text-gray-700">
                        Date Created
                      </span>
                      <span className="text-sm lg:text-base font-semibold text-gray-800">
                        {/* {fund.createdAt} */}
                        {formatDateToDDMMYYYY(fund?.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => {
                      navigate(`../project/${fund.id}`);
                    }}
                    className="w-full bg-theme-sidebar-accent text-white py-3 px-4 rounded-2xl text-sm lg:text-base font-medium transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 flex items-center justify-center h-full">
            <div className="text-center flex flex-col items-center justify-center h-full">
              <PiCoins className="text-6xl text-theme-secondary-text mb-4 " />
              <p className="text-lg text-theme-secondary-text">
                No funds available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundsAndReportingInvestors;
