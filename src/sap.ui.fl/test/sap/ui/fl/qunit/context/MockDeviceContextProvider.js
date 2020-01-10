/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/fl/context/BaseContextProvider"], function(BaseContextProvider) {
	"use strict";

	/**
	 * Context provider for testing purposes
	 *
	 * @class
	 * @extends sap.ui.fl.context.BaseContextProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var MockDeviceContextProvider = BaseContextProvider.extend("sap.ui.fl.qunit.context.MockDeviceContextProvider", {
		metadata : {
			text : {
				type : "String"
			},
			description : {
				type : "String"
			},
			domain : {
				type : "String"
			}
		}
	});

	MockDeviceContextProvider.prototype.loadData = function() {
		return Promise.resolve({
			agent : "Safari",
			screen_size : "5K"
		});
	};

	MockDeviceContextProvider.prototype.getValueHelp = function() {
		return Promise.resolve({
			agent : {
				text : "Agent",
				description : "Browser agent",
				values : [{
					text : "Safari",
					description : "Browser on OS x and IOs platform",
					value : "Safari"
				}, {
					text : "Chrome",
					description : "A web browser built for speed, simplicity, and security",
					value : "Chrome"
				}]
			}
		});
	};
	return MockDeviceContextProvider;
});
