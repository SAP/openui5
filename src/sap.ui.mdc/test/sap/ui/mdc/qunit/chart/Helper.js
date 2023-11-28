/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/SyncPromise",
	"delegates/odata/v4/ChartDelegate"
], function(
	SyncPromise,
	ChartDelegate
) {
	"use strict";

	const ChartDelegateHelper = Object.assign({}, ChartDelegate);

	/**
	 * @override
	 */
	ChartDelegateHelper.retrieveAllMetadata = function() {
		const oMetadata = {
			chartType: "column",
			properties: [
				{
					name: "SalesNumber",
					path: "SalesNumber",
					type: "Edm.Int32",
					required: true,
					label: "Sales Number",
					kind: "Measure"
				}, {
					name: "agSalesAmount",
					path: "SalesAmount",
					type: "string",
					required: true,
					label: "Sales Amount",
					kind: "Measure",
					defaultAggregation: "sum",
					supportedAggregations: ["sum", "min", "max", "average"]
				}, {
					name: "Name",
					path: "Name",
					type: "string",
					required: true,
					label: "Name",
					kind: "Dimension"
				}, {
					name: "Industry",
					type: "string",
					required: true,
					label: "Industry",
					kind: "Dimension"
				}, {
					name: "Country",
					type: "string",
					required: true,
					label: "Country",
					kind: "Dimension"
				}, {
					name: "SomePropertyName",
					type: "string",
					required: true,
					label: "SomeProperty",
					kind: "Dimension"
				}
			]
		};

		return SyncPromise.resolve(oMetadata);
	};

	/**
	 * @override
	 */
	ChartDelegateHelper.fetchProperties = function() {
		return this.retrieveAllMetadata().then(function(oMetadata) {
			return oMetadata.properties;
		});
	};

	/**
	 * may come for preprocessing note here we have currently no control...
	 *
	 * @param {object} oNode The XML node
	 * @param {ICallback} oVisitor the preprocessor callback
	 * @returns {object} The XML node
	 */
	ChartDelegateHelper.preConfiguration = function(oNode, oVisitor) {
		return oNode;
	};

	return ChartDelegateHelper;
});
