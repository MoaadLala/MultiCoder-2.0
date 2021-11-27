import './Login.css';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { useContext } from 'react';
import { User } from '../../App';

export default function Login() {
    const {user, setUser} = useContext(User);
    
    const googleAuth = () => {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider).then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user);
            setUser({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
            });
            console.log(token);
        }).catch((error) => {
            console.error(`An error has occured, Error Code: ${error.code}, Error Message: ${error.message}, Email of error causer: ${error.email}`);
        });
    }

    const facebookAuth = () => {
        const provider = new FacebookAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider).then((result) => {
            const user = result.user;
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;

            setUser({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
            });
            console.log(accessToken);
        })
    }

    const githubAuth = () => {
        const provider = new GithubAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider).then((result) => {
            const user = result.user;
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            setUser({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
            });
            console.log(token);
        })
    }

    return (
        <div className="Login">
            <div className="loginHeaders">
                <h1>Welcome to MultiCoder</h1>
                <p className="greyish">Login and start kicking!</p>
            </div>
            <div className="loginBtns">
                <button onClick={googleAuth} className="loginBtn--google"><i class="fab fa-google"></i>Google</button>
                <button onClick={facebookAuth} className="loginBtn--facebook"><i class="fab fa-facebook"></i>Facebook</button>
                <button onClick={githubAuth} className="loginBtn--github"><i class="fab fa-github"></i>Github</button>
            </div>
        </div>
    )
}