sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/demo/iconexplorer/test/integration/pages/Common"
], function(Opa5, Press, Properties, Ancestor, Common) {
	"use strict";

	var sViewName = "Overview",
		sPreviewId = "preview",
		sPreviewIconId = "previewIcon";

	Opa5.createPageObjects({
		onThePreviewPage: {
			baseClass: Common,

			actions: {
				iPressTheCloseButton: function () {
					return this.waitFor({
						id: "closePreview",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Did not find the close preview button"
					});
				},

				iCopyToClipBoard: function () {
					return this.waitFor({
						id: "previewCopy",
						viewName: sViewName,
						success: function (oControl) {
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oControl),
									new Properties({icon: "sap-icon://copy"})
								],
								actions: new Press()
							});
						},
						errorMessage: "Did not find the copy button"
					});
				}
			},

			assertions: {
				iShouldSeeTheIcon: function (sName) {
					return this.waitFor({
						id: sPreviewIconId,
						viewName: sViewName,
						matchers: new Properties({
							src: "sap-icon://" + sName
						}),
						success: function (oIcon) {
							Opa5.assert.ok(true, "The icon \"" + sName + "\" is shown in the preview area");
						},
						errorMessage: "Did not display the icon \"" + sName + "\" in the preview area"
					});
				},

				iShouldSeeTheRememberedObject: function() {
					return this.waitFor({
						success: function() {
							return this.iShouldSeeTheIcon(this.getContext().currentItem.name);
						}
					});
				},

				iShouldSeeARandomIcon: function () {
					return this.waitFor({
						id: sPreviewIconId,
						viewName: sViewName,
						matchers: function (oIcon) {
							return oIcon.getSrc().replace("sap-icon://", "").length > 0;
						},
						success: function () {
							Opa5.assert.ok(true, "A random icon is shown in the preview area");
						},
						errorMessage: "Did not display a random icon in the preview area"
					});
				},

				iShouldSeeThePreviewArea: function () {
					return this.waitFor({
						id: sPreviewId,
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The preview area is visible");
						},
						errorMessage: "The preview area is not visible"
					});
				},

				iShouldNotSeeThePreviewArea: function () {
					return this.waitFor({
						id: sPreviewId,
						viewName: sViewName,
						visible: false,
						matchers: new Properties({
							visible: false
						}),
						success: function () {
							Opa5.assert.ok(true, "The preview area is not visible");
						},
						errorMessage: "The preview area is visible"
					});
				},

				iShouldSeeTheCopyArea: function () {
					return this.waitFor({
						id: "previewCopy",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The copy area is visible");
						},
						errorMessage: "The copy area is not visible"
					});
				},

				iShouldSeeTheUseCasesArea: function () {
					return this.waitFor({
						id: "previewUseCases",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The use cases area is visible");
						},
						errorMessage: "The use cases area is not visible"
					});
				},

				iShouldSeeTheInfoArea: function () {
					return this.waitFor({
						id: "previewInfo",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The info area is visible");
						},
						errorMessage: "The info area is not visible"
					});
				},

				iShouldSeeTheUnicodeInfo: function () {
					return this.waitFor({
						id: "unicodeInfo",
						viewName: sViewName,
						success: function (oControl) {
							Opa5.assert.ok(oControl.getText().length > 4, "The unicode is displayed");
						},
						errorMessage: "The unicode info is not displayed"
					});
				},

				iShouldSeeTheCategoryInfo: function () {
					return this.waitFor({
						id: "categoryInfo",
						viewName: sViewName,
						success: function (oControl) {
							Opa5.assert.ok(oControl.getText().length > 0, "The category info is displayed");
						},
						errorMessage: "The category info is not displayed"
					});
				}
			}

		}

	});

});