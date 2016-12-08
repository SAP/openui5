/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', './Base'
], function(jQuery, Base) {
	"use strict";

	/**
	 * Change handler for stashing of a control.
	 * @alias sap.ui.fl.changeHandler.StashControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var StashControl = { };

	/**
	 * Stashes and hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @param {object} mPropertyBag	- map of properties
	 * @returns {boolean} true - if change could be applied
	 * @public
	 */
	StashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		mPropertyBag.modifier.setVisible(oControl, false);
		mPropertyBag.modifier.setStashed(oControl, true);
		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	StashControl.completeChangeContent = function(oChange, oSpecificChangeInfo) {

	};

	return StashControl;
},
/* bExport= */true);
