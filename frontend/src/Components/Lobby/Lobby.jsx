import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import './Lobby.css';
import { User } from '../../App';
import winnerIcon from '../../assets/winnerIcon.svg';
import loserIcon from '../../assets/loserIcon.svg';
import AnimatedDiv from '../AnimatedDiv/AnimatedDiv';

export default function Lobby(props) {
    const { user, setUser } = useContext(User);
    const socket = props.socket;
    const { state } = useLocation();
    const [playersObj, setPlayersObj] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const roomCode = state.gameCode;
    const navigate = useNavigate();

    const showWarning = (msg) => {
        const warningContainer = document.getElementById('lobbyWarning');
        warningContainer.innerText = msg;
        warningContainer.classList.add('fadeIn');
        warningContainer.style.display = 'block';
        setTimeout(() => {
            warningContainer.classList.remove('fadeIn');
            setTimeout(() => {
                warningContainer.classList.add('fadeOut');
                setTimeout(() => {
                    warningContainer.style.display = 'none';
                    warningContainer.classList.remove('fadeOut');
                    warningContainer.innerHTML = '';
                }, 400);
            }, 5000);
        }, 400);
    }
    
    useEffect(() => {
        setPlayersObj(state.playersObj);
        
        socket.on('joinARoom', data => {
            if (data[0]) {
                setPlayersObj(JSON.parse(data[1]));
                console.log(`join happend, current object: ` + JSON.parse(data[1]));
            }
        });

        socket.on('kicked', (data) => {
                socket.emit('leaveRoom', [data, true]);
                navigate('/play', {state: { kicked: true }});
        });

        socket.on('leaveMove', (data) => {
            //data[0]: userId
            //data[1]: RoomsObject
            let obj = JSON.parse(data[1]);
            if (obj['players'][data[0]]) {
                showWarning(`${obj['players'][data[0]].name} left the game.`);
                delete obj['players'][data[0]];
                setPlayersObj(obj);
            } else if (obj['spectators'][data[0]]) {
                showWarning(`${obj['spectators'][data[0]].name} left the game.`);
                delete obj['spectators'][data[0]];
                setPlayersObj(obj);
            } else {
                showWarning(`${obj['winners'][data[0]].name} left the game.`);
                delete obj['winners'][data[0]];
                setPlayersObj(obj);
            }
        });

        socket.on('kickMove', (data) => {
            // data[0]: userId
            // data[1]: new players object
            let obj = JSON.parse(data[1]);
            console.log(obj);
            showWarning(`${obj['players'][data[0]].name} has been kicked by the room's leader`);
            delete obj['players'][data[0]];
            setPlayersObj(obj);
        });

        socket.on('startFriendsAndFamily', (data) => {
            navigate('/game', { state: { gameCode: roomCode, question: JSON.parse(data), isSpectator: false } });
        });

        socket.on('friendsAndFamilyWinnerNotify', (data) => {
            //data[0]: name
            //data[1]: time
            //data[2]: newPlayersObject (string)
            console.log(`${data[0]} has Won! his timescore is ${data[1]}, and this object came along: ${data[2]}`);
            showNotificationSection(`<img src=${winnerIcon} alt="" /><p><b>${data[0]}</b> has Won! his timescore is ${data[1]}</p>`, '#528a08');
            setPlayersObj(JSON.parse(data[2]));
        });

        socket.on('friendsAndFamilyLoserNotify', (data) => {
            //data: name
            showNotificationSection(`<img src=${loserIcon} alt="" /><p><b>${data}</b> submitted a broken code, what a loser</p>`, '#9A1C0C');
        });

        socket.on('friendsAndFamilyGameRestarted', (data) => {
            //data: playersObject (string)
            setPlayersObj(JSON.parse(data));
        });

        socket.on('newAdmin', () => {
            setUser({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                admin: true,
            });
        });

        setIsLoading(false);
        
        return () => {
            socket.off('joinARoom');
            socket.off('kicked');
            socket.off('kickUser');
            socket.off('startFriendsAndFamily');
            socket.off('friendsAndFamilyWinnerNotify');
            socket.off('friendsAndFamilyLoserNotify');
            socket.off('newAdmin');
        }
    }, []);

    const kickUser = userId => {
        console.log(userId);
        console.log(`About to send the kick order, current players object: ${JSON.stringify(playersObj)}`);
        socket.emit('kickUser', [userId, roomCode]);
    }

    const startGame = () => {
        socket.emit('startFriendsAndFamily', roomCode);
    }

    const restartGame = () => {
        socket.emit('restartFriendsAndFamilyGame', roomCode);
    }

    const showNotificationSection = (msg, color) => {
        const notificationSection = document.getElementById('lobbyNotificationContainer');
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

    const unban = key => {
        socket.emit('unban', [key, roomCode]);
        socket.on('unban', data => {
            //data = new room object
            setPlayersObj(JSON.parse(data));
        });
    }

    const leaveGame = () => {
        socket.emit('leaveRoom', [roomCode, false]);
        navigate('/play', {state: { kicked: false }});
    }

    const spectate = key => {
        socket.emit('spectate', [roomCode, key]);
        socket.on('spectate', data => {
            //data[0]: question
            //data[1]: timer
            navigate('/game', { state: { gameCode: roomCode, question: JSON.parse(data[0]), isSpectator: true, isView: false, timer: data[1] } });
        });
    }

    const view = key => {
        socket.emit('view', [roomCode, key]);
        socket.on('view', data => {
            //data[0]: question
            //data[1]: code
            navigate('/game', { state: { gameCode: roomCode, question: JSON.parse(data[0]), isSpectator: false, isView: true, code: data[1]} });
        });
    }

    console.log(playersObj);

    if (isLoading) {
        return (
            <h1>Loading</h1>
        )
    }
    
    return (
        <AnimatedDiv>
            <div className="lobby">
                <h2 className="lobbyHeader">Lobby: {roomCode}  <i class="fas fa-circle liveIndicator" style={{display: (playersObj.closed) ? 'block' : 'none'}}></i></h2>
                <i className="greyish" style={{display: (playersObj.closed) ? 'block' : 'none'}}>some players have already started the game,<br /> you will join on the next round</i>
                <div className="warning" id="lobbyWarning"></div>
                <div className="lobbyPlayersContainer">
                    {
                        (Object.keys(playersObj['winners']).length > 0) ? 
                        Object.keys(playersObj['winners']).map(key => (
                            <div className="lobbyPlayer" onClick={() => view(key)}>
                                <div className="lobbyPlayerDescription">
                                    <img className="winnerColor" src={playersObj['winners'][key].photo} alt="" />
                                    <h4 className="winnerColor">{playersObj['winners'][key].name} {(playersObj['winners'][key].admin) ? (<i class="fas fa-crown"></i>) : null}</h4>
                                </div>
                                    {
                                        (user.admin && !playersObj['winners'][key].admin && !playersObj.closed) ? (
                                            <button onClick={() => kickUser(key)} className="kickBtn"><i class="fas fa-door-open"></i></button>
                                        ) : null
                                    }
                                    <span className="winnerColor">{playersObj['winners'][key].timeScore}</span>
                            </div>
                        )) : null
                    }
                    {
                        Object.keys(playersObj['players']).map(key => (
                            <div className="lobbyPlayer" onClick={() => spectate(key)}>
                                <div className="lobbyPlayerDescription">
                                    <img src={playersObj['players'][key].photo} alt="" />
                                    <h4>{playersObj['players'][key].name} {(playersObj['players'][key].admin) ? (<i class="fas fa-crown"></i>) : null}</h4>
                                </div>
                                    {
                                        (user.admin && !playersObj['players'][key].admin && !playersObj.closed) ? (
                                            <button onClick={() => kickUser(key)} className="kickBtn"><i class="fas fa-door-open"></i></button>
                                        ) : null
                                    }
                            </div>
                        ))
                    }
                    {
                        Object.keys(playersObj['spectators']).map(key => (
                            <div className="lobbyPlayer" style={{cursor: 'default'}}>
                                <div className="lobbyPlayerDescription">
                                    <img src={playersObj['spectators'][key].photo} alt="" />
                                    <h4>{playersObj['spectators'][key].name} {(playersObj['spectators'][key].admin) ? (<i class="fas fa-crown"></i>): null}</h4>
                                </div>
                                {
                                    (user.admin && !playersObj['spectators'][key].admin && !playersObj.closed) ? (
                                        <button onClick={() => kickUser(key)} className="kickBtn"><i class="fas fa-door-open"></i></button>
                                    ) : null
                                }
                            </div>
                        ))
                    }
                    {
                        (user.admin) ? 
                        Object.keys(playersObj['kicked']).map(key => (
                            <div className="lobbyPlayer" style={{opacity: .7}}>
                                <div className="lobbyPlayerDescription">
                                    <img src={playersObj['kicked'][key].photo} alt="" />
                                    <h4>{playersObj['kicked'][key].name}</h4>
                                </div>
                                {
                                    (user.admin && !playersObj['kicked'][key].admin) ? (
                                        <button onClick={() => unban(key)} className="kickBtn"><i class="fas fa-times"></i></button>
                                    ) : null
                                }
                            </div>
                        )) : null
                    }
                    <div className="gameNotificationSection" id="lobbyNotificationContainer"></div>
                </div>
                {
                    (user.admin && !playersObj.closed) ? (
                        <button className="flatBtn" onClick={startGame} style={{display: 'block', margin: '1em auto'}}> Start </button>
                    ) : (user.admin && playersObj.closed && Object.keys(playersObj['players']).length === 0) ? (
                        <button className="flatBtn" onClick={restartGame} style={{display: 'block', margin: '1em auto'}}> Go Again? </button>
                    ) : null
                }
                <button className="flatBtn" onClick={leaveGame} style={{display: 'block', margin: '1em auto'}}>Leave game</button>
            </div>
        </AnimatedDiv>
    )
}