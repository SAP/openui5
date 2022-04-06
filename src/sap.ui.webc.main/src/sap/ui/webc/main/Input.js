/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Input.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/Input",
	"./thirdparty/features/InputElementsFormSupport",
	"./thirdparty/features/InputSuggestions"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var InputType = library.InputType;

	/**
	 * Constructor for a new <code>Input</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Input</code> component allows the user to enter and edit text or numeric values in one line. <br>
	 * Additionally, you can provide <code>suggestionItems</code>, that are displayed in a popover right under the input. <br>
	 * <br>
	 * The text field can be editable or read-only (<code>readonly</code> property), and it can be enabled or disabled (<code>disabled</code> property). To visualize semantic states, such as "error" or "warning", the <code>valueState</code> property is provided. When the user makes changes to the text, the change event is fired, which enables you to react on any text change. <br>
	 * <br>
	 * <b>Note:</b> If you are using the <code>sap.ui.webc.main.Input</code> as a single npm module, don't forget to import the <code>InputSuggestions</code> module from "@ui5/webcomponents/dist/features/InputSuggestions.js" to enable the suggestions functionality.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.Input</code> provides the following keyboard shortcuts: <br>
	 *
	 *
	 *
	 * <ul>
	 *     <li>[ESC] - Closes the suggestion list, if open. If closed or not enabled, cancels changes and reverts to the value which the Input field had when it got the focus.</li>
	 *     <li>[ENTER] or [RETURN] - If suggestion list is open takes over the current matching item and closes it. If value state or group header is focused, does nothing.</li>
	 *     <li>[DOWN] - Focuses the next matching item in the suggestion list.</li>
	 *     <li>[UP] - Focuses the previous matching item in the suggestion list.</li>
	 *     <li>[HOME] - If focus is in the text input, moves caret before the first character. If focus is in the list, highlights the first item and updates the input accordingly.</li>
	 *     <li>[END] - If focus is in the text input, moves caret after the last character. If focus is in the list, highlights the last item and updates the input accordingly.</li>
	 *     <li>[PAGEUP] - If focus is in the list, moves highlight up by page size (10 items by default). If focus is in the input, does nothing.</li>
	 *     <li>[PAGEDOWN] - If focus is in the list, moves highlight down by page size (10 items by default). If focus is in the input, does nothing.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Input
	 * @implements sap.ui.webc.main.IInput, sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Input = WebComponent.extend("sap.ui.webc.main.Input", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-input-ui5",
			interfaces: [
				"sap.ui.webc.main.IInput",
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
				 * Sets the maximum number of characters available in the input field.
				 */
				maxlength: {
					type: "int"
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
				 * Defines whether the clear icon of the input will be shown.
				 */
				showClearIcon: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the component should show suggestions, if such are present. <br>
				 * <br>
				 * <b>Note:</b> You need to import the <code>InputSuggestions</code> module from <code>"@ui5/webcomponents/dist/features/InputSuggestions.js"</code> to enable this functionality.
				 */
				showSuggestions: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the HTML type of the component. Available options are: <code>Text</code>, <code>Email</code>, <code>Number</code>, <code>Password</code>, <code>Tel</code>, and <code>URL</code>. <br>
				 * <br>
				 * <b>Notes:</b>
				 * <ul>
				 *     <li>The particular effect of this property differs depending on the browser and the current language settings, especially for type <code>Number</code>.</li>
				 *     <li>The property is mostly intended to be used with touch devices that use different soft keyboard layouts depending on the given input type.</li>
				 * </ul>
				 */
				type: {
					type: "sap.ui.webc.main.InputType",
					defaultValue: InputType.Text
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
			defaultAggregation: "suggestionItems",
			aggregations: {

				/**
				 * Defines the icon to be displayed in the component.
				 */
				icon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: true,
					slot: "icon"
				},

				/**
				 *
				 */
				suggestionItems: {
					type: "sap.ui.webc.main.IInputSuggestionItem",
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
				 * Fired when the value of the component changes at each keystroke, and when a suggestion item has been selected.
				 */
				input: {
					parameters: {}
				},

				/**
				 * Fired when the user navigates to a suggestion item via the ARROW keys, as a preview, before the final selection.
				 */
				suggestionItemPreview: {
					parameters: {
						/**
						 * The previewed suggestion item.
						 */
						item: {
							type: "HTMLElement"
						},

						/**
						 * The DOM ref of the suggestion item.
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when a suggestion item, that is displayed in the suggestion popup, is selected.
				 */
				suggestionItemSelect: {
					parameters: {
						/**
						 * The selected item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				}
			},
			methods: ["openPicker"],
			getters: ["previewItem"],
			designtime: "sap/ui/webc/main/designtime/Input.designtime"
		}
	});

	/**
	 * Manually opens the suggestions popover, assuming suggestions are enabled. Items must be preloaded for it to open.
	 * @public
	 * @name sap.ui.webc.main.Input#openPicker
	 * @function
	 */

	/**
	 * Returns the the suggestion item on preview.
	 * @public
	 * @name sap.ui.webc.main.Input#getPreviewItem
	 * @function
	 */

	EnabledPropagator.call(Input.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Input;
});