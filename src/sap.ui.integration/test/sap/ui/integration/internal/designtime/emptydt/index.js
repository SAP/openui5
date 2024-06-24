
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
										oConfigAdmin = new ConfigurationEditor({
											card: { manifest: oBASCardEditor.getManifest(), baseUrl: sBaseUrl },
											designtime: oBASCardEditor.getConfigurationClass(),
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
				oBASCardEditor.setDestinations([
					'BAS_TEST',
					'BAS',
					'WZCP_Dest',
					'Northwind_V4',
					'ZZZ1',
					'ZZZ',
					'JAM',
					'WorkZone_Repository_wz_service',
					'WorkZone_Repository_portallkg_service_contentpackage',
					'JAMA',
					'BAM2',
					'BAM',
					'WZCPSSTest',
					'WorkZone_Dest_TestPortal_client_credentials',
					'ES5',
					'Mobile_Transaction_Bridge',
					'Northwind_CLONING',
					'wz_mobilecard',
					'Northwind',
					'WorkZone_PortalNormal',
					'testmdk',
					'BusinessSystem00',
					'SuccessFactors_BA_API_Test_SalesDemo',
					'WorkZone_Repository_portallkg_service',
					'WorkZone_Repository_portal_service',
					'WorkZone_Dest_TestPortal',
					'WorkZone_Dest',
					'WorkZone_Repository',
					'nexus',
					'githubwdf',
					'WZContentRepository',
					'AH1',
					'bas-tamir-test1'
				]);
				oBASCardEditor.placeAt("BASeditor");
			});
		});
	});
});
