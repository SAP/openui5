/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.StepInput.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/StepInput",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>StepInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.StepInput</code> consists of an input field and buttons with icons to increase/decrease the value with the predefined step. <br>
	 * <br>
	 * The user can change the value of the component by pressing the increase/decrease buttons, by typing a number directly, by using the keyboard up/down and page up/down, or by using the mouse scroll wheel. Decimal values are supported.
	 *
	 * <h3>Usage</h3>
	 *
	 * The default step is 1 but the app developer can set a different one.
	 *
	 * App developers can set a maximum and minimum value for the <code>StepInput</code>. The increase/decrease button and the up/down keyboard navigation become disabled when the value reaches the max/min or a new value is entered from the input which is greater/less than the max/min. <br>
	 * <br>
	 * <h4>When to use:</h4>
	 * <ul>
	 *     <li>To adjust amounts, quantities, or other values quickly.</li>
	 *     <li>To adjust values for a specific step.</li>
	 * </ul>
	 *
	 * <h4>When not to use:</h4>
	 * <ul>
	 *     <li>To enter a static number (for example, postal code, phone number, or ID). In this case, use the regular <code>sap.ui.webc.main.Input</code> instead.</li>
	 *     <li>To display a value that rarely needs to be adjusted and does not pertain to a particular step. In this case, use the regular <code>sap.ui.webc.main.Input</code> instead.</li>
	 *     <li>To enter dates and times. In this case, use date/time related components instead.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.StepInput
	 * @implements sap.ui.core.IFormContent
	 */
	var StepInput = WebComponent.extend("sap.ui.webc.main.StepInput", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-step-input-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
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
				 * Defines a maximum value of the component.
				 */
				max: {
					type: "float"
				},

				/**
				 * Defines a minimum value of the component.
				 */
				min: {
					type: "float"
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
				 * Defines a short hint, intended to aid the user with data entry when the component has no value.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> When no placeholder is set, the format pattern is displayed as a placeholder. Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern.
				 */
				placeholder: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Determines whether the component is displayed as read-only.
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
				 * Defines a step of increasing/decreasing the value of the component.
				 */
				step: {
					type: "float",
					defaultValue: 1
				},

				/**
				 * Defines a value of the component.
				 */
				value: {
					type: "float",
					defaultValue: 0
				},

				/**
				 * Determines the number of digits after the decimal point of the component.
				 */
				valuePrecision: {
					type: "int",
					defaultValue: 0
				},

				/**
				 * Defines the value state of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>Error</code></li>
				 *     <li><code>Warning</code></li>
				 *     <li><code>Success</code></li>
				 *     <li><code>Information</code></li>
				 * </ul>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the value state message that will be displayed as pop up under the contorl.
				 * <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
				 */
				valueStateMessage: {
					type: "string",
					defaultValue: "",
					mapping: {
						type: "slot",
						to: "div"
					}
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
				 * Fired when the input operation has finished by pressing Enter or on focusout.
				 */
				change: {
					parameters: {}
				}
			}
		}
	});

	EnabledPropagator.call(StepInput.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return StepInput;
});