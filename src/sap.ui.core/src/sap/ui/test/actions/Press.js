/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/qunit/QUnitUtils'], function ($, Ui5Object, QUnitUtils) {
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
			var oFocusDomRef = oControl.getFocusDomRef(),
				$FocusDomRef = $(oFocusDomRef);

			if ($FocusDomRef.length) {
				$FocusDomRef.focus();
				// trigger 'tap' which is translated
				// internally into a 'press' event
				$.sap.log.debug("Pressed the control " + oControl, this);
				var x = $FocusDomRef.offset().x,
					y = $FocusDomRef.offset().y;

				// See file jquery.sap.events.js for some insights to the magic
				var oEventObject = {
					targetTouches: [{
						identifier: 1,
						// Well offset should be fine here
						pageX: x,
						pageY: y,
						// ignore scrolled down stuff in OPA
						clientX: x,
						clientY: y,
						// Assume stuff is over the whole screen
						screenX: x,
						screenY: y,
						target: oFocusDomRef,
						radiusX: 1,
						radiusY: 1,
						rotationAngle: 0
					}],
					touches: []
				};

				QUnitUtils.triggerEvent("saptouchstart", oFocusDomRef,oEventObject);
				$FocusDomRef.trigger("tap");
				QUnitUtils.triggerEvent("saptouchend", oFocusDomRef, oEventObject);
			} else {
				$.sap.log.error("Control " + oControl.getId() + " has no dom representation", this);
			}
		}
	});

}, /* bExport= */ true);
