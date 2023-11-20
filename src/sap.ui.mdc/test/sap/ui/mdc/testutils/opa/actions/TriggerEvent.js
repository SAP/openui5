/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/thirdparty/jquery"
], function (Action, jQuery) {
	"use strict";

	/**
	 * @class
	 * The <code>TriggerEvent</code> action is used to simulate an interaction with a
	 * control.
	 *
	 * @extends sap.ui.test.actions.Action
	 * @private
	 * @author SAP SE
	 * @since 1.108
	 */
	var TriggerEvent = Action.extend("sap.ui.mdc.actions.TriggerEvent", {

		metadata : {
			properties: {
				event: {
					type: "string"
				},
				payload: {
					type: "object"
				}
			},
			publicMethods : [ "executeOn" ]
		},

		executeOn : function (oTarget) {
			var oFakeEvent = jQuery.Event(this.getEvent(), this.getPayload());
			(oTarget.$ ? oTarget.$() : jQuery(oTarget)).trigger(oFakeEvent); // "keydown", { keyCode: sKeyCode }
		}
	});

	return TriggerEvent;

});