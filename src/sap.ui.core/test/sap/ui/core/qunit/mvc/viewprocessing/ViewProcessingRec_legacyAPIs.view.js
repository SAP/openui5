sap.ui.jsview("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRec_legacyAPIs", {

	createContent: function() {
		"use strict";

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