/*!
 * ${copyright}
 */

/**
 * This module is used only for testing purposes.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Page",
	"sap/ui/support/mock/StorageSynchronizer",
	"sap/ui/support/supportRules/util/EvalUtils"
], function (
	Core,
	XMLView,
	Page,
	StorageSynchronizer,
	EvalUtils
) {
	"use strict";

	function checkAndDisableEval () {
		var oUrlParams = new URLSearchParams(window.location.search);

		if (oUrlParams.get("sa-disabled-eval")) {
			EvalUtils.isEvalAllowed = function () {
				return false;
			};
		}
	}

	function afterStorageInitialized () {
		XMLView.create({
			viewName: "sap.ui.support.supportRules.ui.views.Main"
		}).then(function (xmlView) {
			var oPage = new Page("page", {
				showHeader: false,
				backgroundDesign: "Solid",
				content: [
					xmlView
				]
			});

			oPage.placeAt("content");
		});
	}

	Core.ready(function () {
		StorageSynchronizer.prepareInitFrame();
		StorageSynchronizer.preparePreserveFrame();
		checkAndDisableEval();
		StorageSynchronizer.initializeFrame(afterStorageInitialized);
	});
});
