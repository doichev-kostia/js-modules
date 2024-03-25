import path from "node:path";
import * as fs from "node:fs";

import YAML from "yaml";
import NodeCache from "node-cache";

import { seconds } from "../time.js";
import { associateMethod } from "../util.js";

type Storage = {
	pathname: string;

	[key: symbol]: any;
}

type Options = {
	pathname: string;
	basename?: string
}

const keys = {
	cache: Symbol("storage:cache"),
	filepath: Symbol("storage:filepath")
} as const;

const DEFAULT_BASENAME = "storage";

export function createStorage(options: Options) {
	const pathname = path.resolve(options.pathname);
	if (!fs.existsSync(pathname)) {
		fs.mkdirSync(pathname, { recursive: true });
	}
	const filepath = buildFilePath(pathname, options.basename ?? DEFAULT_BASENAME);
	if (!fs.existsSync(filepath)) {
		fs.writeFileSync(filepath, YAML.stringify({}));
	}

	const storage: Storage = {
		pathname,

		[keys.filepath]: filepath,
		[keys.cache]: new NodeCache({
			stdTTL: 2 * seconds.minute,
		})
	}

	return Object.assign({}, storage, {
		list: associateMethod(storage, list),
		retrieve: associateMethod(storage, retrieve),
		put: associateMethod(storage, put),
		remove: associateMethod(storage, remove)
	});
}

export function buildFilePath(dir: string, basename: string) {
	return path.format({
		dir,
		name: basename,
		ext: ".yaml"
	});
}

export async function list(storage: Storage) {
	const content = await fs.promises.readFile(storage[keys.filepath], "utf-8");

	const data = YAML.parse(content);

	for (const key in data) {
		storage[keys.cache].set(key, data[key]);
	}

	return data;

}

export async function retrieve(storage: Storage, key: string) {
	const cached = storage[keys.cache].get(key);

	if (cached !== undefined) {
		return cached;
	}

	const content = await fs.promises.readFile(storage[keys.filepath], "utf-8");

	const data = YAML.parse(content);

	const value = data[key];

	storage[keys.cache].set(key, value);

	return value;
}

export async function put(storage: Storage, key: string, value: unknown) {
	const content = await fs.promises.readFile(storage[keys.filepath], "utf-8");

	const data = YAML.parse(content);

	data[key] = value;
	storage[keys.cache].set(key, value);

	const yaml = YAML.stringify(data);
	await fs.promises.writeFile(storage[keys.filepath], yaml);

	return;
}

export async function remove(storage: Storage, key: string) {
	const content = await fs.promises.readFile(storage[keys.filepath], "utf-8");

	const data = YAML.parse(content);

	delete data[key];
	storage[keys.cache].del(key);

	const yaml = YAML.stringify(data);
	await fs.promises.writeFile(storage[keys.filepath], yaml);

	return;
}
