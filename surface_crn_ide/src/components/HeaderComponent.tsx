import React from 'react';
import {FaPlay, FaPause, FaStop, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward} from 'react-icons/fa';

interface HeaderProps {
	playPressed : (_ : any) => void
	stepBackPressed : (_ : any) => void
	stepForwardPressed : (_ : any) => void
	fastBackwardPressed : (_ : any) => void
	fastForwardPressed : (_ : any) => void
	stopPressed : (_ : any) => void
}

interface HeaderState {
	simPlaying : boolean
}

export default class HeaderComponent extends React.Component<HeaderProps, HeaderState> {
	
	constructor(p : HeaderProps) {
		super(p);
		this.state = {simPlaying : false};
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
					<FaStop size={25} onClick={this.props.stopPressed}/>
					<FaFastBackward size={25} onClick={this.props.fastBackwardPressed}/>
					<FaStepBackward size={25} onClick={this.props.stepBackPressed}/>
					{this.state.simPlaying
						? <FaPause size={25} onClick={this.props.playPressed}/>
						: <FaPlay size={25} onClick={this.props.playPressed}/>
					}
					<FaStepForward size={25} onClick={this.props.stepForwardPressed}/>
					<FaFastForward size={25} onClick={this.props.fastForwardPressed}/>
				</h4>
			</nav>
		</header>;
	}
}