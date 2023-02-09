// Drop N entries from array T
type Drop<N extends number, T extends any[], I extends any[] = []> = Length<I> extends N
	? T
	: Drop<N, Tail<T>, Prepend2<Head<T>, I>>;

// Add element E to array A (i.e Prepend2<0, [1, 2]> = [0, 1, 2])
type Prepend2<E, A extends any[]> = [E, ...A];

// Get the Tail of the array, i.e Tail<[0, 1, 2]> = [1, 2]
type Tail<A extends any[]> = A extends [any] ? [] : A extends [any, ...infer T] ? T : never;

// Get the head of the array, i.e Head<[0, 1, 2]> = 0
type Head<A extends any[]> = A extends [infer H] ? H : A extends [infer H, ...any] ? H : never;

// Get the length of an array
type Length<T extends any[]> = T["length"];

// Use type X if X is assignable to Y, otherwise Y
type Cast<X, Y> = X extends Y ? X : Y;

// Curry a function
export type Curry<P extends any[], R> = <T extends any[]>(
	...args: Cast<T, Partial<P>>
) => Drop<Length<T>, P> extends [any, ...any[]] ? Curry<Cast<Drop<Length<T>, P>, any[]>, R> : R;

type Fn<A = any, R = any> = (a: A) => R;

type PipeResult<A, T extends Fn[]> = T extends [Fn<any, infer R>, ...infer Rest]
	? Rest extends [Fn, ...any]
		? PipeResult<A, Rest>
		: Fn<A, R>
	: never;

type PipeArgs<A, T extends Fn[]> = T extends [Fn<any, infer R>, ...infer Rest]
	? Rest extends [Fn, ...any]
		? [Fn<A, R>, ...PipeArgs<R, Rest>]
		: [Fn<A, R>]
	: T;

type Pipe = <A, T extends Fn[]>(...fns: PipeArgs<A, T>) => PipeResult<A, T>;

export const useFunctional = () => {
	const curry = <P extends any[], R>(fn: (...args: P) => R) => {
		return ((...args: any[]) => {
			if (args.length >= fn.length) {
				return (fn as Function)(...args) as R;
			}

			return (...more: any[]) => (curry(fn) as Function)(...args, ...more);
		}) as unknown as Curry<P, R>;
	};

	const pipe: Pipe = ((...fns: any[]) =>
		(x: unknown) =>
			fns.reduce((v, f) => f(v), x)) as any;

	return { curry, pipe };
};
