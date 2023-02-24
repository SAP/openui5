/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.DateRangePicker.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/DateRangePicker",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DateRangePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The DateRangePicker enables the users to enter a localized date range using touch, mouse, keyboard input, or by selecting a date range in the calendar.
	 *
	 *
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.DateRangePicker</code> provides advanced keyboard handling. <br>
	 *
	 *
	 * When the <code>sap.ui.webc.main.DateRangePicker</code> input field is focused the user can increment or decrement respectively the range start or end date, depending on where the cursor is. The following shortcuts are available: <br>
	 *
	 * <ul>
	 *     <li>[PAGEDOWN] - Decrements the corresponding day of the month by one</li>
	 *     <li>[SHIFT] + [PAGEDOWN] - Decrements the corresponding month by one</li>
	 *     <li>[SHIFT] + [CTRL] + [PAGEDOWN] - Decrements the corresponding year by one</li>
	 *     <li>[PAGEUP] - Increments the corresponding day of the month by one</li>
	 *     <li>[SHIFT] + [PAGEUP] - Increments the corresponding month by one</li>
	 *     <li>[SHIFT] + [CTRL] + [PAGEUP] - Increments the corresponding year by one</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.DateRangePicker
	 * @implements sap.ui.core.IFormContent
	 */
	var DateRangePicker = WebComponent.extend("sap.ui.webc.main.DateRangePicker", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-daterange-picker-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Defines the aria-label attribute for the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Determines the symbol which separates the dates. If not supplied, the default time interval delimiter for the current locale will be used.
				 */
				delimiter: {
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
				 */
				maxDate: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines the minimum date available for selection.
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
			getters: ["dateValue", "dateValueUTC", "endDateValue", "startDateValue"]
		}
	});

	/**
	 * Closes the picker.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#closePicker
	 * @function
	 */

	/**
	 * Formats a Java Script date object into a string representing a locale date according to the <code>formatPattern</code> property of the DatePicker instance
	 * @param {object} date A Java Script date object to be formatted as string
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#formatValue
	 * @function
	 */

	/**
	 * Checks if a date is between the minimum and maximum date.
	 * @param {string} value A value to be checked
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#isInValidRange
	 * @function
	 */

	/**
	 * Checks if the picker is open.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#isOpen
	 * @function
	 */

	/**
	 * Checks if a value is valid against the current date format of the DatePicker.
	 * @param {string} value A value to be tested against the current date format
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#isValid
	 * @function
	 */

	/**
	 * Opens the picker.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#openPicker
	 * @function
	 */

	/**
	 * Returns the <b>Note:</b> The getter method is inherited and not supported. If called it will return an empty value.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#getDateValue
	 * @function
	 */

	/**
	 * Returns the <b>Note:</b> The getter method is inherited and not supported. If called it will return an empty value.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#getDateValueUTC
	 * @function
	 */

	/**
	 * Returns the end date of the currently selected range as JavaScript Date instance.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#getEndDateValue
	 * @function
	 */

	/**
	 * Returns the start date of the currently selected range as JavaScript Date instance.
	 * @public
	 * @name sap.ui.webc.main.DateRangePicker#getStartDateValue
	 * @function
	 */

	EnabledPropagator.call(DateRangePicker.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return DateRangePicker;
});