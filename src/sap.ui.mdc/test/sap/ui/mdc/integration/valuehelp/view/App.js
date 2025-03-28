sap.ui.define(["sap/ui/core/mvc/View", "sap/ui/core/mvc/XMLView", "sap/ui/core/util/reflection/XmlTreeModifier", "../model/State"], (View, XMLView, XmlTreeModifier, oStateModel) => {

	"use strict";

	const oActiveView = oStateModel.getProperty("/activeView");

	/**
	 *  @deprecated As of version 1.121
	 */
	const bLegacyEnabled = new URLSearchParams(window.location.search).get("legacy") === "true"	|| false;

	/**
	 *  @deprecated As of version 1.121
	 */
	if (bLegacyEnabled) {
		XMLView.registerPreprocessor("viewxml", function (oView, mProperties, mSettings) {
			if (oActiveView.path === "sap.ui.v4demo.view.OPA-7") {
				XmlTreeModifier.setProperty(XmlTreeModifier.bySelector(`appView--FH1-Popover`, undefined, oView), "opensOnFocus", true);
				XmlTreeModifier.setProperty(XmlTreeModifier.bySelector(`appView--FH2-Popover`, undefined, oView), "opensOnFocus", true);
			}

			if (oActiveView.path === "sap.ui.v4demo.view.OPA-6") {
				XmlTreeModifier.setProperty(XmlTreeModifier.bySelector(`appView--FH1-Popover`, undefined, oView), "opensOnClick", true);
			}

			if (oActiveView.path === "sap.ui.v4demo.view.Typeahead") {
				XmlTreeModifier.bindProperty(XmlTreeModifier.bySelector(`appView--FH1-Popover`, undefined, oView), "opensOnClick", "runtimeState>/opensOnClick");
			}

			return oView;
		});
	}

	/**
	 *  @deprecated As of version 1.120.2
	 */
	if (bLegacyEnabled) {
		XMLView.registerPreprocessor("viewxml", function (oView, mProperties, mSettings) {
			const oActiveView = oStateModel.getProperty("/activeView");
			if (["sap.ui.v4demo.view.SingleSelect", "sap.ui.v4demo.view.MultiSelect"].includes(oActiveView.path)) {
				XmlTreeModifier.setProperty(XmlTreeModifier.bySelector(`appView--FB0-FF10`, undefined, oView), "visible", true);
			}
			return oView;
		});
	}

	return View.extend("sap.ui.v4demo.view.App", {
		createContent : function () {
			return XMLView.create({
				id: "appView",
				preprocessors : {
					xml: {
						models: {
							tplState: oStateModel
						}
					}
				},
				viewName : "sap.ui.v4demo.view.AppTemplate"
			}).then(function (oView) {
				oView.setModel(oStateModel, "runtimeState");
				return oView;
			});
		}
	});
});