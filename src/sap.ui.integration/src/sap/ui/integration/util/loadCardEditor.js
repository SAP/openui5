/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	/**
	 * Loads Card Editor preload bundle
	 *
	 * @example
	 * sap.ui.require(["sap/ui/integration/util/loadCardEditor"], function (loadCardEditor){
	 *   loadCardEditor().then(function (CardEditor) {
	 *      var oCardEditor = new CardEditor({...});
	 *      ...
	 *   });
	 * });
	 *
	 * @function
	 * @since 1.80
	 * @alias module:sap/ui/integration/util/loadCardEditor
	 * @returns {Promise} - Resolves with a CardEditor class when bundle is successfully loaded
	 * @public
	 */
	return function () {
		return sap.ui.loader._.loadJSResourceAsync("sap-ui-integration-cardEditor.js").then(function () {
			return new Promise(function (fnResolve, fnReject) {
				sap.ui.require(["sap/ui/integration/designtime/cardEditor/CardEditor"], fnResolve, fnReject);
			});
		});
	};
});