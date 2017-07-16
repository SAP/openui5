/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"], function(jQuery, Base, FlexUtils) {
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
	var PropertyBindingChange = { };

	/**
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyBindingChange#applyChange
	 */
	PropertyBindingChange.applyChange = function(oChange, oControl, mPropertyBag) {
		var oDef = oChange.getDefinition();
		var sPropertyName = oDef.content.property;
		var oPropertyBinding = oDef.content.newBinding;
		mPropertyBag.modifier.setPropertyBinding(oControl, sPropertyName, oPropertyBinding);
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo with attribute property which contains an array which holds objects which have attributes
	 * 				   id and index - id is the id of the field to property and index the new position of the field in the smart form group
	 * @public
	 * @name sap.ui.fl.changeHandler.PropertyBindingChange#completeChangeContent
	 */
	PropertyBindingChange.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.content) {

			oChangeJson.content = oSpecificChangeInfo.content;

		} else {

			throw new Error("oSpecificChangeInfo attribute required");

		}

	};

	return PropertyBindingChange;
}, /* bExport= */true);
