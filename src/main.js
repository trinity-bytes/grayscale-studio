/**
 * ==========================================
 * COMPOSITION ROOT (Entry Point)
 * ==========================================
 * Punto de entrada principal de la aplicación GrayScale Studio.
 * Orquesta la inyección de dependencias siguiendo los principios de
 * Clean Architecture / DDD. Espera a que OpenCV.js (WebAssembly) esté
 * completamente cargado antes de inicializar la aplicación.
 *
 * Flujo de inicialización:
 * 1. ThemeManager.init() — Restaura el tema del usuario
 * 2. Espera a que OpenCV.js esté listo (cv.Mat disponible)
 * 3. Oculta el overlay de carga
 * 4. Inyecta dependencias: View → UseCases → Processor → Controller
 * 5. Inicializa el Konami Code (Easter Egg)
 *
 * @module src/main
 */

import { MainView } from "./presentation/views/MainView.js";
import { MainController } from "./presentation/controllers/MainController.js";
import { LoadAndValidateImageUseCase } from "./application/LoadAndValidateImageUseCase.js";
import { EqualizeImageUseCase } from "./application/EqualizeImageUseCase.js";
import { ExpandImageUseCase } from "./application/ExpandImageUseCase.js";
import { ChartJsRenderer } from "./infrastructure/chart/ChartJsRenderer.js";
import { OpenCvImageProcessor } from "./infrastructure/opencv/OpenCvImageProcessor.js";
import { ThemeManager } from "./shared/utils/ThemeManager.js";
import "./presentation/components/index.js";
import "./shared/styles/main.css";
/**
 * Inicializa la aplicación GrayScale Studio.
 * Espera a que OpenCV.js esté completamente cargado en memoria,
 * luego inyecta todas las dependencias y crea el controlador principal.
 */
function bootstrapApp() {
  ThemeManager.init();
  console.log("Inicializando aplicación GrayScale Master en capas limpias...");

  const checkOpenCvReady = setInterval(() => {
    if (typeof cv !== "undefined" && cv.Mat) {
      clearInterval(checkOpenCvReady);
      console.log("OpenCV.js Engine 100% activo y puro.");

      const loaderOverlay = document.getElementById("loader-overlay");
      if (loaderOverlay) {
        loaderOverlay.classList.remove("active");
      }

      const mainView = new MainView();

      const processor = new OpenCvImageProcessor();
      const loadAndValidateUseCase = new LoadAndValidateImageUseCase(processor);
      const equalizeUseCase = new EqualizeImageUseCase(processor);
      const expandUseCase = new ExpandImageUseCase(processor);
      const chartRenderer = new ChartJsRenderer();

      const appController = new MainController(
        mainView,
        loadAndValidateUseCase,
        equalizeUseCase,
        expandUseCase,
        chartRenderer,
      );

      initKonamiCode();
    }
  }, 100);
}

/**
 * Detecta la secuencia del Código Konami (↑↑↓↓←→←→BA)
 * y activa el efecto de explosión con terminal retro y juego Snake.
 */
function initKonamiCode() {
  const konamiPattern = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let currentIdx = 0;

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const expectedKey = konamiPattern[currentIdx].toLowerCase();

    if (key === expectedKey) {
      currentIdx++;
      if (currentIdx === konamiPattern.length) {
        currentIdx = 0;
        console.log('🎮 ¡Código Konami Activado!');
        triggerExplosionEffect();
      }
    } else {
      currentIdx = (key === konamiPattern[0].toLowerCase()) ? 1 : 0;
    }
  });
}

/**
 * Efecto de explosión de pantalla completa que limpia el DOM y muestra
 * una terminal retro con estilo CRT y el minijuego de Snake.
 */
