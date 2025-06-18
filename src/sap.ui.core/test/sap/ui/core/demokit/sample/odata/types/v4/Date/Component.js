/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.types.v4.Date.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getModel().setData({
				Date: "2022-12-31",
				EndDate: "2023-03-31"
			});
		}
	});
});
