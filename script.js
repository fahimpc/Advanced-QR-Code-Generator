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
    let activeTab = 'text-url'; // Initial active tab

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

    // Helper function to format date for VEVENT
    function formatVEventDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format to YYYYMMDDTHHMMSSZ, by removing '-', ':', and milliseconds
        return date.toISOString().replace(/[-:]/g, "").split('.')[0] + 'Z';
    }

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
                const emailVcard = document.getElementById('vcard-email').value;
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${emailVcard}\nEND:VCARD`;
            case 'mecard': // NEW: MECARD Data Generation
                let mecardData = "MECARD:";
                const firstName = document.getElementById('mecard-firstname').value;
                const lastName = document.getElementById('mecard-lastname').value;
                const nickname = document.getElementById('mecard-nickname').value;
                const phone1 = document.getElementById('mecard-phone1').value;
                const phone2 = document.getElementById('mecard-phone2').value;
                const phone3 = document.getElementById('mecard-phone3').value;
                const emailMecard = document.getElementById('mecard-email').value;
                const website = document.getElementById('mecard-website').value;
                const birthday = document.getElementById('mecard-birthday').value; // YYYY-MM-DD
                const street = document.getElementById('mecard-street').value;
                const zipcode = document.getElementById('mecard-zipcode').value;
                const city = document.getElementById('mecard-city').value;
                const state = document.getElementById('mecard-state').value;
                const country = document.getElementById('mecard-country').value;
                const notes = document.getElementById('mecard-notes').value;

                if (firstName || lastName) {
                    mecardData += `N:${lastName},${firstName};`;
                }
                if (nickname) {
                    mecardData += `NICKNAME:${nickname};`;
                }
                if (phone1) {
                    mecardData += `TEL:${phone1};`;
                }
                if (phone2) {
                    mecardData += `TEL:${phone2};`;
                }
                if (phone3) {
                    mecardData += `TEL:${phone3};`;
                }
                if (emailMecard) {
                    mecardData += `EMAIL:${emailMecard};`;
                }
                if (website) {
                    mecardData += `URL:${website};`;
                }
                if (birthday) {
                    const formattedBirthday = birthday.replace(/-/g, ''); // Remove hyphens for YYYYMMDD
                    mecardData += `BDAY:${formattedBirthday};`;
                }
                if (street || city || state || zipcode || country) {
                    mecardData += `ADR:${street},,${city},${state},${zipcode},${country};`;
                }
                if (notes) {
                    mecardData += `NOTE:${notes};`;
                }
                mecardData += ";"; // End of MECARD data

                return mecardData;
            // END NEW: MECARD Data Generation
            case 'email':
                const to = document.getElementById('email-to').value;
                const subject = document.getElementById('email-subject').value;
                const body = document.getElementById('email-body').value;
                return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            case 'sms':
                const smsTo = document.getElementById('sms-to').value;
                const smsBody = document.getElementById('sms-body').value;
                return `SMSTO:${smsTo}:${encodeURIComponent(smsBody)}`;
            case 'phone':
                const tel = document.getElementById('phone-number').value;
                return `tel:${tel}`;
            case 'location':
                const lat = document.getElementById('loc-lat').value;
                const lon = document.getElementById('loc-lon').value;
                return `geo:${lat},${lon}`;
            case 'event':
                const summary = document.getElementById('event-summary').value;
                const start = formatVEventDate(document.getElementById('event-start').value);
                const end = formatVEventDate(document.getElementById('event-end').value);
                const location = document.getElementById('event-location').value;
                return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${summary}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`;
            case 'text-url':
            default:
                return document.getElementById("data-input").value.trim();
        }
    }

    function generateQRCode() {
        const data = getQrData();
        if (!data || (typeof data === 'string' && !data.trim()) || data.includes('undefined')) {
            downloadPngBtn.style.display = 'none';
            downloadSvgBtn.style.display = 'none';
            downloadJpgBtn.style.display = 'none';
            return;
        }

        // Logic for handling gradient colors
        const dotsColor1 = document.getElementById("dots-color").value;
        const dotsColor2 = document.getElementById("dots-color-2").value;
        const dotsOptions = {
            type: document.getElementById("dots-style").value,
        };
        if (dotsColor1 !== dotsColor2) {
            dotsOptions.gradient = {
                type: document.getElementById("gradient-type").value,
                colorStops: [
                    { offset: 0, color: dotsColor1 },
                    { offset: 1, color: dotsColor2 }
                ]
            };
        } else {
            dotsOptions.color = dotsColor1;
        }
        
        const options = {
            data: data,
            image: logoFile,
            dotsOptions: dotsOptions,
            backgroundOptions: {
                color: document.getElementById("bg-color").value,
            },
            cornersSquareOptions: {
                color: document.getElementById("corner-square-color").value,
                type: document.getElementById("corner-style").value,
            },
            qrOptions: {
                errorCorrectionLevel: document.getElementById("error-correction").value
            }
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
    document.getElementById('download-btn-png').style.display = 'block';
    document.getElementById('download-btn-svg').style.display = 'block';
    document.getElementById('download-btn-jpg').style.display = 'block';
    generateQRCode();
});