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
	 * Change handler for adding XML at extension point.
	 *
	 * @alias sap.ui.fl.changeHandler.AddXMLAtExtensionPoint
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.75
	 * @private
	 * @experimental Since 1.75. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AddXMLAtExtensionPoint = {};

	/**
	 * Adds the content of the XML fragment to the parent control of the Extension Ponint right behind the ExtensionPoint.
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.view Root view
	 * @returns {boolean} <true> if the change got applied successfully
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#applyChange
	 */
	AddXMLAtExtensionPoint.applyChange = function (oChange, oControl, mPropertyBag) {
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		if (oModifier.targets === "jsControlTree") {
			throw new Error("Changes with type " + oChange.getChangeType() + " are not supported on js");
		}
		var oSelector = oChange.getDefinition().selector;
		var mExtensionPointInfo = oModifier.getExtensionPointInfo(oSelector.name, oView);
		if (!mExtensionPointInfo) {
			throw new Error("Either no Extension-Point found by name or multiple Extension-Points available with the given name in the view. Multiple Extension-points with the same name in one view are not supported!");
		}
		return BaseAddXml.applyChange(oChange, oControl, mPropertyBag, mExtensionPointInfo);
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
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#revertChange
	 */
	AddXMLAtExtensionPoint.revertChange = BaseAddXml.revertChange;

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @public
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#completeChangeContent
	 */
	AddXMLAtExtensionPoint.completeChangeContent = BaseAddXml.completeChangeContent;

	return AddXMLAtExtensionPoint;
}, /* bExport= */true);