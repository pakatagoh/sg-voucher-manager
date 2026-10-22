import assert from "node:assert/strict";
import https from "node:https";
import { pathToFileURL } from "node:url";

// Explicit opt-in network audit; never contacts application APIs or starts the app.
// Source: https://emudhra.we-have-a-problem.com/ (CVE-2026-111943).
const targets = [
	["https://dv-g3b-emudhra.we-have-a-problem.com/", true],
	["https://dv-g3b-aaa-emudhra.we-have-a-problem.com/", true],
	["https://ubuntu.com/", false],
];
const trustErrors = new Set([
	"CERT_REVOKED",
	"CERT_REJECTED",
	"UNABLE_TO_GET_ISSUER_CERT",
	"UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
	"UNABLE_TO_VERIFY_LEAF_SIGNATURE",
	"SELF_SIGNED_CERT_IN_CHAIN",
]);

export function isTrustFailure(error) {
	return trustErrors.has(error?.code) || trustErrors.has(error?.cause?.code);
}

function requestHttps(url) {
	return new Promise((resolve, reject) => {
		const request = https.get(url, { timeout: 15000 }, (response) => {
			response.resume();
			resolve();
		});
		request.on("timeout", () => request.destroy(new Error("HTTPS timeout")));
		request.on("error", reject);
	});
}

async function requestFetch(url) {
	const response = await fetch(url, {
		signal: AbortSignal.timeout(15000),
		redirect: "manual",
	});
	await response.body?.cancel();
}

export async function checkTrust() {
	const results = [];
	for (const [client, request] of [["https", requestHttps], ["fetch", requestFetch]]) {
		for (const [url, mustReject] of targets) {
			let error;
			try {
				await request(url);
			} catch (caught) {
				error = caught;
			}
			const passed = mustReject ? isTrustFailure(error) : !error;
			const result = {
				client, url, passed,
				outcome: error ? (error.cause?.code ?? error.code ?? error.message) : "TLS accepted",
			};
			results.push(result);
			console.log(JSON.stringify(result));
		}
	}
	assert.ok(results.every((result) => result.passed), "CA trust audit failed; network/DNS/timeouts are NOT mitigation evidence");
	return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	await checkTrust();
}
