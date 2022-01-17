import './Game.css';
import { useLocation, useNavigate } from 'react-router';
import { useContext, useEffect, useRef, useState } from 'react';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools"

import ButtonedInputBox from '../ButtonedInputBox/ButtonedInputBox';
import { User } from '../../App';
import testCaseIcon from '../../assets/testCase.svg';
import winnerIcon from '../../assets/winnerIcon.svg';
import loserIcon from '../../assets/loserIcon.svg';


export default function Game(props) {
    const socket = props.socket;
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('question');
    const [messages, setMessages] = useState([]);
    const [timerId, setTimerId] = useState();
    const solution = useRef(state.question.starterCode);
    const [spectatorSolution, setSpectatorSolution] = useState(state.question.starterCode);
    const { user, setUser } = useContext(User);
    const timerRef = useRef((state.isSpectator) ? state.timer : 0);
    const navigate = useNavigate();

    
    useEffect(() => {
        console.log(state.question);

        if (!state.isView) {
            setTimerId(setInterval(() => {
                timerRef.current++;
                document.querySelector('.timerContainer').innerHTML = timerRef.current;
            }, 1000));
        }

        socket.on('globalMessage', (data) => {
            setMessages(messages => [...messages, data]);
        });

        socket.on('friendsAndFamilyWinnerNotify', (data) => {
            //data[0]: name
            //data[1]: time
            //data[2]: newPlayersObject (string)
            showNotificationSection(`<img src=${winnerIcon} alt="" /><p><b>${data[0]}</b> has Won! his timescore is ${data[1]}</p>`, '#528a08');
        });

        socket.on('youWonFriendsAndFamily', (data) => {
            //data: newPlayersObject (string)
            console.log(`You Won! Congrats, here, update yourself ${data}`);
            navigate('/lobby', { state: { gameCode: state.gameCode, playersObj: JSON.parse(data) } });
        });

        socket.on('friendsAndFamilyLoserNotify', (data) => {
            //data: name
            showNotificationSection(`<img src=${loserIcon} alt="" /><p><b>${data}</b> submitted a broken code, what a loser</p>`, '#9A1C0C');
        });

        socket.on('youLostFriendsAndFamily', () => {
            console.log('you lost...');
        });

        socket.on('newAdmin', () => {
            setUser({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                admin: true,
            });
        });

        socket.on('newSpectatorsData', data => {
            // data: Players Code
            setSpectatorSolution(data);
            // console.log(data);
        });

        socket.on('spectatorTimerRequest', (data) => {
            //data: socket.id
            console.log(`Timer request is here, socket.id: ${data}`);
            socket.emit('spectatorTimerRequest', [timerRef.current, data, state.gameCode]);
        });

        return () => {
            socket.off('globalMessage');
            socket.off('friendsAndFamilyWinnerNotify');
            socket.off('youWonFriendsAndFamily');
            socket.off('friendsAndFamilyLoserNotify');
            socket.off('youLostFriendsAndFamily');
            socket.off('newAdmin');
            socket.off('newSpectatorsData');
            socket.off('spectatorTimerRequest');
        }
    }, []);
    console.log(state.question);

    const updateTabState = (newTab) => {
        document.querySelector('.tabBarItem-active').classList.remove('tabBarItem-active');
        document.getElementById(`${newTab}Tab`).classList.add('tabBarItem-active');
        setActiveTab(newTab);
    }

    const changeHandler = event => {
        solution.current = event;
        socket.emit('spectatorsUpdate', [solution.current, state.gameCode]);
    }

    const arrayComparison = (a, b) => {
        return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    }

    const submitCode = () => {
        let result = true;
        state.question.testCases.forEach(val => {
            let test = solution.current + `\nsortArr([${val.input}]);`;
            //This eval call must change, preferable with an RCE
            let answer = eval(test);
            if (state.question.dataType == "Array") {
                if (!arrayComparison(answer, val.expectedOutput)) {
                    result = false;
                }
            }
        });
        if (result) {
            //Right Answer
            clearInterval(timerId);
            console.log(timerRef.current);
            socket.emit('friendsAndFamilyWinner', [timerRef.current, state.gameCode, solution.current]);
        } else {
            //Wrong Answer
            socket.emit('friendsAndFamilyLoser', state.gameCode);
        }
    }

    const showNotificationSection = (msg, color) => {
        const notificationSection = document.getElementById('gamePageNotificationContainer');
        notificationSection.innerHTML = msg;
        notificationSection.style.backgroundColor = color;
        notificationSection.classList.add('fadeIn');
        notificationSection.style.opacity = '1';
        setTimeout(() => {
            notificationSection.classList.remove('fadeIn');
            notificationSection.classList.add('fadeOut');
            setTimeout(() => {
                notificationSection.style.opacity = '0';
                notificationSection.classList.remove('fadeOut');
            }, 400);
        }, 8000);
    }

    const showTestCase = index => {
        const testCase = document.getElementById(`testCaseNum${index}`);
        testCase.classList.toggle('active');
    }

    console.log(solution.current);

    return (
        <div className="game">
            <div className="gameTopSection">
                <div className="roomCodeContainer"><b>Room Code:</b> {state.gameCode}</div>
                <div className="gameTopSectionRightSide">
                    <span className="timerContainer">{timerRef.current}</span>
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
                            <h2 className="title">{state.question.title}</h2>
                            <p className="author"><a href={state.question.accountLink} target="_blank">By: {state.question.madeBy}</a></p>
                        </div>
                        <div className="questionDescription">
                            {state.question.description}
                            {
                                ('examples' in state.question) ? (
                                    state.question.examples.map(val => (
                                        <div className="codeBlock">
                                            <p>Input: {val.input}</p>
                                            <p>Output: {val.output}</p>
                                        </div>
                                    ))
                                ) : null
                            }
                        </div>
                    </div>
                    <div className="tabBarView" id="console" style={{display: (activeTab === 'console') ? 'block' : 'none'}}>
                        {
                            state.question.testCases.map((val, index) => (
                                <div className="testCaseContainer" id={`testCaseNum${index}`} onClick={(val.isOpen) ? () => showTestCase(index) : null} >
                                    <div className="testCase">
                                        <div className="testCaseLeftSide">
                                            <img src={testCaseIcon} alt=""/>
                                            <div>
                                                <h4>Test Case</h4>
                                                <p className="greyish">{(val.isOpen) ? 'Open' : 'Closed'}</p>
                                            </div>
                                        </div>
                                        <i class="fas fa-angle-down"></i>
                                    </div>
                                    <div className="testCaseContent">
                                        <h5>Input: {val.input}</h5>
                                        <h5>Expected Output: {val.expectedOutput}</h5>
                                    </div>
                                </div>
                            ))
                        }
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
                    value={(state.isView) ? state.code : (state.isSpectator) ? spectatorSolution : solution.current}
                    editorProps={{ $blockScrolling: true }}
                    focus={true}
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    enableSnippets={true}
                    width="100%"
                    fontSize={16}
                    onChange={changeHandler}
                    readOnly={(state.isSpectator || state.isView) ? true : false}
                    // placeholder="You deleted the test functions, you sortof need that for the testcases to work, just do a quick restart or something.."
                />
                </div>
            </div>
            <div className="gameBottomSection">
                <div className="gameNotificationSection" id="gamePageNotificationContainer"></div>
                <div className="gameActionBtns" style={{display: (state.isSpectator || state.isView ? 'none' : 'block')}}>
                    <button className="flatBtn--clicked">Btn</button>
                    <button className="flatBtn" style={{marginLeft: '1em'}} onClick={submitCode}>Submit</button>
                </div>
            </div>
        </div>
    )
}