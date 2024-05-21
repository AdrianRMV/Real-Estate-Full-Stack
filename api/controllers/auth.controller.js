import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User created successfully! ' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to created user! :(' });
    }
};
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscando al usuario por su "username" dentro de nuestra DB
        const user = await prisma.user.findUnique({
            where: { username },
        });

        // Si el usuario no existe regresa un mensaje de error de credenciales invalidas
        if (!user)
            return res.status(401).json({ message: 'Invalid Credentials' });

        // Comparamos la contraseña mandada por el usuario con la que ya tiene encriptada en la DB, utilizando el metodo "compare"
        // que tiene bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Si las contraseñas no coinciden regresa un mensaje de error
        if (!isPasswordValid)
            res.status(401).json({ message: 'Invalid Credentials' });

        // Variable para darle una expiracion al token, aqui hacemos el calculo para que la variable tenga el tiempo exacto a una semana de vida
        const age = 1000 * 60 * 60 * 24 * 7;

        // Creamos un token
        const token = jwt.sign(
            {
                id: user.id,
                isAdmin: true,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: age }
        );

        const { password: userPassword, ...userInfo } = user;

        res.cookie('token', token, {
            httpOnly: true,
            // secure: true,
            maxAge: age,
        })
            .status(200)
            .json(userInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to login! :(' });
    }
};
export const logout = (req, res) => {
    res.clearCookie('token')
        .status(200)
        .json({ message: 'Logout successfull' });
};
