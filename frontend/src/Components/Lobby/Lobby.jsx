import { useLocation } from 'react-router';
import './Lobby.css';

export default function Lobby() {
    const { state } = useLocation();
    const roomCode = state.gameCode;
    return (
        <div className="looby">
            <h1>Looby</h1>
            <h2>Game Code: {roomCode}</h2>
        </div>
    )
}