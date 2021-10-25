import React from 'react';
import {FaPlay, FaStepBackward, FaStepForward} from 'react-icons/fa';

interface HeaderProps {
	playPressed : (_ : any) => void
	stepBackPressed : (_ : any) => void
	stepForwardPressed : (_ : any) => void
}

export default class HeaderComponent extends React.Component<HeaderProps> {
	
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
					(sim options)
				</h4>
				<h4 className="simulator_controls">
					<FaStepBackward onClick={this.props.stepBackPressed}/>
					<FaPlay onClick={this.props.playPressed}/>
					<FaStepForward onClick={this.props.stepForwardPressed}/>
				</h4>
			</nav>
		</header>;
	}
}