/**
 * Control which ...
 */
sap.ui.define(['sap/ui/core/Control', './MyGlobal'], function(Control, MyGlobal) {
	"use strict";

	var MyControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.MyControl", {
		constructor: function(sId, mSettings) {
			MyGlobal.add(this);
			Control.apply(this, arguments);
		},
		metadata: {
			properties : {
				text: {type: "string", group: "Misc", defaultValue: null}
			}

		},
		init: function() {
			//initialize
		},
		renderer: function() {
			//render
		}
	});

	MyControl.prototype.toString = function() {
		return "BadControl";
	};

	return MyControl;
});