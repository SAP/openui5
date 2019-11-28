sap.ui.define(["sap/ui/demo/routing/nested/base/BaseController"], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.routing.nested.reuse.suppliers.controller.App", {
		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
		}
	});
});
