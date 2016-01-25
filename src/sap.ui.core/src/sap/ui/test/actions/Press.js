/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Action'], function ($, Action) {
	"use strict";

	/**
	 * The Press action is used to simulate a press interaction on a control's focus dom ref.
	 * This action is not guaranteed to work since sometimes the focus dom ref is not the dom ref you want to click.
	 * Supported controls are (for other controls this action still might work):
	 * <ul>
	 *     <li>sap.m.Button</li>
	 *     <li>sap.m.StandardListItem</li>
	 *     <li>sap.m.IconTabFilter</li>
	 *     <li>sap.m.StandardTile</li>
	 *     <li>sap.m.SearchField</li>
	 *     <li>sap.ui.table.Table.cell</li>
	 * </ul>
	 *
	 * @class
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @name sap.ui.test.actions.Press
	 * @author SAP SE
	 * @since 1.34
	 */
	var Press = Action.extend("sap.ui.test.actions.Press", /** @lends sap.ui.test.actions.Press.prototype */ {

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
		 */
		executeOn : function (oControl) {
			var $FocusDomRef,
				sAdapterDomRef = Press._controlAdapters[oControl.getMetadata().getName()];

			if (sAdapterDomRef) {
				$FocusDomRef = oControl.$(sAdapterDomRef);
			} else {
				$FocusDomRef = $(oControl.getFocusDomRef());
			}

			if ($FocusDomRef.length) {
				$FocusDomRef.focus();
				$.sap.log.debug("Pressed the control " + oControl, this._sLogPrefix);

				// the missing events like saptouchstart and tap will be fired by the event simulation
				this._triggerEvent("mousedown", $FocusDomRef);
				this._getUtils().triggerEvent("selectstart", $FocusDomRef);
				this._triggerEvent("mouseup", $FocusDomRef);
				this._triggerEvent("click", $FocusDomRef);
			} else {
				$.sap.log.error("Control " + oControl + " has no dom representation", this._sLogPrefix);
			}
		},

		_triggerEvent : function (sName, $FocusDomRef) {
			var oFocusDomRef = $FocusDomRef[0],
				x = $FocusDomRef.offset().x,
				y = $FocusDomRef.offset().y;

			// See file jquery.sap.events.js for some insights to the magic
			var oMouseEventObject = {
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
				target: $FocusDomRef[0],
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				// left mouse button
				button: 0,
				// include the type so jQuery.event.fixHooks can copy properties properly
				type: sName
			};
			this._getUtils().triggerEvent(sName, oFocusDomRef, oMouseEventObject);
		}
	});

	Press._controlAdapters = {
		"sap.m.SearchField" : "search"
	};

	return Press;

}, /* bExport= */ true);
