/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
		"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/pageExpandCollapse",
		"sap/ui/test/opaQunit"
	], function (Helper, Main, pageExpandCollapse, opaTest) {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.RecursiveHierarchy");

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			var sTitle = "page, expand, collapse; w/ TreeTable: " + bTreeTable;

			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				pageExpandCollapse(Given, When, Then);
			});
		});

		QUnit.start();
	});
});
