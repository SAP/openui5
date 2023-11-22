/*!
 * ${copyright}
 */
sap.ui.define([], () => {
	"use strict";

	// Map of all CSRF tokens promises fetched by request. Keyed by the unique URL of each request. Shared by all cards.
	const tokensPromises = new Map();

	class CsrfToken {
		#name;
		#config;
		#tokenHandler;
		#key;
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

		setExpired() {
			tokensPromises.delete(this.#key);
		}

		async #fetchValue() {
			/**
			 * @deprecated As of version 1.120.0
			 */
			const hostValue = await this.#tokenHandler.fetchValueByHost(this.#config);

			/**
			 * @deprecated As of version 1.120.0
			 */
			if (hostValue) {
				this.#tokenHandler.onTokenFetched(this.#name, hostValue);
				this.value = hostValue;
				return;
			}

			if (!tokensPromises.has(this.#key)) {
				tokensPromises.set(this.#key, this.#tokenHandler.fetchValue(this.#name, this.#config));
			}

			const value = await tokensPromises.get(this.#key);

			this.#tokenHandler.onTokenFetched(this.#name, value);
			this.value = value;
		}
	}

	return CsrfToken;
});