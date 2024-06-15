import prisma from '../lib/prisma.js';

export const getChats = async (req, res) => {
    try {
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get chats!!' });
    }
};
export const getChat = async (req, res) => {
    try {
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get the chat!!' });
    }
};
export const addChat = async (req, res) => {
    try {
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add the chat!!' });
    }
};
export const readChat = async (req, res) => {
    try {
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to read the chat!!' });
    }
};
