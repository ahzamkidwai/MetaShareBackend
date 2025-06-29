import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/share/blog/:id", async (req, res) => {
  const blogId = req.params.id;

  // Replace this with your actual blog API
  const apiUrl = `https://blogs-ooi1.onrender.com/api/v1/blogs`;

  try {
    const response = await fetch(apiUrl);
    const allBlogs = await response.json();

    const blog = allBlogs.find((b) => b._id === blogId);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const blogUrl = `https://tri-legal-web.vercel.app/blogPost/${blogId}`;

    const imageUrl = blog.imageURL?.startsWith("http")
      ? blog.imageURL
      : "https://t3.ftcdn.net/jpg/01/07/15/58/360_F_107155820_NCUA4CtCkIDXXHnKAlWVzUvRjfMe0k5D.jpg";

    const metaDescription = blog.content
      .replace(/(<([^>]+)>)/gi, "")
      .slice(0, 150);

    // 🧠 Detect if the request comes from a social media bot (Facebook, Twitter, Slack, etc.)
    const userAgent = req.get("User-Agent") || "";
    const isBot =
      /facebookexternalhit|Facebot|Twitterbot|Slackbot-LinkExpanding/i.test(
        userAgent
      );

    // 🧾 Send HTML response with OG tags and conditional redirect
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${blog.title}</title>

        <!-- Open Graph tags -->
        <meta property="og:title" content="${blog.title}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${blogUrl}" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Tri Legal" />

        <!-- Twitter Cards -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${blog.title}" />
        <meta name="twitter:description" content="${metaDescription}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <!-- Optional Canonical Link -->
        <link rel="canonical" href="${blogUrl}" />

        <!-- Conditional redirect: only for humans, not bots -->
        ${
          !isBot
            ? `<meta http-equiv="refresh" content="2;url=${blogUrl}" />`
            : ""
        }
      </head>
      <body>
        <p>Redirecting to blog...</p>
        ${!isBot ? `<script>window.location.href = "${blogUrl}";</script>` : ""}
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/", (req, res) => {
  res.send("✅ Hello Ji, Server is working fine.");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
