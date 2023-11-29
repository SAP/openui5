/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/SyncPromise",
	"delegates/odata/v4/vizChart/ChartDelegate"
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
					dataType: "Edm.Int32",
					label: "Sales Number",
					aggregatable: true,
					kind: "Measure"
				}, {
					name: "agSalesAmount",
					path: "SalesAmount",
					dataType: "Edm.String",
					label: "Sales Amount",
					groupable: true,
					kind: "Measure"
				}, {
					name: "Name",
					path: "Name",
					dataType: "Edm.String",
					label: "Name",
					groupable: true,
					kind: "Dimension"
				}, {
					name: "Industry",
					dataType: "Edm.String",
					label: "Industry",
					kind: "Dimension"
				}, {
					name: "Country",
					dataType: "Edm.String",
					label: "Country",
					kind: "Dimension"
				}, {
					name: "SomePropertyName",
					dataType: "Edm.String",
					label: "SomeProperty",
					kind: "Dimension",
					groupable: true
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
