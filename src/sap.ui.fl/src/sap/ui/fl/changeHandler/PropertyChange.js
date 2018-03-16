/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Utils"
], function(
	jQuery,
	Base,
	FlexUtils
) {
	"use strict";

	/**
	 * Change handler for setting properties on controls
	 *
	 * @alias sap.ui.fl.changeHandler.PropertyChange
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.36
	 * @private
	 * @experimental Since 1.36. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var PropertyChange = {};

	function changeProperty(oControl, sPropertyName, vPropertyValue, oModifier) {
		try {
			if (FlexUtils.isBinding(vPropertyValue) || jQuery.isPlainObject(vPropertyValue)) {
				oModifier.setPropertyBinding(oControl, sPropertyName, vPropertyValue);
			} else {
				oModifier.setProperty(oControl, sPropertyName, vPropertyValue);
			}
		} catch (ex) {
			throw new Error("Applying property changes failed: " +  ex);
		}
	}

	/**
	 * Changes the properties on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyChange#applyChange
	 */
	PropertyChange.applyChange = function(oChange, oControl, mPropertyBag) {
		var oDef = oChange.getDefinition();
		var sPropertyName = oDef.content.property;
		var vPropertyValue = oDef.content.newValue;
		var oModifier = mPropertyBag.modifier;

		oChange.setRevertData({
			originalValue: oModifier.getPropertyBinding(oControl, sPropertyName) || oModifier.getProperty(oControl, sPropertyName)
		});

		changeProperty(oControl, sPropertyName, vPropertyValue, oModifier);
	};

	/**
	 * Revert the properties value on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @return {boolean} true - if change has been reverted
	 * @public
	 */
	PropertyChange.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
			var oDef = oChange.getDefinition();
			var sPropertyName = oDef.content.property;
			var vPropertyValue = mRevertData.originalValue;
			var oModifier = mPropertyBag.modifier;

			changeProperty(oControl, sPropertyName, vPropertyValue, oModifier);
			oChange.resetRevertData();
		} else {
			jQuery.sap.log.error("Attempt to revert an unapplied change.");
			return false;
		}

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute property which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to property and index the new position of the field in the smart form group
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyChange#completeChangeContent
	 */
	PropertyChange.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		var oChangeJson = oChange.getDefinition();
		if (oSpecificChangeInfo.content) {
			oChangeJson.content = oSpecificChangeInfo.content;
		} else {
			throw new Error("oSpecificChangeInfo attribute required");
		}
	};

	return PropertyChange;
}, /* bExport= */true);
