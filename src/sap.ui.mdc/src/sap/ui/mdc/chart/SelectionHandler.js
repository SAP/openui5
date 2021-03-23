/*
 * ! ${copyright}
 */
sap.ui.define(["sap/m/SelectionDetails", "sap/m/SelectionDetailsItem", "sap/m/SelectionDetailsItemLine", "./SelectionDetailsActions"], function(SelectionDetails, SelectionDetailsItem, SelectionDetailsItemLine, SelectionDetailsActions) {
	"use strict";

	var SelectionHandler = function() {

	};

	SelectionHandler.prepareChart = function(oChart) {
		//guarantee that there are selection details
		if (!oChart.getSelectionDetailsActions()) {
			oChart.setSelectionDetailsActions(new SelectionDetailsActions());
		}

		var oSelectionDetails = new SelectionDetails(oChart.getId() + "-selectionDetails", {
		});

		oSelectionDetails.registerSelectionDetailsItemFactory([

		], function(aDisplayData, aData, oContext, oData) {
			var aLines = [];

			for (var i = 0; i < aDisplayData.length; i++) {
				aLines.push(new SelectionDetailsItemLine({
					label: aDisplayData[i].label,
					value: SelectionHandler.formatValue(aDisplayData[i].value),
					unit: aDisplayData[i].unit
				}));
			}
			return new SelectionDetailsItem({
				enableNav: SelectionHandler.hasNavigationTargets(oChart, aData),
				lines: aLines
			}).setBindingContext(oContext);
		});

		// Attach to navigation event of selectionDetails
		// for semantic object navigation
		oSelectionDetails.attachNavigate(function(oEvent) {
			// Destroy content on navBack of selectionDetails
			// This either is the semanticNavContainer or the semanticNavItemList
			if (oEvent.getParameter("direction") === "back") {
				oEvent.getParameter("content").destroy();
			} else {
				// Forward navigation to semantic objects
				oChart._navigateToSemanticObjectDetails(oEvent);
			}

		});

		oSelectionDetails.attachActionPress(function(oEvent) {
			// extract binding information of each item
			var aItemContexts = [];
			oEvent.getParameter("items").forEach(function(oItem) {
				aItemContexts.push(oItem.getBindingContext());
			});
			// Re-arrange event object and navigate to outer press handler
			oChart.fireSelectionDetailsActionPressed({
				id: oEvent.getParameter("id"),
				action: oEvent.getParameter("action"),
				itemContexts: aItemContexts,
				level: oEvent.getParameter("level")
			});
		});

		// Update of selectionDetails action aggregations
		oSelectionDetails.attachBeforeOpen(function(oEvent) {
			var oSelectionDetailsActions = oChart.getSelectionDetailsActions(), oClone;
			// Update item actions
			var aSelectionItems = oSelectionDetails.getItems();

			aSelectionItems.forEach(function(oItem) {
				var aItemActions = oSelectionDetailsActions.getDetailsItemActions();
				aItemActions.forEach(function(oAction) {
					oClone = oAction.clone();
					oItem.addAction(oClone);
				});
			});

			// Update list actions
			var aDetailsActions = oSelectionDetailsActions.getDetailsActions();
			oSelectionDetails.removeAllActions();
			aDetailsActions.forEach(function(oAction) {
				oClone = oAction.clone();
				oSelectionDetails.addAction(oClone);
			});

			// Update group actions
			var aActionGroups = oSelectionDetailsActions.getActionGroups();
			oSelectionDetails.removeAllActionGroups();
			aActionGroups.forEach(function(oActionGroup) {
				oClone = oActionGroup.clone();
				oSelectionDetails.addActionGroup(oClone);
			});

		});

		oSelectionDetails.attachSelectionHandler("_selectionDetails", oChart.getAggregation("_chart"));

		oSelectionDetails.attachBeforeClose(function(oEvent) {
			// Needs to be destroyed to re-navigate later.
			//TBI
		});

		// Add to MDC charts toolbar
		var oToolbar = oChart.getAggregation("_toolbar");
		oToolbar.insertEnd(oSelectionDetails,0);
	};

	SelectionHandler.formatValue = function(oValue) {
		if (oValue) {
			return oValue instanceof Object ? oValue : oValue.toString();
		} else {
			return oValue;
		}
	};

	SelectionHandler.hasNavigationTargets = function(oChart, aData) {
		return false;
	};

	return SelectionHandler;

}, /* bExport= */true);
