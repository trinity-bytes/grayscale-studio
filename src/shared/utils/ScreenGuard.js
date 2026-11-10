/** Device guidance follows the accepted Figma: landscape tablets and wide desktop windows. */
export function getScreenState(width, height, touch) {
  if (width < 768) return 'phone';
  if (touch && height > width) return 'portrait';
  return width < 1024 ? 'narrow' : 'ready';
}

let detach;
export function installScreenGuard() {
  detach?.();
  const update = () => {
    const touch = window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const state = getScreenState(window.innerWidth, window.innerHeight, touch);
    document.documentElement.dataset.screen = state;
    const notice = document.getElementById('mobile-guard');
    if (!notice) return;
    const copy = {
      phone: ['Tu imagen necesita más espacio', 'Abre Grayscale Studio en una tablet horizontal o un escritorio para comparar imágenes y consultar los cálculos.', 'Se requiere una pantalla más grande.'],
      portrait: ['Gira la tablet para continuar', 'Grayscale Studio se utiliza en horizontal para comparar las imágenes y consultar los cálculos.', 'Si la pantalla no gira, desactiva el bloqueo de orientación.'],
      narrow: ['Amplía la ventana para continuar', 'Grayscale Studio necesita más espacio para comparar las imágenes y consultar los cálculos.', 'Maximiza la ventana o utiliza una pantalla más grande.'],
    }[state];
    if (copy) {
      notice.querySelector('h1').textContent = copy[0];
      notice.querySelector('p').textContent = copy[1];
      notice.querySelector('span').textContent = copy[2];
    }
  };
  window.addEventListener('resize', update);
  detach = () => window.removeEventListener('resize', update);
  update();
}
