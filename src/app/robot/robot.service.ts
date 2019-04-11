import { Injectable } from '@angular/core';
import * as BABYLON from 'babylonjs';
import 'babylonjs-materials';

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private camera: BABYLON.ArcRotateCamera;
  private scene: BABYLON.Scene;
  private light: BABYLON.HemisphericLight;
  private light2: BABYLON.DirectionalLight;
  private shadowGenerator: BABYLON.ShadowGenerator;
  private idleRange: BABYLON.AnimationRange;
  private walkRange: BABYLON.AnimationRange;
  private runRange: BABYLON.AnimationRange;
  private leftRange: BABYLON.AnimationRange;
  private rightRange: BABYLON.AnimationRange;
  private skeleton: BABYLON.Skeleton;

  private sphere: BABYLON.Mesh;

  createScene(elementId: string): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = <HTMLCanvasElement>document.getElementById(elementId);

    // Then, load the Babylon 3D engine:
    this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.engine.enableOfflineSupport = false;
    BABYLON.Animation.AllowMatricesInterpolation = true;

    // create a basic BJS Scene object
    this.scene = new BABYLON.Scene(this.engine);

    // create a FreeCamera, and set its position to (x:5, y:10, z:-20 )
    this.camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 4, 3,
      new BABYLON.Vector3(0, 1, 0), this.scene);
    this.camera.attachControl(this.canvas, true);

    this.camera.lowerRadiusLimit = 2;
    this.camera.upperRadiusLimit = 10;
    this.camera.wheelDeltaPercentage = 0.01;

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.6;
    this.light.specular = BABYLON.Color3.Black();

    this.light2 = new BABYLON.DirectionalLight('dir01', new BABYLON.Vector3(0, -0.5, -1.0), this.scene);
    this.light2.position = new BABYLON.Vector3(0, 5, 5);


    // Shadows
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light2);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;

    this.engine.displayLoadingUI();

    BABYLON.SceneLoader.ImportMesh('', 'assets/scenes/', 'dummy3.babylon',
      this.scene, (newMeshes, particleSystems, skeletons) => {
        this.skeleton = skeletons[0];

        this.shadowGenerator.addShadowCaster(this.scene.meshes[0], true);
        for (let index = 0; index < newMeshes.length; index++) {
          newMeshes[index].receiveShadows = false;
        }

        const helper = this.scene.createDefaultEnvironment({
          enableGroundShadow: true
        });
        helper.setMainColor(BABYLON.Color3.Gray());
        helper.ground.position.y += 0.01;

        // ROBOT
        this.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        this.skeleton.animationPropertiesOverride.enableBlending = true;
        this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        this.skeleton.animationPropertiesOverride.loopMode = 1;

        this.idleRange = this.skeleton.getAnimationRange('YBot_Idle');
        this.walkRange = this.skeleton.getAnimationRange('YBot_Walk');
        this.runRange = this.skeleton.getAnimationRange('YBot_Run');
        this.leftRange = this.skeleton.getAnimationRange('YBot_LeftStrafeWalk');
        this.rightRange = this.skeleton.getAnimationRange('YBot_RightStrafeWalk');

        // IDLE
        if (this.idleRange) { this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true); }

        this.engine.hideLoadingUI();
      });
  }

  animate(): void {
    const $scope = this;

    window.addEventListener('DOMContentLoaded', () => {
      $scope.engine.runRenderLoop(() => {
        $scope.scene.render();
      });
    });

    window.addEventListener('resize', () => {
      $scope.engine.resize();
    });
  }

  walk() {
    if (this.walkRange) {
      this.scene.beginAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, true);
    }
  }

  left() {
    if (this.walkRange && this.leftRange) {
      this.scene.stopAnimation(this.skeleton);
      const walkAnim = this.scene.beginWeightedAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, 0.5, true);
      const leftAnim = this.scene.beginWeightedAnimation(this.skeleton, this.leftRange.from, this.leftRange.to, 0.5, true);

      // Note: Sync Speed Ratio With Master Walk Animation
      walkAnim.syncWith(null);
      leftAnim.syncWith(walkAnim);
    }
  }

  right() {
    if (this.walkRange && this.rightRange) {
      this.scene.stopAnimation(this.skeleton);
      const walkAnim = this.scene.beginWeightedAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, 0.5, true);
      const rightAnim = this.scene.beginWeightedAnimation(this.skeleton, this.rightRange.from, this.rightRange.to, 0.5, true);

      // Note: Sync Speed Ratio With Master Walk Animation
      walkAnim.syncWith(null);
      rightAnim.syncWith(walkAnim);
    }
  }

  stop() {
    if (this.idleRange) {
      this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true);
    }
  }
}
