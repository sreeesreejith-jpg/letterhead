// script.js for Letterhead Maker

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const goBtn = document.getElementById('go-btn');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const downloadBtn = document.getElementById('download-pdf-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Input fields
    const schoolName = document.getElementById('school-name');
    const schoolCode = document.getElementById('school-code');
    const schoolAddress = document.getElementById('school-address');
    const letterMatter = document.getElementById('letter-matter');
    const letterSubhead = document.getElementById('letter-subhead');
    const letterPlace = document.getElementById('letter-place');
    const letterDate = document.getElementById('letter-date');

    // Preview elements
    const prevName = document.getElementById('live-prev-school-name');
    const prevCode = document.getElementById('live-prev-school-code');
    const prevAddress = document.getElementById('live-prev-school-address');
    const prevPlace = document.getElementById('live-prev-place');
    const prevDate = document.getElementById('live-prev-date');
    const prevSubhead = document.getElementById('live-prev-subhead');
    const prevMatter = document.getElementById('live-prev-matter');

    // 2. Initial Date Setup & Preview Sync
    const today = new Date().toISOString().split('T')[0];
    letterDate.value = today;

    function updatePreview() {
        prevName.textContent = schoolName.value || '[School Name]';
        prevCode.textContent = schoolCode.value ? `School Code: ${schoolCode.value}` : 'School Code: [Code]';
        prevAddress.textContent = schoolAddress.value || '[Full Address]';
        prevPlace.textContent = `Place: ${letterPlace.value || '[Place]'}`;

        const d = letterDate.value;
        const formatted = d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '[Date]';
        prevDate.textContent = `Date: ${formatted}`;

        prevSubhead.textContent = letterSubhead.value.toUpperCase();
        prevSubhead.style.display = letterSubhead.value ? 'block' : 'none';

        prevMatter.textContent = letterMatter.value || '[Start typing in Step 2 to see the letter matter here...]';
    }

    // Attach listeners for real-time preview
    [schoolName, schoolCode, schoolAddress, letterPlace, letterDate, letterSubhead, letterMatter].forEach(el => {
        el.addEventListener('input', updatePreview);
    });

    // Initial call
    updatePreview();

    // 3. Logic for Go Button
    goBtn.addEventListener('click', () => {
        // Validation
        if (!schoolName.value || !schoolCode.value || !schoolAddress.value || !letterPlace.value || !letterDate.value) {
            alert('Please fill in all school details including Place and Date.');
            return;
        }

        // Show Section 2 with animation
        step2.style.display = 'block';
        step2.classList.add('fade-in');

        // Disable pulse on button and change its state
        goBtn.classList.remove('pulse');
        goBtn.querySelector('span').textContent = 'Update Header Info';

        // Scroll to Section 2
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 4. Reset Button
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all fields and start over?')) {
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => input.value = '');
            letterDate.value = today;
            step2.style.display = 'none';
            goBtn.classList.add('pulse');
            goBtn.querySelector('span').textContent = 'Generate Letterhead Area';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 5. PDF Generation Logic
    downloadBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;

        // Simple Validation
        if (!letterMatter.value) {
            alert('Please enter the letter matter/content.');
            letterMatter.focus();
            return;
        }

        // Create PDF (A4 size)
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // --- DRAW HEADER (BEAUTIFULLY) ---
        // Fill a subtle top bar or border? Let's go simple but elegant.
        doc.setDrawColor(59, 130, 246); // Primary Blue
        doc.setLineWidth(1.5);
        doc.line(margin, 10, pageWidth - margin, 10); // Top line

        // School Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        const nameLines = doc.splitTextToSize(schoolName.value.toUpperCase(), pageWidth - (margin * 2));
        doc.text(nameLines, pageWidth / 2, 25, { align: 'center' });

        // School Code
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`School Code: ${schoolCode.value}`, pageWidth / 2, 33, { align: 'center' });

        // Address
        doc.setFontSize(10);
        doc.setTextColor(100);
        const addressLines = doc.splitTextToSize(schoolAddress.value, pageWidth - (margin * 2));
        doc.text(addressLines, pageWidth / 2, 40, { align: 'center' });

        // Header Bottom Divider
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        const headerEndHeight = 45 + (addressLines.length * 4);
        doc.line(margin, headerEndHeight, pageWidth - margin, headerEndHeight);

        // --- PLACE & DATE ---
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const formattedDate = new Date(letterDate.value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        doc.text(`Place: ${letterPlace.value || 'Not Specified'}`, margin, headerEndHeight + 12);
        doc.text(`Date: ${formattedDate}`, pageWidth - margin, headerEndHeight + 12, { align: 'right' });

        // --- SUBHEADING ---
        const subheadY = headerEndHeight + 25;
        let matterY = subheadY + 10; // Default start for matter

        if (letterSubhead.value) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            const subheadText = letterSubhead.value.toUpperCase();
            doc.text(subheadText, pageWidth / 2, subheadY, { align: 'center' });

            // Underline for subhead
            const textWidth = doc.getTextWidth(subheadText);
            doc.setLineWidth(0.5);
            doc.line(pageWidth / 2 - (textWidth / 2), subheadY + 1.5, pageWidth / 2 + (textWidth / 2), subheadY + 1.5);

            matterY = subheadY + 15; // Push matter down if subhead exists
        }

        // --- CONTENT / MATTER ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const matterText = letterMatter.value;
        const matterLines = doc.splitTextToSize(matterText, pageWidth - (margin * 2));

        doc.text(matterLines, margin, matterY, { align: 'justify', maxWidth: pageWidth - (margin * 2) });

        // --- SIGNATURE AREA ---
        const contentBottomY = matterY + (matterLines.length * 6);
        const signatureY = Math.max(contentBottomY + 30, pageHeight - 50); // Minimum 50mm from bottom

        doc.setFont('helvetica', 'bold');
        doc.text('Sincerely,', pageWidth - margin - 20, signatureY, { align: 'center' });

        doc.setFontSize(11);
        doc.text('____________________', pageWidth - margin - 20, signatureY + 15, { align: 'center' });
        doc.text('Headmaster / Principal', pageWidth - margin - 20, signatureY + 22, { align: 'center' });

        // Footer line
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generated by Nithara Letterhead Maker', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // --- SAVE THE PDF ---
        const fileName = `${schoolName.value.replace(/[^a-z0-9]/gi, '_')}_Letter.pdf`;
        doc.save(fileName);
    });

    // 6. Keyboard shortcuts (Optional)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            if (step2.style.display !== 'none') {
                downloadBtn.click();
            } else {
                goBtn.click();
            }
        }
    });
});
