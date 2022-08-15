/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Switch.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/Switch"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	var SwitchDesign = library.SwitchDesign;

	/**
	 * Constructor for a new <code>Switch</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.Switch</code> component is used for changing between binary states. <br>
	 * The component can display texts, that will be switched, based on the component state, via the <code>textOn</code> and <code>textOff</code> properties, but texts longer than 3 letters will be cutted off. <br>
	 * However, users are able to customize the width of <code>sap.ui.webc.main.Switch</code> with pure CSS (<code>&lt;ui5-switch style="width: 200px"></code>), and set widths, depending on the texts they would use. <br>
	 * Note: the component would not automatically stretch to fit the whole text width.
	 *
	 * <h3>Keyboard Handling</h3> The state can be changed by pressing the Space and Enter keys.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Switch</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>slider - Used to style the track, where the handle is being slid</li>
	 *     <li>text-on - Used to style the <code>textOn</code> property text</li>
	 *     <li>text-off - Used to style the <code>textOff</code> property text</li>
	 *     <li>handle - Used to style the handle of the switch</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Switch
	 * @implements sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Switch = WebComponent.extend("sap.ui.webc.main.Switch", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-switch-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Sets the accessible aria name of the component.
				 *
				 * <b>Note</b>: We recommend that you set an accessibleNameRef pointing to an external label or at least an <code>accessibleName</code>. Providing an <code>ariaLabelledBy</code> or an <code>accessibleName</code> is mandatory in the cases when <code>textOn</code> and <code>textOff</code> properties aren't set.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines if the component is checked. <br>
				 * <br>
				 * <b>Note:</b> The property can be changed with user interaction, either by cliking the component, or by pressing the <code>Enter</code> or <code>Space</code> key.
				 */
				checked: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the component design. <br>
				 * <br>
				 * <b>Note:</b> If <code>Graphical</code> type is set, positive and negative icons will replace the <code>textOn</code> and <code>textOff</code>.
				 */
				design: {
					type: "sap.ui.webc.main.SwitchDesign",
					defaultValue: SwitchDesign.Textual
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the text, displayed when the component is not checked. <br>
				 * <br>
				 * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off). <b>Note:</b> This property will have no effect if the theme is set to <code>sap_horizon</code>.
				 */
				textOff: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the text, displayed when the component is checked.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off). <b>Note:</b> This property will have no effect if the theme is set to <code>sap_horizon</code>.
				 */
				textOn: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
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
				 * Fired when the component checked state changes.
				 */
				change: {
					parameters: {}
				}
			}
		}
	});

	EnabledPropagator.call(Switch.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Switch;
});