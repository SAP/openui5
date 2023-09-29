/*!
 * ${copyright}
 */

sap.ui.define([], function() {
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
		getService: function(sServiceName) {
            const oContainer = this.getUShellContainer();
            if (!oContainer) {
                return null;
            }

			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return oContainer.getService("CrossApplicationNavigation");
				case "URLParsing":
					return oContainer.getService("URLParsing");
				default:
					return null;
			}
		},
        getServiceAsync: function(sServiceName) {
            const oContainer = this.getUShellContainer();
            if (!oContainer) {
                return Promise.resolve(null);
            }

            switch (sServiceName) {
				case "CrossApplicationNavigation":
					return oContainer.getServiceAsync("CrossApplicationNavigation");
				case "URLParsing":
					return oContainer.getServiceAsync("URLParsing");
				default:
					return Promise.resolve(null);
			}
        }
	};
});
