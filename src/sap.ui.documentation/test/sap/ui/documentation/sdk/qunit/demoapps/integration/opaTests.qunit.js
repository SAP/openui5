/* global QUnit,sinon */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		'sap/ui/test/opaQunit',
		'sap/ui/test/Opa5',
		'sap/ui/test/Opa',
		'sap/ui/test/matchers/Properties',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/test/matchers/Ancestor',
		'sap/ui/test/actions/Press'
	], function (opaTest, Opa5, Opa, Properties, BindingPath, Ancestor, Press) {

		var sViewName = "DemoApps";

		Opa5.extendConfig({
			viewNamespace: "sap.ui.documentation.sdk.view.",
			autoWait: true
		});

		opaTest("Should see at least 5 demo app cells", function (Given, When) {

			// Needed for hash based navigation for the test to work properly
			window['sap-ui-documentation-static'] = true;

			Given.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk",
					settings : {
						id : "demokit"
					},
					manifest: true
				},
				hash: "demoapps"
			});

			When.waitFor({
				viewName: sViewName,
				controlType: "sap.ui.layout.BlockLayoutCell",
				success: function (aBlockLayoutCells) {
					// 5 cells are there by definition (header + 4 categories) so we need at least 10 cells
					Opa5.assert.ok(aBlockLayoutCells.length >= 10, "More than 10 BlockLayoutCells are displayed");
				}
			});
		});

		opaTest("Should display the category headers", function (Given, When, Then) {
			Then.waitFor({
				viewName: sViewName,
				controlType: "sap.m.Panel",
				matchers: function (oCell) {
					var oToolbar = oCell.getHeaderToolbar();
					return (oToolbar ? oToolbar.hasStyleClass("headlineCell") : false);
				},
				success: function (aCells) {
					Opa5.assert.ok(aCells.length >= 3, "There are at least 3 category cells displayed");
				}
			});
		});

		opaTest("Should parse and display the metadata correctly", function (Given, When, Then) {
			Then.waitFor({
				viewName: sViewName,
				controlType: "sap.ui.layout.BlockLayoutCell",
				matchers: function (oCell) {
					var oTitle = oCell.$().find(".sapMTitle").html();
					return (oTitle ? oTitle.search("Shopping Cart") >= 0 : false);
				},
				success: function (aCells) {
					var oCell = aCells[0];
					var oData;
					try {
						oData = oCell.getModel().getProperty("/demoApps").filter(function (oData) { return oData.name === "Shopping Cart"; })[0];
					} catch (oException) {
						Opa5.assert.ok(false, "The shopping cart metadata could not be found");
					}

					// icon
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.ui.core.Icon",
						matchers: [
							new Ancestor(oCell),
							new Properties({src: "sap-icon://" + oData.icon})
						],
						success: function () {
							Opa5.assert.ok(true, "The icon \"" + oData.icon + "\" is displayed correctly");
						}
					});

					// title
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Title",
						matchers: [
							new Ancestor(oCell),
							new Properties({text: oData.name})
						],
						success: function () {
							Opa5.assert.ok(true, "The title \"" + oData.name + "\" is displayed correctly");
						}
					});

					// desc
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Text",
						matchers: [
							new Ancestor(oCell),
							new Properties({text: oData.desc})
						],
						success: function () {
							Opa5.assert.ok(true, "The description \"" + oData.desc + "\" is displayed correctly");
						}
					});

					// main link
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.ui.documentation.sdk.controls.TitleLink",
						matchers: [
							new Ancestor(oCell),
							new Properties({
								text: oData.name,
								href: oData.ref
							})
						],
						success: function () {
							Opa5.assert.ok(true, "The main link \"" + oData.ref + "\" is displayed correctly");
						}
					});

					// further links
					for (var i = 0; i < oData.links.length; i++) {
						var oLink = oData.links[i];
						Then.waitFor({
							viewName: sViewName,
							controlType: "sap.m.Link",
							matchers: [
								new Ancestor(oCell),
								new Properties({
									text: oData.links[i].name,
									href: oData.links[i].ref
								})
							],
							/* eslint-disable no-loop-func */
							success: function () {
								Opa5.assert.ok(true, "The link \"" + oLink.name + "\" is displayed correctly");
							}
							/* eslint-enable no-loop-func */
						});
					}

					// teaser
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.m.List",
						matchers: [
							new Ancestor(oCell)
						],
						success: function () {
							Opa5.assert.ok(true, "The teaser \"" + oData.teaser + "\" is displayed correctly");
						}
					});

					// library link
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oCell),
							new Properties({text: oData.lib})
						],
						success: function () {
							Opa5.assert.ok(true, "The library link \"" + oData.lib + "\" is displayed correctly");
						}
					});

				}
			});
		});

		opaTest("Should see the download button", function (Given, When, Then) {
			Then.waitFor({
				viewName: sViewName,
				id: "download",
				success: function () {
					Opa5.assert.ok(true, "The download button is visible");
				}
			});
		});

		opaTest("Should be able to download all apps", function (Given, When, Then) {
			var fnCreateArchive;
			var fnHandleError;

			When.waitFor({
				viewName : sViewName,
				id : "demoAppsPage",
				success: function (oPage) {
					var oController = oPage.getParent().getController();
					fnCreateArchive = sinon.stub(oController, "_createArchive", function () {});
					fnHandleError = sinon.stub(oController, "_handleError", function () {});
				}
			});

			// press the download button once
			var oDownloadButton = {
				viewName: sViewName,
				id: "download",
				actions: new Press()
			};
			When.waitFor(oDownloadButton);

			// download all apps
			When.waitFor({
				viewName: sViewName,
				controlType: "sap.m.ListItemBase",
				searchOpenDialogs: true,
				success: function (aListItems) {
					// close dialog
					When.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Button",
						matchers: new Properties({ text: "Cancel" }),
						actions: new Press()
					});

					// loop over the demo apps and download each
					aListItems.forEach(function (oListItem) {
						Then.waitFor({
							success: function () {
								sinon.assert.notCalled(fnHandleError);
								if (fnHandleError.callCount > 0) {
									Opa.stopQueue();
								}
							}
						});

						When.waitFor(oDownloadButton);

						When.waitFor({
							viewName: sViewName,
							controlType: "sap.m.ListItemBase",
							matchers: new BindingPath({path: oListItem.getBindingContext().getPath()}),
							actions: new Press()
						});
					});

					// final check and cleanup
					Then.waitFor({
						success: function () {
							sinon.assert.notCalled(fnHandleError);
							Opa5.assert.ok(true, "All downloads worked");
							fnHandleError.restore();
							fnCreateArchive.restore();
						}
					});

					Then.iTeardownMyApp();
				}
			});
		});

		QUnit.start();
	});
});