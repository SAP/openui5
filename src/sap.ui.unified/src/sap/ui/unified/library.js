/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.unified.
 */
sap.ui.define([
 'sap/ui/base/Object',
 'sap/ui/base/DataType',
 'sap/ui/core/Lib',
 "./ColorPickerDisplayMode",
 "./FileUploaderHttpRequestMethod",
 "sap/ui/core/RenderManager",
 'sap/ui/core/library'
], function(
 BaseObject,
 DataType,
 Library,
 ColorPickerDisplayMode,
 FileUploaderHttpRequestMethod,
 RenderManager
) {

	"use strict";

	/**
	 * Unified controls intended for both, mobile and desktop scenarios
	 *
	 * @namespace
	 * @alias sap.ui.unified
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.28
	 * @public
	 */
	var thisLib = Library.init({
		name : "sap.ui.unified",
		apiVersion: 2,
		version: "${version}",
		dependencies : ["sap.ui.core"],
		designtime: "sap/ui/unified/designtime/library.designtime",
		types: [
			"sap.ui.unified.CalendarAppointmentVisualization",
			"sap.ui.unified.CalendarDayType",
			"sap.ui.unified.CalendarIntervalType",
			"sap.ui.unifief.CalendarAppointmentHeight",
			"sap.ui.unifief.CalendarAppointmentRoundWidth",
			"sap.ui.unified.ColorPickerDisplayMode",
			"sap.ui.unified.ColorPickerMode",
			"sap.ui.unified.ContentSwitcherAnimation",
			"sap.ui.unified.GroupAppointmentsMode",
			"sap.ui.unified.FileUploaderHttpRequestMethod",
			"sap.ui.unified.StandardCalendarLegendItem"
		],
		interfaces: [
			"sap.ui.unified.IMenuItem",
			"sap.ui.unified.IProcessableBlobs"
		],
		controls: [
		 "sap.ui.unified.calendar.DatesRow",
		 "sap.ui.unified.calendar.Header",
		 "sap.ui.unified.calendar.Month",
		 "sap.ui.unified.calendar.MonthPicker",
		 "sap.ui.unified.calendar.MonthsRow",
		 "sap.ui.unified.calendar.TimesRow",
		 "sap.ui.unified.calendar.YearPicker",
		 "sap.ui.unified.calendar.YearRangePicker",
		 "sap.ui.unified.Calendar",
		 "sap.ui.unified.CalendarDateInterval",
		 "sap.ui.unified.CalendarWeekInterval",
		 "sap.ui.unified.CalendarMonthInterval",
		 "sap.ui.unified.CalendarTimeInterval",
		 "sap.ui.unified.CalendarLegend",
		 "sap.ui.unified.CalendarRow",
		 "sap.ui.unified.ColorPicker",
		 "sap.ui.unified.ColorPickerPopover",
		 "sap.ui.unified.Currency",
		 "sap.ui.unified.FileUploader",
		 "sap.ui.unified.Menu"
		],
		elements: [
		 "sap.ui.unified.CalendarAppointment",
		 "sap.ui.unified.CalendarLegendItem",
		 "sap.ui.unified.DateRange",
		 "sap.ui.unified.DateTypeRange",
		 "sap.ui.unified.FileUploaderParameter",
		 "sap.ui.unified.FileUploaderXHRSettings",
		 "sap.ui.unified.MenuItem",
		 "sap.ui.unified.MenuItemBase",
		 "sap.ui.unified.MenuItemGroup",
		 "sap.ui.unified.MenuTextFieldItem"
		],
		extensions: {
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true
			}
		}
	});

	/**
	 * Types of a calendar day used for visualization.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.13
	 */
	thisLib.CalendarDayType = {

		/**
		 * No special type is used.
		 * @public
		 */
		None : "None",

		/**
		 * Non-working days.
		 * @public
		 * @since 1.121
		 */
		NonWorking : "NonWorking",

		/**
		 * Working days.
		 * @public
		 */
		Working : "Working",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type01 : "Type01",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type02 : "Type02",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type03 : "Type03",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type04 : "Type04",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type05 : "Type05",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type06 : "Type06",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type07 : "Type07",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type08 : "Type08",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type09 : "Type09",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 */
		Type10 : "Type10",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type11 : "Type11",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type12 : "Type12",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type13 : "Type13",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type14 : "Type14",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type15 : "Type15",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type16 : "Type16",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type17 : "Type17",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type18 : "Type18",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type19 : "Type19",

		/**
		 * The semantic meaning must be defined by the app. It can be displayed in a legend.
		 * @public
		 * @since 1.50
		 */
		Type20 : "Type20"

	};

	DataType.registerEnum("sap.ui.unified.CalendarDayType", thisLib.CalendarDayType);

	/**
	 * Standard day types visualized in a {@link sap.m.PlanningCalendarLegend}, which correspond to days in a {@link sap.ui.unified.Calendar}.
	 * @enum {string}
	 * @public
	 * @since 1.50
	 */
	thisLib.StandardCalendarLegendItem = {
		/**
		 * Type used for visualization of the current date.
		 * @public
		 */
		Today: "Today",

		/**
		 * Type used for visualization of the regular work days.
		 * @public
		 */
		WorkingDay: "WorkingDay",

		/**
		 * Type used for visualization of the non-working days.
		 * @public
		 */
		NonWorkingDay: "NonWorkingDay",

		/**
		 * Type used for visualization of the currently selected day.
		 * @public
		 */
		Selected: "Selected"
	};

	DataType.registerEnum("sap.ui.unified.StandardCalendarLegendItem", thisLib.StandardCalendarLegendItem);

	/**
	 * Interval types in a <code>CalendarRow</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34.0
	 */
	thisLib.CalendarIntervalType = {

		/**
		 * Intervals have the size of one hour.
		 * @public
		 */
		Hour : "Hour",

		/**
		 * Intervals have the size of one day.
		 * @public
		 */
		Day : "Day",

		/**
		 * Intervals have the size of one month.
		 * @public
		 */
		Month : "Month",

		/**
		 * Intervals have the size of one day where 7 days are displayed, starting with the first day of the week.
		 *
		 * Note: This interval type is NOT supported when creating a custom sap.m.PlanningCalendarView.
		 *
		 * @since 1.44
		 */
		Week : "Week",

		/**
		 * Intervals have the size of one day where 31 days are displayed, starting with the first day of the month.
		 *
		 * Note: This interval type is NOT supported when creating a custom sap.m.PlanningCalendarView.
		 *
		 * @since 1.46
		 */
		OneMonth : "One Month"

	};

	DataType.registerEnum("sap.ui.unified.CalendarIntervalType", thisLib.CalendarIntervalType);

	/**
	 * Types of a calendar appointment display mode
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.CalendarAppointmentHeight
	 * @public
	 * @since 1.80.0
	 */
	thisLib.CalendarAppointmentHeight = {

		/**
		 * HalfSize display mode.
		 * @public
		 */
		HalfSize : "HalfSize",

		/**
		 * Regular display mode.
		 * @public
		 */
		Regular : "Regular",

		/**
		 * Large display mode.
		 * @public
		 */
		Large : "Large",

		/**
		 * Automatic display mode.
		 * @public
		 */
		Automatic : "Automatic"

	};

	DataType.registerEnum("sap.ui.unified.CalendarAppointmentHeight", thisLib.CalendarAppointmentHeight);

	/**
	 * Types of a calendar appointment display mode
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.CalendarAppointmentRoundWidth
	 * @public
	 * @experimental Since 1.81.0
	 * @since 1.81.0
	 */
	thisLib.CalendarAppointmentRoundWidth = {

		/**
		 * Visually rounds the appointment to half a column.
		 * @public
		 */
		HalfColumn : "HalfColumn",

		/**
		 * No rounding is used.
		 * @public
		 */
		None : "None"

	};

	DataType.registerEnum("sap.ui.unified.CalendarAppointmentRoundWidth", thisLib.CalendarAppointmentRoundWidth);

	/**
	 * Types of display mode for overlapping appointments.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.48.0
	 */
	thisLib.GroupAppointmentsMode = {

		/**
		 * Overlapping appointments are displayed as a collapsed group appointment.
		 * @public
		 */
		Collapsed : "Collapsed",

		/**
		 * Overlapping appointments are displayed individually (expanded from a group).
		 * @public
		 */
		Expanded : "Expanded"

	};

	DataType.registerEnum("sap.ui.unified.GroupAppointmentsMode", thisLib.GroupAppointmentsMode);

	// expose imported enum as property of library namespace, for documentation see FileUploaderHttpRequestMethod.js
	thisLib.FileUploaderHttpRequestMethod = FileUploaderHttpRequestMethod;

	/**
	 * Visualization types for {@link sap.ui.unified.CalendarAppointment}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.40.0
	 */
	thisLib.CalendarAppointmentVisualization = {

		/**
		 * Standard visualization with no fill color.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Visualization with fill color depending on the used theme.
		 * @public
		 */
		Filled : "Filled"

	};

	DataType.registerEnum("sap.ui.unified.CalendarAppointmentVisualization", thisLib.CalendarAppointmentVisualization);

	/**
	 * Predefined animations for the ContentSwitcher
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16.0
	 * @experimental Since version 1.16.0.
	 * API is not yet finished and might change completely
	 */
	thisLib.ContentSwitcherAnimation = {

		/**
		 * No animation. Content is switched instantly.
		 * @public
		 */
		None : "None",

		/**
		 * Content is faded (opacity change).
		 * @public
		 */
		Fade : "Fade",

		/**
		 * The new content is "zoomed in" from the center and grows to fill the full content area.
		 * @public
		 */
		ZoomIn : "ZoomIn",

		/**
		 * The old content is "zoomed out", i.e. shrinks to a point at the center of the content area.
		 * @public
		 */
		ZoomOut : "ZoomOut",

		/**
		 * The new content rotates in. (Just like one of those old newspaper-animations.)
		 * @public
		 */
		Rotate : "Rotate",

		/**
		 * The new slides in from the left (to the right).
		 * @public
		 */
		SlideRight : "SlideRight",

		/**
		 * The new content slides in from the left while the old content slides out to the left at the same time.
		 * @public
		 */
		SlideOver : "SlideOver"

	};

	DataType.registerEnum("sap.ui.unified.ContentSwitcherAnimation", thisLib.ContentSwitcherAnimation);

	/**
	 * different styles for a ColorPicker.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.ColorPickerMode = {

		/**
		 * Color picker works with HSV values.
		 * @public
		 */
		HSV : "HSV",

		/**
		 * Color picker works with HSL values.
		 * @public
		 */
		HSL : "HSL"

	};

	DataType.registerEnum("sap.ui.unified.ColorPickerMode", thisLib.ColorPickerMode);

	// expose imported enum as property of library namespace, for documentation see ColorPickerDisplayMode.js
	thisLib.ColorPickerDisplayMode = ColorPickerDisplayMode;

	/**
	 *
	 * Interface for controls which are suitable to add as items of sap.m.Menu.
	 *
	 *
	 * @since 1.127.0
	 * @name sap.ui.unified.IMenuItem
	 * @interface
	 * @public
	 */

	/**
	 * Marker interface for controls that process instances of <code>window.Blob</code>, such as <code>window.File</code>.
	 * The implementation of this Interface should implement the following Interface methods:
	 * <ul>
	 * <li><code>getProcessedBlobsFromArray</code></li>
	 * </ul>
	 *
	 * @name sap.ui.unified.IProcessableBlobs
	 * @interface
	 * @public
	 */

	/**
	 * Allows to process Blobs before they get uploaded. This API can be used to create custom Blobs
	 * and upload these custom Blobs instead of the received/initials Blobs in the parameter <code>aBlobs</code>.
	 * One use case could be to create and upload zip archives based on the passed Blobs.
	 * The default implementation of this API should simply resolve with the received Blobs (parameter <code>aBlobs</code>).
	 * @public
	 * @since 1.52
	 * @param {Blob[]} aBlobs The initial Blobs which can be used to determine a new array of Blobs for further processing.
	 * @returns {Promise<Blob[]>} A Promise that resolves with an array of Blobs which is used for the final uploading.
	 * @function
	 * @name sap.ui.unified.IProcessableBlobs.getProcessedBlobsFromArray
	 */

	thisLib._ContentRenderer = BaseObject.extend("sap.ui.unified._ContentRenderer", {
		constructor : function(oControl, sContentContainerId, oContent, fAfterRenderCallback) {
			BaseObject.apply(this);
			this._id = sContentContainerId;
			this._cntnt = oContent;
			this._ctrl = oControl;
			this._rm = new RenderManager().getInterface();
			this._cb = fAfterRenderCallback || function(){};
		},

		destroy : function() {
			this._rm.destroy();
			delete this._rm;
			delete this._id;
			delete this._cntnt;
			delete this._cb;
			delete this._ctrl;
			if (this._rerenderTimer) {
				clearTimeout(this._rerenderTimer);
				delete this._rerenderTimer;
			}
			BaseObject.prototype.destroy.apply(this, arguments);
		},

		render : function() {
			if (!this._rm) {
				return;
			}

			if (this._rerenderTimer) {
				clearTimeout(this._rerenderTimer);
			}

			this._rerenderTimer = setTimeout(function(){
				var oContent = document.getElementById(this._id);

				if (oContent) {
					if (typeof (this._cntnt) === "string") {
						var aContent = this._ctrl.getAggregation(this._cntnt, []);
						for (var i = 0; i < aContent.length; i++) {
							this._rm.renderControl(aContent[i]);
						}
					} else {
						this._cntnt(this._rm);
					}
					this._rm.flush(oContent);
				}

				this._cb(!!oContent);
			}.bind(this), 0);
		}
	});


	thisLib._iNumberOfOpenedShellOverlays = 0;

	thisLib.calendar = thisLib.calendar || {};

	return thisLib;

});