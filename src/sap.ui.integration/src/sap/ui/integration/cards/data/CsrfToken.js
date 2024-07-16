/*!
 * ${copyright}
 */
sap.ui.define([], () => {
	"use strict";

	// Map of all CSRF tokens. Keyed by the unique URL of each request. Shared by all cards.
	const tokensPromises = new Map();

	class CsrfToken {
		#name;
		#config;
		#tokenHandler;
		#key;
		#version = -1;
		value;

		constructor(tokenName, tokenConfig, tokenHandler) {
			this.#name = tokenName;
			this.#config = tokenConfig;
			this.#tokenHandler = tokenHandler;
			this.#key = tokenConfig.data.request.url;
		}

		load() {
			return this.#fetchValue();
		}

		markExpired() {
			if (this.#version === tokensPromises.get(this.#key)?.version) {
				tokensPromises.get(this.#key).expired = true;
			}
		}

		async #fetchValue() {
			let globalToken = tokensPromises.get(this.#key);

			if (!globalToken || globalToken?.expired) {
				globalToken = {
					fetchPromise: this.#tokenHandler.fetchValue(this.#config),
					version: (globalToken?.version ?? 0) + 1,
					expired: false
				};

				tokensPromises.set(this.#key, globalToken);
			}

			const value = await globalToken.fetchPromise;
			this.#version = tokensPromises.get(this.#key).version;
			this.#tokenHandler.onTokenFetched(this.#name, value);
			this.value = value;
		}
	}

	return CsrfToken;
});