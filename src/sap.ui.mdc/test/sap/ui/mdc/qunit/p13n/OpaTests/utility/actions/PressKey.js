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
	 * The <code>PressKey</code> action is used to simulate a press interaction with a
	 * control. This Action can be used to similare keyboard specific keys such as escape.
	 *
	 * @extends sap.ui.test.actions.Action
	 * @private
	 * @author SAP SE
	 * @since 1.82
	 */
	const PressKey = Action.extend("sap.ui.mdc.opaTests.PressKey", {

		metadata : {
			properties: {
				keyCode: {
					type: "int"
				}
			}
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
		},

		executeOn : function (oControl) {
			const sKeyCode = this.getKeyCode();

			oControl.$().trigger(jQuery.Event("keydown", { keyCode: sKeyCode }));

		}
	});

	return PressKey;

});