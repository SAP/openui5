/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SegmentedButtonItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/SegmentedButtonItem"
], function(WebComponent, library) {
	"use strict";

	var ButtonDesign = library.ButtonDesign;

	/**
	 * Constructor for a new <code>SegmentedButtonItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * Users can use the <code>sap.ui.webc.main.SegmentedButtonItem</code> as part of a <code>sap.ui.webc.main.SegmentedButton</code>. <br>
	 * <br>
	 * Clicking or tapping on a <code>sap.ui.webc.main.SegmentedButtonItem</code> changes its state to <code>pressed</code>. The item returns to its initial state when the user clicks or taps on it again. By applying additional custom CSS-styling classes, apps can give a different style to any <code>sap.ui.webc.main.SegmentedButtonItem</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SegmentedButtonItem
	 * @implements sap.ui.webc.main.ISegmentedButtonItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SegmentedButtonItem = WebComponent.extend("sap.ui.webc.main.SegmentedButtonItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-segmented-button-item-ui5",
			interfaces: [
				"sap.ui.webc.main.ISegmentedButtonItem"
			],
			properties: {

				/**
				 * Sets the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
				 */
				design: {
					type: "sap.ui.webc.main.ButtonDesign",
					defaultValue: ButtonDesign.Default
				},

				/**
				 * Defines whether the component is disabled. A disabled component can't be pressed or focused, and it is not in the tab chain.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the icon to be displayed as graphical element within the component. The SAP-icons font provides numerous options. <br>
				 * <br>
				 * Example:
				 *
				 * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
				 */
				iconEnd: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines whether the component is displayed as pressed.
				 */
				pressed: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
				 */
				submits: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				}
			},
			events: {

				/**
				 * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key. <br>
				 * <br>
				 * <b>Note:</b> The event will not be fired if the <code>disabled</code> property is set to <code>true</code>.
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	return SegmentedButtonItem;
});
