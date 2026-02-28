import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 6px 0">Instrucciones</h2>
      <div class="muted">Juego social de deducción: todos conocen la palabra menos 1 impostor.</div>
      <hr>

      <h3>Modalidad offline (la que incluye esta versión)</h3>
      <ol class="muted">
        <li>El creador indica el número de jugadores y sus alias.</li>
        <li>Se elige una palabra común (o la app te propone una).</li>
        <li>La app asigna un impostor y reparte roles en el mismo dispositivo, de uno en uno.</li>
        <li>Al comenzar, aparece el orden de turno aleatorio (el impostor nunca puede ser el primero).</li>
        <li>Al terminar la ronda, el creador indica si se descubrió al impostor o si sobrevivió.</li>
        <li>Si el impostor sobrevive <b>2 rondas seguidas</b>, gana y la partida finaliza.</li>
        <li>Si lo descubren antes, en la siguiente ronda se elige un impostor distinto al azar.</li>
      </ol>

      <h3>Modalidad online (futura)</h3>
      <ol class="muted">
        <li>Registro/Login real (email) y creación de sala.</li>
        <li>El creador añade emails de los participantes.</li>
        <li>Cada jugador entra desde su móvil/PC y se une a la sala.</li>
        <li>Al iniciar, el servidor envía la palabra a todos menos al impostor.</li>
        <li>Rondas, votos y resultado gestionados en tiempo real.</li>
      </ol>

      <div class="badge warn">💡 Consejo</div>
      <div class="muted" style="margin-top:8px">
        Si tienes la palabra, da pistas sutiles. Si eres impostor, usa pistas genéricas y escucha.
      </div>
    </div>
  `,
})
export class InstructionsComponent {}
