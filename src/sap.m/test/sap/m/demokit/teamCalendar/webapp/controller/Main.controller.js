sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"model/formatter"
], function (jQuery, Controller, Fragment, Item, MessageToast, formatter) {
	"use strict";

	return Controller.extend("teamCalendar.controller.Main", {

		myformatter : formatter,
		imagePath : (jQuery.sap.getModulePath("sap.m.demokit.teamCalendar.webapp") + '/').replace('/resources/', '/test-resources/'),

		// Initial setup
		onInit: function() {
			this._oModel = this.getView().getModel("calendar");
			this._oStartDate = this.myformatter.utcToLocalDateTime(this._oModel.getProperty("/startDate"));
			this._sSelectedView = this._oModel.getProperty("/viewKey");
			this._sSelectedMember = "Team";
			this._oCalendarContainer = this.byId("mainContent");
			this._mCalendars = {};
			this._sCalendarDisplayed = '';

			// load and display the Planning Calendar
			this._loadCalendar("PlanningCalendar");
		},

		// Does loading of the PC/SPC depending on selected item
		selectChangeHandler: function(oEvent) {
			this._sSelectedMember = oEvent.getParameter("selectedItem").getKey();
			this._loadCalendar(isNaN(this._sSelectedMember) ? "PlanningCalendar" : "SinglePlanningCalendar");
		},

		// Loads SPC for a person which row is clicked
		rowSelectionHandler: function(oEvent) {
			var oSelectedRow = oEvent.getParameter("rows")[0],
				sSelectedId = oSelectedRow.getId();
			this._sSelectedMember = sSelectedId.substr(sSelectedId.lastIndexOf('-') + 1);
			oSelectedRow.setSelected(false);
			this._loadCalendar("SinglePlanningCalendar");
		},

		// Saves currently selected date
		startDateChangeHandler: function(oEvent) {
			this._oStartDate = new Date(oEvent.getSource().getStartDate());
		},

		// Saves currently selected view
		viewChangeHandler: function(oEvent) {
			var oCalendar = oEvent.getSource();
			if (isNaN(this._sSelectedMember)) {
				this._sSelectedView = oCalendar.getViewKey();
			} else {
				this._sSelectedView = sap.ui.getCore().byId(oCalendar.getSelectedView()).getKey();
			}
			oCalendar.setStartDate(this._oStartDate);
		},

		// Handler of the "Create" button
		appointmentCreate: function(oEvent) {
			MessageToast.show("Creating new appointment...");
		},

		// Opend a legend
		openLegend: function(oEvent) {
			var oSource = oEvent.getSource(),
				oView = this.getView();
			if (!this._pLegendPopover) {
				this._pLegendPopover = Fragment.load({
					id: oView.getId(),
					name: "teamCalendar.view.Legend",
					controller: this
				}).then(function(oLegendPopover){
					oView.addDependent(oLegendPopover);
					return oLegendPopover;
				});
			}
			this._pLegendPopover.then(function(oLegendPopover){
				if (oLegendPopover.isOpen()) {
					oLegendPopover.close();
				} else {
					oLegendPopover.openBy(oSource);
				}
			});
		},

		// Loads and displays calendar (if not already loaded), otherwise just displays it
		_loadCalendar: function(sCalendarId) {
			var oView = this.getView();

			if (!this._mCalendars[sCalendarId]) {
				this._mCalendars[sCalendarId] =	Fragment.load({
					id: oView.getId(),
					name: "teamCalendar.view." + sCalendarId,
					controller: this
				}).then(function(oCalendarVBox){
					this._populateSelect(this.byId(sCalendarId + "TeamSelector"));
					return oCalendarVBox;
				}.bind(this));
			}

			this._mCalendars[sCalendarId].then(function(oCalendarVBox){
				this._displayCalendar(sCalendarId, oCalendarVBox);
			}.bind(this));
		},

		_hideCalendar: function(){
			if (this._sCalendarDisplayed === '') {
				return Promise.resolve();
			}
			return this._mCalendars[this._sCalendarDisplayed].then(function(oOldCalendarVBox){
				this._oCalendarContainer.removeContent(oOldCalendarVBox);
			}.bind(this));
		},

		// Displays already loaded calendar
		_displayCalendar: function(sCalendarId, oCalendarVBox) {
			this._hideCalendar().then(function(){
				this._oCalendarContainer.addContent(oCalendarVBox);
				this._sCalendarDisplayed = sCalendarId;
				var oCalendar = oCalendarVBox.getItems()[0];
				var oTeamSelect = this.byId(sCalendarId + "TeamSelector");
				oTeamSelect.setSelectedKey(this._sSelectedMember);
				oCalendar.setStartDate(this._oStartDate);
				if (isNaN(this._sSelectedMember)) {
					// Planning Calendar
					oCalendar.setViewKey(this._sSelectedView);
					oCalendar.bindElement({
						path: "/team",
						model: "calendar"
					});
				} else {
					// Single Planning Calendar
					oCalendar.setSelectedView(oCalendar.getViewByKey(this._sSelectedView));
					oCalendar.bindElement({
						path: "/team/" + this._sSelectedMember,
						model: "calendar"
					});
				}
			}.bind(this));
		},

		// Adds "Team" and all team members as select items
		_populateSelect: function(oSelect) {
			var iCount = this._oModel.getProperty("/team").length,
			iPerson;
			for (iPerson = 0; iPerson < iCount; iPerson++) {
				oSelect.addItem(new Item({
					key: iPerson,
					text: this._oModel.getProperty("/team")[iPerson].name
				}));
			}
		}

	});
});