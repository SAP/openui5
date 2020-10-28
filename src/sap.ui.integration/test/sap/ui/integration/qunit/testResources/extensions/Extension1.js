sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var Extension1 = Extension.extend("sap.ui.integration.qunit.testResources.extensions.Extension1");

	Extension1.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			toUpperCase: function (sValue) {
				return sValue.toUpperCase();
			}
		});
	};

	Extension1.prototype.onCardReady = function () {
		this.getCard().addActionDefinition(new ActionDefinition({
			type: 'Navigation',
			text: 'AutoOpen - SAP website - Extension',
			parameters: {
				url: "http://www.sap.com",
				target: "_blank"
			}
		}));
	};

	Extension1.prototype.getData = function () {
		return Promise.resolve([
			{ city: "Berlin", description: "Germany" },
			{ city: "Tokyo", description: "Japan" }
		]);
	};

	Extension1.prototype.getDataForContent = function () {
		return Promise.resolve([
			{ city: "Berlin", description: "Germany" },
			{ city: "Tokyo", description: "Japan" }
		]);
	};

	Extension1.prototype.requestWithCustomDataType = function () {
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

	Extension1.prototype.getDataForFilter = function () {
		return Promise.resolve([
			{ key: "hi", value: "High" },
			{ key: "mi", value: "Middle" },
			{ key: "lo", value: "Low" }
		]);
	};

	Extension1.prototype.getDataForHeader = function () {
		return Promise.resolve({ title: "Berlin" });
	};

	return Extension1;
});
