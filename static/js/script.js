// Toggle tema gelap/terang
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Hapus kelas aktif dari semua tab dan konten
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Tambahkan kelas aktif ke tab yang diklik
        tab.classList.add('active');
        
        // Tampilkan konten yang sesuai
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}Content`).classList.add('active');
    });
});

// Fungsi untuk mengonversi ke notasi ilmiah
function toScientific(num) {
    if (num === 0) return { coefficient: 0, exponent: 0, formatted: '0' };
    
    const exponent = Math.floor(Math.log10(Math.abs(num)));
    const coefficient = num / Math.pow(10, exponent);
    
    return {
        coefficient: coefficient.toFixed(4),
        exponent: exponent,
        formatted: `${coefficient.toFixed(4)} × 10<sup>${exponent}</sup>`
    };
}


// Fungsi untuk menghitung potensial listrik
function calculatePotential() {
    // Ambil nilai dari input
    const k = document.getElementById('k').value;
    const q1 = document.getElementById('q1').value;
    const q2 = document.getElementById('q2').value;
    const r = document.getElementById('r').value;
    
    // Kirim data ke backend
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ k, q1, q2, r })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        
        // Tampilkan hasil
        document.getElementById('resultValue').innerHTML = data.scientific.potential.formatted;
        
        // Tampilkan langkah perhitungan
        document.getElementById('step2Result').innerHTML = data.scientific.numerator.formatted;
        document.getElementById('step3Result').innerHTML = data.scientific.potential.formatted;
        document.getElementById('step4Result').innerHTML = `${data.scientific.potential.formatted} Volt`;
        
        // Update visualisasi muatan
        updateVisualization(parseFloat(q1), parseFloat(q2));
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan dalam perhitungan');
    });
}

function sanitizeInput(value) {
    const sanitized = value.replace(',', '.').trim();
    if (sanitized === '' || isNaN(Number(sanitized))) {
        throw new Error("Input tidak valid: " + value);
    }
    return sanitized;
}

function calculatePotential() {
    try {
        // Ambil dan sanitasi input dari form
        const k = sanitizeInput(document.getElementById('k').value);
        const q1 = sanitizeInput(document.getElementById('q1').value);
        const q2 = sanitizeInput(document.getElementById('q2').value);
        const r = sanitizeInput(document.getElementById('r').value);

        // Kirim ke backend
        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ k, q1, q2, r })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            // Tampilkan hasil
            document.getElementById('resultValue').innerHTML = data.scientific.potential.formatted;
            document.getElementById('step2Result').innerHTML = data.scientific.numerator.formatted;
            document.getElementById('step3Result').innerHTML = data.scientific.potential.formatted;
            document.getElementById('step4Result').innerHTML = `${data.scientific.potential.formatted} Volt`;

            updateVisualization(parseFloat(q1), parseFloat(q2));
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan dalam perhitungan');
        });

    } catch (error) {
        alert(error.message); // tampilkan jika input kosong atau salah
    }

}

// Fungsi untuk memperbarui visualisasi
function updateVisualization(q1, q2) {
    const charge1 = document.getElementById('charge1');
    const charge2 = document.getElementById('charge2');
    const forceIndicator = document.getElementById('forceIndicator');
    
    // Update muatan positif/negatif
    charge1.innerHTML = q1 >= 0 ? '<span>+</span>' : '<span>-</span>';
    charge2.innerHTML = q2 >= 0 ? '<span>+</span>' : '<span>-</span>';
    
    // Update warna berdasarkan muatan
    charge1.className = 'charge ' + (q1 >= 0 ? 'charge-positive' : 'charge-negative');
    charge2.className = 'charge ' + (q2 >= 0 ? 'charge-positive' : 'charge-negative');
    
    // Update indikator gaya
    if (q1 * q2 < 0) {
        // Muatan berbeda - gaya tarik
        forceIndicator.innerHTML = '<i class="fas fa-arrows-alt-h fa-flip-horizontal" style="color: #4cc9f0;"></i>';
    } else {
        // Muatan sama - gaya tolak
        forceIndicator.innerHTML = '<i class="fas fa-arrows-alt-h" style="color: #e63946;"></i>';
    }
    
    // Animasi perubahan muatan
    charge1.animate([
        { transform: 'scale(1.1)', opacity: 0.8 },
        { transform: 'scale(1)', opacity: 1 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
    
    charge2.animate([
        { transform: 'scale(1.1)', opacity: 0.8 },
        { transform: 'scale(1)', opacity: 1 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
}

// Event listener untuk tombol hitung
document.getElementById('calculateBtn').addEventListener('click', calculatePotential);


// Hitung otomatis saat input berubah
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', calculatePotential);
});

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    calculatePotential();
    updateVisualization(1.6e-9, -1.6e-9);
});