// controllers/authController.js
const bcrypt = require('bcrypt')
const User = require('@/models/user/user.model')
const OTP = require('@/models/user/otp.model')

const signup = async (req, res) => {
	try {
		const { name, phoneNumber, designation, password, otp, email } = req.body
		// Check if all details are provided
		if (!name || !email || !password || !otp || !phoneNumber) {
			return res.status(403).json({
				success: false,
				message: 'All fields are required'
			})
		}

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists'
			})
		}

		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
		if (response.length === 0 || otp !== response[0].otp) {
			return res.status(400).json({
				success: false,
				message: 'The OTP is not valid'
			})
		}
		// Secure password
		let hashedPassword
		try {
			hashedPassword = await bcrypt.hash(password, 10)
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: `Hashing password error for ${password}: ` + error.message
			})
		}
		const newUser = await User.create({
			name,
			email,
			phoneNumber,
			password: hashedPassword,
			designation
		})
		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			user: newUser
		})
	} catch (error) {
		console.log(error.message)
		return res.status(500).json({ success: false, error: error.message })
	}
}

module.exports = { signup }
