sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	return Extension.extend("cardWithExtension.webpageCardSampleExtension", {

		getData: function () {
			const oData = { url: "https://openui5.org/events" };

			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(oData);
				}, 2000);
			});
			//return Promise.resolve(oData);
		}
	});
});