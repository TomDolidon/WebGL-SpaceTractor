// les fonctions utiles pour charger des shaders et des textures

var gl; // les fonctionnalités OpenGL
var mvMatrix; // modelviewmatrix
var pMatrix; // projection matrix

// initialisation du contexte OpenGL
export const initGL = (canvas: HTMLCanvasElement): WebGL2RenderingContext => {

    const gl = canvas.getContext("webgl2")

    if (gl === null) {
        throw new Error("Cannot create a WebGL2 rendering context");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    return gl;
}


// charge et compile les shaders
function getShader(gl: WebGL2RenderingContext, id : string) {
    var shaderScript = document.getElementById(id) as HTMLScriptElement;
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    
    if (!shader) {
        throw new Error(`Cannot create shader for script : ${shaderScript.type}`);
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
} 


export const initShaders = (    
    gl: WebGL2RenderingContext,
    vsId : any,
    fsId : any) => {
    // recupere les vertex et fragment shaders 
    var fragmentShader = getShader(gl,fsId);
    if (fragmentShader === null) {
        throw new Error("fragment shader is null");
    }

    var vertexShader = getShader(gl,vsId);
    if (vertexShader === null) {
        throw new Error("vertex shader is null");
    }

    // cree le programme et lui associe les vertex/fragments
    var shaderProgram = gl.createProgram();

    if (shaderProgram === null) {
        throw new Error("shader program is null");
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return shaderProgram;
} 



export const isPowerOf2 = (value: number) => {
    return (value & (value - 1)) == 0;
};

/*
function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


export const initTexture = (    
        gl: WebGL2RenderingContext,
        filename : string
    ) => {
    var texture = gl.createTexture();
    (texture as any).image = new Image();

    (texture as any).image.onload = function () {
        handleLoadedTexture(texture)
        (texture as any).width = this.width;
        (texture as any).height = this.height;
    }

    (texture as any).image.src = filename;
    return texture;
}

mvMatrix = mat4.create();
var mvMatrixStack = [];
pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    */
