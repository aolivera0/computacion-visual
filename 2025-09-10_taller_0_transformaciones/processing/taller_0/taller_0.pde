void setup() {
  size(600, 600, P3D);
}

void draw() {
  background(30);
  lights();

  // Tiempo (en segundos)
  float t = millis() / 1000.0;

  // Traslación ondulada en X
  float tx = sin(t) * 150;

  // Escala oscilante
  float s = 1 + 0.5 * sin(t * 2);

  // ---- Transformaciones ----
  pushMatrix();
  translate(width/2 + tx, height/2, 0);
  rotateY(t);     // rotación constante
  rotateX(t * 0.5);
  scale(s);

  // Dibujar cubo
  fill(200, 100, 255);
  stroke(255);
  box(100);
  popMatrix();
}
