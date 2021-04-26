sap.ui.define([
	"sap/m/Button",
	"sap/m/Text",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView"
], function(Button, Text, View, XMLView) {
	"use strict";

	return View.extend("sap.ui.core.sample.View.preprocessor.SampleView", {

		getAutoPrefixId: function() {
			return true;
		},

		createContent: function(oController) {
			var that = this;

			// Define sample preprocessor functions
			var fnXmlPreprocessor = function(xml, info, settings) {
				return new Promise(function(resolve) {
					setTimeout(function() {
						// alert(info.name + ": " + settings.message);
						// Convert apples to oranges
						var sXml = new XMLSerializer().serializeToString(xml);
						sXml = sXml.replace("apple", "orange");
						resolve(new DOMParser().parseFromString(sXml, "application/xml").documentElement);
					}, 500); // Timeout just for the effect :)
				});
			},

			fnControlPreprocessor = function(controls, info, settings) {
				return new Promise(function(resolve) {
					setTimeout(function() {
						// alert(info.name + ": " + settings.message);
						// Some manipulation of the control tree
						var oPanel = controls.getContent()[0];
						oPanel.removeAllContent();
						oPanel.addContent(new Button({
							text: "Apple View",
							icon: "sap-icon://nutrition-activity",
							press: function() {
								alert("Fruit alert!");  // eslint-disable-line no-alert
							}
						}));
						resolve(/*return value is irrelevant for 'controls'*/);
					}, 500); // Timeout just for the effect :)
				});
			};

			return XMLView.create({
				viewName: "sap.ui.core.sample.View.preprocessor.Sample"
			})
			.then(function(oView) {
				that.addContent(
					new Text({
						text: "XML view instantiated with XML string:"
					}).addStyleClass("sapUiSmallMargin")
				);
				that.addContent(oView);
				// Create a view with preprocessor for 'xml'
				return XMLView.create({
					viewName: "sap.ui.core.sample.View.preprocessor.Sample",
					preprocessors: {
						xml: {
							preprocessor: fnXmlPreprocessor,
							message: "'xml' preprocessor running"
						}
					}
				})
				.then(function(oView) {
					that.addContent(
						new Text({
							text: "XML view with 'xml' preprocessor:"
						}).addStyleClass("sapUiSmallMargin")
					);
					that.addContent(oView);
					// Create a view with preprocessor for 'controls'
					return XMLView.create({
						viewName: "sap.ui.core.sample.View.preprocessor.Sample",
						preprocessors: {
							controls: {
								preprocessor: fnControlPreprocessor,
								message: "XML view with 'controls' preprocessor:"
							}
						}
					})
					.then(function(oView) {
						that.addContent(
							new Text({
								text: "XML view instantiated with XML string:"
							}).addStyleClass("sapUiSmallMargin")
						);
						that.addContent(oView);
					});
				});
			});
		}
	});

});