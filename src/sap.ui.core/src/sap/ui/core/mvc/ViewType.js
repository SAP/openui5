/*!
 * ${copyright}
 */

 // Provides type sap.ui.core.mvc.ViewType
sap.ui.define([], function () {
	"use strict";

	/**
	 * Specifies possible view types.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.core.mvc.ViewType
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewType = {

		/**
		 * JSON View
		 * @public
		 */
		JSON: "JSON",

		/**
		 * XML view
		 * @public
		 */
		XML: "XML",

		/**
		 * HTML view
		 * @public
		 */
		HTML: "HTML",

		/**
		 * JS View
		 * @deprecated Since 1.90
		 * @public
		 */
		JS: "JS",

		/**
		 * Template View
		 * @deprecated Since 1.56
		 * @public
		 */
		Template: "Template"

	};

	return ViewType;
});
