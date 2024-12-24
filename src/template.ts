export function html(poem: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Poem</title>
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
    #poem-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    }
  </style>
</head>
<body>
  <canvas id="shader-background"></canvas>
  <div id="poem-container">
    <pre>${poem}</pre>
  </div>
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
  </script>
</body>
</html>
  `;
}