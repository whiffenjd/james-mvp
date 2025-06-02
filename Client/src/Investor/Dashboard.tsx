import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const InvestorDashboard = () => {
  const { user } = useAuth();
  // const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // const handleLogout = () => {
  //   logout(setIsLoggingOut); // pass setter directly if logout expects it
  // };

  return (
    <div className=" flex w-full overflow-auto">
      {/* <Sidebar /> */}
      <div className="flex flex-col w-full  ">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome, {user.name}!
                </h2>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Account Information
                    </h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.name}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.email}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Role
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.role}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Account status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.isActive ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Email verification
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user.isEmailVerified ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Not Verified
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Joined on
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>{" "}
      </div>
    </div>
  );
};

export default InvestorDashboard;
