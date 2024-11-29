import { Hono } from "hono";

export interface Env {
	HUGGING_FACE_TOKEN: string;
	INTASEND_PUBLIC_KEY: string;
	INTASEND_SECRET_KEY: string;
	INTASEND_TEST_MODE: boolean;
}

type IntasendCheckoutResponse = {
	id: string,
	url: string,
	signature: string,
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

app.post("/donate", async c => {
	const pubKey = c.env.INTASEND_PUBLIC_KEY;
	const secKey = c.env.INTASEND_SECRET_KEY;
	const testMode = c.env.INTASEND_TEST_MODE;

	try {
		// request body
		const data = await c.req.json();
		console.log({ data })

		const INTASEND_CHECKOUT_URL = testMode
			? "https://sandbox.intasend.com/api/v1/checkout/"
			: "https://payment.intasend.com/api/v1/checkout/";

		const response = await fetch(INTASEND_CHECKOUT_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-IntaSend-Public-API-Key": pubKey
			},
			body: JSON.stringify(data)
		})

		const jsonResponse = await response.json<IntasendCheckoutResponse>();
		const { id, signature, url } = jsonResponse;
		
		return c.json({ data: { message: "checkout initiated", payload: { id, signature, url } } }, 200)
	} catch (error) {
		console.error({ error })
		return c.json({ data: { message: "checkout failed", error } }, 500)
	}
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


