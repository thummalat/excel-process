import { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { useExcelDownloder } from 'react-xls';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Upload, AlertTriangle, Download } from 'react-feather';



export default function Home() {
  const { ExcelDownloder, Type } = useExcelDownloder();
  let r = useRef();

  const [selectedFiles, setSelectedFiles] = useState({});

  const [finalData, setFinalData] = useState({});

  const [showProcessedFiles, setShowProcessedFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    if (Object.keys(finalData).length > 0) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(finalData.tssData);
      const ws1 = XLSX.utils.json_to_sheet(finalData.noNFARecords);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.utils.book_append_sheet(wb, ws1, 'Sheet2');
      XLSX.writeFile(wb, 'Final.xlsx');
    }
  }, [finalData]);

  const handleFileSelecrtionChange = (event) => {
    setShowProcessedFiles(false);
    setShowResults(false);
    setFinalData({});
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
        let f = d.data.data;
        let f1 = d.data.noNFARecords;
        toast.info("Files have been Processed!");
        setFinalData({tssData:f, noNFARecords:f1});
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
      <div className='container mx-auto pt-8 max-w-3xl h-screen'>
        <div className='text-white text-lg p-6 mb-4 leading-loose tracking-wider flex items-start bg-red-400'><AlertTriangle className='mr-2 pt-2' />
          <p>
            This is to add <span className='font-bold'>NFA Id</span> and <span className='font-bold'>CRD Id</span> to <span className='font-bold'>TSS.xlsx</span>.
            Uploading files should be named as <span className='font-bold'>TSS.xlsx</span>,
            <span className='font-bold'>NFA.xlsx</span> and <span className='font-bold'>FINRA.xlsx</span>
          </p>
        </div>
        <form className='bg-slate-100 p-10 shadow-xl border rounded border-slate-300 border-solid'>
          <label htmlFor="files" className='pr-4 font-bold tracking-wide'>Select files:</label>
          <input type='file' accept=".xlsx" ref={r} className='font-bold' multiple name="files" onChange={handleFileSelecrtionChange} id="files"></input>
          {selectedFiles.length > 0 ? <ul className='mt-8 mb-8 p-4 bg-slate-200'>
            <p className='font-bold text-center text-l pb-4'>Total files selected - {selectedFiles.length} </p>
            {Object.values(selectedFiles).map((file, index) => <li key={index} className='font-light pb-3 tracking-wide'>{file.name}</li>)}
          </ul> : ''}

          <div className='flex justify-end mt-8'>
            {showProcessedFiles ? <button onClick={processFiles} className='ml-4 
            tracking-wide border-solid border bg-slate-100 px-6 py-2 mt-3 
            hover:bg-slate-200 border-slate-500 flex align-middle' type='submit'>
              <Download className='mr-2' />{isProcessing ? 'Processing..' :
                'Process files and Download'}</button> :
              <button onClick={uploadFiles} className='tracking-wide border-solid border text-white bg-slate-700 px-6 py-2 mt-3 
              hover:bg-slate-600 border-slate-500 flex align-middle' type='submit'><Upload className='mr-2' />{isUploading ? <>Uploading...</> :
                  'Upload files'}</button>}
          </div>
        </form>
        <ToastContainer />
      </div>
    </>
  )
}