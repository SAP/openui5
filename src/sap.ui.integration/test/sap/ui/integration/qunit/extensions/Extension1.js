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

	oExtension.requestWithCustomDataType = function () {
		return this.getCard().request({
			url: "some/url",
			dataType: "xml"
		}).then(function (oXMLDocument) {
			var aCities = oXMLDocument.querySelectorAll("City");

			return Array.prototype.map.call(aCities, function (oCity) {
				return oCity.getAttribute("Name");
			});
		});
	};

	oExtension.getDataForHeader = function () {
		return Promise.resolve({ title: "Berlin" });
	};

	return oExtension;
});
