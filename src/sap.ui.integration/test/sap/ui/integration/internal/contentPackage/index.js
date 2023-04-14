
sap.ui.require(["sap/ui/integration/widgets/Card", "sap/ui/integration/designtime/cardEditor/CardEditor", "sap/base/util/LoaderExtensions"], function (Card, CardEditor, LoaderExtensions) {
	"use strict";
	LoaderExtensions.loadResource("indexjs/manifest.json", {
		dataType: "json",
		failOnError: false,
		async: true
	}).then(function (oManifest) {
		if (oManifest["sap.package"] && !oManifest["sap.app"]) {
			oManifest["sap.app"] = {
				"id": "ns.test"
			};
		}
		var packageConfig = {
			"context": "root/context",
			"layout": {
				"form": {
					"groups": [
						{
							"label": "Package Configuration",
							"items": [
								{
									type: "tag",
									value: "package"
								}
							]
						}
					]
				}
			},
			properties: {
				"packageId": {
					"tags": ["package"],
					"label": "Package ID",
					"type": "string",
					"maxLength": 70,
					"path": "/sap.package/id"
				},
				"packageVersion": {
					"tags": ["package"],
					"label": "Package Version",
					"type": "string",
					"path": "/sap.package/packageVersion/version"
				},
				"packageUpgradeNotification": {
					"tags": ["package"],
					"label": "Package Upgrade Notification",
					"type": "select",
					"path": "/sap.package/packageVersion/upgradeNotification",
					"items": [
						{ "key": "none" },
						{ "key": "major" },
						{ "key": "major.minor" },
						{ "key": "all" }
					]
				},
				"packageTitle": {
					"tags": ["package"],
					"label": "Package Title",
					"type": "string",
					"path": "/sap.package/title"
				},
				"packageSubTitle": {
					"tags": ["package"],
					"label": "Package Subtitle",
					"type": "string",
					"path": "/sap.package/subTitle"
				},
				"packageShortTitle": {
					"tags": ["package"],
					"label": "Package ShortTitle",
					"type": "string",
					"path": "/sap.package/shortTitle"
				},
				"packageInfo": {
					"tags": ["package"],
					"label": "Package Info",
					"type": "string",
					"path": "/sap.package/info"
				},
				"packageDescription": {
					"tags": ["package"],
					"label": "Package Description",
					"type": "string",
					"path": "/sap.package/description"
				},
				"packageIcon": {
					"tags": ["package"],
					"label": "Package Icon",
					"type": "simpleicon",
					"path": "/sap.package/icon"
				},
				"packageI18n": {
					"tags": ["package"],
					"label": "Package I18n",
					"type": "string",
					"path": "/sap.package/i18n"
				},
				"packageTagKeywords": {
					"tags": ["package"],
					"label": "Tag Keywords",
					"type": "list",
					"path": "/sap.package/tags/keywords"
				},
				"packageTagTechnicalAttributes": {
					"tags": ["package"],
					"label": "Tag Technical Attributes",
					"type": "list",
					"path": "/sap.package/tags/technicalAttributes",
					"validators": {
						"technicalAttributesPattern": {
							"type": "patternList",
							"config": {
								"pattern": "^[A-Z0-9_\\-\\/]+$"
							}
						}
					}
				},
				"packageVendorID": {
					"tags": ["package"],
					"label": "Vendor ID",
					"type": "string",
					"path": "/sap.package/vendor/id"
				},
				"packageVendorName": {
					"tags": ["package"],
					"label": "Vendor Name",
					"type": "string",
					"path": "/sap.package/vendor/name"
				},
				"packageVendorLineOfBusiness": {
					"tags": ["package"],
					"label": "Vendor Line Of Business",
					"type": "string",
					"path": "/sap.package/vendor/lineOfBusiness"
				},
				"packageVendorURL": {
					"tags": ["package"],
					"label": "Vendor URL",
					"type": "string",
					"path": "/sap.package/vendor/url"
				},
				"packageScope": {
					"tags": ["package"],
					"label": "Package Scope",
					"type": "select",
					"path": "/sap.package/scope",
					"items": [
						{ "key": "internal" },
						{ "key": "external" }
					]
				},
				"packageSupportText": {
					"tags": ["package"],
					"label": "Support Text",
					"type": "string",
					"path": "/sap.package/support/text"
				},
				"packageSupportURL": {
					"tags": ["package"],
					"label": "Support URL",
					"type": "string",
					"path": "/sap.package/support/url"
				},
				"packageHomepageText": {
					"tags": ["package"],
					"label": "Homepage Text",
					"type": "string",
					"path": "/sap.package/homepage/text"
				},
				"packageHomepageURL": {
					"tags": ["package"],
					"label": "Homepage URL",
					"type": "string",
					"path": "/sap.package/homepage/url"
				},
				"packageDocumentationURL": {
					"tags": ["package"],
					"label": "Documentation URL",
					"type": "string",
					"path": "/sap.package/documentation/url"
				},
				"packageConsumption": {
					"tags": ["package"],
					"label": "Consumption",
					"type": "list",
					"path": "/sap.package/consumption"
				},
				"packageDependenciesProducts": {
					"tags": ["package"],
					"label": "Dependency on products",
					"type": "list",
					"path": "/sap.package/dependencies/products"
				},
				"packageDependenciesServices": {
					"tags": ["package"],
					"label": "Dependency on services",
					"type": "list",
					"path": "/sap.package/dependencies/services"
				}
			},
			propertyEditors: {
				"select" : "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
				"string" : "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				"simpleicon": "sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor",
				"list": "sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor"
			},
			"validators": {
				"patternList": "sap/ui/integration/designtime/cardEditor/validator/IsPatternMatchList"
			},
			i18n: [
				"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties",
				"sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
			]
		};
		var oCPEditor = new CardEditor({
			config: packageConfig,
			json: oManifest
		});
		oCPEditor.placeAt("CardEditor");
	});
});
