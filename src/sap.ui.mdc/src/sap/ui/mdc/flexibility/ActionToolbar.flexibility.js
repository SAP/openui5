/*!
 * ${copyright}
 */

sap.ui.define([
	"./ItemBaseFlex",
	"./Util",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"./actiontoolbar/CombineAction",
	"./actiontoolbar/SplitAction"
], (
	ItemBaseFlex,
	Util,
	ChangeCategories,
	CombineAction,
	SplitAction
) => {
	"use strict";

	const oActionFlex = Object.assign({}, ItemBaseFlex);

	oActionFlex.findItem = function(oModifier, aActions, sName) {
		return aActions.find((oAction) => {
			return oModifier.getId(oAction) === sName;
		});
	};

	oActionFlex.determineAggregation = function(oModifier, oControl) {
		return oModifier.getAggregation(oControl, "actions").then((aActions) => {
			return {
				name: "actions",
				items: aActions
			};
		});
	};

	oActionFlex._applyMove = function(oChange, oControl, mPropertyBag, sChangeReason) {
		const bIsRevert = sChangeReason === Util.REVERT ? true : false;
		const oModifier = mPropertyBag.modifier;
		if (oModifier.getParent(oControl)) {
			const oParent = oModifier.getParent(oControl);
			if (oModifier.getControlType(oParent) === "sap.ui.mdc.Chart") {
				// ActionToolbar of sap.ui.mdc.Chart
				oControl = oParent;
			} else if (oModifier.getParent(oParent) && oModifier.getControlType(oModifier.getParent(oParent)) === "sap.ui.mdc.Table") {
				// ActionToolbar of sap.ui.mdc.Table
				oControl = oModifier.getParent(oParent);
			}
		}
		this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
		if (this._bSupressFlickering) {
			this._delayInvalidate(oControl);
		}

		const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
		let oControlAggregationItem;
		let oAggregation;
		let iOldIndex;
		let sControlAggregationItemId;

		// 1) Fetch existing item
		const pMove = this.determineAggregation(oModifier, oControl)
			.then((oRetrievedAggregation) => {
				oAggregation = oRetrievedAggregation;
				return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
			})
			.then((oRetrievedControlAggregationItem) => {
				oControlAggregationItem = oRetrievedControlAggregationItem;
			})

			// 2) Throw error if for some reason no item could be found (should not happen for a move operation)
			.then(() => {
				if (!oControlAggregationItem) {
					throw new Error("No corresponding item in " + oAggregation.name + " found. Change to move item cannot be " + this._getOperationText(bIsRevert) + "at this moment");
				}
				sControlAggregationItemId = oModifier.getId(oControlAggregationItem);
				return oModifier.findIndexInParentAggregation(oControlAggregationItem);
			})

			// 3) Trigger the move (remove&insert)
			.then((iRetrievedIndex) => {
				iOldIndex = iRetrievedIndex;
				return oModifier.removeAggregation(oControl, oAggregation.name, oControlAggregationItem)
					.then(() => {
						return oModifier.insertAggregation(oControl, oAggregation.name, oControlAggregationItem, oChangeContent.index);
					});
			})

			// 4) Prepare the revert data
			.then(() => {
				if (bIsRevert) {
					// Clear the revert data on the change
					oChange.resetRevertData();
				} else {
					oChange.setRevertData({
						name: oChangeContent.name,
						index: iOldIndex,
						item: sControlAggregationItemId
					});
				}
				this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
			});

		return pMove;
	};


	oActionFlex.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oContent = oChange.getContent();
		const oToolbar = oAppComponent.byId(oChange.getSelector().id);
		let sKey;
		const aArgs = [oContent.name];
		const mVersionInfo = { descriptionPayload: {} };

		if (oChange.getChangeType() === "moveAction") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.MOVE;
			sKey = "actiontoolbar.ITEM_MOVE_CHANGE";
			aArgs.push(oChange.getRevertData().index);
			aArgs.push(oContent.index);
		}

		if (oToolbar) {
			const oAction = oAppComponent.byId(oContent.name);
			if (oAction) {
				aArgs.splice(0, 1, oAction.getLabel());
			}
		}

		return Util.getMdcResourceText(sKey, aArgs).then((sText) => {
			mVersionInfo.descriptionPayload.description = sText;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	return {
		moveAction: oActionFlex.createMoveChangeHandler(),
		"combineButtons": {
			"changeHandler": CombineAction
		},
		"splitMenuButton": {
			"changeHandler": SplitAction
		}
	};

});