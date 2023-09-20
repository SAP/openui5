/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/mdc/flexibility/Util",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(Engine, Util, FLChangeHandlerBase, CondenserClassification) {
	"use strict";

	const fFinalizeSortChange = function(oChange, oControl, oSortContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oSortContent);
		}
	};

	const fAddSort = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function(resolve, reject) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					const oSortContent = {
						name: oChangeContent.key || oChangeContent.name,
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

	const fRemoveSort = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function(resolve, reject) {
			const oModifier = mPropertyBag.modifier;
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					if (!aValue) {
						// Nothing to remove
						reject();
					}

					const aFoundValue = aValue.filter(function(o) {
						return o.name === oChangeContent.name;
					});
					const iIndex = aValue.indexOf(aFoundValue[0]);

					if (iIndex > -1) {
						aValue.splice(iIndex, 1);
					} else {
						// In case the specified change is already existing (e.g. nothing to be removed) we need to ignore the change gracefully and mark it as not applicable
						return FLChangeHandlerBase.markAsNotApplicable("The specified change is already existing - change appliance ignored", true);
					}

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

	const fMoveSort = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function(resolve, reject) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then(function(oSortConditions) {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					const aFoundValue = aValue.filter(function(o) {
						return o.name === oChangeContent.name;
					});

					//remove the item from the 'sortConditions' array, insert it at the new position
					const iOldIndex = aValue.indexOf(aFoundValue[0]);
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

	const Sort = {};
	Sort.addSort = Util.createChangeHandler({
		apply: fAddSort,
		revert: fRemoveSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: {id: oChange.getContent().name},
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "sorters",
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getSortConditions().sorters,
				classification: CondenserClassification.Create,
				setTargetIndex: function(oChange, iNewTargetIndex) {
					oChange.getContent().index = iNewTargetIndex;
				},
				getTargetIndex: function(oChange) {
					return oChange.getContent().index;
				}
			};
		}
	});

	Sort.removeSort = Util.createChangeHandler({
		apply: fRemoveSort,
		revert: fAddSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: {id: oChange.getContent().name},
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "sorters",
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getSortConditions().sorters,
				classification: CondenserClassification.Destroy,
				sourceIndex: oChange.getRevertData().index,
				setIndexInRevertData: function(oChange, iIndex) {
					const oRevertData = oChange.getRevertData();
					oRevertData.index = iIndex;
					oChange.setRevertData(oRevertData);
				}
			};
		}
	});

	Sort.moveSort = Util.createChangeHandler({
		apply: fMoveSort,
		revert: fMoveSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: {id: oChange.getContent().name},
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "sorters",
				classification: CondenserClassification.Move,
				//sourceIndex: oChange.getContent().index,
				sourceIndex: oChange.getRevertData().index,
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getSortConditions().sorters,
				sourceContainer: oChange.getSelector(),
				sourceAggregation: "sorters",
				setTargetIndex: function(oChange, iNewTargetIndex) {
					oChange.getContent().index = iNewTargetIndex;
				},
				getTargetIndex: function(oChange) {
					return oChange.getContent().index;
				},
				setIndexInRevertData: function(oChange, iIndex) {
					const oRevertData = oChange.getRevertData();
					oRevertData.index = iIndex;
					oChange.setRevertData(oRevertData);
				}
			};
		}
	});

	return Sort;
});