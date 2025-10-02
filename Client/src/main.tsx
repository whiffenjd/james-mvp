// main.tsx or index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "../Store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { ThemeLoader, ThemeProvider } from "./Context/ThemeContext";
import ThemeContainer from "./FundManager/Themes/Components/ThemeContainer";
import { AuthProvider } from "./Context/AuthContext";
import { BrowserRouter } from "react-router-dom";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    {/* <PersistGate loading={null} persistor={persistor}> */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ThemeLoader>
              <ThemeContainer>
                <App />{" "}
              </ThemeContainer>
            </ThemeLoader>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    {/* </PersistGate> */}
  </Provider>
);
