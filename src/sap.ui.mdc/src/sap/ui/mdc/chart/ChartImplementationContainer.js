/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/core/Control",
    "./ChartImplementationContainerRenderer",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/jquery"
],
function (Control, Renderer, Core, jQuery
) {
    "use strict";

    /**
     * Constructor for a new Chart.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new control
     * @class The Chart control creates a chart based on metadata and the configuration specified.
     * @extends sap.ui.core.Control
     * @author SAP SE
     * @version ${version}
     * @constructor
     * @experimental As of version 1.105
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.105
     * @alias sap.ui.mdc.chart.ChartImplementationContainer
     */
    var ChartContainer = Control.extend("sap.ui.mdc.chart.ChartImplementationContainer", /** @lends sap.ui.mdc.chart.ChartImplementationContainer.prototype */ {
        metadata: {
            library: "sap.ui.mdc",
            interfaces: [
            ],
            properties: {
                /**
                 * Toggles the visibility of the noDataContent & content
                 * @private
                 */
                showNoDataStruct: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                }
            },
            aggregations: {
                /**
                 * Chart to be visualized.
                 * @private
                 */
                content: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },

                /**
                 * Cotrol to show when there is no data available inside the chart.
                 * This can be used if the standard behavior of the used chart control needs to be overriden.
                 * To show this noDataContent, set <link>sap.ui.mdc.chart.ChartImplementationContainer#showNoDataStruct</link>
                 * @private
                 */
                noDataContent : {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            associations: {
                /**
                 * Association to noData content set in the MDC Chart.
                 * If set, this will be used instead of the <code>noDataContent</code> aggregation.
                 *
                 * @private
                 */
                chartNoDataContent: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            events: {
            }
        },

        renderer: Renderer
    });

    /**
     * Initialises the ChartContainer.
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
     ChartContainer.prototype.init = function () {
        this._updateVisibilities();
    };

    /**
     * Sets the noDataStructs visibility.
     *
     * @param {boolean} bValue visibility of the noDataStruct
     * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
    */
    ChartContainer.prototype.setShowNoDataStruct = function (bValue) {
        this.setProperty("showNoDataStruct", bValue);

        this._updateVisibilities();

        return this;
    };

    /**
     * Sets a new control to be displayed inside the container.
     * @param {sap.ui.core.Control} oContent new content to display
     * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartContainer.prototype.setContent = function(oContent) {
        this.setAggregation("content", oContent);
        this._updateVisibilities();
        return this;
    };

    /**
     * Sets a new control for <link>sap.ui.mdc.chart.ChartImplementationContainer#noDataContent/link>.
     * @param {sap.ui.core.Control} oContent the content to show when <link>sap.ui.mdc.chart.ChartImplementationContainer#showNoDataStruct</link> is set to <code>true</code>
     * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartContainer.prototype.setNoDataContent = function(oContent) {
        this.setAggregation("noDataContent", oContent);
        this._updateVisibilities();
        return this;
    };

    /**
     * Updates the association to a control which is used instead of <link>sap.ui.mdc.chart.ChartImplementationContainer#noDataContent/link>.
     * This can be used when the noDataContent should still be an aggregation of another control (e.g. the <link>sap.ui.mdc.Chart</link>).
     * @param {*} oContent he content to show when <link>sap.ui.mdc.chart.ChartImplementationContainer#showNoDataStruct</link> is set to <code>true</code>
     * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartContainer.prototype.setChartNoDataContent = function(oContent) {
        this.setAssociation("chartNoDataContent", oContent);
        this._updateVisibilities();
        return this;
    };

    /**
     * Adds/Removes the overlay shown above the inner chart.
     * @param {boolean} bShow <code>true</code> to show overlay, <code>false</code> to hide
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartContainer.prototype.showOverlay = function(bShow) {
        var $this = this.$(), $overlay = $this.find(".sapUiMdcChartOverlay");
        if (bShow && $overlay.length === 0) {
            $overlay = jQuery("<div>").addClass("sapUiOverlay sapUiMdcChartOverlay").css("z-index", "1");
            $this.append($overlay);
        } else if (!bShow) {
            $overlay.remove();
        }
    };

    ChartContainer.prototype._getChartNoDataForRenderer = function() {
        return Core.byId(this.getChartNoDataContent());
    };

    ChartContainer.prototype._updateVisibilities = function() {
        var bVisible = this.getShowNoDataStruct();

        if (this.getContent()) {
            this.getContent().setVisible(!bVisible);
        }

        if (this.getChartNoDataContent()) {

            if (this.getNoDataContent()) {
                this.getNoDataContent().setVisible(false);
            }

            Core.byId(this.getChartNoDataContent()).setVisible(bVisible);
        } else if (this.getNoDataContent()) {
            this.getNoDataContent().setVisible(bVisible);
        }

    };

    return ChartContainer;
});