/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'], function (jQuery, Ui5Object) {
	"use strict";

	/**
	 * @class The Press action is used to simulate a press interaction on a control's dom ref.
	 * @extends sap.ui.base.Object
	 * @public
	 * @alias sap.ui.test.actions.Press
	 * @author SAP SE
	 * @since 1.34
	 */
	return Ui5Object.extend("sap.ui.test.actions.Press", {

		metadata : {
			publicMethods : [ "executeOn" ]
		},

		/**
		 * Sets focus on given control and triggers a 'tap' event on it (which is
		 * internally translated into a 'press' event).
		 * Logs an error if control is not visible (i.e. has no dom representation)
		 *
		 * @param {sap.ui.core.Control} oControl the control on which the 'press' event is triggered
		 * @public
		 * @function
		 */
		executeOn : function (oControl) {
			var $Control = oControl.$();
			if ($Control.length) {
				$Control.focus();
				// trigger 'tap' which is translated
				// internally into a 'press' event
				jQuery.sap.log.debug("Pressed the control " + oControl, this);
				$Control.trigger("tap");
			} else {
				jQuery.sap.log.error("Control has no dom representation", this);
			}
		}
	});

}, /* bExport= */ true);
