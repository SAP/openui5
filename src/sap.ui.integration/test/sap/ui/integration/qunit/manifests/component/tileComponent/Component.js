sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("test.manifest.component.tileComponent.Component", {
		metadata: {
			manifest: "json"
		},
		tileSetVisible: function (bIsVisible) {
			this.tileVisible = bIsVisible;
		},
		tileRefresh: function () {
			this.tileRefreshWasCalled = true;
		}
	});

	return Component;

});
