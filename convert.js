const mysql = require('mysql2');
const fs = require('fs');

// Cấu hình kết nối MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'tieuluan', 
  port: 3307
});

// Truy vấn dữ liệu từ bảng
connection.query('SELECT * FROM Product', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }

  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('product.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});
connection.query('SELECT * FROM User', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }

  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('user.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});
connection.query('SELECT * FROM Order', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }
  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('order.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});
connection.query('SELECT * FROM OrderProduct', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }

  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('orderProduct.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});
connection.query('SELECT * FROM ProductComment', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }

  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('comment.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});
connection.query('SELECT * FROM bank_accounts', (err, results) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    return;
  }

  // Chuyển kết quả thành JSON và lưu vào file
  const jsonData = JSON.stringify(results, null, 2);
  
  // Lưu vào file data.json
  fs.writeFileSync('bank.json', jsonData, 'utf-8');
  console.log('Dữ liệu đã được lưu vào file data.json');
});


// Đóng kết nối
connection.end();
