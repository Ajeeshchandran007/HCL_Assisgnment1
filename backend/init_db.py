import sqlite3

conn = sqlite3.connect('shop.db')
c = conn.cursor()

# Create products table
c.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT
)
''')

# Create product_images table with price and description for each image
c.execute('''
CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    image TEXT,
    price REAL,
    description TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
)
''')

# Create orders table
c.execute('''
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    order_date TEXT
)
''')


# Clear the products and product_images tables before inserting sample data
c.execute('DELETE FROM product_images')
c.execute('DELETE FROM products')

# Sample products for babies textile shop
products = [
    (
        'Baby Onesie',
        'A super-soft, 100% organic cotton onesie for newborns and infants. Features snap closures for easy diaper changes and gentle seams for sensitive skin.',
        8.49,
        'onesie.jpg'
    ),
    (
        'Baby Blanket',
        'Plush, hypoallergenic baby blanket. Perfect for swaddling, tummy time, or stroller rides. Machine washable and available in pastel colors.',
        15.99,
        'blanket.jpg'
    ),
    (
        'Baby Hat',
        'Adorable knitted hat to keep your baby warm. Stretchy, breathable, and fits most babies 0-12 months. Available in multiple colors.',
        6.25,
        'hat.jpg'
    )
]



# Insert products and their images/variations with different prices and descriptions
for name, desc, price, main_image in products:
    c.execute('INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)', (name, desc, price, main_image))
    product_id = c.lastrowid
    base = main_image.split('.')[0]
    ext = main_image.split('.')[-1]
    for i in range(1, 11):
        img_name = f"{base}_{i}.{ext}"
        # Assign a different price and description for each variation
        var_price = round(price + i * 0.75, 2)  # Example: increment price for each variation
        var_desc = f"{name} variation {i}: {desc} (Special feature #{i})"
        c.execute('INSERT INTO product_images (product_id, image, price, description) VALUES (?, ?, ?, ?)', (product_id, img_name, var_price, var_desc))

conn.commit()
conn.close()
print('Database initialized with sample products and images.')
