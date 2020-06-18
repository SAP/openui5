/* global QUnit, sinon */

QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/mdc/link/FlpLinkHandler", "sap/ui/mdc/link/LinkItem","sap/ui/mdc/link/FakeFlpConnector", "sap/ui/mdc/link/SemanticObjectMapping", "sap/ui/mdc/link/SemanticObjectMappingItem", "sap/ui/mdc/link/SemanticObjectUnavailableAction", "sap/base/Log"
], function(FlpLinkHandler, LinkItem, FakeFlpConnector, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, SapBaseLog) {
	"use strict";

	QUnit.module("sap.ui.mdc.FlpLinkHandler: API", {
		beforeEach: function() {
			this.oFlpLinkHandler = new FlpLinkHandler();
		},
		afterEach: function() {
			this.oFlpLinkHandler.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(this.oFlpLinkHandler);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjects(), []);
		assert.equal(this.oFlpLinkHandler.getMainSemanticObject(), undefined);
		assert.equal(this.oFlpLinkHandler.getTextOfMainItem(), undefined);
		assert.equal(this.oFlpLinkHandler.getDescriptionOfMainItem(), undefined);
		assert.equal(this.oFlpLinkHandler.getIconOfMainItem(), undefined);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjectMappings(), []);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjectUnavailableActions(), []);

		assert.deepEqual(this.oFlpLinkHandler.getModifyItemsCallback(), undefined);
		assert.deepEqual(this.oFlpLinkHandler.getItems(), []);
		assert.deepEqual(this.oFlpLinkHandler.getSourceControl(), null);
	});

	QUnit.module("sap.ui.mdc.FlpLinkHandler: 'semanticObjects'", {
		beforeEach: function() {
			// startMockServer("test-resources/sap/ui/mdc/qunit/flplinkhandler/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/flplinkhandler/mockserver/", "/odataFake/");
			// this.oODataModel = new ODataModel("/odataFake/");
			this.oFlpLinkHandler;
		},
		afterEach: function() {
			// stopMockServer();
			this.oFlpLinkHandler.destroy();
			// this.oODataModel.destroy();
		}
	});
	QUnit.test("semanticObjects and semanticObjectMapping with empty collection", function(assert) {
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SO1",
			semanticObjectMappings: new SemanticObjectMapping({
				semanticObject: "SO1"
			})
		});
		// this.oFlpLinkHandler.setModel(this.oODataModel);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjects(), [
			"SO1"
		]);
		assert.deepEqual(this.oFlpLinkHandler._convertSemanticObjectMapping(), {
			SO1: {}
		});
	});
	QUnit.test("semanticObject and semanticObjectMapping with qualifier", function(assert) {
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: [
				"SO1", "SOAdd"
			],
			semanticObjectMappings: [
				new SemanticObjectMapping({
					semanticObject: "SO1",
					items: new SemanticObjectMappingItem({
						key: "SupplierId",
						value: "SupplierIdOfSO1"
					})
				}), new SemanticObjectMapping({
					semanticObject: "SOAdd",
					items: new SemanticObjectMappingItem({
						key: "SupplierId",
						value: "SupplierIdOfSOAdd"
					})
				})
			]
		});
		// this.oFlpLinkHandler.setModel(this.oODataModel);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjects(), [
			"SO1", "SOAdd"
		]);
		assert.deepEqual(this.oFlpLinkHandler._convertSemanticObjectMapping(), {
			SO1: {
				SupplierId: "SupplierIdOfSO1"
			},
			SOAdd: {
				SupplierId: "SupplierIdOfSOAdd"
			}
		});
	});
	QUnit.test("only semanticObject", function(assert) {
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SO1"
		});
		// this.oFlpLinkHandler.setModel(this.oODataModel);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjects(), [
			"SO1"
		]);
		assert.deepEqual(this.oFlpLinkHandler.getSemanticObjectMappings(), []);
	});

	QUnit.module("sap.ui.mdc.FlpLinkHandler: calculateSemanticAttributes", {
		beforeEach: function() {
			this.oContextObject = {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			};
		},
		afterEach: function() {
		}
	});
	QUnit.test("without semanticObjectMappings", function(assert) {
		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		assert.deepEqual(new FlpLinkHandler().calculateSemanticAttributes(), {
			"": {}
		});

		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				""
			],
			semanticObjectMappings: []
		}).calculateSemanticAttributes(this.oContextObject), {
			"": {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: null,
			semanticObjectMappings: []
		}).calculateSemanticAttributes(this.oContextObject), {
			"": {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault"
			],
			semanticObjectMappings: undefined
		}).calculateSemanticAttributes(this.oContextObject), {
			SODefault: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault"
			],
			semanticObjectMappings: []
		}).calculateSemanticAttributes(undefined), {
			SODefault: {}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault"
			],
			semanticObjectMappings: []
		}).calculateSemanticAttributes(null), {
			SODefault: {}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault", "SOAdditional"
			],
			semanticObjectMappings: undefined
		}).calculateSemanticAttributes(this.oContextObject), {
			SODefault: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			},
			SOAdditional: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			}
		});
	});
	QUnit.test("with semanticObjectMappings", function(assert) {
		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault"
			],
			semanticObjectMappings: []
		}).calculateSemanticAttributes(this.oContextObject), {
			SODefault: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierId: "1234567890.0"
			}
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault"
			],
			semanticObjectMappings: new SemanticObjectMapping({
				semanticObject: "SODefault",
				items: [
					new SemanticObjectMappingItem({
						key: "SupplierId",
						value: "SupplierIdOfSODefault"
					})
				]
			})
		}).calculateSemanticAttributes(this.oContextObject), {
			SODefault: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierIdOfSODefault: "1234567890.0"
			}
		});
	});
	QUnit.test("with semanticObjectMapping qualifier", function(assert) {
		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});
		assert.deepEqual(new FlpLinkHandler({
			semanticObjects: [
				"SODefault", "SOAdditional"
			],
			semanticObjectMappings: [
				new SemanticObjectMapping({
					semanticObject: "SODefault",
					items: [
						new SemanticObjectMappingItem({
							key: "SupplierId",
							value: "SupplierIdOfSODefault"
						})
					]
				}), new SemanticObjectMapping({
					semanticObject: "SOAdditional",
					items: [
						new SemanticObjectMappingItem({
							key: "SupplierId",
							value: "SupplierIdOfSOAdditional"
						})
					]
				})
			]
		}).calculateSemanticAttributes(this.oContextObject), {
			SODefault: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierIdOfSODefault: "1234567890.0"
			},
			SOAdditional: {
				Category: "Monitor",
				ContactName: "Mr. John Doe",
				ProductPicUrl: "http://dummy.com",
				SupplierIdOfSOAdditional: "1234567890.0"
			}
		});
	});
	QUnit.module("sap.ui.mdc.FlpLinkHandler: 'retrieveNavigationTargets'", {
		beforeEach: function() {
			this.oFlpLinkHandler;
			FakeFlpConnector.enableFakeConnector({
				SemanticObjectEmpty: {
					links: []
				},
				SemanticObjectDisplayFactSheet: {
					links: [
						{
							action: "displayFactSheet",
							intent: "?SemanticObjectDisplayFactSheet_00#/dummyLink",
							text: "Fact Sheet"
						}
					]
				},
				SemanticObjectAnyAction: {
					links: [
						{
							action: "action_00",
							intent: "?SemanticObjectAnyAction_00#/dummyLink",
							text: "action 00"
						}
					]
				},
				SemanticObjectTwoIntents: {
					links: [
						{
							action: "action_00",
							intent: "?SemanticObjectTwoIntents_00#/dummyLink1",
							text: "action 00"
						}, {
							action: "action_01",
							intent: "?SemanticObjectTwoIntents_01#/dummyLink2",
							text: "action 01"
						}
					]
				}
			});
		},
		afterEach: function() {
			FakeFlpConnector.disableFakeConnector();
			this.oFlpLinkHandler.destroy();
		}
	});
	QUnit.test("CrossApplicationNavigation service not available", function(assert) {
		var fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error").withArgs("FlpLinkHandler: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
		FakeFlpConnector.disableFakeConnector();
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SemanticObjectEmpty"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.ok(fnSapLogErrorSpy.withArgs("FlpLinkHandler: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained").called);
			assert.equal(oOwnNavigationLink, null);
			assert.deepEqual(aLinks, []);

			done();
			SapBaseLog.error.restore();
		});
	});

	QUnit.test("CrossApplicationNavigation service returns empty links", function(assert) {
		var fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error");
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SemanticObjectEmpty"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.notOk(fnSapLogErrorSpy.called);
			assert.equal(oOwnNavigationLink, null);
			assert.deepEqual(aLinks, []);

			done();
			SapBaseLog.error.restore();
		});
	});
	QUnit.test("CrossApplicationNavigation service returns one link with action 'displayFactSheet'", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SemanticObjectDisplayFactSheet"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectDisplayFactSheet_00#/dummyLink");
			assert.equal(aLinks[0].getText(), "Fact Sheet");
			assert.equal(aLinks[0].getIsMain(), false);
			done();
		});
	});
	QUnit.test("CrossApplicationNavigation service returns one link with action 'displayFactSheet' with defined main semantic object", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			mainSemanticObject: "SemanticObjectDisplayFactSheet",
			semanticObjects: "SemanticObjectDisplayFactSheet"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectDisplayFactSheet_00#/dummyLink");
			assert.equal(aLinks[0].getText(), "Fact Sheet");
			assert.equal(aLinks[0].getIsMain(), true);
			done();
		});
	});
	QUnit.test("CrossApplicationNavigation service returns one link with any action", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SemanticObjectAnyAction"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectAnyAction_00#/dummyLink");
			assert.equal(aLinks[0].getText(), "action 00");
			assert.equal(aLinks[0].getIsMain(), false);
			done();
		});
	});
	QUnit.test("CrossApplicationNavigation service returns two links with any actions", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SemanticObjectTwoIntents"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 2);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
			assert.equal(aLinks[0].getText(), "action 00");
			assert.equal(aLinks[0].getIsMain(), false);
			assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
			assert.equal(aLinks[1].getText(), "action 01");
			assert.equal(aLinks[1].getIsMain(), false);
			done();
		});
	});
	QUnit.test("different SemanticObjects", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			mainSemanticObject: "SemanticObjectDisplayFactSheet",
			semanticObjects: [
				"SemanticObjectDisplayFactSheet", "SemanticObjectTwoIntents"
			]
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 3);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectDisplayFactSheet_00#/dummyLink");
			assert.equal(aLinks[0].getText(), "Fact Sheet");
			assert.equal(aLinks[0].getIsMain(), true);
			assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
			assert.equal(aLinks[1].getText(), "action 00");
			assert.equal(aLinks[1].getIsMain(), false);
			assert.equal(aLinks[2].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
			assert.equal(aLinks[2].getText(), "action 01");
			assert.equal(aLinks[2].getIsMain(), false);
			done();
		});
	});

	QUnit.module("sap.ui.mdc.FlpLinkHandler: 'retrieveNavigationTargets' and main item", {
		beforeEach: function() {
			this.oFlpLinkHandler;
			FakeFlpConnector.enableFakeConnector({
				SemanticObjectDisplayFactSheet: {
					links: [
						{
							action: "displayFactSheet",
							intent: "?SemanticObjectDisplayFactSheet_00#/dummyLink",
							text: "Fact Sheet"
						}
					]
				}
			});
		},
		afterEach: function() {
			FakeFlpConnector.disableFakeConnector();
			this.oFlpLinkHandler.destroy();
		}
	});
	QUnit.test("Only main information via API", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			mainSemanticObject: "SemanticObjectDisplayFactSheet",
			semanticObjects: "SemanticObjectDisplayFactSheet",
			textOfMainItem: "main item",
			descriptionOfMainItem: "description of main item"
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectDisplayFactSheet_00#/dummyLink");
			assert.equal(aLinks[0].getText(), "main item");
			assert.equal(aLinks[0].getDescription(), "description of main item");
			assert.equal(aLinks[0].getIsMain(), true);
			done();
		});
	});

	QUnit.module("sap.ui.mdc.FlpLinkHandler: 'semanticObjectUnavailableActions'", {
		beforeEach: function() {
			this.oFlpLinkHandler;
			FakeFlpConnector.enableFakeConnector({
				SemanticObjectTwoIntents: {
					links: [
						{
							action: "action_00",
							intent: "?SemanticObjectTwoIntents_00#/dummyLink1",
							text: "action 00"
						}, {
							action: "action_01",
							intent: "?SemanticObjectTwoIntents_01#/dummyLink2",
							text: "action 01"
						}
					]
				}
			});
		},
		afterEach: function() {
			FakeFlpConnector.disableFakeConnector();
			this.oFlpLinkHandler.destroy();
		}
	});
	QUnit.test("Dummy semantic object", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			mainSemanticObject: "SemanticObjectTwoIntents",
			semanticObjects: "SemanticObjectTwoIntents",
			semanticObjectUnavailableActions: new SemanticObjectUnavailableAction({
				semanticObject: "dummy",
				actions: [
					"action_00"
				]
			})
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 2);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
			assert.equal(aLinks[0].getText(), "action 00");
			assert.equal(aLinks[0].getIsMain(), false);
			assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
			assert.equal(aLinks[1].getText(), "action 01");
			assert.equal(aLinks[1].getIsMain(), false);
			done();
		});
	});
	QUnit.test("Correct semantic object", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			mainSemanticObject: "SemanticObjectTwoIntents",
			semanticObjects: "SemanticObjectTwoIntents",
			semanticObjectUnavailableActions: new SemanticObjectUnavailableAction({
				semanticObject: "SemanticObjectTwoIntents",
				actions: [
					"action_00"
				]
			})
		});
		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
			assert.equal(aLinks[0].getText(), "action 01");
			assert.equal(aLinks[0].getIsMain(), false);
			done();
		});
	});

	QUnit.module("sap.ui.mdc.link.ContentHandler: log", {
		beforeEach: function() {
			this.sLogLevel = SapBaseLog.getLevel();
			SapBaseLog.setLevel(SapBaseLog.Level.TRACE);
			this.oLinkHandler = new FlpLinkHandler({
				mainSemanticObject: "SOMainActionWithText",
				semanticObjects: "SOMainActionWithText",
				items: [
					new LinkItem({
						key: "item00",
						href: "#Action00",
						isMain: true,
						text: "item 00"
					})
				]
			});
			FakeFlpConnector.enableFakeConnector({
				SOMainActionWithText: {
					links: [
						{
							intent: "#Action01",
							text: "item 01"
						}
					]
				}
			});
		},
		afterEach: function() {
			SapBaseLog.setLevel(this.sLogLevel);
			FakeFlpConnector.disableFakeConnector();
			this.oLinkHandler.destroy();
		}
	});
	QUnit.test("retrieveNavigationTargets", function(assert) {
		var done = assert.async();
		// act
		this.oLinkHandler.retrieveNavigationTargets("", {
			"SOMainActionWithText": {}
		}).then(function() {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 01") > -1);

			done();
		}.bind(this));
	});
	QUnit.test("calculateSemanticAttributes", function(assert) {
		// act
		this.oLinkHandler.calculateSemanticAttributes({
			param01: "value of param01",
			param02: "value of param02"
		});
		// assert
		assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
		assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("SOMainActionWithText") > -1);
		assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("param01") > -1);
		assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("param02") > -1);
	});
	QUnit.test("determineItems without modifyItemsCallback", function(assert) {
		var done = assert.async();
		// act
		this.oLinkHandler.determineItems().then(function(aItems) {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("SOMainActionWithText") > -1);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 00") > -1);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 01") > -1);

			done();
		}.bind(this));
	});
	QUnit.test("determineItems with modifyItemsCallback", function(assert) {
		this.oLinkHandler.setModifyItemsCallback(function(oContextObject, oLinkHandler) {
			return oLinkHandler.retrieveNavigationTargets("AppStateKey_12345", {
				SOMainActionWithText: oContextObject
			}).then(function(aLinks) {
				aLinks.forEach(function(oLink) {
					oLinkHandler.addItem(oLink);
				});
				oLinkHandler.addItem(new LinkItem({
					key: "item02",
					href: "#Action02",
					text: "item 02"
				}));
			});
		});
		var done = assert.async();
		// act
		this.oLinkHandler.determineItems().then(function(aItems) {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("SOMainActionWithText") > -1);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 00") > -1);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 01") > -1);
			assert.ok(this.oLinkHandler._getLogFormattedText().indexOf("item 02") > -1);

			done();
		}.bind(this));
	});

	QUnit.module("External link navigation", {
		beforeEach: function() {
			this.sLogLevel = SapBaseLog.getLevel();
			SapBaseLog.setLevel(SapBaseLog.Level.TRACE);
			this.oLinkHandler = new FlpLinkHandler({
				mainSemanticObject: "SOMainActionWithText",
				semanticObjects: "SOMainActionWithText",
				items: [
					new LinkItem({
						key: "item00",
						href: "#Action00",
						isMain: true,
						text: "item 00"
					})
				]
			});
			this.mTestData = {};
			FakeFlpConnector.enableFakeConnectorForTesting({
				SOMainActionWithText: {
					links: [
						{
							intent: "#Action01",
							text: "item 01"
						}
					]
				}
			}, this.mTestData);
		},
		afterEach: function() {
			SapBaseLog.setLevel(this.sLogLevel);
			FakeFlpConnector.disableFakeConnector();
			this.oLinkHandler.destroy();
		}
	});

	QUnit.test("CroosApplicationNavigation service called with link and component", function(assert) {
		var done = assert.async();
		this.oFlpLinkHandler = new FlpLinkHandler({
			semanticObjects: "SOMainActionWithText"
		});

		var oUtilsMock = sinon.mock(sap.ui.fl.Utils);
		var oApp = {
			dummyApp: function() {

			}
		};
		oUtilsMock.expects("getAppComponentForControl").returns(oApp);


		this.oFlpLinkHandler.retrieveNavigationTargets("", {}).then(function(aLinks, oOwnNavigationLink) {
			assert.equal(oOwnNavigationLink, null);
			assert.equal(aLinks.length, 1);
			assert.equal(this.hrefForExternal.calls.length, 2);

			//The first call has no input parameters
			assert.ok(this.hrefForExternal.calls[0]);
			assert.notOk(this.hrefForExternal.calls[0].target);
			assert.notOk(this.hrefForExternal.calls[0].comp);

			//Second call gets link and the object
			assert.ok(this.hrefForExternal.calls[1]);
			assert.ok(this.hrefForExternal.calls[1].target);
			assert.deepEqual(this.hrefForExternal.calls[1].target,
				{
					target: {
						shellHash: "#Action01"
					}
				}, "The links intent is used as shell hash object is within the call");
			assert.ok(this.hrefForExternal.calls[1].comp);
			assert.deepEqual(this.hrefForExternal.calls[1].comp, oApp, "The component is within the call");
			done();
		}.bind(this.mTestData));
	});
});
