const User = require("../users/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/jwt");

//signUp
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password: hashed,
        });
        res.json({ token: generateToken(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User Not Found !" });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials !" });
        };

        res.json({ token: generateToken(user) });
    } catch(err){
        res.status(500).json({error : err.message});
    }
};