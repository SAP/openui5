/*!
 * ${copyright}
 */
sap.ui.define(['./isCrossOriginURL'], function(isCrossOriginURL) {
	"use strict";
	/**
	 * Determines default link types for an &lt;a&gt; tag that comply with
	 * best practices for cross-origin communication.
	 *
	 * When the target URL is a cross-origin URL and when it will be opened in a new window,
	 * and when no other link types have been specified in the <code>rel</code> attribute,
	 * "noopener noreferrer" will be returned.
	 *
	 * @param {string} sRel Caller defined link types for the <code>rel</code> attribute
	 * @param {sap.ui.core.URI} sHref The target URL (might be relative to document.baseURI)
	 * @param {string} sTarget Value of the <code>target</code> attribute
	 * @returns {string} Value for the <code>rel</code> attribute of the &lt;a&gt; tag
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/util/defaultLinkTypes
	 * @since 1.60.34
	 */
	var fnDerive = function defaultLinkTypes(sRel, sHref, sTarget) {
		// trim rel and finally return the trimmed value
		sRel = typeof sRel === "string" ? sRel.trim() : sRel;
		// if the app already specified a non-empty value for rel, or when there's no need
		// to restrict access to the opener, then leave rel unchanged
		if (!sRel && sTarget && sTarget !== "_self" && isCrossOriginURL(sHref)) {
			return "noopener noreferrer";
		}
		return sRel;
	};
	return fnDerive;
});