const validator = require('validator');

const validate = (request)=>{

    const mandatoryFields = ['firstName', 'emailId', 'password'];
    const requestedFields = Object.keys(request.body);
    const isAllowed = mandatoryFields.every(field=>requestedFields.includes(field));
    
    if(!isAllowed)
        throw new Error("Some fields are missing.");

    // Email Validation
    if(!validator.isEmail(request.body.emailId)){
        throw new Error("Invalid Email");
    }
    // Strong Password Checks
    if(!validator.isStrongPassword(request.body.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0
      })){
        throw new Error("Weak Password");
    }

    if(request.body.firstName)
        if(!(request.body.firstName.length>=3 && request.body.firstName.length<=25)){
            throw new Error("First Name length should be between 3 and 25");
        }

}
module.exports = validate;