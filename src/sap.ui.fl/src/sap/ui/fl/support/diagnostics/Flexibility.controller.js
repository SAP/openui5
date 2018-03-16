/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/fl/support/Flexibility"
], function (Controller, Filter, FilterOperator, FlexibilityPlugin) {
	"use strict";

	/**
	 * Controller for displaying detail of the flexibility support frame
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.Flexibility
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.52
	 */
	return Controller.extend("sap.ui.fl.support.diagnostics.Flexibility", {
		onInit: function () {
			var oView = this.getView();
			oView.byId("Tree").attachItemPress(this.treeItemPressed);
		},

		states: {
			applied: "applied",
			applicable: "applicable",
			possibleRootCause: "possibleRootCause",
			notApplicable: "notApplicable"
		},

		onAppSelect: function (oEvent) {
			var oSelectedItem = oEvent.getParameters().selectedItem;
			var sSelectedKey = oSelectedItem.getKey();
			this.getView().getViewData().plugin._onAppSelected(sSelectedKey);
		},

		refreshApps: function () {
			this.getView().getViewData().plugin.onRefresh();
		},

		formatTreeIcon: function (sChangeId, mChanges) {

			var sState = this._getChangeState(sChangeId, mChanges);

			switch (sState) {
				case this.states.applied:
					return "sap-icon://message-success";
				case this.states.possibleRootCause:
					return "sap-icon://error";
				case this.states.notApplicable:
					return "sap-icon://alert";
				case this.states.applicable:
					return "sap-icon://question-mark";
				default:
					return "";
			}
		},

		_getChangeState: function (sChangeId, mChanges) {
			var oChange = mChanges[sChangeId];

			if (!oChange) {
				return;
			}

			if (!oChange.isApplicable) {
				return this.states.notApplicable;
			}

			if (oChange.isPossibleRootCause) {
				return this.states.possibleRootCause;
			}

			if (oChange.indexInAppliedChanges != undefined) {
				return this.states.applied;
			}
		},

		formatChangeVisibility: function (oFormattedNode, mChanges, bHideDependingChanges) {
			var sKey = oFormattedNode.id;

			var bVisible = true;

			var bIsControlEntry = !mChanges[sKey];

			if (bHideDependingChanges && !bIsControlEntry) {
				var oChange = mChanges[sKey];
				bVisible = bVisible && (!oChange.isInSubTree || !oFormattedNode.isTopLevelNode);
			}

			return bVisible;
		},

		treeItemPressed: function (oEvent) {
			var oElement = oEvent.getSource();
			var oSelectedItem = oElement.getSelectedItem();
			var sChangeId = oSelectedItem.data("id");
			var mChanges = this.getView().getModel("flexChanges").getData() || {};
			var oChange = {};

			if (mChanges && mChanges.changes) {
				oChange = mChanges.changes[sChangeId];
			}

			this.getView().getModel("flexChangeDetails").setData(oChange);
		}
	});
});