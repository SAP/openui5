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
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXML#applyChange
	 */
	AddXML.applyChange = function(oChange, oControl, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var mChangeInfo = {
			aggregationName: oChangeDefinition.content.targetAggregation,
			index: oChangeDefinition.content.index
		};

		BaseAddXml.applyChange(oChange, oControl, mPropertyBag, mChangeInfo);
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
	 * @name sap.ui.fl.changeHandler.AddXML#revertChange
	 */
	AddXML.revertChange = BaseAddXml.revertChange;

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXML#completeChangeContent
	 */
	AddXML.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		var oChangeDefinition = oChange.getDefinition();

		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}

		if (oSpecificChangeInfo.targetAggregation) {
			oChangeDefinition.content.targetAggregation = oSpecificChangeInfo.targetAggregation;
		} else {
			BaseAddXml._throwMissingAttributeError("targetAggregation");
		}

		if (oSpecificChangeInfo.index !== undefined) {
			oChangeDefinition.content.index = oSpecificChangeInfo.index;
		} else {
			BaseAddXml._throwMissingAttributeError("index");
		}

		BaseAddXml.completeChangeContent(oChange, oSpecificChangeInfo, oChangeDefinition);
	};

	return AddXML;
}, /* bExport= */true);
