document.addEventListener("DOMContentLoaded", () => {
    // (পুরো JavaScript কোড আগের উত্তর থেকে কপি করে পেস্ট করুন...)
    const dataInput = document.getElementById("data-input");
    const dotsColorInput = document.getElementById("dots-color");
    const bgColorInput = document.getElementById("bg-color");
    const cornerSquareColorInput = document.getElementById("corner-square-color");
    // const cornerDotColorInput = document.getElementById("corner-dot-color");
    const dotsStyleSelect = document.getElementById("dots-style");
    const cornerStyleSelect = document.getElementById("corner-style");
    const logoUpload = document.getElementById("logo-upload");
    const removeLogoBtn = document.getElementById("remove-logo");
    const generateBtn = document.getElementById("generate-btn");
    const downloadPngBtn = document.getElementById("download-btn-png");
    const downloadSvgBtn = document.getElementById("download-btn-svg");
    const downloadjpgBtn = document.getElementById("download-btn-jpg");
    const qrCodeContainer = document.getElementById("qr-code-canvas");
    let logoFile = null;
    let qrCodeInstance = null;
    logoUpload.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoFile = event.target.result;
                if (qrCodeInstance) generateQRCode();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    removeLogoBtn.addEventListener("click", () => {
        logoFile = null;
        logoUpload.value = '';
        if (qrCodeInstance) generateQRCode();
    });
    generateBtn.addEventListener("click", generateQRCode);
    [dotsColorInput, bgColorInput, cornerSquareColorInput, dotsStyleSelect, cornerStyleSelect].forEach(input => {
        input.addEventListener("input", () => { // "input" event for live color changes
            if (qrCodeInstance) {
                generateQRCode();
            }
        });
    });

    function generateQRCode() {
        const data = dataInput.value.trim();
        if (!data) {
            qrCodeContainer.innerHTML = `<p style="font-size: 16px; text-align: center; color: #888;">তথ্য দিয়ে 'QR কোড তৈরি করুন' বাটনে ক্লিক করুন।</p>`;
            downloadPngBtn.style.display = 'none';
            downloadSvgBtn.style.display = 'none';
            downloadjpgBtn.style.display = 'none';
            return;
        }

        const options = {
            width: 300,
            height: 300,
            data: data,
            image: logoFile,
            dotsOptions: {
                color: dotsColorInput.value,
                type: dotsStyleSelect.value,
            },
            backgroundOptions: {
                color: bgColorInput.value,
            },
            cornersSquareOptions: {
                color: cornerSquareColorInput.value,
                type: cornerStyleSelect.value,
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10,
                imageSize: 0.4, 
            },
        };

        if (!qrCodeInstance) {
            qrCodeInstance = new QRCodeStyling(options);
            qrCodeContainer.innerHTML = '';
            qrCodeInstance.append(qrCodeContainer);
        } else {
            qrCodeInstance.update(options);
        }

        downloadPngBtn.style.display = 'block';
        downloadSvgBtn.style.display = 'block';
        downloadjpgBtn.style.display = 'block';
    }

    downloadPngBtn.addEventListener('click', () => {
        if(qrCodeInstance) {
            qrCodeInstance.download({ name: 'qr-code', extension: 'png' });
        }
    });
    downloadSvgBtn.addEventListener('click', () => {
        if(qrCodeInstance) {
            qrCodeInstance.download({ name: 'qr-code', extension: 'svg' });
        }
    });
    downloadjpgBtn.addEventListener('click', () => {
        if(qrCodeInstance) {
            qrCodeInstance.download({ name: 'qr-code', extension: 'jpg' });
        }
    });
    
    // Initial state setup
    qrCodeContainer.innerHTML = `<p style="font-size: 16px; text-align: center; color: #888;">আপনার QR কোড এখানে দেখা যাবে।</p>`;
    downloadPngBtn.style.display = 'none';
    downloadSvgBtn.style.display = 'none';
    downloadjpgBtn.style.display = 'none';
});