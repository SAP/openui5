/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ToggleButton.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ToggleButton"
], function(WebComponent, library) {
	"use strict";

	var ButtonDesign = library.ButtonDesign;

	/**
	 * Constructor for a new <code>ToggleButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.ToggleButton</code> component is an enhanced <code>sap.ui.webc.main.Button</code> that can be toggled between pressed and normal states. Users can use the <code>sap.ui.webc.main.ToggleButton</code> as a switch to turn a setting on or off. It can also be used to represent an independent choice similar to a check box. <br>
	 * <br>
	 * Clicking or tapping on a <code>sap.ui.webc.main.ToggleButton</code> changes its state to <code>pressed</code>. The button returns to its initial state when the user clicks or taps on it again. By applying additional custom CSS-styling classes, apps can give a different style to any <code>sap.ui.webc.main.ToggleButton</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ToggleButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ToggleButton = WebComponent.extend("sap.ui.webc.main.ToggleButton", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toggle-button-ui5",
			properties: {

				/**
				 * Sets the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines the component design.
				 *
				 * <br>
				 * <br>
				 * <b>The available values are:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>Default</code></li>
				 *     <li><code>Emphasized</code></li>
				 *     <li><code>Positive</code></li>
				 *     <li><code>Negative</code></li>
				 *     <li><code>Transparent</code></li>
				 *     <li><code>Attention</code></li>
				 * </ul>
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
				 * Defines whether the icon should be displayed after the component text.
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
				 *
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
			associations: {

				/**
				 * Receives id(or many ids) of the controls that label this control.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
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

	return ToggleButton;
});