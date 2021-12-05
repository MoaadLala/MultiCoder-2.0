import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import './Lobby.css';
import { User } from '../../App';

export default function Lobby(props) {
    const { user } = useContext(User);
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
                socket.emit('leaveRoom', data);
                navigate('/play', {state: { kicked: true }});
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
            navigate('/game', { state: { gameCode: roomCode, question: data } });
        });

        socket.on('friendsAndFamilyWinnerNotify', (data) => {
            //data[0]: name
            //data[1]: time
            //data[2]: newPlayersObject (string)
            console.log(`${data[0]} has Won! his timescore is ${data[1]}, and this object came along: ${data[2]}`);
            showNotificationSection(`<b>${data[0]}</b> has Won! his timescore is ${data[1]}`, '#528a08');
            setPlayersObj(JSON.parse(data[2]));
        });

        socket.on('friendsAndFamilyLoserNotify', (data) => {
            //data: name
            showNotificationSection(`<b>${data}</b> submitted a broken code, what a loser`, '#9A1C0C');
        });

        setIsLoading(false);
        
        return () => {
            socket.off('joinARoom');
            socket.off('kicked');
            socket.off('kickUser');
            socket.off('startFriendsAndFamily');
            socket.off('friendsAndFamilyWinnerNotify');
            socket.off('friendsAndFamilyLoserNotify');
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
    
    console.log(playersObj);

    if (isLoading) {
        return (
            <h1>Loading</h1>
        )
    }
    
    return (
        <div className="lobby">
            <h2 className="lobbyHeader">Lobby: {roomCode}  <i class="fas fa-circle liveIndicator" style={{display: (playersObj.closed) ? 'block' : 'none'}}></i></h2>
            <i className="greyish" style={{display: (playersObj.closed) ? 'block' : 'none'}}>some players have already started the game,<br /> you will join on the next round</i>
            <div className="warning" id="lobbyWarning"></div>
            <div className="lobbyPlayersContainer">
                {
                    Object.keys(playersObj['players']).map(key => (
                        <div className="lobbyPlayer">
                            <div className="lobbyPlayerDescription">
                                <img src={playersObj['players'][key].photo} alt="" />
                                <h4>{playersObj['players'][key].name} {(playersObj['players'][key].admin) ? (<i class="fas fa-crown"></i>) : null}</h4>
                            </div>
                                {
                                    (playersObj['players'][key].timeScore !== 0) ? (
                                        <span className="winnerTimeScore">{playersObj['players'][key].timeScore}</span>
                                    ) : null
                                }
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
                        <div className="lobbyPlayer">
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
                <div className="gameNotificationSection" id="lobbyNotificationContainer"></div>
            </div>
            {
                (user.admin && !playersObj.closed) ? (
                    <button className="flatBtn" onClick={startGame}> Start </button>
                ) : null
            }
        </div>
    )
}