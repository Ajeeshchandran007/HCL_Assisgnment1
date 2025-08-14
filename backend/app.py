from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DATABASE = 'shop.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return 'Baby Textile Shop API is running.'

@app.route('/products', methods=['GET'])
def get_products():
    conn = get_db()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    product_list = []
    for row in products:
        product = dict(row)
        # Prepend the static URL for images if not already a full URL
        if product['image'] and not product['image'].startswith('http'):
            product['image'] = request.host_url.rstrip('/') + '/static/' + product['image']
        product_list.append(product)
    return jsonify(product_list)

# New endpoint: get all images for a product
@app.route('/product_images/<int:product_id>', methods=['GET'])
def get_product_images(product_id):
    conn = get_db()
    images = conn.execute('SELECT image, price, description FROM product_images WHERE product_id = ?', (product_id,)).fetchall()
    conn.close()
    image_list = []
    for row in images:
        img_url = row['image']
        if img_url and not img_url.startswith('http'):
            img_url = request.host_url.rstrip('/') + '/static/' + img_url
        image_list.append({
            'image': img_url,
            'price': row['price'],
            'description': row['description']
        })
    return jsonify(image_list)

@app.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    # In a real app, you'd have user sessions. Here, just echo back.
    return jsonify({'message': 'Added to cart', 'item': data})

@app.route('/order', methods=['POST'])
def place_order():
    data = request.json
    # Save the order in the database
    conn = get_db()
    import json
    conn.execute(
        'INSERT INTO orders (name, phone, address, items, order_date) VALUES (?, ?, ?, ?, ?)',
        (
            data.get('name', ''),
            data.get('phone', ''),
            data.get('address', ''),
            json.dumps(data.get('items', [])),
            data.get('order_date', '')
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Order placed', 'order': data})

# Endpoint to get all orders
@app.route('/orders', methods=['GET'])
def get_orders():
    conn = get_db()
    orders = conn.execute('SELECT * FROM orders ORDER BY order_date DESC').fetchall()
    result = []
    for row in orders:
        order = dict(row)
        order['order_id'] = row['id']
        order['order_date'] = row['order_date']
        result.append(order)
    return jsonify(result)
    conn.close()
    order_list = []
    for row in orders:
        order = dict(row)
        order_list.append(order)
    return jsonify(order_list)

if __name__ == '__main__':
    app.run(debug=True)
