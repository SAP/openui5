/*
 * ! ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.mdc.FilterBar control
sap.ui.define([], function() {
	"use strict";

	return {
		actions: {

			settings: function () {
				return {
					handler: function (oControl, mPropertyBag) {
						return new Promise(function (resolve, reject) {

							var oAdaptationController = oControl._getAdaptationController();
							oAdaptationController.setLiveMode(false);
							var fnRuntimeHandling = oAdaptationController.getAfterChangesCreated();

							var fnEnhanceDialog = function (oEvt) {
								var oContainer = oEvt.getParameter("container");
								oContainer.isPopupAdaptationAllowed = function () {
									return false;
								};
								oContainer.addStyleClass(mPropertyBag.styleClass);
							};
							oAdaptationController.attachEvent("beforeP13nContainerOpens", fnEnhanceDialog);

							oAdaptationController.setAfterChangesCreated(function (oAC, aChanges) {
								//callback is only executed in "Ok" case
								resolve(aChanges);
							});

							var fnResolveAndCleanup = function (oEvt) {
								var sReason = oEvt.getParameter("reason");

								//resolve changes empty for "Cancel"
								if (sReason == "Cancel") {
									resolve([]);
								}

								//cleanup (detach events)
								oAdaptationController.setAfterChangesCreated(fnRuntimeHandling);
								oAdaptationController.setLiveMode(true);
								oAdaptationController.detachEvent("beforeP13nContainerOpens", fnEnhanceDialog);
								oAdaptationController.detachEvent("afterP13nContainerCloses", fnResolveAndCleanup);
							};

							oAdaptationController.attachEvent("afterP13nContainerCloses", fnResolveAndCleanup);
							oAdaptationController.showP13n(oControl, "Item");
						});
					}
				};
			}
		}
	};


});
