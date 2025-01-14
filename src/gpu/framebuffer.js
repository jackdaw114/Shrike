/**
 * Creates and configures a WebGL2 framebuffer with optional color and depth attachments.
 * 
 * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context
 * @param {Object} customOptions - Custom configuration options
 * @param {number} [customOptions.width] - Framebuffer width (default: window.innerWidth)
 * @param {number} [customOptions.height] - Framebuffer height (default: window.innerHeight)
 * @param {boolean} [customOptions.depth=true] - Whether to create depth attachment
 * @param {boolean} [customOptions.float=false] - Whether to use floating point texture
 * @param {boolean} [customOptions.linear=true] - Whether to use linear filtering
 * @returns {Object} Framebuffer object containing fbo, texture, and cleanup method
 * @throws {Error} If framebuffer creation fails or WebGL context is invalid
 */
export function createFramebuffer(gl, customOptions = {}) {
    // Validate GL context
    if (!(gl instanceof WebGL2RenderingContext)) {
        throw new Error('Invalid WebGL2 context');
    }

    const defaultOptions = {
        width: window.innerWidth,
        height: window.innerHeight,
        depth: true,
        float: false,
        linear: true,
        texBorder: 0,
        texInternalFormat: gl.RGBA8,
        texFormat: gl.RGBA,
        texType: gl.UNSIGNED_BYTE,
        texMinFilter: gl.LINEAR,
        texMagFilter: gl.LINEAR,
        texWrapS: gl.CLAMP_TO_EDGE,
        texWrapT: gl.CLAMP_TO_EDGE,
        depthInternalFormat: gl.DEPTH_COMPONENT24,
        samples: 0, // 0 means no multisampling
    };

    const options = { ...defaultOptions, ...customOptions };
    
    // Adjust for device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    const width = options.width * pixelRatio;
    const height = options.height * pixelRatio;

    // Handle floating point textures if requested
    if (options.float) {
        if (!gl.getExtension('EXT_color_buffer_float')) {
            throw new Error('Floating point textures not supported');
        }
        options.texInternalFormat = gl.RGBA32F;
        options.texType = gl.FLOAT;
    }

    // Create and bind framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Create and configure color attachment
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Handle texture storage and data
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        options.texInternalFormat,
        width,
        height,
        options.texBorder,
        options.texFormat,
        options.texType,
        null
    );

    // Configure texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.texMinFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.texMagFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.texWrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.texWrapT);

    // Attach color texture to framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );

    let depthBuffer = null;
    if (options.depth) {
        depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(
            gl.RENDERBUFFER,
            options.depthInternalFormat,
            width,
            height
        );
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depthBuffer
        );
    }

    // Check framebuffer status
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        // Clean up on failure
        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        
        throw new Error(`Framebuffer creation failed: ${getFramebufferStatusMessage(gl, status)}`);
    }

    // Clean up bindings
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    // Return framebuffer object with cleanup method
    return {
        fbo: framebuffer,
        texture,
        depthBuffer,
        width: options.width,
        height: options.height,
        cleanup: () => {
            gl.deleteFramebuffer(framebuffer);
            gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        }
    };
}

/**
 * Helper function to get meaningful framebuffer status messages
 */
function getFramebufferStatusMessage(gl, status) {
    switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            return 'Incomplete attachment';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            return 'Inconsistent dimensions';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            return 'Missing attachment';
        case gl.FRAMEBUFFER_UNSUPPORTED:
            return 'Unsupported format combination';
        default:
            return `Unknown error: ${status}`;
    }
}
