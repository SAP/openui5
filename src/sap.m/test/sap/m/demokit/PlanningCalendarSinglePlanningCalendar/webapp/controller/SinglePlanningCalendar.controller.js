sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/Fragment",
		'model/formatter',
		"sap/m/MessageToast"
	],
	function (Controller, Fragment, formatter, MessageToast) {
		"use strict";

		return Controller.extend("teamCalendar.SinglePlanningCalendar", {

			myformatter : formatter,

			onInit: function() {
				var oComponent = this.getOwnerComponent();
				this._oRouter = oComponent.getRouter();
				this._oRouter.getRoute("memberCalendar").attachPatternMatched(this._onObjectMatched, this);
			},

			onAfterRendering: function() {
				this._oCalendar = this.byId("SPC");
				this._oModel = this.getView().getModel("calendar");
				// set the calendar view
				this._setCalendar();
			},

			onNavBack: function(oEvent) {
				this._oRouter.navTo("teamCalendar", {}, true);
			},

			startDateChangeHandler: function(oEvent) {
				var oComponent = this.getOwnerComponent();
				oComponent._oStartDate = new Date(oEvent.getParameter('date'));
			},

			viewChangeHandler: function(oEvent) {
				var oComponent = this.getOwnerComponent();
				oComponent._sCalendarViewKey = sap.ui.getCore().byId(this._oCalendar.getSelectedView()).getKey();
			},

			appointmentCreate: function(oEvent) {
				MessageToast.show("Creating new appointment...");
			},

			openLegend: function(oEvent) {
				var oSource = oEvent.getSource();
				if (!this._oLegendPopover) {
					Fragment.load({
						id: "LegendFrag",
						name: "teamCalendar.view.Legend",
						controller: this
					}).then(function(oPopoverContent){
						this._oLegendPopover = oPopoverContent;
						this.getView().addDependent(this._oLegendPopover);
						this._oLegendPopover.openBy(oSource);
					}.bind(this));
				} else if (this._oLegendPopover.isOpen()) {
					this._oLegendPopover.close();
				} else {
					this._oLegendPopover.openBy(oSource);
				}
			},

			_setCalendar: function() {
				var oComponent = this.getOwnerComponent(),
					oView;
				// set calendar view and startDate
				if (oComponent._sCalendarViewKey === "") {
					oComponent._sCalendarViewKey = this._oModel.getProperty("/viewKey");
				}
				oView = this._oCalendar.getViewByKey(oComponent._sCalendarViewKey);
				// set start date
				if (!oComponent._oStartDate) {
					oComponent._oStartDate = new Date(this._oModel.getProperty("/startDate"));
				}
				this._oCalendar.setStartDate(oComponent._oStartDate);
				this._oCalendar.setSelectedView(oView);
			},

			_onObjectMatched: function(oEvent, oController) {
				var iSelectedKey = oEvent.getParameter("arguments").selectedKey;
				if (this.getView().getModel("calendar").getProperty("/team/" + iSelectedKey)) {
					this.getView().bindElement({
						path: "/team/" + iSelectedKey,
						model: "calendar"
					});
				} else {
					this._oRouter.getTargets().display("objectNotFound");
				}
			}

		});

	});