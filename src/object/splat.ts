
export class Splat {

    gl: WebGL2RenderingContext;
    texture: WebGLTexture | null;
    shader: WebGLProgram;
    
    vao: WebGLVertexArrayObject | null;
    vertexBuffer: WebGLVertexArrayObject | null;
    coordBuffer: WebGLVertexArrayObject | null;
    triangles: WebGLVertexArrayObject | null;

    width = 0.2;
    height = 0.2;
    position = [0.0,0.0,0.0];
    couleur = [1,0,0];
    time = 0.0;

    wo2 = 0.5*this.width;
    ho2 = 0.5*this.height;

    // un tableau contenant les positions des sommets (sur CPU donc)
    vertices = [
    -this.wo2,-this.ho2, -0.8,
    this.wo2,-this.ho2, -0.8,
    this.wo2, this.ho2, -0.8,
    -this.wo2, this.ho2, -0.8
    ];
    
    coords = [
    0.0, 0.0, 
    1.0, 0.0, 
    1.0, 1.0, 
    0.0, 1.0
    ];

    tri = [0,1,2,0,2,3];

    loaded = false;



    constructor(    
        gl: WebGL2RenderingContext,
        filename: string,
        shader: WebGLProgram
        )
    {
        this.gl = gl;
        this.shader = shader;
        this.texture = this.initTexture(filename);

        this.initSplat();

    }

    initSplat() {
  
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        
        // cree un nouveau buffer sur le GPU et l'active
        this.vertexBuffer = this.gl.createBuffer();
        (this.vertexBuffer as any).itemSize = 3;
        (this.vertexBuffer as any).numItems = 4;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, (this.vertexBuffer as any).itemSize, this.gl.FLOAT, false, 0, 0);
        
        // meme principe pour les coords
        this.coordBuffer = this.gl.createBuffer();
        (this.coordBuffer as any).itemSize = 2;
        (this.coordBuffer as any).numItems = 4;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordBuffer);
        this.gl.enableVertexAttribArray(1);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.coords), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, (this.coordBuffer as any).itemSize, this.gl.FLOAT, false, 0, 0);
    
        // creation des faces du cube (les triangles) avec les indices vers les sommets
        this.triangles = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.triangles);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.tri), this.gl.STATIC_DRAW);
        (this.triangles as any).numItems = 6;
    
        this.gl.bindVertexArray(null);
    
        this.loaded = true;
        
       // console.log("splat initialized");
    }

    static initSplatShader(gl: WebGL2RenderingContext, shader: WebGLProgram) {
        
        // active ce shader
        gl.useProgram(shader);
        
        // adresse des variables uniform dans le shader
        (shader as any).positionUniform = gl.getUniformLocation(shader, "uPosition");
        (shader as any).texUniform = gl.getUniformLocation(shader, "uTex");
        (shader as any).couleurUniform = gl.getUniformLocation(shader, "maCouleur");
        
       // console.log("splat shader initialized");
    }
    
    
    
    getShader() {
        return this.shader;
    }


    setPosition(x : number,y : number,z : number) {
        this.position = [x,y,z];
    }
    
    setParameters(elapsed : number) {

    }

    
    sendUniformVariables() {
        // envoie des variables au shader (position du splat, couleur, texture)
        // fonction appelée à chaque frame, avant le dessin du splat 
        if(this.loaded) {
            this.gl.uniform3fv((this.shader as any).positionUniform,this.position);
            this.gl.uniform3fv((this.shader as any).couleurUniform,this.couleur);

            // how to send a texture: 
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
            this.gl.uniform1i((this.shader as any).texUniform, 0);
        }
    }


    draw() {
        // dessin du splat 
        if(this.loaded) {
            this.gl.bindVertexArray(this.vao);
            this.gl.drawElements(this.gl.TRIANGLES, (this.triangles as any).numItems, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }
    }
    
    
    clear() {
        // clear all GPU memory
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.coordBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.loaded = false;
    }


    initTexture(filename : string): WebGLTexture | null {
        let texture = this.gl.createTexture();

        if(texture == null) {
            throw new Error(`impossible to create texture `);
        }

        (texture as any).image = new Image();

        var vm = this.gl;

        (texture as any).image.onload = function () {
            vm.bindTexture(vm.TEXTURE_2D, texture);
            vm.pixelStorei(vm.UNPACK_FLIP_Y_WEBGL, true);
            vm.texImage2D(vm.TEXTURE_2D, 0, vm.RGBA, vm.RGBA, vm.UNSIGNED_BYTE, texture.image);
            vm.texParameteri(vm.TEXTURE_2D, vm.TEXTURE_MAG_FILTER, vm.LINEAR);
            vm.texParameteri(vm.TEXTURE_2D, vm.TEXTURE_MIN_FILTER, vm.LINEAR);
            vm.texParameteri(vm.TEXTURE_2D, vm.TEXTURE_WRAP_S, vm.CLAMP_TO_EDGE);
            vm.texParameteri(vm.TEXTURE_2D, vm.TEXTURE_WRAP_T, vm.CLAMP_TO_EDGE);
            vm.bindTexture(vm.TEXTURE_2D, null);        
            texture.width = this.width;
            texture.height = this.height;
        }
        
        texture.image.src = filename;

        return texture;

    } 

}  
