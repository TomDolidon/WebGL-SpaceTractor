import { Model } from "./object/model";
import {initShaders} from './utils/game-utils';
import { Splat } from "./object/splat";
import { Missile } from "./object/missile";
import { Ennemy1 } from "./object/mobs/ennemy1";
import { Ennemy2 } from "./object/mobs/ennemy2";
import { Ennemy3 } from "./object/mobs/ennemy3";
import { Background } from "./object/background";
import { Boss } from "./object/mobs/boss";
import { Particule } from "./object/particule";

// @ts-ignore
const objectUri = require("./assets/tractor.obj");

// @ts-ignore
const missileUri = require("./assets/fourche.png");

// @ts-ignore
const ennemyUri = require("./assets/chevre.png");

// @ts-ignore
const bossUri = require("./assets/taureau.png");

// @ts-ignore
const particuleUri = require("./assets/particule.png");


export class Scene {

    gl: WebGL2RenderingContext;
    splatShader: WebGLProgram;

    windowsSizeRatio: number;

    currentlyPressedKeys: any = {};

    playerModel: Model | undefined;

    //splat: Splat | undefined;

    spawnEnnemyAvailable = true;
    ennemies: Splat[] = [];

    missiles: Missile[] = [];

    background: Background;

    particuleLimit = 1000;
    particules: Particule[] = [];

    lastTime = 0;

    lastTimeMissile = 0;

    // Liste infos bottom
    lifeLeft = 3;
    killedEnnemies = 0;
    killedBoss = 0;
    missillesFired = 0;
    killedEnnemiesSinceBoss = 0;
    score = 0;
    gameOver = false;

    // boss
    boss: Boss | undefined;
    spawnBossAvailable = false;


    constructor(
        gl: WebGL2RenderingContext,
        windowsSizeRatio: number
    ) {
        this.gl = gl;

        this.windowsSizeRatio = windowsSizeRatio; 

        const handleKeyDown = (event: KeyboardEvent) => {
            this.currentlyPressedKeys[event.keyCode] = true;            
        };
    
        const handleKeyUp = (event: KeyboardEvent) => {
            this.currentlyPressedKeys[event.keyCode] = false;
        };

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        
        this.initScene()

    }


    initScene(){

       // const backgroundShader = initShaders(this.gl, "background-vs","background-fs");
        //this.background = new Background(this.gl, backgroundShader);
        //this.background.initBackgroundShader();

        const modelShader = initShaders(this.gl, "model-vs","model-fs");
  
        this.playerModel = new Model(this.gl, objectUri, modelShader, this.windowsSizeRatio);

        if(!this.playerModel) {
            throw new Error(`Cannot create player model`);
        }
        
        this.playerModel.load().then(() => {
            this.playerModel?.initModelShader();
            this.playerModel?.move(-0.7, 0)
        });

        this.splatShader = initShaders(this.gl, "splat-vs","splat-fs");
        Splat.initSplatShader(this.gl, this.splatShader);

        this.initParticule();
        
    }

