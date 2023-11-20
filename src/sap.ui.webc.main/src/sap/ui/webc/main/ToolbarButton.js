/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ToolbarButton.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/ToolbarButton"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var CSSSize = coreLibrary.CSSSize;
	var ButtonDesign = library.ButtonDesign;

	/**
	 * Constructor for a new <code>ToolbarButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.ToolbarButton</code> represents an abstract action, used in the <code>sap.ui.webc.main.Toolbar</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ToolbarButton
	 * @implements sap.ui.webc.main.IToolbarItem
	 */
	var ToolbarButton = WebComponent.extend("sap.ui.webc.main.ToolbarButton", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toolbar-button-ui5",
			interfaces: [
				"sap.ui.webc.main.IToolbarItem"
			],
			properties: {

				/**
				 * An object of strings that defines several additional accessibility attribute values for customization depending on the use case.
				 *
				 * It supports the following fields:
				 *
				 *
				 * <ul>
				 *     <li><code>expanded</code>: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed. Accepts the following string values:
				 *         <ul>
				 *             <li><code>true</code></li>
				 *             <li><code>false</code></li>
				 *         </ul>
				 *     </li>
				 *     <li><code>hasPopup</code>: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button. Accepts the following string values:
				 *         <ul>
				 *             <li><code>Dialog</code></li>
				 *             <li><code>Grid</code></li>
				 *             <li><code>ListBox</code></li>
				 *             <li><code>Menu</code></li>
				 *             <li><code>Tree</code></li>
				 *         </ul>
				 *     </li>
				 *     <li><code>controls</code>: Identifies the element (or elements) whose contents or presence are controlled by the button element. Accepts a string value.</li>
				 * </ul>
				 */
				accessibilityAttributes: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Defines the accessible ARIA name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Defines the action design. <b>The available values are:</b>
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
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "property",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the <code>icon</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous buil-in icons. To find all the available icons, see the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
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
				 * Button text
				 */
				text: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the width of the button. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> all CSS sizes are supported - 'percentage', 'px', 'rem', 'auto', etc.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: CSSSize.undefined
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

	EnabledPropagator.call(ToolbarButton.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ToolbarButton;
});
