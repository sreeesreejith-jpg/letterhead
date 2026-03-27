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
        prevCode.textContent = schoolCode.value ? `Code: ${schoolCode.value}` : '';
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

    // 5. Professional PDF Generation (High Fidelity Unicode Support)
    downloadBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;

        downloadBtn.textContent = '⏳ Creating...';
        downloadBtn.disabled = true;

        try {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // Create a high-fidelity temporary container for the ENTIRE letterhead
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: absolute; left: -9999px; top: -9999px;
                width: 800px; /* Standard width for rendering */
                background: white; color: black;
                font-family: 'Outfit', 'Noto Sans Malayalam', sans-serif;
                padding: 40px; box-sizing: border-box;
            `;

            // Build the HTML structure identical to the professional preview
            tempContainer.innerHTML = `
                <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 25px;">
                    <h1 style="margin: 0; font-size: 28pt; font-weight: 900; text-transform: uppercase;">${schoolName.value || ''}</h1>
                    ${schoolCode.value ? `<p style="margin: 5px 0; font-size: 14pt; font-weight: bold;">Code: ${schoolCode.value}</p>` : ''}
                    <p style="margin: 5px 0; font-size: 12pt; line-height: 1.4;">${schoolAddress.value || ''}</p>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12pt; font-weight: bold;">
                    <span>${letterPlace.value ? `Place: ${letterPlace.value}` : ''}</span>
                    <span>${letterDate.value ? `Date: ${letterDate.value}` : ''}</span>
                </div>
                ${letterSubhead.value ? `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 14pt; font-weight: 800; text-transform: uppercase; text-decoration: underline; letter-spacing: 1px;">
                            ${letterSubhead.value}
                        </span>
                    </div>
                ` : ''}
                <div style="font-size: 13pt; line-height: 1.8; text-align: justify; margin-bottom: 50px; min-height: 300px; font-family: 'Noto Sans Malayalam', serif;">
                    ${letterMatter.innerHTML || ''}
                </div>
                ${letterDesignation.value ? `
                    <div style="text-align: right; margin-top: 50px;">
                        <p style="font-size: 12pt; margin-bottom: 40px;">Sincerely,</p>
                        <p style="font-size: 13pt; font-weight: bold;">____________________</p>
                        <p style="font-size: 13pt; font-weight: bold; margin-top: 5px;">${letterDesignation.value}</p>
                    </div>
                ` : ''}
            `;

            document.body.appendChild(tempContainer);

            // Render to canvas
            const canvas = await html2canvas(tempContainer, {
                scale: 3, // High DPI for printing
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            // Handle Multi-page splitting
            let heightLeft = imgHeight;
            let position = margin;
            let pageNum = 1;

            if (imgHeight <= (pageHeight - margin * 2)) {
                pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            } else {
                // Multi-page logic
                const pxPerMm = canvas.width / imgWidth;
                const pagePxHeight = (pageHeight - margin * 2) * pxPerMm;

                let srcY = 0;
                while (heightLeft > 0) {
                    const sliceHeightMm = Math.min(heightLeft, pageHeight - margin * 2);
                    const slicePxHeight = sliceHeightMm * pxPerMm;

                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = canvas.width;
                    sliceCanvas.height = slicePxHeight;
                    const ctx = sliceCanvas.getContext('2d');
                    ctx.drawImage(canvas, 0, srcY, canvas.width, slicePxHeight, 0, 0, canvas.width, slicePxHeight);

                    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.9);
                    if (pageNum > 1) pdf.addPage();
                    pdf.addImage(sliceData, 'JPEG', margin, margin, imgWidth, sliceHeightMm);

                    srcY += slicePxHeight;
                    heightLeft -= sliceHeightMm;
                    pageNum++;
                }
            }

            pdf.save(`${(schoolName.value || 'Letterhead').replace(/[^a-z0-9]/gi, '_')}.pdf`);
        } catch (err) {
            console.error(err);
            alert('PDF Creation Error: ' + err.message);
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
