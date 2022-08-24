/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ComboBox.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/ComboBox"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>ComboBox</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.ComboBox</code> component represents a drop-down menu with a list of the available options and a text input field to narrow down the options.
	 *
	 * It is commonly used to enable users to select an option from a predefined list.
	 *
	 * <h3>Structure</h3> The <code>sap.ui.webc.main.ComboBox</code> consists of the following elements:
	 * <ul>
	 *     <li> Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.
	 *     <li> Drop-down arrow - expands\collapses the option list.</li>
	 *     <li> Option list - the list of available options.</li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * The <code>sap.ui.webc.main.ComboBox</code> provides advanced keyboard handling. <br>
	 *
	 *
	 *
	 * <ul>
	 *     <li>[F4], [ALT]+[UP], or [ALT]+[DOWN] - Toggles the picker.</li>
	 *     <li>[ESC] - Closes the picker, if open. If closed, cancels changes and reverts the typed in value.</li>
	 *     <li>[ENTER] or [RETURN] - If picker is open, takes over the currently selected item and closes it.</li>
	 *     <li>[DOWN] - Selects the next matching item in the picker.</li>
	 *     <li>[UP] - Selects the previous matching item in the picker.</li>
	 *     <li>[PAGEDOWN] - Moves selection down by page size (10 items by default).</li>
	 *     <li>[PAGEUP] - Moves selection up by page size (10 items by default). </li>
	 *     <li>[HOME] - If focus is in the ComboBox, moves cursor at the beginning of text. If focus is in the picker, selects the first item.</li>
	 *     <li>[END] - If focus is in the ComboBox, moves cursor at the end of text. If focus is in the picker, selects the last item.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ComboBox
	 * @implements sap.ui.core.IFormContent
	 */
	var ComboBox = WebComponent.extend("sap.ui.webc.main.ComboBox", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-combobox-ui5",
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
				 * Defines the filter type of the component. Available options are: <code>StartsWithPerTerm</code>, <code>StartsWith</code> and <code>Contains</code>.
				 */
				filter: {
					type: "string",
					defaultValue: "StartsWithPerTerm"
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
				 * Fired when the input operation has finished by pressing Enter, focusout or an item is selected.
				 */
				change: {
					parameters: {}
				},

				/**
				 * Fired when typing in input. <br>
				 * <br>
				 * <b>Note:</b> filterValue property is updated, input is changed.
				 */
				input: {
					parameters: {}
				},

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

	EnabledPropagator.call(ComboBox.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ComboBox;
});