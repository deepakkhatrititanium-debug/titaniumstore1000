import bcrypt from 'bvcrypt.js';

export const hashPassword = async (Password) => {
 try {
      const saltRounds = 10;    
       const hashedPossword = await bcrypt.hash(Password, saltRounds);
       return hashedPassword;
 } catch (error) {
   console.log(error)

 }

 };



export const comparePassword = async (Password, hashedPassword) => {
   return bcrypt.compare(Password, hashedPassword);


};




