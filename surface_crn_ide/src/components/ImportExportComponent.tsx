import React from 'react';
import Select, {SingleValue, ActionMeta} from 'react-select'

interface ImportProps {
	import_code : () => Promise<void>
	export_code : () => void
	import_example : (s : string | null) => void
}

interface ImportState {
	example_selected : string | null
}

export class ImportExportComponent extends React.Component<ImportProps, ImportState> {
	
	public constructor(props: ImportProps) {
		super(props);
		this.state = {example_selected : ""}
	}
	
	
	render () {
		const example_files = [
			{ value: './examples/two-bit-adder.txt', label: 'Two Bit Adder' },
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
		
		return <div className="grid panel import_export_panel">
				<h3> Import/Export </h3>
				<div>
					<Select options={example_files} isSearchable={true} isClearable={true} onChange={(newValue: SingleValue<{ value: string; label: string; }>, actionMeta: ActionMeta<{ value: string; label: string; }>) => this.setState({example_selected : newValue && newValue.value})} styles={{option : (provided, state) => ({...provided, color: 'black'})}} />
					<button disabled={this.state.example_selected === ""} type="submit" id="import_example" onClick={() => this.props.import_example(this.state.example_selected)}> Import Example </button>
				</div>
				<div>
					<input type="file" id="import_input" multiple />
					<button type="submit" id="import_submit" onClick={this.props.import_code}> Import </button>
				</div>
				<div>
					<button id="export" onClick={this.props.export_code}> Export </button>
				</div>
			</div>;
	}
}

export default ImportExportComponent;