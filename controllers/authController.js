import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const config = JSON.parse(await readFile(join(__dirname, '../config.json'), 'utf8'));

// Translation function with configurable default language
const t = async (key, lang = config.server.defaultLanguage) => {
  try {
    const filePath = join(__dirname, '..', 'locales', lang, 'messages.json');
    const fileContent = await readFile(filePath, 'utf8');
    const messages = JSON.parse(fileContent);
    return key.split('.').reduce((obj, k) => obj && obj[k], messages) || key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
export const registerController = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            // Default to Hindi if no language header is provided
            const lang = req.headers['accept-language'] || 'hi';
            const [message, error] = await Promise.all([
                t('auth.user_exists', lang),
                t('auth.user_exists_details', lang)
            ]);
            return res.status(400).json({ 
                success: false,
                message: message,
                error: error
            });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        // In a real app, you would generate a JWT token here
        // const payload = { user: { id: user.id } };
        // jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        //     if (err) throw err;
        //     res.json({ token });
        // });

        const lang = req.headers['accept-language'] || 'en';
        const successMessage = await t('auth.registration_success', lang);
        res.status(201).json({ 
            success: true,
            message: successMessage,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Error in registerController:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : {}
        });
    }
};
