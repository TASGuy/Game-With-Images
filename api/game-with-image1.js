const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { Buffer } = require('buffer');

function makePlainBackground(width, height, color) {
    let arr = [];
    for (let r = 0; r < width; r++) for (let c = 0; c < height; c++) for (let i = 0; i < 4; i++) arr.push(i === 3 ? 255 : color[i]);
    return arr;
}

module.exports = (request, response, next) => {
    let orgInput = request.path.substring(1).split('/')[1];
    orgInput = orgInput ? orgInput.substring(1) : '';
    let input = [];
    for (let i = orgInput.length - 1; i >= 0; i--) input.push(orgInput[i]);

    let textSettings = { textColor: [0, 0, 0], scale: 24/6, letterSpacing: 1, horizontalAlign: 'left', verticalAlign: 'top' };

    let canvas = { p: [], frames: [], width: 400, height: 300 };
    canvas.p = makePlainBackground(canvas.width, canvas.height, [255, 255, 255]);
    overlayTextOnPixelData(input.join(''), canvas.p, canvas.width, canvas.height, { ...textSettings, ...{ paddingX: 5*textSettings.scale, paddingY: 6*textSettings.scale } });
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

// --- CORE PIXEL OVERLAY FUNCTION ---
// This function now expects a regular JavaScript Array (or Uint8ClampedArray, as array access is compatible)
function overlayTextOnPixelData(text, pixelArray, width, height, options = {}) {
    const defaultOptions = {
        textColor: [255, 255, 255],
        scale: 1,
        letterSpacing: 1,
        horizontalAlign: "center",
        verticalAlign: "middle",
        paddingX: 5, // Output pixels
        paddingY: 5, // Output pixels
    };

    const config = { ...defaultOptions, ...options };

    const { textColor, horizontalAlign, verticalAlign, paddingX, paddingY } = config;
    const scale = Math.max(1, Math.floor(config.scale));
    const letterSpacing = config.letterSpacing;

    const normalizedText = text.toUpperCase();

    // --- FONT CONFIGURATION (5x6 Bitmap: 30 elements) ---
    const CHAR_WIDTH = 5;
    const CHAR_HEIGHT = 6;

    const [textR, textG, textB] = textColor;

    // Bitmap font data (1 = draw pixel, 0 = skip). Each char is 5x6 (30 elements).
    const FONT_MAP = {
        A: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        B: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        C: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        D: [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],
        E: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        F: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        G: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        H: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        I: [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
        J: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
        K: [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        L: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        M: [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        N: [1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        O: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        P: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        Q: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0],
        R: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        S: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        T: [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        U: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        V: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        W: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
        X: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        Y: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        Z: [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        0: [0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        1: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
        2: [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1],
        3: [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        4: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        5: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        6: [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        7: [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        8: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
        9: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        ".": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        "!": [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        "?": [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        " ": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "_": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    };

    // 1. Calculate the required size of the text block (in output pixels)
    const totalBitmapWidth = CHAR_WIDTH * normalizedText.length + letterSpacing * (normalizedText.length - 1);
    const totalRenderWidth = totalBitmapWidth * scale;
    const totalRenderHeight = CHAR_HEIGHT * scale;

    // 2. Determine the starting X position (in output pixels)
    let startX;
    switch (horizontalAlign) {
        case "center":
            startX = Math.floor((width - totalRenderWidth) / 2);
            break;
        case "right":
            startX = width - totalRenderWidth - paddingX;
            break;
        case "left":
        default:
            startX = paddingX;
            break;
    }

    // 3. Determine the starting Y position (in output pixels)
    let startY;
    switch (verticalAlign) {
        case "middle":
            startY = Math.floor((height - totalRenderHeight) / 2);
            break;
        case "bottom":
            startY = height - totalRenderHeight - paddingY;
            break;
        case "top":
        default:
            startY = paddingY;
            break;
    }

    // 4. Iterate over the entire canvas (output pixels)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Check if current pixel (x, y) is within the text's bounding box
            if (x >= startX && x < startX + totalRenderWidth && y >= startY && y < startY + totalRenderHeight) {
                // --- Calculate relative position within the text block ---
                const relativeX = x - startX;
                const relativeY = y - startY;

                // --- Determine the current bitmap pixel coordinates (0 to totalBitmapWidth/Height) ---
                const bitmapX = Math.floor(relativeX / scale);
                const bitmapY = Math.floor(relativeY / scale);

                // --- Determine which character and pixel in the font map to check ---

                // Calculate character index
                const charIndex = Math.floor(bitmapX / (CHAR_WIDTH + letterSpacing));

                // Check if we are past the last character
                if (charIndex >= normalizedText.length) continue;

                const char = normalizedText[charIndex];
                const charData = FONT_MAP[char] || FONT_MAP["?"]; // Fallback

                // Calculate position within the character's block (including spacing)
                const xInCharBlock = bitmapX % (CHAR_WIDTH + letterSpacing);
                const yInChar = bitmapY;

                // Check if the pixel is within the 5x6 character grid (not the spacing)
                if (xInCharBlock < CHAR_WIDTH && yInChar < CHAR_HEIGHT) {
                    const bitmapIndex = yInChar * CHAR_WIDTH + xInCharBlock;

                    // Check the bitmap data for this specific pixel
                    if (charData[bitmapIndex] === 1) {
                        // If pixel is ON, overwrite the existing array data
                        const pixelIndex = (y * width + x) * 4;
                        pixelArray[pixelIndex] = textR;
                        pixelArray[pixelIndex + 1] = textG;
                        pixelArray[pixelIndex + 2] = textB;
                        // Alpha (pixelArray[pixelIndex + 3]) remains 255 (opaque)
                    }
                }
            }
        }
    }
}