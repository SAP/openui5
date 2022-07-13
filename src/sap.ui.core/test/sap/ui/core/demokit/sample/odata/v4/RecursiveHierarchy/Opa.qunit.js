/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/pageExpandCollapse",
		"sap/ui/test/opaQunit"
	], function (Helper, pageExpandCollapse, opaTest) {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.RecursiveHierarchy");

		//*****************************************************************************
		opaTest("page, expand, collapse", pageExpandCollapse);

		QUnit.start();
	});
});
