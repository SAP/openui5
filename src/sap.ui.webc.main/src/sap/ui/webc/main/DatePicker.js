/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.DatePicker.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/DatePicker",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DatePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.DatePicker</code> component provides an input field with assigned calendar which opens on user action. The <code>sap.ui.webc.main.DatePicker</code> allows users to select a localized date using touch, mouse, or keyboard input. It consists of two parts: the date input field and the date picker.
	 *
	 * <h3>Usage</h3>
	 *
	 * The user can enter a date by:
	 * <ul>
	 *     <li>Using the calendar that opens in a popup</li>
	 *     <li>Typing it in directly in the input field</li>
	 * </ul> <br>
	 * <br>
	 * When the user makes an entry and presses the enter key, the calendar shows the corresponding date. When the user directly triggers the calendar display, the actual date is displayed.
	 *
	 * <h3>Formatting</h3>
	 *
	 * If a date is entered by typing it into the input field, it must fit to the used date format. <br>
	 * <br>
	 * Supported format options are pattern-based on Unicode LDML Date Format notation. For more information, see <ui5-link target="_blank" href="http://unicode.org/reports/tr35/#Date_Field_Symbol_Table" class="api-table-content-cell-link">UTS #35: Unicode Locale Data Markup Language</ui5-link>. <br>
	 * <br>
	 * For example, if the <code>format-pattern</code> is "yyyy-MM-dd", a valid value string is "2015-07-30" and the same is displayed in the input.
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.DatePicker</code> provides advanced keyboard handling. If the <code>sap.ui.webc.main.DatePicker</code> is focused, you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys. Once the drop-down is opened, you can use the <code>UP</code>, <code>DOWN</code>, <code>LEFT</code>, <code>RIGHT</code> arrow keys to navigate through the dates and select one by pressing the <code>Space</code> or <code>Enter</code> keys. Moreover you can use TAB to reach the buttons for changing month and year. <br>
	 *
	 *
	 * If the <code>sap.ui.webc.main.DatePicker</code> input field is focused and its corresponding picker dialog is not opened, then users can increment or decrement the date referenced by <code>dateValue</code> property by using the following shortcuts: <br>
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
	 * <h3>Calendar types</h3> The component supports several calendar types - Gregorian, Buddhist, Islamic, Japanese and Persian. By default the Gregorian Calendar is used. In order to use the Buddhist, Islamic, Japanese or Persian calendar, you need to set the <code>primaryCalendarType</code> property and import one or more of the following modules: <br>
	 * <br>
	 *
	 *
	 *
	 * Or, you can use the global configuration and set the <code>calendarType</code> key: <br>
	 * <pre><code>&lt;script data-id="sap-ui-config" type="application/json"&gt;
	 * {
	 * 	"calendarType": "Japanese"
	 * }
	 * &lt;/script&gt;</code></pre>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.DatePicker
	 * @implements sap.ui.core.IFormContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DatePicker = WebComponent.extend("sap.ui.webc.main.DatePicker", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-date-picker-ui5",
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
			getters: ["dateValue"],
			designtime: "sap/ui/webc/main/designtime/DatePicker.designtime"
		}
	});

	/**
	 * Closes the picker.
	 * @public
	 * @name sap.ui.webc.main.DatePicker#closePicker
	 * @function
	 */

	/**
	 * Formats a Java Script date object into a string representing a locale date according to the <code>formatPattern</code> property of the DatePicker instance
	 * @param {object} date A Java Script date object to be formatted as string
	 * @public
	 * @name sap.ui.webc.main.DatePicker#formatValue
	 * @function
	 */

	/**
	 * Checks if a date is between the minimum and maximum date.
	 * @param {string} value A value to be checked
	 * @public
	 * @name sap.ui.webc.main.DatePicker#isInValidRange
	 * @function
	 */

	/**
	 * Checks if the picker is open.
	 * @public
	 * @name sap.ui.webc.main.DatePicker#isOpen
	 * @function
	 */

	/**
	 * Checks if a value is valid against the current date format of the DatePicker.
	 * @param {string} value A value to be tested against the current date format
	 * @public
	 * @name sap.ui.webc.main.DatePicker#isValid
	 * @function
	 */

	/**
	 * Opens the picker.
	 * @public
	 * @name sap.ui.webc.main.DatePicker#openPicker
	 * @function
	 */

	/**
	 * Returns the currently selected date represented as a Local JavaScript Date instance.
	 * @public
	 * @name sap.ui.webc.main.DatePicker#getDateValue
	 * @function
	 */

	EnabledPropagator.call(DatePicker.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return DatePicker;
});