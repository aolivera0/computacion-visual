## Python
Este código realiza lo siguiente: 
- Dibuja un triángulo.
- Lo transforma en cada frame con rotación, traslación y escalado variable en el tiempo.
- Muestra la matriz total de transformación en el título de la gráfica.
- Exporta la animación a un archivo animacion.gif.

## Unity
El código reliza lo siguiente:
- Traslación: cada tiempoCambio segundos (por defecto 2s) se mueve aleatoriamente en el plano XY.
- Rotación: gira de forma constante en el eje Y.
- Escala: crece y decrece suavemente con una onda sinusoidal.

## Processing
- translate(width/2 + tx, height/2, 0) → mueve el cubo al centro y lo desplaza en X con una onda senoidal.
- rotateY(t) y rotateX(t*0.5) → el cubo rota continuamente.
- scale(s) → cambia de tamaño con una función sinusoidal.
- pushMatrix() / popMatrix() → aíslan las transformaciones para no afectar otros posibles objetos.

## Threejs
Con esta implementación se logra ver el cubo:
- Orbitando en trayectoria circular.
- Rotando sobre sí mismo.
- Escalando suavemente.
- Es navegable con OrbitControls.