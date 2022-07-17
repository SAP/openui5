/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.Delegate
	 */
	var Delegate = function() {

	};

	/**
	 * Retrieve the metadata for the current binding context
	 *
	 * @returns {array} and array of property infos for personalization
	 */
	Delegate.retrieveAllMetadata = function(oModel, sDataPath) {
		return [];
	};

	/**
	 * Returns a control/fragment pointing to the current aggregation for a control
	 */
	Delegate.retrieveAggregationItem = function(sAggregationName, mMetadata) {
		return null;
	};

	/**
	 * may come for preprocessing note here we have currently no control...
	 *
	 * @param {object} oNode the XMLNode
	 * @param {ICallback} oVisitor the preprocessor callback
	 */
	Delegate.preConfiguration = function(oNode, oVisitor) {
		return oNode;
	};

	/**
	 * Get futher navigation targets for the field
	 *
	 *
	 * @param {object} oField the field
	 * @returns {array} and array of possible navigation targets
	 */
	Delegate.getNavigationTargets = function(oField) {
		return [];
	};

	return Delegate;
});
