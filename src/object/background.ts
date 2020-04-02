export class Background {


    gl : WebGL2RenderingContext;
    shader: WebGLProgram;

    vao: WebGLVertexArrayObject | null;
    vertexBuffer: WebGLVertexArrayObject |null;
    coordBuffer: WebGLVertexArrayObject | null;
    triangles: WebGLVertexArrayObject | null;

    vertices = [
        -1.0,-1.0, 0.9999,
        1.0,-1.0, 0.9999,
        1.0, 1.0, 0.9999,
        -1.0, 1.0, 0.9999
    ];

    coords = [
        0.0, 0.0, 
        1.0, 0.0, 
        1.0, 1.0, 
        0.0, 1.0
        ];
        
    tri = [0,1,2,0,2,3];

    timer = 10.0;
    offset = [0.0,0.5];
    amplitude = 1.0;
    frequency = 2.0;
    persistence = 0.45;

    loaded = false;



    constructor(gl : WebGL2RenderingContext, shader: WebGLProgram
        )
    {
        this.gl = gl;
        this.shader = shader;

        this.initBackground()
    }

    initBackgroundShader() {
        
        // active ce shader
        this.gl.useProgram(this.shader);
        
        // adresse des variables dans le shader associé
        this.shader.offsetUniform = this.gl.getUniformLocation((this.shader as any), "uOffset");
        (this.shader as any).amplitudeUniform = this.gl.getUniformLocation((this.shader as any), "uAmplitude");
        (this.shader as any).frequencyUniform = this.gl.getUniformLocation((this.shader as any), "uFrequency");
        (this.shader as any).persistenceUniform = this.gl.getUniformLocation((this.shader as any), "uPersistence");
    
        console.log("background shader initialized");
    }

        
    initBackground() {

        this.initParameters();
        
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
        
        // meme principe pour les coords de texture
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

        console.log("background initialized");
    }

    initParameters() {
        this.timer = 0.0;
        this.offset = [0.0,0.0];
        this.amplitude = 3.0;
        this.frequency = 5.0;
        this.persistence = 0.45;
    }

    setParameters(elapsed : number) {
         this.offset[0] += 0.001;
    }

    
    getShader() {
        return this.shader;
    }

    
    sendUniformVariables() {
    // fonction appelée avant le dessin : envoie de toutes les variables au shader
        this.gl.uniform2fv((this.shader as any).offsetUniform,this.offset);
        this.gl.uniform1f((this.shader as any).amplitudeUniform,this.amplitude);
        this.gl.uniform1f((this.shader as any).frequencyUniform,this.frequency);
        this.gl.uniform1f((this.shader as any).persistenceUniform,this.persistence);
    }

    draw() {
        // cette fonction dessine la géométrie du background (ici 2 triangles stockés dans les 2 buffers)
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, (this.triangles as any).numItems, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }


    clear() {
        // clear all GPU memory
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.coordBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.loaded = false;
    }


    
}








