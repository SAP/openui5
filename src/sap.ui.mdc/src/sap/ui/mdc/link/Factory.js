/*!
 * ${copyright}
 */

sap.ui.define(["sap/ushell/library"], function(ushellLibrary) {
	"use strict";

	/**
	 * @namespace Factory to access services outside of sap.ui.mdc library like for example <code>ushell</code> services.
	 * @name sap.ui.mdc.link.Factory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.54.0
	 */
	return {
		getService: function(sServiceName) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return ushellLibrary && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
				case "URLParsing":
					return ushellLibrary && sap.ushell.Container && sap.ushell.Container.getService("URLParsing");
				default:
					return null;
			}
		}
	};
});
