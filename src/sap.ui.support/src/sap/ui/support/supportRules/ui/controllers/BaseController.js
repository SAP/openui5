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

		onPersistedSettingSelect: function() {
			var oModel = this.getView().getModel();

			if (oModel.getProperty("/persistingSettings")) {
				storage.createPersistenceCookie(constants.COOKIE_NAME, true);

				oModel.getProperty("/libraries").forEach(function (lib) {
					if (lib.title == constants.TEMP_RULESETS_NAME) {
						storage.setRules(lib.rules);
					}
				});

				this.persistExecutionScope();
				SelectionUtils.persistSelection();

			} else {
				storage.deletePersistenceCookie(constants.COOKIE_NAME);
				this.deletePersistedData();
			}
		},

		persistExecutionScope: function() {
			var setting = {
				analyzeContext: this.model.getProperty("/analyzeContext"),
				subtreeExecutionContextId: this.model.getProperty("/subtreeExecutionContextId")
			},
			scopeComponent = this.model.getProperty("/executionScopeComponents");

			storage.setSelectedScopeComponents(scopeComponent);
			storage.setSelectedContext(setting);
		},

		deletePersistedData: function() {
			storage.deletePersistenceCookie(constants.COOKIE_NAME);
			this.getView().getModel().setProperty("/persistingSettings", false);
			storage.removeAllData();
		}

	});
});
