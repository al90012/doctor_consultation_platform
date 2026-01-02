const mongoose = require('mongoose')

// Healthcare categories (matches backend)
 const healthcareCategoriesList = [
  "Primary Care",
  "Manage Your Condition",
  "Mental & Behavioral Health",
  "Sexual Health",
  "Children's Health",
  "Senior Health",
  "Women's Health",
  "Men's Health",
  "Wellness",
];

const dailyTimeRangeSchema = new mongoose.Schema({
  start:{type:String}, //09:00
  end:{type:String}, //12:00
},{_id:false})

const availabilityRangeSchema = new mongoose.Schema({
  startDate:{type:String},
  endDate:{type:String},
  excludedWeekDays:{type:[Number], default:[] }, //0-6 {sun-sat}
},{_id:false})

const doctorSchema = new mongoose.Schema({
  name: {type: String, required:true},
  email: {type: String, required:true, unique:true},
  password: {type: String},
  googleId:{type:String, unique:true, sparse:true},
  profileImage:{type:String, default:''},

  spceialization :{
    type:String,
       enum: [
      'Cardiologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 
      'Neurologist', 'Gynecologist', 'General Physician', 'ENT Specialist',
      'Psychiatrist', 'Ophthalmologist'
    ]
  },
  category: {type:String, enum:healthcareCategoriesList, required:false},
  
  qualification:{type:String, required:false},
  expericence:{type:Number},
  about:{type:Number},
  fees:{type:Number},

  hospitalInfo:{
    name:String,
    address:String,
    city:String,
  },

  availabilityRange:availabilityRangeSchema,
  dailyTimeRang:dailyTimeRangeSchema,
  slotDurationMinutes:{type:Number, default:30},

  isVerified:{type:Boolean, default:false},

})

module.exports = mongoose.model('Doctor', doctorSchema)