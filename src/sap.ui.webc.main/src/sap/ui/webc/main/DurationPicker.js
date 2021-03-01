/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.DurationPicker.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/DurationPicker"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DurationPicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.webc.common.WebComponent
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.DurationPicker</code> component provides an input field with assigned sliders which opens on user action. The <code>sap.ui.webc.main.DurationPicker</code> allows users to select a time duration. It consists of two parts: the time input field and the sliders.
	 *
	 * <h3>Usage</h3>
	 *
	 * The Duration Picker is used for input of time. Users are able to select hours, minutes and seconds. The user can enter a time by:
	 * <ul>
	 *     <li>Using the sliders that opens in a popup</li>
	 *     <li>Typing it in directly in the input field</li>
	 * </ul> <br>
	 * <br>
	 * When the user makes an entry and chooses the enter key, the sliders shows the corresponding time. When the user directly triggers the sliders display, the actual time is displayed.
	 *
	 * For the <code>sap.ui.webc.main.DurationPicker</code>
	 *
	 * <h3>Keyboard handling</h3> [F4], [ALT]+[UP], [ALT]+[DOWN] Open/Close picker dialog and move focus to it. <br>
	 * When closed:
	 * <ul>
	 *     <li>[PAGEUP] - Increments hours by 1. If max value is reached, the slider doesn't increment.</li>
	 *     <li>[PAGEDOWN] - Decrements the corresponding field by 1. If min value is reached, the slider doesn't increment.</li>
	 *     <li>[SHIFT]+[PAGEUP] Increments minutes by 1.</li>
	 *     <li>[SHIFT]+ [PAGEDOWN] Decrements minutes by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+[PAGEUP] Increments seconds by 1.</li>
	 *     <li>[SHIFT]+[CTRL]+ [PAGEDOWN] Decrements seconds by 1.</li>
	 * </ul> When opened:
	 * <ul>
	 *     <li>[UP] If focus is on one of the selection lists: Select the value which is above the current value. If the first value is selected, select the last value in the list.</li>
	 *     <li>[DOWN] If focus is on one of the selection lists: Select the value which is below the current value. If the last value is selected, select the first value in the list.</li>
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
	 * @experimantal Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.DurationPicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DurationPicker = WebComponent.extend("sap.ui.webc.main.DurationPicker", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-duration-picker-ui5",
			properties: {

				/**
				 * Determines whether the <code>sap.ui.webc.main.TimePicker</code> is displayed as disabled.
				 */
				disabled: {
					type: "boolean",
					defaultValue: false
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
				 * Defines whether the slider for hours will be available. By default there are sliders for hours, minutes and seconds.
				 */
				hideHours: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the slider for minutes will be available. By default there are sliders for hours, minutes and seconds.
				 */
				hideMinutes: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether a slider for seconds will be available. By default there are sliders for hours, minutes and seconds.
				 */
				hideSeconds: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines a formatted maximal time that the user will be able to adjust.
				 */
				maxValue: {
					type: "string",
					defaultValue: "23:59:59"
				},

				/**
				 * Defines the selection step for the minutes
				 */
				minutesStep: {
					type: "int",
					defaultValue: 1
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
				 * Defines the selection step for the seconds
				 */
				secondsStep: {
					type: "int",
					defaultValue: 1
				},

				/**
				 * Defines a formatted time value.
				 */
				value: {
					type: "string",
					defaultValue: "00:00:00"
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
					defaultValue: null,
					mapping: "style"
				}
			},
			events: {

				/**
				 * Fired when the input operation has finished by clicking the "OK" button or when the text in the input field has changed and the focus leaves the input field.
				 */
				change: {},

				/**
				 * Fired when the value of the <code>sap.ui.webc.main.TimePicker</code> is changed at each key stroke.
				 */
				input: {}
			},
			methods: ["closePicker", "formatValue", "isOpen", "isValid", "openPicker"]
		}
	});

	/**
	 * Closes the picker
	 * @public
	 * @name sap.ui.webc.main.DurationPicker#closePicker
	 * @function
	 */

	/**
	 * Formats a Java Script date object into a string representing a locale date and time according to the <code>formatPattern</code> property of the TimePicker instance
	 * @param {object} date A Java Script date object to be formatted as string
	 * @public
	 * @name sap.ui.webc.main.DurationPicker#formatValue
	 * @function
	 */

	/**
	 * Checks if the picker is open
	 * @public
	 * @name sap.ui.webc.main.DurationPicker#isOpen
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
	 * @name sap.ui.webc.main.DurationPicker#isValid
	 * @function
	 */

	/**
	 * Opens the picker.
	 * @public
	 * @name sap.ui.webc.main.DurationPicker#openPicker
	 * @function
	 */

	return DurationPicker;
});