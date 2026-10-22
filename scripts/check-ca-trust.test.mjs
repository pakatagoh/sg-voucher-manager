import assert from "node:assert/strict";
import test from "node:test";
import { isTrustFailure } from "./check-ca-trust.mjs";

test("accepts native HTTPS and fetch certificate trust failures", () => {
	for (const code of ["CERT_REJECTED", "UNABLE_TO_GET_ISSUER_CERT", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "SELF_SIGNED_CERT_IN_CHAIN"]) {
		assert.equal(isTrustFailure({ code }), true);
		assert.equal(isTrustFailure({ cause: { code } }), true);
	}
});

test("accepts native blocklist revocation from HTTPS and fetch", () => {
	assert.equal(isTrustFailure({ code: "CERT_REVOKED" }), true);
	assert.equal(isTrustFailure({ cause: { code: "CERT_REVOKED" } }), true);
});

test("never counts connectivity errors or unrelated certificate errors as mitigation", () => {
	for (const code of ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID"]) {
		assert.equal(isTrustFailure({ code }), false);
		assert.equal(isTrustFailure({ cause: { code } }), false);
	}
	assert.equal(isTrustFailure(undefined), false);
	assert.equal(isTrustFailure(new Error("timeout")), false);
});
