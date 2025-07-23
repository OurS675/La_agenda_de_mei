import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import './responsive.css'
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
    <div className="mei-container" style={{ minHeight: '100vh', background: '#f5f3fa' }}>
      <header className="mei-header" style={{ boxShadow: '0 2px 8px #eee', marginBottom: 24, padding: '16px 0', background: '#fff', borderRadius: 0 }}>
        <div className="mei-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', padding: '0 16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, color: '#a77ff2', margin: 0, letterSpacing: 1, flex: 1, minWidth: 180 }}>La Agenda de Mei</h1>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={vista === 'proyectos' ? 'active' : ''} onClick={volverAProyectos} disabled={vista === 'proyectos'} style={{ minWidth: 110, textAlign: 'center', padding: '8px 0' }}>
              Proyectos
            </button>
            <button onClick={handleClienteClick} style={{ minWidth: 110, textAlign: 'center', padding: '8px 0' }}>
              Cliente
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
          <VistaCliente onVolver={volverAProyectos} />
        ) : null}
      </main>
      <footer className="mei-footer">
        <span style={{ marginTop: 40, padding: '18px 0', color: '#a77ff2', textAlign: 'center', borderRadius: 0, fontWeight: 600, fontSize: 15, letterSpacing: 1 }}>© {new Date().getFullYear()} La Agenda de Mei</span>
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
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editEstado, setEditEstado] = useState('activo')
  const [editArchivo, setEditArchivo] = useState(null)
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
      .insert([{ nombre, descripcion, estado, archivo_url: archivoUrl }]);
    console.log('Resultado insert proyecto:', { insertData, error });
    if (error) setErrorLocal(error.message)
    else Swal.fire('¡Proyecto agregado!', '', 'success')
    setNombre('')
    setDescripcion('')
    setEstado('activo')
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
    setEditEstado(proy.estado || 'activo')
    setEditArchivo(null)
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
    await onAgregar()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
    setEditArchivo(null)
  }

  return (
    <section className="mei-section" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: '5vw 4vw', minWidth: 0 }}>
      <h2 style={{ color: '#a77ff2', marginBottom: 20, fontWeight: 700 }}>Proyectos</h2>
      {/* Formulario solo para el cliente autenticado */}
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarProyecto} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          {erroresForm.nombre && <div style={{ color: 'red', marginBottom: 4 }}>{erroresForm.nombre}</div>}
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, minHeight: 60 }}
          />
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={e => setArchivo(e.target.files[0])}
            style={{ marginTop: 8, marginBottom: 8 }}
          />
          <button type="submit" disabled={agregando} style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
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
          <li style={{ color: '#a77ff2', textAlign: 'center', marginTop: 24 }}>
            No hay proyectos registrados.
            <br />
            <span style={{ fontSize: '0.9em', color: '#888' }}>
              (¿No aparecen proyectos? Revisa la consola del navegador para ver detalles de la respuesta de Supabase)
            </span>
          </li>
        )}
        {proyectos.map(proy => (
          <li key={proy.id} className="mei-avance-item" style={{ background: '#faf8ff', borderRadius: 10, marginBottom: 18, boxShadow: '0 1px 6px #eee', padding: '5vw 4vw', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
            <div className="mei-avance-desc" style={{ flex: 1, minWidth: 0 }}>
              {editandoId === proy.id ? (
                <div style={{ background: '#f0eaff', borderRadius: 10, padding: '18px 12px', marginBottom: 8, boxShadow: '0 1px 4px #e5d8fa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                      placeholder="Nombre del proyecto"
                    />
                    {erroresEdit.nombre && <div style={{ color: 'red', marginBottom: 4 }}>{erroresEdit.nombre}</div>}
                    <textarea
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15, minHeight: 50 }}
                      placeholder="Descripción"
                    />
                    <select
                      value={editEstado}
                      onChange={e => setEditEstado(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                    >
                      <option value="activo">En progreso</option>
                      <option value="pausado">Pausado</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={e => setEditArchivo(e.target.files[0])}
                      style={{ marginTop: 8, marginBottom: 8 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button className="mei-ver-todos-btn" onClick={() => guardarEdicion(proy.id)} disabled={!editNombre} style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', minWidth: 90, fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', textAlign: 'center' }}>
                      Guardar
                    </button>
                    <button className="mei-delete-btn" onClick={cancelarEdicion} style={{ background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '', minWidth: 90, fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>{proy.nombre}</strong>
                  {proy.archivo_url && (
                    <div style={{ margin: '12px 0' }}>
                      {proy.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp|png)$/i) ? (
                        <img src={proy.archivo_url} alt="Imagen proyecto" style={{ maxWidth: '350px', maxHeight: '350px', borderRadius: 8 }} />
                      ) : proy.archivo_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={proy.archivo_url} controls style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: 8 }} />
                      ) : (
                        <a href={proy.archivo_url} target="_blank" rel="noopener noreferrer">Ver documento</a>
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
                        style={{ marginLeft: 8 }}
                      >
                        <option value="activo">En progreso</option>
                        <option value="pausado">Pausado</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    ) : (proy.estado || 'activo')}
                    <br />
                    Creado: {proy.fecha_creacion ? new Date(proy.fecha_creacion).toLocaleString() : 'Sin fecha'}
                  </div>
                  <button className="mei-ver-todos-btn" onClick={() => onVerAvances(proy)} style={{ marginTop: 8 }}>
                    Ver avances
                  </button>
                </>
              )}
            </div>
            {clienteAuth && editandoId !== proy.id && (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end', minWidth: 120, marginTop: 8 }}>
                <button className="mei-edit-btn" onClick={() => iniciarEdicion(proy)} title="Editar" style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 90, textAlign: '' }}>Editar</button>
                <button className="mei-delete-btn" onClick={() => eliminarProyecto(proy.id)} title="Eliminar" style={{ background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 50, textAlign: 'center' }}>🗑️</button>
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
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editAutor, setEditAutor] = useState('')
  const [editArchivo, setEditArchivo] = useState(null)
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
    await obtenerAvances()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
  }


  return (
    <section className="mei-section" style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: '5vw 4vw', minWidth: 0 }}>
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16, background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}>&larr; Volver a proyectos</button>
      <h2 style={{ color: '#a77ff2', marginBottom: 20, fontWeight: 700 }}>Avances de: {proyecto.nombre}</h2>
      {/* Filtro de seleccionar proyecto eliminado */}
      {clienteAuth && (
        <form className="mei-upload-form" onSubmit={agregarAvance} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <textarea
            placeholder="Descripción del avance"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, minHeight: 60 }}
          />
          {erroresForm.descripcion && <div style={{ color: 'red', marginBottom: 4 }}>{erroresForm.descripcion}</div>}
          <input
            type="text"
            placeholder="Autor (opcional)"
            value={autor}
            onChange={e => setAutor(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={e => setArchivo(e.target.files[0])}
            style={{ marginTop: 8, marginBottom: 8 }}
          />
          <button type="submit" disabled={agregando} style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16 }}>
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
                <div style={{ background: '#f0eaff', borderRadius: 10, padding: '18px 12px', marginBottom: 8, boxShadow: '0 1px 4px #e5d8fa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15, minHeight: 50 }}
                      placeholder="Descripción del avance"
                    />
                    {erroresEdit.descripcion && <div style={{ color: 'red', marginBottom: 4 }}>{erroresEdit.descripcion}</div>}
                    <input
                      type="text"
                      value={editAutor}
                      onChange={e => setEditAutor(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                      placeholder="Autor (opcional)"
                    />
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={e => setEditArchivo(e.target.files[0])}
                      style={{ marginTop: 8, marginBottom: 8 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button className="mei-ver-todos-btn" onClick={() => guardarEdicion(av.id)} disabled={!editDescripcion} style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa' }}>
                      Guardar
                    </button>
                    <button className="mei-delete-btn" onClick={cancelarEdicion} style={{ background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '8px 24px', minWidth: 90, fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', whiteSpace: 'nowrap' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {av.descripcion}
                  {/* Imagen/video/enlace debajo de la descripción y arriba de autor/fecha */}
                  {av.archivo_url && (
                    <div style={{ marginTop: 8 }}>
                      {av.archivo_url.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                        <img src={av.archivo_url} alt="Imagen avance" style={{ maxWidth: '350px', maxHeight: '350px' }} />
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
              <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end', minWidth: 120, marginTop: 8 }}>
                <button className="mei-edit-btn" onClick={() => iniciarEdicion(av)} title="Editar" style={{ background: '#a77ff2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 90 }}>Editar</button>
                <button className="mei-delete-btn" onClick={() => eliminarAvance(av.id)} title="Eliminar" style={{ background: '#f7d6e0', color: '#a77ff2', border: 'none', borderRadius: 6, padding: '', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 2px #e5d8fa', minWidth: 50 }}>🗑️</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

}
export default App