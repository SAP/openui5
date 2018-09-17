/*!
 * ${copyright}
 */

// Provides control sap.m.OnePersonHeader.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'./Toolbar',
	'./AssociativeOverflowToolbar',
	'./Button',
	'./Title',
	'./ToolbarSpacer',
	'./SegmentedButton',
	'sap/ui/unified/Calendar',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/Popup',
	'sap/ui/core/IconPool',
	'sap/ui/core/LocaleData'
],
function(
	Control,
	library,
	Toolbar,
	AssociativeOverflowToolbar,
	Button,
	Title,
	ToolbarSpacer,
	SegmentedButton,
	Calendar,
	DateFormat,
	UniversalDate,
	Popup,
	IconPool,
	LocaleData
) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	/**
	 * Constructor for a new <code>OnePersonHeader</code>.
	 *
	 * @class
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var OnePersonHeader = Control.extend("sap.m.OnePersonHeader", /** @lends sap.m.OnePersonHeader.prototype */ { metadata : {

		library : "sap.m",

		properties : {

			title: { type: "string", group: "Data", defaultValue: "" },

			selectedDate: { type : "object", group : "Data" },

			pickerText : { type : "string", group : "Data" }

		},

		aggregations : {

			actions : { type : "sap.ui.core.Control", multiple: true, singularName: "action" },

			_actionsToolbar : { type: "sap.m.OverflowToolbar", multiple: false, visibility : "hidden" },

			_navigationToolbar : { type: "sap.m.Toolbar", multiple: false, visibility : "hidden" },

			_picker : { type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden" }
		},

		events : {

			pressPrevious: {},

			pressToday: {},

			pressNext: {},

			dateSelect: {}
		}

	}});

	OnePersonHeader.prototype.init = function() {

		var sOPHId = this.getId(),
			sNavToolbarId = sOPHId + "-NavToolbar",
			oPrevBtn,
			oTodayBtn,
			oNextBtn;

		this.setAggregation("_actionsToolbar", new AssociativeOverflowToolbar(sOPHId + "-ActionsToolbar", {
			design: ToolbarDesign.Transparent
		})
			.addStyleClass("sapMOnePerHeadActionsToolbar")
			.addContent(this._getTitleControl())
			.addContent(this._getToolbarSpacer())
			.addContent(this._getViewSwitch())
		);

		oPrevBtn = new Button(sNavToolbarId + "-PrevBtn", {
			icon: IconPool.getIconURI('slim-arrow-left'),
			press: function () {
				this.firePressPrevious();
			}.bind(this)
		});
		oTodayBtn = new Button(sNavToolbarId + "-TodayBtn", {
			text: "Today",
			press: function () {
				this.firePressToday();
			}.bind(this)
		});
		oNextBtn = new Button(sNavToolbarId + "-NextBtn", {
			icon: IconPool.getIconURI('slim-arrow-right'),
			press: function () {
				this.firePressNext();
			}.bind(this)
		});
		this.oPicker = new Calendar(sOPHId + "-Cal");
		this.oPicker.attachEvent("select", this._handlePickerDateSelect, this);
		this.setAggregation("_picker", this.oPicker);
		this.oPickerBtn = new Button(sNavToolbarId + "-PickerBtn", {
			text: this.getPickerText(),
			press: function () {
				var oDate = this.getSelectedDate() || new Date(),
					oUniDate = new UniversalDate(UniversalDate.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()));
				this.oPicker.displayDate(oUniDate.oDate);

				this._openPickerPopup(this.oPicker);
			}.bind(this)
		});

		this.setAggregation("_navigationToolbar", new Toolbar(sNavToolbarId, {
			design: ToolbarDesign.Transparent,
			content: [
				oPrevBtn,
				oTodayBtn,
				oNextBtn,
				this.oPickerBtn
			]
		}).addStyleClass("sapMOnePerHeadNavToolbar"));

	};

	OnePersonHeader.prototype.exit = function () {
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

		if (this.oPickerBtn) {
			this.oPickerBtn = null;
		}
	};

	OnePersonHeader.prototype.onBeforeRendering = function () {
		var oActionsToolbar = this._getActionsToolbar();

		if (this.getActions().length) {
			oActionsToolbar.setProperty("visible", true, true);
		} else {
			oActionsToolbar.setProperty("visible", false, true);
		}
	};

	OnePersonHeader.prototype.setTitle = function (sTitle) {
		this._getTitleControl().setText(sTitle).setVisible(!!sTitle);

		return this.setProperty("title", sTitle);
	};

	OnePersonHeader.prototype.addAction = function (oAction) {
		this._getActionsToolbar().addContent(oAction);

		return this.addAggregation("actions", oAction);
	};

	OnePersonHeader.prototype.insertAction = function (oAction, iIndex) {
		this._getActionsToolbar().insertContent(oAction, iIndex + 3);

		return this.insertAggregation("actions", oAction, iIndex);
	};

	OnePersonHeader.prototype.removeAction = function (oAction) {
		this._getActionsToolbar().removeContent(oAction);

		return this.removeAggregation("actions", oAction);
	};

	OnePersonHeader.prototype.removeAllActions = function () {
		this._getActionsToolbar().getContent().forEach(function (oItem, iIndex) {
			if (iIndex > 2) {
				this._getActionsToolbar().removeContent(oItem);
			}
		}, this);

		return this.removeAllAggregation("actions");
	};

	OnePersonHeader.prototype.destroyActions = function () {
		this._getActionsToolbar().getContent().forEach(function (oItem, iIndex) {
			if (iIndex > 2) {
				this._getActionsToolbar().removeContent(oItem);
			}
		}, this);

		return this.destroyAggregation("actions");
	};

	OnePersonHeader.prototype.setSelectedDate = function (oDate) {
		this.setProperty("selectedDate", oDate, true);

		return this;
	};

	OnePersonHeader.prototype.setPickerText = function (sText) {
		this.setProperty("pickerText", sText, true);
		this.oPickerBtn.setText(sText);

		return this;
	};

	OnePersonHeader.prototype._getTitleControl = function () {
		if (!this._oTitle) {
			this._oTitle = new Title(this.getId() + "-Title", { visible: false });
		}

		return this._oTitle;
	};

	OnePersonHeader.prototype._getToolbarSpacer = function () {
		if (!this._oToolbarSpacer) {
			this._oToolbarSpacer = new ToolbarSpacer(this.getId() + "-Spacer");
		}

		return this._oToolbarSpacer;
	};

	OnePersonHeader.prototype._getViewSwitch = function () {
		if (!this._oViewSwitch) {
			this._oViewSwitch = new SegmentedButton(this.getId() + "-ViewSwitch");
		}

		return this._oViewSwitch;
	};

	OnePersonHeader.prototype._handlePickerDateSelect = function () {
		var oSelectedDate = this.oPicker.getSelectedDates()[0].getStartDate();

		this.setSelectedDate(oSelectedDate);
		this._closeCalendarPicker();
		this.fireDateSelect();// TODO: pass the selected date
	};

	OnePersonHeader.prototype._openPickerPopup = function(oPicker){

		var eDock;

		if (!this._oPopup) {
			this._oPopup = new Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setAutoCloseAreas([this.getDomRef()]);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup._oCalendar = this;
			this._oPopup.attachClosed(function() {
				this._closeCalendarPicker(true);
			}, this);
			this._oPopup.onsapescape = function(oEvent) {
				this._oCalendar.onsapescape(oEvent);
			};
		}

		this._oPopup.setContent(oPicker);

		eDock = Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterTop, this.oPickerBtn, null, "flipfit", true);

	};

	OnePersonHeader.prototype.onsapescape = function(){
		if (this._oPopup) {
			this._closeCalendarPicker.call(this);
			if (this.oPickerBtn.getDomRef()) {
				this.oPickerBtn.getDomRef().focus();
			}
		}
	};

	OnePersonHeader.prototype._closeCalendarPicker = function() {
		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
		}
	};

	OnePersonHeader.prototype._getActionsToolbar = function () {
		return this.getAggregation("_actionsToolbar");
	};

	return OnePersonHeader;

});