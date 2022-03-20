
class Point {
	x: number;
	y: number;

	static origin : Point = new Point(0,0);

	constructor(x : number = 0, y : number = 0) {
		this.x = x;
		this.y = y;
	}

	add(p : Point) { return new Point(this.x + p.x, this.y + p.y) };
	subtract(p : Point) { return new Point(this.x - p.x, this.y - p.y) };
	multiply(p : Point) { return new Point(this.x * p.x, this.y * p.y) };
	scale(s : number) { return new Point(this.x * s, this.y * s) };
	equals(p : Point) { return this.x === p.x && this.y === p.y };

	magnitude() { return Math.sqrt(this.x**2 + this.y**2)}
};

export default Point;
