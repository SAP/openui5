/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/changeHandler/common/revertAddedControls",
	"sap/ui/fl/Utils"
], function(
	Base,
	LoaderExtensions,
	revertAddedControls,
	FlUtils
) {
	"use strict";

	/**
	 * Base change handler for adding XML
	 *
	 * @alias sap.ui.fl.changeHandler.BaseAddXml
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.75
	 * @private
	 * @ui5-restricted change handlers
	 */
	var BaseAddXml = {};

	/**
	 * Adds the content of the XML fragment to the given aggregation of the control, if valid.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control
	 * @param {object} oControl - Control which has been determined by the selector id
	 * @param {object} mPropertyBag - Property bag
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @param {object} mPropertyBag.view - Root view
	 * @param {object} mChangeInfo - Change Informantion map
	 * @param {number} mChangeInfo.index - Index defines the position at witch the xml fragment is added
	 * @param {string} mChangeInfo.aggregationName - Aggregation name of the control to be extended by the xml fragment
	 * @param {boolean} [mChangeInfo.skipAdjustIndex] - True in case of inserting an XML node or element at an extension point, needed only in XML case
	 * @returns {array} Array of new created controls
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applier
	 * @name sap.ui.fl.changeHandler.BaseAddXml#applyChange
	 */
	BaseAddXml.applyChange = function(oChange, oControl, mPropertyBag, mChangeInfo) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var sAggregationName = mChangeInfo.aggregationName;
		var oAggregationDefinition;
		var iIndex = mChangeInfo.index;
		var aRevertData = [];
		var sModuleName = oChange.getFlexObjectMetadata().moduleName;
		var sFragment;
		var aNewControls;

		var fnAddControls = function() {
			var aPromises = [];
			aNewControls.forEach(function(oNewControl, iIterator) {
				var fnPromise = function() {
					return Promise.resolve()
					.then(oModifier.insertAggregation.bind(
						oModifier,
						oControl,
						sAggregationName,
						oNewControl,
						iIndex + iIterator,
						oView,
						mChangeInfo.skipAdjustIndex
					))
					.then(function() {
						aRevertData.push({
							id: oModifier.getId(oNewControl),
							aggregationName: sAggregationName
						});
					});
				};
				aPromises.push(fnPromise);
			});
			return FlUtils.execPromiseQueueSequentially(aPromises, true, true, true)
			.then(function() {
				oChange.setRevertData(aRevertData);
				return aNewControls;
			});
		};

		return Promise.resolve()
		// validate aggregation
		.then(oModifier.findAggregation.bind(oModifier, oControl, sAggregationName))
		.then(function(oRetrievedAggregationDefinition) {
			oAggregationDefinition = oRetrievedAggregationDefinition;
			if (!oAggregationDefinition) {
				return Promise.reject(new Error(`The given Aggregation is not available in the given control: ${oModifier.getId(oControl)}`));
			}
			// load and instantiate fragment
			return LoaderExtensions.loadResource(sModuleName, {dataType: "text"});
		})
		.then(function(sLoadedFragment) {
			sFragment = sLoadedFragment;
			return Base.instantiateFragment(oChange, mPropertyBag);
		})
		// validate types
		.then(function(aRetrievedControls) {
			aNewControls = aRetrievedControls;
			var aPromises = [];
			aNewControls.forEach(function(oNewControl, iIterator) {
				var fnPromise = function() {
					return Promise.resolve()
					.then(oModifier.validateType.bind(oModifier, oNewControl, oAggregationDefinition, oControl, sFragment, iIterator))
					.then(function(bValidated) {
						if (!bValidated) {
							BaseAddXml._destroyArrayOfControls(aNewControls);
							return Promise.reject(new Error(`The content of the xml fragment does not match the type of the targetAggregation: ${oAggregationDefinition.type}`));
						}
						return undefined;
					});
				};
				aPromises.push(fnPromise);
			});
			return FlUtils.execPromiseQueueSequentially(aPromises, true, true, true)
			.then(fnAddControls);
		});
	};

	/**
	 * Restores the previous state of the control, removing the content of the fragment
	 * from the aggregation
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent App component
	 * @param {object} mPropertyBag.view Root view
	 * @return {boolean} <true> if change has been reverted successfully
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Reverter
	 * @name sap.ui.fl.changeHandler.BaseAddXml#revertChange
	 */
	BaseAddXml.revertChange = revertAddedControls;

	BaseAddXml._throwMissingAttributeError = function(sAttribute) {
		throw new Error(`Attribute missing from the change specific content '${sAttribute}'`);
	};

	BaseAddXml._destroyArrayOfControls = function(aControls) {
		aControls.forEach(function(oControl) {
			if (oControl.destroy) {
				oControl.destroy();
			}
		});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object to be completed
	 * @param {object} oSpecificChangeInfo - Additional information needed to complete the change
	 * @param {object} [oContent] - Already prepared definition of the change
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @name sap.ui.fl.changeHandler.BaseAddXml#completeChangeContent
	 */
	BaseAddXml.completeChangeContent = function(oChange, oSpecificChangeInfo, oContent) {
		oContent ||= {};
		if (oSpecificChangeInfo.fragmentPath) {
			oContent.fragmentPath = oSpecificChangeInfo.fragmentPath;
		} else {
			BaseAddXml._throwMissingAttributeError("fragmentPath");
		}
		oChange.setContent(oContent);

		// Calculate the moduleName for the fragment
		var sModuleName = oChange.getFlexObjectMetadata().reference.replace(/\.Component/g, "").replace(/\./g, "/");
		sModuleName += "/changes/";
		sModuleName += oContent.fragmentPath;
		var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
		oFlexObjectMetadata.moduleName = sModuleName;
		oChange.setFlexObjectMetadata(oFlexObjectMetadata);
	};

	return BaseAddXml;
});
