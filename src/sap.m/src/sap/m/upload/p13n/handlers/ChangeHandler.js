/*!
 * ${copyright}
 */

/**
 *
 * Change Handler for upload set table personalization for several sceneraios
 * Columns,Grouping,Sorting
 *
 * @internal
 * @private
 *
 */

sap.ui.define(["sap/m/upload/p13n/PersManager", "sap/m/upload/p13n/modules/CustomDataConfig","sap/ui/fl/changeHandler/condenser/Classification"], function (PersManager, CustomDataConfig, CondenserClassification) {
	"use strict";

	const ChangeHandler = {};

	ChangeHandler.chainPromise = function (oControl, fTask) {
		const fnCleanPromise = function (oPromise) {
			if (oControl._p13nQueue === oPromise) {
				delete oControl._p13nQueue;
			}
		};
		oControl._p13nQueue = oControl._p13nQueue instanceof Promise ? oControl._p13nQueue.then(fTask) : fTask();
		oControl._p13nQueue.then(fnCleanPromise.bind(null, oControl._p13nQueue));
	};

	ChangeHandler.applyModifiedConfig = function (oControl) {
		if (!oControl.isA) {
			return;
		}
		if (oControl._p13nChangeApplyPromise) {
			return;
		}
		oControl._p13nChangeApplyPromise = PersManager.getInstance()
			.waitForChanges(oControl)
			.then(() => {
				//This event will be fired when all the changes are ready for the control
				PersManager.getInstance().applyStateChange(oControl);
				delete oControl._p13nChangeApplyPromise;
			});
	};

	ChangeHandler.create = function (revertDataProvider) {
		return {
			changeHandler: {
				applyChange: function (oChange, oControl, mPropertyBag) {
					return ChangeHandler.chainPromise(oControl, function () {
						const sChangeType = oChange.getChangeType(),
							oContent = oChange.getContent();

						const revertData = revertDataProvider.createRevertData(oContent);
						oChange.setRevertData(revertData);

						return CustomDataConfig.update(oControl, {
							changeType: sChangeType,
							content: oContent,
							propertyBag: mPropertyBag
						}).then(() => ChangeHandler.applyModifiedConfig(oControl));
					});
				},
				completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
					// Not used, but needs to be there
				},
				getCondenserInfo: function(oChange) {
					return {
						classification: CondenserClassification.LastOneWins,
						affectedControl: oChange.getSelector(),
						uniqueKey: oChange.getContent().targetAggregation
					};
				},
				revertChange: function (oChange, oControl, mPropertyBag) {
					return ChangeHandler.chainPromise(oControl, function () {
						const sChangeType = oChange.getChangeType(),
							oContent = oChange.getRevertData();

						return CustomDataConfig.update(oControl, {
							changeType: sChangeType,
							content: oContent,
							propertyBag: mPropertyBag
						})
							.then(() => oChange.resetRevertData())
							.then(() => ChangeHandler.applyModifiedConfig(oControl));
					});
				}
			},
			layers: {
				USER: true
			}
		};
	};

	return ChangeHandler;
});
