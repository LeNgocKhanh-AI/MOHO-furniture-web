const db = require("../config/db");

/* =========================
   REGISTER
========================= */
exports.register = (data, callback) => {

  // 1. CHECK EMAIL EXISTS
  const checkSql = `
    SELECT customer_id
    FROM customer
    WHERE customer_email = ?
    LIMIT 1
  `;

  db.query(checkSql, [data.email], (err, rows) => {
    if (err) {
      return callback(err, null);
    }

    // EMAIL ĐÃ TỒN TẠI
    if (rows.length > 0) {
      return callback({ message: "EMAIL_EXISTS" }, null);
    }

    // 2. INSERT CUSTOMER
    const sql = `
      INSERT INTO customer (
        customer_firstname,
        customer_lastname,
        customer_gender,
        customer_email,
        customer_password
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        data.firstname,
        data.lastname,
        data.gender,
        data.email,
        data.password,
      ],
      (err, result) => {
        if (err) {
          return callback(err, null);
        }

        return callback(null, result);
      }
    );
  });
};


/* =========================
   LOGIN CUSTOMER
========================= */
exports.loginCustomer = (email, callback) => {

  const sql = `
    SELECT *
    FROM customer
    WHERE customer_email = ?
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      return callback(err, null);
    }

    return callback(null, result);
  });
};


/* =========================
   LOGIN ADMIN
========================= */
exports.loginAdmin = (email, callback) => {

  const sql = `
    SELECT *
    FROM administrator
    WHERE admin_email = ?
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      return callback(err, null);
    }

    return callback(null, result);
  });
};