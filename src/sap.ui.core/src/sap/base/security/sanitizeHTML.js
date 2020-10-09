/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/assert",
	"sap/base/security/URLListValidator",
	"sap/ui/thirdparty/caja-html-sanitizer"
], function(assert, URLListValidator /*cajaHtmlSanitizer*/) {

	"use strict";


	/**
	 * Strips unsafe tags and attributes from HTML.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/sanitizeHTML
	 * @param {string} sHTML the HTML to be sanitized.
	 * @param {object} [mOptions={}] options for the sanitizer
	 * @return {string} sanitized HTML
	 * @private
	 */
	var fnSanitizeHTML = function(sHTML, mOptions) {
		assert(window.html && window.html.sanitize, "Sanitizer should have been loaded");

		mOptions = mOptions || {
			uriRewriter: function(sUrl) {
				// by default, we use the URLListValidator to check the URLs

				if (URLListValidator.validate(sUrl)) {
					return sUrl;
				}
			}
		};

		var oTagPolicy = mOptions.tagPolicy || window.html.makeTagPolicy(mOptions.uriRewriter, mOptions.tokenPolicy);
		return window.html.sanitizeWithPolicy(sHTML, oTagPolicy);

	};

	return fnSanitizeHTML;

});