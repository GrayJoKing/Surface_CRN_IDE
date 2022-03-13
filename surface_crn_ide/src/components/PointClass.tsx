
class Point {
	x: number;
	y: number;

	static origin : Point = new Point(0,0);

	constructor(x : number,y : number) {
		this.x = x;
		this.y = y;
	}

	add(p : Point) { return new Point(this.x + p.x, this.y + p.y) };
	subtract(p : Point) { return new Point(this.x - p.x, this.y - p.y) };
	scale(s : number) { return new Point(this.x * s, this.y * s) };
	equals(p : Point) { return this.x === p.x && this.y === p.y };
};

export default Point;
