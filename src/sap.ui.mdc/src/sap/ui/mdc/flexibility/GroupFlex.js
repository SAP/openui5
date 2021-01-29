/*
 * ! ${copyright}
 */
sap.ui.define(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"], function (FlexRuntimeInfoAPI) {
	"use strict";
	var fRebindControl = function (oControl) {
		var bExecuteRebindForTable = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound();
		var bExecuteRebindForChart = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Chart");
		if (bExecuteRebindForTable || bExecuteRebindForChart) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				FlexRuntimeInfoAPI.waitForChanges({
					element: oControl
				}).then(function () {
					if (bExecuteRebindForTable) {
						oControl.checkAndRebind();
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

	var fAddGroup = function (oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function (resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			var oGroupConditions = oModifier.getProperty(oControl, "groupConditions");
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
		});
	};

	var fRemoveGroup = function (oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function (resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			var oGroupConditions = oModifier.getProperty(oControl, "groupConditions");
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
		});
	};

	var fMoveGroup = function (oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function (resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			var oGroupConditions = oModifier.getProperty(oControl, "groupConditions");
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
		});
	};

	var Group = {};
	Group.removeGroup = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				return fRemoveGroup(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				return fAddGroup(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Group.addGroup = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				return fAddGroup(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				return fRemoveGroup(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Group.moveGroup = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				return fMoveGroup(oChange, oControl, mPropertyBag);
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				return fMoveGroup(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};
	return Group;
});