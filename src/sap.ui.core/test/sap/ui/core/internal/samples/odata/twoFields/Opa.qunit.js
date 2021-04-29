/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/internal/samples/odata/twoFields/tests/pages/Main",
		"sap/ui/core/internal/samples/odata/twoFields/tests/All"
	], function () {
		QUnit.start();
	});
});