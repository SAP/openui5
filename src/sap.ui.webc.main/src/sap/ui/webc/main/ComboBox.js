/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ComboBox.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/ComboBox"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>ComboBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.webc.common.WebComponent
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.ComboBox</code> component represents a drop-down menu with a list of the available options and a text input field to narrow down the options.
	 *
	 * It is commonly used to enable users to select one or more options from a predefined list. <h3>Structure</h3> The <code>sap.ui.webc.main.ComboBox</code> consists of the following elements:
	 * <ul>
	 *     <li> Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.
	 *     <li> Drop-down arrow - expands\collapses the option list.</li>
	 *     <li> Option list - the list of available options.</li>
	 * </ul>
	 * <h3>Keyboard Handling</h3>
	 *
	 * The <code>sap.ui.webc.main.ComboBox</code> provides advanced keyboard handling.
	 *
	 * <h4>Picker</h4> If the <code>sap.ui.webc.main.ComboBox</code> is focused, you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys. <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimantal Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ComboBox
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComboBox = WebComponent.extend("sap.ui.webc.main.ComboBox", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-combobox-ui5",
			properties: {

				/**
				 * Defines whether the component is in disabled state. <br>
				 * <br>
				 * <b>Note:</b> A disabled component is completely uninteractive.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the filter type of the component. Available options are: <code>StartsWithPerTerm</code>, <code>StartsWith</code> and <code>Contains</code>.
				 */
				filter: {
					type: "string",
					defaultValue: "StartsWithPerTerm"
				},

				/**
				 * Defines the "live" value of the component. <br>
				 * <br>
				 * <b>Note:</b> The property is updated upon typing.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> Initially the filter value is synced with value.
				 */
				filterValue: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Indicates whether a loading indicator should be shown in the picker.
				 */
				loading: {
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
				 * Defines whether the component is readonly. <br>
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
				 * Defines the value of the component.
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
					defaultValue: null,
					mapping: "style"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the icon to be displayed in the input field.
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
					type: "sap.ui.webc.main.IComboBoxItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the input operation has finished by pressing Enter, focusout or an item is selected.
				 */
				change: {},

				/**
				 * Fired when typing in input. <br>
				 * <br>
				 * <b>Note:</b> filterValue property is updated, input is changed.
				 */
				input: {},

				/**
				 * Fired when selection is changed by user interaction
				 */
				selectionChange: {
					parameters: {
						/**
						 * item to be selected.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				}
			}
		}
	});

	return ComboBox;
});