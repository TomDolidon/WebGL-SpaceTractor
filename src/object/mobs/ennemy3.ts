import { Ennemy } from "./ennemy";

export class Ennemy3 extends Ennemy {

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

    isIncrY = true;

    setParameters(elapsed : number) {
        this.position[0] -= 0.005; 
        
        if(this.position[1] >= 1 || this.position[1] <= -1) {
            this.isIncrY = !this.isIncrY;
        }

        if(this.isIncrY) this.position[1] += 0.03
        else this.position[1] -= 0.03

    }

}  
