sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Locale", "sap/ui/integration/Extension"], function(Localization, Locale, Extension) {
	"use strict";

	var SharedFetchExtension = Extension.extend("shared.lib.SharedFetchExtension");

	/**
	 * Starts the process of fetching a resource from the network, returning a promise that is fulfilled once the response is available.
	 * Use this method to override the default behavior when fetching network resources.
	 * Mimics the browser native Fetch API.
	 * @public
	 * @experimental Since 1.113. The API might change.
	 * @param {string} sResource This defines the resource that you wish to fetch.
	 * @param {object} mOptions An object containing any custom settings that you want to apply to the request.
	 * @param {object} mRequestSettings The map of request settings defined in the card manifest. Use this only for reading, they can not be modified.
	 * @returns {Promise<Response>} A <code>Promise</code> that resolves to a <code>Response</code> object.
	 */
	SharedFetchExtension.prototype.fetch = function(sResource, mOptions, mRequestSettings) {
		// Can modify any requests made by the card
		mOptions.headers.set("Accept-Language", new Locale(Localization.getLanguageTag()).toString());

		// Then make sure to call the method from the parent
		return Extension.prototype.fetch.call(this, sResource, mOptions, mRequestSettings)
			.then(function (oResponse) {
				// Can modify the response
				return oResponse;
			})
			.catch(function (oError) {
				// Can modify the response even if an error happens
				var oResponseBody = {
					error: oError.toString()
				};

				return new Response(
					JSON.stringify(oResponseBody),
					{
						headers: {
							"Content-Type": "application/json"
						}
					}
				);
			});
	};

	return SharedFetchExtension;
});