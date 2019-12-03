/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath"
], function (Helper, DateTimeOffset, Opa5, Press, BindingPath) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.LateProperties.Main";

	Opa5.createPageObjects({
		onTheEditDeliveryDialog : {
			actions : {
				changeDeliveryDate : function (){
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "DeliveryDate",
						searchOpenDialogs : true,
						success : function (oControl) {
							var oBinding = oControl.getBinding("value"),
								oDateTimeOffset = new DateTimeOffset(),
								sOldValue = oBinding.getValue(),
								oDate = oDateTimeOffset.formatValue(sOldValue, "object"),
								sNewValue;

							oDate.setHours(oDate.getHours() + 1);
							oControl.setValue(oDateTimeOffset.formatValue(oDate, "string"));
							sNewValue = oBinding.getValue();
							Opa5.assert.notStrictEqual(sNewValue, sOldValue,
								"Delivery Date changed from " + sOldValue + " to " + sNewValue);
						},
						viewName : sViewName
					});
				},
				pressCancel : function () {
					return Helper.pressButton(this, sViewName, "cancelEditDeliveryDialog", true);
				},
				pressConfirm : function () {
					return Helper.pressButton(this, sViewName, "confirmEditDeliveryDialog", true);
				}
			},
			assertions : {
				checkNonEmptyContent : function (sId, bIsInput) {
					return this.waitFor({
						controlType : bIsInput ? "sap.m.Input" : "sap.m.Text",
						id : sId,
						searchOpenDialogs : true,
						success : function (oControl) {
							var sProperty = bIsInput ? oControl.getValue() : oControl.getText();

							Opa5.assert.ok(sProperty, "Control: " + sId + " has content: "
								+ sProperty);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheMainPage : {
			actions : {
				pressEditDelivery : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Button",
						errorMessage : "Could not press Edit Delivery Button in row " + iRow,
						id : /openEditDeliveryDate/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Pressed Edit Delivery Button in row: " + iRow);
						},
						viewName : sViewName
					});
				},
				selectSalesOrder : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Text",
						errorMessage : "Could not select sales order in row " + iRow,
						id : /SalesOrderID/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "Sales order selected: " + iRow);
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});