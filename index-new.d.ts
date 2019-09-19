declare module "eris" {
	class Base {
		id: string | number;
		constructor (id: string | number);
		get createdAt(): number;
		toString(): string;
		toJSON(simple?: boolean): object;
	}

	/** A data object that can be constructed into a structure */
	interface Collectable {
		id: string; // TODO: this was previously `string | number` but I don't believe there are any instances of numbers being used as IDs in the code
	}

	/** A constructor that can be used as the baseObject of a Collection */
	interface BaseObject<T extends Collectable> {
		/** Takes a data object and an optional extra parameter */
		new (obj: Collectable, ...extra: any[]): T;
	}

	class Collection<T extends Collectable> extends Map<string, T> {
		readonly baseObject: BaseObject<T>;
		readonly limit: number;
		constructor(baseObject: BaseObject<T>, limit?: number);
		add(obj: Collectable, extra?: any, replace?: boolean): T;
		find(func: (obj: T) => boolean): T | undefined;
		random(): T | undefined;
		filter(func: (obj: T) => boolean): T[];
		map<U>(func: (obj: T) => U): U[];
		update(obj: Collectable, extra?: any, replace?: boolean): T;
		remove(obj: Collectable): T | null;
		toString(): string;
	}
}
