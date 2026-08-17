import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EventDetail from "./pages/EventDetail";
import Payment from "./pages/Payment";
import MyTickets from "./pages/MyTickets";
import Portaria from "./pages/Portaria";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />    
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos/:id" element={<EventDetail />} />

          <Route
            path="/pagamento"
            element={
              <ProtectedRoute rolesPermitidas={["CLIENTE"]}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-ingressos"
            element={
              <ProtectedRoute rolesPermitidas={["CLIENTE"]}>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portaria"
            element={
              <ProtectedRoute rolesPermitidas={["PORTARIA"]}>
                <Portaria />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;