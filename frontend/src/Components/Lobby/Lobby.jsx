import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import './Lobby.css';

export default function Lobby(props) {
    const socket = props.socket;
    const { state } = useLocation();
    const [playersObj, setPlayersObj] = useState(state.playersObj);
    const roomCode = state.gameCode;
    useEffect(() => {
        socket.on('joinARoom', data => {
            if (data[0]) {
                setPlayersObj(JSON.parse(data[1]));
            }
        });
        
        return () => {
            socket.off('joinARoom');
        }
    }, []);
    console.log(playersObj);
    return (
        <div className="looby">
            <h2>Looby: {roomCode}</h2>
            <div className="lobbyPlayersContainer">
                {
                    Object.keys(playersObj).map(key => (
                        <div className="lobbyPlayer">
                            <img src={playersObj[key].photo} alt="" />
                            <h4 className="greyish">{playersObj[key].name} {(playersObj[key].admin) ? (<i class="fas fa-crown"></i>): null}</h4>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}