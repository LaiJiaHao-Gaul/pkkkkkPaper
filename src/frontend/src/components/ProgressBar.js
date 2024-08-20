import React from 'react';

function ProgressBar({ current, total }) {
  const progress = (current / total) * 100;
  return (
    <div className="ProgressBar">
      <div className="progress" style={{ width: `${progress}%` }}></div>
      <div className="progress-text">
        {current}/{total}
      </div>
    </div>
  );
}

export default ProgressBar;
