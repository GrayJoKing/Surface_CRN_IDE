import React from 'react';
import {Colour_Map} from 'surface_crn';
import Point from './PointClass';

interface CRN_GridProps {
	current_state : string[][]
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	update_state : (x : number, y : number, s : string) => void
	size : number
	zoom : (b : boolean) => void
	sim_time : null | number
}

interface CRN_GridState extends React.ComponentState {
	//columns : ColumnDef[]
	data: string[][]
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	offset : Point
	size : number
	sim_time : null | number
	selected_cells : Point[]
}

class CRN_GridComponent extends React.Component<CRN_GridProps, CRN_GridState> {

	canvas : HTMLCanvasElement | null = null;
	mouseDown : boolean = false;
	mousePosition : Point | null = null;
	mouseMoved : boolean = false;

	constructor(props : CRN_GridProps) {
		super(props);
		this.state = {
			data : this.createData(props.current_state),
			colour_map : props.colour_map,
			geometry : props.geometry,
			offset : Point.origin,
			size : props.size,
			sim_time : props.sim_time,
			selected_cells : []
		};
	}

	render() {
		//console.log('rendAll');
		// TODO: figure out where to clear the temp colours
		//this.state.colour_map.clear_temp();
		// TODO: render "Initial State" and other information over canvas
		return <canvas
					ref={elem => this.canvas = elem}
				/>
	}

	componentDidMount() {
		// render all elements
		this.canvas!.addEventListener('wheel', this.scrollZoom.bind(this), {passive : false});
		this.canvas!.addEventListener('mousedown', this.mouseEvents.bind(this));
		this.canvas!.addEventListener('mouseup', this.mouseEvents.bind(this));
		this.canvas!.addEventListener('mousemove', this.mouseEvents.bind(this));
		this.canvas!.addEventListener('dblclick', this.mouseEvents.bind(this));
		this.draw();
	}

	mouseEvents(m : MouseEvent) {
		switch (m.type) {
			case "mousedown":
				this.mouseDown = true;
				this.mousePosition = new Point(m.x, m.y);
				break;
			case "mouseup":
				if (!this.mouseMoved) {
					const rect = this.canvas!.getBoundingClientRect();
					const xcoord = m.x - this.state.offset.x - rect.x;
					const ycoord = m.y - this.state.offset.y - rect.y;
					if (this.state.geometry === "square") {
						this.setState({selected_cells : [new Point(Math.floor(xcoord/this.state.size), Math.floor(ycoord/this.state.size))]});
					} else if (this.state.geometry === "hex") {

					}
				}
				this.mouseDown = false;
				this.mouseMoved = false;
				this.mousePosition = null;
				break;
			case "mousemove":
				if (this.mouseDown) {
					this.mouseMoved = true;
					this.setState({offset : this.state.offset.subtract(this.mousePosition!.subtract(this.mousePosition = new Point(m.x, m.y)))});
				}
				break;
			case "dblclick":
				const rect = this.canvas!.getBoundingClientRect();
				const xcoord = m.x - this.state.offset.x - rect.x;
				const ycoord = m.y - this.state.offset.y - rect.y;
				if (this.state.geometry === "square") {
					this.setState({selected_cells : [new Point(Math.floor(xcoord/this.state.size), Math.floor(ycoord/this.state.size))]});
				} else if (this.state.geometry === "hex") {
				}
				// Edit current cell
				break;
		}
	}

	componentDidUpdate(prevProps : CRN_GridProps, prevState : CRN_GridState) {
		if (prevState.geometry !== this.state.geometry
		|| !prevState.offset.equals(this.state.offset)
		|| prevState.size !== this.state.size
		|| prevState.colour_map !== this.state.colour_map) {
			this.draw();
			return;
		}
		if (prevProps !== this.props) {
			this.setState({
				data : this.createData(this.props.current_state),
				colour_map : this.props.colour_map,
				geometry : this.props.geometry,
				size : this.props.size,
				sim_time : this.props.sim_time,
				selected_cells : []
			});
			return;
		}
		let canvasRender = this.canvas!.getContext("2d");
		if (canvasRender === null || !(canvasRender instanceof CanvasRenderingContext2D)) return;
		const ctx : CanvasRenderingContext2D = canvasRender;
		let count = 0;

		for (let [y, row] of this.state.data.entries()) {
			for (let [x, val] of row.entries()) {
				if (prevState.data?.[y]?.[x] !== val) {
					this.drawCell(ctx, x, y, val) && count++;
				}
			}
		}
		this.addExtraDetail(ctx, prevState);
		console.log("updating", count, "cells");
	}

	scrollZoom(e : WheelEvent) {
		//TODO: zoom in on mouse location
		if (e.deltaY < 0) {
			this.props.zoom(true);
			e.preventDefault();
			this.draw();
		} else if (e.deltaY > 0) {
			this.props.zoom(false);
			e.preventDefault();
			this.draw();
		}
	}

	draw() {
		console.log("Rendering");
		if (this.canvas === null) return;
		const rect = (this.canvas.parentNode! as Element).getBoundingClientRect();
		this.canvas.width = Math.floor(rect.width * window.devicePixelRatio);
		this.canvas.height = Math.floor(rect.height * window.devicePixelRatio);
		this.canvas.style.width = Math.floor(rect.width-3.5) + 'px';
		this.canvas.style.height = Math.floor(rect.height-3.5) + 'px';
		const canvasRender = this.canvas.getContext("2d");
		if (canvasRender === null || !(canvasRender instanceof CanvasRenderingContext2D)) return;
		const ctx : CanvasRenderingContext2D = canvasRender;
		ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		ctx.translate(this.state.offset.x, this.state.offset.y);

		for (let [y, row] of this.state.data.entries()) {
			for (let [x, val] of row.entries()) {
				this.drawCell(ctx, x, y, val);
			}
		}
		this.addExtraDetail(ctx);
	}

