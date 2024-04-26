/* global QUnit, sinon */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press"
], async function (Core, opaTest, Opa5, Properties, Ancestor, Press) {
	"use strict";

	await Core.ready();

	var sViewName = "DemoApps";

	// set the cookie that states the user already set cookie preferences,
	// to prevent the cookie settings dialog interfere the test
	document.cookie = "dk_approval_requested=1";

	Opa5.extendConfig({
		viewNamespace: "sap.ui.documentation.sdk.view.",
		autoWait: true
	});

	opaTest("Should see at least 10 demo apps cards", function (Given, When) {

		// Needed for hash based navigation for the test to work properly
		window['sap-ui-documentation-static'] = true;

		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.documentation.sdk",
				settings: {
					id: "demokit"
				},
				manifest: true
			},
			hash: "demoapps"
		});

		When.waitFor({
			viewName: sViewName,
			controlType: "sap.f.Card",
			matchers: function (oCard) {
				return oCard.$().hasClass("sapUiDemoKitDemoAppsRegularCard");
			},
			success: function (aItems) {
				Opa5.assert.ok(aItems.length >= 10, "Found at least 10 demo apps");
			},
			errorMessage: "Did not find any demo apps"
		});
	});

	opaTest("Should display the category headers", function (Given, When, Then) {
		Then.waitFor({
			viewName: sViewName,
			controlType: "sap.m.Title",
			matchers: function (oTitle) {
				return oTitle.$().hasClass("sapUiDemoKitDemoAppsCategoryTitle");
			},
			success: function (aCells) {
				Opa5.assert.ok(aCells.length > 0, "Found at least one category header");
			},
			errorMessage: "Did not find any category headers"
		});
	});

	opaTest("Should parse and display the metadata correctly", function (Given, When, Then) {
		Then.waitFor({
			viewName: sViewName,
			controlType: "sap.f.Card",
			matchers: function (oCard) {
				var $Card = oCard.$(),
					$TitleElement = $Card.find('.sapFCardHeader .sapFCardTitle > span');

				return $TitleElement.text() === 'Shopping Cart';
			},
			success: function (aCards) {
				var oCard = aCards[0], oData;

				try {
					oData = oCard.getModel().getProperty("/demoApps").filter(function (oData) {
						return oData.name === "Shopping Cart";
					})[0];
				} catch (oException) {
					Opa5.assert.ok(false, "The shopping cart metadata could not be found");
				}

				// icon
				Then.waitFor({
					viewName: sViewName,
					controlType: "sap.f.cards.Header",
					matchers: [
						new Properties({ iconSrc: "sap-icon://" + oData.icon })
					],
					success: function () {
						Opa5.assert.ok(true, "The icon \"" + oData.icon + "\" is displayed correctly");
					}
				});

				// title
				Then.waitFor({
					viewName: sViewName,
					controlType: "sap.f.cards.Header",
					matchers: [
						new Properties({
							title: oData.name
						})
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
						new Ancestor(oCard),
						new Properties({ text: oData.desc })
					],
					success: function () {
						Opa5.assert.ok(true, "The description \"" + oData.desc + "\" is displayed correctly");
					}
				});

				// further links
				for (var i = 0; i < oData.links.length; i++) {
					var oLink = oData.links[i];
					Then.waitFor({
						viewName: sViewName,
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oCard),
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
			}
		});

		opaTest("Should see at least 10 download buttons", function (Given, When, Then) {
			Then.waitFor({
				viewName: sViewName,
				controlType: "sap.m.Button",
				matchers: function (oButton) {
					return oButton.$().hasClass("sapUiDemoKitDemoAppsCardDownloadButton");
				},
				success: function (aItems) {
					Opa5.assert.ok(aItems.length >= 10, "Found at least 10 download buttons");
				}
			});
		});

		opaTest("Should be able to download all apps", function (Given, When, Then) {
			var fnCreateArchive;
			var fnHandleError;

			When.waitFor({
				viewName: sViewName,
				id: "sapUiDemoKitDemoAppsPage",
				success: function (oPage) {
					var oController = oPage.getParent().getController();
					fnCreateArchive = sinon.stub(oController, "createArchive", function () { });
					fnHandleError = sinon.stub(oController, "handleError", function () { });
				}
			});

			When.waitFor({
				viewName: sViewName,
				controlType: "sap.m.Button",
				matchers: function (oButton) {
					return oButton.$().hasClass("sapUiDemoKitDemoAppsCardDownloadButton");
				},
				success: function (aDownloadButtons) {
					aDownloadButtons.forEach(function (oButton) {
						Then.waitFor({
							success: function () {
								sinon.assert.notCalled(fnHandleError);
								if (fnHandleError.callCount > 0) {
									Opa5.stopQueue();
								}
							}
						});

						When.waitFor({
							viewName: sViewName,
							controlType: "sap.m.Button",
							matchers: new Properties({ id: oButton.getId() }),
							actions: new Press()
						});
					});

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
	});

	QUnit.start();
});