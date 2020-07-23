/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/internal/samples/odata/v2/SalesOrders/tests/pages/Main",
		"sap/ui/core/internal/samples/odata/v2/SalesOrders/tests/MessagesForNoteFields",
		"sap/ui/core/internal/samples/odata/v2/SalesOrders/tests/MessageStripAndAggregatedTableRowHighlighting",
		"sap/ui/core/internal/samples/odata/v2/SalesOrders/tests/MessageLifecycleSideEffects"
	], function () {
		QUnit.start();
	});
});