from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    charges = data['charges']
    k = 9e9  # Konstanta Coulomb
    
    results = []
    total = 0
    
    for i, charge in enumerate(charges):
        try:
            # Konversi notasi ilmiah ke float
            q_str = charge['q'].replace('×10^', 'e').replace('×10⁻', 'e-').replace('−', '-').replace(' ', '')
            r_str = charge['r'].replace('×10^', 'e').replace('×10⁻', 'e-').replace('−', '-').replace(' ', '')
            
            q = float(q_str)
            r = float(r_str)
            
            if r <= 0:
                return jsonify({
                    'error': f'Jarak harus lebih besar dari 0 (muatan ke-{i+1})'
                })
                
            v = k * q / r
            results.append({
                'q': q,
                'r': r,
                'v': v,
                'sign': 'positif' if q > 0 else 'negatif'
            })
            total += v
        except (ValueError, TypeError) as e:
            return jsonify({
                'error': f'Data tidak valid pada muatan ke-{i+1}: {str(e)}. Pastikan format: a atau a×10^b'
            })
        except ZeroDivisionError:
            return jsonify({
                'error': f'Jarak tidak boleh nol (muatan ke-{i+1})'
            })
    
    return jsonify({
        'results': results,
        'total': total
    })

if __name__ == '__main__':
    app.run(debug=True)