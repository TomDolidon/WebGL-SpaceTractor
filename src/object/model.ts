import {vec3, mat4} from "gl-matrix";

export class Model {

    filename: string;
    gl: WebGL2RenderingContext;
    shader: WebGLProgram;

    windowsSizeRatio: number;

    vao: any;
    vertexBuffer: WebGLVertexArrayObject | null;
    normalBuffer: WebGLVertexArrayObject | null;
    coordBuffer: WebGLVertexArrayObject | undefined;
    triangles: WebGLVertexArrayObject | undefined;

    bbmin = [0,0,0];
    bbmax = [0,0,0];
    
    bbminP = [0,0,0,0];
    bbmaxP = [0,0,0,0];

    loaded = false;

    modelMatrix: any;
    viewMatrix: any;
    projMatrix: any;

    position = [0,0,0]; // position de l'objet dans l'espace 
    rotation = [0., 0., 0.]; // angle de rotation en radian autour de l'axe Y
    scale = 0.02; // mise à l'echelle (car l'objet est trop  gros par défaut)

    col = [1.0, 1.0, 0.0];
    light = [0.0, 0.0, 1.0];

    time = 0.0;

    constructor(
        gl: WebGL2RenderingContext,
        filename: string,
        shader: WebGLProgram,
        windowsSizeRatio: number
    ) {
        this.gl = gl;
        this.shader = shader;

        this.windowsSizeRatio = windowsSizeRatio;

        this.filename = filename;

        const _vertexBuffer = gl.createBuffer();
        if (_vertexBuffer === null) {
          throw new Error(`Cannot create buffer`);
        }
        this.vertexBuffer = _vertexBuffer;
        (this.vertexBuffer as any).itemSize = 0;
        (this.vertexBuffer as any).numItems = 0;
        

        const _normalBuffer = gl.createBuffer();
        if (_normalBuffer === null) {
          throw new Error(`Cannot create buffer`);
        }
        this.normalBuffer = _normalBuffer;
        (this.normalBuffer as any).itemSize = 0;
        (this.normalBuffer as any).numItems = 0;

    }

