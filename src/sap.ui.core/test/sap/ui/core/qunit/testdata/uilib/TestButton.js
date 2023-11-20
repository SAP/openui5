/*!
 * ${copyright}
 */

// Provides control sap.ui.testlib.TestButton.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/EnabledPropagator",
	"./TestButtonRenderer"
], function(library, Control, EnabledPropagator, TestButtonRenderer) {
	"use strict";

	/**
	 * Constructor for a new TestButton.
	 *
	 * @param {string} [sId] ID for the new button, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new button
	 *
	 * @class
	 *
	 * Using the button control, you enable end users to trigger actions such as Save or Print.
	 * For the button UI, you can define some text or an icon, or both.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.2.3
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias sap.ui.testlib.TestButton
	 */
	var TestButton = Control.extend("sap.ui.testlib.TestButton", {
		metadata : {
			library : "sap.ui.testlib",
			properties : {
				"text" : {type : "string", group : "Appearance", defaultValue : ''},
				"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
				"visible" : {type : "boolean", group : "", defaultValue : true},
				"width" : {type : "int", group : "", defaultValue : 200}
			},
			events : {
				"press" : "press"
			}
		},

		onclick : function(oEvent) {
			if (this.getEnabled()){
				this.firePress({/* no parameters */});
			}

			oEvent.preventDefault();
			oEvent.stopPropagation();
		},

		renderer: TestButtonRenderer
	});

	EnabledPropagator.call(TestButton.prototype);

	return TestButton;
});
