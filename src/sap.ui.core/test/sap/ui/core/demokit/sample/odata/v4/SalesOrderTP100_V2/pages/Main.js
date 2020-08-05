/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5"
], function (Helper, Opa5) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressMoreButton : function () {
					return Helper.pressMoreButton(this, sViewName);
				},
				selectSalesOrder : function (iRow) {
					return Helper.selectColumnListItem(this, sViewName, iRow);
				}
			}
		}
	});
});