import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import NotFound from "./pages/NotFound";
import ListingCreate from "./pages/ListingCreate";
import BookDetail from "./pages/BookDetail";
import Donate from "./pages/Donate";
import EmailList from "./pages/EmailList";

type AppRouterProps = {
  children?: React.ReactNode;
};
export default function AppRouter({ children }: AppRouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/listing">
            <Route index element={<ListingCreate />} />
            <Route path="/listing/:address" element={<BookDetail />} />
          </Route>
          <Route path="/donate" element={<Donate />} />
          <Route path="/emailList" element={<EmailList />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
