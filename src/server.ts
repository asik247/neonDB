import express, {
  type Application,
  type Request,
  type Response,
} from "express";
//* pg package desctring Pool.
import { Pool } from "pg";
import { config } from "./config";
const app: Application = express();
// const port = config.port;
//* middleware
app.use(express.json());
//* database connection
const pool = new Pool({
  connectionString: config.db_url,
});
//* initDB/table crate
const initDB = async () => {
  try {
    await pool.query(`
             CREATE TABLE IF NOT EXISTS employee2(
                id SERIAL PRIMARY KEY,
                name VARCHAR (100) NOT NULL,
                email VARCHAR (255) UNIQUE NOT NULL,
                deg VARCHAR (150) NOT NULL,
                salary INT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                is_active BOOLEAN NOT NULL DEFAULT TRUE
             );
            `);
    console.log("Neon DB connected");
  } catch (error) {
    console.log(error);
  }
};
initDB();
//! get method all employee2 get.
app.get("/api/v1/employee2", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
    SELECT * FROM  employee2
    `);
    res.status(200).json({
      success: true,
      message: "employee2 all info here.",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
});

//! single employee2 info get.
app.get("/api/v1/employee2/:id", async (req: Request, res: Response) => {
  // console.log(id);
  try {
    const { id } = req.params;
    // 7, 7000
    const result = await pool.query(`SELECT * FROM employee2 WHERE id=$1 `, [
      id,
    ]);
    res.status(200).json({
      success: true,
      message: "single employee2 data here .",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
});
//! post method.
app.post("/api/v1/employee2", async (req: Request, res: Response) => {
  const { name, deg, salary, email } = req.body;
  const result = await pool.query(
    `
        INSERT INTO employee2 (name,deg,salary,email) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, salary, deg],
  );

  res.send({ success: "hey emplyee created." });
});
//! put/patch method.
app.put("/api/v1/employee2/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, salary } = req.body;
    const update = await pool.query(
      `UPDATE employee2 SET 
       name= COALESCE($1,name),
       email = COALESCE($2,email),
       salary = COALESCE($3,salary),
       updated_at = NOW() WHERE id=$4 RETURNING *`,
      [name ?? null, email ?? null, salary ?? null, id],
    );
    res.status(200).json({
      success: true,
      message: "employee2 name updated.",
      data: update.rows,
    });

    console.log(update);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
});
//! delete.
app.delete("/api/v1/employee2/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const remove = await pool.query(
      `DELETE FROM employee2  WHERE id=$1 RETURNING *`,
      [id],
    );

    //? condition checked.
    if (remove.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "employee2 delete.",
      data: remove.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
});

//* listiner
app.listen(config.port, () => {
  console.log(`server is running in port is ${config.port}`);
});
