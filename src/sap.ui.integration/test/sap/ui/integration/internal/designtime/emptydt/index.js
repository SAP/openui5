
sap.ui.require(["sap/ui/integration/util/loadCardEditor", "sap/base/util/LoaderExtensions", "sap/m/Button", "sap-ui-integration-editor"], function (loadCardEditor, LoaderExtensions, Button) {
	"use strict";
	var oBASCardEditor,
		oAdminButton,
		oContentButton,
		oTranslationButton,
		oConfigAdmin,
		oConfigContent,
		oConfigTranslation,
		sBaseUrl = document.location.protocol + "//" + document.location.host + document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/") + 1);

	loadCardEditor().then(function (BASCardEditor) {
		sap.ui.require(["sap/ui/integration/widgets/Card", "sap/ui/integration/designtime/editor/CardEditor"], function (Card, ConfigurationEditor) {
			LoaderExtensions.loadResource("indexjs/manifest.json", {
				dataType: "json",
				failOnError: false,
				async: true
			}).then(function (oManifest) {
				var oCard = new Card({
					baseUrl: sBaseUrl,
					manifest: oManifest
				});
				oCard.placeAt("card");
				oBASCardEditor = new BASCardEditor({
					createConfiguration: function (oEvent) {
						//var mParameters = oEvent.getParameters();
					},
					error: function (oEvent) {
						//var oError = oEvent.getParameters();
					},
					configurationChange: function (oEvent) {
						var mParameters = oEvent.getParameters();
						oCard.setManifest(mParameters.manifest);
						if (mParameters.configurationclass) {
							if (!oAdminButton) {
								oAdminButton = new Button({
									text: "Admin",
									press: function () {
										if (oConfigAdmin) {
											oConfigAdmin.destroy();
										}
										var sConfigurationString = oBASCardEditor.getConfigurationString();
										// eslint-disable-next-line no-eval
										var oSettings = eval("(" + sConfigurationString + ")");
										oConfigAdmin = new ConfigurationEditor({
											card: { manifest: oBASCardEditor.getManifest(), baseUrl: sBaseUrl },
											designtime: oSettings,
											//designtime: oBASCardEditor.getConfigurationClass(),
											allowSettings: true,
											allowDynamicValues: true,
											mode: "admin"
										});
										oConfigAdmin.placeAt("configAdmin");
									}
								});
								oAdminButton.placeAt("configAdmin");
							}
							if (!oContentButton) {
								oContentButton = new Button({
									text: "Content",
									press: function () {
										if (oConfigContent) {
											oConfigContent.destroy();
										}
										oConfigContent = new ConfigurationEditor({
											card: { manifest: oBASCardEditor.getManifest(), baseUrl: sBaseUrl },
											designtime: oBASCardEditor.getConfigurationClass(),
											allowSettings: true,
											allowDynamicValues: true,
											mode: "content"
										});
										oConfigContent.placeAt("configContent");
									}
								});
								oContentButton.placeAt("configContent");

							}
							if (!oTranslationButton) {

								oTranslationButton = new Button({
									text: "Translation",
									press: function () {
										if (oConfigTranslation) {
											oConfigTranslation.destroy();
										}
										oConfigTranslation = new ConfigurationEditor({
											card: { manifest: oBASCardEditor.getManifest(), baseUrl: sBaseUrl },
											designtime: oBASCardEditor.getConfigurationClass(),
											mode: "translation",
											language: "ru"
										});
										oConfigTranslation.placeAt("configTranslation");
									}
								});

								oTranslationButton.placeAt("configTranslation");
							}
						}
					},
					baseUrl: sBaseUrl,
					json: oManifest
				});
				//oBASCardEditor.setJson(oManifest);
				oBASCardEditor.placeAt("BASeditor");
			});
		});
	});
});
