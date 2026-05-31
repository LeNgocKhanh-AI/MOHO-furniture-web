const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const db = require("../config/db");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value || "";
                const firstname = profile.name?.givenName || "";
                const lastname = profile.name?.familyName || "";
                const avatar = profile.photos?.[0]?.value || "";

                /* =========================
                   CHECK ADMIN FIRST
                ========================= */

                db.query(
                    "SELECT * FROM administrator WHERE admin_email = ?",
                    [email],
                    (adminErr, adminRows) => {
                        if (adminErr) {
                            return done(adminErr, null);
                        }

                        if (adminRows.length > 0) {
                            const admin = adminRows[0];

                            admin.role = "admin";

                            return done(null, admin);
                        }

                        /* =========================
                           CHECK CUSTOMER
                        ========================= */

                        db.query(
                            "SELECT * FROM customer WHERE customer_email = ?",
                            [email],
                            (err, rows) => {
                                if (err) {
                                    return done(err, null);
                                }

                                /* =========================
                                   CUSTOMER EXISTS
                                ========================= */

                                if (rows.length > 0) {
                                    const user = rows[0];

                                    user.role = "customer";

                                    if (!user.customer_google_id) {
                                        db.query(
                                            `
                      UPDATE customer
                      SET
                        customer_google_id = ?,
                        customer_avatar = ?
                      WHERE customer_id = ?
                      `,
                                            [
                                                googleId,
                                                avatar,
                                                user.customer_id,
                                            ],
                                            (updateErr) => {
                                                if (updateErr) {
                                                    return done(updateErr, null);
                                                }

                                                user.customer_google_id = googleId;
                                                user.customer_avatar = avatar;

                                                return done(null, user);
                                            }
                                        );
                                    } else {
                                        return done(null, user);
                                    }

                                    return;
                                }

                                /* =========================
                                   CREATE NEW CUSTOMER
                                ========================= */

                                const insertSql = `
                  INSERT INTO customer
                  (
                    customer_username,
                    customer_password,
                    customer_firstname,
                    customer_lastname,
                    customer_email,
                    customer_google_id,
                    customer_avatar
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                                db.query(
                                    insertSql,
                                    [
                                        email,
                                        "",
                                        firstname,
                                        lastname,
                                        email,
                                        googleId,
                                        avatar,
                                    ],
                                    (insertErr, result) => {
                                        if (insertErr) {
                                            return done(insertErr, null);
                                        }

                                        db.query(
                                            "SELECT * FROM customer WHERE customer_id = ?",
                                            [result.insertId],
                                            (getErr, newRows) => {
                                                if (getErr) {
                                                    return done(getErr, null);
                                                }

                                                const user = newRows[0];

                                                user.role = "customer";

                                                return done(null, user);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

/* =========================
   SERIALIZE
========================= */

passport.serializeUser((user, done) => {
    if (user.role === "admin") {
        done(null, {
            id: user.admin_id,
            type: "admin",
        });
    } else {
        done(null, {
            id: user.customer_id,
            type: "customer",
        });
    }
});

/* =========================
   DESERIALIZE
========================= */

passport.deserializeUser((data, done) => {
    if (data.type === "admin") {
        db.query(
            "SELECT * FROM administrator WHERE admin_id = ?",
            [data.id],
            (err, rows) => {
                if (err) {
                    return done(err, null);
                }

                if (!rows.length) {
                    return done(null, false);
                }

                rows[0].role = "admin";

                done(null, rows[0]);
            }
        );
    } else {
        db.query(
            "SELECT * FROM customer WHERE customer_id = ?",
            [data.id],
            (err, rows) => {
                if (err) {
                    return done(err, null);
                }

                if (!rows.length) {
                    return done(null, false);
                }

                rows[0].role = "customer";

                done(null, rows[0]);
            }
        );
    }
});

module.exports = passport;