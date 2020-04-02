import { Ennemy } from "./ennemy";

export class Ennemy2 extends Ennemy {

    constructor(    
        gl: WebGL2RenderingContext,
        filename: string,
        shader: WebGLProgram
        )
    {
        super(gl, filename, shader)
    }

    setParameters(elapsed : number) {
        this.time += 0.01*elapsed;
        this.position[0] -= 0.005; 
        this.position[1] += 0.02*Math.sin(this.time * 0.2);      
    }

}  
