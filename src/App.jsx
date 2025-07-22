import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Swal from 'sweetalert2'

const CLIENTE_PASSWORD = 'mei2024'

function App() {
  const [vista, setVista] = useState('proyectos') // 'proyectos' o 'avances'
  const [proyectos, setProyectos] = useState([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [clienteAuth, setClienteAuth] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginError, setLoginError] = useState(null)

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
    setShowLogin(true)
    setLoginError(null)
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

  return (
    <div className="mei-container">
      <header className="mei-header">
        <h1>La Agenda de Mei</h1>
        <nav>
          <button className={vista === 'proyectos' ? 'active' : ''} onClick={volverAProyectos} disabled={vista === 'proyectos'}>
            Proyectos
          </button>
          <button className={vista === 'avances' ? 'active' : ''} onClick={() => setVista('avances')} disabled={vista === 'avances' || !proyectoSeleccionado}>
            Avances
          </button>
          <button onClick={handleClienteClick} disabled={clienteAuth} style={{ marginLeft: 'auto' }}>
            Cliente
          </button>
          {clienteAuth && (
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          )}
        </nav>
      </header>
      <main>
        {showLogin && (
          <LoginModal onLogin={handleLogin} error={loginError} onClose={() => setShowLogin(false)} />
        )}
        {vista === 'proyectos' && (
          <VistaProyectos
            proyectos={proyectos}
            onAgregar={obtenerProyectos}
            onVerAvances={irAAvances}
            cargando={cargando}
            error={error}
            clienteAuth={clienteAuth}
          />
        )}
        {vista === 'avances' && proyectoSeleccionado && (
          <VistaAvances
            proyecto={proyectoSeleccionado}
            onVolver={volverAProyectos}
            clienteAuth={clienteAuth}
          />
        )}
      </main>
      <footer className="mei-footer">
        <span>© {new Date().getFullYear()} La Agenda de Mei</span>
      </footer>
    </div>
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
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [errorLocal, setErrorLocal] = useState(null)

  async function agregarProyecto(e) {
    e.preventDefault()
    setAgregando(true)
    setErrorLocal(null)
    const { error } = await supabase
      .from('proyectos')
      .insert([{ nombre, descripcion }])
    if (error) setErrorLocal(error.message)
    else Swal.fire('¡Proyecto agregado!', '', 'success')
    setNombre('')
    setDescripcion('')
    await onAgregar()
    setAgregando(false)
  }

  async function eliminarProyecto(id) {
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esto eliminará también todos sus avances.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#a77ff2',
      cancelButtonColor: '#f7d6e0',
    })
    if (!result.isConfirmed) return
    const { error } = await supabase.from('proyectos').delete().eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Eliminado', 'Proyecto eliminado', 'success')
    await onAgregar()
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
          <button type="submit" disabled={agregando || !nombre}>
            Agregar proyecto
          </button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {errorLocal && <div style={{ color: 'red' }}>{errorLocal}</div>}
      {cargando && <div>Cargando...</div>}
      <ul>
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
                    Creado: {new Date(proy.fecha_creacion).toLocaleString()}
                  </div>
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
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editAutor, setEditAutor] = useState('')
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
    const { error } = await supabase
      .from('avances')
      .insert([{ proyecto_id: proyecto.id, descripcion, autor }])
    if (error) setError(error.message)
    else Swal.fire('¡Avance agregado!', '', 'success')
    setDescripcion('')
    setAutor('')
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
  }

  async function guardarEdicion(id) {
    const { error } = await supabase
      .from('avances')
      .update({ descripcion: editDescripcion, autor: editAutor })
      .eq('id', id)
    if (error) Swal.fire('Error', error.message, 'error')
    else Swal.fire('Guardado', 'Avance actualizado', 'success')
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
    await obtenerAvances()
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditDescripcion('')
    setEditAutor('')
  }

  return (
    <section className="mei-section">
      <button className="mei-ver-todos-btn" onClick={onVolver} style={{ marginBottom: 16 }}>&larr; Volver a proyectos</button>
      <h2>Avances de: {proyecto.nombre}</h2>
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

export default App 