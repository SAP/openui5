/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/config"
], (
	BaseConfig
) => {
	"use strict";

	const oWritableConfig = BaseConfig.getWritableInstance();

	/**
	 * The flexibility Configuration.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias module:sap/ui/fl/initial/_internal/FlexConfiguration
	 * @namespace
	 */
	const FlexConfiguration = {
		/**
		 * Returns the URL from where the UI5 flexibility services are called;
		 * if empty, the flexibility services are not called.
		 *
		 * @returns {object[]} Flexibility services configuration
		 * @private
		 * @since 1.120.0
		 */
		getFlexibilityServices() {
			const aDefaultValue = [{
				url: "/sap/bc/lrep",
				connector: "LrepConnector"
			}];
			const vFlexibilityServices = oWritableConfig.get({
				name: "sapUiFlexibilityServices",
				type: (vValue) => {
					if (typeof vValue === "string") {
						if (vValue === "") {
							return [];
						}
						if (vValue[0] === "/") {
							aDefaultValue[0].url = vValue;
							vValue = aDefaultValue;
						} else {
							vValue = JSON.parse(vValue);
						}
					}
					return vValue || [];
				},
				defaultValue: aDefaultValue,
				external: true
			});
			return vFlexibilityServices;
		},

		/**
		 * Sets the UI5 flexibility services configuration.
		 *
		 * @param {object[]} aFlexibilityServices - Connector configuration
		 * @param {string} [aFlexibilityServices.connector] - Name of the connector
		 * @param {string} [aFlexibilityServices.applyConnector] - Name of the full module name of the custom apply connector
		 * @param {string} [aFlexibilityServices.writeConnector] - Name of the full module name of the custom write connector
		 * @param {boolean} [aFlexibilityServices.custom=false] - Flag to identify the connector as custom or fl owned
		 * @param {string} [aFlexibilityServices.url] - Url for requests sent by the connector
		 * @param {string} [aFlexibilityServices.path] - Path for loading data in the ObjectPath connector
		 * @param {sap.ui.fl.Layer[]} [aFlexibilityServices.layers] - List of layers in which the connector is allowed to write
		 * @private
		 * @since 1.120.0
		 */
		setFlexibilityServices(aFlexibilityServices) {
			oWritableConfig.set("sapUiFlexibilityServices", aFlexibilityServices.slice());
		}
	};

	return FlexConfiguration;
});
