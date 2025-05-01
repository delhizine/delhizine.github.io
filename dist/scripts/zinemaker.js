const fileInput = document.getElementById('fileInput');
const zineCanvas = document.getElementById('zineCanvas');
const ctx = zineCanvas.getContext('2d');
const dpiSelect = document.getElementById('dpiSelect');
const generateZine = document.getElementById('generateZine');
const downloadLink = document.getElementById('downloadLink');

const DEFAULT_DPI = 300;
const INCH_TO_PX = 96; 

const PREVIEW_WIDTH = zineCanvas.width;
const PREVIEW_HEIGHT = zineCanvas.height;
const PREVIEW_SECTION_WIDTH = PREVIEW_WIDTH / 2;
const PREVIEW_SECTION_HEIGHT = PREVIEW_HEIGHT / 4;

let images = [];

function calculateDimensions(dpi) {
    return {
        width: (8.27 * dpi),
        height: (11.69 * dpi),
    };
}

function drawRotatedImage(ctx, img, x, y, width, height, rotation) {
    ctx.save();
    ctx.translate(x + height / 2, y + width / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
}

async function drawZinePreview() {
    ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < 4; i++) {
        const img = images[i];
        const x = 0;
        const y = i * PREVIEW_SECTION_HEIGHT;
        drawRotatedImage(ctx, img, x, y, PREVIEW_SECTION_HEIGHT, PREVIEW_SECTION_WIDTH, 90);
    }
    for (let i = 4; i < 8; i++) {
        const img = images[i];
        const x = PREVIEW_SECTION_WIDTH;
        const y = (7 - i) * PREVIEW_SECTION_HEIGHT;
        drawRotatedImage(ctx, img, x, y, PREVIEW_SECTION_HEIGHT, PREVIEW_SECTION_WIDTH, -90);
    }
}

fileInput.addEventListener('change', async () => {
    const files = fileInput.files;
    if (files.length !== 8) {
        alert('Please upload exactly 8 images.');
        return;
    }

    images = [];
    for (const file of files) {
        const img = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        images.push(img);
    }
    await drawZinePreview(); 
});

generateZine.addEventListener('click', async () => {
    if (images.length !== 8) {
        alert('Please upload exactly 8 images.');
        return;
    }

    const dpi = parseInt(dpiSelect.value, 10);
    const { width, height } = calculateDimensions(dpi);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const SECTION_WIDTH = width / 2;
    const SECTION_HEIGHT = height / 4;

    for (let i = 0; i < 4; i++) {
        const img = images[i];
        const x = 0;
        const y = i * SECTION_HEIGHT;
        drawRotatedImage(ctx, img, x, y, SECTION_HEIGHT, SECTION_WIDTH, 90);
    }
    for (let i = 4; i < 8; i++) {
        const img = images[i];
        const x = SECTION_WIDTH;
        const y = (7 - i) * SECTION_HEIGHT;
        drawRotatedImage(ctx, img, x, y, SECTION_HEIGHT, SECTION_WIDTH, -90);
    }

    const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width, height],
    });

    pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, width, height);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    downloadLink.href = pdfUrl;
    downloadLink.download = 'zine.pdf';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download Zine';
});