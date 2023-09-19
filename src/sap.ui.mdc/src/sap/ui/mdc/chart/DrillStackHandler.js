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
	const PlacementType = MLibrary.PlacementType;

	// shortcut for sap.m.ListMode
	const ListMode = MLibrary.ListMode;

	function _getDrillStackDimensions(oChart) {
		const aDrillStack = oChart.getControlDelegate().getDrillStack(oChart);
		const aStackDimensions = [];

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
	const DrillStackHandler = function() {
        //TODO: Refactor to DrillDownPopover (extending Popover; like Toolbar)
	};

	/**
	 * Creates a drill down popover
	 * @param oChart
	 * @returns {sap.ui.ResponsivePopover} the popover object
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.createDrillDownPopover = function(oChart) {
		let oList = null;
		const oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

		const oSearchField = new SearchField({
			placeholder: oRb.getText("chart.CHART_DRILLDOWN_SEARCH"),
			liveChange: function(oEvent) {

				if (!oList) {
					return;
				}

				const sSearchValue = oEvent.getParameter("newValue");
				let oSearchFilter = [];
				if (sSearchValue) {
					oSearchFilter = new Filter("text", "Contains", sSearchValue);
				}
				oList.getBinding("items").filter(oSearchFilter);
			}
		});

		const oPopover = new ResponsivePopover({
			id: oChart.getId() + "-drilldownPopover",
			contentWidth: "25rem",
			contentHeight: "20rem",
			placement: PlacementType.VerticalPreferredBottom,
			afterClose: function(){
				oPopover.destroy();
			}
		});

		// The ResponsivePopover only supports controls with sap.m.IBar interface, which is not the case when we place a SearchField as subHeader.
		// On a Desktop we do not have any problem (the ResponsivePopoverRender is used in this case).
		// On a Phone the Dialog renderer is used and the subHeader will not work. So we add the search field in this case into the content.
		if (!Device.system.phone) {
			oPopover.setSubHeader(oSearchField);
		} else {
			oPopover.addContent(oSearchField);
		}

		const oItemTemplate = new StandardListItem({
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
				const oListItem = oControlEvent.getParameter("listItem");

				if (oListItem) {
					const oContext = oListItem.getBindingContext("$ChartDrilldown");
					const sDimensionName = oContext.getObject().id;

					//Call flex to capture current state before adding an item to the chart aggregation
					oChart.getEngine().createChanges({
						control: oChart,
						key: "Item",
						state: [{
							name: sDimensionName,
							position: oChart.getItems().length
						}]
					});
				}

				oPopover.close();
			}
		});

		//Show header only in mobile scenarios
		//still support screen reader while on desktops.
		if (Device.system.desktop) {
			const oInvText = new InvisibleText({
				text: oRb.getText("chart.CHART_DRILLDOWN_TITLE")
			});
			oPopover.setShowHeader(false);
			oPopover.addContent(oInvText);
			oPopover.addAriaLabelledBy(oInvText);
		} else {
			oPopover.setTitle(oRb.getText("chart.CHART_DRILLDOWN_TITLE"));
		}

		oPopover.addContent(oList);
		oChart._oDrillDownPopover = oPopover;
		return oPopover;
	};

	/**
	 * Shows the drill-down popover on the toolbar button of an mdc.Chart instance
	 * @param {sap.ui.mdc.Chart} oChart chart instance
     * @param {sap.m.Button} oDrillBtn button which opens the popover
	 * @returns {Promise} promise
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.showDrillDownPopover = function(oChart, oDrillBtn) {
        //TODO: Rename "Measure" and "Dimensions"?
		const pSortedDimensionsPromise = oChart.getControlDelegate().getSortedDimensions(oChart);
		return pSortedDimensionsPromise.then(function(aSortedDimensions) {
			const oDrillDownPopover = oChart._oDrillDownPopover;

			// Ignore currently applied dimensions from drill-stack for selection
			const aIgnoreDimensions = _getDrillStackDimensions(oChart);
			aSortedDimensions = aSortedDimensions.filter(function(oDimension){ return aIgnoreDimensions.indexOf(oDimension.name) < 0; });

			const oData = { items : [] };
			aSortedDimensions.forEach(function(oDimension) {
				oData.items.push({ text: oDimension.label, id: oDimension.name });
			});
			oDrillDownPopover.setModel(new JSONModel(oData), "$ChartDrilldown");

			if (oData.items.length < 7) {
				const oSearchField = oDrillDownPopover.getSubHeader() || oDrillDownPopover.getContent()[0];
				oSearchField.setVisible(false);
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
