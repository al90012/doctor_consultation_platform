const jwt = require('jsonwebtoken')
const Doctor = require('../model/Doctor')
const Patient = require('../model/Patient')
const { authenticate } = require('passport')

module.exports = {
  authenticate: async (req,res,next) =>{
    try {
      const header = req.headers.authorization
      const token = header.startsWith('Bearer ') ? header.slice(7): null

      if(!token) return res.unauthorized('Token is Missing')

      const decode = jwt.verify(token, process.env.JWT_SECRET)
      req.auth = decode;

      if(decode.type === 'doctor') {
        req.user = await Doctor.findById(decode.id)
      } else if(decode.type === 'patient') {
        req.user = await Patient.findById(decode.findById)
      }

      if(!req.user) return res.unauthorized("Invalid User")

      next()
    } catch(error){
       return res.unauthorized("Invalid or expired token")
    }
  },
  requireRole: role => (req,res,next) =>{
    if(!req.auth || req.auth.type !== role){
      return res.forbidden("Insufficient role permissions")
    }
    next()
  }
}