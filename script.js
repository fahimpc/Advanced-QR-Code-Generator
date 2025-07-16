document.addEventListener("DOMContentLoaded", () => {
    // ইনপুট এলিমেন্টগুলো সিলেক্ট করা
    const allInputs = document.querySelectorAll('.input-section input:not(#qr-resolution), .input-section textarea, .input-section select');
    const logoUpload = document.getElementById("logo-upload");
    const removeLogoBtn = document.getElementById("remove-logo");
    const downloadPngBtn = document.getElementById("download-btn-png");
    const downloadSvgBtn = document.getElementById("download-btn-svg");
    const downloadJpgBtn = document.getElementById("download-btn-jpg");
    const qrCodeContainer = document.getElementById("qr-code-canvas");

    // নতুন: রেজোলিউশন উপাদান
    const qrResolutionSlider = document.getElementById("qr-resolution");
    const resolutionDisplay = document.getElementById("resolution-display");

    let logoFile = null;
    let qrCodeInstance = null;
    let activeTab = 'text-url'; // প্রাথমিক সক্রিয় ট্যাব

    // প্রাথমিক রেজোলিউশন মান
    const initialResolution = parseInt(qrResolutionSlider.value);
    resolutionDisplay.textContent = `${initialResolution} x ${initialResolution} Px`;

    // QR কোডের জন্য একটি বেসিক ইনস্ট্যান্স তৈরি
    qrCodeInstance = new QRCodeStyling({
        width: initialResolution, // স্লাইডারের প্রাথমিক মান ব্যবহার করুন
        height: initialResolution, // স্লাইডারের প্রাথমিক মান ব্যবহার করুন
        data: "https://advancedqrcodegenerator.xyz/",
        dotsOptions: { color: "#000000", type: "square" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "square" },
        imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 1.6 }
    });
    qrCodeInstance.append(qrCodeContainer);

    // লাইভ আপডেটের জন্য ইভেন্ট লিসেনার
    allInputs.forEach(input => {
        input.addEventListener("input", generateQRCode);
    });

    // নতুন: রেজোলিউশন স্লাইডারের জন্য ইভেন্ট লিসেনার যোগ করুন
    qrResolutionSlider.addEventListener("input", () => {
        const resolution = qrResolutionSlider.value;
        resolutionDisplay.textContent = `${resolution} x ${resolution} Px`;
        // ভিজ্যুয়াল প্রতিক্রিয়ার জন্য কন্টেইনারের আকার অবিলম্বে আপডেট করার জন্য
        // এখানে qrCodeContainer এর CSS width/height সেট না করে শুধুমাত্র QR কোড ইনস্ট্যান্স আপডেট করলে
        // CSS এর max-width প্রপার্টিটি নিয়ন্ত্রণ করতে পারবে।
        // qrCodeContainer.style.width = `${resolution}px`; // এই লাইনটি সরিয়ে দেওয়া হয়েছে
        // qrCodeContainer.style.height = `${resolution}px`; // এই লাইনটি সরিয়ে দেওয়া হয়েছে
        generateQRCode(); // নতুন রেজোলিউশন দিয়ে QR কোড পুনরায় জেনারেট করুন
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
        // YYYYMMDDTHHMMSSZ ফরম্যাটে রূপান্তর, হাইফেন, কোলন এবং মিলিসেকেন্ড বাদ দিয়ে
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
            case 'mecard':
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
                    const formattedBirthday = birthday.replace(/-/g, ''); // YYYYMMDD এর জন্য হাইফেন সরান
                    mecardData += `BDAY:${formattedBirthday};`;
                }
                if (street || city || state || zipcode || country) {
                    mecardData += `ADR:${street},,${city},${state},${zipcode},${country};`;
                }
                if (notes) {
                    mecardData += `NOTE:${notes};`;
                }
                mecardData += ";"; // MECARD ডেটার শেষ
                return mecardData;
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

            case 'paypal':
                const paypalEmail = document.getElementById('paypal-email').value;
                const paypalItemName = document.getElementById('paypal-item-name').value;
                const paypalAmount = document.getElementById('paypal-amount').value;
                const paypalCurrency = document.getElementById('paypal-currency').value;

                let paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${encodeURIComponent(paypalEmail)}`;
                if (paypalItemName) {
                    paypalUrl += `&item_name=${encodeURIComponent(paypalItemName)}`;
                }
                if (paypalAmount) {
                    paypalUrl += `&amount=${encodeURIComponent(paypalAmount)}`;
                }
                if (paypalCurrency) {
                    paypalUrl += `&currency_code=${encodeURIComponent(paypalCurrency)}`;
                }
                return paypalUrl;

            case 'bitcoin':
                const bitcoinAddress = document.getElementById('bitcoin-address').value;
                const bitcoinAmount = document.getElementById('bitcoin-amount').value;
                const bitcoinMessage = document.getElementById('bitcoin-message').value;

                let bitcoinUri = `bitcoin:${bitcoinAddress}`;
                const params = [];
                if (bitcoinAmount) {
                    params.push(`amount=${encodeURIComponent(bitcoinAmount)}`);
                }
                if (bitcoinMessage) {
                    params.push(`message=${encodeURIComponent(bitcoinMessage)}`);
                }
                if (params.length > 0) {
                    bitcoinUri += `?${params.join('&')}`;
                }
                return bitcoinUri;

            case 'app-download':
                const androidUrl = document.getElementById('app-android-url').value;
                const iosUrl = document.getElementById('app-ios-url').value;

                if (androidUrl && iosUrl) {
                    return `Android: ${androidUrl}\niOS: ${iosUrl}`;
                } else if (androidUrl) {
                    return androidUrl;
                } else if (iosUrl) {
                    return iosUrl;
                }
                return "";

            case 'text-url':
            default:
                return document.getElementById("data-input").value.trim();
        }
    }

    function generateQRCode() {
        const data = getQrData();
        const selectedResolution = parseInt(qrResolutionSlider.value); // স্লাইডার থেকে বর্তমান রেজোলিউশন নিন

        if (!data || (typeof data === 'string' && !data.trim()) || data.includes('undefined')) {
            downloadPngBtn.style.display = 'none';
            downloadSvgBtn.style.display = 'none';
            downloadJpgBtn.style.display = 'none';
            return;
        }

        // গ্রেডিয়েন্ট রঙের জন্য লজিক
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
            width: selectedResolution,  // নির্বাচিত রেজোলিউশন ব্যবহার করুন
            height: selectedResolution, // নির্বাচিত রেজোলিউশন ব্যবহার করুন
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

        // QR কোড কন্টেইনারের ডিসপ্লে আকার আপডেট করার জন্য JS এর পরিবর্তে CSS এর উপর ভরসা করছি।
        // যদি কন্টেইনারের ভিতরে জেনারেট হওয়া QR কোড (SVG/Canvas) বড় হয়, তাহলে CSS এর max-width তাকে নিয়ন্ত্রণ করবে।
        // qrCodeContainer.style.width = `${selectedResolution}px`; // এই লাইনটি সরানো হয়েছে
        // qrCodeContainer.style.height = `${selectedResolution}px`; // এই লাইনটি সরানো হয়েছে


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
    // ডাউনলোড বাটনের প্রাথমিক প্রদর্শন এখন generateQRCode দ্বারা পরিচালিত হয়,
    // যা DOMContentLoaded এর শেষে একবার কল করা হয়।
    // প্রাথমিক QR কোড কন্টেইনারের আকার JS দিয়ে সেট করার পরিবর্তে CSS এর উপর ভরসা করছি।
    // qrCodeContainer.style.width = `${initialResolution}px`; // এই লাইনটি সরানো হয়েছে
    // qrCodeContainer.style.height = `${initialResolution}px`; // এই লাইনটি সরানো হয়েছে

    generateQRCode(); // ডিফল্ট সেটিংস সহ প্রাথমিক QR কোড জেনারেট করুন
});