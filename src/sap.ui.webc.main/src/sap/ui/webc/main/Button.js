/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Button.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/Button"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var TextDirection = coreLibrary.TextDirection;
	var ButtonDesign = library.ButtonDesign;

	/**
	 * Constructor for a new <code>Button</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Button</code> component represents a simple push button. It enables users to trigger actions by clicking or tapping the <code>sap.ui.webc.main.Button</code>, or by pressing certain keyboard keys, such as Enter.
	 *
	 * <h3>Usage</h3>
	 *
	 * For the <code>sap.ui.webc.main.Button</code> UI, you can define text, icon, or both. You can also specify whether the text or the icon is displayed first. <br>
	 * <br>
	 * You can choose from a set of predefined types that offer different styling to correspond to the triggered action. <br>
	 * <br>
	 * You can set the <code>sap.ui.webc.main.Button</code> as enabled or disabled. An enabled <code>sap.ui.webc.main.Button</code> can be pressed by clicking or tapping it. The button changes its style to provide visual feedback to the user that it is pressed or hovered over with the mouse cursor. A disabled <code>sap.ui.webc.main.Button</code> appears inactive and cannot be pressed.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Button</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>button - Used to style the native button element</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Button
	 * @implements sap.ui.webc.main.IButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Button = WebComponent.extend("sap.ui.webc.main.Button", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-button-ui5",
			interfaces: [
				"sap.ui.webc.main.IButton"
			],
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
				 * Specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
				 */
				textDirection: {
					type: "sap.ui.core.TextDirection",
					defaultValue: TextDirection.Inherit,
					mapping: {
						type: "attribute",
						to: "dir",
						formatter: "_mapTextDirection"
					}
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

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Button;
});