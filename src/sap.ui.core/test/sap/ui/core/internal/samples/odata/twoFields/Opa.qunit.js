/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/internal/samples/odata/twoFields/tests/pages/Main",
	"sap/ui/core/internal/samples/odata/twoFields/tests/All"
], function (Core) {
	"use strict";
	Core.ready().then(function () {
		QUnit.start();
	});
});
