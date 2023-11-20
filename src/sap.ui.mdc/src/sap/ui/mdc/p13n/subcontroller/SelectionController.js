/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController", "sap/base/util/merge"
], function (SelectionController, merge) {
	"use strict";

	const MDCSelectionController = SelectionController.extend("sap.ui.mdc.p13n.subcontroller.SelectionController");

	MDCSelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
		delete oContent.key;
		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	MDCSelectionController.prototype.getCurrentState = function(bExternalize){
		let vState = this.getAdaptationControl().getCurrentState()[this.getStateKey()];

		if (vState instanceof Array && !bExternalize) {
			vState = vState.map(function(o){
				o.key = o.name;
				return o;
			});
		}
		return vState;
	};

	MDCSelectionController.prototype.getDelta = function(mDeltaConfig){
		if (mDeltaConfig.changedState instanceof Array) {
			const aStateMapped = merge([], mDeltaConfig.changedState);
			aStateMapped.map(function(oStateItem){
				oStateItem.key = oStateItem.name;
				return oStateItem;
			});
			mDeltaConfig.changedState = aStateMapped;
		}

		if (mDeltaConfig.existingState instanceof Array) {
			const aExistingStateMapped = merge([], mDeltaConfig.existingState);
			aExistingStateMapped.map(function(oStateItem){
				oStateItem.key = oStateItem.name;
				return oStateItem;
			});
			mDeltaConfig.existingState = aExistingStateMapped;
		}
		mDeltaConfig.deltaAttributes.push("name");
		return SelectionController.prototype.getDelta.apply(this, arguments);
	};

	MDCSelectionController.prototype._createMoveChange = function(sPropertykey, iNewIndex, sMoveOperation, oControl){
		const oMoveChange =  {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sMoveOperation,
				content: {
					name: sPropertykey,
					index: iNewIndex
				}
			}
		};
		return oMoveChange;
	};

	return MDCSelectionController;

});