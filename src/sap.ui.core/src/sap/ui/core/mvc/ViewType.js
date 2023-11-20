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
	 * See the {@link topic:91f27e3e6f4d1014b6dd926db0e91070 documentation} for more information on the different view types.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.core.mvc.ViewType
	 */
	var ViewType = {

		/**
		 * JSON View
		 * @public
		 * @deprecated Since version 1.120, please consider using {@link sap.ui.core.mvc.XMLView XMLViews} or "typed views" (view classes
		 *             written in JavaScript) instead.
		 */
		JSON: "JSON",

		/**
		 * XML view
		 * @public
		 */
		XML: "XML",

		/**
		 * HTML view
		 * @deprecated Since 1.108. Consider using {@link sap.ui.core.mvx.XMLView XMLViews} or "typed views" (view classes
		 *             written in JavaScript) instead.
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
