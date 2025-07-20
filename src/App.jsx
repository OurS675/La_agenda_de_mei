import React, { useState, useEffect } from "react";
import './App.css';
import Swal from 'sweetalert2';

const CLIENTE_PASSWORD = "mei2024"; // Cambia esta contraseña si lo deseas

function App() {
  const [section, setSection] = useState('avances');
  const [isAuth, setIsAuth] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false);

  useEffect(() => {
    // Mantener autenticación tras recarga
    const auth = localStorage.getItem('mei-auth');
    const visitor = localStorage.getItem('mei-visitor');
    if (auth === 'true') setIsAuth(true);
    if (visitor === 'true') setIsVisitor(true);
  }, []);

  const handleLogin = async (password) => {
    if (password === CLIENTE_PASSWORD) {
      setIsAuth(true);
      setIsVisitor(false);
      localStorage.setItem('mei-auth', 'true');
      localStorage.removeItem('mei-visitor');
    } else if (password === 'VISITANTE') {
      setIsVisitor(true);
      setIsAuth(false);
      localStorage.setItem('mei-visitor', 'true');
      localStorage.removeItem('mei-auth');
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Contraseña incorrecta',
        text: 'Por favor, intenta de nuevo.',
        confirmButtonColor: '#a77ff2',
      });
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    setIsVisitor(false);
    localStorage.removeItem('mei-auth');
    localStorage.removeItem('mei-visitor');
  };

  return (
    <div className="mei-container">
      <header className="mei-header">
        <h1>La Agenda de Mei</h1>
        <nav>
          <button className={section === 'avances' ? 'active' : ''} onClick={() => setSection('avances')}>Avances & Proyectos</button>
          <button className={section === 'cliente' ? 'active' : ''} onClick={() => setSection('cliente')}>Sobre el Cliente</button>
        </nav>
        {(isAuth || isVisitor) && <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>}
      </header>
      <main>
        {section === 'avances' && <Avances isAuth={isAuth} isVisitor={isVisitor} onLogin={handleLogin} />}
        {section === 'cliente' && <Cliente />}
      </main>
      <footer className="mei-footer">
        <span>© {new Date().getFullYear()} La Agenda de Mei</span>
      </footer>
    </div>
  );
}

function Avances({ isAuth, isVisitor, onLogin }) {
  if (!isAuth && !isVisitor) {
    return (
      <section className="mei-section">
        <h2>Avances, Proyectos y Tutoriales</h2>
        <p>Sube tus avances de historia, proyectos creativos o tutoriales de diseño y dibujo aquí.</p>
        <LoginForm onLogin={onLogin} />
        <VistaPreviaReciente />
      </section>
    );
  }
  return (
    <section className="mei-section">
      <h2>Avances, Proyectos y Tutoriales</h2>
      <p>Sube tus avances de historia, proyectos creativos o tutoriales de diseño y dibujo aquí.</p>
      {isAuth && <UploadForm />}
      <AvancesList isAuth={isAuth} />
      {isVisitor && <p className="mei-avances-visitante">Estás en modo visitante. Solo puedes observar los avances.</p>}
    </section>
  );
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
    setPassword("");
  };
  return (
    <form className="mei-upload-form" onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Contraseña del cliente"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Entrar como cliente</button>
      <button type="button" onClick={() => onLogin("VISITANTE")} style={{background:'#c7eaff',color:'#fff'}}>Entrar como visitante</button>
    </form>
  );
}

