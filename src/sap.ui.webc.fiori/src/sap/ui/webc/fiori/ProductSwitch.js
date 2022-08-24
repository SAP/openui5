/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.ProductSwitch.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ProductSwitch"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ProductSwitch</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.ProductSwitch</code> is an SAP Fiori specific web component that is used in <code>sap.ui.webc.fiori.ShellBar</code> and allows the user to easily switch between products. <br>
	 * <br>
	 *
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.fiori.ProductSwitch</code> provides advanced keyboard handling. When focused, the user can use the following keyboard shortcuts in order to perform a navigation: <br>
	 *
	 * <ul>
	 *     <li>[TAB] - Move focus to the next interactive element after the <code>sap.ui.webc.fiori.ProductSwitch</code></li>
	 *     <li>[UP/DOWN] - Navigates up and down the items </li>
	 *     <li>[LEFT/RIGHT] - Navigates left and right the items</li>
	 * </ul> <br>
	 * <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.ProductSwitch
	 */
	var ProductSwitch = WebComponent.extend("sap.ui.webc.fiori.ProductSwitch", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-product-switch-ui5",
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of the <code>sap.ui.webc.fiori.ProductSwitch</code>.
				 */
				items: {
					type: "sap.ui.webc.fiori.IProductSwitchItem",
					multiple: true
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ProductSwitch;
});