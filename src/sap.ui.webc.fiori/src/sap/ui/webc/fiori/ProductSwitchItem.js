/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.ProductSwitchItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ProductSwitchItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ProductSwitchItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.fiori.ProductSwitchItem</code> web component represents the items displayed in the <code>sap.ui.webc.fiori.ProductSwitch</code> web component. <br>
	 * <br>
	 * <b>Note:</b> <code>sap.ui.webc.fiori.ProductSwitchItem</code> is not supported when used outside of <code>sap.ui.webc.fiori.ProductSwitch</code>. <br>
	 * <br>
	 *
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.fiori.ProductSwitch</code> provides advanced keyboard handling. When focused, the user can use the following keyboard shortcuts in order to perform a navigation: <br>
	 *
	 * <ul>
	 *     <li>[SPACE/ENTER/RETURN] - Trigger <code>ui5-click</code> event</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.ProductSwitchItem
	 * @implements sap.ui.webc.fiori.IProductSwitchItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ProductSwitchItem = WebComponent.extend("sap.ui.webc.fiori.ProductSwitchItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-product-switch-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IProductSwitchItem"
			],
			properties: {

				/**
				 * Defines the icon to be displayed as a graphical element within the component. <br>
				 * <br>
				 * Example: <br>
				 * <pre>ui5-product-switch-item icon="palette"</pre>
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the subtitle of the component.
				 */
				subtitleText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines a target where the <code>targetSrc</code> content must be open. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>_self</code></li>
				 *     <li><code>_top</code></li>
				 *     <li><code>_blank</code></li>
				 *     <li><code>_parent</code></li>
				 *     <li><code>_search</code></li>
				 * </ul>
				 */
				target: {
					type: "string",
					defaultValue: "_self"
				},

				/**
				 * Defines the component target URI. Supports standard hyperlink behavior.
				 */
				targetSrc: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the title of the component.
				 */
				titleText: {
					type: "string",
					defaultValue: ""
				}
			},
			events: {

				/**
				 * Fired when the <code>sap.ui.webc.fiori.ProductSwitchItem</code> is activated either with a click/tap or by using the Enter or Space key.
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ProductSwitchItem;
});