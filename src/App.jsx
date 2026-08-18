import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import Portaria from "./pages/Portaria";
import MyTickets from "./pages/MyTickets";
import EventDetail from "./pages/EventDetail";
import Organizador from "./pages/Organizador";
import SharedTicket from "./pages/SharedTicket";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />    
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos/:id" element={<EventDetail />} />
          <Route path="/ingressos/compartilhado/:token" element={<SharedTicket />} />
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
          <Route
            path="/organizador"
            element={
              <ProtectedRoute rolesPermitidas={["ORGANIZADOR"]}>
                <Organizador />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;