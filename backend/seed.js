const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const FARMERS = [

  {
    name: "Ramon Bacus",
    username: "demo_farmer",
    email: "farmer.demo@ricedss.ph",
    password: "Demo1234",
    farm: {
      barangay: "San Teodoro",
      soil_type: "Clay Loam",
      area: 1.5,
      latitude: 8.1987,
      longitude: 125.9765,
    },
    soil: { ph: 6.2, nitrogen: 45, phosphorus: 28, potassium: 40, rainfall: 1800, pest_level: "Medium" },
  },

  {
    name: "Fe Camposano",
    username: "fe_camposano",
    email: "fe.camposano@ricedss.ph",
    password: "Farmer2024",
    farm: {
      barangay: "Poblacion",
      soil_type: "Clay",
      area: 2.1,
      latitude: 8.2043,
      longitude: 125.9822,
    },
    soil: { ph: 5.8, nitrogen: 38, phosphorus: 22, potassium: 35, rainfall: 2100, pest_level: "Low" },
  },

  {
    name: "Julio Enriquez",
    username: "julio_enriquez",
    email: "julio.enriquez@ricedss.ph",
    password: "Farmer2024",
    farm: {
      barangay: "Libertad",
      soil_type: "Silty Clay Loam",
      area: 1.8,
      latitude: 8.1902,
      longitude: 125.9691,
    },
    soil: { ph: 6.5, nitrogen: 50, phosphorus: 30, potassium: 42, rainfall: 1950, pest_level: "High" },
  },

  {
    name: "Marites Padilla",
    username: "marites_padilla",
    email: "marites.padilla@ricedss.ph",
    password: "Farmer2024",
    farm: {
      barangay: "San Marcos",
      soil_type: "Loam",
      area: 1.2,
      latitude: 8.2115,
      longitude: 125.9903,
    },
    soil: { ph: 6.0, nitrogen: 42, phosphorus: 25, potassium: 38, rainfall: 1700, pest_level: "Low" },
  },

];

const ADMINS = [

  {
    name: "Agnes Villareal",
    username: "demo_admin",
    email: "admin.demo@ricedss.ph",
    password: "Demo1234",
  },

];


async function upsertUser(conn, { name, username, email, password, role }) {

  const hash = await bcrypt.hash(password, 10);

  await conn.query(

    `INSERT INTO users (name, username, email, password, role)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), username = VALUES(username), password = VALUES(password), role = VALUES(role)`,

    [name, username, email, hash, role]

  );

  const [rows] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);

  return rows[0].id;

}


async function ensureFarmAndSoil(conn, userId, farm, soil) {

  const [existing] = await conn.query("SELECT id FROM farms WHERE user_id = ?", [userId]);

  if (existing.length > 0) {

    return;

  }

  const [result] = await conn.query(

    `INSERT INTO farms (user_id, barangay, soil_type, area, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?)`,

    [userId, farm.barangay, farm.soil_type, farm.area, farm.latitude, farm.longitude]

  );

  await conn.query(

    `INSERT INTO soil_tests (farm_id, ph, nitrogen, phosphorus, potassium, rainfall, pest_level)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,

    [result.insertId, soil.ph, soil.nitrogen, soil.phosphorus, soil.potassium, soil.rainfall, soil.pest_level]

  );

}


async function main() {

  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ricedss",
  });

  // Remove the ad-hoc test account created while first smoke-testing the API.
  await conn.query("DELETE FROM users WHERE email = ?", ["testfarmer@example.com"]);

  for (const farmer of FARMERS) {

    const userId = await upsertUser(conn, { ...farmer, role: "farmer" });

    await ensureFarmAndSoil(conn, userId, farmer.farm, farmer.soil);

    console.log(`Farmer ready: ${farmer.email} / ${farmer.password}`);

  }

  for (const admin of ADMINS) {

    await upsertUser(conn, { ...admin, role: "admin" });

    console.log(`Admin ready: ${admin.email} / ${admin.password}`);

  }

  await conn.end();

  console.log("Seed complete.");

}


main().catch((err) => {

  console.error(err);
  process.exit(1);

});