    initParticule() {
        while (this.particules.length < this.particuleLimit) {
            const x = Math.random() * 2 - 1;
            var y = Math.random() * 2 - 1;
            var z = Math.random() * 2 - 1;

            let particule = new Particule(this.gl, particuleUri, this.splatShader, 0.005 * this.windowsSizeRatio, 0.005 );

            particule.width = 0.001;
            particule.height = 0.001;
            
            particule.setPosition(x, y, z);
            this.particules.push(particule);
        }
    }


    
// animation 
    animate() {
        // fonction appel�e � chaque frame, permet d'animer la sc�ne
        let timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            // anime chacun des objets de la scene
            // si necessaire (en fonction du temps ecoul�)
            let elapsed = timeNow - this.lastTime;
            this.playerModel?.setParameters(elapsed);

            //this.background.setParameters(elapsed);


            this.missiles.forEach(element => {
                element.setParameters(elapsed);
            }) 

            
            this.ennemies.forEach(element => {
                element.setParameters(elapsed);
            }) 

            if (this.spawnBossAvailable && this.boss) {
                this.boss.setParameters(elapsed);
            }          

            this.particules.forEach(element => {
                element.setParameters(elapsed);
            }) 

        }
        this.lastTime = timeNow;
    }

    tick() {
        if (!this.gameOver) {

            window.requestAnimationFrame(this.tick.bind(this));
            this.cleanOutOfSceneObjects();
            this.handleKeys();
            this.ennemyManager();
            this.particuleManager();
            this.collisionManager();
            this.infoManager();
            this.lifeManager();
            this.drawScene(this.gl);
            this.animate();

        } else {
            this.gameOverManager();
        } 
    } 


    drawScene(gl : WebGL2RenderingContext) {
        
        // initialisation du viewport
        gl.viewport(0, 0, gl.getParameter(gl.VIEWPORT)[2], gl.getParameter(gl.VIEWPORT)[3]);
    
        // efface les buffers de couleur et de profondeur
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // dessin du fond (d�commenter pour travailler dessus)
      //  gl.useProgram(this.background.getShader());
       // this.background.sendUniformVariables();
       // this.background.draw();
    
        // dessin du vaisseau
        gl.useProgram(this.playerModel.getShader());
        this.playerModel?.sendUniformVariables();
        this.playerModel?.draw();
    
        // test pour afficher un splat quand on appuie sur espace 
        gl.enable(gl.BLEND); // transparence activ�e 
    
         this.missiles.forEach(element => {
            gl.useProgram(element.getShader());
            element.sendUniformVariables();
            element.draw();
        }); 

        this.ennemies.forEach(element => {
            gl.useProgram(element.getShader());
            element.sendUniformVariables();
            element.draw();
        }); 

        if (this.spawnBossAvailable && this.boss) {
            gl.useProgram(this.boss.getShader());
            this.boss.sendUniformVariables();
            this.boss.draw();
          }

          this.particules.forEach(element => {
            gl.useProgram(element.getShader());
            element.sendUniformVariables();
            element.draw();
        }); 
    
        gl.disable(gl.BLEND); // transparence d�sactiv�e 
    }

    handleKeys() {
      
        if (this.currentlyPressedKeys[68]) { // D
            this.playerModel?.move(1, 0);            
        }
      
        if (this.currentlyPressedKeys[81]) { // Q
            this.playerModel?.move(-1, 0);
        }
      
        if (this.currentlyPressedKeys[90]) { // Z
            this.playerModel?.move(0, 1);
        }
      
        if (this.currentlyPressedKeys[83]) { // S
            this.playerModel?.move(0, -1);
        }

        if (this.currentlyPressedKeys[97]) { // A
           // this.playerModel?.move(0, -1);
        }
      
        if (this.currentlyPressedKeys[101]) { // A
            //this.playerModel?.move(0, -1);
        }
    
      
        if (this.currentlyPressedKeys[32]) { // SPACE

            const timeNowMissile = new Date().getTime();

            const elapsedForMissile = timeNowMissile - this.lastTimeMissile;

            if(elapsedForMissile > 500 ) {

                const p = this.playerModel.getBBox(); 
                
                const x = p[1][0];
                const y = (p[0][1] + p[1][1]) / 2;
                var z = p[1][2] + 0.005; // profondeur du splat (juste derri�re le vaisseau)
            
                const missile = new Missile(this.gl, missileUri, this.splatShader, 0.3  * this.windowsSizeRatio, 0.2);
                missile.setPosition(x, y, z);                 
                this.missiles.push(missile);

                this.lastTimeMissile = timeNowMissile;

                this.missillesFired++

            }
        } 
      
      
    } 

    cleanOutOfSceneObjects() {
        this.cleanOutOfSceneMissile();
        this.cleanOutOfSceneEnnemies();
        this.cleanOutOfSceneBoss();
        this.cleanOutOfSceneParticule()

    }

    cleanOutOfSceneEnnemies() {
        this.ennemies.forEach((element, index) => {
            // Si le projectile sort de l'écran
            if (element.position[0] < (-1.2)) {
              this.ennemies.splice(index, 1);
              element.clear();
              this.setScore(-50);
            }
        })
    }

    cleanOutOfSceneMissile(){
        // Pour chaque projectile
        this.missiles.forEach((element, index) => {
            if (element.position[0] > 1.2) {
            this.missiles.splice(index, 1);
            element.clear();
            }
        })
    }

    cleanOutOfSceneParticule(){
        // Pour chaque projectile
        this.particules.forEach((element, index) => {
            if (element.position[0] < -1.0) {
            this.particules.splice(index, 1);
            element.clear();
            }
        })
    }

    cleanOutOfSceneBoss(){
        if (this.spawnBossAvailable && typeof this.boss != "undefined") {
            if (this.boss.position[0] < (-1.2)) {
              this.boss.clear();
              this.spawnBossAvailable = false;
              this.spawnEnnemyAvailable = true;
              this.killedEnnemiesSinceBoss = 0;
              this.boss = undefined;
              this.score = this.score - 150;
            }
          } 
    }


    setScore(value: number) {
        this.score += value;
    }

    particuleManager() {
        while (this.particules.length < this.particuleLimit) {
            const x = 1.0;
            var y = Math.random() * 2 - 1;
            var z = Math.random() * 2 - 1;

            let particule = new Particule(this.gl, particuleUri, this.splatShader, 0.005  * this.windowsSizeRatio, 0.005);            

            particule.setPosition(x, y, z);
            this.particules.push(particule);
        }
    }


        
    ennemyManager() {
        const spawRate = 20;
        const maxEnnemies = 4;

        const nbEnnemyType = 3; 

        let ennemy: Splat;

        // Si il n'y a pas trop d'ennemis
        if (this.ennemies.length < maxEnnemies && this.spawnEnnemyAvailable) {
            const rate = Math.floor(Math.random() * 1001);

            if (rate < spawRate) {
                const x = 1.3;
                var y = Math.random() * 2 - 1;
                var z = Math.random() * 2 - 1;

                const ennemyType = Math.floor(Math.random() * (nbEnnemyType) + 1);
        
                switch (ennemyType) {
                    case 1:
                        ennemy = new Ennemy1(this.gl, ennemyUri, this.splatShader, 0.2 * this.windowsSizeRatio, 0.2);
                        ennemy.setPosition(x, y, z);
                        this.ennemies.push(ennemy);
                        break;
                    case 2:
                        ennemy = new Ennemy2(this.gl, ennemyUri, this.splatShader, 0.2 * this.windowsSizeRatio, 0.2 );

                        y = Math.random() * 1.5 - 0.5;
                        z = Math.random() * 2 - 1;

                        ennemy.setPosition(x, y, z);
                        this.ennemies.push(ennemy);
                        break;
                    case 3:
                        ennemy = new Ennemy3(this.gl, ennemyUri, this.splatShader, 0.2 * this.windowsSizeRatio, 0.2);
                        ennemy.setPosition(x, y, z);
                        this.ennemies.push(ennemy);
                        break;
                }

     
            }
        }

        if (this.spawnBossAvailable && !this.boss) {
            
            var x = 1.3;
            var y = Math.random() * 2 - 1;
            var z = Math.random() * 2 - 1;

            this.boss = new Boss(this.gl, bossUri, this.splatShader, 0.3  * this.windowsSizeRatio, 0.3);
            this.boss.setPosition(x, y, z);
            this.boss.life = 3;
        }
    }

    
  