function triggerExplosionEffect() {
  // --- 1. Inject explosion CSS ---
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translate(0,0) rotate(0deg);}
      10%{transform:translate(-8px,5px) rotate(-2deg);}
      20%{transform:translate(10px,-8px) rotate(2deg);}
      30%{transform:translate(-12px,10px) rotate(-3deg);}
      40%{transform:translate(14px,-6px) rotate(3deg);}
      50%{transform:translate(-10px,12px) rotate(-2deg);}
      60%{transform:translate(12px,-10px) rotate(2deg);}
      70%{transform:translate(-8px,8px) rotate(-1deg);}
      80%{transform:translate(8px,-4px) rotate(1deg);}
      90%{transform:translate(-4px,6px) rotate(-1deg);}
    }
    @keyframes flyAway {
      0%{transform:translate(0,0) scale(1);opacity:1;}
      100%{opacity:0;transform:var(--fly-target) scale(0.1);}
    }
    .konami-shake { animation: shake 0.6s ease-in-out; }
    .konami-fly { animation: flyAway 0.9s ease-in forwards; }

    /* RETRO CRT TERMINAL */
    body.retro-mode {
      background:#000;
      margin:0;
      overflow:hidden;
      font-family:'Courier New',monospace;
    }
    .crt-overlay {
      position:fixed;inset:0;
      background: repeating-linear-gradient(
        to bottom,
        rgba(0,0,0,0.04) 0px,
        rgba(0,0,0,0.04) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events:none;z-index:9999;
    }
    .crt-vignette {
      position:fixed;inset:0;
      background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.7) 100%);
      pointer-events:none;z-index:9998;
    }
    .retro-terminal {
      position:fixed;inset:0;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:24px;padding:24px;
      color:#00ff41;
      text-shadow:0 0 8px #00ff41,0 0 20px #00ff4188;
      overflow:hidden;
    }
    .retro-title {
      font-size:clamp(18px,3vw,32px);font-weight:bold;letter-spacing:0.3em;
      text-align:center;
      animation: flicker 3s infinite;
    }
    @keyframes flicker{0%,95%,100%{opacity:1;}96%{opacity:0.2;}98%{opacity:1;}99%{opacity:0.3;}}
    .retro-grid {
      display:grid;grid-template-columns:1fr 1fr;gap:20px;
      width:100%;max-width:900px;
    }
    .retro-panel {
      border:1px solid #00ff4166;
      padding:16px;border-radius:4px;
      background:rgba(0,255,65,0.03);
    }
    .retro-panel-title {
      font-size:10px;letter-spacing:0.15em;color:#00ff41aa;
      margin-bottom:12px;border-bottom:1px solid #00ff4133;padding-bottom:6px;
    }
    .retro-info-line{font-size:12px;line-height:1.8;color:#00ff41cc;}
    .retro-info-line span{color:#00ff41;font-weight:bold;}
    #retro-snake-canvas{border:1px solid #00ff4166;display:block;cursor:none;}
    .snake-score{font-size:11px;letter-spacing:0.1em;color:#00ff41aa;margin-bottom:6px;}
    .retro-footer{
      display:flex;align-items:center;gap:16px;
      font-size:11px;letter-spacing:0.1em;color:#00ff4188;
    }
    .retro-restart-btn{
      background:transparent;border:1px solid #00ff4188;color:#00ff41;
      padding:6px 20px;font-family:inherit;font-size:12px;letter-spacing:0.1em;
      cursor:pointer;transition:all 0.2s;border-radius:2px;
    }
    .retro-restart-btn:hover{background:#00ff4122;border-color:#00ff41;box-shadow:0 0 12px #00ff4144;}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    .blink{animation:blink 1s step-end infinite;}
  `;
  document.head.appendChild(style);

  // --- 2. Synthesize 8-bit explosion sound ---
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  } catch (e) { /* Audio not supported */ }

  // --- 3. Shake body ---
  document.body.classList.add('konami-shake');

  // Fly-away targets for each major element
  const flyTargets = [
    'translate(-200%,-300%) rotate(-30deg)',
    'translate(200%,-300%) rotate(30deg)',
    'translate(-300%,200%) rotate(-45deg)',
    'translate(300%,200%) rotate(45deg)',
    'translate(0,-400%) rotate(20deg)',
    'translate(0,400%) rotate(-20deg)',
  ];

  setTimeout(() => {
    const children = Array.from(document.body.children);
    children.forEach((el, i) => {
      el.style.setProperty('--fly-target', flyTargets[i % flyTargets.length]);
      el.classList.add('konami-fly');
    });
  }, 650);

  // --- 4. Clear and render retro terminal ---
  setTimeout(() => {
    document.body.className = 'retro-mode';
    document.body.innerHTML = `
      <div class="crt-overlay"></div>
      <div class="crt-vignette"></div>
      <div class="retro-terminal">
        <div class="retro-title">
          ░▒▓ GRAYSCALE-OS v2.4.1 ▓▒░
        </div>

        <div class="retro-grid">
          <!-- Agradecimientos Panel -->
          <div class="retro-panel">
            <div class="retro-panel-title">[ MENSAJE DE AGRADECIMIENTO ]</div>
            <div class="retro-info-line" style="font-size:13px;line-height:2;">
              ♥ <span>Gracias, Profesor</span>
            </div>
            <div class="retro-info-line" style="font-size:11px;color:#00ff41bb;line-height:1.9;">
              Queremos agradecerle sinceramente<br>
              por todo el apoyo que nos brindó<br>
              durante los exámenes y a lo largo<br>
              de este trabajo.
            </div>
            <br>
            <div class="retro-info-line" style="font-size:11px;color:#00ff41bb;line-height:1.9;">
              Su dedicación y paciencia hicieron<br>
              posible que llegáramos hasta aquí.<br>
              Aprendimos muchísimo gracias a usted.
            </div>
            <br>
            <div class="retro-info-line" style="font-size:11px;color:#00ff41bb;line-height:1.9;">
              Esperamos tenerlo como profesor<br>
              nuevamente en la próxima oportunidad. 🎓
            </div>
            <br>
            <div class="retro-info-line blink">► ¡Muchas gracias por todo, profe!</div>
          </div>

          <!-- Snake Panel -->
          <div class="retro-panel" style="display:flex;flex-direction:column;align-items:center;gap:6px;">
            <div class="retro-panel-title" style="width:100%">[ MINIJUEGO — SNAKE RETRO ]</div>
            <div class="snake-score">PUNTOS: <span id="snake-score">0</span> | RECORD: <span id="snake-highscore">0</span></div>
            <canvas id="retro-snake-canvas" width="280" height="280"></canvas>
            <div style="font-size:10px;color:#00ff4166;letter-spacing:0.05em;margin-top:4px;">
              ↑ ↓ ← → para mover · ENTER para iniciar/reiniciar
            </div>
          </div>
        </div>

        <div class="retro-footer">
          <span class="blink">█</span>
          <span>SISTEMA OPERATIVO ACTIVO — SESIÓN ${new Date().toLocaleTimeString()}</span>
          <button class="retro-restart-btn" onclick="window.location.reload()">⟳ REINICIAR SISTEMA</button>
          <span class="blink">█</span>
        </div>
      </div>
    `;
    initSnakeGame();
  }, 1600);
}

/**
 * Minijuego retro de Snake renderizado en un canvas.
 * Soporta controles de flechas y reinicio con Enter.
 */
function initSnakeGame() {
  const canvas = document.getElementById('retro-snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CELL = 14;
  const COLS = Math.floor(canvas.width / CELL);
  const ROWS = Math.floor(canvas.height / CELL);

  let snake, dir, nextDir, food, score, highScore, gameLoop, running;

  function reset() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    placeFood();
    score = 0;
    running = true;
    document.getElementById('snake-score').textContent = '0';
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, 100);
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return gameOver();
    }
    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      const scoreEl = document.getElementById('snake-score');
      if (scoreEl) scoreEl.textContent = score;
      const hsEl = document.getElementById('snake-highscore');
      if (hsEl && score > parseInt(hsEl.textContent)) {
        hsEl.textContent = score;
        highScore = score;
      }
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    running = false;
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 15;
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px Courier New';
    ctx.fillText('ENTER para reiniciar', canvas.width / 2, canvas.height / 2 + 14);
    ctx.shadowBlur = 0;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#00ff4110';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ff4136';
    ctx.shadowColor = '#ff4136';
    ctx.shadowBlur = 8;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const alpha = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = `rgba(0,255,65,${alpha})`;
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = i === 0 ? 10 : 4;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
  }

  // Initial screen
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = '14px Courier New';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00ff41';
  ctx.shadowBlur = 10;
  ctx.fillText('Presiona ENTER para', canvas.width / 2, canvas.height / 2 - 8);
  ctx.fillText('iniciar el juego', canvas.width / 2, canvas.height / 2 + 12);
  ctx.shadowBlur = 0;

  highScore = 0;
  running = false;

  // Controls
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':    if (dir.y !== 1)  nextDir = { x: 0, y: -1 }; e.preventDefault(); break;
      case 'ArrowDown':  if (dir.y !== -1) nextDir = { x: 0, y: 1 };  e.preventDefault(); break;
      case 'ArrowLeft':  if (dir.x !== 1)  nextDir = { x: -1, y: 0 }; e.preventDefault(); break;
      case 'ArrowRight': if (dir.x !== -1) nextDir = { x: 1, y: 0 };  e.preventDefault(); break;
      case 'Enter':      reset(); break;
    }
  });
}

document.addEventListener("DOMContentLoaded", bootstrapApp);

