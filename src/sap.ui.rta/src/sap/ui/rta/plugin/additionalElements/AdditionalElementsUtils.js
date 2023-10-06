/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dt/OverlayRegistry"
], function(
	Lib,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Helper object containing methods for the AdditionalElements plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.94
	 */
	var AdditionalElementsUtils = {};

	/**
	* Get design time metadata, if you don't care about the specific actions currently available
	* @param {object} mActions - Actions object
	* @returns {sap.ui.dt.ElementDesignTimeMetadata} Design time metadata
	*/
	function getDTMetadataFromActions(mActions) {
		return mActions.addViaDelegate && mActions.addViaDelegate.designTimeMetadata;
	}

	/**
	 * Returns a structure of relevant information related to the given overlay's parents
	 * @param {boolean} bSibling - Indicates if the elements should be added as sibling (true) or child (false) to the overlay
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay for which the parents are being calculated
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElementsPlugin
	 * @returns {object} Structure containing all relevant information about the overlay parents
	 */
	AdditionalElementsUtils.getParents = function(bSibling, oOverlay, oPlugin) {
		var oParentOverlay;
		var oResponsibleElementOverlay = oOverlay;
		var bResponsibleElementAvailable = ["add.delegate", "reveal"].some(function(vActionName) {
			return oPlugin.isResponsibleElementActionAvailable(oOverlay, vActionName);
		});
		if (bResponsibleElementAvailable) {
			oResponsibleElementOverlay = oPlugin.getResponsibleElementOverlay(oOverlay);
		}
		var oRelevantContainer = oResponsibleElementOverlay.getRelevantContainer(!bSibling);
		var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		if (bSibling) {
			oParentOverlay = oResponsibleElementOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oResponsibleElementOverlay;
		}
		return {
			responsibleElementOverlay: oResponsibleElementOverlay,
			relevantContainerOverlay: oRelevantContainerOverlay,
			parentOverlay: oParentOverlay,
			relevantContainer: oRelevantContainer,
			parent: oParentOverlay && oParentOverlay.getElement() // root overlay has no parent
		};
	};

	/**
	 * Returns a text from the RTA i18n resource
	 * @param {string} sRtaTextKey - Text key on the i18n file
	 * @param {object} mActions - Object containing information about the add actions
	 * @param {sap.ui.core.Element} oParentElement - Parent element that contains the aggregation being evaluated
	 * @param {boolean} bSingular - Singular (true) or plural (false) name
	 * @param {string} [sControlName] - Name of the control, if available
	 * @returns {string} Text from the RTA i18n resource
	 */
	AdditionalElementsUtils.getText = function(sRtaTextKey, mActions, oParentElement, bSingular, sControlName) {
		var aNames = [];
		var mControlType;
		var sControlType;
		var sAggregationName = mActions.aggregation;

		if (mActions.addViaCustom || mActions.addViaDelegate) {
			var oDesignTimeMetadata = getDTMetadataFromActions(mActions);
			mControlType = oDesignTimeMetadata.getAggregationDescription(sAggregationName, oParentElement);
			if (mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			}
		}
		if (mActions.reveal) {
			mActions.reveal.controlTypeNames.forEach(function(mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			});
		}
		var aNonDuplicateNames = aNames.reduce(function(_aNames, sName) {
			if (_aNames.indexOf(sName) === -1) {
				_aNames.push(sName);
			}
			return _aNames;
		}, []);

		var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

		if (aNonDuplicateNames.length === 1) {
			[sControlType] = aNonDuplicateNames;
		} else if (sControlName) {
			sControlType = sControlName;
		} else {
			sControlType = oTextResources.getText("MULTIPLE_CONTROL_NAME");
		}
		return oTextResources.getText(sRtaTextKey, [sControlType]);
	};

	return AdditionalElementsUtils;
});