import React from 'react';

export default class HeaderComponent extends React.Component {
	render() {
		return <header className="grid">
			<nav className="grid">
				<h2 className="grid title">
					Surface CRN Simulator
				</h2>
				<h4 className="grid simulator_options">
					(sim options)
				</h4>
				<h4 className="grid simulator_controls">
					(sim controls)
				</h4>
			</nav>
		</header>;
	}
}