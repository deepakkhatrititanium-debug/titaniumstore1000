import express from 'express';
import {registerController} from '../controllers/authContrller.js';


//router object

const router = express.Router();


//routing
router.post('/register', registerController);






export default router;