collisionManager() {
    var positions = this.playerModel.getBBox(); 

    //console.log(positions);
    
    var x1 = positions[0][0];
    var x2 = positions[1][0];
    var y1 = positions[0][1];
    var y2 = positions[1][1];

   // console.log(positions);
    

    // Pour chaque ennemis
    this.ennemies.forEach((ennemy, index) => {
      // Pour chaque projectile
      this.missiles.forEach((shoot, key) => {
        // collision ennemi / missile
        if (ennemy.position[0] < shoot.position[0] + shoot.width
          && ennemy.position[0] + ennemy.width > shoot.position[0]
          && ennemy.position[1] < shoot.position[1] + shoot.width
          && ennemy.position[1] + ennemy.width > shoot.position[1]) {

          this.missiles.splice(key, 1);
          shoot.clear();

          this.ennemies.splice(index, 1);
          ennemy.clear();

          this.killedEnnemies++;
          this.killedEnnemiesSinceBoss++;

          this.setScore(50);
        }

        if (this.killedEnnemiesSinceBoss >= 10) {
            this.spawnEnnemyAvailable = false;
            this.spawnBossAvailable = true;
        }
      })
      
      // Pour le tracteur de l'espace 
      // collision ennemi / tracteur

      if(ennemy.position[0] < x1 ) console.log("ok x1");

      if(ennemy.position[0] > x2 ) console.log("ok x2");

      
      //console.log(ennemy.position[0]);
      //console.log(x1);
      if (ennemy.position[0] > x1 && ennemy.position[0] < x2 && ennemy.position[1] > y1 && ennemy.position[1] < y2) {

    
        
        
        this.lifeLeft--;

        console.log("collisiooon");
        
        this.ennemies.splice(index, 1);
        ennemy.clear();
        this.setScore(-100);
      }
    })

    
    // Pour le boss
    if (this.spawnBossAvailable && this.boss != undefined) {
        this.missiles.forEach((shoot, key) => {
        // collision boss / missile
        if (this.boss.position[0] < shoot.position[0] + shoot.width
          && this.boss.position[0] + this.boss.width > shoot.position[0]
          && this.boss.position[1] < shoot.position[1] + shoot.width
          && this.boss.position[1] + this.boss.width > shoot.position[1]) {
            
            this.boss.life--;
            this.missiles.splice(key, 1);
            shoot.clear();

          if (0 == this.boss.life) {
              
            this.boss.clear();
            this.spawnBossAvailable = false;
            this.spawnEnnemyAvailable = true;
            this.killedBoss++;
            this.killedEnnemiesSinceBoss = 0;
            this.lifeLeft++;
            this.boss = undefined;
            this.score = this.score + 150;
          }
        }
      });
    }

      if (this.spawnBossAvailable && this.boss != undefined) {

        // Collision boss / tracteur
        if (this.boss.position[0] > x1 && this.boss.position[0] < x2 && this.boss.position[1] > y1 && this.boss.position[1] < y2) {
            this.lifeLeft = this.lifeLeft - 2;
            this.boss.clear();
            this.boss = undefined;
            this.spawnBossAvailable = false;
            this.spawnEnnemyAvailable = true;
            this.score = this.score - 200;
        }
    } 
  }


  gameOverManager() {
    document.getElementById("canvas").style.display = "none";
    document.getElementById("game-over").style.display = "initial";
  }

  infoManager() {
    document.getElementById("score").innerHTML = "Score: " + this.score;
    document.getElementById("life-left").innerHTML = "Vies restantes: " + this.lifeLeft;
    document.getElementById("killed-ennemies").innerHTML = "Ennemis tu&eacute;s: " + this.killedEnnemies;
    document.getElementById("killed-boss").innerHTML = "Champions tu&eacute;s: " + this.killedBoss;
    document.getElementById("shooted-shoot").innerHTML = "Missiles tir&eacute;s: " + this.missillesFired;
  }

  lifeManager() {
    if (this.lifeLeft <= 0) {
        this.gameOver = true;
    }
  }
  
}



