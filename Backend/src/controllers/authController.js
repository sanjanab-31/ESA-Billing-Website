const register = (req, res) => {
    res.status(201).json({ message: 'User registered successfully (placeholder)' });
};

const login = (req, res) => {
    res.json({ token: 'mock-firebase-jwt-token', message: 'Login successful (placeholder)' });
};

module.exports = { register, login };
