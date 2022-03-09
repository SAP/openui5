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
	 * The <code>sap.ui.webc.main.Icon</code> component represents an SVG icon. There are two main scenarios how the <code>sap.ui.webc.main.Icon</code> component is used: as a purely decorative element; or as a visually appealing clickable area in the form of an icon button. <br>
	 * <br>
	 * A large set of built-in icons is available and they can be used by setting the <code>name</code> property on the <code>sap.ui.webc.main.Icon</code>. But before using an icon, you need to import the desired icon. <br>
	 *
	 *
	 *
	 *
	 * <br>
	 * <br>
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 * <ul>
	 *     <li>[SPACE, ENTER, RETURN] - Fires the <code>click</code> event if the <code>interactive</code> property is set to true.</li>
	 *     <li>[SHIFT] - If [SPACE] or [ENTER],[RETURN] is pressed, pressing [SHIFT] releases the ui5-icon without triggering the click event.</li>
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
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Defines the color of the control
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null,
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
				 * To browse all available icons, see the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>. <br>
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
				 * <code>name='tnt/antenna'</code>, <code>name='tnt/actor'</code>, <code>name='tnt/api'</code>.
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
					defaultValue: null,
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