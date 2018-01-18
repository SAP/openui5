/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants"
], function (Controller, storage, constants) {
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
				this.persistSelection();

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

		/**
		 * Traverses the model and creates a rule descriptor for every selected rule.
		 * After that saves it to the local storage.
		 */
		persistSelection: function () {
			var oModel = this.getView().getModel(),
				aSelectedRules = [],
				oRule;

			for (var i in oModel.getProperty("/treeViewModel/")) {
				if (Number.isInteger(Number.parseInt(i, 10))) {
					for (var k in oModel.getProperty("/treeViewModel/" + i)) {
						oRule = oModel.getProperty("/treeViewModel/" + i + "/" + k);

						if (Number.isInteger(Number.parseInt(k, 10)) && oRule && oRule.selected) {
							aSelectedRules.push({
								ruleId: oRule.id,
								libName: oRule.libName
							});
						}
					}
				}
			}

			storage.setSelectedRules(aSelectedRules);
		},

		deletePersistedData: function() {
			storage.deletePersistenceCookie(constants.COOKIE_NAME);
			this.getView().getModel().setProperty("/persistingSettings", false);
			storage.removeAllData();
		}

	});
});
