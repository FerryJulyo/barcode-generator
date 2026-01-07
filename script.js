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
    
    // Generate QR Code untuk qrcodejs library
    function generateQRCode(text) {
        // Clear previous QR code
        qrcodeDiv.innerHTML = '';
        
        // Create new QR code
        new QRCode(qrcodeDiv, {
            text: text,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    // Download function
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
        
        if (!svg || svg.childNodes.length === 0) {
            alert('Generate barcode terlebih dahulu!');
            return;
        }
        
        const xml = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([xml], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            
            // Set canvas dimensions
            canvas.width = svg.clientWidth || 400;
            canvas.height = (svg.clientHeight || 100) + (showValue.checked ? 40 : 0);
            
            const ctx = canvas.getContext('2d');
            
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw barcode
            ctx.drawImage(img, 0, 0, canvas.width, svg.clientHeight || 100);
            
            // Draw value if checked
            if (showValue.checked) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.fillText(text, canvas.width / 2, (svg.clientHeight || 100) + 25);
            }
            
            // Download
            const link = document.createElement('a');
            link.download = 'barcode.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        };
        
        img.onerror = function() {
            alert('Error memproses barcode!');
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    }
    
    function downloadQRCode(text) {
        // Get QR code element
        const qrElement = qrcodeDiv.firstChild;
        
        if (!qrElement) {
            alert('Generate QR Code terlebih dahulu!');
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300 + (showValue.checked ? 40 : 0);
        const ctx = canvas.getContext('2d');
        
        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Function to draw QR code and download
        const drawAndDownload = () => {
            // Draw value if checked
            if (showValue.checked) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.fillText(text, canvas.width / 2, 300 + 25);
            }
            
            // Download
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        
        // Check element type and draw accordingly
        if (qrElement.tagName === 'CANVAS') {
            // If QR code is canvas
            ctx.drawImage(qrElement, 0, 0);
            drawAndDownload();
        } else if (qrElement.tagName === 'IMG') {
            // If QR code is image
            ctx.drawImage(qrElement, 0, 0);
            drawAndDownload();
        } else {
            // If QR code is SVG or div containing SVG
            let svgElement;
            
            if (qrElement.tagName === 'SVG') {
                svgElement = qrElement;
            } else if (qrElement.querySelector('svg')) {
                svgElement = qrElement.querySelector('svg');
            } else {
                // Fallback: draw simple QR code
                ctx.fillStyle = '#000000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('QR Code', 150, 140);
                ctx.font = '12px Arial';
                ctx.fillText(text.substring(0, 30), 150, 160);
                drawAndDownload();
                return;
            }
            
            // Convert SVG to image
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, 300, 300);
                URL.revokeObjectURL(url);
                drawAndDownload();
            };
            
            img.onerror = function() {
                URL.revokeObjectURL(url);
                alert('Error memproses QR code!');
            };
            
            img.src = url;
        }
    }
    
    // Enter key support
    inputText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateCode();
        }
    });
});