import {Scene} from './scene';
import {initGL, initShaders} from './utils/game-utils';
import { Model } from './object/model';

let scene: Scene | null = null;

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM loaded");
    
    // initialisation du canvas et des objets OpenGL
    const canvas : HTMLCanvasElement  = document.getElementById("canvas") as HTMLCanvasElement ;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const windowsSizeRatio = windowHeight / windowWidth;


    console.log("inner width");
    console.log(windowWidth);

    console.log("inner height");
    console.log(windowHeight);

    canvas.width = windowWidth;
    canvas.height = windowHeight;

    const gl = initGL(canvas);
  
    //heightfield = new Heightfield();
    // background = new Background();
      
    // la couleur de fond sera grise fonc�e
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // active le test de profondeur 
    gl.enable(gl.DEPTH_TEST);
  
    // fonction de m�lange utilis�e pour la transparence
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
    scene = new Scene(gl, windowsSizeRatio);
    scene.tick();
});


