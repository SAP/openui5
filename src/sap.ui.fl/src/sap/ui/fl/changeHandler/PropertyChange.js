/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/base/Log"
], function(
	jQuery,
	FlexUtils,
	CondenserClassification,
	Log
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

	// var sBindingError = "Please use 'PropertyBindingChange' to set a binding";

	function isBinding(vPropertyValue) {
		return FlexUtils.isBinding(vPropertyValue) || jQuery.isPlainObject(vPropertyValue);
	}

	function changeProperty(oControl, sPropertyName, vPropertyValue, oModifier) {
		try {
			if (isBinding(vPropertyValue)) {
				oModifier.setPropertyBinding(oControl, sPropertyName, vPropertyValue);
			} else {
				oModifier.setProperty(oControl, sPropertyName, vPropertyValue);
			}
		} catch (ex) {
			throw new Error("Applying property changes failed: " + ex);
		}
	}

	/**
	 * Changes the properties on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @returns {Promise} Promise resolving when change is applied
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @name sap.ui.fl.changeHandler.PropertyChange#applyChange
	 */
	PropertyChange.applyChange = function(oChange, oControl, mPropertyBag) {
		var oContent = oChange.getContent();
		var sPropertyName = oContent.property;
		var vPropertyValue = oContent.newValue;
		var oModifier = mPropertyBag.modifier;

		// TODO: enable again when apps have adapted
		// if (isBinding(vPropertyValue)) {
		// 	throw new Error(sBindingError);
		// }

		return Promise.resolve()
			.then(oModifier.getPropertyBindingOrProperty.bind(oModifier, oControl, sPropertyName))
			.then(function(oOriginalValue) {
				oChange.setRevertData({
					originalValue: oOriginalValue
				});
				changeProperty(oControl, sPropertyName, vPropertyValue, oModifier);
			});
	};

	/**
	 * Revert the properties value on the given control
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	PropertyChange.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
			var oContent = oChange.getContent();
			var sPropertyName = oContent.property;
			var vPropertyValue = mRevertData.originalValue;
			var oModifier = mPropertyBag.modifier;

			changeProperty(oControl, sPropertyName, vPropertyValue, oModifier);
			oChange.resetRevertData();
		} else {
			Log.error("Attempt to revert an unapplied change.");
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute property which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to property and index the new position of the field in the smart form group
	 * @returns {Promise} Promise that resolves completing the change content
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @name sap.ui.fl.changeHandler.PropertyChange#completeChangeContent
	 */
	PropertyChange.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		if (!oSpecificChangeInfo.content) {
			throw new Error("oSpecificChangeInfo attribute required");
		}
		// TODO: enable again when apps have adapted
		// if (isBinding(oSpecificChangeInfo.content.newValue)) {
		// 	throw new Error(sBindingError);
		// }

		oChange.setContent(oSpecificChangeInfo.content);
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	PropertyChange.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.LastOneWins,
			uniqueKey: oChange.getContent().property
		};
	};

	return PropertyChange;
}, /* bExport= */true);
