sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("my.component.sample.customActions.Main", {
		onInit: function () {
			this.getView().byId("img").setSrc(sap.ui.require.toUrl("my/component/sample/customActions/Image.png"));
		}
	});
});