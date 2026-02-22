const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const Image = require("../models/image.model");
const Like = require("../models/like.model");
const { query, param } = require("express-validator");
const validate = require("../middleware/validationMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiter");

/* ===============================
   Multer Setup
================================ */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===============================
   Upload Image
================================ */
router.post(
  "/upload",
  uploadLimiter,
  protect,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400);
        throw new Error("No file uploaded");
      }

      if (!req.file.mimetype.startsWith("image/")) {
        res.status(400);
        throw new Error("Only image files are allowed");
      }

      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "image-gallery",
      });

      const image = await Image.create({
        url: result.secure_url,
        publicId: result.public_id,
        uploadedBy: req.user._id,
      });

      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  }
);

/* ===============================
   Get Images (Pagination + Sorting)
================================ */
router.get(
  "/",
  protect,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("sort").optional().isIn(["newest", "oldest", "popular"]),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const skip = (page - 1) * limit;
      const sortBy = req.query.sort || "newest";

      const total = await Image.countDocuments();

      let sortStage = { createdAt: -1 };
      if (sortBy === "oldest") sortStage = { createdAt: 1 };

      const images = await Image.aggregate([
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "image",
            as: "likes",
          },
        },
        {
          $addFields: {
            likeCount: { $size: "$likes" },
          },
        },
        {
          $sort:
            sortBy === "popular"
              ? { likeCount: -1 }
              : sortStage,
        },
        { $skip: skip },
        { $limit: limit },
      ]);

      const populatedImages = await Image.populate(images, {
        path: "uploadedBy",
        select: "name role",
      });

      res.json({
        page,
        totalPages: Math.ceil(total / limit),
        totalImages: total,
        images: populatedImages,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ===============================
   Admin: Get All Images
================================ */
router.get("/admin/all", protect, requireAdmin, async (req, res, next) => {
  try {
    const images = await Image.aggregate([
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "image",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$likes" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const populatedImages = await Image.populate(images, {
      path: "uploadedBy",
      select: "name email role",
    });

    res.json(populatedImages);

  } catch (error) {
    next(error);
  }
});

/* ===============================
   Like / Unlike
================================ */
router.post(
  "/:id/like",
  protect,
  [param("id").isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const imageId = req.params.id;

      const existingLike = await Like.findOne({
        user: req.user._id,
        image: imageId,
      });

      if (existingLike) {
        await existingLike.deleteOne();
        return res.json({ message: "Image unliked" });
      }

      await Like.create({
        user: req.user._id,
        image: imageId,
      });

      res.json({ message: "Image liked" });
    } catch (error) {
      next(error);
    }
  }
);

/* ===============================
   Delete Image
================================ */
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const image = await Image.findById(req.params.id);

      if (!image) {
        res.status(404);
        throw new Error("Image not found");
      }

      if (
        image.uploadedBy.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        res.status(403);
        throw new Error("Not authorized");
      }

      await cloudinary.uploader.destroy(image.publicId);
      await image.deleteOne();
      await Like.deleteMany({ image: image._id });

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);
/* ===============================
   Get Liked Images
================================ */
router.get("/liked", protect, async (req, res, next) => {
  try {
    const likes = await Like.find({ user: req.user._id }).populate({
      path: "image",
      populate: {
        path: "uploadedBy",
        select: "name role",
      },
    });

    const likedImages = likes.map((like) => like.image);

    res.json(likedImages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;