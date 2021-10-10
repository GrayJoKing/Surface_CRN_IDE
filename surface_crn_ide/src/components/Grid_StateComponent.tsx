import React from 'react';
import Surface_CRN, {Species_Matcher, Transition_Rule, Colour_Map, Colour} from 'surface_crn';
import Point from './PointClass';

import {ReactCanvasGrid, ColumnDef, DataRow, CellDef, CustomDrawCallbackMetadata, CellDataChangeEvent, cellHasTextFunction} from 'react-canvas-grid';

interface CRN_GridProps {
	model : Surface_CRN
}

interface CRN_GridState extends React.ComponentState {
	columns : ColumnDef[],
	data: Array<DataRow<string | null>>,
	colour_map : Colour_Map,
	grid_type : 'square'|'hex',
	offset : Point,
}

class CRN_GridComponent extends React.Component<CRN_GridProps, CRN_GridState> {
	
	constructor(props : CRN_GridProps) {
		super(props);
		let {model} = props;
		this.state = {
			columns : this.createCols(model.current_state),
			data : this.createData(model.current_state),
			colour_map : model.colour_map,
			grid_type : model.grid_type,
			offset : Point.origin
		};
	}
	
	render() {
		console.log('rendAll');
		// TODO: render "Initial State" over canvas?
		return <div className="panel state_panel">
					<h3> Initial State </h3>
					<ReactCanvasGrid<string | null>
						columns={this.state.columns}
						data={this.state.data}
						rowHeight={20}
						onCellDataChanged={this.onCellDataChanged}
					/>
				</div>
	}
	
	public updateColsAndData(current_state : string[][]) {
		this.setState({columns: this.createCols(current_state), data: this.createData(current_state)});
	}
	
	private createCols(current_state : string[][]) {
		let columns = [];
		let colNum = 0;
		if (current_state.length !== 0) {
			colNum = current_state[0].length;
		}
		columns.push({fieldName : 'addLeftCol', width: 20});
		for (let i = 0; i < colNum; i++) columns.push({fieldName : i.toString(), width: 20});
		columns.push({fieldName : 'addRightCol', width: 20});
		
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
							console.log('rend');
							if (cell.data !== null) {
								let colour = this.state.colour_map.find_colour(cell.data);
								if (colour == null) {
									colour = Colour.white;
								}
								context.fillStyle = 'rgb(' + colour.rgb().join(',') + ')';
								context.fillRect(cellBounds.left, cellBounds.top, cellBounds.width, cellBounds.height);
							}
						},
						renderText : (context: CanvasRenderingContext2D, cellBounds: ClientRect, cell: CellDef<string | null>) => {
							const text = cellHasTextFunction(cell) ? cell.getText(cell.data) : cell.text;
							
							if (text) {
								let colour = this.state.colour_map.find_colour(cell.data!);
								if (colour == null) {
									colour = Colour.white;
								}
								let [r,g,b] = colour.rgb();
								context.fillStyle = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'black' : 'white';
								context.fillText(text,cellBounds.left + 2,cellBounds.top + 10, cellBounds.width - 4);
							}
							/*
							context.strokeStyle= "black";
							context.fillStyle = "white";
							context.lineWidth = 0.5;
							context.fillText(text,cellBounds.left + 2,cellBounds.top + 10, cellBounds.width - 4);
							context.strokeText(text,cellBounds.left + 2,cellBounds.top + 10, cellBounds.width - 4);
							*/
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
		this.setState({
			data: this.state.data.map((row, i) => {
				if (i === event.rowIndex) {
					return {
						...row,
						[event.fieldName]: {
							...row[event.fieldName],
							data: event.newData,
						},
					};
				} else {
					return row;
				}
			}),
		});
	}
}

export default CRN_GridComponent