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
		var oSelector = oChange.getDefinition().selector;
		var mExtensionPointInfo = (oChange.getExtensionPointInfo && oChange.getExtensionPointInfo())
			|| oModifier.getExtensionPointInfo(oSelector.name, oView);
		if (!mExtensionPointInfo) {
			throw new Error("AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name '"
				 + (oSelector && oSelector.name)
				 + "' or multiple Extension-Points available with the given name in the view (view.id='"
				 + (oView && oModifier.getId(oView))
				 + "'). Multiple Extension-points with the same name in one view are not supported!");
		}
		(mExtensionPointInfo.defaultContent || []).forEach(function (vControl) {
			// Remove default implementation of extension points in async apply (xml-preprocessing) and create (via action handler) sceanrios
			oModifier.destroy(vControl);
		});
		var aNewControls = BaseAddXml.applyChange(oChange, oControl, mPropertyBag, mExtensionPointInfo);
		if (mExtensionPointInfo.ready) {
			// Confirm with ready function in sync apply scenario (preprocessing with JSView)
			mExtensionPointInfo.ready(aNewControls);
		}
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
	AddXMLAtExtensionPoint.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		// Complete change content could be called with a third parameter. That would override the
		// optional changeDefinition parameter of the BaseAddXml used in e.g. addxml usecase
		BaseAddXml.completeChangeContent(oChange, oSpecificChangeInfo/*, oChangeDefinition*/);
	};

	return AddXMLAtExtensionPoint;
}, /* bExport= */true);