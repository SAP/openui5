/* global QUnit, sinon */

QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/mdc/Link",
	"sap/ui/mdc/link/LinkItem",
	"testutils/link/FakeUShellConnector",
	"sap/base/Log"
], function(Link,
	LinkItem,
	FakeUShellConnector,
	SapBaseLog) {
	"use strict";

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: API", {
		beforeEach: function() {
			this.oLink = new Link();
		},
		afterEach: function() {
			this.oLink.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		const done = assert.async(2);
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

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: 'semanticObjects'", {
		beforeEach: function() {},
		afterEach: function() {
			// stopMockServer();
			this.oLink.destroy();
			// this.oODataModel.destroy();
		}
	});

	QUnit.test("semanticObjects and semanticObjectMapping with empty collection", function(assert) {
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const oPayload = this.oLink.getDelegate().payload;
		const done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			const oDELEGATE = this.oLink.getControlDelegate();
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const oPayload = this.oLink.getDelegate().payload;
		const done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			const oDELEGATE = this.oLink.getControlDelegate();
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {
					semanticObjects: ["SO1"]
				}
			}
		});
		const oPayload = this.oLink.getDelegate().payload;
		const done = assert.async();
		// this.oLink.setModel(this.oODataModel);
		this.oLink.awaitControlDelegate().then(function() {
			const oDELEGATE = this.oLink.getControlDelegate();
			assert.deepEqual(oDELEGATE._getSemanticObjects(oPayload), [
				"SO1"
			]);
			assert.deepEqual(oDELEGATE._getSemanticObjectMappings(oPayload), []);
			done();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: calculateSemanticAttributes", {
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

	const _calculateSemanticAttributesOfLink = function(oLink, oContextObject) {
		return oLink.awaitControlDelegate().then(function() {
			return oLink.getControlDelegate()._calculateSemanticAttributes(oContextObject, oLink.getDelegate().payload, oLink._getInfoLog());
		});
	};

	QUnit.test("without semanticObjectMappings", function(assert) {
		assert.expect(8);
		const done = assert.async(7);

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {}
			}
		})).then(function(aSemanticAttributes) {
			assert.deepEqual(aSemanticAttributes, { "": {} });
			done();
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const done = assert.async(2);

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const done = assert.async();

		assert.deepEqual(this.oContextObject, {
			Category: "Monitor",
			ContactName: "Mr. John Doe",
			ProductPicUrl: "http://dummy.com",
			SupplierId: "1234567890.0"
		});

		_calculateSemanticAttributesOfLink(new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: 'retrieveNavigationTargets'", {
		beforeEach: function() {
			FakeUShellConnector.enableFakeConnector({
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
			FakeUShellConnector.disableFakeConnector();
			this.oLink.destroy();
		}
	});
	QUnit.test("Navigation service not available", function(assert) {
		const fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error").withArgs("LinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
		FakeUShellConnector.disableFakeConnector();
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {
					semanticObjects: ["SemanticObjectEmpty"]
				}
			}
		});
		this.oLink.awaitControlDelegate().then(function() {
			this.oLink.getControlDelegate()._retrieveNavigationTargets("", {}, this.oLink.getDelegate().payload).then(function(aLinks, oOwnNavigationLink) {
				assert.ok(fnSapLogErrorSpy.withArgs("LinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained").called);
				assert.equal(oOwnNavigationLink, null);
				assert.deepEqual(aLinks, []);
				done();
				SapBaseLog.error.restore();
			});
		}.bind(this));
	});

	QUnit.test("Navigation service returns empty links", function(assert) {
		const fnSapLogErrorSpy = sinon.spy(SapBaseLog, "error");
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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

	QUnit.test("Navigation service returns one link with any action", function(assert) {
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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

	QUnit.test("Navigation service returns two links with any actions", function(assert) {
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: 'retrieveNavigationTargets' and main item", {
		beforeEach: function() {
			FakeUShellConnector.enableFakeConnector({
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
			FakeUShellConnector.disableFakeConnector();
			this.oLink.destroy();
		}
	});

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: 'semanticObjectUnavailableActions'", {
		beforeEach: function() {
			FakeUShellConnector.enableFakeConnector({
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
			FakeUShellConnector.disableFakeConnector();
			this.oLink.destroy();
		}
	});

	QUnit.test("Dummy semantic object", function(assert) {
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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
		const done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
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

	QUnit.module("sap.ui.mdc.ushell.LinkDelegate: log", {
		beforeEach: function() {
			this.sLogLevel = SapBaseLog.getLevel();
			SapBaseLog.setLevel(SapBaseLog.Level.TRACE);
			this.oLink = new Link({
				delegate: {
					name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_UShellLinkDelegate",
					payload: {
						semanticObjects: ["SOMainActionWithText"]
					}
				}
			});
			FakeUShellConnector.enableFakeConnector({
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
			FakeUShellConnector.disableFakeConnector();
			this.oLink.destroy();
		}
	});

	QUnit.test("retrieveNavigationTargets", function(assert) {
		const done = assert.async();
		// act
		this.oLink._retrieveUnmodifiedLinkItems().then(function() {
			// assert
			assert.equal(SapBaseLog.getLevel(), SapBaseLog.Level.TRACE);
			assert.ok(this.oLink._getInfoLog()._getLogFormattedText().indexOf("item 01") > -1);

			done();
		}.bind(this));
	});

	QUnit.test("calculateSemanticAttributes", function(assert) {
		const done = assert.async();
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
		const done = assert.async();
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
			FakeUShellConnector.enableFakeConnectorForTesting({
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
			FakeUShellConnector.disableFakeConnector();
		}
	});
});
