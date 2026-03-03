import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 6px 0">Instrucciones</h2>
      <div class="muted">Juego social de deducción: todos conocen la palabra menos 1 impostor.</div>
      <hr>

      <h3>Modalidad offline</h3>
      <ol class="muted">
        <li>El creador indica el número de jugadores y sus alias.</li>
        <li>Se puede dejar que el juego elija una palabra al azar o seleccionar una (entonces el creador no podrá jugar)</li>
        <li>La app asigna un impostor y reparte roles aleatoriamente en el mismo dispositivo.</li>
        <li>Cada jugador deberá darle al botón con su nombre y el juego le enseñará una palabra. Puede ser la palabra secreta o la palabra IMPOSTOR</li>
        <li>Una vez que el jugador lee su palabra debe darle otra vez a la pantalla para que desaparezca y pasarlo al compañero que le toque</li>  
        <li>Una vez que todos los jugadores conozcan su palabra, empezará el juego</li>  
        <li>Al comenzar, aparece el orden de turno aleatorio.</li>
        <li>Cada jugador en su turno deberá decir una palabra relacionada con la palabra secreta. Los jugadores que saben la palabra lo tendrán fácil, pero el impostor deberá deducir la palabra que es y decir otra que también esté relacionada para que sus compañeros no desconfien de él.</li>
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

      <div class="row" style="margin-top:14px">
        <button class="btn" (click)="goHome()">Volver al menú</button>
      </div>
    </div>
  `,
})
export class InstructionsComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigateByUrl('/');
  }
}
