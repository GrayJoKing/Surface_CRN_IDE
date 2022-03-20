import React from 'react';
import {FaPlay, FaPause, FaStop, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward} from 'react-icons/fa';

interface HeaderProps {
	playPressed : (_ : any) => void
	stepBackPressed : (_ : any) => void
	stepForwardPressed : (_ : any) => void
	fastBackwardPressed : (_ : any) => void
	fastForwardPressed : (_ : any) => void
	stopPressed : (_ : any) => void
	simPlaying : boolean
}

export default class HeaderComponent extends React.Component<HeaderProps, {}> {
	stopButton : Element | null = null;
	fastBackward : Element | null = null;
	stepBackward : Element | null = null;
	playButton : Element | null = null;
	stepForward : Element | null = null;
	fastForward : Element | null = null;

	constructor(p : HeaderProps) {
		super(p);
	}

	render() {
		return <header className="grid">
			<nav className="grid">
				<h2 className="grid title">
					Surface CRN Simulator
				</h2>
				<h4 className="grid simulator_options">
				</h4>
				<h4 className="simulator_controls">
					<span ref={e => this.stopButton = e}> <FaStop size={25}/> </span>
					<span ref={e => this.fastBackward = e}> <FaFastBackward size={25}/> </span>
					<span ref={e => this.stepBackward = e}> <FaStepBackward size={25}/> </span>
					<span ref={e => this.playButton = e}> {this.props.simPlaying
						? <FaPause size={25}/>
						: <FaPlay size={25}/>
					} </span>
					<span ref={e => this.stepForward = e}> <FaStepForward size={25}/> </span>
					<span ref={e => this.fastForward = e}> <FaFastForward size={25}/> </span>
				</h4>
			</nav>
		</header>;
	}

	componentDidMount() {
		this.stopButton!.addEventListener('click', this.props.stopPressed, {passive : false});
		this.stepBackward!.addEventListener('click', this.props.stepBackPressed, {passive : false});
		this.stepForward!.addEventListener('click', this.props.stepForwardPressed, {passive : false});
		this.fastBackward!.addEventListener('click', this.props.fastBackwardPressed, {passive : false});
		this.fastForward!.addEventListener('click', this.props.fastForwardPressed, {passive : false});
		this.playButton!.addEventListener('click', this.props.playPressed, {passive : false});
	}
}
