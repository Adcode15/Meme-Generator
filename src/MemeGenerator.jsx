import React, { useEffect, useRef, useState } from 'react';
import './meme.css';

const MemeGenerator = () => {
  const [memes, setMemes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [topText, setTopText] = useState('Top Text');
  const [bottomText, setBottomText] = useState('Bottom Text');
  const [topPos, setTopPos] = useState({ x: 50, y: 50 });
  const [bottomPos, setBottomPos] = useState({ x: 50, y: 300 });
  const [dragTarget, setDragTarget] = useState(null);
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Impact');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch('https://api.imgflip.com/get_memes')
      .then(res => res.json())
      .then(data => setMemes(data.data.memes.slice(0, 20)));
  }, []);

  const handleMouseDown = (target) => (e) => {
    setDragTarget({ name: target, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY });
  };

  const handleMouseMove = (e) => {
    if (!dragTarget) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragTarget.offsetX;
    const newY = e.clientY - rect.top - dragTarget.offsetY;

    if (dragTarget.name === 'top') setTopPos({ x: newX, y: newY });
    if (dragTarget.name === 'bottom') setBottomPos({ x: newX, y: newY });
  };

  const handleMouseUp = () => setDragTarget(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selected.url;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.textAlign = 'left';

      const scaleX = img.width / containerRef.current.offsetWidth;
      const scaleY = img.height / containerRef.current.offsetHeight;

      ctx.fillText(topText.toUpperCase(), topPos.x * scaleX, topPos.y * scaleY);
      ctx.strokeText(topText.toUpperCase(), topPos.x * scaleX, topPos.y * scaleY);

      ctx.fillText(bottomText.toUpperCase(), bottomPos.x * scaleX, bottomPos.y * scaleY);
      ctx.strokeText(bottomText.toUpperCase(), bottomPos.x * scaleX, bottomPos.y * scaleY);
    };
  };

  const downloadMeme = () => {
    drawCanvas();
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = 'meme.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }, 300);
  };

  return (
    <div className="meme-box" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <h1>Meme Generator 🖼️</h1>

      <label>Select a meme template:</label>
      <select
        onChange={(e) => {
          const meme = memes.find((m) => m.id === e.target.value);
          setSelected(meme);
        }}
      >
        <option value="">-- Choose a meme --</option>
        {memes.map((meme) => (
          <option key={meme.id} value={meme.id}>
            {meme.name}
          </option>
        ))}
      </select>

      <div className="inputs">
        <input
          type="text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
        />
        <input
          type="text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
        />
      </div>

      <div className="customization-panel">
        <label>
          Font Size:
          <input
            type="range"
            min="20"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </label>

        <label>
          Font Color:
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
          />
        </label>

        <label>
          Font Style:
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            <option value="Impact">Impact</option>
            <option value="Arial">Arial</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </label>
      </div>

      {selected && (
        <div className="draggable-container" ref={containerRef}>
          <img src={selected.url} alt="meme" />
          <div
            className="draggable-text"
            style={{
              left: topPos.x,
              top: topPos.y,
              color: fontColor,
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
            }}
            onMouseDown={handleMouseDown('top')}
          >
            {topText}
          </div>
          <div
            className="draggable-text"
            style={{
              left: bottomPos.x,
              top: bottomPos.y,
              color: fontColor,
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
            }}
            onMouseDown={handleMouseDown('bottom')}
          >
            {bottomText}
          </div>
        </div>
      )}

      {selected && (
        <button onClick={downloadMeme}>Download Meme</button>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default MemeGenerator;
