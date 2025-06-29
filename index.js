import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/share/blog/:id", async (req, res) => {
  const blogId = req.params.id;

  // Replace this with your real API endpoint
  const apiUrl = `https://blogs-ooi1.onrender.com/api/v1/blogs`; // 👈 change this

  try {
    const response = await fetch(apiUrl);
    const allBlogs = await response.json();

    const blog = allBlogs.find((b) => b._id === blogId);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const blogUrl = `https://tri-legal-web.vercel.app/blogPost/${blogId}`;
    console.log("blogUrl blogUrl : ", blogUrl);
    const imageUrl = blog.image?.startsWith("http")
      ? blog.image
      : `https://tri-legal-web.vercel.app${blog.image || "/default-blog.jpg"}`;
    console.log("image Url : ", imageUrl);
    console.log("blog blog blog : ", blog);
    const metaDescription = blog.content
      .replace(/(<([^>]+)>)/gi, "")
      .slice(0, 150);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${blog.title}</title>
        
        <meta property="og:title" content="${blog.title}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${blogUrl}" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Tri Legal" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${blog.title}" />
        <meta name="twitter:description" content="${metaDescription}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <meta http-equiv="refresh" content="2;url=${blogUrl}" />
      </head>
      <body>
        <p>Redirecting to blog...</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/", async (req, res) => {
  res.send("Hello Ji, Server is working fine.");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
