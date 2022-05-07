/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/m/Breadcrumbs",
    "sap/m/Link"
], function (
    Breadcrumbs,
    Link
) {
    "use strict";
    /**
     * Delegate class for sap.ui.mdc.Chart and ODataV4.
     * Enables additional analytical capabilities.
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized.
     *
     * @author SAP SE
     * @private
     * @since 1.88
     * @alias sap.ui.mdc.chart.DrillBreadcrumbs
     */
    var DrillBreadcrumbs = Breadcrumbs.extend("sap.ui.mdc.chart.DrillBreadcrumbs", {
        renderer: {
            apiVersion: 2
        }
    });

    DrillBreadcrumbs.prototype.init = function(){
        Breadcrumbs.prototype.init.apply(this, arguments);

        this.addStyleClass("sapUiMDCChartBreadcrumbs");
    };


    /**
	 * Updates the breadcrumbs shown on the MDC Chart
	 *
	 * @param {sap.ui.mdc.Chart} oMDCChart the MDC Chart to update the breadcrumbs on
	 * @param {*} oDrillableItems the drillable items
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillBreadcrumbs.prototype.updateDrillBreadcrumbs = function(oMDCChart, oDrillableItems) {

        var newLinks = [];

        // When chart is bound to non-aggregated entity there is no drill-stack
        // existing
        if (oDrillableItems) {

            // Reverse array to display right order of crumbs
            oDrillableItems.reverse();

            if (oDrillableItems.length > 0){
                oDrillableItems.forEach(function(dim, index, array) {

                    // show breadcrumbs
                    //If Breadcrumbs were set invisible for no drill stack, they need to be set visible again
                    this.setVisible(true);

                    // use the last entry of each drill-stack entry to built
                    // up the drill-path
                    var sDimText = dim.getLabel();
                    var sDimKey = dim.getName();

                    // Set current drill position in breadcrumb control
                    if (index == 0) {
                        this.setCurrentLocationText(sDimText);
                    } else {

                        var oCrumbSettings = {
                            dimensionKey: sDimKey,
                            dimensionText: sDimText
                        };

                        var oCrumb = this._createCrumb(oMDCChart, oCrumbSettings);
                        newLinks.push(oCrumb);//note the links are added in an incorrect order need to reverse
                    }

                }, this);
            } else {
                // Show no text on breadcrumb if stack contains only one
                // entry with no dimension at all (all dims are shown)

                // hide breadcrumbs
                this.setVisible(false);

            }

        }

        var currLinks = this.getLinks();
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
            if (this.getLinks()) {
                this.destroyLinks();
            }

            for (var i = 0; i < newLinks.length; i++) {
                this.addLink(newLinks[i]);
            }
        }

        return this;

	};

    /**
	 * Creates a breadcrumb with given settings
	 * @param oMDCChart the chart the breadcrumb is for
	 * @param oCrumbSettings settings for the breadcrumb
	 *
	 * @returns {sap.m.Link} the created breadcrumb
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DrillBreadcrumbs.prototype._createCrumb = function(oMDCChart, oCrumbSettings) {

		var oCrumb = new Link({
			text: oCrumbSettings.dimensionText,
			press: function onCrumbPressed(oControlEvent) {
                var iLinkIndex = this.indexOfLink(oControlEvent.getSource());

				// get drill-path which was drilled-up and needs to be removed from mdc chart
				var aCurrentDrillStack = oMDCChart.getControlDelegate().getDrillableItems(oMDCChart),
					aDrilledItems = aCurrentDrillStack.slice(iLinkIndex + 1);

                //TODO: Why do we need this?
                //this._oInnerChart.fireDeselectData();

                var aFlexItemChanges = aDrilledItems.map(function(oDrillItem) {
					return {
						name: oDrillItem.getName(),
						visible: false
					};
				});

				oMDCChart.getEngine().createChanges({
					control: oMDCChart,
					key: "Item",
					state: aFlexItemChanges
				});

			}.bind(this)
		});

		// unique dimension key is needed to remove the item from the mdc chart aggregation on drilling up
		oCrumb.data("key", oCrumbSettings.dimensionKey);
		return oCrumb;
	};

    return DrillBreadcrumbs;
});