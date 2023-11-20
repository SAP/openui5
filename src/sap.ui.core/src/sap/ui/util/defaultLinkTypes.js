/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Determines default link types for an &lt;a&gt; tag that comply with
	 * best practices for cross-origin communication.
	 *
	 * When the target will be opened in a new window,
	 * and when no other link types have been specified in the <code>rel</code> attribute,
	 * "noopener noreferrer" will be returned.
	 *
	 * @param {string} sRel Caller defined link types for the <code>rel</code> attribute
	 * @param {string} sTarget Value of the <code>target</code> attribute
	 * @returns {string} Value for the <code>rel</code> attribute of the &lt;a&gt; tag
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/util/defaultLinkTypes
	 * @since 1.84
	 */
	var fnDerive = function defaultLinkTypes(sRel, sTarget) {
		// trim rel and finally return the trimmed value
		sRel = typeof sRel === "string" ? sRel.trim() : sRel;
		// if the app already specified a non-empty value for rel, or when there's no need
		// to restrict access to the opener, then leave rel unchanged
		if (!sRel && sTarget && sTarget !== "_self") {
			return "noopener noreferrer";
		}
		return sRel;
	};
	return fnDerive;
});
