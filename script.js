document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const inputText = document.getElementById('inputText');
    const codeType = document.getElementById('codeType');
    const showValue = document.getElementById('showValue');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const barcodeContainer = document.getElementById('barcodeContainer');
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    const valueDisplay = document.getElementById('valueDisplay');
    const displayedValue = document.getElementById('displayedValue');
    const qrcodeDiv = document.getElementById('qrcode');
    
    // Initialize
    generateCode();
    
    // Generate button click
    generateBtn.addEventListener('click', generateCode);
    
    // Code type change
    codeType.addEventListener('change', function() {
        if (this.value === 'barcode') {
            barcodeContainer.style.display = 'block';
            qrcodeContainer.style.display = 'none';
        } else {
            barcodeContainer.style.display = 'none';
            qrcodeContainer.style.display = 'block';
        }
        generateCode();
    });
    
    // Show value checkbox change
    showValue.addEventListener('change', function() {
        valueDisplay.style.display = this.checked ? 'block' : 'none';
    });
    
    // Download button
    downloadBtn.addEventListener('click', downloadCode);
    
    // Generate function
    function generateCode() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Masukkan teks terlebih dahulu!');
            return;
        }
        
        // Update displayed value
        displayedValue.textContent = text;
        
        // Show/hide value display
        valueDisplay.style.display = showValue.checked ? 'block' : 'none';
        
        // Generate based on type
        if (codeType.value === 'barcode') {
            generateBarcode(text);
        } else {
            generateQRCode(text);
        }
    }
    
    // Generate Barcode
    function generateBarcode(text) {
        try {
            JsBarcode("#barcode", text, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: false,
                background: "#ffffff",
                lineColor: "#000000",
                margin: 10
            });
        } catch (error) {
            console.error('Error generating barcode:', error);
            alert('Error generating barcode!');
        }
    }
    
    // Generate QR Code - FIXED VERSION for qrcodejs library
    function generateQRCode(text) {
        // Clear previous QR code
        qrcodeDiv.innerHTML = '';
        
        // Create new QR code using qrcodejs library
        new QRCode(qrcodeDiv, {
            text: text,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    // Download function - UPDATED for qrcodejs
    function downloadCode() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Tidak ada kode untuk diunduh!');
            return;
        }
        
        if (codeType.value === 'barcode') {
            downloadBarcode(text);
        } else {
            downloadQRCode(text);
        }
    }
    
    function downloadBarcode(text) {
        const svg = document.getElementById('barcode');
        const xml = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([xml], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = svg.clientWidth;
            canvas.height = svg.clientHeight + (showValue.checked ? 40 : 0);
            const ctx = canvas.getContext('2d');
            
            // Draw barcode
            ctx.drawImage(img, 0, 0);
            
            // Draw value if checked
            if (showValue.checked) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.fillText(text, canvas.width / 2, svg.clientHeight + 25);
            }
            
            downloadCanvas(canvas, 'barcode.png');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
    
    function downloadQRCode(text) {
        // Get the QR code element (could be canvas, img, or div with SVG)
        const qrElement = qrcodeDiv.firstChild;
        
        if (!qrElement) {
            alert('Generate QR Code terlebih dahulu!');
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300 + (showValue.checked ? 40 : 0);
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code based on element type
        if (qrElement.tagName === 'CANVAS') {
            // If it's already a canvas
            ctx.drawImage(qrElement, 0, 0);
        } else if (qrElement.tagName === 'IMG') {
            // If it's an image
            ctx.drawImage(qrElement, 0, 0);
        } else if (qrElement.tagName === 'SVG' || qrElement.querySelector('svg')) {
            // If it's SVG (qrcodejs creates SVG in some cases)
            const svg = qrElement.tagName === 'SVG' ? qrElement : qrElement.querySelector('svg');
            const svgString = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, 300, 300);
                URL.revokeObjectURL(url);
                
                // Draw value if checked
                if (showValue.checked) {
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'center';
                    ctx.fillText(text, canvas.width / 2, 300 + 25);
                }
                
                downloadCanvas(canvas, 'qrcode.png');
            };
            img.src = url;
            return; // Exit early, download will happen in img.onload
        } else {
            // Fallback: create QR code directly on canvas
            createQRCodeOnCanvas(ctx, text, 0, 0, 300);
        }
        
        // Draw value if checked
        if (showValue.checked) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, 300 + 25);
        }
        
        downloadCanvas(canvas, 'qrcode.png');
    }
    
    // Helper function to create QR code directly on canvas (fallback)
    function createQRCodeOnCanvas(ctx, text, x, y, size) {
        // Simple fallback QR code (just for demonstration)
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', x + size/2, y + size/2);
        ctx.font = '12px Arial';
        ctx.fillText(text.substring(0, 20) + '...', x + size/2, y + size/2 + 30);
    }
    
    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Enter key support
    inputText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateCode();
        }
    });
});