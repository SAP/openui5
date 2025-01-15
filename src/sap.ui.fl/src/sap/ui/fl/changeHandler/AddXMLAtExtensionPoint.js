/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/api/ExtensionPointRegistryAPI",
	"sap/ui/fl/changeHandler/BaseAddXml"
], function(
	ExtensionPointRegistryAPI,
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
	 */
	const AddXMLAtExtensionPoint = {};

	function calculateExtensionPointIndex(mExtensionPointInfo) {
		let iIndex = mExtensionPointInfo.index;
		if (mExtensionPointInfo.referencedExtensionPoint) {
			iIndex += calculateExtensionPointIndex(mExtensionPointInfo.referencedExtensionPoint);
		}
		return iIndex;
	}

	/**
	 * Adds the content of the XML fragment to the parent control of the Extension Ponint right behind the ExtensionPoint.
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.view Root view
	 * @param {string} [mPropertyBag.viewId] View ID (XML Processing)
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#applyChange
	 */
	AddXMLAtExtensionPoint.applyChange = async function(oChange, oControl, mPropertyBag) {
		const oView = mPropertyBag.view;
		const oModifier = mPropertyBag.modifier;
		// during JS processing the viewId is not in the propertyBag (and should not be, as this would lead to wrong ID calculation)
		const sViewId = mPropertyBag.viewId || oModifier.getId(oView);
		const oSelector = oChange.getSelector();
		const mExtensionPointInfo = oChange.getExtensionPointInfo && oChange.getExtensionPointInfo()
			|| await oModifier.getExtensionPointInfo(oSelector.name, oView);

		if (!mExtensionPointInfo) {
			throw new Error(`AddXMLAtExtensionPoint-Error: Either no Extension-Point found by name '${
				oSelector && oSelector.name
			}' or multiple Extension-Points available with the given name in the view (view.id='${
				sViewId
			}'). Multiple Extension-points with the same name in one view are not supported!`);
		}
		(mExtensionPointInfo.defaultContent || []).forEach(function(vControl) {
			// Remove default implementation of extension points in async apply (xml-preprocessing)
			// and create (via action handler) scenarios
			if (vControl) {
				oModifier.destroy(vControl);
			}
		});
		mExtensionPointInfo.defaultContent = [];
		// calculate index from nested extension points
		mExtensionPointInfo.index = calculateExtensionPointIndex(mExtensionPointInfo);
		if (oModifier.targets === "xmlTree") {
			mExtensionPointInfo.skipAdjustIndex = true;
		}
		const aNewControls = await BaseAddXml.applyChange(oChange, oControl, mPropertyBag, mExtensionPointInfo);
		if (mExtensionPointInfo.ready) {
			// Confirm with ready function in sync apply scenario (preprocessing with JSView)
			mExtensionPointInfo.ready(aNewControls);
		}
		ExtensionPointRegistryAPI.addCreatedControlsToExtensionPointInfo({
			name: oSelector.name,
			viewId: sViewId,
			createdControlsIds: aNewControls.map((oNewControl) => oModifier.getId(oNewControl))
		});
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
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#revertChange
	 */
	AddXMLAtExtensionPoint.revertChange = BaseAddXml.revertChange;

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {object} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Additional information needed to complete the change
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @name sap.ui.fl.changeHandler.AddXMLAtExtensionPoint#completeChangeContent
	 */
	AddXMLAtExtensionPoint.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		// Complete change content could be called with a third parameter. That would override the
		// optional changeDefinition parameter of the BaseAddXml used in e.g. add xml use case
		BaseAddXml.completeChangeContent(oChange, oSpecificChangeInfo/* , oContent */);
	};

	return AddXMLAtExtensionPoint;
});