    async load(): Promise<any> {
        const { filename } = this;
        return new Promise((res, rej) => {
          // lecture du fichier, récupération des positions et des normales
          var vertices = null;
          var xmlhttp = new XMLHttpRequest();
          var instance = this;
    
          xmlhttp.onreadystatechange = function() {
              
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
              if (xmlhttp.status == 200) {
                var data = xmlhttp.responseText;
    
                var lines = data.split("\n");
    
                var positions : any = [];
                var normals : any= [];
                var arrayVertex : any = [];
                var arrayNormal : any = [];
    
                for (var i = 0; i < lines.length; i++) {
                  var parts = (lines[i] as any).trimRight().split(" ");
                                    
                  if (parts.length > 0) {
                    switch (parts[0]) {
                      case "v":
                        positions.push(
                          vec3.fromValues(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                          )
                        );
                        break;
                      case "vn":
                        normals.push(
                          vec3.fromValues(
                            parseFloat(parts[1]),
                            parseFloat(parts[2]),
                            parseFloat(parts[3])
                          )
                        );
                        break;
                      case "f": {
                        var f1 = parts[1].split("/");
                        var f2 = parts[2].split("/");
                        var f3 = parts[3].split("/");
                        Array.prototype.push.apply(
                          arrayVertex,
                          positions[parseInt(f1[0]) - 1]
                        );
                        Array.prototype.push.apply(
                          arrayVertex,
                          positions[parseInt(f2[0]) - 1]
                        );
                        Array.prototype.push.apply(
                          arrayVertex,
                          positions[parseInt(f3[0]) - 1]
                        );
    
                        Array.prototype.push.apply(
                          arrayNormal,
                          normals[parseInt(f1[2]) - 1]
                        );
                        Array.prototype.push.apply(
                          arrayNormal,
                          normals[parseInt(f2[2]) - 1]
                        );
                        Array.prototype.push.apply(
                          arrayNormal,
                          normals[parseInt(f3[2]) - 1]
                        );
                        break;
                      }
                      default:
                        break;
                    }
                  }
                }
    
                var objData = [
                  new Float32Array(arrayVertex),
                  new Float32Array(arrayNormal)
                ];
                instance.handleLoadedObject(objData);
    
                res();
              }
            }
          };
    
          console.log("Loading Model <" + filename + ">...");
    
          xmlhttp.open("GET", filename, true);
          xmlhttp.send();
        });
      }
    
    computeBoundingBox(vertices: any) {
        var i,j;
        
        if(vertices.length>=3) {
            this.bbmin = [vertices[0],vertices[1],vertices[2]];
            this.bbmax = [vertices[0],vertices[1],vertices[2]];
        }

        for(i=3;i<vertices.length;i+=3) {
            for(j=0;j<3;j++) {
                if(vertices[i+j]>this.bbmax[j]) {
                    this.bbmax[j] = vertices[i+j];
                }

                if(vertices[i+j]<this.bbmin[j]) {
                    this.bbmin[j] = vertices[i+j];
                }
            }
        }
    }

        
    handleLoadedObject(objData: any) {
        var vertices = objData[0];
        var normals = objData[1];

      //  console.log("Nb vertices: " + vertices.length/3);
        
        this.computeBoundingBox(vertices);
     //   console.log("BBox min: "+this.bbmin[0]+","+this.bbmin[1]+","+this.bbmin[2]);
      //  console.log("BBox max: "+this.bbmax[0]+","+this.bbmax[1]+","+this.bbmax[2]);

        this.initParameters();

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        
        // cree un nouveau buffer sur le GPU et l'active
        this.vertexBuffer = this.gl.createBuffer();
        (this.vertexBuffer as any).itemSize = 3;
        (this.vertexBuffer as any).numItems  = vertices.length/3;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, (this.vertexBuffer as any).itemSize, this.gl.FLOAT, false, 0, 0);


        this.normalBuffer = this.gl.createBuffer();
        (this.normalBuffer as any).itemSize = 3;
        (this.normalBuffer as any).numItems = normals.length/3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.enableVertexAttribArray(1);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, (this.normalBuffer as any).itemSize, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindVertexArray(null);

       // console.log("model initialized");
        this.loaded = true;
    }

    initParameters() {

        //console.log("model.ts::initParameters");
        
        this.modelMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();
    
        // la caméra est positionné sur l'axe Z et regarde le point 0,0,0
        mat4.lookAt(this.viewMatrix, [0,0,10],[0,0,0],[0,1,0]);
    
        // matrice de projection perspective classique
        mat4.perspective(this.projMatrix, 45.0,1,0.1,30);
    }

    
    setParameters(elapsed: any) {

       // console.log("model.ts::setParameters()");

        // fonction appelée à chaque frame.
        // mise à jour de la matrice modèle avec les paramètres de transformation
        // les matrices view et projection ne changent pas
        this.time += 0.05;

        
        // creation des matrices rotation/translation/scaling

        let rMat = mat4.create()
       // mat4.rotate(rMat, mat4.create(),this.rotation[0],[0,1,0]);

        let rYMat = mat4.create()
        //mat4.rotate(rYMat, mat4.create(),this.rotation[1],[1,0,0]);

        let tMat = mat4.create();
        mat4.translate(tMat, mat4.create(),[this.position[0],this.position[1],this.position[2]]);

        let sMat = mat4.create();
        mat4.scale(sMat, mat4.create(),[this.scale * this.windowsSizeRatio,this.scale,this.scale]);

        // on applique les transformations successivement
        this.modelMatrix = mat4.create();

        mat4.multiply(this.modelMatrix, sMat,this.modelMatrix);
        mat4.multiply(this.modelMatrix, rMat,this.modelMatrix);
        mat4.multiply(this.modelMatrix, tMat,this.modelMatrix);
        mat4.multiply(this.modelMatrix, rYMat,this.modelMatrix);

        //var lYMat = mat4.rotateY(mat4.identity(), 1.0);
        //console.log(this.lYMat);
        
        //this.light =  mat4.multiply(lYMat,this.light);
        //console.log(this.light);
        
        //this.light[0] = Math.sin(this.time);

    }    

    

    sendUniformVariables() {

        //console.log("model.ts::sendUniformVariables()");

        // on envoie les matrices de transformation (model/view/proj) au shader
        // fonction appelée a chaque frame, avant le dessin du vaisseau
        if(this.loaded) {
            var m = this.modelMatrix;
            var v = this.viewMatrix;
            var p = this.projMatrix;

            // envoie des matrices aux GPU
            this.gl.uniformMatrix4fv((this.shader as any).modelMatrixUniform,false,this.modelMatrix);
            this.gl.uniformMatrix4fv((this.shader as any).viewMatrixUniform,false,this.viewMatrix);
            this.gl.uniformMatrix4fv(((this.shader as any)).projMatrixUniform,false,this.projMatrix);
            
            //couleur du model
            this.gl.uniform3f((this.shader as any).kdUniform, this.col[0], this.col[1], this.col[2]);

            //light
            this.gl.uniform3f((this.shader as any).lightUniform, this.light[0], this.light[1], this.light[2]);

            // calcul de la boite englobante (projetée)
            this.multiplyVec4(m,[this.bbmin[0],this.bbmin[1],this.bbmin[2],1],this.bbminP);
            this.multiplyVec4(m,[this.bbmax[0],this.bbmax[1],this.bbmax[2],1],this.bbmaxP);
            this.multiplyVec4(v,this.bbminP);
            this.multiplyVec4(v,this.bbmaxP);
            this.multiplyVec4(p,this.bbminP);
            this.multiplyVec4(p,this.bbmaxP);

            this.bbminP[0] /= this.bbminP[3];
            this.bbminP[1] /= this.bbminP[3];
            this.bbminP[2] /= this.bbminP[3];
            this.bbminP[3] /= this.bbminP[3];

            this.bbmaxP[0] /= this.bbmaxP[3];
            this.bbmaxP[1] /= this.bbmaxP[3];
            this.bbmaxP[2] /= this.bbmaxP[3];
            this.bbmaxP[3] /= this.bbmaxP[3];
        }
    }

    multiplyVec4(mat: number[], vec: number[], dest = vec) {
        const x = vec[0],
          y = vec[1],
          z = vec[2],
          w = vec[3];
    
        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
    
        return dest;
      }

    move(x: number,y: number) {
        // faire bouger votre vaisseau ici. Exemple :
      //  this.rotation[0] += x*0.05; // permet de tourner autour de l'axe Y 
        this.position[0] += x*0.2; // translation gauche/droite
        this.position[1] += y*0.2; // translation haut/bas
    }

    rotate(x: number,y: number) {
    
        this.rotation[0] += x*0.05; 
        this.rotation[1] += y*0.05;
      
    }

        
    getBBox() {
        return [this.bbminP,this.bbmaxP];
    }

    
    getShader() {
        return this.shader;
    }

    draw() {
        // cette fonction dit à la carte graphique de dessiner le vaisseau (déjà stocké en mémoire)
        if(this.loaded) {
            this.gl.bindVertexArray(this.vao);
            this.gl.drawArrays(this.gl.TRIANGLES,0, (this.vertexBuffer as any).numItems)
            this.gl.bindVertexArray(null);	
        }
    }

    clear() {
        // clear all GPU memory
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.normalBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.loaded = false;
    }

    
    initModelShader() {

        if(!this.shader) {
            throw new Error(`shader is not a WebGLProgram `);
        }
        
        // active ce shader
        this.gl.useProgram(this.shader);

        // adresse des variables de type uniform dans le shader
        (this.shader as any).modelMatrixUniform = this.gl.getUniformLocation(this.shader, "uModelMatrix");
        (this.shader as any).viewMatrixUniform = this.gl.getUniformLocation(this.shader, "uViewMatrix");
        (this.shader as any).projMatrixUniform = this.gl.getUniformLocation(this.shader, "uProjMatrix");

        //couleur obj
        (this.shader as any).kdUniform = this.gl.getUniformLocation(this.shader, "ukd");

        //lumiere 
        (this.shader as any).lightUniform = this.gl.getUniformLocation(this.shader, "ul");

        //console.log("model shader initialized");
    }

}















