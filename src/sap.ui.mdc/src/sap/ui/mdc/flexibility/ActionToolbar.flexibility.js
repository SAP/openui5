/*!
 * ${copyright}
 */

sap.ui.define([
	"./ItemBaseFlex",
	"./Util"
], function(ItemBaseFlex, Util) {
	"use strict";

    const oActionFlex = Object.assign({}, ItemBaseFlex);

	oActionFlex.findItem = function(oModifier, aActions, sName) {
		return aActions.find(function (oAction) {
			return oModifier.getId(oAction) === sName;
		});
	};

	oActionFlex.determineAggregation = function(oModifier, oControl) {
		return oModifier.getAggregation(oControl, "actions").then(function(aActions) {
			return {
				name: "actions",
				items: aActions
			};
		});
	};

	oActionFlex._applyMove = function(oChange, oControl, mPropertyBag, sChangeReason) {
		const bIsRevert = sChangeReason === Util.REVERT ? true : false;
		const oModifier = mPropertyBag.modifier;
		if (oModifier.getParent(oControl)){
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
		.then(function(oRetrievedAggregation){
			oAggregation = oRetrievedAggregation;
			return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
		}.bind(this))
		.then(function(oRetrievedControlAggregationItem){
			oControlAggregationItem = oRetrievedControlAggregationItem;
		})

		// 2) Throw error if for some reason no item could be found (should not happen for a move operation)
		.then(function() {
			if (!oControlAggregationItem) {
				throw new Error("No corresponding item in " + oAggregation.name + " found. Change to move item cannot be " + this._getOperationText(bIsRevert) + "at this moment");
			}
			sControlAggregationItemId = oModifier.getId(oControlAggregationItem);
			return oModifier.findIndexInParentAggregation(oControlAggregationItem);
		}.bind(this))

		// 3) Trigger the move (remove&insert)
		.then(function(iRetrievedIndex) {
			iOldIndex = iRetrievedIndex;
			return oModifier.removeAggregation(oControl, oAggregation.name, oControlAggregationItem)
			.then(function(){
				return oModifier.insertAggregation(oControl, oAggregation.name, oControlAggregationItem, oChangeContent.index);
			});
		})

		// 4) Prepare the revert data
		.then(function() {
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
		}.bind(this));

		return pMove;
	};

	return {
        moveAction: oActionFlex.createMoveChangeHandler()
	};

});