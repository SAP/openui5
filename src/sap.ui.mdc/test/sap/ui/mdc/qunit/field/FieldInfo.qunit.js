/* global QUnit */

sap.ui.define([
	"jquery.sap.global", "sap/ui/qunit/QUnitUtils", "sap/ui/Device", "sap/ui/mdc/enum/EditMode", "sap/ui/mdc/Field", "sap/ui/mdc/link/FlpLinkHandler", "sap/ui/core/util/MockServer", "sap/ui/mdc/link/FakeFlpConnector", "sap/ui/model/odata/v2/ODataModel", "sap/ui/mdc/link/ContactDetails", "sap/ui/mdc/field/FieldInfo", "sap/ui/mdc/link/LinkHandler", "sap/ui/mdc/link/LinkItem", "sap/ui/mdc/link/ContentHandler", "sap/m/Button"
], function (jQuery, qutils, Device, EditMode, Field, FlpLinkHandler, MockServer, FakeFlpConnector, ODataModel, ContactDetails, FieldInfo, LinkHandler, LinkItem, ContentHandler, Button) {
	"use strict";

	var oMockServer;

	function startMockServer(sMetadataPath, sMockdataBaseUrl, sRootUri) {
		oMockServer = new MockServer({
			rootUri: sRootUri
		});
		// configure
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: 1000
		});
		oMockServer.simulate(sMetadataPath, sMockdataBaseUrl);
		oMockServer.start();
	}

	function stopMockServer() {
		oMockServer.stop();
		oMockServer.destroy();
		oMockServer = null;
	}

	function enableFakeFlpConnector(oSetting) {
		FakeFlpConnector.enableFakeConnector(oSetting);
	}

	function disableFakeFlpConnector() {
		FakeFlpConnector.disableFakeConnector();
	}

	function destroyDistinctSemanticObjects() {
		FlpLinkHandler.destroyDistinctSemanticObjects();
	}

	QUnit.module("sap.ui.mdc.field.FieldInfo: API", {
		beforeEach: function () {
			this.oFieldInfo = new FieldInfo();
		},
		afterEach: function () {
			this.oFieldInfo.destroy();
		}
	});

	QUnit.test("Instance", function (assert) {
		assert.ok(this.oFieldInfo);
		assert.equal(this.oFieldInfo.getContentHandler(), null);
	});

	// ----------------------------------------------------------------------------------------------------------------
	// ------------------------------------- open popup ---------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------------------

	QUnit.module("sap.ui.mdc.field.FieldInfo: rendered as a text", {
		beforeEach: function () {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: EditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			stopMockServer();
			disableFakeFlpConnector();
			destroyDistinctSemanticObjects();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});
	var fnTestRenderAsAText = function (assert, oField) {
		// act
		var done = assert.async();
		var oFieldInfo = new FieldInfo({
			contentHandler: new ContentHandler({
				linkHandler: new FlpLinkHandler({
					semanticObjects: "SODummy"
				})
			}),
			dataUpdate: function () {
				// assert
				assert.equal(oField.$().find("a").length, 0);
				oField.getFieldInfo().getTriggerHref().then(function (sHref) {
					assert.equal(sHref, null);
					done();
				});
			}
		});
		// detach from modelContextChange as this will also fire the dataUpdate event
		oFieldInfo.detachEvent("modelContextChange", oFieldInfo._handleModelContextChange);
		oField.setFieldInfo(oFieldInfo);
	};
	QUnit.test("no semantic object, no content", function (assert) {
		enableFakeFlpConnector({});

		fnTestRenderAsAText(assert, this.oField);
	});
	QUnit.test("no semantic object, no content", function (assert) {
		enableFakeFlpConnector({
			SO1: {
				links: []
			}
		});

		fnTestRenderAsAText(assert, this.oField);
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open direct navigation", {
		beforeEach: function () {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: EditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			stopMockServer();
			disableFakeFlpConnector();
			destroyDistinctSemanticObjects();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});
	var fnTestOpenDirectNavigationWithTarget = function (assert, oField, oLinkHandler, sTarget) {
		// act
		var done = assert.async();
		var oFieldInfo = new FieldInfo({
			contentHandler: new ContentHandler({
				linkHandler: oLinkHandler
			}),
			dataUpdate: function () {
				// assert
				oField.getFieldInfo().getDirectLinkHrefAndTarget().then(function (oLinkItem) {
					// wait until mdc.Field has been re-created and sap.m.Link is rendered
					setTimeout(function () {
						assert.equal(oField.$().find("a").length, 1);
						assert.equal(oField.$().find("a")[0].text, "click me");
						assert.equal(oLinkItem.href, "#action01");
						assert.equal(oLinkItem.target, sTarget);
						done();
					}, 100);
				});
			},
			popoverAfterOpen: function () {

			}
		});
		oFieldInfo.detachEvent("modelContextChange", oFieldInfo._handleModelContextChange);
		oField.setFieldInfo(oFieldInfo);
	};

	var fnTestOpenDirectNavigation = function (assert, oField, oLinkHandler) {
		fnTestOpenDirectNavigationWithTarget(assert, oField, oLinkHandler, "_self");
	};

	QUnit.test("mainAction: with 'href'", function (assert) {
		enableFakeFlpConnector({
			SOMainActionWithHref: {
				links: [
					{
						intent: "#action01",
						action: "action01",
						isMain: true
					}
				]
			}
		});
		fnTestOpenDirectNavigation(assert, this.oField, new FlpLinkHandler({
			semanticObjects: "SOMainActionWithHref",
			sourceControl: this.oField
		}));
	});

	QUnit.test("direct link with target='_blank'", function (assert) {
		var sTarget = "_blank";
		enableFakeFlpConnector({});
		fnTestOpenDirectNavigationWithTarget(assert, this.oField, new LinkHandler({
			items: [
				new LinkItem({
					href: "#action01",
					target: sTarget
				})
			]
		}), sTarget);
	});
	// QUnit.test("mainAction: invisible with 'href'", function(assert) {
	// 	enableFakeFlpConnector({
	// 		SOMainActionWithText: {
	// 			links: [
	// 				{
	// 					intent: "#action01",
	// 					visible: false,
	// 					isMain: true
	// 				}
	// 			]
	// 		}
	// 	});
	// 	fnTestOpenDirectNavigation(assert, this.oField, new FlpLinkHandler({
	// 		semanticObjects: "SOMainActionWithText"
	// 	}));
	// });
	// QUnit.test("Action: invisible", function(assert) {
	// 	enableFakeFlpConnector({
	// 		SOActionWithInvisible: {
	// 			links: [
	// 				{
	// 					intent: "#action01",
	// 					visible: false
	// 				}
	// 			]
	// 		}
	// 	});
	// 	fnTestOpenDirectNavigation(assert, this.oField, new FlpLinkHandler({
	// 		semanticObjects: "SOActionWithInvisible"
	// 	}));
	// });
	QUnit.test("item: with 'href'", function (assert) {
		enableFakeFlpConnector({});
		fnTestOpenDirectNavigation(assert, this.oField, new FlpLinkHandler({
			items: [
				new LinkItem({
					href: "#action01"
				})
			]
		}));
	});
	// QUnit.test("item: invisible with 'href'", function(assert) {
	// 	enableFakeFlpConnector({});
	// 	fnTestOpenDirectNavigation(assert, this.oField, new FlpLinkHandler({
	// 		items: [
	// 			new LinkItem({
	// 				href: "#action01",
	// 				visible: false
	// 			})
	// 		]
	// 	}));
	// });

	QUnit.module("sap.ui.mdc.field.FieldInfo: open empty popover", {
		beforeEach: function () {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: EditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			stopMockServer();
			disableFakeFlpConnector();
			destroyDistinctSemanticObjects();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});
	var fnTestOpenEmptyPopover = function (assert, oField, oLinkHandler) {
		// act
		var done = assert.async();
		oField.setFieldInfo(new FieldInfo({
			contentHandler: new ContentHandler({
				linkHandler: oLinkHandler
			}),
			dataUpdate: function () {
				// assert
				oField.getFieldInfo().getTriggerHref().then(function (sHref) {
					// wait until mdc.Field has been re-created and sap.m.Link is rendered
					setTimeout(function () {
						assert.equal(oField.$().find("a").length, 1);
						assert.equal(sHref, null);

						qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
							srcControl: jQuery(oField.$().find("a")[0]).control(0)
						});
					}, 100);

				});
			},
			popoverAfterOpen: function (oEvent) {
				assert.equal(oEvent.getSource()._oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 1);
				done();
			}
		}));
	};
	QUnit.test("no links, no content", function (assert) {
		enableFakeFlpConnector({
			SO1: {
				links: []
			}
		});
		fnTestOpenEmptyPopover(assert, this.oField, new FlpLinkHandler({
			semanticObjects: "SO1"
		}));
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open not empty popover", {
		beforeEach: function () {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: EditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			stopMockServer();
			disableFakeFlpConnector();
			destroyDistinctSemanticObjects();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});
	var fnTestOpenNotEmptyPopover = function (assert, oField, oLinkHandler, oAdditionalContent, fnCheckPopover) {
		// act
		var done = assert.async();
		oField.setFieldInfo(new FieldInfo({
			contentHandler: new ContentHandler({
				linkHandler: oLinkHandler,
				additionalContent: oAdditionalContent
			}),
			dataUpdate: function () {
				// assert
				oField.getFieldInfo().getTriggerHref().then(function (sHref) {

					// wait until mdc.Field has been re-created and sap.m.Link is rendered
					setTimeout(function () {
						assert.equal(oField.$().find("a").length, 1);
						assert.equal(sHref, null);
						qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
							srcControl: jQuery(oField.$().find("a")[0]).control(0)
						});
					}, 100);

				});
			},
			popoverAfterOpen: function (oEvent) {
				var oFieldInfo = oEvent.getSource();
				fnCheckPopover(oFieldInfo);
				done();
			}
		}));
	};
	QUnit.test("mainAction: with 'text'", function (assert) {
		enableFakeFlpConnector({
			SOMainActionWithText: {
				links: [
					{
						text: "action 01",
						action: "displayFactSheet"
					}
				]
			}
		});

		fnTestOpenNotEmptyPopover(assert, this.oField, new FlpLinkHandler({
			textOfMainItem: "main action",
			mainSemanticObject: "SOMainActionWithText",
			semanticObjects: "SOMainActionWithText"
		}), null, function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 1);
			assert.equal(oPopover.$().find(".sapMLabel:visible")[0].textContent, "main action");
		});
	});
	// QUnit.test("Action: with 'text'", function(assert) {
	// 	enableFakeFlpConnector({
	// 		SOActionsWithText: {
	// 			links: [
	// 				{
	// 					text: "action 01",
	// 					action: "action01"
	// 				}, {
	// 					text: "action 02",
	// 					action: "action02"
	// 				}
	// 			]
	// 		}
	// 	});
	//
	// 	fnTestOpenNotEmptyPopover(assert, this.oField, new FlpLinkHandler({
	// 		semanticObjects: "SOActionsWithText"
	// 	}), null, function(oFieldInfo) {
	// 		var oPopover = oFieldInfo.getDependents()[0];
	// 		assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
	// 		assert.equal(oPopover.$().find("a").length, 0);
	// 		assert.equal(oPopover.$().find(".sapMLabel:visible").length, 2);
	// 		assert.equal(oPopover.$().find(".sapMLabel:visible")[0].textContent, "action 01", "Available action");
	// 		assert.equal(oPopover.$().find(".sapMLabel:visible")[1].textContent, "action 02", "Available action");
	// 	});
	// });
	QUnit.test("mainAction with 'href' and action with 'href'", function (assert) {
		enableFakeFlpConnector({
			SOMainActionWithHrefAndActionWithHref: {
				links: [
					{
						intent: "#action01",
						action: "action01"
					}, {
						intent: "#action02",
						action: "displayFactSheet"
					}
				]
			}
		});
		fnTestOpenNotEmptyPopover(assert, this.oField, new FlpLinkHandler({
			textOfMainItem: "main action",
			semanticObjects: "SOMainActionWithHrefAndActionWithHref",
			mainSemanticObject: "SOMainActionWithHrefAndActionWithHref"
		}), null, function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 0);
			assert.equal(oPopover.$().find("a").length, 1);
			assert.equal(oPopover.$().find("a")[0].text, "main action");
			assert.ok(oPopover.$().find("a")[0].href.indexOf("#action02") > -1, "Available action");
		});
	});
	QUnit.test("item: with 'text'", function (assert) {
		enableFakeFlpConnector({});
		fnTestOpenNotEmptyPopover(assert, this.oField, new FlpLinkHandler({
			items: [
				new LinkItem({
					text: "Link Item 01"
				})
			]
		}), null, function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 1);
			assert.equal(oPopover.$().find(".sapMLabel:visible")[0].textContent, "Link Item 01", "Available action");
		});
	});
	QUnit.test("content", function (assert) {
		enableFakeFlpConnector({});
		fnTestOpenNotEmptyPopover(assert, this.oField, null, new ContactDetails(), function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 0);
		});
	});
	QUnit.test("multiple content", function (assert) {
		enableFakeFlpConnector({});
		fnTestOpenNotEmptyPopover(assert, this.oField, null, [
			new ContactDetails(), new Button({
				text: "Additional Button"
			})
		], function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 0);
		});
	});
	QUnit.test("content and mainAction with 'text'", function (assert) {
		enableFakeFlpConnector({
			SOMainActionWithText: {
				links: [
					{
						text: "action 01",
						action: "displayFactSheet"
					}
				]
			}
		});
		fnTestOpenNotEmptyPopover(assert, this.oField, new FlpLinkHandler({
			textOfMainItem: "main action",
			semanticObjects: "SOMainActionWithText",
			mainSemanticObject: "SOMainActionWithText"
		}), new ContactDetails(), function (oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 1);
			assert.equal(oPopover.$().find(".sapMLabel:visible")[0].textContent, "main action");
		});
	});

});
