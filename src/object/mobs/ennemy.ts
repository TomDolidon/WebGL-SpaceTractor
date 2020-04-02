import { Splat } from "../splat";

export abstract class Ennemy extends Splat {

    constructor(    
        gl: WebGL2RenderingContext,
        filename: string,
        shader: WebGLProgram
        )
    {
        super(gl, filename, shader)
    }

}  
