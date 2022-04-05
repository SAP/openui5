/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/mdc/flexibility/Util"
], function(Engine, Util) {
	"use strict";

	var fRebindControl = function (oControl) {
		var bExecuteRebindForTable = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound();
		var bExecuteRebindForChart = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Chart");
		if (bExecuteRebindForTable || bExecuteRebindForChart) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				Engine.getInstance().waitForChanges(oControl).then(function () {
					if (bExecuteRebindForTable) {
						oControl.rebind();
					} else if (bExecuteRebindForChart) {
						oControl.rebind();
					}
					delete oControl._bWaitForBindChanges;
				});

			}
		}
	};

	var fFinalizeGroupChange = function (oChange, oControl, oGroupContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oGroupContent);
		}
		// Rebind Table if needed
		fRebindControl(oControl);
	};

	var fAddGroup = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			var bIsRevert = (sChangeReason === Util.REVERT);
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then(function(oGroupConditions) {
					var aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

					var oGroupContent = {
						name: oChangeContent.name
					};

					aValue.splice(oChangeContent.index, 0, oGroupContent);

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					fFinalizeGroupChange(oChange, oControl, oGroupContent, bIsRevert);
					resolve();
				})
				.catch(function(oError) {
					reject(oError);
				});
		});
	};

	var fRemoveGroup = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			var bIsRevert = (sChangeReason === Util.REVERT);
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then(function(oGroupConditions) {
					var aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

					if (!aValue) {
						// Nothing to remove
						reject();
					}

					var aFoundValue = aValue.filter(function (o) {
						return o.name === oChangeContent.name;
					});
					var iIndex = aValue.indexOf(aFoundValue[0]);

					aValue.splice(iIndex, 1);

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					fFinalizeGroupChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch(function(oError) {
					reject(oError);
				});
		});
	};

	var fMoveGroup = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			var bIsRevert = (sChangeReason === Util.REVERT);
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then(function(oGroupConditions) {
					var aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

					var aFoundValue = aValue.filter(function (o) {
						return o.name === oChangeContent.name;
					});

					//remove the item from the 'GroupConditions' array, insert it at the new position
					var iOldIndex = aValue.indexOf(aFoundValue[0]);
					aValue.splice(oChangeContent.index, 0, aValue.splice(iOldIndex, 1)[0]);

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					//finalize the 'moveGroup' change (only persist name + index)
					fFinalizeGroupChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
			.catch(function(oError) {
				reject(oError);
			});
		});
	};

	var Group = {};
	Group.removeGroup = Util.createChangeHandler({
		apply: fRemoveGroup,
		revert: fAddGroup
	});

	Group.addGroup = Util.createChangeHandler({
		apply: fAddGroup,
		revert: fRemoveGroup
	});

	Group.moveGroup = Util.createChangeHandler({
		apply: fMoveGroup,
		revert: fMoveGroup
	});

	return Group;
});