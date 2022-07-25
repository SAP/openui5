/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseAddXml"
], function(
	BaseAddXml
) {
	"use strict";

	/**
	 * Change handler for adding XML
	 *
	 * @alias sap.ui.fl.changeHandler.AddXML
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.54
	 * @private
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddXML = {};

	/**
	 * Adds the content of the XML fragment to the given aggregation of the control, if valid.
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.view Root view
	 * @returns {boolean} <true> if the change got applied successfully
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @name sap.ui.fl.changeHandler.AddXML#applyChange
	 */
	AddXML.applyChange = function(oChange, oControl, mPropertyBag) {
		var oContent = oChange.getContent();
		var mChangeInfo = {
			aggregationName: oContent.targetAggregation,
			index: oContent.index
		};

		return BaseAddXml.applyChange(oChange, oControl, mPropertyBag, mChangeInfo);
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
	 * @name sap.ui.fl.changeHandler.AddXML#revertChange
	 */
	AddXML.revertChange = BaseAddXml.revertChange;

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @name sap.ui.fl.changeHandler.AddXML#completeChangeContent
	 */
	AddXML.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		var oContent = {};
		if (oSpecificChangeInfo.targetAggregation) {
			oContent.targetAggregation = oSpecificChangeInfo.targetAggregation;
		} else {
			BaseAddXml._throwMissingAttributeError("targetAggregation");
		}

		if (oSpecificChangeInfo.index !== undefined) {
			oContent.index = oSpecificChangeInfo.index;
		} else {
			BaseAddXml._throwMissingAttributeError("index");
		}

		BaseAddXml.completeChangeContent(oChange, oSpecificChangeInfo, oContent);
	};

	return AddXML;
}, /* bExport= */true);
