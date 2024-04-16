sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	return UIComponent.extend("testdata.keepAlive.child3OnDeactivateReturns.Component", {
		metadata: {
			manifest: "json"
		},
		init: function(){
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},
		onDeactivate: async function() {
			const oPromise = Promise.reject(new Error("'onDeactivate' failed."));
			window.aPromises?.push(oPromise);
			await oPromise;
		}
	});
});
