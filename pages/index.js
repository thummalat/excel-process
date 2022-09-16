import { useRef, useState } from 'react'
import axios from 'axios';

export default function Home() {
  let r = useRef();
  const [selectedFiles, setSelectedFiles] = useState({});
  const [showProcessedFiles, setShowProcessedFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const handleFileSelecrtionChange = (event) => {
    setShowProcessedFiles(false);
    setShowResults(false);
    setSelectedFiles(event.target.files);
  }
  const down =()=>{
    axios.get('/api/down').then((d) => {
      
    })
  }
  const processFiles = (event) => {
    event.preventDefault();
    setIsProcessing(true);
    axios.get('/api/process').then((d) => {
      r.current.value = "";
      alert(d.f);
      console.log(d);
      setIsProcessing(false);
      setSelectedFiles({});
      setShowResults(true);
    });
  }
  const uploadFiles = (event) => {
    setShowResults(false);
    event.preventDefault();
    if (Object.keys(selectedFiles).length === 0) {
      alert('please select files to upload');
    }
    else if(isUploading){
      alert('Files are uploading Please wait.');
    }
    else {
      setIsUploading(true);
      var formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
      axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(() => {
        setIsUploading(false);
        setShowProcessedFiles(true);
      })
    }
  }

  return (
    <>
      <div className='container mx-auto mt-8 flex justify-center flex-col max-w-2xl'>
        <p className=' text-red-400 mb-4 leading-loose tracking-normal'>This is to add <span className='font-bold'>NFA Id</span> and <span className='font-bold'>CRD Id</span> to <span className='font-bold'>TSS.xlsx</span>. Uploading files should be named as <span className='font-bold'>TSS.xlsx</span>,  <span className='font-bold'>NFA.xlsx</span> and <span className='font-bold'>FINRA.xlsx</span>  </p>
        <form className='bg-slate-100 p-4 pt-6 shadow-xl border rounded border-slate-300 border-solid'>
          <label htmlFor="files" className='pr-4 font-bold tracking-wide'>Select files:</label>
          <input type='file' accept=".xlsx" ref={r} className='font-bold' multiple name="files" onChange={handleFileSelecrtionChange} id="files"></input>
          {selectedFiles.length > 0 ? <ul className='mt-8 mb-8 p-4 bg-slate-200'>
            <p className='font-bold text-center text-l pb-4'>Total files selected - {selectedFiles.length}</p>
            {Object.values(selectedFiles).map((file, index) => <li key={index} className='font-light pb-3 tracking-wide'>{file.name}</li>)}
          </ul> : ''}

          <div className='flex justify-end mt-8'>
            {showProcessedFiles ? <button onClick={processFiles} className='ml-4 tracking-wide border-solid border bg-sky-50 px-6 py-1 mt-3 hover:bg-sky-100 border-sky-500' type='submit'>{isProcessing?'Processing..':'Process files'}</button> : <button onClick={uploadFiles} className='tracking-wide border-solid border text-white bg-sky-500 px-6 py-1 mt-3 hover:bg-sky-600 border-sky-500' type='submit'>{isUploading?'Uploading...':'Upload files'}</button>}
          </div>
          {showResults ? <div className='mt-8 p-4 bg-sky-50 tracking-wide'>
            <p className='text-l font-bold mb-4'>Processed results:</p>
            <a className='underline underline-offset-4 text-blue-500 pl-4' href="/tmp/TSS_MOD.xlsx">Click here</a> to download processed file.
            <button onClick={down}> Download</button>
          </div> : ''}

        </form>
      </div>

    </>
  )
}
