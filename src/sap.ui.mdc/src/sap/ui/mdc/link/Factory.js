/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log"], (Log) => {
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
		getUShellContainer: function() {
			return sap.ui.require("sap/ushell/Container");
		},
		getService: function(sServiceName, bAsync) {
			const oContainer = this.getUShellContainer();
			if (!oContainer) {
				return bAsync ? Promise.resolve(null) : null;
			}

			switch (sServiceName) {
				case "CrossApplicationNavigation":
					Log.error("sap.ui.mdc.link.Factory: tried to retrieve deprecated service 'CrossApplicationNavigation', please use 'Navigation' instead!");
					return bAsync ? oContainer.getServiceAsync("CrossApplicationNavigation") : oContainer.getService("CrossApplicationNavigation");
				case "Navigation":
					return bAsync ? oContainer.getServiceAsync("Navigation") : oContainer.getService("Navigation");
				case "URLParsing":
					return bAsync ? oContainer.getServiceAsync("URLParsing") : oContainer.getService("URLParsing");
				default:
					return bAsync ? Promise.resolve(null) : null;
			}
		},
		getServiceAsync: function(sServiceName) {
			return this.getService(sServiceName, true);
		}
	};
});