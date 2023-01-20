import { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Upload, AlertTriangle, Download } from 'react-feather';
import * as  _ from 'lodash';

export default function Home() {
  let r = useRef();

  const [selectedFiles, setSelectedFiles] = useState({});

  const [finalData, setFinalData] = useState({});

  const [showProcessedFiles, setShowProcessedFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    if (_.keys(finalData).length > 0) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(finalData.tssData);
      const ws1 = XLSX.utils.json_to_sheet(finalData.noNFARecords);
      const ws2 = XLSX.utils.json_to_sheet(finalData.finraPData);
      XLSX.utils.book_append_sheet(wb, ws, 'Full data');
      XLSX.utils.book_append_sheet(wb, ws1, 'NFA name miss match');
      XLSX.utils.book_append_sheet(wb, ws2, 'FINRA PRINCIPALS DATA');
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
      showNotification('error', `Your files have been processed. Please upload new files.`);
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
        let finraPData = d.data.modFINRAPData;
        showNotification('info', `Files have been Processed!`);
        setFinalData({ tssData: f, noNFARecords: f1, finraPData });
      });
    }
  }
  const uploadFiles = (event) => {
    event.preventDefault();
    setShowResults(false);
    const fileNames = _.map(_.values(selectedFiles), file => file.name);
    const areFilenamesCorrect = _.intersection(fileNames, ['TSS.xlsx', 'NFA.xlsx', 'FINRA.xlsx','FINRA_P.xlsx' ]).length == 4;

    if (_.keys(selectedFiles).length === 0) {
      showNotification('error', 'please select files to upload.');
    }
    else if (isUploading) {
      showNotification('error', 'Files are uploading Please wait.');
    }
    else if (_.keys(selectedFiles).length !== 4) {
      showNotification('error', `You are trying to upload ${_.keys(selectedFiles).length} files, system allows you exactly 4 files to be uploaded (with .xlsx extension).`);
    }
    else if (!areFilenamesCorrect) {
      showNotification('error', `Please upload files with 'TSS.xlsx', 'NFA.xlsx' and 'FINRA.xlsx' names.`);
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
        setShowProcessedFiles(true);
        showNotification('info', 'Files have been uploaded!')
      }).catch(({ response }) => {
        showNotification('error', response.data.err);
      }).finally(() => {
        setIsUploading(false);
      })
    }
  }

  const showNotification = (type, message) => {
    toast[type](message);
  }

  return (
    <>
      <div className='container mx-auto pt-8 max-w-3xl h-screen'>
        <div className='text-white text-lg p-6 mb-4 leading-loose tracking-wider flex items-center bg-red-400'><AlertTriangle className='mr-6 h-14 w-24 font-bold' />
          <p>
            This is to add <span className='font-bold'>NFA Id</span> and <span className='font-bold'>CRD Id</span> to <span className='font-bold'>TSS.xlsx</span>.
            Uploading files should be named as <span className='font-bold'>TSS.xlsx</span>,
            <span className='font-bold'>NFA.xlsx</span>, <span className='font-bold'>FINRA.xlsx</span> and <span className='font-bold'>FINRA_P.xlsx</span>, Please Make sure all files are closed before uploading.
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