/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5"
], function (Helper, Opa5) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressMoreButton : function (sTableControlId) {
					Helper.pressMoreButton(this, sViewName, sTableControlId);
				},
				selectSalesOrder : function (iRow) {
					Helper.selectColumnListItem(this, sViewName, iRow);
				}
			}
		}
	});
});
