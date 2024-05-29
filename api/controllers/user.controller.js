import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get users!!' });
    }
};
export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get users!!' });
    }
};
export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const tokenUserId = req.userId;
        const { password, avatar, ...inputs } = req.body;

        if (id !== tokenUserId) {
            return res.status(403).json({ message: 'Not Authorized!' });
        }

        let updatedPassword = null;

        try {
            // Si existe el cambio de contraseña en el usario Hashea la contraseña que quiere actualizar antes de mandarse al a BD
            if (password) {
                updatedPassword = await bcrypt.hash(password, 10);
            }

            // manda todo el contenido de los inputs en este caso son "email y nombre", por que password y avatar, solo se mandaran en dado caso de haber sido modificados
            const updateUser = await prisma.user.update({
                where: { id },
                data: {
                    ...inputs,
                    ...(updatedPassword && { password: updatedPassword }),
                    ...(avatar && { avatar }),
                },
            });

            const { password: userPassword, ...rest } = updateUser;

            res.status(200).json(rest);
        } catch (error) {}
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get users!!' });
    }
};
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId) {
        return res.status(403).json({ message: 'Not Authorized!' });
    }

    try {
        await prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: 'User Deleted!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete user!!' });
    }
};
