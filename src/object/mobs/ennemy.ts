import { Splat } from "../splat";

export abstract class Ennemy extends Splat {

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

}  
