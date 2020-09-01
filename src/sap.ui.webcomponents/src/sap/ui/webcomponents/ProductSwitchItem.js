/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.ProductSwitchItem.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/ProductSwitchItem"
], function(WebComponent, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>ProductSwitchItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.ProductSwitchItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProductSwitchItem = WebComponent.extend("sap.ui.webcomponents.ProductSwitchItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-product-switch-item",
			properties: {

				heading: {
					type: "string"
				},

				subtitle: {
					type: "string"
				},

				icon: {
					type: "string"
				},

				target: {
					type: "string",
					defaultValue: "_self",
				},

				targetSrc: {
					type: "string"
				},
			},
			events: {
				click: {}
			}
		}
	});

	return ProductSwitchItem;
});
