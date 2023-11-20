sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView"
], function (View, XMLView) {
	"use strict";

	return View.extend("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecWithTypedView", {
		createContent: function() {
			var aRes = [];
			for (var i = 0; i < 2; i++) {
				var pView = XMLView.create({
					id: "subview_" + this._sOwnerId + "_" + i,
					viewName: "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecSub"
				});

				pView.then(window._test_fnCallbackSubInit.bind(this));

				aRes.push(pView);
			}

			return Promise.all(aRes);
		}
	});
});
