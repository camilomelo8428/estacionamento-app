import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import Login from '../pages/Login';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Mensalistas from '../pages/Mensalistas';
import DadosEmpresa from '../pages/DadosEmpresa';
import Funcionarios from '../pages/Funcionarios';
import GerenciarVagas from '../pages/GerenciarVagas';
import Tickets from '../pages/Tickets';
import Relatorios from '../pages/Relatorios';
import Configuracoes from '../pages/Configuracoes';
import Mensalidades from '../pages/Mensalidades';
import Categorias from '../pages/Categorias';
import TicketsMensalistas from '../pages/TicketsMensalistas';
import StatusVagas from '../pages/StatusVagas';

export function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/status-vagas" element={<StatusVagas />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Home />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/mensalistas"
        element={
          <PrivateRoute>
            <Layout>
              <Mensalistas />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/mensalidades"
        element={
          <PrivateRoute>
            <Layout>
              <Mensalidades />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <Categorias />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dados-empresa"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <DadosEmpresa />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/funcionarios"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <Funcionarios />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/gerenciar"
        element={
          <PrivateRoute>
            <Layout>
              <GerenciarVagas />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <Layout>
              <Tickets />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets-mensalistas"
        element={
          <PrivateRoute>
            <Layout>
              <TicketsMensalistas />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <Relatorios />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <PrivateRoute adminOnly>
            <Layout>
              <Configuracoes />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/status-vagas" element={<StatusVagas />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 