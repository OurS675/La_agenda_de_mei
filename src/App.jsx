import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Swal from 'sweetalert2'

const CLIENTE_PASSWORD = 'mei2024'

function App() {
  const [vista, setVista] = useState('proyectos') // 'proyectos', 'avances' o 'cliente'
  const [filtroVista, setFiltroVista] = useState('proyectos') // 'proyectos' o 'avances'
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

  // Recargar proyectos al cambiar el filtro a 'proyectos'
  useEffect(() => {
    if (filtroVista === 'proyectos') {
      obtenerProyectos();
    }
  }, [filtroVista]);

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
    console.log('Respuesta obtenerProyectos:', { data, error });
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
    <div className="mei-container">
      <header className="mei-header">
        <h1>La Agenda de Mei</h1>
        <nav>
          <button className={vista === 'proyectos' ? 'active' : ''} onClick={volverAProyectos} disabled={vista === 'proyectos'}>
            Proyectos
          </button>
          <button className={vista === 'avances' ? 'active' : ''} onClick={handleAvancesClick} disabled={vista === 'avances' || proyectos.length === 0}>
            Avances
          </button>
          <button onClick={handleClienteClick} style={{ marginLeft: 'auto' }}>
            Cliente
          </button>
          {!clienteAuth && (
            <button className="login-btn" onClick={() => setShowLogin(true)}>
              Iniciar sesión
            </button>
          )}
          {clienteAuth && (
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          )}
        </nav>
        {/* Filtro para cliente: proyectos o avances */}
        {clienteAuth && vista !== 'cliente' && (
          <div className="mei-filtro-avances" style={{ marginTop: 16 }}>
            <label htmlFor="filtro-vista">Ver:</label>
            <select id="filtro-vista" value={filtroVista} onChange={e => setFiltroVista(e.target.value)}>
              <option value="proyectos">Proyectos</option>
              <option value="avances">Avances</option>
            </select>
          </div>
        )}
      </header>
      <main>
        {showLogin && (
          <LoginModal onLogin={handleLogin} error={loginError} onClose={() => setShowLogin(false)} />
        )}
        {/* Mostrar según filtro */}
        {clienteAuth && vista !== 'cliente' ? (
          filtroVista === 'proyectos' ? (
            <VistaProyectos
              proyectos={proyectos}
              onAgregar={obtenerProyectos}
              onVerAvances={irAAvances}
              cargando={cargando}
              error={error}
              clienteAuth={clienteAuth}
            />
          ) : (
            proyectoSeleccionado ? (
              <VistaAvances
                proyecto={proyectoSeleccionado}
                onVolver={volverAProyectos}
                clienteAuth={clienteAuth}
              />
            ) : (
              <div style={{ marginTop: 32, textAlign: 'center' }}>Selecciona un proyecto para ver sus avances.</div>
            )
          )
        ) : vista === 'proyectos' ? (
          <VistaProyectos
            proyectos={proyectos}
            onAgregar={obtenerProyectos}
            onVerAvances={irAAvances}
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
          <VistaCliente onVolver={volverAProyectos} />
        ) : null}
      </main>
      <footer className="mei-footer">
        <span>© {new Date().getFullYear()} La Agenda de Mei</span>
      </footer>
    </div>
  )
// Apartado de información del cliente
function VistaCliente({ onVolver }) {
  return (
    <section className="mei-section">
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16 }}>&larr; Volver</button>
      <h2>Información del Cliente</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Nombre:</strong> Mei<br />
        <strong>Email:</strong> mei@email.com<br />
        <strong>Teléfono:</strong> 123-456-7890<br />
        <strong>Notas:</strong> Aquí puedes agregar información relevante del cliente, como instrucciones, links, etc.
      </div>
      {/* Puedes personalizar este apartado con más datos o funcionalidades */}
    </section>
  )
}

function LoginModal({ onLogin, error, onClose }) {
  const [password, setPassword] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    onLogin(password)
    setPassword('')
  }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 300 }}>
        <h3>Acceso cliente</h3>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }}>Entrar</button>
        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 8 }}>Cancelar</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  )
}

