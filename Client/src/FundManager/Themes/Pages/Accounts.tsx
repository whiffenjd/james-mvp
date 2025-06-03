import React from "react";

const Accounts: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[95vh] px-6 py-8 bg-theme-secondary-text">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Account Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Account Balance
          </h2>
          <p className="text-gray-600">Your current balance is $1,250.00</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Recent Transactions
          </h2>
          <p className="text-gray-600">You have 5 recent transactions.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Account Settings
          </h2>
          <p className="text-gray-600">
            Manage your profile, security, and preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
