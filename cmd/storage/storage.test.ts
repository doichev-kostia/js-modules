import { test } from "node:test"
import * as assert from "node:assert"
import * as os from "node:os";
import { randomBytes } from "node:crypto";

import { createStorage, list, put } from "./storage.js";

test("basic workflow", async () => {
	const tmp = os.tmpdir();
	const hash = randomBytes(4).toString("hex");
	const basename = `storage-${hash}`
	const storage = createStorage({
		pathname: tmp,
		basename
	});

	await storage.put("foo", "bar");
	await storage.put("name", "John");
	await storage.put("age", 55);

	const data = await storage.list();
	assert.deepStrictEqual(data, {
		foo: "bar",
		name: "John",
		age: 55
	});

	const item = await storage.retrieve("foo");
	assert.strictEqual(item, "bar");

	await storage.remove("foo");
});

test("independent functions", async () => {
	const tmp = os.tmpdir();
	const hash = randomBytes(4).toString("hex");
	const basename = `storage-${hash}`
	const storage = createStorage({
		pathname: tmp,
		basename
	});

	await put(storage, "foo", "bar");

	const data = await list(storage);
	assert.deepStrictEqual(data, {
		foo: "bar"
	});

	const item = await storage.retrieve("foo");
	assert.strictEqual(item, "bar");
})
