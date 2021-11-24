import './ButtonedInputBox.css';
import { useState } from 'react';

export default function ButtonedInputBox(props) {
    const socket = props.socket;
    const [userMessage, setUserMessage] = useState('');


    
    const btnFunc = () => {
        if (props.btnFunction === 'sendMessage') {
            sendMessage();
        }
    }
    
    const sendMessage = () => {
        if (userMessage !== '') {
            socket.emit('globalMessage', [props.gameCode, userMessage]);
            const messageInput = document.getElementById(props.inputId);
            messageInput.value = '';
            messageInput.focus = true;
        }
    }

    return (
        <div className="inputBox buttoned" style={{backgroundColor: props.bgColor}}>
            <input type="text" id={props.inputId} placeholder={props.placeholder} onChange={(e) => setUserMessage(e.target.value)}/>
            <button className="flatBtn" onClick={btnFunc}>{props.btnValue}</button>
        </div>
    )
}