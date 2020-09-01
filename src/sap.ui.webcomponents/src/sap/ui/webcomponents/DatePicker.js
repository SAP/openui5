/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.DatePicker.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/CalendarType",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/DatePicker"
], function(WebComponent, CalendarType, coreLibrary, WCDatePicker) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>DatePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.DatePicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DatePicker = WebComponent.extend("sap.ui.webcomponents.DatePicker", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-date-picker",
			properties: {
				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				value: {
					type: "string",
					updateOnEvent: "change"
				},

				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None,
					updateOnEvent: "change"
				},

				formatPattern: {
					type: "string"
				},

				minDate: {
					type: "string"
				},

				maxDate: {
					type: "string"
				},

				primaryCalendarType: {
					type: "sap.ui.core.CalendarType"
				},

				required: {
					type: "boolean"
				},

				disabled: {
					type: "boolean"
				},

				readonly: {
					type: "boolean"
				},

				placeholder: {
					type: "string",
					defaultValue: undefined
				},

				name: {
					type: "string"
				},

				hideWeekNumbers: {
					type: "boolean"
				},

				valueStateMessage: {
					type: "string",
					mapping: {
						type: "slot",
						to: "div"
					}
				}
			},
			events: {
				change: {},
				input: {}
			}
		}
	});

	return DatePicker;
});
