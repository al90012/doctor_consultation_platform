const express = require('express')
const Patient = require('../model/Patient');
const { authenticate } = require('passport');
const { body } = require('express-validator');
const { computeAgeFromDob } = require('../utils/date');
const { route } = require('./auth');
const router = require('./auth');
const validate = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');



// Now getting all the profile of all patient
router.get(
  "/me",
  authenticate,
  requireRole("patient"), async (req, res) => {
    const doc = await Patient.findById(req.user._id).select(
      "-password -googleId"
    );
    res.ok(doc, "Profile fetched");
  }
)

//Update patient profile
router.put(
  "/onboarding/upate",
  authenticate,
  requireRole("patient"),
  [
    body("search").optional().notEmpty(),
    body("phone").optional().isString(),
    body("dob").optional().isISO8601(),
    body("gender").optional().isInt(['male', 'female', 'other']),
    body("bloodGroup").optional().isInt( ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body("emergencyContact").optional().isObject(),
    body("emergencyContact.name").optional().isString().notEmpty(),
    body("emergencyContact.phone").optional().isString().notEmpty(),
    body("emergencyContact.relationship").optional().isString().notEmpty(),
    body("medicalHistory").optional().isObject(),
    body("medicalHistory.allergies").optional().isString().notEmpty(),
    body("medicalHistory.currentMedications").optional().isString().notEmpty(),
    body("medicalHistory.chronicConditions").optional().isString().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try{
      const updated = {...req.body}
      if(updated.dob){
        updated.age = computeAgeFromDob(updated.dob)
      }
      delete updated.password;
      updated.isVerified = true //Mark profile as verified on update
      const doc = await Patient.findByIdAndUpate(req.user._id, updated, {new:true}).select('-password -googleId')
      res.ok(doc, 'Profile upadted')
    }catch(error){
      res.serverError('updated failed', [error.message])
    }
  }
);

module.exports = router
