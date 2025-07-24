import React, { useEffect, useState } from 'react';
import Logo from '../public/Logo.png';
// Modal de imagen grande reutilizable
function ImagenModal({ url, alt, onClose }) {
  if (!url) return null;
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [start, setStart] = React.useState({ x: 0, y: 0 });
  const [imgStart, setImgStart] = React.useState({ x: 0, y: 0 });
  const imgRef = React.useRef(null);

  // Usar clase CSS para bloquear el scroll del body
  React.useEffect(() => {
    if (url) {
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [url]);

  // Reset zoom/offset when url changes
  React.useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [url]);

  // Zoom con rueda del mouse
  const handleWheel = (e) => {
    e.preventDefault();
    let newScale = scale + (e.deltaY < 0 ? 0.2 : -0.2);
    newScale = Math.max(1, Math.min(newScale, 5));
    setScale(newScale);
  };

  // Arrastrar imagen (pan)
  const handleMouseDown = (e) => {
    if (scale === 1) return;
    e.preventDefault();
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    setImgStart({ ...offset });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({
      x: imgStart.x + (e.clientX - start.x),
      y: imgStart.y + (e.clientY - start.y),
    });
  };
  const handleMouseUp = () => setDragging(false);

  // Touch events para móvil
  const handleTouchStart = (e) => {
    if (scale === 1) return;
    if (e.touches.length === 1) {
      setDragging(true);
      setStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setImgStart({ ...offset });
    }
  };
  const handleTouchMove = (e) => {
    if (!dragging || e.touches.length !== 1) return;
    setOffset({
      x: imgStart.x + (e.touches[0].clientX - start.x),
      y: imgStart.y + (e.touches[0].clientY - start.y),
    });
  };
  const handleTouchEnd = () => setDragging(false);

  // Doble click/tap para resetear zoom
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    } else {
      window.open(url, '_blank');
    }
  };

  // Botones de zoom
  const zoomIn = () => setScale(s => Math.min(s + 0.2, 5));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 1));
  const resetZoom = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 2000,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(40,30,60,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: dragging ? 'none' : 'auto',
        overflow: 'auto',
      }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        ref={imgRef}
        src={url}
        alt={alt}
        style={{
          maxWidth: scale === 1 ? '90vw' : 'none',
          maxHeight: scale === 1 ? '90vh' : 'none',
          width: 'auto',
          height: 'auto',
          borderRadius: 18,
          boxShadow: '0 8px 32px #a77ff299',
          cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
          background: '#fff',
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)` ,
          transition: dragging ? 'none' : 'transform 0.2s',
          touchAction: 'none',
          margin: 'auto',
          display: 'block',
        }}
        onClick={e => { e.stopPropagation(); if (scale === 1) setScale(2); }}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        draggable={false}
        title={scale > 1 ? 'Arrastra para mover. Doble click para resetear.' : 'Haz click o usa la rueda para ampliar'}
      />
      {/* Controles de zoom */}
      <div style={{ position: 'fixed', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 2100 }}>
        <button onClick={e => { e.stopPropagation(); zoomOut(); }} style={{ fontSize: 24, padding: '6px 16px', borderRadius: 16, border: 'none', background: '#fff', color: '#a77ff2', fontWeight: 700, boxShadow: '0 2px 8px #a77ff244', cursor: 'pointer' }}>−</button>
        <button onClick={e => { e.stopPropagation(); resetZoom(); }} style={{ fontSize: 18, padding: '6px 16px', borderRadius: 16, border: 'none', background: '#fff', color: '#a77ff2', fontWeight: 700, boxShadow: '0 2px 8px #a77ff244', cursor: 'pointer' }}>Reset</button>
        <button onClick={e => { e.stopPropagation(); zoomIn(); }} style={{ fontSize: 24, padding: '6px 16px', borderRadius: 16, border: 'none', background: '#fff', color: '#a77ff2', fontWeight: 700, boxShadow: '0 2px 8px #a77ff244', cursor: 'pointer' }}>+</button>
      </div>
      <button onClick={onClose} style={{ position: 'fixed', top: 24, right: 32, background: '#fff', color: '#a77ff2', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 22, padding: '6px 18px', cursor: 'pointer', boxShadow: '0 2px 8px #a77ff244', zIndex: 2100 }}>✕</button>
    </div>
  );
}
import { supabase } from './supabaseClient'
import './App.css'
import './responsive.css'
import Swal from 'sweetalert2'

const CLIENTE_PASSWORD = 'Mafemape20251808'

function App() {
  const [imagenModal, setImagenModal] = useState({ url: null, alt: '' });
  const [vista, setVista] = useState('proyectos') // 'proyectos', 'avances' o 'cliente'
  // Scroll to top when changing main page (vista)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [vista]);
  // Asegura que la clase modal-open se quite siempre que el modal esté cerrado
  useEffect(() => {
    if (!imagenModal.url) {
      document.body.classList.remove('modal-open');
    }
  }, [imagenModal.url]);
  const [proyectos, setProyectos] = useState([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [clienteAuth, setClienteAuth] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginError, setLoginError] = useState(null)

  // Recargar proyectos al iniciar sesión del cliente
  useEffect(() => {
    if (clienteAuth) {
      obtenerProyectos();
    }
  }, [clienteAuth]);


  useEffect(() => {
    obtenerProyectos()
  }, [])

  async function obtenerProyectos() {
    setCargando(true)
    setError(null)
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    if (error) setError(error.message)
    else setProyectos(data)
    setCargando(false)
  }

  function irAAvances(proyecto) {
    setProyectoSeleccionado(proyecto)
    setVista('avances')
  }

  function volverAProyectos() {
    setVista('proyectos')
    setProyectoSeleccionado(null)
  }

  function handleClienteClick() {
    setVista('cliente')
  }

  function handleLogin(password) {
    if (password === CLIENTE_PASSWORD) {
      setClienteAuth(true)
      setShowLogin(false)
      setLoginError(null)
    } else {
      setLoginError('Contraseña incorrecta')
    }
  }

  function handleLogout() {
    setClienteAuth(false)
    setShowLogin(false)
    setLoginError(null)
  }

  function handleAvancesClick() {
    if (!proyectoSeleccionado && proyectos.length > 0) {
      setProyectoSeleccionado(proyectos[0]);
    }
    setVista('avances');
  }

  return (
    <div className="mei-container" style={{ minHeight: '100vh', background: '#f5f3fa' }}>
      <ImagenModal url={imagenModal.url} alt={imagenModal.alt} onClose={() => setImagenModal({ url: null, alt: '' })} />
      <header className="mei-header" style={{ boxShadow: '0 2px 8px #eee', marginBottom: 24, padding: '16px 0', background: '#fff', borderRadius: 0 }}>
        <div className="mei-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', padding: '0 16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img
              src={Logo}
              alt="Logo La Agenda de Mei"
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                boxShadow: '0 2px 8px #e5d8fa',
                background: '#fff',
                objectFit: 'contain',
                marginRight: 8,
              }}
            />
            <h1 style={{ fontSize: 28, color: '#a77ff2', margin: 0, letterSpacing: 1, flex: 1, minWidth: 180 }}>
              La Agenda de Mei
            </h1>
          </div>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={vista === 'proyectos' ? 'active' : ''} onClick={volverAProyectos} disabled={vista === 'proyectos'} style={{ minWidth: 110, textAlign: 'center', padding: '8px 0' }}>
              Proyectos
            </button>
            <button onClick={handleClienteClick} style={{ minWidth: 110, textAlign: 'center', padding: '8px 0' }}>
              Sobre mí
            </button>
            {!clienteAuth && (
              <button className="login-btn" onClick={() => setShowLogin(true)} style={{ minWidth: 110, background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', textAlign: 'center', fontWeight: 600, fontSize: 15 }}>
                Iniciar sesión
              </button>
            )}
            {clienteAuth && (
              <button className="logout-btn" onClick={handleLogout} style={{ minWidth: 130, background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', textAlign: 'center' }}>
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>
      <main>
        {showLogin && (
          <LoginModal onLogin={handleLogin} error={loginError} onClose={() => setShowLogin(false)} />
        )}
        {/* Mostrar proyectos y avances */}
        {vista === 'proyectos' ? (
          <VistaProyectos
            proyectos={proyectos}
            onAgregar={obtenerProyectos}
            onVerAvances={proy => {
              setProyectoSeleccionado(proy);
              setVista('avances');
            }}
            cargando={cargando}
            error={error}
            clienteAuth={clienteAuth}
          />
        ) : vista === 'avances' && proyectoSeleccionado ? (
          <VistaAvances
            proyecto={proyectoSeleccionado}
            onVolver={volverAProyectos}
            clienteAuth={clienteAuth}
          />
        ) : vista === 'cliente' ? (
          <VistaCliente onVolver={volverAProyectos} clienteAuth={clienteAuth} />
        ) : null}
      </main>
      <footer className="mei-footer">
        <span style={{ marginTop: 40, padding: '18px 0', color: '#a77ff2', textAlign: 'center', borderRadius: 0, fontWeight: 600, fontSize: 15, letterSpacing: 1 }}>© {new Date().getFullYear()} La Agenda de Mei</span>
      </footer>
    </div>
  )
// Apartado de información del cliente
function VistaCliente({ onVolver, clienteAuth }) {
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    imagen_url: '',
    acerca_de: '',
    redes: [], // [{ tipo: 'Instagram', url: '...' }, ...]
    // id: undefined (solo se agrega si existe en la base de datos)
  });
  const [nuevaRed, setNuevaRed] = useState({ tipo: '', url: '' });
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [archivoPreview, setArchivoPreview] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Cargar datos del cliente al montar
  useEffect(() => {
    async function fetchCliente() {
      setCargando(true);
      // Buscar el primer cliente existente (no dependas de id=1)
      const { data, error } = await supabase.from('cliente').select('*').limit(1).maybeSingle();
      if (data) {
        setCliente(data); // data incluye id
      } else {
        // Si no hay datos, dejar el formulario editable para crear el cliente
        setCliente({
          nombre: '',
          telefono: '',
          email: '',
          imagen_url: '',
          acerca_de: '',
          red_social: '',
        });
        setEditando(true);
      }
      setCargando(false);
    }
    fetchCliente();
  }, []);

  // Manejar cambios en los inputs
  function handleChange(e) {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  }

  // Manejar subida de imagen
  async function handleImagen(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setCliente({ ...cliente, imagen_url: URL.createObjectURL(file) });
  }

  // Entrar en modo edición
  function handleEditar() {
    setEditando(true);
    setCargando(false); // Asegura que no esté en modo cargando al editar
    setMensaje('');
  }

  // Guardar cambios
  async function handleGuardar(e) {
    e.preventDefault();
    setCargando(true);
    let imagen_url = cliente.imagen_url;
    if (archivo) {
      const nombreArchivo = `cliente_${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, archivo);
      if (uploadError) {
        setMensaje('Error subiendo imagen');
        setCargando(false);
        return;
      }
      imagen_url = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
    }
    // Solo enviar los campos válidos y no vacíos de la tabla cliente
    const allowedFields = ['nombre', 'telefono', 'email', 'imagen_url', 'acerca_de', 'redes'];
    const clienteData = {};
    allowedFields.forEach(field => {
      if (field === 'imagen_url') {
        if (typeof imagen_url === 'string' && imagen_url.trim() !== '') {
          clienteData.imagen_url = imagen_url;
        }
      } else if (field === 'redes') {
        if (Array.isArray(cliente.redes) && cliente.redes.length > 0) {
          clienteData.redes = cliente.redes.filter(r => r.tipo && r.url);
        }
      } else if (typeof cliente[field] === 'string' && cliente[field].trim() !== '') {
        if (field === 'telefono' && !isNaN(cliente[field])) {
          clienteData.telefono = Number(cliente[field]);
        } else {
          clienteData[field] = cliente[field].trim();
        }
      }
    });
    let result, error;
    if (cliente.id !== undefined && cliente.id !== null && typeof cliente.id === 'number' && !isNaN(cliente.id)) {
      // UPDATE: solo si existe id
      result = await supabase.from('cliente').update(clienteData).eq('id', cliente.id);
      error = result.error;
    } else {
      // INSERT: solo si NO existe id
      let insertData = { ...clienteData };
      if ('id' in insertData) delete insertData.id;
      Object.keys(insertData).forEach(k => { if (k === 'id') delete insertData[k]; });
      result = await supabase.from('cliente').insert([insertData]);
      error = result.error;
    }
    if (error) {
      console.error('Error Supabase:', error);
      setMensaje('Error guardando datos: ' + (error.message || ''));
    } else {
      setMensaje('Datos guardados correctamente');
      setEditando(false);
      setArchivo(null);
      // Recargar datos del cliente para reflejar los cambios (y obtener el id generado)
      const { data } = await supabase.from('cliente').select('*').limit(1).maybeSingle();
      if (data) {
        // Asegura que redes sea un array
        let redes = data.redes;
        if (typeof redes === 'string') {
          try {
            redes = JSON.parse(redes);
          } catch {
            redes = [];
          }
        }
        setCliente({ ...data, redes: Array.isArray(redes) ? redes : [] });
      }
    }
    setCargando(false);
  }

  return (
    <section className="mei-section">
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16 }}>&larr; Volver</button>
      <h2 style={{ color: '#a77ff2', fontWeight: 700, marginBottom: 18 }}>Sobre mí</h2>
      {cargando && !editando ? <div>Cargando...</div> : (
        <>
          <form onSubmit={handleGuardar} style={{
            display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420, alignItems: 'center', margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e5d8fa', padding: '32px 28px 24px 28px', border: '1px solid #f0eaff'
          }}>
            {/* Imagen de perfil grande y centrada */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12, width: '100%' }}>
              {editando ? (
                <>
                  {(archivoPreview || cliente.imagen_url) && (
                    <img
                      src={archivoPreview || cliente.imagen_url}
                      alt="Imagen cliente"
                      style={{
                        width: 180,
                        height: 180,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        boxShadow: '0 4px 24px #a77ff244',
                        marginBottom: 10,
                        border: '4px solid #fff',
                        background: '#eee',
                        display: 'block',
                      }}
                    />
                  )}
                  {clienteAuth && (
                    <label style={{ display: 'inline-block', background: '#f7d6e0', color: '#a77ff2', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4, boxShadow: '0 1px 4px #e5d8fa', border: '1.5px solid #e5d8fa' }}>
                      <span>Seleccionar imagen</span>
                      <input type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
                    </label>
                  )}
                </>
              ) : (
                cliente.imagen_url && (
                  <img
                    src={cliente.imagen_url}
                    alt="Imagen cliente"
                    style={{
                      width: 180,
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: '50%',
                      boxShadow: '0 4px 24px #a77ff244',
                      marginBottom: 10,
                      border: '4px solid #fff',
                      background: '#eee',
                      display: 'block',
                    }}
                  />
                )
              )}
            </div>
            <label style={{ width: '100%', fontWeight: 600, color: '#a77ff2', marginBottom: 2 }}>Nombre:
              <input name="nombre" value={cliente.nombre} onChange={handleChange} disabled={!editando} required style={{
                width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, marginTop: 4, background: editando ? '#faf8ff' : '#f5f3fa', transition: 'background 0.2s'
              }} />
            </label>
            <label style={{ width: '100%', fontWeight: 600, color: '#a77ff2', marginBottom: 2 }}>Teléfono:
              <input name="telefono" value={cliente.telefono} onChange={handleChange} disabled={!editando} required style={{
                width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, marginTop: 4, background: editando ? '#faf8ff' : '#f5f3fa', transition: 'background 0.2s'
              }} />
            </label>
            <label style={{ width: '100%', fontWeight: 600, color: '#a77ff2', marginBottom: 2 }}>Email:
              <input name="email" value={cliente.email} onChange={handleChange} disabled={!editando} required type="email" style={{
                width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, marginTop: 4, background: editando ? '#faf8ff' : '#f5f3fa', transition: 'background 0.2s'
              }} />
            </label>
            <label style={{ width: '100%', fontWeight: 600, color: '#a77ff2', marginBottom: 2 }}>Acerca de:
              <textarea name="acerca_de" value={cliente.acerca_de} onChange={handleChange} disabled={!editando} style={{
                width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, marginTop: 4, minHeight: 60, background: editando ? '#faf8ff' : '#f5f3fa', transition: 'background 0.2s'
              }} />
            </label>
            <div style={{ width: '100%', marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: '#a77ff2' }}>Redes sociales:</span>
              {/* SOLO muestra el formulario para añadir/eliminar redes si está en modo edición Y el cliente está autenticado */}
              {editando && clienteAuth && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <select
                    value={nuevaRed.tipo}
                    onChange={e => setNuevaRed({ ...nuevaRed, tipo: e.target.value })}
                    style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 15, background: '#faf8ff', minWidth: 120 }}
                  >
                    <option value="">Selecciona red</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Otra">Otra</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Enlace de la red social"
                    value={nuevaRed.url}
                    onChange={e => setNuevaRed({ ...nuevaRed, url: e.target.value })}
                    style={{ padding: '8px', borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 15, background: '#faf8ff', minWidth: 220 }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (nuevaRed.tipo && nuevaRed.url) {
                        const nuevasRedes = [...(cliente.redes || []), { tipo: nuevaRed.tipo, url: nuevaRed.url }];
                        setCliente({ ...cliente, redes: nuevasRedes });
                        setNuevaRed({ tipo: '', url: '' });
                        // Guarda en la base de datos si el cliente ya existe
                        if (cliente.id !== undefined && cliente.id !== null && typeof cliente.id === 'number' && !isNaN(cliente.id)) {
                          await supabase.from('cliente').update({ redes: nuevasRedes }).eq('id', cliente.id);
                          // Recarga el cliente para reflejar el cambio
                          const { data } = await supabase.from('cliente').select('*').eq('id', cliente.id).single();
                          if (data) setCliente(data);
                        } else {
                          // Si no existe, crea el cliente con las redes
                          const { data, error } = await supabase.from('cliente').insert([{ ...cliente, redes: nuevasRedes }]).select().single();
                          if (!error && data) setCliente(data);
                        }
                      }
                    }}
                    style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px #e5d8fa', cursor: 'pointer' }}
                  >
                    Agregar
                  </button>
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
                {cliente.redes && cliente.redes.length > 0 && cliente.redes.map((r, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: '#a77ff2', fontWeight: 600 }}>{r.tipo}:</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#a77ff2', textDecoration: 'underline', fontSize: 15, wordBreak: 'break-all' }}>{r.url}</a>
                    {/* SOLO muestra el botón de eliminar si está en modo edición Y el cliente está autenticado */}
                    {editando && clienteAuth && (
                      <button type="button" onClick={async () => {
                        const nuevasRedes = cliente.redes.filter((_, i) => i !== idx);
                        setCliente({ ...cliente, redes: nuevasRedes });
                        if (cliente.id !== undefined && cliente.id !== null && typeof cliente.id === 'number' && !isNaN(cliente.id)) {
                          await supabase.from('cliente').update({ redes: nuevasRedes }).eq('id', cliente.id);
                        }
                      }} style={{ background: 'transparent', color: '#eb2f06', border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 4 }}>×</button>
                    )}
                  </li>
                ))}
                {!editando && cliente.redes && cliente.redes.length === 0 && (
                  <li style={{ color: '#888', fontSize: 15 }}>No hay redes sociales agregadas.</li>
                )}
              </ul>
            </div>
            {clienteAuth && editando && (
              <button className="mei-ver-todos-btn" type="submit" disabled={cargando} style={{
                background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, marginTop: 8, boxShadow: '0 2px 8px #e5d8fa', letterSpacing: 1, transition: 'background 0.2s'
              }}>Guardar</button>
            )}
            {mensaje && <div style={{ color: mensaje.includes('Error') ? 'red' : 'green', marginTop: 8, fontWeight: 600 }}>{mensaje}</div>}
          </form>
          {/* Botón Editar fuera del formulario */}
          {clienteAuth && !editando && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 18 }}>
              <button className="mei-ver-todos-btn" type="button" onClick={handleEditar} style={{
                background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px #e5d8fa', letterSpacing: 1, transition: 'background 0.2s', width: 420, maxWidth: '100%'
              }}>Editar</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function LoginModal({ onLogin, error, onClose }) {
  const [password, setPassword] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    onLogin(password)
    setPassword('')
  }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(167,127,242,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 320, boxShadow: '0 4px 24px #a77ff244', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ color: '#a77ff2', margin: 0, marginBottom: 8, textAlign: 'center', fontWeight: 700 }}>Acceso cliente</h3>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '', marginBottom: 4, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
        <button type="submit" style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px ', fontWeight: 600, fontSize: 16 }}>Entrar</button>
        <button type="button" onClick={onClose} style={{  background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16 }}>Cancelar</button>
        {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  )
}

