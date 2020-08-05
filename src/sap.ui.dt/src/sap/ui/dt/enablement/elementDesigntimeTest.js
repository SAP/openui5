/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/enablement/report/QUnitReport",
	"sap/ui/dt/enablement/ElementEnablementTest"
], function (
	QUnitReport,
	ElementEnablementTest
) {
	"use strict";

	var elementTest = function (mParameters) {
		var oElementEnablementTest = new ElementEnablementTest(mParameters);
		return oElementEnablementTest.run().then(function (oData) {
			var oQUnitReport = new QUnitReport({
				data: oData
			});
			oElementEnablementTest.destroy();
			oQUnitReport.destroy();
		});
	};

	return elementTest;
});