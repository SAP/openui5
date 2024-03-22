sap.ui.define([], () => {
	"use strict";

	const tokens = new Map();

	let currentToken = 1;

	function getCurrentTokenKey() {
		return `TOKEN${currentToken}`;
	}

	function createToken(sKey) {
		tokens.set(sKey, { expired: false });
	}

	function isExpired(sKey) {
		if (tokens.has(sKey)) {
			return tokens.get(sKey).expired;
		}

		return true;
	}

	const EXPIRED_TOKEN_KEY = "EXPIRED_TOKEN";
	createToken(EXPIRED_TOKEN_KEY);
	tokens.get(EXPIRED_TOKEN_KEY).expired = true;
	createToken("mynewToken");
	createToken("mynewTokenADD");
	createToken("Token2340");
	createToken("HostTokenValue");

	return {
		generateToken() {
			let key = getCurrentTokenKey();

			tokens.delete(key);
			currentToken++;
			key = getCurrentTokenKey();
			createToken(key);

			return key;
		},
		getCurrentTokenKey() {
			return getCurrentTokenKey();
		},
		getExpiredToken() {
			return EXPIRED_TOKEN_KEY;
		},
		getSingleUseToken() {
			const key = `SINGLE_USE_TOKEN_${Date.now()}`;

			createToken(key);

			return key;
		},
		markExpired(sKey) {
			if (tokens.has(sKey)) {
				tokens.get(sKey).expired = true;
			}
		},
		isValid(sKey) {
			const isValid = !isExpired(sKey);

			if (isValid && sKey.startsWith("SINGLE_USE_TOKEN_")) {
				// invalidate the token to prevent future usages
				tokens.get(sKey).expired = true;
			}

			return isValid;
		}
	};
});
