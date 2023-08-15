/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	'sap/ui/mdc/enums/TableType'
], function(
	TableDelegate,
	TableType
) {
	"use strict";
	var TestTableDelegate = Object.assign({}, TableDelegate);
	TestTableDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	function setSelectedGridTableConditions (oTable, aContexts) {
		var oMultiSelectionPlugin = oTable._oTable.getPlugins().find(function(oPlugin) {
			return oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin");
		});
		if (oMultiSelectionPlugin) {
			oMultiSelectionPlugin.clearSelection();
			var oRowBinding = oTable.getRowBinding();
			var aAllCurrentContexts = oRowBinding && (oRowBinding.getAllCurrentContexts ? oRowBinding.getAllCurrentContexts() : oRowBinding.getContexts());
			return aContexts.map(function (oContext) {
				var iContextIndex = aAllCurrentContexts.indexOf(oContext);
				return oMultiSelectionPlugin.addSelectionInterval(iContextIndex, iContextIndex);
			});
		}
		throw Error("Unsupported operation: TableDelegate does not support #setSelectedContexts for the given GridTable configuration.");
	}

	TestTableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		var oMetadataInfo = oMDCTable.getPayload();
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
	};

	TestTableDelegate.setSelectedContexts = function (oTable, aContexts) {
		if (oTable._isOfType(TableType.Table, true)) {
			setSelectedGridTableConditions(oTable, aContexts);
		} else {
			TableDelegate.setSelectedContexts.apply(this, arguments);
		}
	};

	return TestTableDelegate;
});