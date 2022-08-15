/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Icon.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Icon"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Icon</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Icon</code> component represents an SVG icon. There are two main scenarios how the <code>sap.ui.webc.main.Icon</code> component is used: as a purely decorative element, <br>
	 * or as an interactive element that can be focused and clicked.
	 *
	 * <h3>Usage</h3>
	 *
	 * 1. <b>Get familiar with the icons collections.</b> <br>
	 * Before displaying an icon, you need to explore the icons collections to find and import the desired icon. <br>
	 * Currently there are 3 icons collection, available as 3 npm packages: <br>
	 *
	 *
	 *
	 * <ul>
	 *     <li>
	 *         {@link https://www.npmjs.com/package/@ui5/webcomponents-icons @ui5/webcomponents-icons} represents the "SAP-icons" collection and includes the following {@link demo:sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons icons}.
	 *     </li>
	 *     <li>
	 *         {@link https://www.npmjs.com/package/@ui5/webcomponents-icons-tnt @ui5/webcomponents-icons-tnt} represents the "tnt" collection and includes the following {@link demo:sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT icons}.
	 *     </li>
	 *     <li>
	 *         {@link https://www.npmjs.com/package/@ui5/webcomponents-icons-business-suite @ui5/webcomponents-icons-icons-business-suite} represents the "business-suite" collection and includes the following {@link https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols icons}.
	 *     </li>
	 * </ul>
	 *
	 * 2. <b>After exploring the icons collections, add one or more of the packages as dependencies to your project.</b> <br>
	 * <code>npm i @ui5/webcomponents-icons</code><br>
	 * <code>npm i @ui5/webcomponents-icons-tnt</code><br>
	 * <code>npm i @ui5/webcomponents-icons-business-suite</code> <br>
	 * <br>
	 *
	 *
	 *
	 * <b>For Example</b>: <br>
	 *
	 *
	 *
	 *
	 *
	 * 4. <b>Display the icon using the <code>sap.ui.webc.main.Icon</code> web component.</b><br>
	 * Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)<br>
	 * and the icon name to the <code>name</code> property. <br>
	 * <br>
	 *
	 *
	 * <code>&lt;ui5-icon name="employee">&lt;/ui5-icon></code><br>
	 * <code>&lt;ui5-icon name="tnt/antenna">&lt;/ui5-icon></code><br>
	 * <code>&lt;ui5-icon name="business-suite/ab-testing">&lt;/ui5-icon></code>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 * <ul>
	 *     <li>[SPACE, ENTER, RETURN] - Fires the <code>click</code> event if the <code>interactive</code> property is set to true.</li>
	 *     <li>[SHIFT] - If [SPACE] or [ENTER],[RETURN] is pressed, pressing [SHIFT] releases the ui5-icon without triggering the click event.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Icon
	 * @implements sap.ui.webc.main.IIcon
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Icon = WebComponent.extend("sap.ui.webc.main.Icon", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-icon-ui5",
			interfaces: [
				"sap.ui.webc.main.IIcon"
			],
			properties: {

				/**
				 * Defines the text alternative of the component. If not provided a default text alternative will be set, if present. <br>
				 * <br>
				 * <b>Note:</b> Every icon should have a text alternative in order to calculate its accessible name.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the accessibility role of the component.
				 */
				accessibleRole: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the background color of the control
				 */
				backgroundColor: {
					type: "sap.ui.core.CSSColor",
					mapping: "style"
				},

				/**
				 * Defines the color of the control
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					mapping: "style"
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines if the icon is interactive (focusable and pressable)
				 */
				interactive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the unique identifier (icon name) of the component. <br>
				 *
				 *
				 * To browse all available icons, see the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons SAP Icons}, {@link demo:sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT SAP TNT Icons} and {@link https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols SAP Business Suite Icons} collections. <br>
				 *
				 *
				 * Example: <br>
				 * <code>name='add'</code>, <code>name='delete'</code>, <code>name='employee'</code>. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> To use the SAP Fiori Tools icons, you need to set the <code>tnt</code> prefix in front of the icon's name. <br>
				 *
				 *
				 * Example: <br>
				 * <code>name='tnt/antenna'</code>, <code>name='tnt/actor'</code>, <code>name='tnt/api'</code>. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> To use the SAP Business Suite icons, you need to set the <code>business-suite</code> prefix in front of the icon's name. <br>
				 *
				 *
				 * Example: <br>
				 * <code>name='business-suite/3d'</code>, <code>name='business-suite/1x2-grid-layout'</code>, <code>name='business-suite/4x4-grid-layout'</code>.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component should have a tooltip.
				 */
				showTooltip: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			events: {

				/**
				 * Fired when the user clicks the control
				 */
				click: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */

	Icon.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};

	/* CUSTOM CODE END */

	return Icon;
});