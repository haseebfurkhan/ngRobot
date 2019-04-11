import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import 'babylonjs-materials';
import { RobotService } from './robot.service';

export enum KEY_CODE {
  W = 87,
  A = 65,
  S = 83,
  D = 68,
}

@Component({
  selector: 'app-robot',
  templateUrl: './robot.component.html',
  styleUrls: ['./robot.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RobotComponent implements OnInit {
  private canEleId = 'renderCanvas';
  private stopped = true;
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])

  keyEvent(event: KeyboardEvent) {
    console.log(event);
    if (event.type === 'keyup') {
      this.robotService.stop();
      this.stopped = true;
    } else {
      if (event.keyCode === KEY_CODE.W && this.stopped) {
        this.robotService.walk();
        this.stopped = false;
      }
      if (event.keyCode === KEY_CODE.A && this.stopped) {
        this.robotService.left();
        this.stopped = false;
      }
      if (event.keyCode === KEY_CODE.S && this.stopped) {
        this.robotService.stop();
        this.stopped = false;
      }
      if (event.keyCode === KEY_CODE.D && this.stopped) {
        this.robotService.right();
        this.stopped = false;
      }
    }
  }

  constructor(private robotService: RobotService) { }


  ngOnInit() {
    this.robotService.createScene(this.canEleId);
    this.robotService.animate();
  }

  walk() {
    this.robotService.walk();
  }
}
