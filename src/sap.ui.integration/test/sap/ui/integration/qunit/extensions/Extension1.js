sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var oExtension = new Extension({
		actions: [
			{
				type: 'Navigation',
				url: "http://www.sap.com",
				target: "_blank",
				text: 'AutoOpen - SAP website - Extension'
			}
		],
		formatters: {
			toUpperCase: function (sValue) {
				return sValue.toUpperCase();
			}
		}
	});

	oExtension.getData = function () {
		return Promise.resolve([
				{ city: "Berlin", description: "Germany" },
				{ city: "Tokyo", description: "Japan" }
			]);
	};

	oExtension.getDataForContent = function () {
		return Promise.resolve([
				{ city: "Berlin", description: "Germany" },
				{ city: "Tokyo", description: "Japan" }
			]);
	};

	oExtension.getDataForHeader = function () {
		return Promise.resolve({ title: "Berlin" });
	};

	return oExtension;
});
