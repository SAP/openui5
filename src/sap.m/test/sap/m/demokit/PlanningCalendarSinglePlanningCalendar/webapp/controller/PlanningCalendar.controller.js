sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/m/MessageBox",
	"model/formatter"
	],
	function (Controller, Fragment, Item, MessageBox, formatter) {
		"use strict";

		return Controller.extend("teamCalendar.PlanningCalendar", {

			myformatter : formatter,
			imagePath : (jQuery.sap.getModulePath("sap.m.demokit.PlanningCalendarSinglePlanningCalendar.webapp") + '/').replace('/resources/', '/test-resources/'),

			onAfterRendering: function() {
				var oComponent = this.getOwnerComponent();
				this._oModel = this.getView().getModel("calendar");
				this._oRouter = oComponent.getRouter();
				this._oCalendar = this.byId("PC");
				this._setCalendar();
				this._oSelector = this.byId("teamSelector");
				this._sTeamSelected = this._oSelector.getItems()[0].getKey();
				this._oModel.dataLoaded().then(this._populateSelect.bind(this));
			},

			teamMemberSelectedHandler : function(oEvent) {
				this._oRouter.navTo("memberCalendar", { selectedKey: oEvent.getParameter("selectedItem").getKey() });
			},

			startDateChangeHandler: function(oEvent) {
				var oComponent = this.getOwnerComponent();
				oComponent._oStartDate = new Date(oEvent.getSource().getStartDate());
			},

			viewChangeHandler: function(oEvent) {
				var oComponent = this.getOwnerComponent();
				oComponent._sCalendarViewKey = oEvent.getSource().getViewKey();
			},

			rowSelectionHandler: function(oEvent) {
				var aSelectedRows = oEvent.getParameter("rows"),
					iSelectedIndex,
					sSelectedId;

				sSelectedId = aSelectedRows[0].getId();
				iSelectedIndex = Number(sSelectedId.substr(sSelectedId.lastIndexOf('-') + 1));
				aSelectedRows[0].setSelected(false);
				this._oRouter.navTo("memberCalendar", { selectedKey: iSelectedIndex });
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
				var oComponent = this.getOwnerComponent();
				// set calendar view and startDate
				if (oComponent._sCalendarViewKey === "") {
					oComponent._sCalendarViewKey = this._oModel.getProperty("/viewKey");
				}
				if (!oComponent._oStartDate) {
					oComponent._oStartDate = new Date(this._oModel.getProperty("/startDate"));
				}
				this._oCalendar.setViewKey(oComponent._sCalendarViewKey);
				this._oCalendar.setStartDate(oComponent._oStartDate);
			},

			_populateSelect: function() {
				// data is loaded, do what necessary
				var iCount = this._oModel.getProperty("/team").length,
					iPerson;
				if (this._oSelector.getItems().length === 1) {
					for (iPerson = 0; iPerson < iCount; iPerson++) {
						this._oSelector.addItem(new Item({
							key: iPerson,
							text: this._oModel.getProperty("/team")[iPerson].name
						}));
					}
				}
			}

		});

	});