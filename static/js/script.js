// Toggle tema
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
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}Content`).classList.add('active');
    });
});

// Fungsi kalkulasi
function sanitizeInput(value) {
    const sanitized = value.replace(',', '.').trim();
    if (sanitized === '' || isNaN(Number(sanitized))) {
        throw new Error("Input tidak valid: " + value);
    }
    return sanitized;
}

function calculatePotential() {
    try {
        const q1 = sanitizeInput(document.getElementById('q1').value);
        const q2 = sanitizeInput(document.getElementById('q2').value);
        const r = sanitizeInput(document.getElementById('r').value);

        fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q1, q2, r })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

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
        alert(error.message);
    }
}

// Visualisasi muatan
function updateVisualization(q1, q2) {
    const charge1 = document.getElementById('charge1');
    const charge2 = document.getElementById('charge2');
    const forceIndicator = document.getElementById('forceIndicator');
    
    charge1.innerHTML = q1 >= 0 ? '<span>+</span>' : '<span>-</span>';
    charge2.innerHTML = q2 >= 0 ? '<span>+</span>' : '<span>-</span>';
    
    charge1.className = 'charge ' + (q1 >= 0 ? 'charge-positive' : 'charge-negative');
    charge2.className = 'charge ' + (q2 >= 0 ? 'charge-positive' : 'charge-negative');
    
    if (q1 * q2 < 0) {
        forceIndicator.innerHTML = '<i class="fas fa-arrows-alt-h fa-flip-horizontal" style="color: #4cc9f0;"></i>';
    } else {
        forceIndicator.innerHTML = '<i class="fas fa-arrows-alt-h" style="color: #e63946;"></i>';
    }

    charge1.animate([{ transform: 'scale(1.1)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500 });
    charge2.animate([{ transform: 'scale(1.1)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500 });
}

// Event
document.getElementById('calculateBtn').addEventListener('click', calculatePotential);

document.addEventListener('DOMContentLoaded', () => {
    calculatePotential();
    updateVisualization(1.6e-9, -1.6e-9);
});
