import React from 'react';
import {Colour_Map, Colour} from 'surface_crn';
import Point from './PointClass';

interface GridDisplayProps {
	current_state : string[][]
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	size : number
	zoom : (b : boolean) => number
	selectedCells : (s : Point[], val : string) => void
	sim_time : null | number
}

interface GridDisplayState extends React.ComponentState {
	//columns : ColumnDef[]
	data: string[][]
	colour_map : Colour_Map
	geometry : 'square'|'hex'
	offset : Point
	size : number
	sim_time : null | number
	selected_cells : Point[]
}

class GridDisplayComponent extends React.Component<GridDisplayProps, GridDisplayState> {

	canvas : HTMLCanvasElement | null = null;
	mouseDown : boolean = false;
	mousePosition : Point | null = null;
	mouseMoved : boolean = false;

	constructor(props : GridDisplayProps) {
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
		this.canvas!.addEventListener('mouseenter', this.mouseEvents.bind(this));
		this.canvas!.addEventListener('mouseleave', this.mouseEvents.bind(this));
		this.draw();
	}

	hexCoord(xcoord : number, ycoord : number) {

		let gridHeight = (0.75+0.375)*this.state.size;
		let gridWidth = this.state.size * Math.sin(2 * Math.PI/6)*2*0.75;
		let c = (0.75-0.375)*this.state.size;
		let m = c/(gridWidth/2);

		// Find the row and column of the box that the point falls in.
		let row = Math.floor((ycoord+c/2) / gridHeight);
		let column;

		let rowIsOdd = (row & 1) === 1;

		// Is the row an odd number?
		if (rowIsOdd)// Yes: Offset x to match the indent of the row
			column = Math.floor((xcoord - gridWidth/2) / gridWidth);
		else// No: Calculate normally
			column = Math.floor(xcoord / gridWidth);


		// Work out the position of the point relative to the box it is in
		let relY = (ycoord+c/2) - (row * gridHeight);
		let relX;

		if (rowIsOdd)
			relX = (xcoord - (column * gridWidth)) - gridWidth/2;
		else
			relX = xcoord - (column * gridWidth);

		// Work out if the point is above either of the hexagon's top edges
		if (relY < (-m * relX) + c) // LEFT edge
			{
				row--;
				if (!rowIsOdd)
					column--;
			}
		else if (relY < (m * relX) - c) // RIGHT edge
			{
				row--;
				if (rowIsOdd)
					column++;
			}
		return [column, row];
	}

	mouseEvents(m : MouseEvent) {
		switch (m.type) {
			case "mousedown":
				this.mouseDown = true;
				this.mousePosition = new Point(m.x, m.y);
				break;
			case "mouseenter":
			case "mouseleave":
			case "mouseup":
				if (this.mouseDown && !this.mouseMoved) {
					const rect = this.canvas!.getBoundingClientRect();
					const xcoord = m.x - this.state.offset.x - rect.x;
					const ycoord = m.y - this.state.offset.y - rect.y;
					if (this.state.geometry === "square") {
						this.setState({selected_cells : [new Point(Math.floor(xcoord/this.state.size), Math.floor(ycoord/this.state.size))]});
					} else if (this.state.geometry === "hex") {

						/*
						// Some debugging for hitboxes
						let canvasRender = this.canvas!.getContext("2d");
						if (canvasRender === null || !(canvasRender instanceof CanvasRenderingContext2D)) return;
						const ctx : CanvasRenderingContext2D = canvasRender;

						for (let a = xcoord - 200; a < xcoord + 200; a+=1) {
							for (let b = ycoord - 200; b < ycoord + 200; b+=1) {
								let [column, row] = this.hexCoord(a, b);
								ctx.fillStyle = "rgb(" + (((column*40)%256+256)%256) + "," + (((row*40)%256+256)%256) + ",0)";
								ctx.fillRect(a, b, 1, 1);
							}
						}
						*/

						let [column, row] = this.hexCoord(xcoord, ycoord);
						this.setState({selected_cells : [new Point(Math.floor(column), Math.floor(row))]});
					}
				}
				this.mouseDown = false;
				this.mouseMoved = false;
				this.mousePosition = null;
				break;
			case "mousemove":
				if (this.mouseDown) {
					let offset = this.mousePosition!.subtract(new Point(m.x, m.y));
					// Add a bit of give before registering a pan
					if (this.mouseMoved || offset.magnitude() > 5) {
						this.mousePosition = new Point(m.x, m.y);
						this.mouseMoved = true;
						this.setState({offset : this.state.offset.subtract(offset)});
					}
				}
				break;
			case "dblclick":
				/*
				const rect = this.canvas!.getBoundingClientRect();
				const xcoord = m.x - this.state.offset.x - rect.x;
				const ycoord = m.y - this.state.offset.y - rect.y;
				if (this.state.geometry === "square") {
					this.setState({selected_cells : [new Point(Math.floor(xcoord/this.state.size), Math.floor(ycoord/this.state.size))]});
				} else if (this.state.geometry === "hex") {

				}
				// Edit current cell
				*/
				break;
		}
		m.preventDefault();
		return false;
	}

