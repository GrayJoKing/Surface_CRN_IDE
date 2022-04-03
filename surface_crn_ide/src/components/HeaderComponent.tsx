import React from 'react';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import ForwardIcon from "@mui/icons-material/Forward10";
import ReplayIcon from "@mui/icons-material/Replay10";
import StopIcon from "@mui/icons-material/Stop";
import IconButton from "@mui/material/IconButton";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

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

	render() {
		return <Grid item container xs={12}>
			<Grid item xs={12} sm={8}>
				<Typography variant="h3" className="grid title">
					Surface CRN Simulator
				</Typography>
			</Grid>
			<Grid item xs={12} sm={4}>
				<IconButton onClick={this.props.stopPressed}> <StopIcon sx={{fontSize : 40}} /> </IconButton>
				<IconButton onClick={this.props.fastBackwardPressed}> <ReplayIcon sx={{fontSize : 40}} /> </IconButton>
				<IconButton onClick={this.props.stepBackPressed}> <FastRewindIcon sx={{fontSize : 40}} /> </IconButton>
				<IconButton onClick={this.props.playPressed}>
					{this.props.simPlaying
						? <PauseIcon sx={{fontSize : 40}} />
						: <PlayArrowIcon sx={{fontSize : 40}} />
					}
				</IconButton>
				<IconButton onClick={this.props.stepForwardPressed}> <FastForwardIcon sx={{fontSize : 40}} /> </IconButton>
				<IconButton onClick={this.props.fastForwardPressed}> <ForwardIcon sx={{fontSize : 40}} /> </IconButton>
			</Grid>
		</Grid>;
	}
}
