import { Ennemy } from "./ennemy";

export class Boss extends Ennemy {

    life = 3,

    constructor(    
        gl: WebGL2RenderingContext,
        filename: string,
        shader: WebGLProgram,
        width: number,
        height: number
        )
    {
        super(gl, filename, shader, width, height)
    }

    setParameters(elapsed : number) {
        this.time += 0.01*elapsed;
        this.position[0] -= 0.01; 
    }

}  
