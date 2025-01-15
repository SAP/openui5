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
	 * @ui5-restricted change handlers
	 */
	const BaseAddXml = {};

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
	BaseAddXml.applyChange = async function(oChange, oControl, mPropertyBag, mChangeInfo) {
		const oModifier = mPropertyBag.modifier;
		const sAggregationName = mChangeInfo.aggregationName;
		const sModuleName = oChange.getFlexObjectMetadata().moduleName;

		const oAggregationDefinition = await oModifier.findAggregation(oControl, sAggregationName);
		if (!oAggregationDefinition) {
			throw Error(`The given Aggregation is not available in the given control: ${oModifier.getId(oControl)}`);
		}
		const sFragment = await LoaderExtensions.loadResource(sModuleName, {dataType: "text"});
		const aNewControls = await Base.instantiateFragment(oChange, mPropertyBag);

		let iIterator = 0;
		for (const oNewControl of aNewControls) {
			const bValidated = await oModifier.validateType(oNewControl, oAggregationDefinition, oControl, sFragment, iIterator);
			iIterator++;
			if (!bValidated) {
				BaseAddXml._destroyArrayOfControls(aNewControls);
				throw Error(`The content of the xml fragment does not match the type of the targetAggregation: ${oAggregationDefinition.type}`);
			}
		}

		const aRevertData = [];
		let iIterator1 = 0;
		for (const oNewControl of aNewControls) {
			await oModifier.insertAggregation(
				oControl,
				sAggregationName,
				oNewControl,
				mChangeInfo.index + iIterator1,
				mPropertyBag.view,
				mChangeInfo.skipAdjustIndex
			);
			iIterator1++;
			aRevertData.push({
				id: oModifier.getId(oNewControl),
				aggregationName: sAggregationName
			});
		}
		oChange.setRevertData(aRevertData);
		return aNewControls;
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
		// TODO: Remove assignment without content after all derived change handlers are adjusted to use content. todos#4
		const oSpecificChangeContent = oSpecificChangeInfo.content || oSpecificChangeInfo;
		if (!oSpecificChangeContent.fragmentPath) {
			BaseAddXml._throwMissingAttributeError("fragmentPath");
		}
		oContent.fragmentPath ??= oSpecificChangeContent.fragmentPath;
		oChange.setContent(oContent);

		// Calculate the moduleName for the fragment
		let sModuleName = oChange.getFlexObjectMetadata().reference.replace(/\.Component/g, "").replace(/\./g, "/");
		sModuleName += "/changes/";
		sModuleName += oContent.fragmentPath;
		const oFlexObjectMetadata = oChange.getFlexObjectMetadata();
		oFlexObjectMetadata.moduleName = sModuleName;
		oChange.setFlexObjectMetadata(oFlexObjectMetadata);
	};

	return BaseAddXml;
});
