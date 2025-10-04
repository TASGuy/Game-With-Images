const { createCanvas, loadImage } = require('canvas');
//const { GIFEncoder, quantize, applyPalette } = require('gifenc');

/*module.exports = (request, response, next) => {
    let orgInput = request.path.substring(1).split('/')[1];
    orgInput = orgInput ? orgInput.substring(1) : '';
    let input = [];
    for (let i = orgInput.length - 1; i >= 0; i--) input.push(orgInput[i]);

    let frames = [];
    function pushFrame() {
       return frames.push(Buffer.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data));
    }

    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'italic 20px monospace';
    ctx.fillText('HELLO WORLD!!!', 0, 0);
    pushFrame();
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.fillText(input, 0, 0);
    pushFrame();

    let animationBuffer = encodeFramesToGif(frames, 1000, canvas.width, canvas.height);
    response.set({
        'Content-Type': 'image/gif',
        'Content-Length': animationBuffer.length
    });
    response.send(animationBuffer);
}

// GEMINI'S FUNCTION:
function encodeFramesToGif(frameBuffers, delay, width, height) {
    const [WIDTH, HEIGHT] = [width, height]; // Must match canvas size
    const totalFrames = frameBuffers.length;
    
    // Initialize the GIF Encoder
    const gif = GIFEncoder();

    // ... (Loop and frame writing logic remains the same)
    for (let i = 0; i < totalFrames; i++) {
        const frameData = frameBuffers[i];
    
        // 1. Quantize the image data to create the color palette
        const palette = quantize(frameData, 256, { format: 'rgba4444' });

        // 2. Apply the palette to map the raw data. 
        // THIS LINE DECLARES AND ASSIGNS THE 'index' VARIABLE.
        const index = applyPalette(frameData, palette, 'rgba4444');
        
        // Write the frame to the encoder
        gif.writeFrame(index, WIDTH, HEIGHT, {
            palette,
            delay,
        });
    }

    // --- FIX IS HERE ---
    // 1. Finalize the GIF
    gif.finish();
    
    // 2. Retrieve the data using the .buffer property and convert to a Node.js Buffer
    // The gif.buffer property holds the internal ArrayBuffer of the GIF data.
    return Buffer.from(gif.buffer); 
}*/