function VistaProyectos({ proyectos, onAgregar, onVerAvances, cargando, error, clienteAuth }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('activo')
  const [archivo, setArchivo] = useState(null)
  const [archivoPreview, setArchivoPreview] = useState(null)
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editEstado, setEditEstado] = useState('activo')
  const [editArchivo, setEditArchivo] = useState(null)
  const [editArchivoPreview, setEditArchivoPreview] = useState(null)
  function handleArchivoChange(e) {
    const file = e.target.files[0];
    setArchivo(file);
    if (file) {
      setArchivoPreview(URL.createObjectURL(file));
    } else {
      setArchivoPreview(null);
    }
  }

  function handleEditArchivoChange(e) {
    const file = e.target.files[0];
    setEditArchivo(file);
    if (file) {
      setEditArchivoPreview(URL.createObjectURL(file));
    } else {
      setEditArchivoPreview(null);
    }
  }
  const [errorLocal, setErrorLocal] = useState(null)
  const [erroresForm, setErroresForm] = useState({})
  const [erroresEdit, setErroresEdit] = useState({})

  async function agregarProyecto(e) {
    e.preventDefault()
    setAgregando(true)
    setErrorLocal(null)
    let errores = {}
    if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
    // Puedes agregar más validaciones aquí si lo deseas
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores)
      setAgregando(false)
      return
    }
    setErroresForm({})
    let archivoUrl = null
    if (archivo) {
      // Limpiar el nombre del archivo para evitar errores de key
      const cleanName = archivo.name
        .normalize('NFD').replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
      const nombreArchivo = `proyecto_${Date.now()}_${cleanName}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, archivo);
      if (uploadError) {
        setErrorLocal('Error al subir archivo: ' + uploadError.message);
        setAgregando(false);
        return;
      }
      archivoUrl = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const { data: insertData, error } = await supabase
      .from('proyectos')
      .insert([{ nombre, descripcion, estado, archivo_url: archivoUrl }]);
    if (error) setErrorLocal(error.message)
    else Swal.fire('¡Proyecto agregado!', '', 'success')
    setNombre('')
    setDescripcion('')
    setEstado('activo')
    setArchivo(null)
    setArchivoPreview(null)
    setTimeout(() => { onAgregar(); }, 300); // Recarga la lista tras agregar
    setAgregando(false)
  }

  async function eliminarProyecto(id) {
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esto eliminará también todos sus avances y el archivo asociado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a77ff2',
      cancelButtonColor: '#f7d6e0',
    });
    if (!result.isConfirmed) return;
    // Buscar el proyecto para obtener el archivo
    const { data: proyectoData } = await supabase.from('proyectos').select('archivo_url').eq('id', id).single();
    if (proyectoData && proyectoData.archivo_url) {
      // Extraer el path relativo del archivo desde el archivo_url
      // Ejemplo: https://.../storage/v1/object/public/imagenes/proyecto_1234_nombre.jpg
      const match = proyectoData.archivo_url.match(/\/storage\/v1\/object\/public\/imagenes\/(.+)$/);
      const pathRelativo = match ? match[1] : null;
      if (pathRelativo) {
        const { error: storageError } = await supabase.storage.from('imagenes').remove([pathRelativo]);
        if (storageError) {
          console.warn('No se pudo eliminar el archivo del Storage:', storageError.message);
        }
      }
    }
    const { error } = await supabase.from('proyectos').delete().eq('id', id);
    if (error) Swal.fire('Error', error.message, 'error');
    else Swal.fire('Eliminado', 'Proyecto eliminado', 'success');
    await onAgregar();
  }

  function iniciarEdicion(proy) {
    setEditandoId(proy.id)
    setEditNombre(proy.nombre)
    setEditDescripcion(proy.descripcion)
    setEditEstado(proy.estado || 'activo')
    setEditArchivo(null)
    setEditArchivoPreview(null)
  }

  async function guardarEdicion(id) {
    let errores = {}
    if (!editNombre.trim()) errores.nombre = 'El nombre es obligatorio.'
    if (Object.keys(errores).length > 0) {
      setErroresEdit(errores)
      return
    }
    setErroresEdit({})
    let archivoUrl = null
    if (editArchivo) {
      // Limpiar el nombre del archivo para evitar errores de key
      const cleanName = editArchivo.name
        .normalize('NFD').replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
      const nombreArchivo = `proyecto_${Date.now()}_${cleanName}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, editArchivo);
      if (uploadError) {
        Swal.fire('Error', 'Error al subir archivo: ' + uploadError.message, 'error');
        return;
      }
      archivoUrl = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const updateData = archivoUrl
      ? { nombre: editNombre, descripcion: editDescripcion, estado: editEstado, archivo_url: archivoUrl }
      : { nombre: editNombre, descripcion: editDescripcion, estado: editEstado }
    const { error } = await supabase
      .from('proyectos')
      .update(updateData)
      .eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Guardado', 'Proyecto actualizado', 'success')
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
    setEditEstado('activo')
    setEditArchivo(null)
    setEditArchivoPreview(null)
    await onAgregar()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
    setEditArchivo(null)
    setEditArchivoPreview(null)
  }

  return (
    <section className="mei-section" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: '5vw 4vw', minWidth: 0 }}>
      <h2 style={{ color: '#a77ff2', marginBottom: 20, fontWeight: 700 }}>Proyectos</h2>
      {/* Formulario solo para el cliente autenticado */}
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarProyecto} style={{
          display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e5d8fa', padding: '32px 28px 24px 28px', border: '1.5px solid #e5d8fa', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', alignItems: 'center'
        }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
            {archivoPreview && (
              archivo && archivo.type.startsWith('image/') ? (
                <img src={archivoPreview} alt="Previsualización" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, objectFit: 'cover', background: '#faf8ff' }} />
              ) : archivo && archivo.type.startsWith('video/') ? (
                <video src={archivoPreview} controls style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, background: '#faf8ff' }} />
              ) : null
            )}
            <label style={{ display: 'inline-block', background: '#f7d6e0', color: '#a77ff2', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 0, boxShadow: '0 1px 4px #e5d8fa', border: '1.5px solid #e5d8fa' }}>
              <span>Seleccionar imagen o video</span>
              <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleArchivoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, background: '#faf8ff', marginBottom: 2, width: '100%' }}
          />
          {erroresForm.nombre && <div style={{ color: 'red', marginBottom: 4, fontWeight: 600 }}>{erroresForm.nombre}</div>}
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, minHeight: 60, background: '#faf8ff', marginBottom: 2, width: '100%' }}
          />
          <button type="submit" disabled={agregando} style={{
            background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, marginTop: 8, boxShadow: '0 2px 8px #e5d8fa', letterSpacing: 1, transition: 'background 0.2s', textAlign: 'center', width: '100%'
          }}>
            Agregar proyecto
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {errorLocal && <div style={{ color: 'red' }}>{errorLocal}</div>}
      {cargando && <div>Cargando...</div>}
      {/* Mostrar proyectos subidos por el cliente y todos los proyectos */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {proyectos.length === 0 && (
          <li style={{ color: '#a77ff2', textAlign: 'center', marginTop: 24, fontWeight: 600, fontSize: 18 }}>
            No hay proyectos por mostrar en este momento.
            <br />
            <span style={{ fontSize: '0.95em', color: '#aaa', fontWeight: 400 }}>
              Cuando se agregue un proyecto aparecerá aquí.
            </span>
          </li>
        )}
        {proyectos.map(proy => (
          <li key={proy.id} className="mei-avance-item" style={{ background: '#faf8ff', borderRadius: 10, marginBottom: 18, boxShadow: '0 1px 6px #eee', padding: '5vw 4vw', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', minWidth: 0, position: 'relative' }}>
            {clienteAuth && editandoId !== proy.id && (
              <button className="mei-delete-btn" onClick={() => eliminarProyecto(proy.id)} title="Eliminar proyecto" style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'transparent', color: '#a77ff2', border: 'none', borderRadius: '50%', padding: '4px 14px', fontWeight: 700, fontSize: 32, boxShadow: 'none', minWidth: 44, width: 44, height: 44, alignSelf: 'flex-end', transition: 'all 0.2s', whiteSpace: 'nowrap', cursor: 'pointer', lineHeight: 1 }}>×</button>
            )}
            <div className="mei-avance-desc" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              {editandoId === proy.id ? (
                <div style={{ background: '#f0eaff', borderRadius: 14, padding: '22px 16px', marginBottom: 8, boxShadow: '0 2px 8px #e5d8fa', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {editArchivoPreview && (
                      editArchivo && editArchivo.type.startsWith('image/') ? (
                        <img src={editArchivoPreview} alt="Previsualización" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, objectFit: 'cover', background: '#faf8ff' }} />
                      ) : editArchivo && editArchivo.type.startsWith('video/') ? (
                        <video src={editArchivoPreview} controls style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, background: '#faf8ff' }} />
                      ) : null
                    )}
                    <label style={{ display: 'inline-block', background: '#f7d6e0', color: '#a77ff2', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 0, boxShadow: '0 1px 4px #e5d8fa', border: '1.5px solid #e5d8fa' }}>
                      <span>Seleccionar imagen o video</span>
                      <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleEditArchivoChange} style={{ display: 'none' }} />
                    </label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, background: '#faf8ff', marginBottom: 2, width: '100%' }}
                      placeholder="Nombre del proyecto"
                    />
                    {erroresEdit.nombre && <div style={{ color: 'red', marginBottom: 4, fontWeight: 600 }}>{erroresEdit.nombre}</div>}
                    <textarea
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                      style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, minHeight: 50, background: '#faf8ff', marginBottom: 2, width: '100%' }}
                      placeholder="Descripción"
                    />
                    <select
                      value={editEstado}
                      onChange={e => setEditEstado(e.target.value)}
                      style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, background: '#faf8ff', marginBottom: 2, width: '100%' }}
                    >
                      <option value="activo">En progreso</option>
                      <option value="pausado">Pausado</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      className="mei-ver-todos-btn"
                      onClick={() => guardarEdicion(proy.id)}
                      disabled={!editNombre}
                      style={{
                        background: '#a77ff2',
                        color: '#fff',
                        border: '1.5px solid #a77ff2',
                        borderRadius: 8,
                        padding: '5px 8px',
                        fontWeight: 700,
                        fontSize: 18,
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        letterSpacing: 1,
                        marginBottom: 8,
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      className="mei-cancel-btn"
                      onClick={cancelarEdicion}
                      style={{
                        background: 'transparent',
                        color: '#a77ff2',
                        border: '1.5px solid #a77ff2',
                        borderRadius: 8,
                        padding: '4px 18px',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        letterSpacing: 1,
                        marginBottom: 8,
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>{proy.nombre}</strong>
                  {proy.archivo_url && (
                    <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
                      {proy.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp|png)$/i) ? (
                        <img
                          src={proy.archivo_url}
                          alt="Imagen proyecto"
                          style={{ maxWidth: 340, maxHeight: 180, borderRadius: 14, cursor: 'zoom-in', boxShadow: '0 2px 12px #a77ff288', objectFit: 'cover', background: '#faf8ff' }}
                          onClick={() => setImagenModal({ url: proy.archivo_url, alt: proy.nombre || 'Imagen proyecto' })}
                          title="Ver grande"
                        />
                      ) : proy.archivo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={proy.archivo_url} controls style={{ maxWidth: 340, maxHeight: 180, borderRadius: 14, boxShadow: '0 2px 12px #a77ff288', background: '#faf8ff' }} />
                      ) : (
                        <a href={proy.archivo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#a77ff2', fontWeight: 600, textDecoration: 'underline', fontSize: 16 }}>Ver documento</a>
                      )}
                    </div>
                  )}
                  <div>{proy.descripcion}</div>
                  <div className="mei-avance-date">
                    Estado: {clienteAuth ? (
                      <select
                        value={proy.estado || 'activo'}
                        onChange={async e => {
                          const nuevoEstado = e.target.value;
                          const { error } = await supabase
                            .from('proyectos')
                            .update({ estado: nuevoEstado })
                            .eq('id', proy.id);
                          if (!error) {
                            await onAgregar();
                          } else {
                            Swal.fire('Error', error.message, 'error');
                          }
                        }}
                        style={{
                          marginLeft: 8,
                          padding: '8px 18px 8px 12px',
                          borderRadius: 18,
                          border: '1.5px solid #a77ff2',
                          background: '#f7d6e0',
                          color: '#a77ff2',
                          fontWeight: 700,
                          fontSize: 15,
                          boxShadow: '0 1px 4px #e5d8fa',
                          outline: 'none',
                          cursor: 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          minWidth: 150,
                          transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <option value="activo" style={{ color: '#a77ff2' }}>🟢 En progreso</option>
                        <option value="pausado" style={{ color: '#f7b731' }}>⏸️ Pausado</option>
                        <option value="finalizado" style={{ color: '#4cd137' }}>🏁 Finalizado</option>
                        <option value="cancelado" style={{ color: '#eb2f06' }}>❌ Cancelado</option>
                      </select>
                    ) : (
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: 14,
                        background: proy.estado === 'finalizado' ? '#e0f7e9' : proy.estado === 'pausado' ? '#fffbe0' : proy.estado === 'cancelado' ? '#ffe0e0' : '#f7d6e0',
                        color: proy.estado === 'finalizado' ? '#4cd137' : proy.estado === 'pausado' ? '#f7b731' : proy.estado === 'cancelado' ? '#eb2f06' : '#a77ff2',
                        fontWeight: 700,
                        fontSize: 15,
                        minWidth: 120,
                        textAlign: 'center',
                        boxShadow: '0 1px 4px #e5d8fa',
                        letterSpacing: 1,
                      }}>
                        {proy.estado === 'finalizado' ? '🏁 Finalizado' : proy.estado === 'pausado' ? '⏸️ Pausado' : proy.estado === 'cancelado' ? '❌ Cancelado' : '🟢 En progreso'}
                      </span>
                    )}
                    <br />
                    Creado: {proy.fecha_creacion ? new Date(proy.fecha_creacion).toLocaleString() : 'Sin fecha'}
                  </div>
                  <button className="mei_ver_todos_btn" onClick={() => onVerAvances(proy)} style={{ marginTop: 8 }}>
                    Ver avances
                  </button>
                </>
              )}
            </div>
            {clienteAuth && editandoId !== proy.id && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <button className="mei-edit-btn" onClick={() => iniciarEdicion(proy)} title="Editar" style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 70 }}>Editar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function VistaAvances({ proyecto, onVolver, clienteAuth }) {
  const [avances, setAvances] = useState([])
  const [descripcion, setDescripcion] = useState('')
  const [autor, setAutor] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [archivoPreview, setArchivoPreview] = useState(null)
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editAutor, setEditAutor] = useState('')
  const [editArchivo, setEditArchivo] = useState(null)
  const [editArchivoPreview, setEditArchivoPreview] = useState(null)
  function handleArchivoChange(e) {
    const file = e.target.files[0];
    setArchivo(file);
    if (file) {
      setArchivoPreview(URL.createObjectURL(file));
    } else {
      setArchivoPreview(null);
    }
  }

  function handleEditArchivoChange(e) {
    const file = e.target.files[0];
    setEditArchivo(file);
    if (file) {
      setEditArchivoPreview(URL.createObjectURL(file));
    } else {
      setEditArchivoPreview(null);
    }
  }
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [erroresForm, setErroresForm] = useState({})
  const [erroresEdit, setErroresEdit] = useState({})

  useEffect(() => {
    obtenerAvances()
    // eslint-disable-next-line
  }, [proyecto.id])

  async function obtenerAvances() {
    setCargando(true)
    setError(null)
    const { data, error } = await supabase
      .from('avances')
      .select('*')
      .eq('proyecto_id', proyecto.id)
      .order('fecha', { ascending: false })
    if (error) setError(error.message)
    else setAvances(data)
    setCargando(false)
  }

  async function agregarAvance(e) {
    e.preventDefault()
    setAgregando(true)
    setError(null)
    let errores = {}
    if (!descripcion.trim()) errores.descripcion = 'La descripción es obligatoria.'
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores)
      setAgregando(false)
      return
    }
    setErroresForm({})
    let archivoUrl = null
    if (archivo) {
      // Limpiar el nombre del archivo para evitar errores de key
      const cleanName = archivo.name
        .normalize('NFD').replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
      const nombreArchivo = `${proyecto.id}_${Date.now()}_${cleanName}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, archivo);
      if (uploadError) {
        setError('Error al subir archivo: ' + uploadError.message);
        setAgregando(false);
        return;
      }
      archivoUrl = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const { error } = await supabase
      .from('avances')
      .insert([{ proyecto_id: proyecto.id, descripcion, autor, archivo_url: archivoUrl }])
    if (error) setError(error.message)
    else Swal.fire('¡Avance agregado!', '', 'success')
    setDescripcion('')
    setAutor('')
    setArchivo(null)
    setArchivoPreview(null)
    await obtenerAvances()
    setAgregando(false)
  }

  async function eliminarAvance(id) {
    const result = await Swal.fire({
      title: '¿Eliminar avance?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a77ff2',
      cancelButtonColor: '#f7d6e0',
    })
    if (!result.isConfirmed) return
    const { error } = await supabase.from('avances').delete().eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Eliminado', 'Avance eliminado', 'success')
    await obtenerAvances()
  }

  function iniciarEdicion(av) {
    setEditandoId(av.id)
    setEditDescripcion(av.descripcion)
    setEditAutor(av.autor || '')
    setEditArchivo(null)
  }

  async function guardarEdicion(id) {
    let errores = {}
    if (!editDescripcion.trim()) errores.descripcion = 'La descripción es obligatoria.'
    if (Object.keys(errores).length > 0) {
      setErroresEdit(errores)
      return
    }
    setErroresEdit({})
    let archivoUrl = null
    if (editArchivo) {
      const cleanName = editArchivo.name
        .normalize('NFD').replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
      const nombreArchivo = `${proyecto.id}_${Date.now()}_${cleanName}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, editArchivo);
      if (uploadError) {
        Swal.fire('Error', 'Error al subir archivo: ' + uploadError.message, 'error');
        return;
      }
      archivoUrl = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
    }
    const updateData = archivoUrl
      ? { descripcion: editDescripcion, autor: editAutor, archivo_url: archivoUrl }
      : { descripcion: editDescripcion, autor: editAutor }
    const { error } = await supabase
      .from('avances')
      .update(updateData)
      .eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Guardado', 'Avance actualizado', 'success')
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
    setEditArchivo(null)
    setEditArchivoPreview(null)
    await obtenerAvances()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
    setEditArchivo(null)
    setEditArchivoPreview(null)
  }


  return (
    <section className="mei-section" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: '5vw 4vw', minWidth: 0 }}>
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16, background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}>&larr; Volver a proyectos</button>
      <h2 style={{ color: '#a77ff2', marginBottom: 20, fontWeight: 700 }}>Avances de: {proyecto.nombre}</h2>
      {/* Filtro de seleccionar proyecto eliminado */}
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarAvance} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e5d8fa', padding: '32px 28px 24px 28px', border: '1.5px solid #e5d8fa', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
            {archivoPreview && (
              archivo && archivo.type.startsWith('image/') ? (
                <img src={archivoPreview} alt="Previsualización" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, objectFit: 'cover', background: '#faf8ff' }} />
              ) : archivo && archivo.type.startsWith('video/') ? (
                <video src={archivoPreview} controls style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, background: '#faf8ff' }} />
              ) : null
            )}
            <label style={{ display: 'inline-block', background: '#f7d6e0', color: '#a77ff2', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 0, boxShadow: '0 1px 4px #e5d8fa', border: '1.5px solid #e5d8fa' }}>
              <span>Seleccionar imagen o video</span>
              <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleArchivoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <textarea
            placeholder="Descripción del avance"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, minHeight: 60, background: '#faf8ff', marginBottom: 2, width: '100%' }}
          />
          {erroresForm.descripcion && <div style={{ color: 'red', marginBottom: 4, fontWeight: 600 }}>{erroresForm.descripcion}</div>}
          <input
            type="text"
            placeholder="Autor (opcional)"
            value={autor}
            onChange={e => setAutor(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, background: '#faf8ff', marginBottom: 2, width: '100%' }}
          />
          <button type="submit" disabled={agregando} style={{
            background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, marginTop: 8, boxShadow: '0 2px 8px #e5d8fa', letterSpacing: 1, transition: 'background 0.2s', textAlign: 'center', width: '100%'
          }}>
            Agregar avance
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {cargando && <div>Cargando...</div>}
      <ul className="mei-avances-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {avances.map(av => (
          <li key={av.id} className="mei-avance-item" style={{ background: '#faf8ff', borderRadius: 10, marginBottom: 18, boxShadow: '0 1px 6px #eee', padding: '5vw 4vw', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
            <div className="mei-avance-desc" style={{ flex: 1, minWidth: 0 }}>
              {editandoId === av.id ? (
                <div style={{ background: '#f0eaff', borderRadius: 14, padding: '22px 16px', marginBottom: 8, boxShadow: '0 2px 8px #e5d8fa', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {editArchivoPreview && (
                      editArchivo && editArchivo.type.startsWith('image/') ? (
                        <img src={editArchivoPreview} alt="Previsualización" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, objectFit: 'cover', background: '#faf8ff' }} />
                      ) : editArchivo && editArchivo.type.startsWith('video/') ? (
                        <video src={editArchivoPreview} controls style={{ maxWidth: 320, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px #a77ff288', marginBottom: 8, background: '#faf8ff' }} />
                      ) : null
                    )}
                    <label style={{ display: 'inline-block', background: '#f7d6e0', color: '#a77ff2', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 0, boxShadow: '0 1px 4px #e5d8fa', border: '1.5px solid #e5d8fa' }}>
                      <span>Seleccionar imagen o video</span>
                      <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleEditArchivoChange} style={{ display: 'none' }} />
                    </label>
                    <textarea
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                      style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, minHeight: 50, background: '#faf8ff', marginBottom: 2, width: '100%' }}
                      placeholder="Descripción del avance"
                    />
                    {erroresEdit.descripcion && <div style={{ color: 'red', marginBottom: 4, fontWeight: 600 }}>{erroresEdit.descripcion}</div>}
                    <input
                      type="text"
                      value={editAutor}
                      onChange={e => setEditAutor(e.target.value)}
                      style={{ padding: 12, borderRadius: 8, border: '1.5px solid #e5d8fa', fontSize: 16, background: '#faf8ff', marginBottom: 2, width: '100%' }}
                      placeholder="Autor (opcional)"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button
                        className="mei-cancel-btn"
                        onClick={cancelarEdicion}
                        style={{
                          background: 'transparent',
                          color: '#a77ff2',
                          border: '1.5px solid #a77ff2',
                          borderRadius: 8,
                          padding: '2px 10px',
                          fontWeight: 700,
                          fontSize: 14,
                          boxShadow: 'none',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          letterSpacing: 1,
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="mei-ver-todos-btn"
                        onClick={() => guardarEdicion(av.id)}
                        disabled={!editDescripcion}
                        style={{
                          background: '#a77ff2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontWeight: 700,
                          fontSize: 15,
                          boxShadow: '0 2px 8px #e5d8fa',
                          textAlign: 'center',
                          letterSpacing: 1,
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {av.descripcion}
                  {/* Imagen/video/enlace debajo de la descripción y arriba de autor/fecha */}
                  {av.archivo_url && (
                    <div style={{ marginTop: 8 }}>
                      {av.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                        <img
                          src={av.archivo_url}
                          alt="Imagen avance"
                          style={{ maxWidth: '350px', maxHeight: '350px', borderRadius: 8, cursor: 'zoom-in' }}
                          onClick={() => setImagenModal({ url: av.archivo_url, alt: av.descripcion || 'Imagen avance' })}
                          title="Ver grande"
                        />
                      ) : av.archivo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={av.archivo_url} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : (
                        <a href={av.archivo_url} target="_blank" rel="noopener noreferrer">Ver documento</a>
                      )}
                    </div>
                  )}
                  <div className="mei-avance-date">
                    {av.autor && <>Autor: {av.autor} <br /></>}
                    Fecha: {new Date(av.fecha).toLocaleString()}
                  </div>
                </>
              )}
            </div>
            {clienteAuth && editandoId !== av.id && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0 0 0' }}>
                  <button className="mei-delete-btn" onClick={() => eliminarAvance(av.id)} title="Eliminar avance" style={{ background: 'transparent', color: '#a77ff2', border: 'none', borderRadius: '50%', padding: '4px 14px', fontWeight: 700, fontSize: 32, boxShadow: 'none', minWidth: 44, width: 44, height: 44, alignSelf: 'flex-end', transition: 'all 0.2s', whiteSpace: 'nowrap', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <button className="mei-edit-btn" onClick={() => iniciarEdicion(av)} title="Editar" style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 70 }}>Editar</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
}
export default App