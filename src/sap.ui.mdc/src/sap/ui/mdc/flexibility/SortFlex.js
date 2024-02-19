/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge',
	"sap/ui/mdc/flexibility/Util",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"./helpers/addKeyOrName"
], (merge, Util, FLChangeHandlerBase, CondenserClassification, ChangeCategories, addKeyOrName) => {
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
		return new Promise((resolve, reject) => {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then((oSortConditions) => {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					const oSortContent = {
						key: oChangeContent.key,
						name: oChangeContent.key,
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
				.catch((oError) => {
					reject(oError);
				});
		});
	};

	const fRemoveSort = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise((resolve, reject) => {
			const oModifier = mPropertyBag.modifier;
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then((oSortConditions) => {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					if (!aValue) {
						// Nothing to remove
						reject();
					}

					const aFoundValue = aValue.filter((o) => {
						return addKeyOrName(o).key === oChangeContent.key;
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
				.catch((oError) => {
					reject(oError);
				});
		});
	};

	const fMoveSort = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise((resolve, reject) => {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "sortConditions"))
				.then((oSortConditions) => {
					const aValue = oSortConditions ? oSortConditions.sorters : [];

					const aFoundValue = aValue.filter((o) => {
						return addKeyOrName(o).key === oChangeContent.key;
					});

					//remove the item from the 'sortConditions' array, insert it at the new position
					const iOldIndex = aValue.indexOf(aFoundValue[0]);
					aValue.splice(oChangeContent.index, 0, aValue.splice(iOldIndex, 1)[0]);

					oSortConditions = {
						sorters: aValue
					};
					oModifier.setProperty(oControl, "sortConditions", oSortConditions);

					//finalize the 'moveSort' change (only persist name + index)
					const oRevertContent = merge({}, oChangeContent);
					oRevertContent.index = iOldIndex;
					fFinalizeSortChange(oChange, oControl, oRevertContent, bIsRevert);
					resolve();
				})
				.catch((oError) => {
					reject(oError);
				});
		});
	};
	const fGetChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oChangeContent = addKeyOrName(oChange.getContent());
		const oChart = oAppComponent.byId(oChange.getSelector().id);
		const mVersionInfo = { descriptionPayload: {} };
		let sKey;
		const aArgs = [oChangeContent.key];

		if (oChange.getChangeType() === "addSort") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			if (oChangeContent.descending) {
				sKey = "chart.SORT_ADD_CHANGE_DESC";
			} else {
				sKey = "chart.SORT_ADD_CHANGE_ASC";
			}
			aArgs.push(oChangeContent.index);
		} else if (oChange.getChangeType() === "removeSort") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "chart.SORT_DEL_CHANGE";
		} else {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "chart.SORT_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oChangeContent.index);
		}

		const oProperty = oChart?.getPropertyHelper()?.getProperty(oChangeContent.key);
		if (oProperty) {
			aArgs.splice(0, 1, oProperty.label);
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	const Sort = {};
	Sort.addSort = Util.createChangeHandler({
		apply: fAddSort,
		revert: fRemoveSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: { id: addKeyOrName(oChange.getContent()).key },
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
		},
		getChangeVisualizationInfo: fGetChangeVisualizationInfo
	});

	Sort.removeSort = Util.createChangeHandler({
		apply: fRemoveSort,
		revert: fAddSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: { id: addKeyOrName(oChange.getContent()).key },
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
		},
		getChangeVisualizationInfo: fGetChangeVisualizationInfo
	});

	Sort.moveSort = Util.createChangeHandler({
		apply: fMoveSort,
		revert: fMoveSort,
		getCondenserInfo: function(oChange, mPropertyBag) {
			return {
				affectedControl: { id: addKeyOrName(oChange.getContent()).key },
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
		},
		getChangeVisualizationInfo: fGetChangeVisualizationInfo
	});

	return Sort;
});