/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TimePicker.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/TimePicker"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>TimePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.TimePicker</code> component provides an input field with assigned sliders which are opened on user action. The <code>sap.ui.webc.main.TimePicker</code> allows users to select a localized time using touch, mouse, or keyboard input. It consists of two parts: the time input field and the sliders.
	 *
	 * <h3>Usage</h3> The user can enter a time by:
	 * <ul>
	 *     <li>Using the sliders that are displayed in a popup</li>
	 *     <li>Typing it in directly in the input field</li>
	 * </ul> <br>
	 * <br>
	 * When the user makes an entry and chooses the enter key, the sliders shows the corresponding time. When the user directly triggers the sliders display, the actual time is displayed. For the <code>sap.ui.webc.main.TimePicker</code>
	 *
	 * <h3>Formatting</h3>
	 *
	 * If a time is entered by typing it into the input field, it must fit to the used time format. <br>
	 * <br>
	 * Supported format options are pattern-based on Unicode LDML Date Format notation. For more information, see {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table UTS #35: Unicode Locale Data Markup Language}. <br>
	 * <br>
	 * For example, if the <code>format-pattern</code> is "HH:mm:ss", a valid value string is "11:42:35" and the same is displayed in the input.
	 *
	 * <h3>Keyboard handling</h3> [F4], [ALT]+[UP], [ALT]+[DOWN] Open/Close picker dialog and move focus to it. <br>
	 * When closed:
	 * <ul>
	 *     <li>[PAGEUP] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.</li>
	 *     <li>[PAGEDOWN] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.</li>
	 *     <li>[SHIFT]+[PAGEUP] Increments minutes by 1.</li>
	 *     <li>[SHIFT]+ [PAGEDOWN] Decrements minutes by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEUP] Increments seconds by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+ [PAGEDOWN] Decrements seconds by 1.</li>
	 * </ul> When opened:
	 * <ul>
	 *     <li>[UP] If focus is on one of the selection lists: Select the value which is above the current value. If the first value is selected, select the last value in the list. Exception: AM/ PM List: stay on the first item.</li>
	 *     <li>[DOWN] If focus is on one of the selection lists: Select the value which is below the current value. If the last value is selected, select the first value in the list. Exception: AM/ PM List: stay on the last item.</li>
	 *     <li>[LEFT] If focus is on one of the selection lists: Move focus to the selection list which is left of the current selection list. If focus is at the first selection list, move focus to the last selection list.</li>
	 *     <li>[RIGHT] If focus is on one of the selection lists: Move focus to the selection list which is right of the current selection list. When focus is at the last selection list, move focus to the first selection list.</li>
	 *     <li>[PAGEUP] If focus is on one of the selection lists: Move focus to the first entry of this list.</li>
	 *     <li>[PAGEDOWN] If focus is on one of the selection lists: Move focus to the last entry of this list.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TimePicker
	 * @implements sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TimePicker = WebComponent.extend("sap.ui.webc.main.TimePicker", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-time-picker-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

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
				 * Determines the format, displayed in the input field.
				 *
				 * Example: HH:mm:ss -> 11:42:35 hh:mm:ss a -> 2:23:15 PM mm:ss -> 12:04 (only minutes and seconds)
				 */
				formatPattern: {
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
				 * Determines whether the <code>sap.ui.webc.main.TimePicker</code> is displayed as readonly.
				 */
				readonly: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines a formatted time value.
				 */
				value: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Defines the value state of the <code>sap.ui.webc.main.TimePicker</code>. <br>
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
			events: {

				/**
				 * Fired when the input operation has finished by clicking the "OK" button or when the text in the input field has changed and the focus leaves the input field.
				 */
				change: {
					parameters: {}
				},

				/**
				 * Fired when the value of the <code>sap.ui.webc.main.TimePicker</code> is changed at each key stroke.
				 */
				input: {
					parameters: {}
				}
			},
			methods: ["closePicker", "formatValue", "isOpen", "isValid", "openPicker"],
			getters: ["dateValue"]
		}
	});

	/**
	 * Closes the picker
	 * @public
	 * @name sap.ui.webc.main.TimePicker#closePicker
	 * @function
	 */

	/**
	 * Formats a Java Script date object into a string representing a locale date and time according to the <code>formatPattern</code> property of the TimePicker instance
	 * @param {object} date A Java Script date object to be formatted as string
	 * @public
	 * @name sap.ui.webc.main.TimePicker#formatValue
	 * @function
	 */

	/**
	 * Checks if the picker is open
	 * @public
	 * @name sap.ui.webc.main.TimePicker#isOpen
	 * @function
	 */

	/**
	 * Checks if a value is valid against the current <code>formatPattern</code> value.
	 *
	 * <br>
	 * <br>
	 * <b>Note:</b> an empty string is considered as valid value.
	 * @param {string} value The value to be tested against the current date format
	 * @public
	 * @name sap.ui.webc.main.TimePicker#isValid
	 * @function
	 */

	/**
	 * Opens the picker.
	 * @public
	 * @name sap.ui.webc.main.TimePicker#openPicker
	 * @function
	 */

	/**
	 * Returns the currently selected time represented as JavaScript Date instance
	 * @public
	 * @name sap.ui.webc.main.TimePicker#getDateValue
	 * @function
	 */

	EnabledPropagator.call(TimePicker.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TimePicker;
});