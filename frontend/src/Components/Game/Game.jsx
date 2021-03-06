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
import runningTestCase from '../../assets/runningTestCase.svg';
import wrongTestCase from '../../assets/wrongTestCase.svg';
import correctTestCase from '../../assets/correctTestCase.svg';
import wrongAnswerIcon from '../../assets/wrongAnswerIcon.svg';
import finalWinningResultImg from '../../assets/finalWinningResult.svg';
import AnimatedDiv from '../AnimatedDiv/AnimatedDiv';


export default function Game(props) {

    const paramsConstructure = arr => {
        let params = arr;
        console.log("Construction Function Input");
        console.log(params);
        let result = '';
        for (let i=0;i<params.length;i++) {
            if (i !== params.length - 1) {
                if (typeof params[i] == "object") {
                    result += `${JSON.stringify(params[i])}, `;
                } else {
                    result += `${params[i]}, `;
                }
            } else {
                if (typeof params[i] == "object") {
                    result += `${JSON.stringify(params[i])}`;
                } else {
                    result += params[i];
                }
            }
        }
        console.log("Construction Function output: ");
        console.log(JSON.stringify(result));
        return result;
    }

    const socket = props.socket;
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('question');
    const [messages, setMessages] = useState([]);
    const [timerId, setTimerId] = useState();
    let parameters = paramsConstructure(Object.keys(state.question.testCases[0].input));
    const solution = useRef(`function ${state.question.functionName}(${parameters}) {}`);
    const [spectatorSolution, setSpectatorSolution] = useState(`function ${state.question.functionName}(${parameters}) {}`);
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
                name: user.name,
                email: user.email,
                photo: user.photo,
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

    const updateTestCaseWithRunning = index => {
        console.log(index);
        const testCase = document.getElementById(`testCaseNum${index}`);
        const testCaseIcon = document.getElementById(`testCaseIconNum${index}`);
        testCaseIcon.src = runningTestCase;
    }

    const updateTestCaseWithWrongAnswer = index => {
        const testCase = document.getElementById(`testCaseNum${index}`);
        const testCaseIcon = document.getElementById(`testCaseIconNum${index}`);
        testCaseIcon.src = wrongTestCase;
    }

    const updateTestCaseWithCorrectAnswer = index => {
        const testCase = document.getElementById(`testCaseNum${index}`);
        const testCaseIcon = document.getElementById(`testCaseIconNum${index}`);
        testCaseIcon.src = correctTestCase;
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

    const mapComparison = (obj1, obj2) => {
        let equal = true;
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            equal = false;
        } else {
            for (let key of Object.keys(obj1)) {
                if (obj2[key] === undefined) {
                equal = false;
                } else if (obj2[key] !== obj1[key]) {
                equal = false;
                }
            }
        }
        
        
        return equal;
    }

    const submitCode = () => {
        let result = true;
        state.question.testCases.forEach((val, index) => {
            updateTestCaseWithRunning(index);
            // if (state.question.dataType == "Array") {
            //     let test = solution.current + `\n${state.question.functionName}([${val.input}]);`;
            //     //This eval call must change, preferable with an RCE
            //     let answer = eval(test);
            //     if (!arrayComparison(answer, val.expectedOutput)) {
            //         // Not an AC on this test case.
            //         result = false;
            //         updateTestCaseWithWrongAnswer(index);
            //     } else {
            //         // Everything is good with this test case
            //         updateTestCaseWithCorrectAnswer(index);
            //     }
            // } else if (state.question.dataType == "Number") {
            //     let test = solution.current + `\n${state.question.functionName}(${val.input});`;
            //     //This eval call must change, preferable with an RCE
            //     let answer = eval(test);
            //     if (answer !== val.expectedOutput) {
            //         result = false;
            //         updateTestCaseWithWrongAnswer(index);
            //     } else {
            //         updateTestCaseWithCorrectAnswer(index);
            //     }
            // }
            let test = solution.current + `\n${state.question.functionName}(${paramsConstructure(Object.values(val.input))});`;
            console.log("Full Solution: ");
            console.log(test);
            // this eval call must change, preferable with an RCE
            let answer = eval(test);
            console.log("Full Solution Evaluation: ");
            console.log(answer);
            console.log("Full solution Evaluation output datatype: ")
            console.log(typeof answer);
            console.log("Expected Output: ");
            console.log(val.expectedOutput);
            console.log("Expected Output DataType: ");
            console.log(typeof val.expectedOutput);
            if (state.question.dataType === "Array") {
                if (!arrayComparison(answer, val.expectedOutput)) {
                    // Not an AC on this test case.
                    result = false;
                    updateTestCaseWithWrongAnswer(index);
                } else {
                    // Everything is good with this test case
                    updateTestCaseWithCorrectAnswer(index);
                }
            } else if (state.question.dataType === "Map") {
                if (!mapComparison(answer, val.expectedOutput)) {
                    result = false;
                    updateTestCaseWithWrongAnswer(index);
                } else {
                    updateTestCaseWithCorrectAnswer(index);
                }
            } else { // Number, String, or Bool
                if (answer !== val.expectedOutput) {
                    result = false;
                    updateTestCaseWithWrongAnswer(index);
                } else {
                    updateTestCaseWithCorrectAnswer(index);
                }
            }
        });
        if (result) {
            setTimeout(() => {
                clearInterval(timerId);
                //Right Answer
                console.log(timerRef.current);
                
                const glass = document.getElementById('glass');
                const finalWinningResult = document.getElementById('finalWinningResult');
                const nav = document.getElementsByTagName('nav')[0];
                glass.classList.add('fadeIn');
                glass.style.display = 'flex';
                nav.style.display = 'none';
                document.body.style.overflow = 'hidden';
                for (let i=0;i<100;i++) {
                    var randomRotation = Math.floor(Math.random() * 360);
                    var randomWidth = Math.floor(Math.random() * Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    var randomHeight = Math.floor(Math.random() * Math.max(document.documentElement.clientHeight, window.innerHeight || 500));
                    var randomAnimationDelay = Math.floor(Math.random() * 15);
                    console.log(randomAnimationDelay);
                    var colors = ['#0CD977', '#FF1C1C', '#FF93DE', '#5767ED', '#FFC61C', '#8497B0'];
                    var randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                    var confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.top = randomHeight + 'px';
                    confetti.style.right = randomWidth + 'px';
                    confetti.style.backgroundColor = randomColor;
                    confetti.style.transform='skew(15deg) rotate(' + randomRotation + 'deg)';
                    confetti.style.animationDelay=randomAnimationDelay + 's';
                    document.getElementById("glass").appendChild(confetti);
                }
                setTimeout(() => {
                    glass.classList.remove('fadeIn');
                    finalWinningResult.classList.add('fadeIn');
                    finalWinningResult.style.display = 'block';
                    setTimeout(() => {
                        finalWinningResult.classList.remove('fadeIn');
                        setTimeout(() => {
                            nav.style.display = 'flex';
                            document.body.style.overflowY = 'auto';
                            socket.emit('friendsAndFamilyWinner', [timerRef.current, state.gameCode, solution.current]);
                        }, 4000);
                    }, 400);
                }, 3000);
            }, 2000);
        } else {
            //Wrong Answer
            updateTabState('console');
            const consoleNotificationContainer = document.getElementById('consoleNotificationContainer');
            consoleNotificationContainer.style.display = 'flex';
            consoleNotificationContainer.classList.add('shaking');
            setTimeout(() => {
                consoleNotificationContainer.classList.remove('shaking');
            }, 500);
            setTimeout(() => {
                consoleNotificationContainer.classList.add('fadeOut');
                setTimeout(() => {
                    consoleNotificationContainer.style.display = 'none';
                    consoleNotificationContainer.classList.remove('fadeOut');
                }, 400);
            }, 3500);
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
        <AnimatedDiv>
            <div className="game">
                <div className="glass" id="glass">
                    <div className="finalWinningResult" id="finalWinningResult">
                        <h2>Congratulations!</h2>
                        <img src={finalWinningResultImg} alt="" />
                        <p>You actually go them all. Am suprised!</p> 
                        <h1><i class="fas fa-stopwatch"></i>: {timerRef.current}</h1>
                    </div>
                </div>
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
                                <p className="author"><a href="#" target="_blank">By: {state.question.madeBy}</a></p>
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
                                                <img id={`testCaseIconNum${index}`} src={testCaseIcon} alt=""/>
                                                <div>
                                                    <h4>Test Case</h4>
                                                    <p className="greyish">{(val.isOpen) ? 'Open' : 'Closed'}</p>
                                                </div>
                                            </div>
                                            <i class="fas fa-angle-down"></i>
                                        </div>
                                        <div className="testCaseContent">
                                            <h5>Input: {Object.keys(val.input).map(key => (
                                                <> <b>{key}: </b> {val.input[key]} </>
                                            ))}</h5>
                                            <h5>Output: {JSON.stringify(val.expectedOutput)}</h5>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className="gameNotificationSection" id="consoleNotificationContainer">
                                <img src={wrongAnswerIcon} alt="" />
                                <div>
                                    <h4>Idiot :(</h4>
                                    <p className="greyish">We're telling everyone</p>
                                </div>
                            </div>
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
        </AnimatedDiv>
    )
}