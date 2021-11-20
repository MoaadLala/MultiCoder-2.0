import './Game.css';
import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

export default function Game() {
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('question');
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
                        <h2>Question</h2>
                    </div>
                    <div className="tabBarView" id="console" style={{display: (activeTab === 'console') ? 'block' : 'none'}}>
                        <h2>Console</h2>
                    </div>
                    <div className="tabBarView" id="chat" style={{display: (activeTab === 'chat') ? 'block' : 'none'}}>
                        <h2>Chat</h2>
                    </div>
                </div>
                <div className="gameRightSide">
                <AceEditor
                    mode="javascript"
                    theme="monokai"
                    name="UNIQUE_ID_OF_DIV"
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