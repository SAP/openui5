/*!
	* ${copyright}
	*/

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/UnstashControl"
], function(
	JsControlTreeModifier,
	UnstashControl
) {
	"use strict";

	/**
	 * ObjectPageSection Change Handler for Unstash
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.UnstashObjectPageSection
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.115
	 */

	var UnstashObjectPageSection = Object.assign({}, UnstashControl);

	/**
	 * Retrieves the information required for the change visualization.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Object with change data
	 * @param {sap.ui.core.UIComponent} oAppComponent Component in which the change is applied
	 * @returns {object} Object with a description payload containing the information required for the change visualization
	 * @public
	 */
	UnstashObjectPageSection.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oStashedElementSelector = oChange.getSelector();
		var oStashedElement = JsControlTreeModifier.bySelector(oStashedElementSelector, oAppComponent);
		var oAnchorBar = oStashedElement.getParent().getAggregation("_anchorBar");
		var aAffectedControls = [oStashedElementSelector];
		var aDisplayControls = [oStashedElementSelector];

		oAnchorBar.getAggregation("items").forEach(function(oAnchorBarItem) {
			if (oStashedElement.getId() === oAnchorBarItem.getKey()) {
				aDisplayControls.push(oAnchorBarItem.getId());
			}
		});

		return {
			affectedControls: aAffectedControls,
			displayControls: aDisplayControls
		};
	};

	return UnstashObjectPageSection;
});