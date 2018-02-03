/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/**
	 * Returns the outer HTML of the given HTML element.
	 *
	 * @return {string} outer HTML
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/outerHTML
	 */
	var fnOuterHTML = function outerHTML() {
		var oDomRef = this.get(0);

		if (oDomRef && oDomRef.outerHTML) {
			return jQuery.trim(oDomRef.outerHTML);
		} else {
			var doc = this[0] ? this[0].ownerDocument : document;

			var oDummy = doc.createElement("div");
			oDummy.appendChild(oDomRef.cloneNode(true));
			return oDummy.innerHTML;
		}
	};

	jQuery.fn.outerHTML = fnOuterHTML;

	return jQuery;

});

