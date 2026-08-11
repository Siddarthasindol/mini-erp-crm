import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', color: '#64748b' }}>
      <div>Loading data...</div>
    </div>
  );
};
