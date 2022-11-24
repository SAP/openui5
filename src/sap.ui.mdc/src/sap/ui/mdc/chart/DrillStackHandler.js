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
	"sap/m/IllustratedMessage"
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
	IllustratedMessage
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = MLibrary.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = MLibrary.ListType;

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
	 * @returns the popover object
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.createDrillDownPopover = function(oMDCChart) {

		//var oSubHeader = new Bar();
		var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		var oPopover = new ResponsivePopover({
			id: oMDCChart.getId() + "-drilldownPopover",
			contentWidth: "25rem",
			contentHeight: "20rem",
			placement: PlacementType.Bottom
			//subHeader: oSubHeader
		});
		var oList = new List({
			noData: new IllustratedMessage({enableVerticalResponsiveness: true, title: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION"), description: MDCRb.getText("chart.NO_DRILLABLE_DIMENSION_DESC"), illustrationType: MLibrary.IllustratedMessageType.NoDimensionsSet}),
			mode: ListMode.SingleSelectMaster,
			selectionChange: function(oControlEvent) {
				var oListItem = oControlEvent.getParameter("listItem");

				if (oListItem) {
					//Call flex to capture current state before adding an item to the chart aggregation

					oMDCChart.getEngine().createChanges({
						control: oMDCChart,
						key: "Item",
						state: [{
							name: oListItem.data("dim").dim.name,
							position: oMDCChart.getItems().length
						}]
					});
				}

				oPopover.close();
			}
		});

		oPopover.attachAfterClose(function(){
			oPopover.destroy();
		});

		//TODO add search field
		//var oSearchField = new SearchField({
		//placeholder: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
		//});
		//oSearchField.attachLiveChange(function(oEvent) {
		//this._triggerSearchInDrillDownPopover(oEvent, oList);
		//}.bind(this));


		var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

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
	 * @param {sap.ui.mdc.Chart} oMDCChart
     * @param {sap.m.Button} oDrillBtn
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.showDrillDownPopover = function(oMDCChart, oDrillBtn) {
        //TODO: Rename "Measure" and "Dimensions"?
		var pSortedDimensionsPromise = oMDCChart.getControlDelegate().getSortedDimensions(oMDCChart);
		return pSortedDimensionsPromise.then(function(aSortedDimensions) {
			//Remove all prior items from drill-down list
			var oDrillDownPopover = oMDCChart._oDrillDownPopover;
			var aIgnoreDimensions, oDimension, oListItem;

			var aFilteredList = oDrillDownPopover.getContent().filter(function(oEntry){return oEntry.getMetadata().getClass() == List;});
			var oDrillDownList = aFilteredList.length > 0 ? aFilteredList[0] : null;

			if (!oDrillDownList){
				Log.error("MDC Chart: Could not determine list to show drilldown. This should not happen. Did the application modify the drill-down popover?");
				return;
			}

			oDrillDownList.destroyItems();

			// Ignore currently applied dimensions from drill-stack for selection
			aIgnoreDimensions = _getDrillStackDimensions(oMDCChart);

			for (var i = 0; i < aSortedDimensions.length; i++) {
				oDimension = aSortedDimensions[i];

				if (aIgnoreDimensions.indexOf(oDimension.name) > -1) {
					continue;
				}

				//TODO: Check if still valid
				// If dimension is not filterable and datapoints are selected then skip
				/*if (!oViewField.filterable && this._oChart.getSelectedDataPoints().count > 0) {
					    continue;
				}*/

				oListItem = new StandardListItem({
					title: oDimension.label,
					type: ListType.Active
				});

				oListItem.data("dim", {dim: oDimension});

				/*sTooltip = this._getFieldTooltip(oDimension.name);
				if (sTooltip) {
					  oListItem.setTooltip(sTooltip);
				}*/

				//Add item to list within popover
				oDrillDownList.addItem(oListItem);
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
