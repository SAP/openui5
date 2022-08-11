/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.MultiComboBox.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/MultiComboBox"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>MultiComboBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.MultiComboBox</code> component consists of a list box with items and a text field allowing the user to either type a value directly into the text field, or choose from the list of existing items.
	 *
	 * The drop-down list is used for selecting and filtering values, it enables users to select one or more options from a predefined list. The control provides an editable input field to filter the list, and a dropdown arrow to expand/collapse the list of available options. The options in the list have checkboxes that permit multi-selection. Entered values are displayed as tokens. <h3>Structure</h3> The <code>sap.ui.webc.main.MultiComboBox</code> consists of the following elements:
	 * <ul>
	 *     <li> Tokenizer - a list of tokens with selected options.
	 *     <li> Input field - displays the selected option/s as token/s. Users can type to filter the list.
	 *     <li> Drop-down arrow - expands\collapses the option list.</li>
	 *     <li> Option list - the list of available options.</li>
	 * </ul>
	 * <h3>Keyboard Handling</h3>
	 *
	 * The <code>sap.ui.webc.main.MultiComboBox</code> provides advanced keyboard handling.
	 *
	 * <h4>Picker</h4> If the <code>sap.ui.webc.main.MultiComboBox</code> is focused, you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys. Once the drop-down is opened, you can use the <code>UP</code> and <code>DOWN</code> arrow keys to navigate through the available options and select one by pressing the <code>Space</code> or <code>Enter</code> keys. <br>
	 *
	 *
	 * <h4>Tokens</h4>
	 * <ul>
	 *     <li> Left/Right arrow keys - moves the focus selection form the currently focused token to the previous/next one (if available). </li>
	 *     <li> Delete - deletes the token and focuses the previous token. </li>
	 *     <li> Backspace - deletes the token and focus the next token. </li>
	 * </ul>
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.MultiComboBox</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>token-{index} - Used to style each token(where <code>token-0</code> corresponds to the first item)</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.MultiComboBox
	 * @implements sap.ui.core.IFormContent
	 */
	var MultiComboBox = WebComponent.extend("sap.ui.webc.main.MultiComboBox", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-multi-combobox-ui5",
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
				 * Defines if the user input will be prevented, if no matching item has been found
				 */
				allowCustomValues: {
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
				 * Defines the filter type of the component. Available options are: <code>StartsWithPerTerm</code>, <code>StartsWith</code>, <code>Contains</code> and <code>None</code>.
				 */
				filter: {
					type: "string",
					defaultValue: "StartsWithPerTerm"
				},

				/**
				 * Defines whether the value will be autcompleted to match an item
				 */
				noTypeahead: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the component has no value.
				 */
				placeholder: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component is read-only. <br>
				 * <br>
				 * <b>Note:</b> A read-only component is not editable, but still provides visual feedback upon user interaction.
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
				 * Defines the value of the component. <br>
				 * <br>
				 * <b>Note:</b> The property is updated upon typing.
				 */
				value: {
					type: "string",
					defaultValue: ""
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
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the icon to be displayed in the component.
				 */
				icon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: false,
					slot: "icon"
				},

				/**
				 * Defines the component items.
				 */
				items: {
					type: "sap.ui.webc.main.IMultiComboBoxItem",
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
				 * Fired when the input operation has finished by pressing Enter or on focusout.
				 */
				change: {
					parameters: {}
				},

				/**
				 * Fired when the value of the component changes at each keystroke.
				 */
				input: {
					parameters: {}
				},

				/**
				 * Fired when the dropdown is opened or closed.
				 */
				openChange: {
					parameters: {}
				},

				/**
				 * Fired when selection is changed by user interaction in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * an array of the selected items.
						 */
						items: {
							type: "Array"
						}
					}
				}
			},
			getters: ["open"]
		}
	});

	/**
	 * Returns the indicates whether the dropdown is open. True if the dropdown is open, false otherwise.
	 * @public
	 * @name sap.ui.webc.main.MultiComboBox#getOpen
	 * @function
	 */

	EnabledPropagator.call(MultiComboBox.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return MultiComboBox;
});