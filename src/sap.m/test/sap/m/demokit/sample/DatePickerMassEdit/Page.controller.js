sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Button',
	'sap/m/Dialog',
	"sap/ui/unified/Calendar",
	"sap/ui/core/format/DateFormat"
], function(Controller, JSONModel, Button, Dialog, Calendar, DateFormat) {
		"use strict";

		return Controller.extend("sap.m.sample.DatePickerMassEdit.Page", {
			onInit: function () {
				// create model
				var oCalendar = new Calendar({
						width: "100%",
						select: this.handleCalendarSelect.bind(this)
					}),
					oSelectedDate,
					oTable,
					oProductModel,
					aSelectedItems,
					sBindingContext,
					sDate,
					oDateFormat = DateFormat.getInstance({pattern: "yyyy-MM-dd"});

				this.oProductModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
				this.oProductModel.setSizeLimit(10);
				this._oSelectNewDateDialog = new Dialog({
					title: "Select New Date",
					content: [
						oCalendar
					],
					beginButton: new Button({
						text: "OK",
						enabled: false,
						press: function() {
							oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate();
							oTable = this.byId('selectionTable');
							oProductModel = this.getView().getModel('products');
							aSelectedItems = oTable.getSelectedItems();

							sDate = oDateFormat.format(oSelectedDate);
							aSelectedItems.forEach(function(oItem) {
								sBindingContext = oItem.getBindingContextPath();
								oProductModel.setProperty(sBindingContext + "/DateOfSale", sDate);
							});

							this._oSelectNewDateDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function() {
							this._oSelectNewDateDialog.close();
						}.bind(this)
					})
				});

				this.getView().setModel(this.oProductModel, "products");
			},

			onChangeDatesPress: function() {
				this._oSelectNewDateDialog.open();
			},


			handleTableSelectionChange: function () {
				var oTable = this.byId('selectionTable'),
					iSelectedItemsCount = oTable.getSelectedItems().length,
					oButton = this.byId("changeDatesButton");

				oButton.setEnabled(!!iSelectedItemsCount);
			},

			handleCalendarSelect: function (oEvent) {
				var oCalendar = oEvent.getSource(),
					oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate();

				if (oSelectedDate){
					this._oSelectNewDateDialog.getBeginButton().setEnabled(true);
				}
			}
		});

	});