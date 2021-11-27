import './Game.css';
import { useLocation } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import ButtonedInputBox from '../ButtonedInputBox/ButtonedInputBox';
import profilePic from '../../assets/profilePic.jpeg';
import { User } from '../../App';


export default function Game(props) {
    const socket = props.socket;
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('question');
    const [messages, setMessages] = useState([]);
    const {user, setUser} = useContext(User);

    console.log(user);

    useEffect(() => {
        //When Receving a message, this is not ready yet, as we have to add the image and name later
        socket.on('globalMessage', (data) => {
            setMessages(messages => [...messages, data]);
        });
        return () => {
            socket.off('globalMessage');
        }
    }, []);

    const updateTabState = (newTab) => {
        document.querySelector('.tabBarItem-active').classList.remove('tabBarItem-active');
        document.getElementById(`${newTab}Tab`).classList.add('tabBarItem-active');
        setActiveTab(newTab);
    }

    return (
        <div className="game">
            <div className="gameTopSection">
                <div className="roomCodeContainer"><b>Room Code:</b> {state.gameCode}</div>
                <div className="gameActionBtns">
                    <button className="flatBtn">Btn</button>
                </div>
            </div>
            <div className="gameBoard">
                <div className="gameLeftSide">
                    <div className="tabBar">
                        <div className="tabBarItem tabBarItem-active" id="questionTab" onClick={() => updateTabState('question')}>Question</div>
                        <div className="tabBarItem" id="consoleTab" onClick={() => updateTabState('console')}>Console</div>
                        <div className="tabBarItem" id="chatTab" onClick={() => updateTabState('chat')}>Chat</div>
                    </div>
                    <div className="tabBarView" id="question" style={{display: (activeTab === 'question') ? 'block' : 'none'}}>
                        <div className="questionHeading">
                            <h2 className="title">Sorting</h2>
                            <p className="author">By: Moaad Lala</p>
                        </div>
                        <div className="questionDescription">
                            Given an array of integers, sort them in an assending order
                            <div className="codeBlock">
                                <p>Input: [1, 32, 12, 34, 231, 42]</p>
                                <p>output: [1, 12, 32, 34, 42, 231]</p>
                            </div>
                        </div>
                    </div>
                    <div className="tabBarView" id="console" style={{display: (activeTab === 'console') ? 'block' : 'none'}}>
                        <h2>Console</h2>
                    </div>
                    <div className="tabBarView" id="chat" style={{display: (activeTab === 'chat') ? 'flex' : 'none'}}>
                        <div className="chatContainer">
                            <div className="messagesContainer">
                                {
                                    messages.map(val => (
                                        <div className="messageContainer">
                                            <img src={val.image} alt="" />
                                            <div>
                                                <h5 className="greyish">{val.name}</h5>
                                                <p>{val.message}</p>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                            <ButtonedInputBox inputId="messageInput" bgColor="var(--main-grey)" placeholder="Put Your Message Here..." btnValue={<i class="fas fa-paper-plane"></i>} btnFunction='sendMessage' socket={socket} gameCode={state.gameCode}/>
                        </div>
                    </div>
                </div>
                <div className="gameRightSide">
                <AceEditor
                    mode="javascript"
                    theme="monokai"
                    name="editor"
                    editorProps={{ $blockScrolling: true }}
                    focus={true}
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    enableSnippets={true}
                    width="100%"
                    fontSize={16}
                />
                </div>
            </div>
        </div>
    )
}