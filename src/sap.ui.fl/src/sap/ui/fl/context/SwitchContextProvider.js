/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/context/BaseContextProvider"
], function(
	BaseContextProvider
) {
	"use strict";

	/**
	 * Switch context provider.
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
	 * @since 1.43
	 * @experimental Since 1.43. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var SwitchContextProvider = BaseContextProvider.extend("sap.ui.fl.context.SwitchContextProvider", {
		metadata : {
			properties : {
				text : {
					type : "String",
					defaultValue : "Switch"
				},
				description : {
					type : "String",
					defaultValue : "Returns the values of switches received in the flexibility response from the back end"
				}
			}
		}
	});

	SwitchContextProvider.prototype.loadData = function() {
		return Promise.resolve({});
	};

	SwitchContextProvider.prototype.getValueHelp = function() {
		return Promise.resolve({});
	};

	SwitchContextProvider.prototype.validate = function() {
		return Promise.resolve(true);
	};

	return SwitchContextProvider;
});
