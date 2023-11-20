/*
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/EventProvider'],
	function(EventProvider) {
	"use strict";



	/**
	 * Abstract serializer delegate class. All delegates must extend from this class and implement the abstract methods.
	 *
	 * @abstract
	 * @class Abstract serializer delegate class.
	 * @extends sap.ui.base.EventProvider
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.util.serializer.delegate.Delegate
	 * @private
	 * @ui5-restricted sap.watt, com.sap.webide
	 */
	var Delegate = EventProvider.extend("sap.ui.core.util.serializer.delegate.Delegate", /** @lends sap.ui.core.util.serializer.delegate.Delegate.prototype */
	{
		constructor : function () {
			EventProvider.apply(this);
		}
	});


	/**
	 * Delegate method "start".
	 *
	 * @abstract
	 * @param {sap.ui.core.Control} oControl The current control to process.
	 * @param {string} sAggregationName The current aggregation name.
	 * @param {boolean} isDefaultAggregation Whether the aggregation is the default aggregation.
	 * @return {string} the created string.
	 */
	Delegate.prototype.start = function (oControl, sAggregationName, isDefaultAggregation) {
		return "";
	};


	/**
	 * Delegate method "middle".
	 *
	 * @abstract
	 * @param {sap.ui.core.Control} oControl The current control to process.
	 * @param {string} sAggregationName The current aggregation name.
	 * @param {boolean} isDefaultAggregation Whether the aggregation is the default aggregation.
	 * @return {string} the created string.
	 */
	Delegate.prototype.middle = function (oControl, sAggregationName, isDefaultAggregation) {
		return "";
	};


	/**
	 * Delegate method "end".
	 *
	 * @abstract
	 * @param {sap.ui.core.Control} oControl The current control to process.
	 * @param {string} sAggregationName The current aggregation name.
	 * @param {boolean} isDefaultAggregation Whether the aggregation is the default aggregation.
	 * @return {string} the created string.
	 */
	Delegate.prototype.end = function (oControl, sAggregationName, isDefaultAggregation) {
		return "";
	};


	/**
	 * Delegate method "startAggregation".
	 *
	 * @abstract
	 * @param {sap.ui.core.Control} oControl The current control to process.
	 * @param {string} sAggregationName The current aggregation name.
	 * @return {string} the created string.
	 */
	Delegate.prototype.startAggregation = function (oControl, sAggregationName) {
		return "";
	};


	/**
	 * Delegate method "endAggregation".
	 *
	 * @abstract
	 * @param {sap.ui.core.Control} oControl The current control to process.
	 * @param {string} sAggregationName The current aggregation name.
	 * @return {string} the created string.
	 */
	Delegate.prototype.endAggregation = function (oControl, sAggregationName) {
		return "";
	};

	return Delegate;

});
