import './Home.css';
import { Link } from 'react-router-dom';
import homeHero from '../../assets/homeHero.png';
import homePro1 from '../../assets/homePro1.svg';
import homePro2 from '../../assets/homePro2.svg';
import homePro3 from '../../assets/homePro3.svg';
import homePro4 from '../../assets/homePro4.svg';
import homeGreySecitonImg from '../../assets/homeGreySection.svg';
import AnimatedDiv from "../AnimatedDiv/AnimatedDiv";


export default function Home() {
  return (
      <AnimatedDiv>
          <div className="home">
            <div className="homeHero">
                <div>
                    <h1>Fight to Earn your Place in a PVP Coding Competition</h1>
                    <Link to="play"><button className="flatBtn">Play</button></Link>
                </div>
                <img src={homeHero} alt="" />
            </div>
            <div className="homeRedSection">
                <h1>So, Who Are We?</h1>
                <p>
                    MultiCoder is an open-source, newbies-friendly platform where coders from all around the 
                    world can gather and show off there skills on each other (Not in a weird way), We provide
                    more than 4 game moods for you, so that you can pick the one that suits you, our goal
                    is to gamify the process of learning algorithms and data structures (subjects that alot of
                    coders aren’t very good at ) as much as possible
                </p>
            </div>
            <div className="homeWhyUsSection">
                <h1>Why Us?</h1>
                <div className="homeProsSection">
                    <div className="homePro">
                        <img src={homePro1} alt=""/>
                        <h3>Compete against your friends</h3>
                        <p className="greyish">
                            Am sure that you are eager to prove that your
                            code is better than your co-worker John’s code,
                            or maybe all of your co-workers? doesn’t matter
                            alone, with a friend, or a bunch of friends! totally
                            your choice
                        </p>
                    </div>
                    <div className="homePro">
                        <img src={homePro2} alt=""/>
                        <h3>From the Comunity to The Comunity</h3>
                        <p className="greyish">
                            MultiCoder Is an open source project, where
                            anyone could view, and suggest changes to
                            the code, also, anyone could add questions,
                            and provide better solutions to already existing
                            ones
                        </p>
                    </div>
                    <div className="homePro">
                        <img src={homePro3} alt=""/>
                        <h3>Everything is In-House</h3>
                        <p className="greyish">
                            Comes with an Editor, Compiler, and everthing
                            you need to win your battles
                        </p>
                    </div>
                    <div className="homePro">
                        <img src={homePro4} alt=""/>
                        <h3>Beautifully Designed Rating System</h3>
                        <p className="greyish">
                            We Make a great effort to make sure that you
                            don’t feel frustrated, or (which i doubt it) bored
                        </p>
                    </div>
                </div>
            </div>
            <div className="homeGreySection">
                <img src={homeGreySecitonImg} alt="" />
                <div>
                    <h1>Learn, Compete, and Win Prizes!</h1>
                    <p className="greyish">MultiCoder hosts competitions that are provided by you! the users, so you are more than welcome to compete in competitions, or create your own ones!</p>
                    <button className="flatBtn">Find Out More</button>
                </div>
            </div>
      </div>
      </AnimatedDiv>
  )
}