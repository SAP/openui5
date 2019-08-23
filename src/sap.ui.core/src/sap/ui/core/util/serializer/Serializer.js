/*
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/EventProvider', "sap/base/assert"],
	function(EventProvider, assert) {
	"use strict";


	/**
	 * Serializer class. Iterates over all controls and call a given serializer delegate.
	 *
	 * @param {sap.ui.core.Control|sap.ui.core.UIArea} oRootControl the root control to serialize
	 * @param {object} serializeDelegate the serializer delegate. Has to implement start/middle/end methods.
	 * @param {boolean} bSkipRoot whether to skip the root node or not
	 * @param {function} fnSkipAggregations whether to skip aggregations
	 * @param {function} fnSkipElement whether to skip an element
	 *
	 * @class Serializer class.
	 * @extends sap.ui.base.EventProvider
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.util.serializer.Serializer
	 * @private
	 * @ui5-restricted sap.watt com.sap.webide
	 */
	var Serializer = EventProvider.extend("sap.ui.core.util.serializer.Serializer", /** @lends sap.ui.core.util.serializer.Serializer.prototype */
	{
		constructor : function (oRootControl, serializeDelegate, bSkipRoot, oWindow, fnSkipAggregations, fnSkipElement) {
			EventProvider.apply(this);
			this._oRootControl = oRootControl;
			this._delegate = serializeDelegate;
			this._bSkipRoot = !!bSkipRoot;
			this._oWindow = oWindow || window;
			this._fnSkipAggregations = fnSkipAggregations;
			this._fnSkipElement = fnSkipElement;
		}
	});

	/**
	 * Serializes the complete control tree.
	 *
	 * @return {string} the serialized control tree.
	 */
	Serializer.prototype.serialize = function () {
		return this._serializeRecursive(this._oRootControl, 0);
	};

	/**
	 * Internal method for recursive serializing
	 *
	 * @param {sap.ui.core.Control|sap.ui.core.UIArea} oControl The current control to process.
	 * @param {int} iLevel The nesting level of the recursion.
	 * @param {string} sAggregationName The name of the aggregation which aggregates the control.
	 * @param {boolean} isDefaultAggregation whether the aggregation is the default aggregation.
	 * @return {string} the serialized control tree.
	 */
	Serializer.prototype._serializeRecursive = function (oControl, iLevel, sAggregationName, isDefaultAggregation) {

		assert(typeof oControl !== "undefined", "The control must not be undefined");

		var aCode = [];

		var bWriteDelegate = (!this._bSkipRoot || iLevel !== 0);
		if (bWriteDelegate) {

			// write start and end
			var start = this._delegate.start(oControl, sAggregationName, isDefaultAggregation);
			var middle = this._delegate.middle(oControl, sAggregationName, isDefaultAggregation);
			aCode.push(start + middle);
		}

		// step down into recursion along the aggregations
        var mAggregations = oControl.getMetadata().getAllAggregations();
        if (mAggregations) {
            for (var sName in mAggregations) {
                if (this._fnSkipAggregations && this._fnSkipAggregations(oControl, sName)) {
                    continue;
                }
                // compute those elements that shall be serialized
                var mElementsToSerialize = [];
                var oAggregation = mAggregations[sName];
                var oValue = oControl[oAggregation._sGetter]();
                if (oControl.getBindingPath(sName) && oControl.getBindingInfo(sName).template) {
                    mElementsToSerialize.push(oControl.getBindingInfo(sName).template);
                } else if (oValue && oValue.length) { // TODO: ARRAY CHECK
                    for (var i = 0 ; i < oValue.length ; i++) {
                        var oObj = oValue[i];
                        if (this._isObjectSerializable(oObj)) {
                            mElementsToSerialize.push(oObj);
                        }
                    }
                } else if (this._isObjectSerializable(oValue)) {
                    mElementsToSerialize.push(oValue);
                }

                // write and step down into recursion for elements
                if (mElementsToSerialize.length > 0) {
                    if (bWriteDelegate) {
                        aCode.push(this._delegate.startAggregation(oControl, sName));
                    }
                    var isDefault = this._isDefaultAggregation(oControl, sName);
                    for (var j = 0 ; j < mElementsToSerialize.length ; j++) {
                        aCode.push(this._serializeRecursive(mElementsToSerialize[j], iLevel + 1, sName, isDefault));
                    }
                    if (bWriteDelegate) {
                        aCode.push(this._delegate.endAggregation(oControl, sName));
                    }
                }
            }
        }

		// write end
		if (bWriteDelegate) {
			var end = this._delegate.end(oControl, sAggregationName, isDefaultAggregation);
			aCode.push(end);
		}

		return aCode.join("");
	};

	/**
	 * Checks if the given object should be serialized
	 * @param {object} oObject
	 * @return {boolean}
	 * @private
	 */
	Serializer.prototype._isObjectSerializable = function (oObject) {
		return oObject instanceof this._oWindow.sap.ui.core.Element &&
			!(this._fnSkipElement && this._fnSkipElement(oObject));
	};

	/**
	 * Checks if a given aggregation is the default aggregation.
	 *
	 * @param {sap.ui.core.Control|sap.ui.core.UIArea} oControl The current control to process.
	 * @param {string} sAggregationName The name of the aggregation.
	 * @return {boolean} Whether the given aggregation is the default aggregation or not
	 * @private
	 */
	Serializer.prototype._isDefaultAggregation = function (oControl, sAggregationName) {
		return oControl.getMetadata().getDefaultAggregationName() === sAggregationName;
	};

	return Serializer;

});