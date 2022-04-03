import React from 'react';
import Surface_CRN, {Colour} from 'surface_crn';
import Point from './PointClass';

interface GridDisplayProps {
	current_state : string[][]
	model : Surface_CRN
	geometry : 'square'|'hex'
	size : number
	zoom : (b : boolean) => number
	selectedCells : (s : Point[], val : string) => void
	simulation? : boolean
}

interface GridDisplayState extends React.ComponentState {
	data: [string, Colour][][]
	offset : Point
	selected_cells : Point[]
	sim_time : number | null
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
			offset : Point.origin,
			selected_cells : [],
			sim_time : props.simulation ? 0 : null
		};
	}

	render() {
		return <canvas ref={elem => this.canvas = elem} />
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
		let gridHeight = (0.75+0.375)*this.props.size;
		let gridWidth = this.props.size * Math.sin(2 * Math.PI/6)*2*0.75;
		let c = (0.75-0.375)*this.props.size;
		let m = c/(gridWidth/2);

		// Find the row and column of the box that the point falls in.
		let row = Math.floor((ycoord+c/2) / gridHeight);
		let column;

		let rowIsOdd = (row & 1) === 1;
		column = Math.floor(xcoord / gridWidth - (rowIsOdd ? 0.5 : 0));

		// Work out the position of the point relative to the box it is in
		let relY = (ycoord + c/2) - (row * gridHeight);
		let relX = xcoord - (column * gridWidth) - (rowIsOdd ? gridWidth/2 : 0);

		// Work out if the point is above either of the hexagon's top edges
		if (relY < (-m * relX) + c) {
			row--;
			if (!rowIsOdd) column--;
		} else if (relY < (m * relX) - c) {
			row--;
			if (rowIsOdd) column++;
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
					if (this.props.geometry === "square") {
						this.setState({selected_cells : [new Point(Math.floor(xcoord/this.props.size), Math.floor(ycoord/this.props.size))]});
					} else if (this.props.geometry === "hex") {
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
				if (this.props.geometry === "square") {
					this.setState({selected_cells : [new Point(Math.floor(xcoord/this.props.size), Math.floor(ycoord/this.props.size))]});
				} else if (this.props.geometry === "hex") {

				}
				// Edit current cell
				*/
				break;
		}
		m.preventDefault();
		return false;
	}

	componentDidUpdate(prevProps : GridDisplayProps, prevState : GridDisplayState) {
		if (prevProps.model !== this.props.model
		|| prevProps.geometry !== this.props.geometry
		|| !prevState.offset.equals(this.state.offset)
		|| prevProps.size !== this.props.size
		|| (prevState.sim_time !== null && prevState.sim_time > 0 && this.state.sim_time === 0)) {
			this.draw();
			return;
		}

		if (prevProps.current_state !== this.props.current_state) {
			this.setState({data : this.createData(this.props.current_state)});
		}

		if (prevState !== this.state) {
			if (prevState.selected_cells !== this.state.selected_cells) {
				let val : string | null = this.state.selected_cells.length < 1 ? "" : null;
				for (let i of this.state.selected_cells) {
					let r = (this.state.data?.[i.y]?.[i.x] || [""])[0];
					if (val === null) val = r;
					if (val !== r) val = "";
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
						let d = prevState.data?.[y]?.[x];
						if (d === undefined || d[0] !== val[0] || d[1].hex() !== val[1].hex()) {
							this.drawCell(ctx, x, y, val) && count++;
						}
					}
				}
			}
			this.addExtraDetail(ctx, prevState);
		}
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
		if (this.canvas === null) return;
		const rect = (this.canvas.parentNode! as Element).getBoundingClientRect();
		this.canvas.width = Math.floor(rect.width * window.devicePixelRatio);
		this.canvas.height = Math.floor(rect.height * window.devicePixelRatio);
		this.canvas.style.width = Math.floor(rect.width) + 'px';
		this.canvas.style.height = Math.floor(rect.height) + 'px';
		const canvasRender = this.canvas.getContext("2d");
		if (canvasRender === null || !(canvasRender instanceof CanvasRenderingContext2D)) return;
		const ctx : CanvasRenderingContext2D = canvasRender;
		ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		ctx.translate(this.state.offset.x, this.state.offset.y);

		let data = this.createData(this.props.current_state);
		for (let [y, row] of data.entries()) {
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
				for (let p of z.selected_cells) {
					ctx.lineWidth = 1;
					ctx.strokeStyle = "rgba(0,204,256,0.3)";
					ctx.fillStyle = ctx.strokeStyle;
					if (this.props.geometry === "square") {
						if (z === prevState) {
							this.drawCell(ctx, p.x, p.y, this.state.data?.[p.y]?.[p.x]);
						} else {
							ctx.fillRect(p.x*this.props.size, p.y*this.props.size, this.props.size, this.props.size);
						}
					} else if (this.props.geometry === "hex") {
						if (z === prevState) {
							this.drawCell(ctx, p.x, p.y, this.state.data?.[p.y]?.[p.x]);
						} else {
							let xcoord = (p.x + (p.y&1)/2 + 0.5)*this.props.size*Math.sin(2 * Math.PI/6)*2*0.75;
							let ycoord = (p.y + 0.5)*this.props.size*0.75*2*0.75;
							ctx.beginPath();
							for (var i = 0; i < 6; i++) {
								ctx.lineTo(xcoord + this.props.size * Math.sin(2 * Math.PI / 6 * i)*0.75, ycoord + this.props.size * Math.cos(2 * Math.PI / 6 * i)*0.75);
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
		this.props.model.colour_map.clear_temp();
		var data : [string, Colour][][] = [];
		for (var [y, row] of current_state.entries()) {
			data[y] = [];
			for (var [x, elem] of row.entries()) {
				let colour = this.props.model.colour_map.find_colour(elem);
				if (colour == null) {
					colour = this.props.model.colour_map.new_colour();
					this.props.model.colour_map.add_temp(elem, colour);
				}
				data[y][x] = [elem, colour];
			}
		}
		return data;
	}

	updateData(current_state : string[][]) {
		var data = this.createData(current_state);
		this.setState({data : data});
	}

	drawCell(ctx : CanvasRenderingContext2D, x : number, y : number, val : [string, Colour] | undefined) {
		let coord : Point;
		if (this.props.geometry === "square") {
			coord = new Point((x+0.5)*this.props.size, (y+0.5)*this.props.size);
		} else {
			coord = new Point(
				(x + (y&1)/2 + 0.5)*this.props.size*Math.sin(2 * Math.PI/6)*2*0.75,
				(y + 0.5)*this.props.size*0.75*2*0.75
			);
		}
		if (coord.x - this.props.size + this.state.offset.x > this.canvas!.width/window.devicePixelRatio || coord.y - this.props.size + this.state.offset.y > this.canvas!.height/window.devicePixelRatio) return false;
		if (coord.x + this.props.size + this.state.offset.x < 0 || coord.y + this.props.size + this.state.offset.y < 0) return false;
		// if (this.props.size < 1 && (this.props.size*coord.x % 1 < this.props.size || this.props.size*coord.y % 1 < this.props.size)) return false

		if (val === undefined) {
			ctx.fillStyle = 'rgba(0,0,0,0)';
		} else {
			ctx.fillStyle = 'rgb(' + val[1].rgb().join(',') + ')';
			ctx.strokeStyle = ctx.fillStyle;
		}

		if (this.props.geometry === "square") {
			if (val === undefined) {
				ctx.clearRect(coord.x - this.props.size/2, coord.y - this.props.size/2, this.props.size, this.props.size);
			} else {
				ctx.fillRect(coord.x - this.props.size/2, coord.y - this.props.size/2, this.props.size, this.props.size);
			}
		} else if (this.props.geometry === "hex") {
			ctx.beginPath();
			for (var i = 0; i < 6; i++) {
				ctx.lineTo(coord.x + this.props.size * [0,0.645,0.645,0,-0.645,-0.645][i], coord.y + this.props.size * [0.75,0.375,-0.375,-0.75,-0.375,0.375][i]);
			}
			ctx.closePath();
			ctx.strokeStyle = ctx.fillStyle;
			ctx.stroke();
			ctx.fill();
		}

		if (this.props.size >= 12) {
			if (val !== undefined) {
				let [r,g,b] = val[1].rgb();
				ctx.fillStyle = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? 'black' : 'white';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = "11px Arial";
				ctx.fillText(val[0], coord.x, coord.y, this.props.size);
			}
		}
		return true;
	}
}

export default GridDisplayComponent
