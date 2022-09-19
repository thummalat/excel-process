import { useRef, useState } from 'react'
import axios from 'axios';
import { useExcelDownloder } from 'react-xls';
import { ToastContainer, toast } from 'react-toastify';

export default function Home() {
  const { ExcelDownloder, Type } = useExcelDownloder();
  let r = useRef();

  const [selectedFiles, setSelectedFiles] = useState({});
  const [finalData, setFinalData] = useState(undefined);
  const [showProcessedFiles, setShowProcessedFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const handleFileSelecrtionChange = (event) => {
    setShowProcessedFiles(false);
    setShowResults(false);
    setFinalData(undefined);
    setSelectedFiles(event.target.files);
  }
  const processFiles = (event) => {
    event.preventDefault();
    if (showResults) {
      toast.error('Your files have been processed. Please upload new files.');
    }
    else {
      setIsProcessing(true);
      axios.get('/api/process').then((d) => {
        r.current.value = "";
        setIsProcessing(false);
        setSelectedFiles({});
        setShowResults(true);
        let f = { Sheet1: d.data.data }
        toast.info("Files have been Processed!");
        setFinalData(f);
      });
    }
  }
  const uploadFiles = (event) => {
    event.preventDefault();
    setShowResults(false);
    if (Object.keys(selectedFiles).length === 0) {
      toast.error('please select files to upload.');
    }
    else if (isUploading) {
      toast.error('Files are uploading Please wait.');
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
        toast.info("Files have been uploaded!");
      })
    }
  }

  return (
    <>
      <div className='container mx-auto pt-8 max-w-2xl h-screen'>
        <p className=' text-red-600 mb-4 leading-loose tracking-normal'>This is to add <span className='font-bold'>NFA Id</span> and <span className='font-bold'>CRD Id</span> to <span className='font-bold'>TSS.xlsx</span>. Uploading files should be named as <span className='font-bold'>TSS.xlsx</span>,  <span className='font-bold'>NFA.xlsx</span> and <span className='font-bold'>FINRA.xlsx</span>  </p>
        <form className='bg-slate-100 p-4 pt-6 shadow-xl border rounded border-slate-300 border-solid'>
          <label htmlFor="files" className='pr-4 font-bold tracking-wide'>Select files:</label>
          <input type='file' accept=".xlsx" ref={r} className='font-bold' multiple name="files" onChange={handleFileSelecrtionChange} id="files"></input>
          {selectedFiles.length > 0 ? <ul className='mt-8 mb-8 p-4 bg-slate-200'>
            <p className='font-bold text-center text-l pb-4'>Total files selected - {selectedFiles.length}</p>
            {Object.values(selectedFiles).map((file, index) => <li key={index} className='font-light pb-3 tracking-wide'>{file.name}</li>)}
          </ul> : ''}

          <div className='flex justify-end mt-8'>
            {showProcessedFiles ? <button onClick={processFiles} className='ml-4 tracking-wide border-solid border bg-slate-100 px-6 py-1 mt-3 hover:bg-slate-200 border-slate-500' type='submit'>{isProcessing ? 'Processing..' : 'Process files'}</button> : <button onClick={uploadFiles} className='tracking-wide border-solid border text-white bg-slate-700 px-6 py-1 mt-3 hover:bg-slate-600 border-slate-500' type='submit'>{isUploading ? 'Uploading...' : 'Upload files'}</button>}
          </div>
        </form>
        {showResults ? <div className='mt-8 p-4 bg-slate-100 tracking-wide flex justify-center'>
          {finalData ?
            <ExcelDownloder
              className="px-6 py-1 bg-slate-700 text-white border border-solid"
              data={finalData}
              filename={'TSS_FINAL'}
              type={Type.Button}>
              Download Results
            </ExcelDownloder> : ''}
        </div> : ''}

        <ToastContainer />

      </div>

    </>
  )
}
