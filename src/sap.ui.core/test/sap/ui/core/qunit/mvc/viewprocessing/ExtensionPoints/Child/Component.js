sap.ui.define(["sap/ui/core/qunit/mvc/viewprocessing/ExtensionPoints/Parent/Component"], function (Parent) {
	"use strict";

	return Parent.extend("sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Child.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			Parent.prototype.init.apply(this, arguments);
		}
	});

});