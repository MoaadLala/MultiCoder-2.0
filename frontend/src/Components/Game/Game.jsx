import './Game.css';
import { useLocation } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import ButtonedInputBox from '../ButtonedInputBox/ButtonedInputBox';
import { User } from '../../App';


export default function Game(props) {
    const socket = props.socket;
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('question');
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState({});
    const { user } = useContext(User);

    console.log(user);

    useEffect(() => {
        state.question = JSON.parse(state.question);
        setQuestion({
            title: state.question['_fieldsProto']['title']['stringValue'],
            madeBy: state.question['_fieldsProto']['madeBy']['stringValue'],
            description: state.question['_fieldsProto']['description']['stringValue'],
            testCases: state.question['_fieldsProto']['testCases']['arrayValue'],
            examples: state.question['_fieldsProto']['examples']['arrayValue']['values'],
            accountLink: state.question['_fieldsProto']['accountLink']['stringValue'],
        });

        
        socket.on('globalMessage', (data) => {
            setMessages(messages => [...messages, data]);
        });
        return () => {
            socket.off('globalMessage');
        }
    }, []);
    console.log(question);

    const updateTabState = (newTab) => {
        document.querySelector('.tabBarItem-active').classList.remove('tabBarItem-active');
        document.getElementById(`${newTab}Tab`).classList.add('tabBarItem-active');
        setActiveTab(newTab);
    }

    const changeHandler = event => {
        console.log(event);
    }

    return (
        <div className="game">
            <div className="gameTopSection">
                <div className="roomCodeContainer"><b>Room Code:</b> {state.gameCode}</div>
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
                            <h2 className="title">{question.title}</h2>
                            <p className="author"><a href={question.accountLink} target="_blank">By: {question.madeBy}</a></p>
                        </div>
                        <div className="questionDescription">
                            {question.description}
                            {/* <div className="codeBlock">
                                <p>Input: [1, 32, 12, 34, 231, 42]</p>
                                <p>output: [1, 12, 32, 34, 42, 231]</p>
                            </div> */}
                            {
                                ('examples' in question) ? (
                                    question.examples.map(val => (
                                        <div className="codeBlock">
                                            <p>Input: {val.mapValue.fields.input.stringValue}</p>
                                            <p>Input: {val.mapValue.fields.output.stringValue}</p>
                                        </div>
                                    ))
                                ) : null
                            }
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
                    onChange={changeHandler}
                />
                </div>
            </div>
            <div className="gameBottomSection">
                <div className="gameActionsBtns">
                    <button className="flatBtn--clicked">Btn</button>
                    <button className="flatBtn">Btn</button>
                </div>
            </div>
        </div>
    )
}