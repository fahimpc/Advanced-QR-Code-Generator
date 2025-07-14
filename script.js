document.addEventListener("DOMContentLoaded", () => {
    // ইনপুট এলিমেন্টগুলো সিলেক্ট করা
    const allInputs = document.querySelectorAll('.input-section input, .input-section textarea, .input-section select');
    const logoUpload = document.getElementById("logo-upload");
    const removeLogoBtn = document.getElementById("remove-logo");
    const downloadPngBtn = document.getElementById("download-btn-png");
    const downloadSvgBtn = document.getElementById("download-btn-svg");
    const downloadJpgBtn = document.getElementById("download-btn-jpg");
    const qrCodeContainer = document.getElementById("qr-code-canvas");

    let logoFile = null;
    let qrCodeInstance = null;
    let activeTab = 'text-url';

    // QR কোডের জন্য একটি বেসিক ইনস্ট্যান্স তৈরি
    qrCodeInstance = new QRCodeStyling({
        width: 300,
        height: 300,
        data: "https://advancedqrcodegenerator.xyz/",
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "square" },
        imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 }
    });
    qrCodeInstance.append(qrCodeContainer);

    // লাইভ আপডেটের জন্য ইভেন্ট লিসেনার
    allInputs.forEach(input => {
        input.addEventListener("input", generateQRCode);
    });

    logoUpload.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoFile = event.target.result;
                generateQRCode();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    removeLogoBtn.addEventListener("click", () => {
        logoFile = null;
        logoUpload.value = '';
        generateQRCode();
    });

    function getQrData() {
        switch (activeTab) {
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value;
                const pass = document.getElementById('wifi-pass').value;
                const enc = document.getElementById('wifi-encryption').value;
                return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
            case 'vcard':
                const name = document.getElementById('vcard-name').value;
                const phone = document.getElementById('vcard-phone').value;
                const email = document.getElementById('vcard-email').value;
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            case 'text-url':
            default:
                return document.getElementById("data-input").value.trim();
        }
    }

    function generateQRCode() {
        const data = getQrData();
        if (!data || (typeof data === 'string' && !data.trim())) {
            downloadPngBtn.style.display = 'none';
            downloadSvgBtn.style.display = 'none';
            downloadJpgBtn.style.display = 'none';
            return;
        }

        const options = {
            data: data,
            image: logoFile,
            dotsOptions: {
                color: document.getElementById("dots-color").value,
                type: document.getElementById("dots-style").value,
            },
            backgroundOptions: {
                color: document.getElementById("bg-color").value,
            },
            cornersSquareOptions: {
                color: document.getElementById("corner-square-color").value,
                type: document.getElementById("corner-style").value,
            },
        };
        qrCodeInstance.update(options);

        downloadPngBtn.style.display = 'block';
        downloadSvgBtn.style.display = 'block';
        downloadJpgBtn.style.display = 'block';
    }

    // ডাউনলোড বাটনগুলোর জন্য ইভেন্ট লিসেনার
    downloadPngBtn.addEventListener('click', () => qrCodeInstance.download({ name: 'qr-code', extension: 'png' }));
    downloadSvgBtn.addEventListener('click', () => qrCodeInstance.download({ name: 'qr-code', extension: 'svg' }));
    downloadJpgBtn.addEventListener('click', () => qrCodeInstance.download({ name: 'qr-code', extension: 'jpeg' }));
    
    // ট্যাবের জন্য গ্লোবাল ফাংশন
    window.openTab = (evt, tabName) => {
        activeTab = tabName;
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tab-link");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
        generateQRCode(); // ট্যাব পরিবর্তন হলেও QR কোড আপডেট হবে
    }

    // প্রাথমিক অবস্থা সেটআপ
    generateQRCode();
});