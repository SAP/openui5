sap.ui.define(["sap/ui/core/sample/RoutingNestedComponent/base/BaseController"], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.core.sample.RoutingNestedComponent.reuse.suppliers.controller.App", {
		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
		}
	});
});
