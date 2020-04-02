import { Splat } from "../splat";
import { Ennemy } from "./ennemy";

export abstract class Ennemy1 extends Ennemy {

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
        this.position[0] -= 0.02; 
    }

}  
