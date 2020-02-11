/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/changeHandler/common/revertAddedControls"
], function(
	Base,
	LoaderExtensions,
	revertAddedControls
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
	 * @experimental Since 1.75. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var BaseAddXml = {};

	/**
	 * Adds the content of the XML fragment to the given aggregation of the control, if valid.
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.view Root view
	 * @param {object} mChangeInfo Change Informantion map
	 * @param {number} mChangeInfo.index Index defines the position at witch the xml fragment is added
	 * @param {string} mChangeInfo.aggregation Aggregation name of the control to be extended by the xml fragment
	 * @returns {boolean} <true> if the change got applied successfully
	 * @public
	 * @name sap.ui.fl.changeHandler.BaseAddXml#applyChange
	 */
	BaseAddXml.applyChange = function(oChange, oControl, mPropertyBag, mChangeInfo) {
		var aNewControls = Base.instantiateFragment(oChange, mPropertyBag);

		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var sAggregationName = mChangeInfo.aggregation;
		var oAggregationDefinition = oModifier.findAggregation(oControl, sAggregationName);
		if (!oAggregationDefinition) {
			BaseAddXml._destroyArrayOfControls(aNewControls);
			throw new Error("The given Aggregation is not available in the given control: " + oModifier.getId(oControl));
		}
		var sModuleName = oChange.getModuleName();
		var sFragment = LoaderExtensions.loadResource(sModuleName, {dataType: "text"});
		var iIndex = mChangeInfo.index;
		var aRevertData = [];
		aNewControls.forEach(function(oNewControl, iIterator) {
			if (!oModifier.validateType(oNewControl, oAggregationDefinition, oControl, sFragment, iIterator)) {
				BaseAddXml._destroyArrayOfControls(aNewControls);
				throw new Error("The content of the xml fragment does not match the type of the targetAggregation: " + oAggregationDefinition.type);
			}
		});
		aNewControls.forEach(function(oNewControl, iIterator) {
			oModifier.insertAggregation(oControl, sAggregationName, oNewControl, iIndex + iIterator, oView);
			aRevertData.push({
				id: oModifier.getId(oNewControl),
				aggregationName: sAggregationName
			});
		});

		oChange.setRevertData(aRevertData);
		return true;
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
	 * @public
	 * @name sap.ui.fl.changeHandler.BaseAddXml#revertChange
	 */
	BaseAddXml.revertChange = revertAddedControls;

	BaseAddXml._throwMissingAttributeError = function(sAttribute) {
		throw new Error("Attribute missing from the change specific content'" + sAttribute + "'");
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
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @param {object} [oChangeDefinition] Already prepared definition of the change
	 * @public
	 * @name sap.ui.fl.changeHandler.BaseAddXml#completeChangeContent
	 */
	BaseAddXml.completeChangeContent = function(oChange, oSpecificChangeInfo, oChangeDefinition) {
		if (!oChangeDefinition) {
			oChangeDefinition = oChange.getDefinition();
			if (!oChangeDefinition.content) {
				oChangeDefinition.content = {};
			}
		}
		if (oSpecificChangeInfo.fragmentPath) {
			oChangeDefinition.content.fragmentPath = oSpecificChangeInfo.fragmentPath;
		} else {
			BaseAddXml._throwMissingAttributeError("fragmentPath");
		}

		var sModuleName = oChangeDefinition.reference.replace(/\./g, "/");
		sModuleName += "/changes/";
		sModuleName += oChangeDefinition.content.fragmentPath.replace(/\.fragment\.xml/g, "");
		oChange.setModuleName(sModuleName);
	};

	return BaseAddXml;
}, /* bExport= */true);
