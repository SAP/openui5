/*!
 * ${copyright}
 */

// Provides control sap.m.PlanningCalendarHeader.
sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'./library',
	'./Toolbar',
	'./AssociativeOverflowToolbar',
	'./Button',
	'./AdditionalTextButton',
	'./Popover',
	'./Title',
	'./ToolbarSpacer',
	'./SegmentedButton',
	"sap/ui/core/Lib",
	'sap/ui/unified/Calendar',
	'sap/ui/unified/calendar/CustomMonthPicker',
	'sap/ui/unified/calendar/CustomYearPicker',
	'sap/ui/unified/calendar/IndexPicker',
	'sap/ui/core/date/CalendarWeekNumbering',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/library',
	'./PlanningCalendarHeaderRenderer',
	'sap/ui/core/date/UI5Date'
],
function(
	Localization,
	Element,
	Control,
	library,
	Toolbar,
	AssociativeOverflowToolbar,
	Button,
	AdditionalTextButton,
	Popover,
	Title,
	ToolbarSpacer,
	SegmentedButton,
	Library,
	Calendar,
	CustomMonthPicker,
	CustomYearPicker,
	IndexPicker,
	CalendarWeekNumbering,
	CalendarDate,
	IconPool,
	InvisibleText,
	coreLibrary,
	PlanningCalendarHeaderRenderer,
	UI5Date
) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	/**
	 * Constructor for a new <code>PlanningCalendarHeader</code>.
	 *
	 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Disclaimer: This control is in a beta state - incompatible API changes may be done before its official public
	 * release. Use at your own discretion.
	 *
	 * <h3>Overview</h3>
	 *
	 * The calendar header contains the action controls which you can use to manipulate the calendar and facilitate
	 * navigation.
	 *
	 * <b>Note:</b> The <code>PlanningCalendarHeader</code> uses parts of the <code>sap.ui.unified</code> library.
	 * This library will be loaded after the <code>PlanningCalendarHeader</code>, if it wasn't previously loaded.
	 * This could lead to a waiting time when a <code>PlanningCalendarHeader</code> is used for the first time.
	 * To prevent this, apps using the <code>PlanningCalendarHeader</code> must also load the
	 * <code>sap.ui.unified</code> library.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>PlanningCalendarHeader</code> has the following structure:
	 *
	 * It contains two toolbars.
	 * <ul>
	 *     <li>The title of the control, set from the <code>title</code> property, is placed at the beginning
	 *     of the first toolbar. If there is more than one view, the user can switch between the views using the
	 *     <code>SegmentedButton</code>, displayed afterwards. If controls in the <code>actions</code>
	 *     aggregation are set, they will be displayed at the end.</li>
	 *     <li>Navigation in the second toolbar will help the user select the desired time period.
	 *     It contains navigation arrows, Today button and a calendar picker.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.61
	 * @alias sap.m.PlanningCalendarHeader
	 */

	var PlanningCalendarHeader = Control.extend("sap.m.PlanningCalendarHeader", /** @lends sap.m.PlanningCalendarHeader.prototype */ {
		metadata : {

			library : "sap.m",

			properties : {

				/**
				 * Determines the title of the <code>PlanningCalendarHeader</code>.
				 */
				title: { type: "string", group: "Appearance", defaultValue: "" },

				/**
				 * Determines the start date used in the calendar picker, as a UI5Date or JavaScript Date object. It is considered as a local date.
				 * The time part will be ignored. The current date is used as default.
				 */
				startDate: { type : "object", group : "Data" },

				/**
				 * Determines the text of the button which opens the calendar picker.
				 */
				pickerText : { type : "string", group : "Data" },

				/**
				 * Determines the additional text of the button which opens the calendar picker.
				 */
				pickerTextInSecondaryType : { type : "string", group : "Data" },

				/**
				 * Defines the calendar week numbering used for display.
				 * @private
				 * @ui5-restricted sap.m.PlanningCalendarHeader
				 * @since 1.110.0
				 */
				calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null},

				/**
				 * If set, the calendar type is used for display.
				 * If not set, the calendar type of the global configuration is used.
				 * @private
				 * @ui5-restricted sap.m.PlanningCalendarHeader
				 * @since 1.108.0
				 */
				_primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

				/**
				 * If set, the days are also displayed in this calendar type
				 * If not set, the dates are only displayed in the primary calendar type
				 * @private
				 * @ui5-restricted sap.m.PlanningCalendarHeader
				 * @since 1.109.0
				 */
				_secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"}

			},

			aggregations : {

				/**
				 * The controls to be passed to the toolbar.
				 */
				actions : { type : "sap.ui.core.Control", multiple: true, singularName: "action" },

				/**
				 * Hidden, for internal use only.
				 * The toolbar which contains the title, the SegmentedButton for the views and the controls from the actions aggregation.
				 *
				 * @private
				 */
				_actionsToolbar : { type: "sap.m.OverflowToolbar", multiple: false, visibility : "hidden" },

				/**
				 * Hidden, for internal use only.
				 * The toolbar which contains the navigation inner controls.
				 *
				 * @private
				 */
				_navigationToolbar : { type: "sap.m.Toolbar", multiple: false, visibility : "hidden" },

				/**
				 * Hidden, for internal use only.
				 * The popup which contains the calendar for navigation.
				 *
				 * @private
				 */
				_calendarPicker : { type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden" },

				/**
				 * Hidden, for internal use only.
				 * The popup which contains the month picker for navigation.
				 *
				 * @private
				 */
				_monthPicker : { type : "sap.ui.unified.internal.CustomMonthPicker", multiple : false, visibility : "hidden" },

				/**
				 * Hidden, for internal use only.
				 * The popup which contains the year picker for navigation.
				 *
				 * @private
				 */
				_yearPicker : { type : "sap.ui.unified.internal.CustomYearPicker", multiple : false, visibility : "hidden" },

				/**
				 * Hidden, for internal use only.
				 * The popup which contains the index picker for navigation.
				 *
				 * @private
				 */
				_indexPicker : { type : "sap.ui.unified.calendar.IndexPicker", multiple : false, visibility : "hidden" }

			},

			events : {

				/**
				 * <code>startDate</code> was changed while navigating backward in the <code>PlanningCalendarHeader</code>.
				 * The new value can be obtained, using the <code>sap.m.PlanningCalendarHeader#getStartDate()</code> method.
				 */
				pressPrevious: {},

				/**
				 * <code>startDate</code> was changed while navigating through the Today button in the
				 * <code>PlanningCalendarHeader</code>.
				 * The new value can be obtained, using the <code>sap.m.PlanningCalendarHeader#getStartDate()</code> method.
				 */
				pressToday: {},

				/**
				 * <code>startDate</code> was changed while navigating forward in the <code>PlanningCalendarHeader</code>.
				 * The new value can be obtained, using the <code>sap.m.PlanningCalendarHeader#getStartDate()</code> method.
				 */
				pressNext: {},

				/**
				 * A date was selected through the calendar picker.
				 * The new value can be obtained, using the <code>sap.m.PlanningCalendarHeader#getStartDate()</code> method.
				 */
				dateSelect: {},

				/**
				 * The calendar picker popup was closed and no date was selected.
				 */
				cancel: {},

				/**
				 * The view was changed by user interaction.
				 */
				viewChange : {}
			},

			associations: {

				/**
				 * Association to control / ID which is shown in the picker popup.
				 * @since 1.70.0
				 */
				currentPicker: { type: "sap.ui.core.Control", multiple: false }
			}

		},

		renderer: PlanningCalendarHeaderRenderer
	});

	// Number of items to be skipped when removing content from actions aggregation.
	// In the _actionsToolbar content are placed the sap.m.Title control, containing the value from the title property,
	// a sap.m.ToolbarSpacer and a sap.m.SegmentedButton, used for navigation through the views in the calendar.
	// The other controls in this aggregation are forwarded from the actions aggregation of the
	// sap.m.SinglePlanningCalendar. Therefore when manipulations of the latter are needed, the first three controls
	// must be skipped. (ex. when removeAllActions is used)
	var RESERVED_ACTIONS_ITEMS_COUNT = 3;

	PlanningCalendarHeader.prototype.init = function() {

		var sOPHId = this.getId(),
			sNavToolbarId = sOPHId + "-NavToolbar",
			oRB = Library.getResourceBundleFor("sap.m"),
			sCalendarType = this.getProperty("_primaryCalendarType"),
			oPicker,
			oCalendarPicker,
			oMonthPicker,
			oYearPicker;

		this.setAggregation("_actionsToolbar", new AssociativeOverflowToolbar(sOPHId + "-ActionsToolbar", {
			design: ToolbarDesign.Transparent
		})
			.addStyleClass("sapMPCHeadActionsToolbar")
			.addContent(this._getOrCreateTitleControl())
			.addContent(this._getOrCreateToolbarSpacer())
			.addContent(this._getOrCreateViewSwitch())
		);

		this._oPrevBtn = new Button(sNavToolbarId + "-PrevBtn", {
			icon: IconPool.getIconURI('slim-arrow-left'),
			tooltip: oRB.getText("PCH_NAVIGATE_BACKWARDS"),
			press: function () {
				this.firePressPrevious();
			}.bind(this)
		});
		this._oTodayBtn = new Button(sNavToolbarId + "-TodayBtn", {
			text: oRB.getText("PLANNINGCALENDAR_TODAY"),
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_NAVIGATE_TO_TODAY"),
			press: function () {
				this.firePressToday();
			}.bind(this)
		});
		this._oNextBtn = new Button(sNavToolbarId + "-NextBtn", {
			icon: IconPool.getIconURI('slim-arrow-right'),
			tooltip: oRB.getText("PCH_NAVIGATE_FORWARD"),
			press: function () {
				this.firePressNext();
			}.bind(this)
		});
		oCalendarPicker = new Calendar(sOPHId + "-Cal", {
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_RANGE_PICKER"),
			calendarWeekNumbering: this.getCalendarWeekNumbering(),
			primaryCalendarType: sCalendarType
		});
		oCalendarPicker.attachEvent("select", this._handlePickerDateSelect, this);
		oCalendarPicker.attachEvent("cancel", this._handlePickerCancelEvent, this);
		this.setAggregation("_calendarPicker", oCalendarPicker);
		this._oCalendarAfterRenderDelegate = {
			onAfterRendering: function() {
				if (this._oPopup && this._oPopup.isOpen()) {
					oCalendarPicker.focus();
				}
			}.bind(this)
		};
		oCalendarPicker.addDelegate(this._oCalendarAfterRenderDelegate);
		this._oCalendar = oCalendarPicker;

		this.setAssociation("currentPicker", oCalendarPicker);

		oMonthPicker = new CustomMonthPicker(sOPHId + "-MonthCal", {
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_RANGE_PICKER"),
			primaryCalendarType: sCalendarType
		});
		oMonthPicker.attachEvent("select", this._handlePickerDateSelect, this);
		oMonthPicker.attachEvent("cancel", this._handlePickerCancelEvent, this);
		this.setAggregation("_monthPicker", oMonthPicker);
		this._oMonthPicker = oMonthPicker;

		oYearPicker = new CustomYearPicker(sOPHId + "-YearCal", {
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_RANGE_PICKER"),
			primaryCalendarType: sCalendarType
		});
		oYearPicker.attachEvent("select", this._handlePickerDateSelect, this);
		oYearPicker.attachEvent("cancel", this._handlePickerCancelEvent, this);
		this.setAggregation("_yearPicker", oYearPicker);
		this._oYearPicker = oYearPicker;

		var oIndexPicker = new IndexPicker(sOPHId + "-IndexPicker");
		oIndexPicker.attachEvent("select", this._handleIndexPickerSelect, this);
		this.setAggregation("_indexPicker", oIndexPicker);
		this._oIndexPicker = oIndexPicker;

		this._oPickerBtn = new AdditionalTextButton(sNavToolbarId + "-PickerBtn", {
			text: this.getPickerText(),
			additionalText: this.getPickerTextInSecondaryType(),
			ariaHasPopup: coreLibrary.aria.HasPopup.Dialog,
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_SELECT_RANGE"),
			press: function () {
				if (this.fireEvent("_pickerButtonPress", {}, true)) {
					var oDate = this.getStartDate() || UI5Date.getInstance(),
						sCurrentPickerId = this.getAssociation("currentPicker"),
						oMinDate;
					oPicker = Element.getElementById(sCurrentPickerId);
					if (oPicker instanceof Calendar) {
						oMinDate = oPicker.getMinDate();
						if (oMinDate && oMinDate.getTime() > oDate.getTime()) {
							oDate = oMinDate;
						}
					}
					if (oPicker.displayDate) {
						oPicker.displayDate(oDate);
					}
					oPicker.setCalendarWeekNumbering && oPicker.setCalendarWeekNumbering(this.getCalendarWeekNumbering());
					this._openCalendarPickerPopup(oPicker);
				}
			}.bind(this)
		});

		this.setAggregation("_navigationToolbar", new Toolbar(sNavToolbarId, {
			design: ToolbarDesign.Transparent,
			content: [
				this._oPrevBtn,
				this._oTodayBtn,
				this._oNextBtn,
				this._oPickerBtn
			]
		}).addStyleClass("sapMPCHeadNavToolbar"));

	};

	PlanningCalendarHeader.prototype.exit = function () {
		this._getActionsToolbar().removeAllContent();
		if (this._oTitle) {
			this._oTitle.destroy();
			this._oTitle = null;
		}
		if (this._oToolbarSpacer) {
			this._oToolbarSpacer.destroy();
			this._oToolbarSpacer = null;
		}
		if (this._oViewSwitch) {
			this._oViewSwitch.destroy();
			this._oViewSwitch = null;
		}
		if (this._oPopup) {
			if (this._oCalendarAfterRenderDelegate) {
				this._oCalendar.removeDelegate(this._oCalendarAfterRenderDelegate);
			}
			this._oPopup.destroy();
			this._oPopup = null;
		}
		if (this._oPrevBtn) {
			this._oPrevBtn.destroy();
			this._oPrevBtn = null;
		}
		if (this._oNextBtn) {
			this._oNextBtn.destroy();
			this._oNextBtn = null;
		}
	};

	PlanningCalendarHeader.prototype.onBeforeRendering = function () {
		var bVisible = !!this.getActions().length || !!this.getTitle() || this._getOrCreateViewSwitch().getItems().length > 1;
		var sSecondaryCalendarType = this.getProperty("_secondaryCalendarType");
		this._getActionsToolbar().setVisible(bVisible);

		this.setPrimaryCalendarTypeToPickers(this.getProperty("_primaryCalendarType"));
		if (sSecondaryCalendarType){
			this.setSecondaryCalendarTypeToPickers(sSecondaryCalendarType);
		}
	};

	PlanningCalendarHeader.prototype.setTitle = function (sTitle) {
		this._getOrCreateTitleControl().setText(sTitle).setVisible(!!sTitle);

		return this.setProperty("title", sTitle);
	};

	PlanningCalendarHeader.prototype.addAction = function (oAction) {
		if (!oAction) {
			return this;
		}
		this._getActionsToolbar().addContent(oAction);

		return this.addAggregation("actions", oAction);
	};

	PlanningCalendarHeader.prototype.insertAction = function (oAction, iIndex) {
		if (!oAction) {
			return this;
		}
		this._getActionsToolbar().insertContent(oAction, iIndex + RESERVED_ACTIONS_ITEMS_COUNT);

		return this.insertAggregation("actions", oAction, iIndex);
	};

	PlanningCalendarHeader.prototype.removeAction = function (oAction) {
		if (!oAction) {
			return this;
		}
		this._getActionsToolbar().removeContent(oAction);

		return this.removeAggregation("actions", oAction);
	};

	PlanningCalendarHeader.prototype.removeAllActions = function () {
		var oActionsToolbar = this._getActionsToolbar(),
			oActionsToolbarContent = oActionsToolbar.getContent();

		for (var i = RESERVED_ACTIONS_ITEMS_COUNT; i < oActionsToolbarContent.length; i++) {
			oActionsToolbar.removeContent(oActionsToolbarContent[i]);
		}

		return this.removeAllAggregation("actions");
	};

	PlanningCalendarHeader.prototype.destroyActions = function () {
		var oActionsToolbar = this._getActionsToolbar(),
			oActionsToolbarContent = oActionsToolbar.getContent(),
			oRemovedContentItem;

		for (var i = RESERVED_ACTIONS_ITEMS_COUNT; i < oActionsToolbarContent.length; i++) {
			oRemovedContentItem = oActionsToolbar.removeContent(oActionsToolbarContent[i]);
			oRemovedContentItem.destroy();
		}

		return this;
	};

	PlanningCalendarHeader.prototype.updatePickerText = function (oPickerTextInfo) {
		if (!oPickerTextInfo) {
			return this;
		}
		this.setPickerText(oPickerTextInfo.primaryType);
		this.setPickerTextInSecondaryType(oPickerTextInfo.secondaryType);

		return true;
	};

	PlanningCalendarHeader.prototype.setPickerTextInSecondaryType = function (sAdditionalText){
		this.setProperty("pickerTextInSecondaryType", sAdditionalText);
		this._oPickerBtn.setAdditionalText(sAdditionalText);
		return this;
	};

	PlanningCalendarHeader.prototype.setPickerText = function (sText) {
		if (!sText) {
			return this;
		}
		this.setProperty("pickerText", sText);
		this._oPickerBtn.setText(sText);

		return this;
	};

	PlanningCalendarHeader.prototype.setPrimaryCalendarTypeToPickers = function (sCalendarType) {
		this._oCalendar.setPrimaryCalendarType(sCalendarType);
		this._oMonthPicker.setPrimaryCalendarType(sCalendarType);
		this._oYearPicker.setPrimaryCalendarType(sCalendarType);
	};

	PlanningCalendarHeader.prototype.setSecondaryCalendarTypeToPickers = function (sCalendarType) {
		this._oCalendar.setSecondaryCalendarType(sCalendarType);
		this._oMonthPicker.setSecondaryCalendarType(sCalendarType);
		this._oYearPicker.setSecondaryCalendarType(sCalendarType);
	};

	/**
	 * If not existing yet, creates the inner Title control.
	 * Otherwise just returns it.
	 * @returns {sap.m.Title} The title object
	 * @private
	 */
	PlanningCalendarHeader.prototype._getOrCreateTitleControl = function () {
		if (!this._oTitle) {
			this._oTitle = new Title(this.getId() + "-Title", { visible: false });
		}

		return this._oTitle;
	};

	/**
	 * If not existing yet, creates the inner ToolbarSpacer control.
	 * Otherwise just returns it.
	 * @returns {sap.m.ToolbarSpacer} The ToolbarSpacer object
	 * @private
	 */
	PlanningCalendarHeader.prototype._getOrCreateToolbarSpacer = function () {
		if (!this._oToolbarSpacer) {
			this._oToolbarSpacer = new ToolbarSpacer(this.getId() + "-Spacer");
		}

		return this._oToolbarSpacer;
	};

	/**
	 * If not existing yet, creates the inner SegmentedButton control, which controls the views.
	 * Otherwise just returns it.
	 * @returns {sap.m.SegmentedButton} The SegmentedButton object
	 * @private
	 */
	PlanningCalendarHeader.prototype._getOrCreateViewSwitch = function () {
		if (!this._oViewSwitch) {
			this._oViewSwitch = new SegmentedButton(this.getId() + "-ViewSwitch", {
				ariaLabelledBy: InvisibleText.getStaticId("sap.m", "PCH_VIEW_SWITCH")
			});

			this._oViewSwitch.attachEvent("selectionChange", this._handleViewSwitchChange, this);
			this.addDependent(this._oViewSwitch);
		}

		return this._oViewSwitch;
	};

	/**
	 * Converts the view switch from sap.m.SegmentedButton to sap.m.Select.
	 * @private
	 */
	PlanningCalendarHeader.prototype._convertViewSwitchToSelect = function () {
		this._oViewSwitch._bForcedSelectMode = true;
		this._oViewSwitch._toSelectMode();
	};

	/**
	 * Converts the view switch from sap.m.Select to sap.m.SegmentedButton
	 * @private
	 */
	PlanningCalendarHeader.prototype._convertViewSwitchToSegmentedButton = function () {
		this._oViewSwitch._bForcedSelectMode = false;
		this._oViewSwitch._toNormalMode();
	};

	/**
	 * Returns the today button control.
	 *
	 * @returns {sap.m.Button} The today button
	 * @private
	 */
	PlanningCalendarHeader.prototype._getTodayButton = function () {
		return this._oTodayBtn;
	};

	/**
	 * Handler for the select event of the current picker.
	 * @private
	 */
	PlanningCalendarHeader.prototype._handlePickerDateSelect = function () {
		var sCurrentPickerId = this.getAssociation("currentPicker"),
			oPicker = Element.getElementById(sCurrentPickerId),
			oSelectedDate = oPicker.getSelectedDates()[0].getStartDate();

		this.setStartDate(oSelectedDate);
		this._closeCalendarPickerPopup();
		this.fireDateSelect();

		// TODO: Focus should be returned to the picker after selection.
		//oPickerBtnDomRef && oPickerBtnDomRef.focus();
	};

	PlanningCalendarHeader.prototype._handleIndexPickerSelect = function (oEvent) {
		var iSelectedIndex = this._oIndexPicker.getSelectedIndex();
		var oSelectedDate = UI5Date.getInstance(this._oCalendar.getMinDate());
		var oRelativeInfo = this._getRelativeInfo();

		oSelectedDate.setDate(oSelectedDate.getDate() + iSelectedIndex * oRelativeInfo.iIntervalSize);

		this.setStartDate(oSelectedDate);
		this._closeCalendarPickerPopup();
		this.fireDateSelect();
	};

	/**
	 * Handler for the change event of the view switch.
	 * @private
	 */
	PlanningCalendarHeader.prototype._handleViewSwitchChange = function (oEvent) {
		this.fireViewChange(oEvent.getParameters());
	};


	/**
	 * Opens the picker popup, when the picker button from the _navigationToolbar is pressed.
	 * @param {object} oPicker The picker to be opened
	 * @private
	 */
	PlanningCalendarHeader.prototype._openCalendarPickerPopup = function(oPicker){
		var aContent, oContent;

		if (!this._oPopup) {
			this._oPopup = this._createPopup();
		}

		aContent = this._oPopup.getContent();
		if (aContent.length) {
			oContent = this._oPopup.getContent()[0];
			if (oContent.isA("sap.ui.unified.internal.CustomYearPicker")) {
				this.setAggregation("_yearPicker", this._oPopup.removeAllContent()[0]);
			} else if (oContent.isA("sap.ui.unified.internal.CustomMonthPicker")) {
				this.setAggregation("_monthPicker", this._oPopup.removeAllContent()[0]);
			} else if (oContent.isA("sap.ui.unified.calendar.IndexPicker")) {
				this.setAggregation("_indexPicker", this._oPopup.removeAllContent()[0]);
			} else if (oPicker !== oContent) {
				this.setAggregation("_calendarPicker", this._oPopup.removeAllContent()[0]);
			}
		}
		this._oPopup.addContent(oPicker);

		this._oPopup.attachAfterOpen(function () {
			var $Popover = this._oPopup.$();
			var iOffsetX = Math.floor(($Popover.width() - this._oPickerBtn.$().width()) / 2);

			this._oPopup.setOffsetX(Localization.getRTL() ? iOffsetX : -iOffsetX);

			var iOffsetY = this._oPickerBtn.$().height();

			this._oPopup.setOffsetY(this._oPopup._getCalculatedPlacement() === "Top" ? iOffsetY : -iOffsetY);
			this._oPopup.getContent()[0].focus();
		}, this);
		this._oPopup.openBy(this._oPickerBtn.getDomRef());
	};

	/**
	 * Creates the picker popup.
	 * @returns {sap.m.Popover} the created popup
	 * @private
	 */
	PlanningCalendarHeader.prototype._createPopup = function () {
		var oPopover = new Popover({
			placement: "VerticalPreferredBottom",
			showHeader: false,
			showArrow: false,
			verticalScrolling: false
		});

		oPopover.oPopup.setDurations(0, 0); // no animations
		oPopover.addDelegate({
			onsapescape: this.onsapescape
		}, this);

		this._oPopup = oPopover;

		return this._oPopup;
	};

	/**
	 * Closes the picker popup without setting new startDate to the PlanningCalendarHeader.
	 * @private
	 */
	PlanningCalendarHeader.prototype.onsapescape = function(){
		if (this._oPopup) {
			this._closeCalendarPickerPopup();
			if (this._oPickerBtn.getDomRef()) {
				this._oPickerBtn.getDomRef().focus();
			}
		}
	};

	/**
	 * Closes the picker popup.
	 * @private
	 */
	PlanningCalendarHeader.prototype._closeCalendarPickerPopup = function() {
		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
		}
	};

	/**
	 * Fires cancel on the picker popup.
	 * @private
	 */
	PlanningCalendarHeader.prototype._handlePickerCancelEvent = function () {
		var oPickerBtnDomRef = this._oPickerBtn.getDomRef();

		this.fireCancel();
		this._closeCalendarPickerPopup();
		oPickerBtnDomRef && oPickerBtnDomRef.focus();
	};

	/**
	 * Getter for _actionsToolbar.
	 * @returns {object} The _actionsToolbar object
	 * @private
	 */
	PlanningCalendarHeader.prototype._getActionsToolbar = function () {
		return this.getAggregation("_actionsToolbar");
	};

	/**
	 * Getter for _navigationToolbar.
	 * @returns {object} The _navigationToolbar object
	 * @private
	 */
	PlanningCalendarHeader.prototype._getNavigationToolbar = function () {
		return this.getAggregation("_navigationToolbar");
	};

	return PlanningCalendarHeader;

});