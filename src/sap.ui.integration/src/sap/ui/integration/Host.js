/*!
 * ${copyright}
 */
sap.ui.define(['./Extension'],
	function (Extension) {
		"use strict";

		/**
		 * Constructor for a new <code>Host</code>.
		 *
		 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new data provider.
		 *
		 * @class
		 *
		 *
		 * @extends sap.ui.integration.Extension
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.75
		 * @alias sap.ui.integration.Host
		 */
		var Host = Extension.extend("sap.ui.integration.Host", {
			metadata: {
				library: "sap.ui.integration",
				properties: {},
				events: {}
			}
		});

		return Host;
	});