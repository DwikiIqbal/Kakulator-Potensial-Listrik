document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const numChargesInput = document.getElementById('num-charges');
    const generateBtn = document.getElementById('generate-btn');
    const chargesContainer = document.getElementById('charges-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    const chargesVisual = document.getElementById('charges-visual');
    const themeToggle = document.querySelector('.theme-toggle .toggle-btn');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Fungsi untuk mengonversi ke notasi ilmiah
    function toScientific(num) {
        num = parseFloat(num);
        if (isNaN(num)) return "NaN";
        if (num === 0) return "0";
        
        const absNum = Math.abs(num);
        const exponent = Math.floor(Math.log10(absNum));
        const coefficient = num / Math.pow(10, exponent);
        
        // Format lebih rapi untuk angka besar
        if (Math.abs(exponent) >= 3) {
            return coefficient.toFixed(3) + ' × 10<sup>' + exponent + '</sup>';
        }
        
        // Format biasa untuk angka kecil
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    // Generate form input berdasarkan jumlah muatan
    generateBtn.addEventListener('click', function() {
        const numCharges = parseInt(numChargesInput.value) || 1;
        
        // Bersihkan container
        chargesContainer.innerHTML = '';
        chargesVisual.innerHTML = '';
        
        // Buat form input untuk setiap muatan
        for (let i = 0; i < numCharges; i++) {
            const chargeDiv = document.createElement('div');
            chargeDiv.className = 'charge-input';
            chargeDiv.innerHTML = `
                <h3>Muatan ${i+1}</h3>
                <div class="remove-charge"><i class="fas fa-times"></i></div>
                <div class="form-group">
                    <label for="q${i+1}">Muatan (q) dalam Coulomb:</label>
                    <input type="text" id="q${i+1}" placeholder="Contoh: 2×10⁻⁶" value="${i === 0 ? '2×10⁻⁶' : ''}">
                </div>
                <div class="form-group">
                    <label for="r${i+1}">Jarak (r) dalam meter:</label>
                    <input type="text" id="r${i+1}" placeholder="Contoh: 0.5" value="${i === 0 ? '0.5' : ''}">
                </div>
            `;
            chargesContainer.appendChild(chargeDiv);
            
            // Buat visualisasi muatan
            const chargeVisual = document.createElement('div');
            chargeVisual.className = 'charge-visual';
            chargeVisual.innerHTML = `
                <div class="charge-circle" id="charge-circle-${i+1}">
                    ${i+1}
                </div>
                <div class="distance-line" data-distance="r = ? m"></div>
                <div class="charge-label">Muatan ${i+1}</div>
            `;
            chargesVisual.appendChild(chargeVisual);
            
            // Tambahkan event listener untuk menghapus muatan
            chargeDiv.querySelector('.remove-charge').addEventListener('click', function() {
                chargeDiv.remove();
                chargeVisual.remove();
            });
        }
        
        // Tambahkan event listener untuk update visual saat input diubah
        updateChargeVisuals();
    });
    
    // Fungsi untuk memperbarui visualisasi muatan
    function updateChargeVisuals() {
        const chargeInputs = chargesContainer.querySelectorAll('.charge-input');
        
        chargeInputs.forEach((chargeInput, index) => {
            const qInput = chargeInput.querySelector('input[type="text"]:first-of-type');
            const rInput = chargeInput.querySelector('input[type="text"]:last-of-type');
            const chargeCircle = document.getElementById(`charge-circle-${index+1}`);
            const distanceLine = chargesVisual.querySelector(`.charge-visual:nth-child(${index+1}) .distance-line`);
            
            // Update tampilan berdasarkan nilai input
            if (qInput && qInput.value) {
                try {
                    // Konversi notasi ilmiah ke float
                    let qValue = qInput.value.replace('×10^', 'e').replace('×10⁻', 'e-').replace('−', '-');
                    const q = parseFloat(qValue);
                    
                    if (!isNaN(q)) {
                        if (q > 0) {
                            chargeCircle.classList.remove('negative');
                            chargeCircle.classList.add('positive');
                            chargeCircle.innerHTML = '<i class="fas fa-plus"></i>';
                        } else if (q < 0) {
                            chargeCircle.classList.remove('positive');
                            chargeCircle.classList.add('negative');
                            chargeCircle.innerHTML = '<i class="fas fa-minus"></i>';
                        }
                        chargeCircle.classList.add('pulse');
                        setTimeout(() => chargeCircle.classList.remove('pulse'), 500);
                    }
                } catch (e) {
                    console.error("Error parsing charge value:", e);
                }
            }
            
            if (rInput && rInput.value) {
                try {
                    let rValue = rInput.value.replace('×10^', 'e').replace('×10⁻', 'e-').replace('−', '-');
                    const r = parseFloat(rValue);
                    
                    if (!isNaN(r) && distanceLine) {
                        distanceLine.setAttribute('data-distance', `r = ${r} m`);
                        distanceLine.classList.add('pulse');
                        setTimeout(() => distanceLine.classList.remove('pulse'), 500);
                    }
                } catch (e) {
                    console.error("Error parsing distance value:", e);
                }
            }
        });
    }
    
    // Event listener untuk perubahan input muatan
    chargesContainer.addEventListener('input', function(e) {
        if (e.target.matches('input[type="text"]')) {
            updateChargeVisuals();
        }
    });
    
    // Hitung potensial listrik
    calculateBtn.addEventListener('click', function() {
        const chargeInputs = chargesContainer.querySelectorAll('.charge-input');
        
        if (chargeInputs.length === 0) {
            resultsContainer.innerHTML = '<div class="error">Silakan buat form muatan terlebih dahulu!</div>';
            return;
        }
        
        const charges = [];
        let isValid = true;
        const errors = [];
        
        chargeInputs.forEach((chargeInput, index) => {
            const inputs = chargeInput.querySelectorAll('input[type="text"]');
            if (inputs.length < 2) {
                errors.push(`Muatan ${index+1}: Form tidak lengkap`);
                isValid = false;
                return;
            }
            
            const qInput = inputs[0];
            const rInput = inputs[1];
            const qValue = qInput.value.trim();
            const rValue = rInput.value.trim();
            
            if (!qValue || !rValue) {
                errors.push(`Muatan ${index+1}: Harap isi semua kolom`);
                isValid = false;
                return;
            }
            
            try {
                // Konversi ke format yang bisa dibaca Python
                const q = qValue.replace(/×10\^/g, 'e')
                                .replace(/×10⁻/g, 'e-')
                                .replace(/−/g, '-')
                                .replace(/ /g, '');
                const r = rValue.replace(/×10\^/g, 'e')
                                .replace(/×10⁻/g, 'e-')
                                .replace(/−/g, '-')
                                .replace(/ /g, '');
                
                charges.push({
                    q: qValue,  // Nilai asli untuk ditampilkan
                    r: rValue,  // Nilai asli untuk ditampilkan
                    q_calc: q,  // Untuk perhitungan
                    r_calc: r   // Untuk perhitungan
                });
            } catch (e) {
                errors.push(`Muatan ${index+1}: Format tidak valid`);
                isValid = false;
            }
        });
        
        if (!isValid) {
            resultsContainer.innerHTML = `<div class="error">${errors.join('<br>')}</div>`;
            return;
        }
        
        // Siapkan payload untuk backend
        const payload = {
            charges: charges.map(charge => ({
                q: charge.q_calc,
                r: charge.r_calc
            }))
        };
        
        // Kirim data ke backend
        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultsContainer.innerHTML = `<div class="error">${data.error}</div>`;
                return;
            }
            
            // Tampilkan hasil perhitungan
            displayResults(data.results, data.total, charges);
        })
        .catch(error => {
            resultsContainer.innerHTML = `<div class="error">Terjadi kesalahan: ${error.message}</div>`;
        });
    });
    
    // Fungsi untuk menampilkan hasil perhitungan
    function displayResults(results, total, originalCharges) {
        let html = '';
        
        // Tampilkan hasil per muatan
        results.forEach((result, index) => {
            const vFormatted = toScientific(result.v);
            const qOriginal = originalCharges[index].q;
            const rOriginal = originalCharges[index].r;
            
            html += `
                <div class="result-item">
                    <div class="result-title">Muatan ${index+1} (${result.sign})</div>
                    <div class="result-content">
                        <div class="result-formula">
                            <div class="formula">
                                V<sub>${index+1}</sub> = k × 
                                <div class="fraction">
                                    <span class="numerator">q<sub>${index+1}</sub></span>
                                    <span class="denominator">r<sub>${index+1}</sub></span>
                                </div>
                                = (9 × 10<sup>9</sup>) × 
                                <div class="fraction">
                                    <span class="numerator">${qOriginal}</span>
                                    <span class="denominator">${rOriginal}</span>
                                </div>
                                = ${vFormatted} V
                            </div>
                        </div>
                        <div class="result-value">
                            <div class="value-number">V<sub>${index+1}</sub> = ${vFormatted} V</div>
                            <div>Jarak: ${rOriginal} m</div>
                            <div>Muatan: ${qOriginal} C</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Tampilkan total
        const totalFormatted = toScientific(total);
        html += `
            <div class="result-item">
                <div class="result-title">Potensial Total</div>
                <div class="result-content">
                    <div class="result-formula">
                        <div class="formula">
                            V<sub>total</sub> = ${results.map((_, i) => `V<sub>${i+1}</sub>`).join(' + ')}<br>
                            = ${totalFormatted} V
                        </div>
                    </div>
                    <div class="result-value">
                        <div class="value-number">V<sub>total</sub> = ${totalFormatted} V</div>
                        <div>Jumlah muatan: ${results.length}</div>
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('pulse');
        setTimeout(() => resultsContainer.classList.remove('pulse'), 1000);
    }
    
    // Accordion untuk materi pembelajaran
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.fa-chevron-down');
            
            icon.classList.toggle('rotate');
            content.classList.toggle('active');
            
            // Animasi
            if (content.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
    });
    
    // Toggle mode gelap
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        themeToggle.classList.add('pulse');
        setTimeout(() => themeToggle.classList.remove('pulse'), 500);
    });
    
    // Generate form awal dengan contoh
    generateBtn.click();
});