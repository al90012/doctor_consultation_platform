const express = require("express");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");
const { authenticate } = require("passport");
const { requireRole } = require("../middleware/auth.js");

const router = express.Router();

// getting list of all the doctor
router.get(
  "/list",
  [
    query("search").optional().isString(),
    query("specialization").optional().isString(),
    query("city").optional().isString(),
    query("category").optional().isString(),
    query("minFees").optional().isInt({ min: 0 }),
    query("maxFees").optional().isInt({ min: 0 }),
    query("sortBy")
      .optional()
      .isInt(["fees", "experience", "name", "createdAt"]),
    query("sortOrder").optional().isInt(["asc", "desc"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        search,
        specialization,
        city,
        category,
        minFees,
        maxFees,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = req.query;

      const filter = { isVerified: true };
      if (specialization)
        filter.specialization = {
          $regex: `^${specialization}$`,
          $options: "i",
        };

      if (city) filter["hospitalInfo.city"] = { $regex: city, $options: "i" };

      if (category) filter.category = category;

      if (minFees || maxFees) {
        filter.fees = {};
        if (minFees) filter.fees.$gte = Number(minFees);
        if (maxFees) filter.fees.$gte = Number(maxFees);
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { specialization: { $regex: search, $options: "i" } },
          { "hospitalInfo.name": { $regex: search, $options: "i" } },
        ];
      }

      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      const skip = (Number(page) - 1) * Number(limit);

      const [items, total] = await Promise.all([
        Doctor.find(filter)
          .select("-password -googleId")
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Doctor.countDocuments(filter),
      ]);

      res.ok(items, "Doctor Fetched", {
        page: Number(page),
        limit: Number(limit),
        total,
      });
    } catch (error) {
      console.log("Doctor Fetchec Failed", error);
      res.serverError("Doctor Fetched Failed", [error.message]);
    }
  }
);

// Now getting all the profile of all doctor
router.get(
  "/me",
  authenticate,
  requireRole("doctor"), async (req, res) => {
    const doc = await Doctor.findById(req.user._id).select(
      "-password -googleId"
    );
    res.ok(doc, "Profile fetched");
  }
);

//Update doctor profile
router.put(
  "/onboarding/upate",
  authenticate,
  requireRole("doctor"),
  [
    body("search").optional().notEmpty(),
    body("specialization").optional().notEmpty(),
    body("qualification").optional().notEmpty(),
    body("category").optional().notEmpty(),
    body("experience").optional().isInt({ min: 0 }),
    body("about").optional().isString(),
    body("fees").optional().isInt({ min: 0 }),
    body("hospitalInfo").optional().isObject(),
    body("availabilityRange.startDate").optional().isISO8601(),
    body("availabilityRange.endtDate").optional().isISO8601(),
    body("availabilityRange.excludedWeekDays").optional().isArray(),
    body("dailyTimeRange").isArray({ min: 1 }),
    body("dailyTimeRange.*.start").isString(),
    body("dailyTimeRange.*.end").isString(),
    body("slotDurationMinutes").optional().isInt({ min: 5, max: 180 }),
  ],
  validate,
  async (req, res) => {
    try{
      const updated = {...req.body}
      delete updated.password;
      updated.isVerified = true //Mark profile as verified on update
      const doc = await Doctor.findByIdAndUpate(req.user._id, updated, {new:true}).select('-password -googleId')
      res.ok(doc, 'Profile upadted')
    }catch(error){
      res.serverError('updated failed', [error.message])
    }
  }
);

module.exports = router