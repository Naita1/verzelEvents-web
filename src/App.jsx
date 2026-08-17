import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EventDetail from "./pages/EventDetail";
import Payment from "./pages/Payment";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/eventos/:id" element={<EventDetail />} />
        <Route path="/pagamento" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;