	componentDidUpdate(prevProps : GridDisplayProps, prevState : GridDisplayState) {
		if (prevState.geometry !== this.state.geometry
		|| !prevState.offset.equals(this.state.offset)
		|| prevState.size !== this.state.size
		|| prevState.colour_map !== this.state.colour_map
		|| (prevState.sim_time !== null && prevState.sim_time > 0 && this.state.sim_time === 0)) {
			this.draw();
			return;
		}
		if (prevProps !== this.props) {
			console.log('updating props');
			this.setState({
				data : prevProps.current_state === this.props.current_state ? this.state.data : this.createData(this.props.current_state),
				colour_map : this.props.colour_map,
				geometry : this.props.geometry,
				size : this.props.size,
				sim_time : this.props.sim_time
			});
			return;
		}
		if (prevState.selected_cells !== this.state.selected_cells) {
			let val : string | null = this.state.selected_cells.length < 1 ? "" : null;
			for (let i of this.state.selected_cells) {
				let r = this.state.data?.[i.y]?.[i.x] || "";
				if (val === null) {
					val = r;
				}
				if (val !== r) {
					val = "";
				}
			}
			this.props.selectedCells(this.state.selected_cells, val!);
		}

		let canvasRender = this.canvas!.getContext("2d");
		if (canvasRender === null || !(canvasRender instanceof CanvasRenderingContext2D)) return;
		const ctx : CanvasRenderingContext2D = canvasRender;
		if (prevState.data !== this.state.data) {
			let count = 0;
			for (let [y, row] of this.state.data.entries()) {
				for (let [x, val] of row.entries()) {
					if (prevState.data?.[y]?.[x] !== val) {
						this.drawCell(ctx, x, y, val) && count++;
					}
				}
			}
			console.log("updating", count, "cells");
		}
		this.addExtraDetail(ctx, prevState);
	}

