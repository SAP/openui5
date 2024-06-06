sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/SkeletonCard"
], function (Controller, SkeletonCard) {
	"use strict";

	var aManifests = {
		"objectCard": {
			path: "sap/f/cardsdemo/bundles/objectbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/objectbundle/"
		},
		"objectCardFormInputs": {
			path: "sap/f/cardsdemo/cardcontent/objectContent/formWithValidations.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/objectContent/"
		},
		"calendarCard": {
			path: "sap/f/cardsdemo/bundles/calendarbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/calendarbundle/"
		},
		"listCard": {
			path: "sap/f/cardsdemo/bundles/listbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/listbundle/"
		},
		"listCardGrouping": {
			path: "sap/f/cardsdemo/cardcontent/listContent/groups.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"listCardNoData": {
			path: "sap/f/cardsdemo/cardcontent/listContent/noData.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"listCardBulletGraphActions": {
			path: "sap/f/cardsdemo/cardcontent/listContent/bulletGraphAndActions.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"dynamicStatusText": {
			path: "sap/f/cardsdemo/bundles/dynamicStatusTextBundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/dynamicStatusTextBundle/"
		},
		"stackedBar": {
			path: "sap/f/cardsdemo/cardcontent/listContent/stackedBar.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"withDataError": {
			path: "sap/f/cardsdemo/cardcontent/listContent/withDataError.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listContent/"
		},
		"tableCard1": {
			path: "sap/f/cardsdemo/bundles/tablebundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/tablebundle/"
		},
		"tableCard2": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/bindings.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"tableCardGroups": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/groups.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"tableCardNoData": {
			path: "sap/f/cardsdemo/cardcontent/tablecontent/noData.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/tableContent/"
		},
		"timelineCard": {
			path: "sap/f/cardsdemo/bundles/timelinebundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/timelinebundle/"
		},
		"filtersCard": {
			path: "sap/f/cardsdemo/cardcontent/cardFilters/manifest.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/cardFilters/"
		},
		"cardWithSevereError": {
			path: "sap/f/cardsdemo/cardcontent/withSevereError.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/"
		},
		"cardWithExtension": {
			path: "sap/f/cardsdemo/cardcontent/withExtension.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/"
		}
	};

	return Controller.extend("sap.f.cardsdemo.controller.ManifestResolver", {

		onInit: function () {
			this.onManifestChange();
		},

		onManifestChange: function () {
			var sSelectedKey = this.byId("manifestId").getSelectedKey(),
				oManifest = aManifests[sSelectedKey];

			this.byId("baseUrlInp").setValue(sap.ui.require.toUrl(oManifest.baseUrl));

			fetch(sap.ui.require.toUrl(oManifest.path))
				.then(function (res) {
					return res.json();
				})
				.then(function (manifest) {
					this.byId("editor").setValue(JSON.stringify(manifest, null, "\t"));
				}.bind(this));
		},

		onResolveManifestPress: function () {
			this.resolveManifest();
		},

		resolveManifest: function () {
			var oCard = new SkeletonCard({
					manifest: JSON.parse(this.byId("editor").getValue()),
					baseUrl: this.byId("baseUrlInp").getValue()
				}),
				errorOutput = this.byId("error"),
				output = this.byId("output");

			errorOutput.setVisible(false);
			output.setValue("");

			oCard.attachStateChanged(function () {
				oCard.resolveManifest()
					.then(function (res) {
						output.setValue(JSON.stringify(res, null, "\t"));
					});
			});

			oCard.startManifestProcessing();
		}
	});
});