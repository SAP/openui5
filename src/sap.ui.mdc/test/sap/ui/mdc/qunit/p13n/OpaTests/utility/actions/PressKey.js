/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/thirdparty/jquery"
], function (Action, jQueryDOM) {
	"use strict";

	/**
	 * @class
	 * The <code>PressKey</code> action is used to simulate a press interaction with a
	 * control. This Action can be used to similare keyboard specific keys such as escape.
	 *
	 * @extends sap.ui.test.actions.Action
	 * @private
	 * @author SAP SE
	 * @since 1.82
	 */
	var PressKey = Action.extend("sap.ui.mdc.opaTests.PressKey", {

		metadata : {
			properties: {
				keyCode: {
					type: "int"
				}
			},
			publicMethods : [ "executeOn" ]
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
		},

		executeOn : function (oControl) {
			var sKeyCode = this.getKeyCode();

			oControl.$().trigger(jQueryDOM.Event("keydown", { keyCode: sKeyCode }));

		}
	});

	return PressKey;

});