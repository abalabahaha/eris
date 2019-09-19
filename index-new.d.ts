declare module "eris" {
	class Base {
		id: string | number;
		constructor (id: string | number);
		get createdAt(): number;
		toString(): string;
		toJSON(simple?: boolean): object;
	}
}
