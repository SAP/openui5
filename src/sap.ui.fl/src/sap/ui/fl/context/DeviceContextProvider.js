/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/context/BaseContextProvider",
	"sap/ui/Device"
], function(
	BaseContextProvider,
	Device
) {
	"use strict";

	/**
	 * Device context provider.
	 *
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
	var DeviceContextProvider = BaseContextProvider.extend("sap.ui.fl.context.DeviceContextProvider", {
		metadata : {
			properties : {
				text : {
					type : "String",
					defaultValue : "Device"
				},
				description : {
					type : "String",
					defaultValue : "Returns the values of sap.ui.Device"
				}
			}
		}
	});

	DeviceContextProvider.prototype.loadData = function() {
		return Promise.resolve(Device);
	};

	DeviceContextProvider.prototype.getValueHelp = function() {
		return Promise.resolve({});
	};

	DeviceContextProvider.prototype.validate = function() {
		return Promise.resolve(true);
	};

	return DeviceContextProvider;
});
