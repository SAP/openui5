/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, DateTimeOffset, Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.LateProperties.Main";

	Opa5.createPageObjects({
		onTheEditDeliveryDialog : {
			actions : {
				postponeDeliveryDateByOneDay : function (){
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "DeliveryDate",
						searchOpenDialogs : true,
						success : function (oControl) {
							var oBinding = oControl.getBinding("value"),
								oDateTimeOffset = new DateTimeOffset(),
								sOldValue = oControl.getValue(),
								oDate = oDateTimeOffset.formatValue(oBinding.getValue(), "object"),
								sNewValue;

							oDate.setDate(oDate.getDate() + 1);
							oControl.setValue(oDateTimeOffset.formatValue(oDate, "string"));
							sNewValue = oControl.getValue();
							Opa5.assert.notStrictEqual(sNewValue, sOldValue,
								"Delivery Date postponed by one day from " + sOldValue + " to "
									+ sNewValue);
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
				checkThatControlsHaveContent : function () {
					return this.waitFor({
						id :[
							"SalesOrderID",
							"Note",
							"GrossAmount",
							"CompanyName",
							"WebAddress",
							"EmailAddress",
							"ScheduleKey",
							"ItemKey",
							"DeliveryDate"
						],
						searchOpenDialogs : true,
						success : function (aControls) {
							aControls.forEach(function (oControl, i) {
								var sProperty;

								if (aControls.indexOf(oControl) !== i) {
									// I do not know why but there are duplicates of the same
									// DeliveryDate input control
									return;
								}

								sProperty = oControl.getValue
									? oControl.getValue()
									: oControl.getText();

								Opa5.assert.ok(sProperty, "Control: " + oControl.getId()
									+ " has content: " + sProperty);
							});
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheMainPage : {
			actions : {
				pressEditDeliveryInRow : function (iRow) {
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
				selectSalesOrderRow : function (iRow) {
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