sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/base/util/fetch"
], (Extension, fetch) => {
	"use strict";

	return Extension.extend("sap.ui.CardCSRFToken.sameToken.withExtension.E", {
		fetch(resource, settings, resolvedSettings) {
			let resolve;
			const deferred = new Promise((_resolve) => { resolve = _resolve; });
			const res = fetch(resolvedSettings.url, {
				method: resolvedSettings.method,
				headers: resolvedSettings.headers
			});

			setTimeout(async () => {
				resolve(await res);
			}, 3000);

			return deferred;
		}
	});
});