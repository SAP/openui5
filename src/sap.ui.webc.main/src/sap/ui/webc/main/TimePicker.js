/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TimePicker.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
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
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.TimePicker</code> component provides an input field with assigned clocks which are opened on user action. The <code>sap.ui.webc.main.TimePicker</code> allows users to select a localized time using touch, mouse, or keyboard input. It consists of two parts: the time input field and the clocks.
	 *
	 * <h3>Usage</h3> The user can enter a time by:
	 * <ul>
	 *     <li>Using the clocks that are displayed in a popup</li>
	 *     <li>Typing it in directly in the input field</li>
	 * </ul> <br>
	 * <br>
	 * When the user makes an entry and chooses the enter key, the clocks show the corresponding time (hours, minutes and seconds separately). When the user directly triggers the clocks display, the actual time is displayed. For the <code>sap.ui.webc.main.TimePicker</code>
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
	 *     <li>[SHIFT]+[PAGEUP] - Increments minutes by 1.</li>
	 *     <li>[SHIFT]+[PAGEDOWN] - Decrements minutes by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEUP] - Increments seconds by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEDOWN] - Decrements seconds by 1.</li>
	 *     <li>
	 * </ul> When opened:
	 * <ul>
	 *     <li>[PAGEUP] - Increments hours by 1. If 12 am is reached, increment hours to 1 pm and vice versa.</li>
	 *     <li>[PAGEDOWN] - Decrements the corresponding field by 1. If 1 pm is reached, decrement hours to 12 am and vice versa.</li>
	 *     <li>[SHIFT]+[PAGEUP] - Increments minutes by 1.</li>
	 *     <li>[SHIFT]+[PAGEDOWN] - Decrements minutes by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEUP] - Increments seconds by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEDOWN] - Decrements seconds by 1.</li>
	 *     <li>[A] or [P] - Selects AM or PM respectively.</li>
	 *     <li>[0]-[9] - Allows direct time selecting (hours/minutes/seconds).</li>
	 *     <li>[:] - Allows switching between hours/minutes/seconds clocks. If the last clock is displayed and [:] is pressed, the first clock is beind displayed.</li>
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
						type: "property",
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
					parameters: {
						/**
						 * The submitted value.
						 */
						value: {
							type: "string"
						},

						/**
						 * Indicator if the value is in correct format pattern and in valid range.
						 */
						valid: {
							type: "boolean"
						}
					}
				},

				/**
				 * Fired when the value of the <code>sap.ui.webc.main.TimePicker</code> is changed at each key stroke.
				 */
				input: {
					parameters: {
						/**
						 * The current value.
						 */
						value: {
							type: "string"
						},

						/**
						 * Indicator if the value is in correct format pattern and in valid range.
						 */
						valid: {
							type: "boolean"
						}
					}
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
	 * @param {Date} date A Java Script date object to be formatted as string
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
