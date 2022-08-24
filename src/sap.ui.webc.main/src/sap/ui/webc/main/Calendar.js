/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Calendar.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/Calendar"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var CalendarType = coreLibrary.CalendarType;
	var CalendarSelectionMode = library.CalendarSelectionMode;

	/**
	 * Constructor for a new <code>Calendar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Calendar</code> component allows users to select one or more dates. <br>
	 * <br>
	 * Currently selected dates are represented with instances of <code>sap.ui.webc.main.CalendarDate</code> as children of the <code>sap.ui.webc.main.Calendar</code>. The value property of each <code>sap.ui.webc.main.CalendarDate</code> must be a date string, correctly formatted according to the <code>sap.ui.webc.main.Calendar</code>'s <code>formatPattern</code> property. Whenever the user changes the date selection, <code>sap.ui.webc.main.Calendar</code> will automatically create/remove instances of <code>sap.ui.webc.main.CalendarDate</code> in itself, unless you prevent this behavior by calling <code>preventDefault()</code> for the <code>selected-dates-change</code> event. This is useful if you want to control the selected dates externally. <br>
	 * <br>
	 *
	 *
	 * <h3>Usage</h3>
	 *
	 * The user can navigate to a particular date by: <br>
	 *
	 * <ul>
	 *     <li>Pressing over a month inside the months view</li>
	 *     <li>Pressing over an year inside the years view</li>
	 * </ul> <br>
	 * The user can confirm a date selection by pressing over a date inside the days view. <br>
	 * <br>
	 *
	 *
	 * <h3>Keyboard Handling</h3> The <code>sap.ui.webc.main.Calendar</code> provides advanced keyboard handling. When a picker is showed and focused the user can use the following keyboard shortcuts in order to perform a navigation: <br>
	 * - Day picker: <br>
	 *
	 * <ul>
	 *     <li>[F4] - Shows month picker</li>
	 *     <li>[SHIFT] + [F4] - Shows year picker</li>
	 *     <li>[PAGEUP] - Navigate to the previous month</li>
	 *     <li>[PAGEDOWN] - Navigate to the next month</li>
	 *     <li>[SHIFT] + [PAGEUP] - Navigate to the previous year</li>
	 *     <li>[SHIFT] + [PAGEDOWN] - Navigate to the next year</li>
	 *     <li>[CTRL] + [SHIFT] + [PAGEUP] - Navigate ten years backwards</li>
	 *     <li>[CTRL] + [SHIFT] + [PAGEDOWN] - Navigate ten years forwards</li>
	 *     <li>[HOME] - Navigate to the first day of the week</li>
	 *     <li>[END] - Navigate to the last day of the week</li>
	 *     <li>[CTRL] + [HOME] - Navigate to the first day of the month</li>
	 *     <li>[CTRL] + [END] - Navigate to the last day of the month</li>
	 * </ul> <br>
	 * - Month picker: <br>
	 *
	 * <ul>
	 *     <li>[PAGEUP] - Navigate to the previous year</li>
	 *     <li>[PAGEDOWN] - Navigate to the next year</li>
	 *     <li>[HOME] - Navigate to the first month of the current row</li>
	 *     <li>[END] - Navigate to the last month of the current row</li>
	 *     <li>[CTRL] + [HOME] - Navigate to the first month of the current year</li>
	 *     <li>[CTRL] + [END] - Navigate to the last month of the year</li>
	 * </ul> <br>
	 * - Year picker: <br>
	 *
	 * <ul>
	 *     <li>[PAGEUP] - Navigate to the previous year range</li>
	 *     <li>[PAGEDOWN] - Navigate the next year range</li>
	 *     <li>[HOME] - Navigate to the first year of the current row</li>
	 *     <li>[END] - Navigate to the last year of the current row</li>
	 *     <li>[CTRL] + [HOME] - Navigate to the first year of the current year range</li>
	 *     <li>[CTRL] + [END] - Navigate to the last year of the current year range</li>
	 * </ul> <br>
	 *
	 *
	 *
	 * <h3>Calendar types</h3> The component supports several calendar types - Gregorian, Buddhist, Islamic, Japanese and Persian. By default the Gregorian Calendar is used. In order to use the Buddhist, Islamic, Japanese or Persian calendar, you need to set the <code>primaryCalendarType</code> property and import one or more of the following modules: <br>
	 * <br>
	 *
	 *
	 *
	 * Or, you can use the global configuration and set the <code>calendarType</code> key: <br>
	 * <code> &lt;script data-id="sap-ui-config" type="application/json"&gt; { "calendarType": "Japanese" } &lt;/script&gt; </code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Calendar
	 */
	var Calendar = WebComponent.extend("sap.ui.webc.main.Calendar", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-calendar-ui5",
			properties: {

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
				 * Sets a calendar type used for display. If not set, the calendar type of the global configuration is used.
				 */
				primaryCalendarType: {
					type: "sap.ui.core.CalendarType"
				},

				/**
				 * Defines the secondary calendar type. If not set, the calendar will only show the primary calendar type.
				 */
				secondaryCalendarType: {
					type: "sap.ui.core.CalendarType",
					defaultValue: CalendarType.undefined
				},

				/**
				 * Defines the type of selection used in the calendar component. Accepted property values are:<br>
				 *
				 * <ul>
				 *     <li><code>CalendarSelectionMode.Single</code> - enables a single date selection.(default value)</li>
				 *     <li><code>CalendarSelectionMode.Range</code> - enables selection of a date range.</li>
				 *     <li><code>CalendarSelectionMode.Multiple</code> - enables selection of multiple dates.</li>
				 * </ul>
				 */
				selectionMode: {
					type: "sap.ui.webc.main.CalendarSelectionMode",
					defaultValue: CalendarSelectionMode.Single
				}
			},
			defaultAggregation: "dates",
			aggregations: {

				/**
				 * Defines the selected date or dates (depending on the <code>selectionMode</code> property) for this calendar as instances of <code>sap.ui.webc.main.CalendarDate</code>
				 */
				dates: {
					type: "sap.ui.webc.main.ICalendarDate",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when the selected dates change. <b>Note:</b> If you call <code>preventDefault()</code> for this event, the component will not create instances of <code>sap.ui.webc.main.CalendarDate</code> for the newly selected dates. In that case you should do this manually.
				 */
				selectedDatesChange: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The selected dates
						 */
						values: {
							type: "Array"
						},

						/**
						 * The selected dates as UTC timestamps
						 */
						dates: {
							type: "Array"
						}
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Calendar;
});