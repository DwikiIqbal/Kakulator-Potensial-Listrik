from flask import Flask, render_template, jsonify, request
import numpy as np

app = Flask(__name__)

# Konstanta Coulomb tetap
COULOMB_CONSTANT = 9e9

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    
    try:
        q1 = float(data['q1'])
        q2 = float(data['q2'])
        r = float(data['r'])
        k = COULOMB_CONSTANT
        
        if r <= 0:
            return jsonify({'error': 'Jarak (r) harus lebih besar dari nol!'}), 400

        numerator = k * q1 * q2
        potential = numerator / r
        
        result = {
            'potential': potential,
            'numerator': numerator,
            'steps': {
                'step1': "V = k × q₁ × q₂ / r",
                'step2': f"V = ({k}) × ({q1}) × ({q2}) / {r}",
                'step3': f"V = {numerator} / {r}",
                'step4': f"V = {potential} Volt"
            },
            'scientific': {
                'potential': to_scientific(potential),
                'numerator': to_scientific(numerator)
            }
        }
        return jsonify(result)
    
    except (ValueError, TypeError) as e:
        return jsonify({'error': 'Input tidak valid: ' + str(e)}), 400

def to_scientific(num):
    if num == 0:
        return {'coefficient': 0, 'exponent': 0, 'formatted': '0'}
    
    exponent = int(np.floor(np.log10(abs(num))))
    coefficient = num / (10 ** exponent)
    
    return {
        'coefficient': round(coefficient, 4),
        'exponent': exponent,
        'formatted': f"{coefficient:.4f} × 10<sup>{exponent}</sup>"
    }

if __name__ == '__main__':
    app.run(debug=True)
