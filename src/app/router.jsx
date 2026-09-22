import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
const Home = React.lazy(() => import("../pages/Home"));
const Login = React.lazy(() => import("../pages/Login"));
const Portaria = React.lazy(() => import("../pages/Portaria"));
const EventDetail = React.lazy(() => import("../pages/EventDetail"));
const Organizador = React.lazy(() => import("../pages/Organizador"));
const PaymentPage = React.lazy(() => import("../features/checkout/PaymentPage"));
const MyTicketsPage = React.lazy(() => import("../features/tickets/MyTicketsPage"));
const SharedTicketPage = React.lazy(() => import("../features/tickets/SharedTicketPage"));
const CreateStaffPage = React.lazy(() => import("../features/staff/CreateStaffPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="font-sans text-white/50 text-xs tracking-widest uppercase">
        Carregando página...
      </p>
    </div>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/eventos/:id" element={<EventDetail />} />
            <Route path="/ingressos/compartilhado/:token" element={<SharedTicketPage />} />
            <Route
              path="/pagamento"
              element={
                <ProtectedRoute rolesPermitidas={["CLIENTE"]}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-ingressos"
              element={
                <ProtectedRoute rolesPermitidas={["CLIENTE"]}>
                  <MyTicketsPage />
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
            <Route
              path="/organizador/staff/novo"
              element={
                <ProtectedRoute rolesPermitidas={["ORGANIZADOR"]}>
                  <CreateStaffPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}