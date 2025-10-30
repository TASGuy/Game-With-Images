const { createCanvas/*, loadImage*/ } = require('canvas');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { Buffer } = require('buffer');

module.exports = (request, response, next) => {
    let canvas = createCanvas(400, 300);
    let ctx = canvas.getContext('2d');
    let frames = [];
    ctx.fillStyle = '#00f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushFrame(frames, canvas, ctx);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00f';
    ctx.font = '40px Arial, sans-serif';
    ctx.fillText('Hello, world!', 0, 0);
    pushFrame(frames, canvas, ctx);

    let animationBuffer = encodeFramesToGif(frames, 1000, canvas.width, canvas.height);
    response.set({
        'Content-Type': 'image/gif',
        'Content-Length': animationBuffer.length
    });
    response.send(animationBuffer);
}

function pushFrame(frames, canvas, ctx) {
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
}

function encodeFramesToGif(frameBuffers, delay, width, height) {
    const [WIDTH, HEIGHT] = [width, height];
    const totalFrames = frameBuffers.length;
    
    // Initialize the GIF Encoder
    const gif = GIFEncoder();

    for (let i = 0; i < totalFrames; i++) {
        const frameData = frameBuffers[i];
        
        // 1. Quantize the image data (reduce to 256 colors for GIF format)
        // Note: gifenc requires a Uint8Array or Buffer input for quantization.
        const palette = quantize(frameData, 256, { format: 'rgba4444' });

        // 2. Apply the palette to map the raw data to the limited color set.
        const index = applyPalette(frameData, palette, 'rgba4444');
        
        // Write the frame to the encoder
        gif.writeFrame(index, WIDTH, HEIGHT, {
            palette,
            delay,
        });
    }

    // Finalize the GIF and retrieve the buffer correctly
    gif.finish();
    return Buffer.from(gif.buffer);
}