/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/ui/models/SelectionUtils"
], function (Controller, storage, constants, SelectionUtils) {
	"use strict";

	return Controller.extend("sap.ui.support.supportRules.ui.controllers.BaseController", {

		persistExecutionScope: function() {
			var setting = {
				analyzeContext: this.model.getProperty("/analyzeContext"),
				subtreeExecutionContextId: this.model.getProperty("/subtreeExecutionContextId")
			},
			scopeComponent = this.model.getProperty("/executionScopeComponents");

			storage.setSelectedScopeComponents(scopeComponent);
			storage.setSelectedContext(setting);
		},

		/**
		 * Persist visible columns selection in local storage.
		 **/
		persistVisibleColumns: function() {
			var aVisibleColumnsIds = [],
			aColumns = SelectionUtils.treeTable.getColumns();

			aColumns.forEach(function (oColumn) {
				if (oColumn.getVisible()){
					aVisibleColumnsIds.push(oColumn.sId);
				}
			});

			storage.setVisibleColumns(aVisibleColumnsIds);
		},

		deletePersistedData: function() {
			storage.deletePersistenceCookie(constants.COOKIE_NAME);
			this.getView().getModel().setProperty("/persistingSettings", false);
			storage.removeAllData();
		}

	});
});