	scrollZoom(e : WheelEvent) {
		//TODO: zoom in on mouse location
		let zoomRatio = 1;
		if (e.deltaY < 0) {
			zoomRatio = this.props.zoom(true);
		} else if (e.deltaY > 0) {
			zoomRatio = this.props.zoom(false);
		}
		e.preventDefault();
		const rect = this.canvas!.getBoundingClientRect();
		const x = (this.state.offset.x - e.x + rect.x) / zoomRatio + e.x - rect.x;
		const y = (this.state.offset.y - e.y + rect.y) / zoomRatio + e.y - rect.y;
		this.setState({offset : new Point(x, y)});
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

	addExtraDetail(ctx : CanvasRenderingContext2D, prevState? : GridDisplayState) {

		if (this.state.sim_time !== null) {
			ctx.fillStyle = "#FFFFFF";
			let xcoord = ctx.canvas.width/window.devicePixelRatio - 80 - this.state.offset.x;
			let ycoord = ctx.canvas.height/window.devicePixelRatio - 30 - this.state.offset.y;
			ctx.fillRect(xcoord, ycoord, 80, 30);

			ctx.fillStyle = "#000000";
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.font = "15px Arial";
			ctx.fillText("T: "+this.state.sim_time.toFixed(2), xcoord + 4, ycoord + 15, 80);
		}

		for (let z of [prevState, this.state]) {
			if (z !== undefined) {
				// TODO: properly clear previously selected cells
				for (let p of z.selected_cells) {
					ctx.lineWidth = 1;
					ctx.strokeStyle = "rgba(0,204,256,0.3)";
					ctx.fillStyle = ctx.strokeStyle;
					if (this.state.geometry === "square") {
						if (z === prevState) {
							this.drawCell(ctx, p.x, p.y, this.state.data?.[p.y]?.[p.x]);
						} else {
							ctx.fillRect(p.x*this.state.size, p.y*this.state.size, this.state.size, this.state.size);
						}
					} else if (this.state.geometry === "hex") {
						if (z === prevState) {
							this.drawCell(ctx, p.x, p.y, this.state.data?.[p.y]?.[p.x]);
						} else {
							let xcoord = (p.x + p.y%2/2 + 0.5)*this.state.size*Math.sin(2 * Math.PI/6)*2*0.75;
							let ycoord = (p.y + 0.5)*this.state.size*0.75*2*0.75;
							ctx.beginPath();
							for (var i = 0; i < 6; i++) {
								ctx.lineTo(xcoord + this.state.size * Math.sin(2 * Math.PI / 6 * i)*0.75, ycoord + this.state.size * Math.cos(2 * Math.PI / 6 * i)*0.75);
							}
							ctx.closePath();
							ctx.fill();
						}
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

	drawCell(ctx : CanvasRenderingContext2D, x : number, y : number, val : string | undefined) {
		let coord : Point;
		if (this.state.geometry === "square") {
			coord = new Point((x+0.5)*this.state.size, (y+0.5)*this.state.size);
		} else {
			coord = new Point(
				(x + y%2/2 + 0.5)*this.state.size*Math.sin(2 * Math.PI/6)*2*0.75,
				(y + 0.5)*this.state.size*0.75*2*0.75
			);
		}
		if (coord.x - this.state.size + this.state.offset.x > this.canvas!.width/window.devicePixelRatio || coord.y - this.state.size + this.state.offset.y > this.canvas!.height/window.devicePixelRatio) return false;
		if (coord.x + this.state.size + this.state.offset.x < 0 || coord.y + this.state.size + this.state.offset.y < 0) return false;
		// if (this.state.size < 1 && (this.state.size*coord.x % 1 < this.state.size || this.state.size*coord.y % 1 < this.state.size)) return false

		let colour : Colour | null = null;
		if (val === undefined) {
			ctx.fillStyle = 'rgba(0,0,0,0)';
		} else {
			colour = this.state.colour_map.find_colour(val);
			if (colour == null) {
				colour = this.state.colour_map.new_colour();
				this.state.colour_map.add_temp(val, colour);
			}
			ctx.fillStyle = 'rgb(' + colour.rgb().join(',') + ')';
			ctx.strokeStyle = ctx.fillStyle;
		}

		if (this.state.geometry === "square") {
			if (val === undefined) {
				ctx.clearRect(coord.x - this.state.size/2, coord.y - this.state.size/2, this.state.size, this.state.size);
			} else {
				ctx.fillRect(coord.x - this.state.size/2, coord.y - this.state.size/2, this.state.size, this.state.size);
			}
		} else if (this.state.geometry === "hex") {
			ctx.beginPath();
			for (var i = 0; i < 6; i++) {
				ctx.lineTo(coord.x + this.state.size * [0,0.645,0.645,0,-0.645,-0.645][i], coord.y + this.state.size * [0.75,0.375,-0.375,-0.75,-0.375,0.375][i]);
			}
			ctx.closePath();
			ctx.strokeStyle = ctx.fillStyle;
			ctx.stroke();
			ctx.fill();
		}

		if (this.state.size >= 12) {
			if (val !== undefined) {
				let [r,g,b] = colour!.rgb();
				ctx.fillStyle = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'black' : 'white';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = "11px Arial";
				ctx.fillText(val, coord.x, coord.y, this.state.size);
			}
		}
		return true;
	}
}

export default GridDisplayComponent
