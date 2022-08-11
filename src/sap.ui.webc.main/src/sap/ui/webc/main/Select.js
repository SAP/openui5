/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Select.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/Select",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>Select</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.Select</code> component is used to create a drop-down list. The items inside the <code>sap.ui.webc.main.Select</code> define the available options by using the <code>sap.ui.webc.main.Option</code> component.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.Select</code> provides advanced keyboard handling. <br>
	 *
	 * <ul>
	 *     <li>[F4, ALT+UP, ALT+DOWN, SPACE, ENTER] - Opens/closes the drop-down.</li>
	 *     <li>[UP, DOWN] - If the drop-down is closed - changes selection to the next or the previous option. If the drop-down is opened - moves focus to the next or the previous option.</li>
	 *     <li>[SPACE, ENTER] - If the drop-down is opened - selects the focused option.</li>
	 *     <li>[ESC] - Closes the drop-down without changing the selection.</li>
	 *     <li>[HOME] - Navigates to first option</li>
	 *     <li>[END] - Navigates to the last option</li>
	 * </ul> <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Select
	 * @implements sap.ui.core.IFormContent
	 */
	var Select = WebComponent.extend("sap.ui.webc.main.Select", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-select-ui5",
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
				 * Determines the name with which the component will be submitted in an HTML form. The value of the component will be the value of the currently selected <code>sap.ui.webc.main.Option</code>.
				 *
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> When set, a native <code>input</code> HTML element will be created inside the <code>sap.ui.webc.main.Select</code> so that it can be submitted as part of an HTML form. Do not use this property unless you need to submit a form.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component is required.
				 */
				required: {
					type: "boolean",
					defaultValue: false
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
			defaultAggregation: "options",
			aggregations: {

				/**
				 * Defines the component options.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Only one selected option is allowed. If more than one option is defined as selected, the last one would be considered as the selected one.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Use the <code>sap.ui.webc.main.Option</code> component to define the desired options.
				 */
				options: {
					type: "sap.ui.webc.main.ISelectOption",
					multiple: true
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
				 * Fired when the selected option changes.
				 */
				change: {
					parameters: {
						/**
						 * the selected option.
						 */
						selectedOption: {
							type: "HTMLElement"
						}
					}
				}
			},
			getters: ["selectedOption"]
		}
	});

	/**
	 * Returns the currently selected option.
	 * @public
	 * @name sap.ui.webc.main.Select#getSelectedOption
	 * @function
	 */

	EnabledPropagator.call(Select.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Select;
});