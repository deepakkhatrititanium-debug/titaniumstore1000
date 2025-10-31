import express from 'express';
import { check, validationResult } from 'express-validator';
import { registerController } from '../controllers/authController.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Helper function to get localized validation message
const getValidationMessage = async (req, key) => {
    try {
        // Set Hindi as default language
        const lang = req.headers['accept-language'] || 'hi';
        const filePath = join(__dirname, '..', 'locales', lang, 'messages.json');
        const fileContent = await readFile(filePath, 'utf8');
        const messages = JSON.parse(fileContent);
        return key.split('.').reduce((obj, k) => obj && obj[k], messages) || key;
    } catch (error) {
        console.error('Error loading translation:', error);
        return key; // Return the key if translation fails
    }
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
// Async validation middleware
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        // Process errors to include translations
        const lang = req.headers['accept-language'] || 'en';
        const translatedErrors = await Promise.all(
            errors.array().map(async (err) => {
                // If it's a custom message with a translation key
                if (err.msg && err.msg.startsWith('auth.')) {
                    return {
                        ...err,
                        msg: await getValidationMessage(req, err.msg)
                    };
                }
                return err;
            })
        );
        
        return res.status(400).json({ errors: translatedErrors });
    };
};

router.post(
    '/register',
    validate([
        check('name')
            .not().isEmpty()
            .withMessage('auth.validation.name_required'),
        check('email')
            .isEmail()
            .withMessage('auth.validation.email_required'),
        check('password')
            .isLength({ min: 6 })
            .withMessage('auth.validation.password_length')
    ]),
    registerController
);

// Handle 404 for undefined routes under /api/v1/auth
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

export default router;
