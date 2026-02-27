const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const cloudinary = require("../config/cloudinary");

const uploadsFolder = path.join(__dirname, "..", "uploads");

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ✅ RAW collection (no Mongoose casting)
    const col = mongoose.connection.db.collection("products");

    const total = await col.countDocuments({});
    console.log("📦 Total products:", total);

    const cursor = col.find({});
    let migrated = 0;
    let skipped = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const img = doc.image;

      // ✅ already migrated
      if (img && typeof img === "object" && img.url) {
        skipped++;
        continue;
      }

      // ✅ old format we want: "/uploads/xxx.jpg"
      if (!img || typeof img !== "string") {
        console.log("⚠️ No valid image:", doc._id);
        skipped++;
        continue;
      }

      const filename = img.replace("/uploads/", "").replace("uploads/", "").trim();
      const filePath = path.join(uploadsFolder, filename);

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