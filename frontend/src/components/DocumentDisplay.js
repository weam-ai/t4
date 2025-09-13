import React from 'react';

const DocumentDisplay = ({ document, topic }) => {
  if (!document) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Learning Document: {topic}
      </h2>
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
          {document}
        </pre>
      </div>
    </div>
  );
};

export default DocumentDisplay;