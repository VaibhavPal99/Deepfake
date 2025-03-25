import React, { useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const [sequenceLength, setSequenceLength] = useState(20);
  const [frames, setFrames] = useState([]);

  // Handle video upload and load
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoLoaded(false); // Reset player state
      setFrames([]); // Reset frames
    }
  };

  // When the video loads
  const handleVideoLoad = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = 0; // Start from the beginning
      setVideoLoaded(true);
    }
  };

  // Extract frames from the video
  const handleExtractFrames = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const totalFrames = sequenceLength;
    const duration = video.duration;
    const interval = duration / totalFrames;

    let frameArray = [];
    video.currentTime = 0;

    const captureFrame = (time) => {
      video.currentTime = time;
      return new Promise((resolve) => {
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frameArray.push(canvas.toDataURL("image/jpeg"));
          resolve();
        };
      });
    };

    const extractFrames = async () => {
      for (let i = 0; i < totalFrames; i++) {
        await captureFrame(i * interval);
      }
      setFrames(frameArray);
    };

    extractFrames();
  };

  return (
    <div className="container">
      <header>
        <h1>Synthetic Media Detector</h1>
      </header>

      <div className="upload-box">
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
      </div>

      <div className="frames-section">
        <h2>Extracted Frames</h2>
        <div className="scroll-container">
          {frames.length > 0 ? (
            frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index}`}
                className="frame-thumbnail"
              />
            ))
          ) : (
            <p>No frames extracted</p>
          )}
        </div>
      </div>

      {videoSrc && (
        <div className="video-player">
          <video
            ref={videoRef}
            src={videoSrc}
            width="100%"
            controls
            onLoadedMetadata={handleVideoLoad}
          />
        </div>
      )}

      <div className="slider-box">
        <p>Sequence Length: {sequenceLength}</p>
        <input
          type="range"
          min="1"
          max="100"
          value={sequenceLength}
          onChange={(e) => setSequenceLength(e.target.value)}
        />
      </div>

      <button className="upload-btn" onClick={handleExtractFrames}>
        Upload
      </button>
    </div>
  );
};

export default App;
