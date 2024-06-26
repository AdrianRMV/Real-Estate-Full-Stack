import { useContext, useEffect, useRef, useState } from 'react';
import './chat.scss';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import { format } from 'timeago.js';
import { SocketContext } from '../../context/SocketContext';
import { useNotificationStore } from '../../lib/notificationStore';

function Chat({ chats }) {
    const [chat, setChat] = useState(null);

    const { currentUser } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const decrease = useNotificationStore((state) => state.decrease);

    const messageEndRef = useRef();

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [chat]);

    const handleOpenChat = async (id, receiver) => {
        try {
            const res = await apiRequest(`/chats/${id}`);
            setChat({ ...res.data, receiver });

            // Comprobacion para saber si no ha sido abierto el mensaje
            if (!res.data.seenBy.includes(currentUser.id)) {
                decrease();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const text = formData.get('text');

        if (!text) return;
        try {
            const res = await apiRequest.post('/messages/' + chat.id, { text });
            setChat((prev) => ({
                ...prev,
                messages: [...prev.messages, res.data],
            }));
            e.target.reset();

            socket.emit('sendMessage', {
                receiverId: chat.receiver.id,
                data: res.data,
            });
        } catch (err) {
            console.log(err);
        }
    };

    // Para que no sea necesario picarle el boton para mandar el mensaje
    const enterFormMessage = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.target.form.requestSubmit(); // Enviar el formulario
        }
    };

    // useEffect(() => {
    //     const read = async () => {
    //         try {
    //             await apiRequest.put('/chats/read/' + chat.id);
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     };

    //     // Si el chat y el socket tienen algun valor (no son null), quiere decir que existen y recibe la funcion del servidor, la cual regresa como propiedad la "data" del mensaje mandado
    //     if (chat && socket) {
    //         socket.on('getMessage', (data) => {
    //             // Si el id del chat que se encuentra abierto es el mismo que del mensaje que recibio el usuario entonces procedera

    //             if (chat.id === data.chatId) {
    //                 setChat((prev) => ({
    //                     ...prev,
    //                     messages: [...prev.messages, data],
    //                 }));
    //                 read();
    //             }
    //         });
    //     }
    //     return () => {
    //         socket.off('getMessage');
    //     };
    // }, [socket, chat]);

    useEffect(() => {
        const read = async () => {
            try {
                await apiRequest.put('/chats/read/' + chat.id);
            } catch (err) {
                console.log(err);
            }
        };

        if (chat && socket) {
            socket.on('getMessage', (data) => {
                if (chat.id === data.chatId) {
                    setChat((prev) => ({
                        ...prev,
                        messages: [...prev.messages, data],
                    }));
                    read();
                }
            });
        }
        return () => {
            socket.off('getMessage');
        };
    }, [socket, chat]);

    return (
        <div className="chat">
            <div className="messages">
                <h1>Messages</h1>
                {chats?.map((c) => (
                    <div
                        className="message"
                        key={c.id}
                        style={{
                            backgroundColor:
                                c.seenBy.includes(currentUser.id) ||
                                chat?.id === c.id
                                    ? 'white'
                                    : '#fecd514e',
                        }}
                        onClick={() => handleOpenChat(c.id, c.receiver)}
                    >
                        <img
                            src={c.receiver.avatar || '/noavatar.jpg'}
                            alt=""
                        />
                        <span>{c.receiver.username}</span>
                        <p>{c.lastMessage}</p>
                    </div>
                ))}
            </div>
            {chat && (
                <div className="chatBox">
                    <div className="top">
                        <div className="user">
                            <img
                                src={chat.receiver.avatar || '/noavatar.jpg'}
                                alt=""
                            />
                            {chat.receiver.username}
                        </div>
                        <span className="close" onClick={() => setChat(null)}>
                            X
                        </span>
                    </div>
                    <div className="center">
                        {chat.messages.map((message) => (
                            <div
                                className="chatMessage"
                                style={{
                                    alignSelf:
                                        message.userId === currentUser.id
                                            ? 'flex-end'
                                            : 'flex-start',
                                    textAlign:
                                        message.userId === currentUser.id
                                            ? 'right'
                                            : 'left',
                                }}
                                key={message.id}
                            >
                                <p>{message.text}</p>
                                <span>{format(message.createdAt)}</span>
                            </div>
                        ))}
                        <div ref={messageEndRef}></div>
                    </div>
                    <form onSubmit={handleSubmit} className="bottom">
                        <textarea
                            name="text"
                            onKeyDown={enterFormMessage}
                            style={{ resize: 'none' }}
                        ></textarea>
                        <button>Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chat;
