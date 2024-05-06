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

			this.registerSelectionDetailsItemFactory({
				//TODO: Template might need to be handed in via delegate to support other libraries and non-odata services
			}, (aDisplayData, mData, oContext) => {
				const aLines = [];
				const fnFormatValue = function(oValue) {
					if (oValue) {
						return oValue instanceof Object ? oValue : oValue.toString();
					} else {
						return oValue;
					}
				};

				for (let i = 0; i < aDisplayData.length; i++) {
					//const v = mData[aDisplayData[i].id + ".d"];

					aLines.push(new SelectionDetailsItemLine({
						label: aDisplayData[i].label,
						// value: this._formatValue(v || aDisplayData[i].value),
						value: fnFormatValue(aDisplayData[i].value),
						unit: aDisplayData[i].unit
					}));
				}
				return new SelectionDetailsItem({
					enableNav: this._hasNavigationTargets(mData),
					lines: aLines
				}).setBindingContext(oContext);
			});
		};


		//TODO: Navigation targets might be specific to oData and might need a handling via delegate?
		ChartSelectionDetails.prototype._hasNavigationTargets = function(mData) {
			return false;
		};

		return ChartSelectionDetails;
	});