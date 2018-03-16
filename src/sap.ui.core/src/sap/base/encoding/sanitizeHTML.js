/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/assert",
	"sap/base/util/URLWhiteList",
	"sap/ui/thirdparty/caja-html-sanitizer"
], function(assert, URLWhiteList /*cajaHtmlSanitizer*/) {

	"use strict";


	/**
	 * Strips unsafe tags and attributes from HTML.
	 *
	 * @function
	 * @exports sap/base/encoding/sanitizeHTML
	 * @param {string} sHTML the HTML to be sanitized.
	 * @param {object} [mOptions={}] options for the sanitizer
	 * @return {string} sanitized HTML
	 * @private
	 */
	var fnSanitizeHTML = function(sHTML, mOptions) {
		assert(window.html && window.html.sanitize, "Sanitizer should have been loaded");

		mOptions = mOptions || {
			uriRewriter: function(sUrl) {
				// by default we use the URL whitelist to check the URL's

				if (URLWhiteList.validate(sUrl)) {
					return sUrl;
				}
			}
		};

		var oTagPolicy = mOptions.tagPolicy || window.html.makeTagPolicy(mOptions.uriRewriter, mOptions.tokenPolicy);
		return window.html.sanitizeWithPolicy(sHTML, oTagPolicy);

	};

	return fnSanitizeHTML;

});