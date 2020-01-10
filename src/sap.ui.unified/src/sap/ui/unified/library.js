/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.unified.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/base/Object', "./ColorPickerDisplayMode", 'sap/ui/core/library'], function(Core, BaseObject, ColorPickerDisplayMode) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.unified",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		designtime: "sap/ui/unified/designtime/library.designtime",
		types: [
			"sap.ui.unified.CalendarAppointmentVisualization",
			"sap.ui.unified.CalendarDayType",
			"sap.ui.unified.CalendarIntervalType",
			"sap.ui.unified.ColorPickerDisplayMode",
			"sap.ui.unified.ColorPickerMode",
			"sap.ui.unified.ContentSwitcherAnimation",
			"sap.ui.unified.GroupAppointmentsMode",
			"sap.ui.unified.StandardCalendarLegendItem"
		],
		interfaces: [
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
			"sap.ui.unified.ContentSwitcher",
			"sap.ui.unified.ColorPicker",
			"sap.ui.unified.ColorPickerPopover",
			"sap.ui.unified.Currency",
			"sap.ui.unified.FileUploader",
			"sap.ui.unified.Menu",
			"sap.ui.unified.Shell",
			"sap.ui.unified.ShellLayout",
			"sap.ui.unified.ShellOverlay",
			"sap.ui.unified.SplitContainer"
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
			"sap.ui.unified.MenuTextFieldItem",
			"sap.ui.unified.ShellHeadItem",
			"sap.ui.unified.ShellHeadUserItem"
		],
		extensions: {
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true
			}
		}
	});

	/**
	 * Unified controls intended for both, mobile and desktop scenarios
	 *
	 * @namespace
	 * @alias sap.ui.unified
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.ui.unified;

	/**
	 * Types of a calendar day used for visualization.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.24.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.CalendarDayType = {

		/**
		 * No special type is used.
		 * @public
		 */
		None : "None",

		/**
		 * Non-working dates.
		 * @public
		 */
		NonWorking : "NonWorking",

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

	/**
	 * Standard day types visualized in a {@link sap.m.PlanningCalendarLegend}, which correspond to days in a {@link sap.ui.unified.Calendar}.
	 * @enum {string}
	 * @public
	 * @since 1.50
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	/**
	 * Interval types in a <code>CalendarRow</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	/**
	 * Types of display mode for overlapping appointments.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.48.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	/**
	 * Visualization types for {@link sap.ui.unified.CalendarAppointment}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.40.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	/**
	 * Predefined animations for the ContentSwitcher
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16.0
	 * @experimental Since version 1.16.0.
	 * API is not yet finished and might change completely
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	/**
	 * different styles for a ColorPicker.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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

	// expose imported enum as property of library namespace, for documentation see module
	thisLib.ColorPickerDisplayMode = ColorPickerDisplayMode;

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
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Allows to process Blobs before they get uploaded. This API can be used to create custom Blobs
	 * and upload these custom Blobs instead of the received/initials Blobs in the parameter <code>aBlobs</code>.
	 * One use case could be to create and upload zip archives based on the passed Blobs.
	 * The default implementation of this API should simply resolve with the received Blobs (parameter <code>aBlobs</code>).
	 * @public
	 * @since 1.52
	 * @param {Blob[]} aBlobs The initial Blobs which can be used to determine a new array of Blobs for further processing.
	 * @return {Promise} A Promise that resolves with an array of Blobs which is used for the final uploading.
	 * @function
	 * @name sap.ui.unified.IProcessableBlobs.getProcessedBlobsFromArray
	 */

	thisLib._ContentRenderer = BaseObject.extend("sap.ui.unified._ContentRenderer", {
		constructor : function(oControl, sContentContainerId, oContent, fAfterRenderCallback) {
			BaseObject.apply(this);
			this._id = sContentContainerId;
			this._cntnt = oContent;
			this._ctrl = oControl;
			this._rm = sap.ui.getCore().createRenderManager();
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

	// Default implementation of ColorPickerHelper - to be overwritten by commons or mobile library
	if (!thisLib.ColorPickerHelper) {
		thisLib.ColorPickerHelper = {
			isResponsive: function () { return false; },
			factory: {
				createLabel:  function () { throw new Error("no Label control available"); },
				createInput:  function () { throw new Error("no Input control available"); },
				createSlider: function () { throw new Error("no Slider control available"); },
				createRadioButtonGroup: function () { throw new Error("no RadioButtonGroup control available"); },
				createRadioButtonItem: function () { throw new Error("no RadioButtonItem control available"); }
			},
			bFinal: false
		};
	}

	//factory for the FileUploader to create TextField and Button to be overwritten by commons and mobile library
	if (!thisLib.FileUploaderHelper) {
		thisLib.FileUploaderHelper = {
			createTextField: function(sId){ throw new Error("no TextField control available!"); }, /* must return a TextField control */
			setTextFieldContent: function(oTextField, sWidth){ throw new Error("no TextField control available!"); },
			createButton: function(sId){ throw new Error("no Button control available!"); }, /* must return a Button control */
			addFormClass: function(){ return null; },
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	thisLib.calendar = thisLib.calendar || {};

	return thisLib;

});