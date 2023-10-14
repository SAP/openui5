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
	  * XML view
	  * @public
	  */
	 XML: "XML"
	};

	return ViewType;
});
