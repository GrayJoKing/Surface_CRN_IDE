import React from 'react';

import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';

interface ImportProps {
	import_code : () => Promise<void>
	export_code : () => void
	import_example : (s : string) => void
}

interface ImportState {
	example_selected : string
}

export class ImportExportComponent extends React.Component<ImportProps, ImportState> {

	public constructor(props: ImportProps) {
		super(props);
		this.state = {example_selected : ""}
	}


	render () {
		const example_files = [
			{ value: './examples/two-bit-adder.txt', label: 'Two Bit Adder' },
			{ value: './examples/two-bit-adder_new.txt', label: 'Two Bit Adder New' },
			{ value: './examples/alternate_line_builder.txt', label: 'Line Builder' },
			{ value: './examples/Brusselator.txt', label: 'Brusselator' },
			{ value: './examples/busy_beaver.txt', label: 'Busy Beaver' },
			{ value: './examples/ertl.txt', label: 'Ertl Oscillator' },
			{ value: './examples/game_of_life_5x5_circuit.txt', label: 'GoL Five by Five' },
			{ value: './examples/game_of_life_one_to_one.txt', label: 'GoL One to One' },
			{ value: './examples/GH_big_spiral.txt', label: 'Greenberg-Hastings Big spiral' },
			{ value: './examples/majority_asynchronous.txt', label: 'Majority Asynchronous' },
			{ value: './examples/molecular_walker.txt', label: 'Molecular Walker' },
			{ value: './examples/parens_matcher.txt', label: 'Parens Matcher' },
			{ value: './examples/sierpinski_1D_synch.txt', label: '1D Sierpinski' },
			{ value: './examples/smarter_scout_ant.txt', label: 'Smarter Scout Ant' }
		]

		return <Grid item xs={12} sm={4}>
				<Card sx={{height : "100%"}}>
					<CardHeader title="Import/Export" />

					<Grid container>
						<Grid item xs={12} sm={8}>
							<FormControl fullWidth>
								<InputLabel id="example-label">Example</InputLabel>
								<Select label="example-label" value={this.state.example_selected} onChange={ (e : SelectChangeEvent<string>) => this.setState({example_selected : e.target.value})} autoWidth>
									{example_files.map(a => <MenuItem value={a.value}> {a.label} </MenuItem>)}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Button variant="contained" disabled={this.state.example_selected === ""} type="submit" id="import_example" onClick={() => this.props.import_example(this.state.example_selected)}> Import </Button>
						</Grid>
					</Grid>

					<CardActions>
						<Button variant="contained" component="label">
							Import File(s)
							<input type="file" id="import_input" multiple hidden onChange={this.props.import_code}/>
						</Button>
						<Button variant="contained" id="export" onClick={this.props.export_code}> Export File </Button>
					</CardActions>
				</Card>
			</Grid>;
	}
}

export default ImportExportComponent;
