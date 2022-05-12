/*
 * ! ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

    var oActionFlex = Object.assign({}, ItemBaseFlex);

	oActionFlex.findItem = function(oModifier, aActions, sName) {
		return sap.ui.getCore().byId(sName);
	};

	oActionFlex.determineAggregation = function(oModifier, oControl) {
		return Promise.resolve().then(function() {
			return {
				name: "actions",
				items: oControl.getActions()
			};
		});
	};

	oActionFlex._applyMove = function(oChange, oControl, mPropertyBag, bIsRevert) {
		if (oControl.getParent()){
			if (oControl.getParent().isA("sap.ui.mdc.Chart")) {
				// ActionToolbar of sap.ui.mdc.Chart
				oControl = oControl.getParent();
			} else if (oControl.getParent().getParent().isA("sap.ui.mdc.Table")) {
				// ActionToolbar of sap.ui.mdc.Table
				oControl = oControl.getParent().getParent();
			}
		}
		this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
		if (this._bSupressFlickering) {
			this._delayInvalidate(oControl);
		}

		var oModifier = mPropertyBag.modifier;
		var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
		var oControlAggregationItem;
		var oAggregation;
		var iOldIndex;

		// 1) Fetch existing item
		var pMove = this.determineAggregation(oModifier, oControl)
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
					index: iOldIndex
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