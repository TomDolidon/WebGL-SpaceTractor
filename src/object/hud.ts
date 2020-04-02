import { Splat } from "./splat";

export class Hud {

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
        this.position[0] += 0.03; 
        //qthis.position[1] += 0.02*Math.sin(this.time); // permet de déplacer le splat sur l'axe X
    }

}  
