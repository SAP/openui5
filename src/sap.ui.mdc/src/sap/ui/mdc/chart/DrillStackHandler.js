/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/ResponsivePopover",
	"sap/m/List",
	"sap/m/Bar",
	"sap/m/StandardListItem",
	"sap/ui/core/InvisibleText",
	"sap/m/library",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/m/IllustratedMessage",
	"sap/m/SearchField",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(
	Core,
	ResponsivePopover,
	List,
	Bar,
	StandardListItem,
	InvisibleText,
	MLibrary,
	Device,
	Log,
	IllustratedMessage,
	SearchField,
	JSONModel,
	Filter
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = MLibrary.PlacementType;

	// shortcut for sap.m.ListMode
	var ListMode = MLibrary.ListMode;

	function _getDrillStackDimensions(oMDCChart) {
		var aDrillStack = oMDCChart.getControlDelegate().getDrillStack(oMDCChart);
		var aStackDimensions = [];

		aDrillStack.forEach(function(oStackEntry) {
			// loop over nested dimension arrays
			oStackEntry.dimension.forEach(function(sDimension) {
				if (sDimension != null && sDimension != "" && aStackDimensions.indexOf(sDimension) == -1) {
					aStackDimensions.push(sDimension);
				}
			});
		});

		return aStackDimensions;
	}

	/**
	 * Handles all drill-stack operations on a mdc.Chart instance
	 * including drill-downs, drill-ups and updating of depending controls
	 * @constructor
	 */
	var DrillStackHandler = function() {
        //TODO: Refactor to DrillDownPopover (extending Popover; like Toolbar)
	};

	/**
	 * Creates a drill down popover
	 * @param oMDCChart
	 * @returns {sap.ui.ResponsivePopover} the popover object
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.createDrillDownPopover = function(oMDCChart) {
		var oList;
		var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

		var oSearchField = new SearchField({
			placeholder: oRb.getText("chart.CHART_DRILLDOWN_SEARCH"),
			liveChange: function(oEvent) {

				if (!oList) {
					return;
				}

				var sSearchValue = oEvent.getParameter("newValue");
				var oSearchFilter = [];
				if (sSearchValue) {
					oSearchFilter = new Filter("text", "Contains", sSearchValue);
				}
				oList.getBinding("items").filter(oSearchFilter);
			}
		});

		var oPopover = new ResponsivePopover({
			id: oMDCChart.getId() + "-drilldownPopover",
			contentWidth: "25rem",
			contentHeight: "20rem",
			placement: PlacementType.VerticalPreferredBottom,
			subHeader: oSearchField,
			afterClose: function(){
				oPopover.destroy();
			}
		});

		var oItemTemplate = new StandardListItem({
			title: "{$ChartDrilldown>text}"
		});

		oList = new List({
			noData: new IllustratedMessage({enableVerticalResponsiveness: true, title: oRb.getText("chart.NO_DRILLABLE_DIMENSION"), description: oRb.getText("chart.NO_DRILLABLE_DIMENSION_DESC"), illustrationType: MLibrary.IllustratedMessageType.NoDimensionsSet}),
			mode: ListMode.SingleSelectMaster,
			items: {
				path: "$ChartDrilldown>/items",
				template: oItemTemplate
			},
			selectionChange: function(oControlEvent) {
				var oListItem = oControlEvent.getParameter("listItem");

				if (oListItem) {
					var oContext = oListItem.getBindingContext("$ChartDrilldown");
					var sDimensionName = oContext.getObject().id;

					//Call flex to capture current state before adding an item to the chart aggregation
					oMDCChart.getEngine().createChanges({
						control: oMDCChart,
						key: "Item",
						state: [{
							name: sDimensionName,
							position: oMDCChart.getItems().length
						}]
					});
				}

				oPopover.close();
			}
		});

		//Show header only in mobile scenarios
		//still support screen reader while on desktops.
		if (Device.system.desktop) {
			var oInvText = new InvisibleText({
				text: oRb.getText("chart.CHART_DRILLDOWN_TITLE")
			});
			oPopover.setShowHeader(false);
			oPopover.addContent(oInvText);
			oPopover.addAriaLabelledBy(oInvText);
		} else {
			oPopover.setTitle(oRb.getText("chart.CHART_DRILLDOWN_TITLE"));
		}

		oPopover.addContent(oList);
		oMDCChart._oDrillDownPopover = oPopover;
		return oPopover;
	};

	/**
	 * Shows the drill-down popover on the toolbar button of an mdc.Chart instance
	 * @param {sap.ui.mdc.Chart} oMDCChart chart instance
     * @param {sap.m.Button} oDrillBtn button which opens the popover
	 * @returns {Promise} promise
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.showDrillDownPopover = function(oMDCChart, oDrillBtn) {
        //TODO: Rename "Measure" and "Dimensions"?
		var pSortedDimensionsPromise = oMDCChart.getControlDelegate().getSortedDimensions(oMDCChart);
		return pSortedDimensionsPromise.then(function(aSortedDimensions) {
			var oDrillDownPopover = oMDCChart._oDrillDownPopover;
			var aIgnoreDimensions;

			// Ignore currently applied dimensions from drill-stack for selection
			aIgnoreDimensions = _getDrillStackDimensions(oMDCChart);
			aSortedDimensions = aSortedDimensions.filter(function(oDimension){ return aIgnoreDimensions.indexOf(oDimension.name) < 0; });

			var oData = { items : [] };
			aSortedDimensions.forEach(function(oDimension) {
				oData.items.push({ text: oDimension.label, id: oDimension.name });
			});
			oDrillDownPopover.setModel(new JSONModel(oData), "$ChartDrilldown");

			if (oData.items.length < 7) {
				oDrillDownPopover.getSubHeader().setVisible(false);
			}

			return new Promise(function(resolve, reject) {
				oDrillDownPopover.attachEventOnce("afterOpen", function onAfterDrillDownPopoverOpen(oControlEvent) {
					resolve(oDrillDownPopover);
				});

				oDrillDownPopover.openBy(oDrillBtn);
			});
		});
	};

	return DrillStackHandler;
});
