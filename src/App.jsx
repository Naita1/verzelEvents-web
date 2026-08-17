import { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get('/eventos')
      .then((response) => {
        console.log('Eventos recebidos:', response.data);
        setEventos(response.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar eventos:', err);
        setErro(err.message || 'Erro de conexão');
      });
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-white p-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-4">Teste de Conexão Backend</h1>
      {erro && <p className="text-red-500">Erro: {erro}</p>}
      <pre className="bg-bg-card p-4 rounded border border-gray-800 overflow-auto">
        {JSON.stringify(eventos, null, 2)}
      </pre>
    </div>
  );
}

export default App;