/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/dom/includeScript'],
function (includeScript) {
	"use strict";

	function loadCardEditor() {
		return new Promise(function (fnResolve, fnReject) {
			sap.ui.require(["sap/ui/integration/designtime/cardEditor/BASEditor"], fnResolve, fnReject);
		});
	}

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
		return includeScript({ url: "sap-ui-integration-cardEditor.js" })
			.then(loadCardEditor)
			.catch(loadCardEditor);
	};
});