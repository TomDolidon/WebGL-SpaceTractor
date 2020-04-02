import { Splat } from "./splat";

export class Missile extends Splat {

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
        this.position[0] += 0.03; 
        //qthis.position[1] += 0.02*Math.sin(this.time); // permet de déplacer le splat sur l'axe X
    }

}  