function VistaProyectos({ proyectos, onAgregar, onVerAvances, cargando, error, clienteAuth }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [errorLocal, setErrorLocal] = useState(null)

  async function agregarProyecto(e) {
    e.preventDefault()
    setAgregando(true)
    setErrorLocal(null)
    let archivoUrl = null
    if (archivo) {
      // Limpiar el nombre del archivo para evitar errores de key
      const cleanName = archivo.name
        .normalize('NFD').replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
      const nombreArchivo = `proyecto_${Date.now()}_${cleanName}`;
      const { data, error: uploadError } = await supabase.storage.from('imagenes').upload(nombreArchivo, archivo);
      console.log('Resultado upload archivo:', { data, uploadError });
      if (uploadError) {
        setErrorLocal('Error al subir archivo: ' + uploadError.message);
        setAgregando(false);
        return;
      }
      archivoUrl = supabase.storage.from('imagenes').getPublicUrl(nombreArchivo).data.publicUrl;
      console.log('URL pública del archivo:', archivoUrl);
    }
    const { data: insertData, error } = await supabase
      .from('proyectos')
      .insert([{ nombre, descripcion, archivo_url: archivoUrl }]);
    console.log('Resultado insert proyecto:', { insertData, error });
    if (error) setErrorLocal(error.message)
    else Swal.fire('¡Proyecto agregado!', '', 'success')
    setNombre('')
    setDescripcion('')
    setArchivo(null)
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
  }

  async function guardarEdicion(id) {
    const { error } = await supabase
      .from('proyectos')
      .update({ nombre: editNombre, descripcion: editDescripcion })
      .eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Guardado', 'Proyecto actualizado', 'success')
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
    await onAgregar()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
  }

  return (
    <section className="mei-section">
      <h2>Proyectos</h2>
      {/* Formulario solo para el cliente autenticado */}
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarProyecto}>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={e => setArchivo(e.target.files[0])}
            style={{ marginTop: 8, marginBottom: 8 }}
          />
          <button type="submit" disabled={agregando || !nombre}>
            Agregar proyecto
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {errorLocal && <div style={{ color: 'red' }}>{errorLocal}</div>}
      {cargando && <div>Cargando...</div>}
      {/* Mostrar proyectos subidos por el cliente y todos los proyectos */}
      <ul>
        {proyectos.length === 0 && (
          <li style={{ color: '#a77ff2', textAlign: 'center', marginTop: 24 }}>
            No hay proyectos registrados.
            <br />
            <span style={{ fontSize: '0.9em', color: '#888' }}>
              (¿No aparecen proyectos? Revisa la consola del navegador para ver detalles de la respuesta de Supabase)
            </span>
          </li>
        )}
        {proyectos.map(proy => (
          <li key={proy.id} className="mei-avance-item">
            <div className="mei-avance-desc">
              {editandoId === proy.id ? (
                <>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={e => setEditNombre(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <textarea
                    value={editDescripcion}
                    onChange={e => setEditDescripcion(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <button className="mei-ver-todos-btn" onClick={() => guardarEdicion(proy.id)} disabled={!editNombre}>
                    Guardar
                  </button>
                  <button className="mei-delete-btn" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <strong>{proy.nombre}</strong>
                  <div>{proy.descripcion}</div>
                  <div className="mei-avance-date">
                    Estado: {proy.estado || 'activo'}<br />
                    Creado: {proy.fecha_creacion ? new Date(proy.fecha_creacion).toLocaleString() : 'Sin fecha'}
                  </div>
                  {proy.archivo_url && (
                    <div style={{ marginTop: 8 }}>
                      {proy.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp|png)$/i) ? (
                        <img src={proy.archivo_url} alt="Imagen proyecto" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : proy.archivo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={proy.archivo_url} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : (
                        <a href={proy.archivo_url} target="_blank" rel="noopener noreferrer">Ver documento</a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {clienteAuth && editandoId !== proy.id && (
              <>
                <button className="mei-ver-todos-btn" onClick={() => onVerAvances(proy)}>
                  Ver avances
                </button>
                <button className="mei-delete-btn" onClick={() => iniciarEdicion(proy)} title="Editar">✏️</button>
                <button className="mei-delete-btn" onClick={() => eliminarProyecto(proy.id)} title="Eliminar">🗑️</button>
              </>
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
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editAutor, setEditAutor] = useState('')
  const [editArchivo, setEditArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

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
    let archivoUrl = null
    if (editArchivo) {
      // Limpiar el nombre del archivo para evitar errores de key
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
    await obtenerAvances()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
  }

  // Selector de proyecto
  const [proyectos, setProyectos] = useState([]);
  useEffect(() => {
    async function fetchProyectos() {
      const { data } = await supabase.from('proyectos').select('*').order('fecha_creacion', { ascending: false });
      setProyectos(data || []);
    }
    fetchProyectos();
  }, []);

  function handleProyectoChange(e) {
    const id = Number(e.target.value);
    const seleccionado = proyectos.find(p => p.id === id);
    if (seleccionado) {
      onVolver(); // Volver a proyectos y luego ir a avances del seleccionado
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('irAAvances', { detail: seleccionado }));
      }, 0);
    }
  }

  useEffect(() => {
    function handleIrAAvances(e) {
      if (typeof window.setProyectoSeleccionado === 'function') {
        window.setProyectoSeleccionado(e.detail);
      }
    }
    window.addEventListener('irAAvances', handleIrAAvances);
    return () => window.removeEventListener('irAAvances', handleIrAAvances);
  }, []);

  useEffect(() => {
    window.setProyectoSeleccionado = (p) => {
      if (typeof onVolver === 'function') {
        onVolver();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('irAAvances', { detail: p }));
        }, 0);
      }
    };
    return () => { window.setProyectoSeleccionado = null; };
  }, [onVolver]);

  return (
    <section className="mei-section">
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16 }}>&larr; Volver a proyectos</button>
      <h2>Avances de: {proyecto.nombre}</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="proyecto-select"><strong>Seleccionar proyecto:</strong></label>
        <select id="proyecto-select" value={proyecto.id} onChange={handleProyectoChange} style={{ marginLeft: 8 }}>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarAvance}>
          <textarea
            placeholder="Descripción del avance"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Autor (opcional)"
            value={autor}
            onChange={e => setAutor(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={e => setArchivo(e.target.files[0])}
            style={{ marginTop: 8, marginBottom: 8 }}
          />
          <button type="submit" disabled={agregando || !descripcion}>
            Agregar avance
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {cargando && <div>Cargando...</div>}
      <ul className="mei-avances-list">
        {avances.map(av => (
          <li key={av.id} className="mei-avance-item">
            <div className="mei-avance-desc">
              {editandoId === av.id ? (
                <>
                  <textarea
                    value={editDescripcion}
                    onChange={e => setEditDescripcion(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <input
                    type="text"
                    value={editAutor}
                    onChange={e => setEditAutor(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={e => setEditArchivo(e.target.files[0])}
                    style={{ marginTop: 8, marginBottom: 8 }}
                  />
                  <button className="mei-ver-todos-btn" onClick={() => guardarEdicion(av.id)} disabled={!editDescripcion}>
                    Guardar
                  </button>
                  <button className="mei-delete-btn" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  {av.descripcion}
                  <div className="mei-avance-date">
                    {av.autor && <>Autor: {av.autor} <br /></>}
                    Fecha: {new Date(av.fecha).toLocaleString()}
                  </div>
                  {av.archivo_url && (
                    <div style={{ marginTop: 8 }}>
                      {av.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                        <img src={av.archivo_url} alt="Imagen avance" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : av.archivo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={av.archivo_url} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : (
                        <a href={av.archivo_url} target="_blank" rel="noopener noreferrer">Ver documento</a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {clienteAuth && editandoId !== av.id && (
              <>
                <button className="mei-delete-btn" onClick={() => iniciarEdicion(av)} title="Editar">✏️</button>
                <button className="mei-delete-btn" onClick={() => eliminarAvance(av.id)} title="Eliminar">🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

}
export default App