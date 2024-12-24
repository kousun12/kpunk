import { TodayFuture } from "./types";

export function html(latest: TodayFuture): string {
  const hoverTitle = latest.news.map((news) => `- ${news.title}`).join("\n");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lost Futures</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    #shader-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    #future-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    #sound-toggle {
      position: fixed;
      bottom: 10px;
      right: 10px;
      color: white;
      font-family: monospace;
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      font-size: 12px;
      opacity: 0.7;
    }
    #sound-toggle:hover {
      opacity: 1;
    }
    #news-ticker {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      padding: 8px 0;
      font-family: monospace;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
    }
    #news-ticker-content {
      display: inline-block;
      padding-left: 100%;
      animation: ticker linear infinite;
      animation-duration: 30s;
    }
    @keyframes ticker {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-100%, 0, 0); }
    }
    #date-display {
      position: fixed;
      bottom: 10px;
      left: 10px;
      color: white;
      font-family: monospace;
      font-size: 12px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <canvas id="shader-background"></canvas>
  <div id="news-ticker">
    <div id="news-ticker-content">
      ${latest.news.map((news) => `${news.title} • `).join("")}
      ${latest.news.map((news) => `${news.title} • `).join("")}
    </div>
  </div>
  <div id="future-container">
    <pre title="${hoverTitle}">${latest.future}</pre>
  </div>
  <div id="date-display"></div>
  <audio id="ambient-sound" loop>
    <source src="https://media.kpunk.computer/wvts.m4a" type="audio/mp4">
  </audio>
  <button id="sound-toggle">[sound off]</button>
  <script id="vertex-shader" type="x-shader/x-vertex">
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  </script>
  <script id="fragment-shader" type="x-shader/x-fragment">
    precision mediump float;
    uniform float u_time;
    void main() {
      vec2 uv = gl_FragCoord.xy / vec2(800, 600);
      float color = 0.5 + 0.3 * sin(uv.x * 10.0 + u_time) * sin(uv.y * 10.0 - u_time);
      gl_FragColor = vec4(vec3(color), 1.0);
    }
  </script>
  <script>
    function initShader() {
      const canvas = document.getElementById('shader-background');
      const gl = canvas.getContext('webgl');
      
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, document.getElementById('vertex-shader').textContent);
      gl.compileShader(vertexShader);
      
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, document.getElementById('fragment-shader').textContent);
      gl.compileShader(fragmentShader);
      
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      
      function render(time) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        gl.useProgram(program);
        gl.uniform1f(timeLocation, time * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(render);
    }
    initShader();

    // Calculate news ticker scroll speed based on content width
    const tickerContent = document.getElementById('news-ticker-content');
    function adjustTickerSpeed() {
      const contentWidth = tickerContent.offsetWidth;
      const baseSpeed = 35; // pixels per second
      const duration = contentWidth / baseSpeed;
      tickerContent.style.animationDuration = `{duration}s`;
    }
    adjustTickerSpeed();
    window.addEventListener('resize', adjustTickerSpeed);

    const dateDisplay = document.getElementById('date-display');
    dateDisplay.textContent = new Date().toISOString().split('T')[0];

    const audio = document.getElementById('ambient-sound');
    const soundToggle = document.getElementById('sound-toggle');
    let soundOn = true;

    // Try to autoplay
    audio.play().then(() => {
      soundToggle.textContent = '[sound on]';
    }).catch(() => {
      soundOn = false;
      soundToggle.textContent = '[sound off]';
    });

    soundToggle.addEventListener('click', () => {
      soundOn = !soundOn;
      if (soundOn) {
        audio.play();
        soundToggle.textContent = '[sound on]';
      } else {
        audio.pause();
        soundToggle.textContent = '[sound off]';
      }
    });
  </script>
</body>
</html>
  `;
}
