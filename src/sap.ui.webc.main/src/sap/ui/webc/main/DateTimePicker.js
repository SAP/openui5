/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.DateTimePicker.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/features/InputElementsFormSupport",
	"./thirdparty/DateTimePicker"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DateTimePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>DateTimePicker</code> component alows users to select both date (day, month and year) and time (hours, minutes and seconds) and for the purpose it consists of input field and Date/Time picker.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>DateTimePicker</code> if you need a combined date and time input component. Don't use it if you want to use either date, or time value. In this case, use the <code>DatePicker</code> or the <code>TimePicker</code> components instead. <br>
	 * <br>
	 * The user can set date/time by:
	 * <ul>
	 *     <li>using the calendar and the time selectors</li>
	 *     <li>typing in the input field</li>
	 * </ul>
	 *
	 * Programmatically, to set date/time for the <code>DateTimePicker</code>, use the <code>value</code> property
	 *
	 * <h3>Formatting</h3>
	 *
	 * The value entered by typing into the input field must fit to the used date/time format. <br>
	 * <br>
	 * Supported format options are pattern-based on Unicode LDML Date Format notation. For more information, see {@link https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table UTS #35: Unicode Locale Data Markup Language}. <br>
	 * <br>
	 * <b>Example:</b> the following format <code>dd/MM/yyyy, hh:mm:ss aa</code> corresponds the <code>13/04/2020, 03:16:16 AM</code> value. <br>
	 * The small 'h' defines "12" hours format and the "aa" symbols - "AM/PM" time periods.
	 *
	 * <br>
	 * <br>
	 * <b>Example:</b> the following format <code>dd/MM/yyyy, HH:mm:ss</code> corresponds the <code>13/04/2020, 15:16:16</code> value. <br>
	 * The capital 'H' indicates "24" hours format.
	 *
	 * <br>
	 * <br>
	 * <b>Note:</b> If the <code>formatPattern</code> does NOT include time, the <code>DateTimePicker</code> will fallback to the default time format according to the locale.
	 *
	 * <br>
	 * <br>
	 * <b>Note:</b> If no placeholder is set to the <code>DateTimePicker</code>, the current <code>formatPattern</code> is displayed as a placeholder. If another placeholder is needed, it must be set or in case no placeholder is needed - it can be set to an empty string.
	 *
	 * <br>
	 * <br>
	 * <b>Note:</b> If the user input does NOT match the <code>formatPattern</code>, the <code>DateTimePicker</code> makes an attempt to parse it based on the locale settings.
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The <code>DateTimePicker</code> is responsive and fully adapts to all devices. For larger screens, such as tablet or desktop, it is displayed as a popover, while on phone devices, it is displayed full screen.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.DateTimePicker
	 * @implements sap.ui.core.IFormContent
	 */
	var DateTimePicker = WebComponent.extend("sap.ui.webc.main.DateTimePicker", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-datetime-picker-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the aria-label attribute for the component.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

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
				 */
				formatPattern: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the visibility of the week numbers column. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> For calendars other than Gregorian, the week numbers are not displayed regardless of what is set.
				 */
				hideWeekNumbers: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the maximum date available for selection.
				 *
				 * <b>Note:</b> If the formatPattern property is not set, the maxDate value must be provided in the ISO date format (YYYY-MM-dd).
				 */
				maxDate: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines the minimum date available for selection.
				 *
				 * <b>Note:</b> If the formatPattern property is not set, the minDate value must be provided in the ISO date format (YYYY-MM-dd).
				 */
				minDate: {
					type: "string",
					defaultValue: ""
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
				 * Sets a calendar type used for display. If not set, the calendar type of the global configuration is used.
				 */
				primaryCalendarType: {
					type: "sap.ui.core.CalendarType"
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
				 * Defines the secondary calendar type. If not set, the calendar will only show the primary calendar type.
				 */
				secondaryCalendarType: {
					type: "sap.ui.core.CalendarType",
					defaultValue: CalendarType.undefined
				},

				/**
				 * Defines a formatted date value.
				 */
				value: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the value state of the component.
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
					allowPreventDefault: true,
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
				 * Fired when the value of the component is changed at each key stroke.
				 */
				input: {
					allowPreventDefault: true,
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
				}
			},
			methods: ["closePicker", "formatValue", "isInValidRange", "isOpen", "isValid", "openPicker"],
			getters: ["dateValue"],
			designtime: "sap/ui/webc/main/designtime/DateTimePicker.designtime"
		}
	});

	/**
	 * Closes the picker.
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#closePicker
	 * @function
	 */

	/**
	 * Formats a Java Script date object into a string representing a locale date according to the <code>formatPattern</code> property of the DatePicker instance
	 * @param {Date} date A Java Script date object to be formatted as string
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#formatValue
	 * @function
	 */

	/**
	 * Checks if a date is between the minimum and maximum date.
	 * @param {string} value A value to be checked
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#isInValidRange
	 * @function
	 */

	/**
	 * Checks if the picker is open.
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#isOpen
	 * @function
	 */

	/**
	 * Checks if a value is valid against the current date format of the DatePicker.
	 * @param {string} value A value to be tested against the current date format
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#isValid
	 * @function
	 */

	/**
	 * Opens the picker.
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#openPicker
	 * @function
	 */

	/**
	 * Returns the currently selected date represented as a Local JavaScript Date instance.
	 * @public
	 * @name sap.ui.webc.main.DateTimePicker#getDateValue
	 * @function
	 */

	EnabledPropagator.call(DateTimePicker.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return DateTimePicker;
});
