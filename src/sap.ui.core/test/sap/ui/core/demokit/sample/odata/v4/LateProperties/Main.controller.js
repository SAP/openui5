/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm"
], function (Button, ButtonType, Dialog, Input, Label, MessageToast, Text, Controller, Title,
		SimpleForm) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.LateProperties.Main", {
		onOpenEditDeliveryDate : function(oEvent) {
			var oDialog = new Dialog({
					title : "Edit Delivery Date",
					content : new SimpleForm({
						content : [
							new Title({text : "Sales Order"}),
							new Label({text : "Sales Order ID "}),
							new Text({id : "SalesOrderID", text : "{SCHDL_2_SO/SalesOrderID}",
								tooltip : "SalesOrderID reused from Sales Orders"}),
							new Label({text : "Note"}),
							new Text({id : "Note", text : "{SCHDL_2_SO/Note}",
								tooltip : "Note fetched as late property"}),
							new Label({text : "Buyer"}),
							new Text({id : "CompanyName", text : "{SCHDL_2_SO/SO_2_BP/CompanyName}",
								tooltip : "CompanyName reused from Sales Orders->SO_2_BP"}),
							new Label({text : "Buyer Web Address"}),
							new Text({id : "WebAddress", text : "{SCHDL_2_SO/SO_2_BP/WebAddress}",
								tooltip : "WebAddress fetched as late property within already " +
									"expanded Sales Orders->SO_2_BP"}),
							new Title({text : "Schedule"}),
							new Label({text : "Schedule Key"}),
							new Text({id : "ScheduleKey", text : "{ScheduleKey}",
								tooltip : "ScheduleKey reused from Schedules"}),
							new Label({text : "Item Key"}),
							new Text({id : "ItemKey", text : "{ItemKey}",
								tooltip : "ItemKey reused from Schedules"}),
							new Label({text : "Delivery Date"}),
							new Input({id : "DeliveryDate", value : "{DeliveryDate}",
								tooltip : "DeliveryDate fetched as late property"})
						]
					}),
					beginButton: new Button({
						id : "confirmEditDeliveryDialog",
						press : function () {
							var oModel = oDialog.getModel();

							if (oModel.hasPendingChanges("UpdateGroup")) {
								oModel.submitBatch("UpdateGroup").then(function() {
									MessageToast.show("Delivery Date saved");
								});
							}
							oDialog.close();
							oDialog.destroy();
						},
						text : "Confirm",
						type : ButtonType.Emphasized
					}),
					endButton: new Button({
						id : "cancelEditDeliveryDialog",
						text : "Cancel",
						press : function () {
							oDialog.getModel().resetChanges("UpdateGroup");
							oDialog.close();
							oDialog.destroy();
						}
					})
				});

			this.getView().addDependent(oDialog);

			oDialog.setBindingContext(oEvent.getSource().getBindingContext());
			oDialog.open();
		},
		onSalesOrderSelect : function (oEvent) {
			this.byId("SO_2_SCHDL").setBindingContext(
				oEvent.getParameter("listItem").getBindingContext());
		}
	});
});