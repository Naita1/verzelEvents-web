import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import EventDetail from "./pages/EventDetail";
import Payment from "./pages/Payment";
import Portaria from "./pages/Portaria";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/eventos/:id" element={<EventDetail />} />
        <Route path="/pagamento" element={<Payment />} />
        <Route path="/meus-ingressos" element={<MyTickets />} />
        <Route path="/portaria" element={<Portaria />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;