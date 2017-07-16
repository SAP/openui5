/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', './Base'
], function(jQuery, Base) {
	"use strict";

	/**
	 * Change handler for unstashing of a control.
	 * @alias sap.ui.fl.changeHandler.UnstashControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var UnstashControl = { };

	/**
	 * Unstashes and shows a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	UnstashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var mContent = oChange.getContent();
		var oModifier = mPropertyBag.modifier;

		oModifier.setStashed(oControl, false);

		if (mContent.parentAggregationName){
			//old way including move, new way will have seperate move change
			var sTargetAggregation = mContent.parentAggregationName;
			var oTargetParent = oModifier.getParent(oControl);
			oModifier.removeAggregation(oTargetParent, sTargetAggregation, oControl);
			oModifier.insertAggregation(oTargetParent, sTargetAggregation, oControl, mContent.index);
		}
		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	UnstashControl.completeChangeContent = function(oChange, oSpecificChangeInfo) {

		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.content) {
			//old way including move, new way will have seperate move change
			oChangeJson.content = oSpecificChangeInfo.content;
		}

	};

	return UnstashControl;
},
/* bExport= */true);
