/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	Log,
	CondenserClassification
) {
	"use strict";

	/**
	 * Change handler for setting properties bindings on controls
	 *
	 * @alias sap.ui.fl.changeHandler.PropertyBindingChange
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.38
	 * @private
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var PropertyBindingChange = {};

	// var sNoBindingError = "Please use 'PropertyChange' to set properties without binding";

	// function isBinding(vPropertyValue) {
	// 	return FlexUtils.isBinding(vPropertyValue) || jQuery.isPlainObject(vPropertyValue);
	// }

	/**
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @returns {Promise} Promise that resolves with setting the property binding
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @name sap.ui.fl.changeHandler.PropertyBindingChange#applyChange
	 */
	PropertyBindingChange.applyChange = function(oChange, oControl, mPropertyBag) {
		var oContent = oChange.getContent();
		var sPropertyName = oContent.property;
		var vPropertyValue = oContent.newBinding;
		var oModifier = mPropertyBag.modifier;

		// TODO: enable again when apps have adapted
		// if (!isBinding(vPropertyValue)) {
		// 	throw new Error(sNoBindingError);
		// }

		return Promise.resolve()
			.then(oModifier.getPropertyBindingOrProperty.bind(oModifier, oControl, sPropertyName))
			.then(function(vOriginalValue) {
				oChange.setRevertData({
					originalValue: vOriginalValue
				});
				oModifier.setPropertyBinding(oControl, sPropertyName, vPropertyValue);
			});
	};

	/**
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Reverter
	 * @name sap.ui.fl.changeHandler.PropertyBindingChange#revertChange
	 */
	PropertyBindingChange.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
			var oContent = oChange.getContent();
			var sPropertyName = oContent.property;
			var vPropertyValue = mRevertData.originalValue;
			var oModifier = mPropertyBag.modifier;

			oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, vPropertyValue);
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
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @name sap.ui.fl.changeHandler.PropertyBindingChange#completeChangeContent
	 */
	PropertyBindingChange.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		if (!oSpecificChangeInfo.content) {
			throw new Error("oSpecificChangeInfo attribute required");
		}
		// TODO: enable again when apps have adapted
		// if (!isBinding(oSpecificChangeInfo.content.newBinding)) {
		// 	throw new Error(sNoBindingError);
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
	PropertyBindingChange.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.LastOneWins,
			uniqueKey: oChange.getContent().property
		};
	};

	return PropertyBindingChange;
}, /* bExport= */true);
