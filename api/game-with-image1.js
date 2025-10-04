const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { Buffer } = require('buffer');

function makePlainBackground(width, height, color) {
    let arr = [];
    for (let r = 0; r < width; r++) for (let c = 0; c < height; c++) for(let i = 0; i < 4; i++) arr.push(i === 3 ? 255 : color[i]);
    return arr;
}

module.exports = (request, response, next) => {
    let orgInput = request.path.substring(1).split('/')[1];
    orgInput = orgInput ? orgInput.substring(1) : '';
    let input = [];
    for (let i = orgInput.length - 1; i >= 0; i--) input.push(orgInput[i]);

    let canvas = { p: [], frames: [], width: 400, height: 300 };
    canvas.p = makePlainBackground(canvas.width, canvas.height, [255, 255, 255]);
    pushPixelData(canvas.frames, canvas.p);
    canvas.p = makePlainBackground(canvas.width, canvas.height, [255, 255, 200]);
    pushPixelData(canvas.frames, canvas.p);

    let animationBuffer = encodeFramesToGif(canvas.frames, 1000, canvas.width, canvas.height);
    response.set({
        'Content-Type': 'image/gif',
        'Content-Length': animationBuffer.length
    });
    response.send(animationBuffer);
}

// GEMINI'S FUNCTIONS:
function pushPixelData(framesArray, pixelDataArray) {
    // Convert the regular JavaScript array of numbers into a Uint8Array (raw byte buffer).
    // This assumes the input array contains R, G, B, A values sequentially for all pixels.
    const pixelBuffer = new Uint8Array(pixelDataArray);
    
    // Push the raw byte buffer to the frames array for the encoder.
    framesArray.push(pixelBuffer);
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