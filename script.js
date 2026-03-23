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
    const letterDesignation = document.getElementById('letter-designation');

    // Designation handle
    const designationChips = document.querySelectorAll('.chip');

    // Preview elements
    const prevName = document.getElementById('live-prev-school-name');
    const prevCode = document.getElementById('live-prev-school-code');
    const prevAddress = document.getElementById('live-prev-school-address');
    const prevPlace = document.getElementById('live-prev-place');
    const prevDate = document.getElementById('live-prev-date');
    const prevSubhead = document.getElementById('live-prev-subhead');
    const prevMatter = document.getElementById('live-prev-matter');
    const prevDesignation = document.getElementById('live-prev-designation');

    // 1b. Firebase Initialization (New Isolated Project)
    const firebaseConfig = {
        apiKey: "AIzaSyBnSaFk8T72ZFNH1oiC7AsuAh8EsuXFlwo",
        authDomain: "letterhead-55053.firebaseapp.com",
        databaseURL: "https://letterhead-55053-default-rtdb.firebaseio.com",
        projectId: "letterhead-55053",
        storageBucket: "letterhead-55053.firebasestorage.app",
        messagingSenderId: "82009825299",
        appId: "1:82009825299:web:72cb5d0ab0113ac0629fe6"
    };

    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
    }
    const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

    // 2. Initial Date Setup & Formatting State
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    letterDate.value = today;

    // Auto-fetch data by School Code
    schoolCode.addEventListener('blur', () => {
        const code = schoolCode.value.trim();
        if (code && database) {
            database.ref('schools/' + code).once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    schoolName.value = data.name || schoolName.value;
                    schoolAddress.value = data.address || schoolAddress.value;
                    letterDesignation.value = data.designation || '';
                    letterPlace.value = data.place || letterPlace.value;
                    syncChips();
                    updatePreview();
                }
            });
        }
    });

    // Handle Designation Chips
    function syncChips() {
        designationChips.forEach(chip => {
            if (chip.getAttribute('data-value') === letterDesignation.value) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    designationChips.forEach(chip => {
        chip.addEventListener('click', () => {
            letterDesignation.value = chip.getAttribute('data-value');
            syncChips();
            updatePreview();
        });
    });

    // If user types manually, update/clear chip highlights
    letterDesignation.addEventListener('input', () => {
        syncChips();
    });

    // Formatting Tool Listeners (These are now handled by execCommand directly on letterMatter)
    // const alignBtns = document.querySelectorAll('.align-btn');
    // const spacingSelect = document.getElementById('line-spacing');

    // alignBtns.forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         alignBtns.forEach(b => b.classList.remove('active'));
    //         btn.classList.add('active');
    //         currentAlign = btn.getAttribute('data-align');
    //         updatePreview();
    //     });
    // });

    // spacingSelect.addEventListener('change', (e) => {
    //     currentLineSpacing = parseFloat(e.target.value);
    //     updatePreview();
    // });

    function updatePreview() {
        prevName.textContent = schoolName.value ? schoolName.value : '';
        prevCode.textContent = schoolCode.value ? `School Code: ${schoolCode.value}` : '';
        prevAddress.textContent = schoolAddress.value ? schoolAddress.value : '';

        // Only show Place/Date labels if there's a value
        prevPlace.textContent = letterPlace.value ? `Place: ${letterPlace.value}` : '';
        prevDate.textContent = letterDate.value ? `Date: ${letterDate.value}` : '';

        prevSubhead.textContent = letterSubhead.value.toUpperCase();
        prevSubhead.style.display = letterSubhead.value ? 'block' : 'none';

        prevDesignation.textContent = letterDesignation.value || '';
        document.querySelector('.paper-footer').style.display = letterDesignation.value ? 'block' : 'none';

        // Update Rich Matter Preview
        prevMatter.innerHTML = letterMatter.innerHTML || '[Start typing in Step 2 to see the letter matter here...]';
    }

    // Rich Text Toolbar Logic
    const richTools = document.querySelectorAll('.rich-tool');
    const richSelects = document.querySelectorAll('.rich-tool-select');
    const colorPicker = document.getElementById('text-color');

    richTools.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const command = btn.getAttribute('data-command');
            document.execCommand(command, false, null);
            updatePreview();
        });
    });

    richSelects.forEach(select => {
        select.addEventListener('change', () => {
            const command = select.getAttribute('data-command');
            document.execCommand(command, false, select.value);
            updatePreview();
        });
    });

    colorPicker.addEventListener('input', () => {
        document.execCommand('foreColor', false, colorPicker.value);
        updatePreview();
    });

    // Attach listeners for real-time preview
    [schoolName, schoolCode, schoolAddress, letterDesignation, letterPlace, letterDate, letterSubhead].forEach(el => {
        el.addEventListener('input', updatePreview);
    });

    // Rich editor listener
    letterMatter.addEventListener('input', updatePreview);

    // Initial call
    syncChips();
    updatePreview();

    // 3. Logic for Go Button
    goBtn.addEventListener('click', () => {
        // Validation (Everything is now optional!)

        // Auto-Save/Update to Database if Code is provided
        const code = schoolCode.value.trim();
        if (code && database) {
            database.ref('schools/' + code).update({
                name: schoolName.value,
                address: schoolAddress.value,
                place: letterPlace.value,
                designation: letterDesignation.value,
                lastUpdated: new Date().toISOString()
            });
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
            letterMatter.innerHTML = ''; // Clear contenteditable div
            letterDate.value = today;
            updatePreview(); // Ensure preview clears too
            step2.style.display = 'none';
            goBtn.classList.add('pulse');
            goBtn.querySelector('span').textContent = 'Generate Letterhead Area';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 5. Professional PDF Generation (High Fidelity Hybrid)
    downloadBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;

        // No mandatory fields - allow blank letterhead download as requested.

        downloadBtn.textContent = '⏳ Creating...';
        downloadBtn.disabled = true;

        try {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;

            // 1. Draw HEADER (Sharp Native Text)
            pdf.setDrawColor(0);
            pdf.setLineWidth(1.5);
            pdf.line(margin, 15, pageWidth - margin, 15); // Top bar

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.setTextColor(0);
            const nameLines = pdf.splitTextToSize(schoolName.value.toUpperCase(), pageWidth - (margin * 2));
            pdf.text(nameLines, pageWidth / 2, 28, { align: 'center' });

            let nextY = 36;
            if (schoolCode.value) {
                pdf.setFontSize(14); // BIGGER
                pdf.setFont('helvetica', 'bold'); // BOLD
                pdf.text(`School Code: ${schoolCode.value}`, pageWidth / 2, nextY, { align: 'center' });
                nextY += 8;
            } else { nextY = 32; }

            if (schoolAddress.value) {
                pdf.setFontSize(12); // BIGGER
                pdf.setFont('helvetica', 'bold'); // BOLD
                pdf.setTextColor(40); // Darker
                const addressLines = pdf.splitTextToSize(schoolAddress.value, pageWidth - (margin * 3));
                pdf.text(addressLines, pageWidth / 2, nextY, { align: 'center' });
                nextY += (addressLines.length * 5);
            }

            // Divider Line
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.5);
            pdf.line(margin, nextY, pageWidth - margin, nextY);

            // 2. PLACE & DATE
            pdf.setTextColor(0);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            if (letterPlace.value) pdf.text(`Place: ${letterPlace.value}`, margin, nextY + 10);
            if (letterDate.value) pdf.text(`Date: ${letterDate.value}`, pageWidth - margin, nextY + 10, { align: 'right' });

            // 3. SUBHEADING
            let subheadY = nextY + 22;
            let matterY = subheadY;
            if (letterSubhead.value) {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(14);
                const st = letterSubhead.value.toUpperCase();
                pdf.text(st, pageWidth / 2, subheadY, { align: 'center' });
                const tw = pdf.getTextWidth(st);
                pdf.line(pageWidth / 2 - (tw / 2), subheadY + 1.2, pageWidth / 2 + (tw / 2), subheadY + 1.2);
                matterY = subheadY + 12;
            }

            // 4. RICH TEXT MATTER (Native Selectable Text)
            // This ensures 100% clarity and selectability
            const maxWidth = pageWidth - (margin * 2);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(0);

            // Handle both div-wrapped lines and raw text
            let contentNodes = Array.from(letterMatter.childNodes);
            let currentY = matterY;

            contentNodes.forEach(node => {
                let text = node.textContent || "";
                if (!text.trim() && node.nodeName === "BR") {
                    currentY += 6; // Simple line break
                    return;
                }
                if (!text.trim() && node.nodeName !== "DIV" && node.nodeName !== "P") return;

                let align = 'left';
                if (node.nodeType === 1) { // Element node
                    align = node.style.textAlign || 'left';
                }

                const wrappedLines = pdf.splitTextToSize(text, maxWidth);
                const xPos = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - margin : margin);

                pdf.text(wrappedLines, xPos, currentY, { align: align });
                currentY += (wrappedLines.length * 6.5); // Line spacing
            });

            const imgHeight = currentY - matterY; // Pseudo height for signature positioning

            // 5. SIGNATURE (Native Text - Conditional)
            if (letterDesignation.value.trim()) {
                const signatureY = Math.max(matterY + imgHeight + 20, pageHeight - 45);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Sincerely,', pageWidth - margin - 5, signatureY, { align: 'right' });
                pdf.text('____________________', pageWidth - margin - 5, signatureY + 16, { align: 'right' });
                pdf.text(letterDesignation.value, pageWidth - margin - 5, signatureY + 22, { align: 'right' });
            }

            pdf.save(`${schoolName.value.replace(/[^a-z0-9]/gi, '_')}_Letter.pdf`);
        } catch (err) {
            console.error(err);
            alert('PDF Creation Error');
        } finally {
            downloadBtn.textContent = '📥 Download PDF';
            downloadBtn.disabled = false;
        }
    });

    // 6. Grammar & Spelling Check
    const grammarBtn = document.getElementById('check-grammar-btn');
    const suggestionsBox = document.getElementById('grammar-suggestions');

    grammarBtn.addEventListener('click', async () => {
        const text = letterMatter.innerText;
        if (!text) {
            alert('Please enter some text to check first.');
            return;
        }

        grammarBtn.textContent = '⏳ Checking...';
        grammarBtn.disabled = true;
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';

        try {
            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    text: text,
                    language: 'en-US'
                })
            });

            const data = await response.json();
            const matches = data.matches;

            if (matches.length === 0) {
                suggestionsBox.innerHTML = '<p class="suggestion-item">✅ Grammar and spelling look great!</p>';
            } else {
                suggestionsBox.innerHTML = '<p class="suggestion-item"><strong>Suggestions found:</strong></p>';
                matches.forEach(match => {
                    const error = text.substring(match.offset, match.offset + match.length);
                    const fix = match.replacements.length > 0 ? match.replacements[0].value : 'no suggestion';

                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `Found: "<strong>${error}</strong>" - Try: <span class="fix">${fix}</span> (${match.message})`;
                    suggestionsBox.appendChild(div);
                });
            }
            suggestionsBox.style.display = 'block';
        } catch (error) {
            console.error('Grammar check failed:', error);
            alert('Could not check grammar at this time. Please check your internet connection.');
        } finally {
            grammarBtn.textContent = '✨ Check Grammar';
            grammarBtn.disabled = false;
        }
    });

    // 7. Keyboard shortcuts (Optional)
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
