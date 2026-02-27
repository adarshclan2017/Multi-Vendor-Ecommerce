const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const cloudinary = require("../config/cloudinary");

const uploadsFolder = path.join(__dirname, "..", "uploads");

function toLocalFilePath(img) {
  if (!img || typeof img !== "string") return null;

  // accepts "/uploads/a.jpg" OR "uploads/a.jpg"
  const cleaned = img.replace(/^\/?uploads\//, "").trim();
  if (!cleaned) return null;

  return path.join(uploadsFolder, cleaned);
}

async function migrate() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI missing in backend/.env");

    // Cloudinary env checks (optional but helpful)
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary env missing (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)");
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
    console.log("DB:", mongoose.connection.name);

    // RAW collection (no schema casting issues)
    const col = mongoose.connection.db.collection("products");

    const total = await col.countDocuments({});
    console.log("📦 Total products:", total);

    const cursor = col.find({});
    let migrated = 0;
    let skipped = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const img = doc.image;

      // ✅ already migrated (image is {url, publicId})
      if (img && typeof img === "object" && img.url) {
        skipped++;
        continue;
      }

      // ✅ must be old string "/uploads/.."
      const filePath = toLocalFilePath(img);
      if (!filePath) {
        console.log("⚠️ No valid old image string:", doc._id);
        skipped++;
        continue;
      }

      if (!fs.existsSync(filePath)) {
        console.log("❌ File not found:", filePath, "for", doc._id);
        skipped++;
        continue;
      }

      console.log("⬆ Uploading:", filePath);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "multi-vendor/products",
      });

      await col.updateOne(
        { _id: doc._id },
        {
          $set: {
            image: {
              url: result.secure_url,
              publicId: result.public_id,
            },
          },
        }
      );

      console.log("✅ Migrated:", doc._id);
      migrated++;
    }

    console.log(`🎉 Migration complete! migrated=${migrated}, skipped=${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();