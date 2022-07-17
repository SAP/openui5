/*!
 * ${copyright}
 */
sap.ui.define([
	"./CustomListSelection",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SelectionUtils",
	"sap/ui/support/supportRules/Constants"
], function(CustomListSelection, Storage, SelectionUtils, Constants) {
	"use strict";

	var Selection = CustomListSelection.extend("sap.ui.support.supportRules.ui.models.CustomJSONListSelection", {

		constructor: function(oControl, bDependent, sKey) {
			CustomListSelection.call(this, oControl, sKey);
			this._dependent = bDependent;
		},

		_updateModelAfterSelectionChange: function(oEvent) {
			var oBinding = this._getBinding();
			var oModel = oBinding.getModel();
			var aChangedIndices = oEvent.getParameter("rowIndices") || [];
			var oSelectionModel = this._getSelectionModel();

			var that = this;

			function setSelection(sPath, bSelected, bSkipUpdateParent) {
				var aNodes = oModel.getProperty(sPath + "/nodes");

				if (that._isTree() && that._dependent) {
					if (aNodes && aNodes.length) {
						for (var j = 0; j < aNodes.length; j++) {
							setSelection(sPath + "/nodes/" + j + "", bSelected, true);
							//Update Model of tree table
							that.updateModelAfterChangedSelection(oModel, sPath, bSelected);
						}
					} else { // leaf
						if (!bSelected && !bSkipUpdateParent) {
							var aPath = sPath.split("/");
							aPath.pop();
							aPath.pop();
							var sParentPath = aPath.join("/");
							that._setSelectionForContext(oModel, oModel.createBindingContext(sParentPath), bSelected);
							// TBD recursion + select parent when all children are selected
						}
					}
				}
				//Update Model of tree table
				that.updateModelAfterChangedSelection(oModel, sPath, bSelected);

				that._setSelectionForContext(oModel, oModel.createBindingContext(sPath), bSelected);

			}

			for (var i = 0; i < aChangedIndices.length; i++) {
				var oContext = this._getContextByIndex(aChangedIndices[i]);

				if (oContext) {
					setSelection(oContext.getPath(), oSelectionModel.isSelectedIndex(aChangedIndices[i]));
				}

			}

			this.syncParentNodeSelectionWithChildren(oBinding.getModel("ruleSets"));
			this._finalizeSelectionUpdate();

			SelectionUtils.getSelectedRules();
			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				SelectionUtils.persistSelection();

				var aTmpRules = Storage.getRules();
				SelectionUtils.getRulesSelectionState().forEach(function (oRule) {
					if (oRule.libName === "temporary"){
						aTmpRules.forEach(function (oTmpRule) {
							if (oRule.ruleId === oTmpRule.id) {
								oTmpRule.selected = oRule.selected;
							}
						});
					}
				});

				Storage.setRules(aTmpRules);

			}
		}

	});


	return Selection;

});