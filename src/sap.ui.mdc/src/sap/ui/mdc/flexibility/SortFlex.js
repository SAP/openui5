/*
 * ! ${copyright}
 */
sap.ui.define(["sap/ui/mdc/p13n/Engine"], function(Engine) {
	"use strict";
	var fRebindControl = function(oControl) {
		var bExecuteRebindForTable = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound();
		var bExecuteRebindForChart = oControl && oControl.isA && (oControl.isA("sap.ui.mdc.Chart"));
		if (bExecuteRebindForTable || bExecuteRebindForChart) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				Engine.getInstance().waitForChanges(oControl).then(function() {
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

	var fFinalizeSortChange = function(oChange, oControl, oSortContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oSortContent);
		}
		// Rebind Table if needed
		fRebindControl(oControl);
	};

	var fAddSort = function(oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function(resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					var aValue = oSortConditions ? oSortConditions.sorters : [];

					var oSortContent = {
						name: oChangeContent.name,
						descending: oChangeContent.descending
					};

					aValue.splice(oChangeContent.index, 0, oSortContent);

					oSortConditions = {
						sorters: aValue
					};
					oModifier.setProperty(oControl, "sortConditions", oSortConditions);

					fFinalizeSortChange(oChange, oControl, oSortContent, bIsRevert);
					resolve();
				})
				.catch(function(oError){
					reject(oError);
				});
		});
	};

	var fRemoveSort = function(oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function(resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					var aValue = oSortConditions ? oSortConditions.sorters : [];

					if (!aValue) {
						// Nothing to remove
						reject();
					}

					var aFoundValue = aValue.filter(function(o) {
						return o.name === oChangeContent.name;
					});
					var iIndex = aValue.indexOf(aFoundValue[0]);

					aValue.splice(iIndex, 1);

					oSortConditions = {
						sorters: aValue
					};
					oModifier.setProperty(oControl, "sortConditions", oSortConditions);

					fFinalizeSortChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch(function(oError){
					reject(oError);
				});
		});
	};

	var fMoveSort = function(oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function(resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					var aValue = oSortConditions ? oSortConditions.sorters : [];

					var aFoundValue = aValue.filter(function(o) {
						return o.name === oChangeContent.name;
					});

					//remove the item from the 'sortConditions' array, insert it at the new position
					var iOldIndex = aValue.indexOf(aFoundValue[0]);
					aValue.splice(oChangeContent.index, 0, aValue.splice(iOldIndex, 1)[0]);

					oSortConditions = {
						sorters: aValue
					};
					oModifier.setProperty(oControl, "sortConditions", oSortConditions);

					//finalize the 'moveSort' change (only persist name + index)
					fFinalizeSortChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch(function(oError){
					reject(oError);
				});
		});
	};

	var Sort = {};
	Sort.removeSort = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fRemoveSort(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fAddSort(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Sort.addSort = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fAddSort(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fRemoveSort(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Sort.moveSort = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fMoveSort(oChange, oControl, mPropertyBag);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fMoveSort(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};
	return Sort;
});
