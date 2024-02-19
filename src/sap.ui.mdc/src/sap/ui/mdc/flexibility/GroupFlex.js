/*!
 * ${copyright}
 */
sap.ui.define([
	"./Util",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"./helpers/addKeyOrName"
], (Util, FLChangeHandlerBase, CondenserClassification, ChangeCategories, addKeyOrName) => {
	"use strict";

	const fFinalizeGroupChange = function(oChange, oControl, oGroupContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oGroupContent);
		}
	};

	const fAddGroup = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise((resolve, reject) => {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then((oGroupConditions) => {
					const aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

					const oGroupContent = {
						key: oChangeContent.key,
						name: oChangeContent.key
					};

					aValue.splice(oChangeContent.index, 0, oGroupContent);

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					fFinalizeGroupChange(oChange, oControl, oGroupContent, bIsRevert);
					resolve();
				})
				.catch((oError) => {
					reject(oError);
				});
		});
	};

	const fRemoveGroup = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise((resolve, reject) => {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then((oGroupConditions) => {
					const aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

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

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					fFinalizeGroupChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch((oError) => {
					reject(oError);
				});
		});
	};

	const fMoveGroup = function(oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise((resolve, reject) => {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "groupConditions"))
				.then((oGroupConditions) => {
					const aValue = oGroupConditions ? oGroupConditions.groupLevels : [];

					const aFoundValue = aValue.filter((o) => {
						return addKeyOrName(o).key === oChangeContent.key;
					});

					//remove the item from the 'GroupConditions' array, insert it at the new position
					const iOldIndex = aValue.indexOf(aFoundValue[0]);
					aValue.splice(oChangeContent.index, 0, aValue.splice(iOldIndex, 1)[0]);

					oGroupConditions = {
						groupLevels: aValue
					};
					oModifier.setProperty(oControl, "groupConditions", oGroupConditions);

					//finalize the 'moveGroup' change (only persist name + index)
					fFinalizeGroupChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch((oError) => {
					reject(oError);
				});
		});
	};

	const fGetChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oChangeContent = addKeyOrName(oChange.getContent());
		const oTable = oAppComponent.byId(oChange.getSelector().id);
		let sKey;
		const aArgs = [oChangeContent.key];
		const mVersionInfo = { descriptionPayload: {} };

		if (oChange.getChangeType() === "addGroup") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			sKey = "table.GROUP_ITEM_ADD_CHANGE";
			aArgs.push(oChangeContent.index);
		} else if (oChange.getChangeType() === "removeGroup") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "table.GROUP_ITEM_DEL_CHANGE";
		} else if (oChange.getChangeType() === "moveGroup") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "table.GROUP_ITEM_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oChangeContent.index);
		}

		if (oTable) {
			const oProperty = oTable.getPropertyHelper()?.getProperty(oChangeContent.key);
			if (oProperty) {
				aArgs.splice(0, 1, oProperty.label);
			}
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	const Group = {};
	Group.addGroup = Util.createChangeHandler({
		apply: fAddGroup,
		revert: fRemoveGroup,
		getCondenserInfo: function(oChange, mPropertyBag) {
			const oChangeContent = addKeyOrName(oChange.getContent());
			return {
				affectedControl: { id: oChangeContent.key },
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "groupLevels",
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getGroupConditions().groupLevels,
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

	Group.removeGroup = Util.createChangeHandler({
		apply: fRemoveGroup,
		revert: fAddGroup,
		getCondenserInfo: function(oChange, mPropertyBag) {
			const oChangeContent = addKeyOrName(oChange.getContent());
			return {
				affectedControl: { id: oChangeContent.key },
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "groupLevels",
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getGroupConditions().groupLevels,
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

	Group.moveGroup = Util.createChangeHandler({
		apply: fMoveGroup,
		revert: fMoveGroup,
		getCondenserInfo: function(oChange, mPropertyBag) {
			const oChangeContent = addKeyOrName(oChange.getContent());
			return {
				affectedControl: { id: oChangeContent.key },
				affectedControlIdProperty: "name",
				targetContainer: oChange.getSelector(),
				targetAggregation: "groupLevels",
				classification: CondenserClassification.Move,
				sourceIndex: oChange.getRevertData().index,
				customAggregation: mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent).getGroupConditions().groupLevels,
				sourceContainer: oChange.getSelector(),
				sourceAggregation: "groupLevels",
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

	return Group;
});