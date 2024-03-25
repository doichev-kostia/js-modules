type GetParams<T> = T extends (_, ...params: infer P) => any ? P : never;

export function associateMethod<Struct extends object, Method extends (struct: Struct, ...args: any[]) => any, Rest extends any[] = GetParams<Method>>(struct: Struct, method: Method): (...args: Rest) => ReturnType<Method>  {
	return method.bind(null, struct);
}
