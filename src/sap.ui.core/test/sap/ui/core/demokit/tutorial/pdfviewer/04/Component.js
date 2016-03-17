sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.pdfviewer.04.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/controller/BaseController.js",
							"webapp/controller/Home.controller.js",
							"webapp/controller/NotFound.controller.js",
							"webapp/controller/PdfEmbed.controller.js",
							"webapp/controller/PdfIframe.controller.js",
							"webapp/controller/PdfIframeHtmlWrapper.controller.js",
							"webapp/controller/PdfJs.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/view/App.view.xml",
							"webapp/view/Home.view.xml",
							"webapp/view/NotFound.view.xml",
							"webapp/view/PdfEmbed.view.xml",
							"webapp/view/PdfIframe.view.xml",
							"webapp/view/PdfIframeHtmlWrapper.view.xml",
							"webapp/view/PdfJs.view.xml",
							"webapp/Component.js",
							"webapp/HtmlPdfWrapper.html",
							"webapp/index.html",
							"webapp/manifest.json",
							"webapp/Scrum-Guide-US.pdf"
						]
					}
				}
			}

		});

		return Component;
	});
