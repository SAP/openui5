/*!
 * ${copyright}
 */
/*global QUnit */
(function() {
	"use strict";
	QUnit.config.autostart = false;

	var sTestPrefix = "sap/ui/core/internal/samples/odata/v2/SalesOrders/tests/";

	sap.ui.require([
		"sap/ui/core/Core",
		"sap/ui/core/sample/common/pages/Any",
		sTestPrefix + "pages/Main",
		sTestPrefix + "MessagesForNoteFields",
		sTestPrefix + "MessageStripAndAggregatedTableRowHighlighting",
		sTestPrefix + "MessageLifecycleSideEffects",
		sTestPrefix + "TransitionMessagesOnly",
		sTestPrefix + "FilterSalesOrderItemsByItemsWithMessages",
		sTestPrefix + "CreateAndDeleteSalesOrderItems",
		sTestPrefix + "UnboundMessages",
		sTestPrefix + "MessagesWithMultipleTargets",
		sTestPrefix + "MessagesReturnedFromAFunctionImport",
		sTestPrefix + "IgnoredMessages",
		sTestPrefix + "CloneSalesOrderItem",
		sTestPrefix + "ODataListBinding.create/TC1_SalesOrders",
		sTestPrefix + "ODataListBinding.create/TC2_CreateItems",
		sTestPrefix + "ODataListBinding.create/TC3_SalesOrders_InlineCreationRow",
		sTestPrefix + "ODataListBinding.create/TC4_SalesOrderItems_InlineCreationRow"
	], function (Core) {
		Core.ready().then(function () {
			QUnit.start();
		});
	});
})();