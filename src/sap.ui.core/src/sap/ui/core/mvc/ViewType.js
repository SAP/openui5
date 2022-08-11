/*!
 * ${copyright}
 */

 // Provides type sap.ui.core.mvc.ViewType
sap.ui.define([], function () {
	"use strict";

	/**
	 * Specifies possible view types.
	 *
	 * <b>Note:</b> Typed views do not rely on a <code>ViewType</code>, it must be omitted in the view settings.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.core.mvc.ViewType
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
