/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.MetadataPropagationUtil.
sap.ui.define([
	"sap/ui/dt/Util",
	"sap/base/util/merge",
	"sap/base/util/isEmptyObject"
], function(
	Util,
	merge,
	isEmptyObject
) {
	"use strict";

	/**
	 * Functionality to propagate DesignTime and RelevantContainer.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.MetadataPropagationUtil
	 */

	var MetadataPropagationUtil = {};

	MetadataPropagationUtil._getParentPropagationInfo = function(mAggregationMetadata) {
		if (!mAggregationMetadata ||
			!mAggregationMetadata.propagationInfos) {
			return false;
		}
		return [...mAggregationMetadata.propagationInfos];
	};

	MetadataPropagationUtil._getCurrentRelevantContainerPropagation = function(mElementDtMetadataForAggregation, oElement) {
		const mNewPropagationInfo = {};
		const sMetadataType = typeof mElementDtMetadataForAggregation.propagateRelevantContainer;
		if (!mElementDtMetadataForAggregation.propagateRelevantContainer) {
			// undefined or false
			return mNewPropagationInfo;
		} else if (sMetadataType === "function") {
			mNewPropagationInfo.relevantContainerFunction = mElementDtMetadataForAggregation.propagateRelevantContainer;
			mNewPropagationInfo.relevantContainerElement = oElement;
		} else if (sMetadataType === "boolean") {
			mNewPropagationInfo.relevantContainerFunction = function() { return true; };
			mNewPropagationInfo.relevantContainerElement = oElement;
		} else {
			const oError = Util.wrapError(`Wrong type: it should be either a function or a boolean value and it is:${sMetadataType}`);
			const sLocation = "sap.ui.dt.MetadataPropagationUtil#_getCurrentRelevantContainerPropagation";
			oError.name = `Error in ${sLocation}`;
			oError.message = `${sLocation} / ${oError.message}`;
			throw oError;
		}
		return mNewPropagationInfo;
	};

	MetadataPropagationUtil._getCurrentDesigntimePropagation = function(mElementDtMetadataForAggregation, oElement) {
		const mNewPropagationInfo = {};
		const sMetadataType = typeof mElementDtMetadataForAggregation.propagateMetadata;
		if (!mElementDtMetadataForAggregation.propagateMetadata) {
			return mNewPropagationInfo;
		} else if (sMetadataType === "function") {
			mNewPropagationInfo.relevantContainerElement = oElement;
			mNewPropagationInfo.metadataFunction = mElementDtMetadataForAggregation.propagateMetadata;
		} else {
			const oError = Util.wrapError(`Wrong type: it should be a function and it is:${
				sMetadataType}`);

			const sLocation = "sap.ui.dt.MetadataPropagationUtil#_getCurrentDesigntimePropagation";
			oError.name = `Error in ${sLocation}`;
			oError.message = `${sLocation} / ${oError.message}`;
			throw oError;
		}
		return mNewPropagationInfo;
	};

	MetadataPropagationUtil._setPropagationInfo = function(mMetadata, mNewPropagationInfo, aPropagationInfoListFromParent) {
		if (!aPropagationInfoListFromParent &&
			isEmptyObject(mNewPropagationInfo)) {
			return false;
		}

		// add propagation array to current aggregation designtime-metadata
		mMetadata.propagationInfos = aPropagationInfoListFromParent || [];
		if (!isEmptyObject(mNewPropagationInfo)) {
			mMetadata.propagationInfos.push(mNewPropagationInfo);
		}
		return mMetadata;
	};

	/**
	 * Extend the passed aggregationOverlay metadata with propagated aggregationOverlay metadata from parent
	 * and metadata to propagte from passed elementOverlay metadata.
	 *
	 * @param {object} mOriginalMetadata - Aggregation design time metadata data map to be extended with propagation data
	 * @param {sap.ui.core.Element} oElement - Element may be used as relevant container
	 * @param {object} mParentAggregationMetadata - Aggregation design time metadata of the parent
	 * @return {object} Extended data part of the element design time metadata.
	 */
	MetadataPropagationUtil.propagateMetadataToAggregationOverlay = function(mOriginalMetadata, oElement, mParentAggregationMetadata) {
		var mNewPropagationInfo;
		var mMetadataFunctionPropagation;
		var mRelevantContainerPropagation;
		var mMetadata = { ...mOriginalMetadata };

		var aPropagatedRelevantContainersFromParent = MetadataPropagationUtil._getParentPropagationInfo(mParentAggregationMetadata);

		if (mMetadata && !isEmptyObject(mMetadata)) {
			mRelevantContainerPropagation = MetadataPropagationUtil._getCurrentRelevantContainerPropagation(mMetadata, oElement);
			mMetadataFunctionPropagation = MetadataPropagationUtil._getCurrentDesigntimePropagation(mMetadata, oElement);
		}

		if (aPropagatedRelevantContainersFromParent || !isEmptyObject(mRelevantContainerPropagation) || !isEmptyObject(mMetadataFunctionPropagation)) {
			mNewPropagationInfo = { ...mRelevantContainerPropagation, ...mMetadataFunctionPropagation };
			return MetadataPropagationUtil._setPropagationInfo(mMetadata, mNewPropagationInfo, aPropagatedRelevantContainersFromParent);
		}
		return mMetadata;
	};

	/**
	 * Method extracts relevant container from given parent metadata if available.
	 *
	 * @param {object} mParentMetadata - aggregation designtime metadata data from parent
	 * @param {sap.ui.core.Element} oElement - element to check for relevant container
	 * @return {sap.ui.core.Element|boolean} Returns relevant container element if available, otherwise it returns false.
	 */
	MetadataPropagationUtil.getRelevantContainerForPropagation = function(mParentMetadata, oElement) {
		var vPropagatedRelevantContainer = false;

		if (!mParentMetadata ||
			!mParentMetadata.propagationInfos) {
			return false;
		}

		mParentMetadata.propagationInfos.some(function(oPropagatedInfo) {
			if (oPropagatedInfo.relevantContainerFunction &&
				oPropagatedInfo.relevantContainerFunction(oElement)) {
				vPropagatedRelevantContainer = oPropagatedInfo.relevantContainerElement;
				return true;
			}
		});

		return vPropagatedRelevantContainer || false;
	};

	/**
	 * Method extracts propagated metadata map from given parents metadata if available.
	 *
	 * @param {object} mParentMetadata - aggregation designtime metadata data from parents
	 * @param {sap.ui.core.Element} oElement - element to check for propagated metadata map
	 * @return {object|boolean} Returns propagated metadata map if available, otherwise it returns false.
	 */
	MetadataPropagationUtil.getMetadataForPropagation = function(mParentMetadata, oElement) {
		var vReturnMetadata = {};

		if (!mParentMetadata ||
			!mParentMetadata.propagationInfos) {
			return false;
		}

		// Propagated infos are ordered from highest to lowest parent
		// The highest parent always "wins", so we need to extend starting from the bottom
		var aRevertedPropagationInfos = mParentMetadata.propagationInfos.slice().reverse();

		vReturnMetadata = aRevertedPropagationInfos.reduce(function(vReturnMetadata, oPropagatedInfo) {
			if (oPropagatedInfo.metadataFunction) {
				var oCurrentMetadata = oPropagatedInfo.metadataFunction(oElement, oPropagatedInfo.relevantContainerElement);
				return merge(vReturnMetadata, oCurrentMetadata);
			}
			return vReturnMetadata;
		}, vReturnMetadata);

		return isEmptyObject(vReturnMetadata) ? false : vReturnMetadata;
	};

	/**
	 * Extend the original ElementOverlay DesignTimeMetadata by propagated DesignTimeMetadata and RelevantContainer.
	 *
	 * @param {object} mTargetMetadata - element designtime metadata data to be extended with propagation data
	 * @param {object} mParentMetadata - aggregation designtime metadata data includes the propagation infos
	 * @param {sap.ui.core.Element} oElement - element is needed to check which propagation metadata is required
	 * @return {object} Returns extended data part of the element designtime metadata.
	 */
	MetadataPropagationUtil.propagateMetadataToElementOverlay = function(mTargetMetadata, mParentMetadata, oElement) {
		var vPropagatedRelevantContainer = MetadataPropagationUtil.getRelevantContainerForPropagation(mParentMetadata, oElement);
		var vPropagatedMetadata = MetadataPropagationUtil.getMetadataForPropagation(mParentMetadata, oElement);

		if (!vPropagatedRelevantContainer && !vPropagatedMetadata) {
			return mTargetMetadata;
		}

		var mResultMetadata = merge({}, mTargetMetadata);

		if (vPropagatedRelevantContainer) {
			mResultMetadata.relevantContainer = vPropagatedRelevantContainer;
		}

		if (vPropagatedMetadata) {
			if (vPropagatedMetadata.actions === null || vPropagatedMetadata.actions === "not-adaptable") {
				var mAggregations = oElement.getMetadata().getAllAggregations();
				var aAggregationNames = Object.keys(mAggregations);

				if (mResultMetadata.aggregations) {
					aAggregationNames = aAggregationNames.concat(
						Object.keys(mResultMetadata.aggregations).filter(function(sAggregationName) {
							return aAggregationNames.indexOf(sAggregationName) < 0;
						})
					);
				} else {
					mResultMetadata.aggregations = {};
				}

				aAggregationNames.forEach(function(sAggregationName) {
					if (mResultMetadata.aggregations[sAggregationName] && mResultMetadata.aggregations[sAggregationName].actions) {
						mResultMetadata.aggregations[sAggregationName].actions = vPropagatedMetadata.actions;
					}
				});
			}
			return merge(mResultMetadata, vPropagatedMetadata);
		}
		return mResultMetadata;
	};

	return MetadataPropagationUtil;
});