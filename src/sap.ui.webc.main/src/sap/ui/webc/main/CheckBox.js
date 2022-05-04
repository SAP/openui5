/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.CheckBox.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/CheckBox",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new <code>CheckBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * Allows the user to set a binary value, such as true/false or yes/no for an item. <br>
	 * <br>
	 * The <code>sap.ui.webc.main.CheckBox</code> component consists of a box and a label that describes its purpose. If it's checked, an indicator is displayed inside the box. To check/uncheck the <code>sap.ui.webc.main.CheckBox</code>, the user has to click or tap the square box or its label. <br>
	 * <br>
	 * The <code>sap.ui.webc.main.CheckBox</code> component only has 2 states - checked and unchecked. Clicking or tapping toggles the <code>sap.ui.webc.main.CheckBox</code> between checked and unchecked state.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can define the checkbox text with via the <code>text</code> property. If the text exceeds the available width, it is truncated by default. In case you prefer text to wrap, set the <code>wrappingType</code> property to "Normal". The touchable area for toggling the <code>sap.ui.webc.main.CheckBox</code> ends where the text ends. <br>
	 * <br>
	 * You can disable the <code>sap.ui.webc.main.CheckBox</code> by setting the <code>disabled</code> property to <code>true</code>, or use the <code>sap.ui.webc.main.CheckBox</code> in read-only mode by setting the <code>readonly</code> property to <code>true</code>.
	 *
	 * <br>
	 * <br>
	 * <h3>Keyboard Handling</h3>
	 *
	 * The user can use the following keyboard shortcuts to toggle the checked state of the <code>sap.ui.webc.main.CheckBox</code>.
	 * <ul>
	 *     <li>[SPACE, ENTER] - Toggles between different states: checked, not checked.</li>
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
	 * @alias sap.ui.webc.main.CheckBox
	 * @implements sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CheckBox = WebComponent.extend("sap.ui.webc.main.CheckBox", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-checkbox-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines if the component is checked. <br>
				 * <br>
				 * <b>Note:</b> The property can be changed with user interaction, either by cliking/tapping on the component, or by pressing the Enter or Space key.
				 */
				checked: {
					type: "boolean",
					defaultValue: false
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
				 * Defines whether the component is displayed as partially checked. <br>
				 * <br>
				 * <b>Note:</b> The indeterminate state can be set only programatically and can’t be achieved by user interaction and the resulting visual state depends on the values of the <code>indeterminate</code> and <code>checked</code> properties:
				 * <ul>
				 *     <li> If the component is checked and indeterminate, it will be displayed as partially checked
				 *     <li> If the component is checked and it is not indeterminate, it will be displayed as checked
				 *     <li> If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute
				 * </ul>
				 */
				indeterminate: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the name with which the component will be submitted in an HTML form.
				 *
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> When set, a native <code>input</code> HTML element will be created inside the component so that it can be submitted as part of an HTML form. Do not use this property unless you need to submit a form.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component is read-only. <br>
				 * <br>
				 * <b>Note:</b> A red-only component is not editable, but still provides visual feedback upon user interaction.
				 */
				readonly: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the component is required.
				 */
				required: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the value state of the component.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>Warning</code></li>
				 *     <li><code>Error</code></li>
				 *     <li><code>None</code>(default)</li>
				 *     <li><code>Success</code></li>
				 *     <li><code>Information</code></li>
				 * </ul>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines whether the component text wraps when there is not enough space. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>None</code> - The text will be truncated with an ellipsis.</li>
				 *     <li><code>Normal</code> - The text will wrap. The words will not be broken based on hyphenation.</li>
				 * </ul>
				 */
				wrappingType: {
					type: "sap.ui.webc.main.WrappingType",
					defaultValue: WrappingType.None
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

	EnabledPropagator.call(CheckBox.prototype);

	/* CUSTOM CODE START */

	/**
	 * Checkbox without label must not be stretched in Form.
	 * @returns {boolean} True if the <code>Form</code> should not adjust the width of the CheckBox component wrapper
	 */
	CheckBox.prototype.getFormDoNotAdjustWidth = function() {
		return this.getText() ? false : true;
	};

	/* CUSTOM CODE END */

	return CheckBox;
});