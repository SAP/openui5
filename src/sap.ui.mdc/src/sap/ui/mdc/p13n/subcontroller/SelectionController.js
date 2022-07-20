/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController", "sap/base/util/merge"
], function (SelectionController, merge) {
	"use strict";

	var MDCSelectionController = SelectionController.extend("sap.ui.mdc.p13n.subcontroller.SelectionController");

	MDCSelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
		delete oContent.key;
		var oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	MDCSelectionController.prototype.getCurrentState = function(bExternalize){
		var vState = this.getAdaptationControl().getCurrentState()[this.getStateKey()];

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
			var aStateMapped = merge([], mDeltaConfig.changedState);
			aStateMapped.map(function(oStateItem){
				oStateItem.key = oStateItem.name;
				return oStateItem;
			});
			mDeltaConfig.changedState = aStateMapped;
		}

		if (mDeltaConfig.existingState instanceof Array) {
			var aExistingStateMapped = merge([], mDeltaConfig.existingState);
			aExistingStateMapped.map(function(oStateItem){
				oStateItem.key = oStateItem.name;
				return oStateItem;
			});
			mDeltaConfig.existingState = aExistingStateMapped;
		}
		mDeltaConfig.deltaAttributes.push("name");
		return SelectionController.prototype.getDelta.apply(this, arguments);
	};

	MDCSelectionController.prototype._createMoveChange = function(sId, sPropertykey, iNewIndex, sMoveOperation, oControl, bPersistId){
		var oMoveChange =  {
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