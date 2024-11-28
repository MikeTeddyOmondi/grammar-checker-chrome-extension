import { Hono } from "hono";

export interface Env {
	HUGGING_FACE_TOKEN: string
}

const app = new Hono<{ Bindings: Env }>();

app.post("/", async c => {
	const token = c.env.HUGGING_FACE_TOKEN;

	// request body
	const data = await c.req.json();

	// query hugging face model
	let response = await query(data, token);

	return c.json({ data: response })
})

export default app;

async function query(data: { inputs: string }, token: string) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/prithivida/grammar_error_correcter_v1",
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}
