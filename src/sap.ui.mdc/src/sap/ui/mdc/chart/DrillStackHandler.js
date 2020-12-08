/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/ResponsivePopover",
	"sap/m/List",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/m/StandardListItem",
	"sap/ui/core/InvisibleText",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/mdc/chart/DimensionItem",
	"sap/ui/mdc/chart/ChartSettings"
], function(
	Core,
	ResponsivePopover,
	List,
	Bar,
	SearchField,
	StandardListItem,
	InvisibleText,
	MLibrary,
	Device,
	DimensionItem,
	ChartSettings
) {
	"use strict";

	var Link;

	// shortcut for sap.m.PlacementType
	var PlacementType = MLibrary.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = MLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = MLibrary.ListMode;

	function _getDrillStackDimensions(oChart) {
		var aDrillStack = oChart.getAggregation("_chart").getDrillStack();
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

	//Get all dimensions in a sorted manner
	function _getSortedDimensions(aProperties) {

		var aDimensions = aProperties.filter(function(oItem) {
			return oItem.kind == "Dimension";
		});

		if (aDimensions) {
			aDimensions.sort(function(a, b) {
				if (a.label && b.label) {
					return a.label.localeCompare(b.label);
				}
			});
		}

		return aDimensions;
	}

	/**
	 * Handles all drill-stack operations on a mdc.Chart instance
	 * inlcuding drill-downs, drill-ups and updating of depending controls
	 * like Breadcrumbs.
	 * @constructor
	 */
	var DrillStackHandler = function() {

	};

	/**
	 * Creates a drill down popover
	 * @param oChart
	 * @returns the popover object
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.createDrillDownPopover = function(oChart) {

		var oList = new List({
			mode: ListMode.SingleSelectMaster,
			selectionChange: function(oControlEvent) {
				var oListItem = oControlEvent.getParameter("listItem");

				if (oListItem) {
					//Call flex to capture current state before adding an item to the chart aggregation

					oChart.getEngine().createChanges({
						control: oChart,
						key: "Item",
						state: [{
							name: oListItem.data("dim").name,
							position: oChart.getItems().length
						}]
					});
				}

				oPopover.close();
			}
		});

		var oSubHeader = new Bar();

		//TODO add search field
		//var oSearchField = new SearchField({
		//placeholder: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
		//});
		//oSearchField.attachLiveChange(function(oEvent) {
		//this._triggerSearchInDrillDownPopover(oEvent, oList);
		//}.bind(this));

		var oPopover = new ResponsivePopover({
			contentWidth: "25rem",
			contentHeight: "20rem",
			placement: PlacementType.Bottom,
			subHeader: oSubHeader
		});


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
		oChart._oDrillDownPopover = oPopover;
		return oPopover;
	};

	/**
	 * Shows the drill-down popover on the toolbar button of an mdc.Chart instance
	 * @param {sap.ui.mdc.Chart} oChart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.showDrillDownPopover = function(oChart) {
		var oFetchPropertiesPromise = oChart.getControlDelegate().fetchProperties(oChart);
		return oFetchPropertiesPromise.then(function(aProperties) {
			//Remove all prior items from drill-down list
			var oDrillDownPopover = oChart._oDrillDownPopover;
			var oDrillDownList = oDrillDownPopover.getContent()[1];
			var aIgnoreDimensions, aSortedDimensions, oDimension, oListItem;

			oDrillDownList.destroyItems();

			// Ignore currently applied dimensions from drill-stack for selection
			aIgnoreDimensions = _getDrillStackDimensions(oChart);
			aSortedDimensions = _getSortedDimensions(aProperties);

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

				oListItem.data("dim", oDimension);

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

				oDrillDownPopover.openBy(oChart._oDrillDownBtn);
			});
		});
	};

	/**
	 * Creates and sets breadcrumps on the MDC chart for the current drill level
	 *
	 * @param {sap.ui.mdc.Chart} oChart
	 *
	 * @experimental
	 * @private
	 * @ui5-protected sap.ui.mdc
	 */
	DrillStackHandler.createDrillBreadcrumbs = function(oChart) {

		return new Promise(function(resolve, reject) {

			sap.ui.require([
				"sap/m/Breadcrumbs"
			], function(Breadcrumbs) {
				var oInnerChart = oChart.getAggregation("_chart");

				if (oInnerChart) {
					var oDrillBreadcrumbs = new Breadcrumbs();
					oChart.setAggregation("_breadcrumbs", oDrillBreadcrumbs);

					//initial update of current drill-path
					this._updateDrillBreadcrumbs(oChart, oDrillBreadcrumbs).then(function() {
						resolve(oDrillBreadcrumbs);
					});
				}
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Creates a breadcrump with given settings
	 * @param oChart the chart the breadcrump is for
	 * @param oCrumbSettings settings for the breadcrump
	 *
	 * @returns the created breadcrump
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler.createCrumb = function(oChart, oCrumbSettings) {
		var oInnerChart = oChart.getAggregation("_chart");

		var oCrumb = new Link({
			text: oCrumbSettings.dimensionText,
			press: function onCrumbPressed(oControlEvent) {
				var oDrillBreadcrumbs = oChart.getAggregation("_breadcrumbs"),
					iLinkIndex = oDrillBreadcrumbs.indexOfLink(oControlEvent.getSource());

				// get drill-path which was drilled-up and needs to be removed from mdc chart
				var aCurrentDrillStack = oInnerChart.getDrillStack()[oInnerChart.getDrillStack().length - 1].dimension,
					aDrilledPath = aCurrentDrillStack.slice(iLinkIndex + 1);

				oInnerChart.fireDeselectData();

				// retrieve the actual items and remove them from mdc chart items aggregation
				var aDrilledItems = oChart.getItemsByKeys(aDrilledPath);

				// call flex to capture the current state before removing item(s) of the chart aggregation
				var aFlexItemChanges = aDrilledItems.map(function(oDrillItem) {
					return {
						name: oDrillItem.getKey(),
						visible: false
					};
				});

				oChart.getEngine().createChanges({
					control: oChart,
					key: "Item",
					state: aFlexItemChanges
				});

				// don't forget to update the bread crumbs control itself
				this._updateDrillBreadcrumbs(oChart, oDrillBreadcrumbs);
			}.bind(this)
		});

		// unique dimension key is needed to remove the item from the mdc chart aggregation on drilling up
		oCrumb.data("key", oCrumbSettings.dimensionKey);
		return oCrumb;
	};

	/**
	 * Updates the breadcrumps shown on the MDC Chart
	 *
	 * @param {sap.ui.mdc.Chart} oChart the MDC Chart to update the breadcrumps on
	 * @param {*} oDrillBreadcrumbs the breadcrumps to show
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillStackHandler._updateDrillBreadcrumbs = function(oChart, oDrillBreadcrumbs) {

		return new Promise(function(resolve, reject) {

			sap.ui.require([
				"sap/m/Link"
			], function(LinkClass) {
				Link = LinkClass;

				if (!oDrillBreadcrumbs) {
					return;
				}

				// Get access to drill history
				var oInnerChart = oChart.getAggregation("_chart");

				if (!oInnerChart) {
					return;
				}

				var aVisibleDimensionsRev = oInnerChart.getDrillStack();
				var newLinks = [];

				// When chart is bound to non-aggregated entity there is no drill-stack
				// existing
				if (aVisibleDimensionsRev) {

					// Reverse array to display right order of crumbs
					aVisibleDimensionsRev.reverse();
					aVisibleDimensionsRev.forEach(function(dim, index, array) {

						// Check if stack entry has dimension names and if a
						// dimension is existing for this name
						if (dim.dimension.length > 0 && typeof oInnerChart.getDimensionByName(dim.dimension[dim.dimension.length - 1]) != 'undefined') {
							// show breadcrumbs
							//If Breadcrumps were set invisible for no drill stack, they need to be set visible again
							oDrillBreadcrumbs.setVisible(true);


							// use the last entry of each drill-stack entry to built
							// up the drill-path
							var sDimText = oInnerChart.getDimensionByName(dim.dimension[dim.dimension.length - 1]).getLabel();
							var sDimKey = oInnerChart.getDimensionByName(dim.dimension[dim.dimension.length - 1]).getName();

							// Set current drill position in breadcrumb control
							if (index == 0) {

								oDrillBreadcrumbs.setCurrentLocationText(sDimText);
							} else {

								var oCrumbSettings = {
									dimensionKey: sDimKey,
									dimensionText: sDimText
								};

								var oCrumb = this.createCrumb(oChart, oCrumbSettings);
								newLinks.push(oCrumb);//note the links are added in an incorrect order need to reverse
							}
						} else {

							// Show no text on breadcrumb if stack contains only one
							// entry with no dimension at all (all dims are shown)
							if (index == 0) {
								// hide breadcrumbs
								oDrillBreadcrumbs.setVisible(false);
							}
						}
					}, this);
				}

				var currLinks = oDrillBreadcrumbs.getLinks();
				newLinks.reverse();
				var diff = false;

				if (currLinks.length !== newLinks.length) {
					diff = true;
				} else {

					for (var i = 0; i < newLinks.length; i++) {
						if (newLinks[i].getText() != currLinks[i].getText()) {
							diff = true;
							break;
						}
					}
				}

				if (diff) {

					// Clear aggregation before we rebuild it
					if (oDrillBreadcrumbs.getLinks()) {
						oDrillBreadcrumbs.destroyLinks();
					}

					for (var i = 0; i < newLinks.length; i++) {
						oDrillBreadcrumbs.addLink(newLinks[i]);
					}
				}

				resolve(oDrillBreadcrumbs);
			}.bind(this));
		}.bind(this));
	};

	return DrillStackHandler;
});