function UploadForm() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tipo, setTipo] = useState("Dibujo");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecciona un archivo',
        confirmButtonColor: '#a77ff2',
      });
      return;
    }
    if (!title.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Agrega un título',
        confirmButtonColor: '#a77ff2',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      const avances = JSON.parse(localStorage.getItem('mei-avances') || '[]');
      avances.unshift({
        title,
        desc,
        tipo,
        fileName: file.name,
        fileData: ev.target.result,
        date: new Date().toISOString()
      });
      localStorage.setItem('mei-avances', JSON.stringify(avances));
      setFile(null);
      setTitle("");
      setDesc("");
      setTipo("Dibujo");
      window.dispatchEvent(new Event('mei-avances-updated'));
      Swal.fire({
        icon: 'success',
        title: '¡Avance subido!',
        showConfirmButton: false,
        timer: 1200,
        background: '#fff8f0',
        color: '#a77ff2',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form className="mei-upload-form" onSubmit={handleSubmit}>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Descripción (opcional)" value={desc} onChange={e => setDesc(e.target.value)} />
      <select value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="Dibujo">Dibujo</option>
        <option value="Historia">Historia</option>
        <option value="Tutorial">Tutorial</option>
      </select>
      <button type="submit">Subir</button>
    </form>
  );
}

function AvancesList({ isAuth }) {
  const [avances, setAvances] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filtro, setFiltro] = useState('Todos');
  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem('mei-avances') || '[]');
      setAvances(data);
    };
    load();
    window.addEventListener('mei-avances-updated', load);
    return () => window.removeEventListener('mei-avances-updated', load);
  }, []);

  const handleDelete = async (idx) => {
    const result = await Swal.fire({
      title: '¿Seguro que deseas eliminar este avance?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a77ff2',
      cancelButtonColor: '#f7d6e0',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    const data = JSON.parse(localStorage.getItem('mei-avances') || '[]');
    data.splice(idx, 1);
    localStorage.setItem('mei-avances', JSON.stringify(data));
    setAvances(data);
    window.dispatchEvent(new Event('mei-avances-updated'));
    await Swal.fire({
      icon: 'success',
      title: 'Avance eliminado',
      showConfirmButton: false,
      timer: 1000,
      background: '#fff8f0',
      color: '#a77ff2',
    });
  };

  const handleView = (avance) => {
    if (avance.fileData.startsWith('data:image')) {
      Swal.fire({
        title: avance.title || 'Sin título',
        html:
          `<div style='margin-bottom:1.2em;'>` +
          (avance.desc ? `<div style='font-size:1.08em;margin-bottom:0.7em;'>${avance.desc}</div>` : '') +
          `<img src='${avance.fileData}' alt='${avance.title || avance.desc}' style='display:block;margin:0 auto;max-width:98vw;max-height:80vh;border-radius:16px;box-shadow:0 2px 18px #c7eaff77;' />` +
          `<div style='margin-top:0.7em;font-size:0.98em;color:#888;'>${new Date(avance.date).toLocaleString()}</div>` +
          `<a href='${avance.fileData}' download='${avance.fileName}' style='display:inline-block;margin-top:1.2em;background:#a77ff2;color:#fff;padding:0.6em 1.5em;border-radius:12px;text-decoration:none;font-size:1.08em;box-shadow:0 1px 4px #c7eaff44;'>Descargar imagen</a>` +
          `</div>`,
        showCloseButton: true,
        showConfirmButton: false,
        background: '#fff8f0',
        color: '#a77ff2',
        width: 'min(99vw, 900px)',
        customClass: {popup: 'mei-modal-swal'},
      });
    } else {
      Swal.fire({
        title: avance.title || 'Sin título',
        html:
          `<div style='margin-bottom:1.2em;'>` +
          (avance.desc ? `<div style='font-size:1.08em;margin-bottom:0.7em;'>${avance.desc}</div>` : '') +
          `<div style='margin-top:0.7em;font-size:0.98em;color:#888;'>${new Date(avance.date).toLocaleString()}</div>` +
          `<a href='${avance.fileData}' download='${avance.fileName}' style='display:inline-block;margin-top:1.2em;background:#a77ff2;color:#fff;padding:0.6em 1.5em;border-radius:12px;text-decoration:none;font-size:1.08em;box-shadow:0 1px 4px #c7eaff44;'>Descargar archivo</a>` +
          `</div>`,
        showCloseButton: true,
        showConfirmButton: false,
        background: '#fff8f0',
        color: '#a77ff2',
        width: 'min(99vw, 900px)',
        customClass: {popup: 'mei-modal-swal'},
      });
    }
  };

  if (avances.length === 0) return <p className="mei-avances-empty">No hay avances subidos aún.</p>;

  // Filtro por tipo
  const avancesFiltrados = filtro === 'Todos' ? avances : avances.filter(a => a.tipo === filtro);
  const avancesToShow = showAll ? avancesFiltrados : avancesFiltrados.slice(0, 3);

  return (
    <div>
      <div className="mei-filtro-avances">
        <label>Filtrar por: </label>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Dibujo">Dibujo</option>
          <option value="Historia">Historia</option>
          <option value="Tutorial">Tutorial</option>
        </select>
      </div>
      <div className="mei-avances-list">
        {avancesToShow.map((a, i) => (
          <div className="mei-avance-item" key={i}>
            <div className="mei-avance-file" style={{cursor:'pointer'}} onClick={() => handleView(a)}>
              {a.fileData.startsWith('data:image') ? (
                <img src={a.fileData} alt={a.title || a.desc} />
              ) : (
                <a href={a.fileData} download={a.fileName} onClick={e => {e.preventDefault(); handleView(a);}}>Descargar archivo</a>
              )}
            </div>
            <div className="mei-avance-desc">
              <strong>{a.title || 'Sin título'}</strong>
              {a.desc && <div>{a.desc}</div>}
              <div className="mei-avance-date">{new Date(a.date).toLocaleString()}</div>
              <div className="mei-avance-tipo">{a.tipo}</div>
            </div>
            {isAuth && (
              <button className="mei-delete-btn" onClick={() => handleDelete(i)} title="Eliminar avance">🗑️</button>
            )}
          </div>
        ))}
      </div>
      {avancesFiltrados.length > 3 && !showAll && (
        <div style={{textAlign:'center', marginTop:'1.5rem'}}>
          <button className="mei-ver-todos-btn" onClick={() => setShowAll(true)}>Ver todos</button>
        </div>
      )}
      {showAll && avancesFiltrados.length > 3 && (
        <div style={{textAlign:'center', marginTop:'1.2rem'}}>
          <button className="mei-ver-todos-btn" onClick={() => setShowAll(false)}>Mostrar menos</button>
        </div>
      )}
    </div>
  );
}

function VistaPreviaReciente() {
  const [avance, setAvance] = useState(null);
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('mei-avances') || '[]');
    setAvance(data[0] || null);
    const load = () => {
      const data = JSON.parse(localStorage.getItem('mei-avances') || '[]');
      setAvance(data[0] || null);
    };
    window.addEventListener('mei-avances-updated', load);
    return () => window.removeEventListener('mei-avances-updated', load);
  }, []);

  if (!avance) return null;
  return (
    <div className="mei-vista-previa-reciente">
      <h3>Lo más reciente de la agenda de mei</h3>
      <div className="mei-avance-item" style={{marginTop: '1rem'}}>
        <div className="mei-avance-file" style={{cursor:'pointer'}} onClick={() => handleViewVista(avance)}>
          {avance.fileData.startsWith('data:image') ? (
            <img src={avance.fileData} alt={avance.title || avance.desc} />
          ) : (
            <a href={avance.fileData} download={avance.fileName} onClick={e => {e.preventDefault(); handleViewVista(avance);}}>Descargar archivo</a>
          )}
        </div>
        <div className="mei-avance-desc">
          <strong>{avance.title || 'Sin título'}</strong>
          {avance.desc && <div>{avance.desc}</div>}
          <div className="mei-avance-date">{new Date(avance.date).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function handleViewVista(avance) {
  if (avance.fileData.startsWith('data:image')) {
    Swal.fire({
      title: avance.title || 'Sin título',
      html:
        `<div style='margin-bottom:1.2em;'>` +
        (avance.desc ? `<div style='font-size:1.08em;margin-bottom:0.7em;'>${avance.desc}</div>` : '') +
        `<img src='${avance.fileData}' alt='${avance.title || avance.desc}' style='display:block;margin:0 auto;max-width:98vw;max-height:80vh;border-radius:16px;box-shadow:0 2px 18px #c7eaff77;' />` +
        `<div style='margin-top:0.7em;font-size:0.98em;color:#888;'>${new Date(avance.date).toLocaleString()}</div>` +
        `<a href='${avance.fileData}' download='${avance.fileName}' style='display:inline-block;margin-top:1.2em;background:#a77ff2;color:#fff;padding:0.6em 1.5em;border-radius:12px;text-decoration:none;font-size:1.08em;box-shadow:0 1px 4px #c7eaff44;'>Descargar imagen</a>` +
        `</div>`,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff8f0',
      color: '#a77ff2',
      width: 'min(99vw, 900px)',
      customClass: {popup: 'mei-modal-swal'},
    });
  } else {
    Swal.fire({
      title: avance.title || 'Sin título',
      html:
        `<div style='margin-bottom:1.2em;'>` +
        (avance.desc ? `<div style='font-size:1.08em;margin-bottom:0.7em;'>${avance.desc}</div>` : '') +
        `<div style='margin-top:0.7em;font-size:0.98em;color:#888;'>${new Date(avance.date).toLocaleString()}</div>` +
        `<a href='${avance.fileData}' download='${avance.fileName}' style='display:inline-block;margin-top:1.2em;background:#a77ff2;color:#fff;padding:0.6em 1.5em;border-radius:12px;text-decoration:none;font-size:1.08em;box-shadow:0 1px 4px #c7eaff44;'>Descargar archivo</a>` +
        `</div>`,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff8f0',
      color: '#a77ff2',
      width: 'min(99vw, 900px)',
      customClass: {popup: 'mei-modal-swal'},
    });
  }
}

function Cliente() {
  return (
    <section className="mei-section">
      <h2>Sobre el Cliente</h2>
      <div className="mei-cliente-info">
        <p><strong>Nombre:</strong> Mei</p>
        <p><strong>Descripción:</strong> Apasionada por el diseño, el dibujo y la creatividad. Comparte sus proyectos y tutoriales para inspirar a otros.</p>
      </div>
    </section>
  );
}

export default App; 