/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/m/SelectionDetails",
		"sap/m/SelectionDetailsItem",
		"sap/m/SelectionDetailsItemLine",
		"sap/m/SelectionDetailsRenderer"
	],
	(
		SelectionDetails,
		SelectionDetailsItem,
		SelectionDetailsItemLine,
		SelectionDetailsRenderer
	) => {
		"use strict";

		/**
		 * Constructor for a new ChartSelectionDetails.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 * @class The <code>ChartSelectionDetails</code> control creates a <code>sap.m.SelectionDetails</code> popover based on metadata and the configuration specified.
		 * @extends sap.m.SelectionDetails
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @public
		 * @experimental As of version 1.88
		 * @since 1.88
		 * @alias sap.ui.mdc.chart.ChartSelectionDetails
		 */
		const ChartSelectionDetails = SelectionDetails.extend("sap.ui.mdc.chart.ChartSelectionDetails", /** @lends sap.ui.mdc.chart.ChartSelectionDetails.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				interfaces: [

				],
				defaultAggregation: "",
				properties: {

				},
				aggregations: {

				},
				associations: {

				},
				events: {

				}
			},
			renderer: SelectionDetailsRenderer
		});

		/**
		 * Initialises the MDC Chart Selection Details
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ChartSelectionDetails.prototype.init = function() {
			SelectionDetails.prototype.init.apply(this, arguments);
			this._registerTemplate();
			this._attachEvents();
		};

		ChartSelectionDetails.prototype._registerTemplate = function() {
			this.registerSelectionDetailsItemFactory([
				//TODO: Template might need to be handed in via delegate to support other libraries and non-odata services
			], (aDisplayData, aData, oContext, oData) => {
				const aLines = [];

				for (let i = 0; i < aDisplayData.length; i++) {
					aLines.push(new SelectionDetailsItemLine({
						label: aDisplayData[i].label,
						value: this._formatValue(aDisplayData[i].value),
						unit: aDisplayData[i].unit
					}));
				}
				return new SelectionDetailsItem({
					enableNav: this._hasNavigationTargets(aData),
					lines: aLines
				}).setBindingContext(oContext);
			});
		};

		ChartSelectionDetails.prototype._formatValue = function(oValue) {
			if (oValue) {
				return oValue instanceof Object ? oValue : oValue.toString();
			} else {
				return oValue;
			}
		};
		//TODO: Navigation targets might be specific to oData and might need a handling via delegate?
		ChartSelectionDetails.prototype._hasNavigationTargets = function(aData) {
			return false;
		};
		//TODO: Consider implementation and handling within ChartToolbar like the update of actions as well
		ChartSelectionDetails.prototype._attachEvents = function() {
			// Attach to navigation event of selectionDetails
			// for semantic object navigation
			/*
			 this.attachNavigate(function(oEvent) {
			     // Destroy content on navBack of selectionDetails
			     // This either is the semanticNavContainer or the semanticNavItemList
			     if (oEvent.getParameter("direction") === "back") {
			         oEvent.getParameter("content").destroy();
			     } else {
			         // Forward navigation to semantic objects
			         oChart._navigateToSemanticObjectDetails(oEvent);
			     }

			 });*/

			this.attachActionPress(function(oEvent) {
				const oChart = this.getParent().getParent();
				// extract binding information of each item
				const aItemContexts = [];
				oEvent.getParameter("items").forEach((oItem) => {
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
		};

		return ChartSelectionDetails;
	});