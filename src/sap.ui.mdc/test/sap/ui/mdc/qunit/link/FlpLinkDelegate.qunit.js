/* global QUnit, sinon */

QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/mdc/Link",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/link/FakeFlpConnector",
	"sap/base/Log"
], function(Link,
	LinkItem,
	FakeFlpConnector,
	SapBaseLog) {
	"use strict";

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: API", {
		beforeEach: function() {
			this.oLink = new Link();
		},
		afterEach: function() {
			this.oLink.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		var done = assert.async(2);
		assert.ok(this.oLink);
		assert.deepEqual(this.oLink.getDelegate().name, "sap/ui/mdc/LinkDelegate");
		assert.deepEqual(this.oLink.getDelegate().payload, {});
		assert.deepEqual(this.oLink.getSourceControl(), null);
		this.oLink._retrieveUnmodifiedLinkItems().then(function(aLinkItems) {
			assert.deepEqual(aLinkItems, []);
			done();
		});
		this.oLink.retrieveAdditionalContent().then(function(aAdditionalContent) {
			assert.deepEqual(aAdditionalContent, []);
			done();
		});
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: 'semanticObjects'", {
		beforeEach: function() {
			// startMockServer("test-resources/sap/ui/mdc/qunit/link/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/link/mockserver/", "/odataFake/");
			// this.oODataModel = new ODataModel("/odataFake/");
			this.oLink;
		},
		afterEach: function() {
			// stopMockServer();
			this.oLink.destroy();
			// this.oODataModel.destroy();
		}
	});

	QUnit.test("semanticObjects and semanticObjectMapping with empty collection", function(assert) {
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SO1"],
					semanticObjectMappings: [
						{
							semanticObject: "SO1"
						}
					]
				}
			}
		});
		var oPayload = this.oLink.getDelegate().payload;
		var done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			var oDELEGATE = this.oLink.getControlDelegate();
			assert.deepEqual(oDELEGATE._getSemanticObjects(oPayload), [
				"SO1"
			]);
			assert.deepEqual(oDELEGATE._convertSemanticObjectMapping(oDELEGATE._getSemanticObjectMappings(oPayload)), {
				SO1: {}
			});
			done();
		}.bind(this));
	});

	QUnit.test("semanticObject and semanticObjectMapping with qualifier", function(assert) {
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SO1", "SOAdd"],
					semanticObjectMappings: [
						{
							semanticObject: "SO1",
							items: [
								{
									key: "SupplierId",
									value: "SupplierIdOfSO1"
								}
							]
						},
						{
							semanticObject: "SOAdd",
							items: [
								{
									key: "SupplierId",
									value: "SupplierIdOfSOAdd"
								}
							]
						}
					]
				}
			}
		});
		var oPayload = this.oLink.getDelegate().payload;
		var done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			var oDELEGATE = this.oLink.getControlDelegate();
			assert.deepEqual(oDELEGATE._getSemanticObjects(oPayload), [
				"SO1", "SOAdd"
			]);
			assert.deepEqual(oDELEGATE._convertSemanticObjectMapping(oDELEGATE._getSemanticObjectMappings(oPayload)), {
				SO1: {
					SupplierId: "SupplierIdOfSO1"
				},
				SOAdd: {
					SupplierId: "SupplierIdOfSOAdd"
				}
			});
			done();
		}.bind(this));
	});

	QUnit.test("only semanticObject", function(assert) {
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SO1"]
				}
			}
		});
		var oPayload = this.oLink.getDelegate().payload;
		var done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			var oDELEGATE = this.oLink.getControlDelegate();
			assert.deepEqual(oDELEGATE._getSemanticObjects(oPayload), [
				"SO1"
			]);
			assert.deepEqual(oDELEGATE._getSemanticObjectMappings(oPayload), []);
			done();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: calculateSemanticAttributes", {
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

	var _calculateSemanticAttributesOfLink = function(oLink, oContextObject) {
		return oLink.awaitControlDelegate().then(function() {
			return oLink.getControlDelegate()._calculateSemanticAttributes(oContextObject, oLink.getDelegate().payload, oLink._getInfoLog());
		});
	};

	QUnit.test("without semanticObjectMappings", function(assert) {
		assert.expect(8);
		var done = assert.async(7);

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {}
			}
		})).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, { "": {} });
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [""],
					SemanticObjectMappings: []
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				"": {
					Category: "Monitor",
					ContactName: "Mr. John Doe",
					ProductPicUrl: "http://dummy.com",
					SupplierId: "1234567890.0"
				}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: null,
					semanticObjectMappings: []
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				"": {
					Category: "Monitor",
					ContactName: "Mr. John Doe",
					ProductPicUrl: "http://dummy.com",
					SupplierId: "1234567890.0"
				}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault"
					],
					semanticObjectMappings: undefined
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				SODefault: {
					Category: "Monitor",
					ContactName: "Mr. John Doe",
					ProductPicUrl: "http://dummy.com",
					SupplierId: "1234567890.0"
				}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault"
					],
					semanticObjectMappings: []
				}
			}
		}), undefined).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				SODefault: {}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault"
					],
					semanticObjectMappings: []
				}
			}
		}), null).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				SODefault: {}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault", "SOAdditional"
					],
					semanticObjectMappings: undefined
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
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
			done();
		});
	});

	QUnit.test("with semanticObjectMappings", function(assert) {
		assert.expect(3);
		var done = assert.async(2);

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault"
					],
					semanticObjectMappings: []
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				SODefault: {
					Category: "Monitor",
					ContactName: "Mr. John Doe",
					ProductPicUrl: "http://dummy.com",
					SupplierId: "1234567890.0"
				}
			});
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault"
					],
					semanticObjectMappings: [
						{
							semanticObject: "SODefault",
							items: [
								{
									key: "SupplierId",
									value: "SupplierIdOfSODefault"
								}
							]
						}
					]
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
				SODefault: {
					Category: "Monitor",
					ContactName: "Mr. John Doe",
					ProductPicUrl: "http://dummy.com",
					SupplierIdOfSODefault: "1234567890.0"
				}
			});
			done();
		});
	});

	QUnit.test("with semanticObjectMapping qualifier", function(assert) {
		assert.expect(2);
		var done = assert.async();

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SODefault", "SOAdditional"
					],
					semanticObjectMappings: [
						{
							semanticObject: "SODefault",
							items: [
								{
									key: "SupplierId",
									value: "SupplierIdOfSODefault"
								}
							]
						},
						{
							semanticObject: "SOAdditional",
							items: [
								{
									key: "SupplierId",
									value: "SupplierIdOfSOAdditional"
								}
							]
						}
					]
				}
			}
		}), this.oContextObject).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, {
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
			done();
		});
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: 'retrieveNavigationTargets'", {
		beforeEach: function() {
			this.oLink;
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
			this.oLink.destroy();
		}
	});
	QUnit.test("CrossApplicationNavigation service not available", function(assert) {
		var fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error").withArgs("FlpLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
		FakeFlpConnector.disableFakeConnector();
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectEmpty"]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.ok(fnSapLogErrorSpy.withArgs("FlpLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained").called);
				assert.equal(oOwnNavigationLink, null);
				assert.deepEqual(aLinks, []);
				done();
				SapBaseLog.error.restore();
			});
		}.bind(this));
	});

	QUnit.test("CrossApplicationNavigation service returns empty links", function(assert) {
		var fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error");
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectEmpty"]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.notOk(fnSapLogErrorSpy.called);
				assert.equal(oOwnNavigationLink, null);
				assert.deepEqual(aLinks, []);

				done();
				SapBaseLog.error.restore();
			});
		}.bind(this));
	});

	QUnit.test("CrossApplicationNavigation service returns one link with any action", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectAnyAction"]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.equal(oOwnNavigationLink, null);
				assert.equal(aLinks.length, 1);
				assert.equal(aLinks[0].getHref(), "?SemanticObjectAnyAction_00#/dummyLink");
				assert.equal(aLinks[0].getText(), "action 00");
				done();
			});
		}.bind(this));
	});

	QUnit.test("CrossApplicationNavigation service returns two links with any actions", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectTwoIntents"]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.equal(oOwnNavigationLink, null);
				assert.equal(aLinks.length, 2);
				assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
				assert.equal(aLinks[0].getText(), "action 00");
				assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
				assert.equal(aLinks[1].getText(), "action 01");
				done();
			});
		}.bind(this));
	});

	QUnit.test("different SemanticObjects", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: [
						"SemanticObjectDisplayFactSheet", "SemanticObjectTwoIntents"
					]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.equal(oOwnNavigationLink, null);
				assert.equal(aLinks.length, 3);
				assert.equal(aLinks[0].getHref(), "?SemanticObjectDisplayFactSheet_00#/dummyLink");
				assert.equal(aLinks[0].getText(), "Fact Sheet");
				assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
				assert.equal(aLinks[1].getText(), "action 00");
				assert.equal(aLinks[2].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
				assert.equal(aLinks[2].getText(), "action 01");
				done();
			});
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: 'retrieveNavigationTargets' and main item", {
		beforeEach: function() {
			this.oLink;
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
			this.oLink.destroy();
		}
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: 'semanticObjectUnavailableActions'", {
		beforeEach: function() {
			this.oLink;
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
			this.oLink.destroy();
		}
	});

	QUnit.test("Dummy semantic object", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectTwoIntents"],
					semanticObjectUnavailableActions: [{
						semanticObject: "dummy",
						actions: [
							"action_00"
						]
					}]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.equal(oOwnNavigationLink, null);
				assert.equal(aLinks.length, 2);
				assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_00#/dummyLink1");
				assert.equal(aLinks[0].getText(), "action 00");
				assert.equal(aLinks[1].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
				assert.equal(aLinks[1].getText(), "action 01");
				done();
			});
		}.bind(this));
	});
	QUnit.test("Correct semantic object", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectTwoIntents"],
					semanticObjectUnavailableActions: [{
						semanticObject: "SemanticObjectTwoIntents",
						actions: [
							"action_00"
						]
					}]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.equal(oOwnNavigationLink, null);
				assert.equal(aLinks.length, 1);
				assert.equal(aLinks[0].getHref(), "?SemanticObjectTwoIntents_01#/dummyLink2");
				assert.equal(aLinks[0].getText(), "action 01");
				done();
			});
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.flp.FlpLinkDelegate: log", {
		beforeEach: function() {
			this.sLogLevel = SapBaseLog.getLevel();
			SapBaseLog.setLevel(SapBaseLog.Level.TRACE);
			this.oLink = new Link({
				delegate: {
					name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_FlpLinkDelegate",
					payload: {
						semanticObjects: ["SOMainActionWithText"]
					}
				}
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
			this.oLink.destroy();
		}
	});

	QUnit.test("retrieveNavigationTargets", function(assert) {
		var done = assert.async();
		// act
		this.oLink._retrieveUnmodifiedLinkItems().then(function() {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("item 01") > -1);

			done();
		}.bind(this));
	});

	QUnit.test("calculateSemanticAttributes", function(assert) {
		var done = assert.async();
		// act
		_calculateSemanticAttributesOfLink(this.oLink, {
			param01: "value of param01",
			param02: "value of param02"
		}).then(function() {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("SOMainActionWithText") > -1);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("param01") > -1);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("param02") > -1);
			done();
		}.bind(this));
	});

	QUnit.test("determineItems", function(assert) {
		var done = assert.async();
		// act
		this.oLink._retrieveUnmodifiedLinkItems().then(function() {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("SOMainActionWithText") > -1);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("item 00") > -1);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("item 01") > -1);

			done();
		}.bind(this));
	});

	QUnit.module("External link navigation", {
		beforeEach: function() {
			this.sLogLevel = SapBaseLog.getLevel();
			SapBaseLog.setLevel(SapBaseLog.Level.TRACE);
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
		}
	});
});
