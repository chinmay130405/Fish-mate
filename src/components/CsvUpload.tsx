import React, { useState } from 'react';

const CsvUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/upload_csv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error || 'Upload complete');
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="font-bold mb-2">Upload Daily PFZ CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        className="mt-2 px-4 py-2 bg-ocean-600 text-white rounded"
        onClick={handleUpload}
      >
        Upload
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default CsvUpload;
