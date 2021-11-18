import './Play.css';
import createRoom from '../../assets/createRoom.svg';
import joinRoom from '../../assets/joinRoom.svg';
import friendsFamily from '../../assets/friends&family.png';

export default function Play(props) {
    const socket = props.socket;

    const showCreateRoom = () => {
        const joinWays = document.querySelector('.playJoinWays');
        const createRoomContainer = document.querySelector('.createARoom');
        joinWays.classList.add('fadeOut');
        setTimeout(() => {
            joinWays.classList.remove('fadeOut');
            joinWays.style.display = 'none';
            createRoomContainer.classList.add('fadeIn');
            createRoomContainer.style.display = 'block';
            setTimeout(() => {
                createRoomContainer.classList.remove('fadeIn');
            }, 400);
        }, 400);
    }

    const showJoinRoom = () => {
        const joinWays = document.querySelector('.playJoinWays');
        const joinRoomContainer = document.querySelector('.joinARoomContainer');
        joinWays.classList.add('fadeOut');
        setTimeout(() => {
            joinWays.classList.remove('fadeOut');
            joinWays.style.display = 'none';
            joinRoomContainer.classList.add('fadeIn');
            joinRoomContainer.style.display = 'block';
            setTimeout(() => {
                joinRoomContainer.classList.remove('fadeIn');
            }, 400);
        }, 400);
    }

    const hideCreateARoom = () => {
        const joinWays = document.querySelector('.playJoinWays');
        const createRoomContainer = document.querySelector('.createARoom');
        createRoomContainer.classList.add('fadeOut');
        setTimeout(() => {
            createRoomContainer.classList.remove('fadeOut');
            createRoomContainer.style.display = 'none';
            joinWays.classList.add('fadeIn');
            joinWays.style.display = 'flex';
            setTimeout(() => {
                joinWays.classList.remove('fadeIn');
            }, 400);
        }, 400);
    }

    const hideJoinARoom = () => {
        const joinWays = document.querySelector('.playJoinWays');
        const joinRoomContainer = document.querySelector('.joinARoomContainer');
        joinRoomContainer.classList.add('fadeOut');
        setTimeout(() => {
            joinRoomContainer.classList.remove('fadeOut');
            joinRoomContainer.style.display = 'none';
            joinWays.classList.add('fadeIn');
            joinWays.style.display = 'flex';
            setTimeout(() => {
                joinWays.classList.remove('fadeIn');
            }, 400);
        }, 400);
    }

    return (
        <div className="play">
            <h1>Welcome to the Arena</h1>
            <p className="greyish">Choose your way of joining</p>
            <div className="playJoinWays">
                <div className="joinWay" onClick={showCreateRoom}>
                    <img src={createRoom} alt="" />
                    <h3>Create a Room</h3>
                    <p className="greyish">
                        Be the boss, choose the game mode, and
                        orginaze the whole thing
                    </p>
                </div>
                <div className="joinWay" onClick={showJoinRoom}>
                    <img src={joinRoom} alt="" />
                    <h3>Join a Room</h3>
                    <p className="greyish">
                        let the boring stuff to the boring people,
                        copy, paste, and let’s goo! 
                    </p>
                </div>
            </div>
            <div className="createARoom">
                <div className="gameMode">
                    <img src={friendsFamily} alt="" />
                    <div>
                        <h3>Friends & Family</h3>
                        <p className="greyish">As Many As You  Like! (20 Tops)</p>
                    </div>
                </div>
                <button className="flatBtn" onClick={hideCreateARoom}>Back</button>
            </div>
            <div className="joinARoomContainer">
                <div className="joinARoom">
                    <button className="closeJoinARoom" onClick={hideJoinARoom}><i class="fas fa-times"></i></button>
                    <h3>Enter the room's code:</h3>
                    <div className="inputBox">
                        <input type="text" placeholder="XXXXX-XXXXX-XXXXX" />
                    </div>
                    <button className="flatBtn" onClick={() => {socket.emit('joinBtn', null)}}>Join</button>
                </div>
            </div>
        </div>
    )
}