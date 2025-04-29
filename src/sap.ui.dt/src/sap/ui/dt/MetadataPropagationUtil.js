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

	MetadataPropagationUtil._getPropagatedActions = function(oElementDesignTimeMetadata, mMetadata, oElement) {
		const aPropagatedActions = [];
		// If the name is not maintained in the DT metadata, we get the last part of the element metadata
		const sPropagatingControlName = oElementDesignTimeMetadata.getName(oElement)?.singular
			|| oElement.getMetadata().getName().split(".").pop();
		// Get propagated actions from element
		oElementDesignTimeMetadata.getPropagateActions(oElement).forEach((vAction) => {
			const sAction = typeof vAction === "string" ? vAction : vAction.action;
			const oAction = oElementDesignTimeMetadata.getAction(sAction, oElement);
			if (oAction && !aPropagatedActions.find((oPropagatedAction) => oPropagatedAction.name === sAction)) {
				const oPropagatedAction = {
					name: sAction,
					action: oAction
				};
				if (vAction.isActive) {
					oPropagatedAction.isActive = vAction.isActive;
				}
				aPropagatedActions.push(oPropagatedAction);
			}
		});
		// Get propagated actions from aggregation
		mMetadata.propagatedActions?.forEach((vAction) => {
			const sAction = typeof vAction === "string" ? vAction : vAction.action;
			const oAction = mMetadata.actions?.[sAction];
			if (oAction) {
				const oPropagatedAction = {
					name: sAction,
					action: oAction
				};
				if (vAction.isActive) {
					oPropagatedAction.isActive = vAction.isActive;
				}
				aPropagatedActions.push(oPropagatedAction);
			}
		});
		return aPropagatedActions.length
			? {
				propagatedActionInfo: {
					propagatingControl: oElement,
					propagatingControlName: sPropagatingControlName,
					actions: aPropagatedActions
				}
			}
			: null;
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
	 * and metadata to propagate from passed elementOverlay metadata.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay for which the metadata should be propagated
	 * @param {string} sAggregationName - Name of the aggregation for which the metadata should be propagated
	 * @param {object} mParentAggregationMetadata - Aggregation design time metadata of the parent
	 * @return {object} Extended data part of the element design time metadata.
	 */
	MetadataPropagationUtil.propagateMetadataToAggregationOverlay = function(
		oElementOverlay,
		sAggregationName,
		mParentAggregationMetadata
	) {
		const oElementDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		const oOriginalAggregationMetadata = oElementDesignTimeMetadata.getAggregation(sAggregationName);
		const oElement = oElementOverlay.getElement();
		let mNewPropagationInfo;
		let mMetadataFunctionPropagation;
		let mRelevantContainerPropagation;
		let mPropagatedActionsPropagation;
		const mMetadata = { ...oOriginalAggregationMetadata };

		const aPropagatedRelevantContainersFromParent = MetadataPropagationUtil._getParentPropagationInfo(mParentAggregationMetadata);

		if (mMetadata && !isEmptyObject(mMetadata)) {
			mRelevantContainerPropagation = MetadataPropagationUtil._getCurrentRelevantContainerPropagation(mMetadata, oElement);
			mMetadataFunctionPropagation = MetadataPropagationUtil._getCurrentDesigntimePropagation(mMetadata, oElement);
			mPropagatedActionsPropagation = MetadataPropagationUtil._getPropagatedActions(oElementDesignTimeMetadata, mMetadata, oElement);
		}

		if (
			aPropagatedRelevantContainersFromParent
			|| !isEmptyObject(mRelevantContainerPropagation)
			|| !isEmptyObject(mMetadataFunctionPropagation)
			|| !isEmptyObject(mPropagatedActionsPropagation)
		) {
			mNewPropagationInfo = { ...mRelevantContainerPropagation, ...mMetadataFunctionPropagation, ...mPropagatedActionsPropagation };
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
	 * Method extracts propagated metadata map from given parents metadata if available. This can be defined as a
	 * propagateMetadata function. Also actions that should be propagated to children can be defined in the parent
	 * metadata ("propagateActions" on the designtime metadata). They are added to the children's
	 * dynamic designtime metadata on the "propagatedActions" property.
	 *
	 * @param {object} mParentMetadata - aggregation designtime metadata data from parents
	 * @param {sap.ui.core.Element} oElement - element to check for propagated metadata map
	 * @return {object|boolean} Returns propagated metadata map if available, otherwise it returns false.
	 */
	MetadataPropagationUtil.getMetadataForPropagation = function(mParentMetadata, oElement) {
		let vReturnMetadata = {};

		if (!mParentMetadata ||
			!mParentMetadata.propagationInfos) {
			return false;
		}

		function addPropagatedActions(oMetadata, oPropagatedInfo) {
			if (oMetadata && oPropagatedInfo.propagatedActionInfo) {
				oPropagatedInfo.propagatedActionInfo.actions.forEach(function(oPropagatedAction) {
					if (oPropagatedAction.isActive && !oPropagatedAction.isActive(oElement)) {
						return;
					}
					const sActionName = oPropagatedAction.name;
					oMetadata.propagatedActions ||= [];
					oMetadata.propagatedActions.push({
						name: sActionName,
						action: oPropagatedAction.action,
						propagatingControl: oPropagatedInfo.propagatedActionInfo.propagatingControl,
						propagatingControlName: oPropagatedInfo.propagatedActionInfo.propagatingControlName
					});
				});
			}
			return oMetadata;
		}

		// Propagated infos are ordered from highest to lowest parent
		// The highest parent always "wins", so we need to extend starting from the bottom
		const aRevertedPropagationInfos = mParentMetadata.propagationInfos.slice().reverse();

		vReturnMetadata = aRevertedPropagationInfos.reduce(function(vReturnMetadata, oPropagatedInfo) {
			if (oPropagatedInfo.metadataFunction) {
				let oCurrentMetadata = oPropagatedInfo.metadataFunction(oElement, oPropagatedInfo.relevantContainerElement);
				if (oCurrentMetadata && oPropagatedInfo.propagatedActionInfo) {
					oCurrentMetadata = addPropagatedActions(oCurrentMetadata, oPropagatedInfo);
				}
				return merge(vReturnMetadata, oCurrentMetadata);
			}
			return merge(addPropagatedActions(vReturnMetadata, oPropagatedInfo), vReturnMetadata);
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
}, /* bExport= */true);