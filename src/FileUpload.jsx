import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';

function FileUpload({ onFileSelect, clienteAuth }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (!clienteAuth) {
        Swal.fire(
            'Acceso denegado',
            'Solo los clientes pueden subir archivos.',
            'warning'
        );
        return;
    }

    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect, clienteAuth]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    multiple: false
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {
        preview ? 
          <img src={preview} alt="Vista previa" style={{maxWidth: '100%', maxHeight: '200px'}}/> :
          isDragActive ?
            <p>Suelta el archivo aquí ...</p> :
            <p>Arrastra y suelta un archivo aquí, o haz clic para seleccionar uno</p>
      }
    </div>
  );
}

export default FileUpload;