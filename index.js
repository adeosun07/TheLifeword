import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const saltRounds = 10;
const postsFile = path.join(__dirname, 'data', 'posts.json');


const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
export default pool;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index");
});
app.get("/about", (req, res) =>{
    res.render("about");
});
app.get("/donate", (req, res) =>{
    res.render("donate");
});
app.get("/article", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const data = await fs.readFile(postsFile, 'utf-8');
    const posts = JSON.parse(data);

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const paginatedPosts = posts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(posts.length / limit);

    res.render("article", {
      posts: paginatedPosts,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading blog posts");
  }
});

app.get("/admin", (req,res) => {
    res.render("admin-signup", {alert: ""});
});

app.get("/to-login", (req,res) => {
    res.render("admin-login", {alert: ""});
});

app.post("/signup", async (req,res) => {
    const password = req.body.password;
    const email = req.body.username.trim();

    try {
    const result = await pool.query("SELECT COUNT(*) FROM admins");
    const count = parseInt(result.rows[0].count);

    if (count >= 1) {
        return res.render("admin-signup", { alert: 'Sorry not an admin or simply login' });
    }else{
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.log("Error hashing password:", err);
            }else {
                const result = await pool.query(
                        "INSERT INTO admins (email, password) VALUES ($1, $2)",
                        [email, hash]
                    );
                    console.log(result);
                    return res.render("admin-login");
                }
            });  
        }
    } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req,res) => {
    const loginpassword = req.body.password;
    const email = req.body.username.trim();

    try {
        const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            const admin = result.rows[0];
            const storedhashedPassword = admin.password; 

            bcrypt.compare(loginpassword, storedhashedPassword, (err, result) => {
                if (err){
                    console.log(err)
                }else{
                    if (result) {
                        return res.render("create-post");
                    } else {
                        return res.render("admin-login", { alert: 'Incorrect password' });
                    }
                    }
                });
            }else {
            return res.render("admin-login", { alert: 'email not found' });
        }
    } catch (error) {
        console.error("Login error:", error);
    }
});

app.post("/create-post", async (req, res) => {
  const title = req.body.title.trim();
  const content = req.body.content;

  const newPost = {
    id: Date.now(),
    title,
    content,
    created_at: new Date().toISOString(),
  };

  try {
    const data = await fs.readFile(postsFile, 'utf-8');
    const posts = JSON.parse(data);

    posts.push(newPost);
    await fs.writeFile(postsFile, JSON.stringify(posts, null, 2));

    res.render("create-post", {alert: "Post created successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving post");
  }
});

app.get("/posts/:postId", async (req, res) => {
  const postId = Number(req.params.postId);

  try {
    const data = await fs.readFile(postsFile, 'utf-8');
    const posts = JSON.parse(data);

    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("post", { post });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading the post");
  }
});








app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});