
const {validationResult} = require('express-validator')

 module.exports = (req,resp, next) =>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.badRequest('Validation Error', errors.array())
  }

  next()
}