	addExtraDetail(ctx : CanvasRenderingContext2D, prevState? : CRN_GridState) {

		if (this.state.sim_time !== null) {
			ctx.fillStyle = "#FFFFFF";
			let xcoord = ctx.canvas.width - 190 - this.state.offset.x;
			let ycoord = ctx.canvas.height - 80 - this.state.offset.y;
			ctx.fillRect(xcoord - 80, ycoord - 30, 80, 30);

			ctx.fillStyle = "#000000";
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.font = "15px Arial";
			ctx.fillText("T: "+this.state.sim_time.toFixed(2), xcoord - 80 + 4, ycoord - 30 + 15, 80);
		}
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1;
		console.log(prevState?.selected_cells);

		for (let z of [prevState, this.state]) {
			if (z !== undefined) {
				// TODO: properly clear previously selected cells
				for (let p of z.selected_cells) {
					console.log(p);
					if (z === prevState) {
						let colour = this.state.colour_map.find_colour(this.state.data[p.y][p.x]);
						if (colour == null) {
							colour = this.state.colour_map.new_colour();
							this.state.colour_map.add_temp(this.state.data[p.y][p.x], colour);
						}
						ctx.strokeStyle = 'rgb(' + colour.rgb().join(',') + ')';
						ctx.fillStyle = ctx.strokeStyle;
						console.log(colour);
					} else {
						ctx.strokeStyle = "#00CCFF";
						ctx.fillStyle = ctx.strokeStyle;
					}
					if (this.state.geometry === "square") {
						ctx.rect(p.x*this.state.size, p.y*this.state.size, this.state.size, this.state.size);
						ctx.stroke();
						if (z === prevState) {
							ctx.fill();
							this.drawCell(ctx, p.x, p.y, this.state.data[p.y][p.x]);
						}
						ctx.closePath();
					} else if (this.state.geometry === "hex") {
						let xcoord = (p.x + p.y%2/2 + 0.5)*this.state.size*Math.sin(2 * Math.PI/6)*2*0.75;
						let ycoord = (p.y + 0.5)*this.state.size*0.75*2*0.75;
						ctx.beginPath();
						for (var i = 0; i < 6; i++) {
							ctx.lineTo(xcoord + this.state.size * Math.sin(2 * Math.PI / 6 * i)*0.75, ycoord + this.state.size * Math.cos(2 * Math.PI / 6 * i)*0.75);
						}
						ctx.closePath();
						ctx.stroke();
					}
				}
			}
		}
	}

	createData(current_state : string[][]) {
		var data : string[][] = [];
		for (var [y, row] of current_state.entries()) {
			data[y] = [];
			for (var [x, elem] of row.entries()) {
				data[y][x] = elem;
			}
		}
		return data;
	}

	updateData(current_state : string[][]) {
		var data = this.createData(current_state);
		console.log("Updating Data");
		this.setState({data : data});
	}

	drawCell(ctx : CanvasRenderingContext2D, x : number, y : number, val : string) {
		console.log('drawing cell ',x,' ',y)
		let coord : Point;
		if (this.state.geometry === "square") {
			coord = new Point((x+0.5)*this.state.size, (y+0.5)*this.state.size);
		} else {
			coord = new Point(
				(x + y%2/2 + 0.5)*this.state.size*Math.sin(2 * Math.PI/6)*2*0.75,
				(y + 0.5)*this.state.size*0.75*2*0.75
			);
		}
		if (coord.x + this.state.offset.x > this.canvas!.width || coord.y + this.state.offset.y > this.canvas!.height) return false;
		if (coord.x + this.state.size + this.state.offset.x < 0 || coord.y + this.state.size + this.state.offset.y < 0) return false;

		let colour = this.state.colour_map.find_colour(val);
		if (colour == null) {
			colour = this.state.colour_map.new_colour();
			this.state.colour_map.add_temp(val, colour);
		}
		ctx.fillStyle = 'rgb(' + colour.rgb().join(',') + ')';
		ctx.strokeStyle = ctx.fillStyle;

		if (this.state.geometry === "square") {
			//ctx.clearRect(coord.x - this.state.size/2, coord.y - this.state.size/2, this.state.size, this.state.size);
			ctx.fillRect(coord.x - this.state.size/2, coord.y - this.state.size/2, this.state.size, this.state.size);
		} else if (this.state.geometry === "hex") {
			ctx.beginPath();
			for (var i = 0; i < 6; i++) {
				ctx.lineTo(coord.x + this.state.size * Math.sin(2 * Math.PI / 6 * i)*0.75, coord.y + this.state.size * Math.cos(2 * Math.PI / 6 * i)*0.75);
			}
			ctx.closePath();
			ctx.strokeStyle = ctx.fillStyle;
			ctx.stroke();
			ctx.fill();
		}

		if (this.state.size >= 12) {
			if (val) {
				let [r,g,b] = colour.rgb();
				ctx.fillStyle = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'black' : 'white';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = "11px Arial";
				ctx.fillText(val, coord.x, coord.y, this.state.size);
			}
		}
		return true;
	}

	/*
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
	*/
}

export default CRN_GridComponent
