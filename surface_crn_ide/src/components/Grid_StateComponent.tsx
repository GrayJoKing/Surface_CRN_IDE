import React from 'react';
import Surface_CRN, {Species_Matcher, Transition_Rule, Colour_Map, Colour} from 'surface_crn';
import Point from './PointClass';

import {ReactCanvasGrid, ColumnDef, DataRow, CellDef, CustomDrawCallbackMetadata, CellDataChangeEvent, cellHasTextFunction, SelectRange, repeatSelectionIntoFill, AutofillContext} from 'react-canvas-grid';

interface CRN_GridProps {
	current_state : string[][]
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	update_state : (x : number, y : number, s : string) => void
	size : number
}

interface CRN_GridState extends React.ComponentState {
	columns : ColumnDef[]
	data: Array<DataRow<string | null>>
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	offset : Point
	size : number
}

class CRN_GridComponent extends React.Component<CRN_GridProps, CRN_GridState> {
	
	constructor(props : CRN_GridProps) {
		super(props);
		let {current_state, colour_map, geometry} = props;
		this.state = {
			columns : this.createCols(current_state, props.size),
			data : this.createData(current_state),
			colour_map : colour_map,
			geometry : geometry,
			offset : Point.origin,
			size : props.size,
		};
	}
	
	render() {
		//console.log('rendAll');
		// TODO: figure out where to clear the temp colours
		//this.state.colour_map.clear_temp();
		// TODO: render "Initial State" and other information over canvas
		return <ReactCanvasGrid<string | null>
					columns={this.state.columns}
					data={this.state.data}
					rowHeight={this.state.size}
					onCellDataChanged={this.onCellDataChanged}
					shouldAllowAutofill={_ => true}
					onAutofill={this.onAutofill}
				/>
	}
	
	private onAutofill = (selectRange: SelectRange, fillRange: SelectRange) => {
		const data = repeatSelectionIntoFill(
			selectRange,
			fillRange,
			this.state.data,
			this.state.columns,
			this.autofillCell,
		);
		this.setState({data});
	}
	
	private autofillCell(context: AutofillContext<string | null>): CellDef<string | null> {
		return {
			...context.destCellDef,
			data: context.srcCellDef.data,
		};
	}
	
	public updateColsAndData(current_state : string[][]) {
		this.setState({columns: this.createCols(current_state), data: this.createData(current_state)});
	}
	
	private createCols(current_state : string[][], size? : number) {
		let columns = [];
		let colNum = 0;
		if (current_state.length !== 0) {
			colNum = current_state[0].length;
		}
		columns.push({fieldName : 'addLeftCol', width: size || this.state.size});
		for (let i = 0; i < colNum; i++) columns.push({fieldName : i.toString(), width: size || this.state.size});
		columns.push({fieldName : 'addRightCol', width: size || this.state.size});
		
		return columns;
	}
	
	private createData(current_state : string[][]) {
		let data : Array<DataRow<string | null>> = [];
		for (let i = -1; i <= current_state.length; i++) {
			let row : DataRow<string | null> = {};
			if (i !== -1 && i !== current_state.length) {
				for (let j = 0; j < current_state[0].length; j++) {
					row[j.toString()] = {
						data: current_state[i][j],
						getText: (x : string|null) => x ? x : '',
						renderBackground: (context : CanvasRenderingContext2D, cellBounds : ClientRect, cell : CellDef<string | null>, metadata : CustomDrawCallbackMetadata) => {
							if (cell.data !== null) {
								let colour = this.state.colour_map.find_colour(cell.data);
								if (colour == null) {
									let s : string = this.state.colour_map.new_colour();
									colour = new Colour(s);
									this.state.colour_map.add_temp(cell.data!, colour);
								}
								context.fillStyle = 'rgb(' + colour.rgb().join(',') + ')';
								context.fillRect(cellBounds.left, cellBounds.top, cellBounds.width, cellBounds.height);
							}
						},
						renderText : (context: CanvasRenderingContext2D, cellBounds: ClientRect, cell: CellDef<string | null>) => {
							if (this.state.size >= 10) {
								const text = cellHasTextFunction(cell) ? cell.getText(cell.data) : cell.text;
								
								if (text) {
									let colour : Colour | null = this.state.colour_map.find_colour(cell.data!);
									if (colour == null) {
										let s : string = this.state.colour_map.new_colour();
										colour = new Colour(s);
										this.state.colour_map.add_temp(cell.data!, colour);
										console.log(cell.data, colour)
									}
									let [r,g,b] = colour.rgb();
									context.fillStyle = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'black' : 'white';
									context.fillText(text,cellBounds.left + 2,cellBounds.top + 10, cellBounds.width - 4);
								}
							}
						},
						editor: {
							serialise: (x : string|null) => x ? x : '',
							deserialise: (text: string, prev : string|null) => {
								text = text.trim();
								if (text.match(/^\w+$/)) {
									return text;
								} else {
									return prev;
								}
							},
						},
					};
				}
			} else {
				if (current_state.length != 0) {
					for (let j = 0; j < current_state[0].length; j++) {
						row[j.toString()] = {data: null, text : '', renderBackground : () => 1};
					}
				}
			}
			row['addLeftCol'] = {data: null, text : '', renderBackground : () => 1};
			row['addRightCol'] = {data: null, text : '', renderBackground : () => 1};
			data.push(row);
		}
		return data;
	}
	
	private onCellDataChanged = (event: CellDataChangeEvent<string | null>) => {
		this.props.update_state(event.rowIndex-1, event.colIndex-1, event.newData!);
	}
}

export default CRN_GridComponent