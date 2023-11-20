/**
 * Control which does not return its class (no module export)
 */
sap.ui.define(['sap/ui/core/Control'], function(Control) {
	"use strict";

	var BadControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.BadControl", {
		metadata: {},
		init: function() {
			//initialize
		},
		renderer: function() {
			//render
		}
	});

	BadControl.prototype.toString = function() {
		return "BadControl";
	};

	//does not return BadControl
});