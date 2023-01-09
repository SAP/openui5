sap.ui.define(["sap/ui/core/mvc/View"], function(View) {
	"use strict";

	return View.extend("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecWithTypedView_legacyAPIs", {
		createContent: function() {
			var aRes = [];
			for (var i = 0; i < 2; i++) {
				var pView = sap.ui.xmlview("subview_" + this._sOwnerId + "_" + i, {
					async: true,
					type: "XML",
					viewName: "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecSub"
				});

				pView.attachAfterInit(window._test_fnCallbackSubInit);

				aRes.push(pView);
			}

			return aRes;
		}
	});
});
