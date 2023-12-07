/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/Control",
		"./ChartImplementationContainerRenderer",
		"sap/ui/core/Element",
		"sap/ui/thirdparty/jquery"
	],
	(Control, Renderer, Element, jQuery) => {
		"use strict";

		/**
		 * Constructor for a new ChartImplementationContainer.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 * @class The <code>ChartImplementationContainer</code> creates a container for the <code>content</code> (chart) and <code>noDataContent</code>. Based on the <code>showNoDataStruct</code> the <code>content</code> or <code>noDataContent</code> will be shown.
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 *
		 * @public
		 * @since 1.105
		 * @alias sap.ui.mdc.chart.ChartImplementationContainer
		 */
		const ChartImplementationContainer = Control.extend("sap.ui.mdc.chart.ChartImplementationContainer", /** @lends sap.ui.mdc.chart.ChartImplementationContainer.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				interfaces: [],
				properties: {
					/**
					 * Toggles the visibility of the noDataContent & content
					 *
					 */
					showNoDataStruct: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					}
				},
				aggregations: {
					/**
					 * Content/Chart to be visualized.
					 *
					 */
					content: {
						type: "sap.ui.core.Control",
						multiple: false
					},

					/**
					 * Control that is shown when there is no data available inside the chart.<br>
					 * This can be used if the standard behavior of the used chart control needs to be overriden.<br>
					 * To show this <code>noDataContent</code>, set {@link #getShowNoDataStruct showNoDataStruct}.
					 *
					 */
					noDataContent: {
						type: "sap.ui.core.Control",
						multiple: false
					}
				},
				associations: {
					/**
					 * Association to <code>noData</code> content set in the chart.<br>
					 * If set, this will be used instead of the <code>noDataContent</code> aggregation.
					 *
					 */
					chartNoDataContent: {
						type: "sap.ui.core.Control",
						multiple: false
					}
				},
				events: {}
			},

			renderer: Renderer
		});

		/**
		 * Initialises the ChartImplementationContainer.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.init = function() {
			this._updateVisibilities();
		};

		/**
		 * Defines the <code>noDataStructs</code> visibility.
		 *
		 * @param {boolean} bValue visibility of the noDataStruct
		 * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.setShowNoDataStruct = function(bValue) {
			this.setProperty("showNoDataStruct", bValue);

			this._updateVisibilities();

			return this;
		};

		/**
		 * Sets a new control to be displayed inside the container.
		 * @param {sap.ui.core.Control} oContent new content to display
		 * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
		 *
		 * @private
		 * @ui5-restricted sap.fe, sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.setContent = function(oContent) {
			this.setAggregation("content", oContent);
			this._updateVisibilities();
			return this;
		};

		/**
		 * Sets a new control for {@link sap.ui.mdc.chart.ChartImplementationContainer#noDataContent noDataContent}.
		 * @param {sap.ui.core.Control} oContent the content to show when {@link sap.ui.mdc.chart.ChartImplementationContainer#showNoDataStruct showNoDataStruct} is set to <code>true</code>
		 * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
		 *
		 * @private
		 * @ui5-restricted sap.fe, sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.setNoDataContent = function(oContent) {
			this.setAggregation("noDataContent", oContent);
			this._updateVisibilities();
			return this;
		};

		/**
		 * Updates the association to a control which is used instead of {@link sap.ui.mdc.chart.ChartImplementationContainer#noDataContent noDataContent}.
		 * This can be used when the noDataContent should still be an aggregation of another control (e.g. the {@link sap.ui.mdc.Chart Chart}).
		 *
		 * @param {sap.ui.core.Control} oContent the content to show when {@link sap.ui.mdc.chart.ChartImplementationContainer#showNoDataStruct showNoDataStruct} is set to <code>true</code>
		 * @returns {sap.ui.mdc.chart.ChartImplementationContainer} reference to <code>this</code> in order to allow method chaining
		 *
		 * @private
		 * @ui5-restricted sap.fe, sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.setChartNoDataContent = function(oContent) {
			this.setAssociation("chartNoDataContent", oContent);
			this._updateVisibilities();
			return this;
		};

		/**
		 * Adds/Removes the overlay shown above the inner chart.
		 * @param {boolean} bShow <code>true</code> to show overlay, <code>false</code> to hide
		 *
		 * @private
		 * @ui5-restricted sap.fe, sap.ui.mdc
		 */
		ChartImplementationContainer.prototype.showOverlay = function(bShow) {
			const $this = this.$();
			let $overlay = $this.find(".sapUiMdcChartOverlay");
			if (bShow && $overlay.length === 0) {
				$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiMdcChartOverlay").css("z-index", "1");
				$this.append($overlay);
			} else if (!bShow) {
				$overlay.remove();
			}
		};

		ChartImplementationContainer.prototype._getChartNoDataForRenderer = function() {
			return Element.getElementById(this.getChartNoDataContent());
		};

		ChartImplementationContainer.prototype._updateVisibilities = function() {
			const bVisible = this.getShowNoDataStruct();

			if (this.getContent()) {
				this.getContent().setVisible(!bVisible);
			}

			if (this.getChartNoDataContent()) {

				if (this.getNoDataContent()) {
					this.getNoDataContent().setVisible(false);
				}

				Element.getElementById(this.getChartNoDataContent()).setVisible(bVisible);
			} else if (this.getNoDataContent()) {
				this.getNoDataContent().setVisible(bVisible);
			}

		};

		return ChartImplementationContainer;
	});