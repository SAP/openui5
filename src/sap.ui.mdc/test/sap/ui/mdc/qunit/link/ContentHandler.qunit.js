sap.ui.define([
	"sap/ui/thirdparty/qunit-2", "sap/ui/mdc/link/FlpLinkHandler", "sap/ui/core/util/MockServer", "sap/ui/mdc/link/FakeFlpConnector", "sap/ui/model/odata/v2/ODataModel", "sap/ui/mdc/link/ContactDetails", "sap/ui/mdc/link/ContentHandler", "sap/ui/mdc/link/LinkHandler", "sap/ui/mdc/link/LinkItem", "sap/m/Button"
], function(QUnit, FlpLinkHandler, MockServer, FakeFlpConnector, ODataModel, ContactDetails, ContentHandler, LinkHandler, LinkItem, Button) {
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

	QUnit.module("sap.ui.mdc.link.ContentHandler: API", {
		beforeEach: function() {
			this.oContentHandler = new ContentHandler();
		},
		afterEach: function() {
			this.oContentHandler.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(this.oContentHandler);
		assert.equal(this.oContentHandler.getEnablePersonalization(), true);
		assert.equal(this.oContentHandler.getModifyAdditionalContentCallback(), null);
		assert.deepEqual(this.oContentHandler.getAdditionalContent(), []);
		assert.equal(this.oContentHandler.getLinkHandler(), null);
		assert.equal(this.oContentHandler.getSourceControl(), null);
	});

	QUnit.module("sap.ui.mdc.link.ContentHandler: existenceOfContentChanged event", {
		beforeEach: function() {
			startMockServer("test-resources/sap/ui/mdc/qunit/link/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/link/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oContentHandler = new ContentHandler();
			this.oContentHandler.setModel(this.oODataModel);
			this.oContentHandler.bindObject({
				path: "/ProductCollection('38094020.0')"
			});
		},
		afterEach: function() {
			stopMockServer();
			disableFakeFlpConnector();
			destroyDistinctSemanticObjects();
			this.oContentHandler.destroy();
			this.oODataModel.destroy();
		}
	});
	QUnit.test("no semantic object, no content", function(assert) {
		enableFakeFlpConnector({});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SODummy"
		}));
	});
	QUnit.test("no semantic object, no content", function(assert) {
		enableFakeFlpConnector({
			SO1: {
				links: []
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SODummy"
		}));
	});
	QUnit.test("no Flp links, no content", function(assert) {
		enableFakeFlpConnector({
			SO1: {
				links: []
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SO1"
		}));
	});
	QUnit.test("Flp main link with 'href'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithHref: {
				links: [
					{
						intent: "#action01",
						isMain: true
					}
				]
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOMainActionWithHref"
		}));
	});
	QUnit.test("Flp main link with 'text'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithText: {
				links: [
					{
						text: "action 01",
						isMain: true
					}
				]
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOMainActionWithText"
		}));
	});
	QUnit.test("Flp link with 'href'", function(assert) {
		enableFakeFlpConnector({
			SOActionWithInvisible: {
				links: [
					{
						intent: "#action01"
					}
				]
			}
		});

		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true, "action could be personalized as invisible");
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOActionWithInvisible"
		}));
	});
	QUnit.test("Flp link with 'text'", function(assert) {
		enableFakeFlpConnector({
			SOActionsWithText: {
				links: [
					{
						text: "action 01"
					}, {
						text: "action 02"
					}
				]
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOActionsWithText"
		}));
	});
	QUnit.test("Flp main item with 'href' and Flp link with 'href'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithHrefAndActionWithHref: {
				links: [
					{
						intent: "#action01"
					}, {
						intent: "#action02",
						isMain: true
					}
				]
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOMainActionWithHrefAndActionWithHref"
		}));
	});
	QUnit.test("item with 'text'", function(assert) {
		enableFakeFlpConnector({});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			items: new LinkItem({
				text: "Link Item"
			})
		}));
	});
	QUnit.test("item with 'href'", function(assert) {
		enableFakeFlpConnector({});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			items: new LinkItem({
				href: "#LinkItem"
			})
		}));
	});
	QUnit.test("content", function(assert) {
		enableFakeFlpConnector({});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.addAdditionalContent(new ContactDetails());
	});
	QUnit.test("no content and modifyAdditionalContentCallback", function(assert) {
		enableFakeFlpConnector({});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.setModifyAdditionalContentCallback(function(oAdditionalContent) {
			return Promise.resolve([]);
		});
	});
	QUnit.test("content and Flp main item with 'text'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithText: {
				links: [
					{
						text: "action 01",
						isMain: true
					}
				]
			}
		});

		// assert
		var done = assert.async();
		this.oContentHandler.attachExistenceOfContentChanged(function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
			done();
		}.bind(this));

		// act
		this.oContentHandler.addAdditionalContent(new ContactDetails());
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			semanticObjects: "SOMainActionWithText"
		}));
	});
	QUnit.test("add link to LinkHandler", function(assert) {
		enableFakeFlpConnector({});

		var done = assert.async();
		var fnExistenceOfContentChanged = function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);

			this.oContentHandler.detachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

			this.oContentHandler.attachExistenceOfContentChanged(function() {
				assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
				done();
			}.bind(this));
			// act second
			this.oContentHandler.getLinkHandler().addItem(new LinkItem({
				href: "#Action01"
			}));
		}.bind(this);
		this.oContentHandler.attachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

		// act first
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: []
		}));
	});
	QUnit.test("remove link from LinkHandler", function(assert) {
		enableFakeFlpConnector({});

		var done = assert.async();
		var fnExistenceOfContentChanged = function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);

			this.oContentHandler.detachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

			this.oContentHandler.attachExistenceOfContentChanged(function() {
				assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);
				done();
			}.bind(this));
			// act second
			this.oContentHandler.getLinkHandler().removeAllItems();

		}.bind(this);
		this.oContentHandler.attachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

		// act first
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					href: "#Action01"
				}), new LinkItem({
					href: "#Action02"
				})
			]
		}));
	});
	QUnit.test("add 'semanticObjects'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithHref: {
				links: [
					{
						intent: "#action01"
					}
				]
			}
		});

		// assert
		var done = assert.async();
		var fnExistenceOfContentChanged = function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);

			this.oContentHandler.detachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

			this.oContentHandler.attachExistenceOfContentChanged(function() {
				assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);
				done();
			}.bind(this));

			// act second
			this.oContentHandler.getLinkHandler().setSemanticObjects([
				"SOMainActionWithHref"
			]);
		}.bind(this);
		this.oContentHandler.attachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

		// act first
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			mainSemanticObject: "SOMainActionWithHref",
			semanticObjects: []
		}));
	});
	QUnit.test("remove 'semanticObjects'", function(assert) {
		enableFakeFlpConnector({
			SOMainActionWithHref: {
				links: [
					{
						intent: "#action01"
					}
				]
			}
		});

		var done = assert.async();
		var fnExistenceOfContentChanged = function() {
			assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), true);

			this.oContentHandler.detachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

			this.oContentHandler.attachExistenceOfContentChanged(function() {
				assert.equal(this.oContentHandler._getInternalModel().getProperty('/bHasPotentialContent'), false);
				done();
			}.bind(this));

			// act second
			this.oContentHandler.getLinkHandler().setSemanticObjects([]);
		}.bind(this);
		this.oContentHandler.attachExistenceOfContentChanged(fnExistenceOfContentChanged, this);

		// act first
		this.oContentHandler.setLinkHandler(new FlpLinkHandler({
			mainSemanticObject: "SOMainActionWithHref",
			semanticObjects: [
				"SOMainActionWithHref"
			]
		}));
	});

	QUnit.module("sap.ui.mdc.link.ContentHandler: visibility of items", {
		beforeEach: function() {
			// this.oUIComponent = new UIComponent("appComponent1", {});
			// this.oStubGetAppComponentForControl = sinon.stub(sap.ui.fl.Utils, "getAppComponentForControl");
			// this.oStubGetAppComponentForControl.returns(this.oUIComponent);

			this.oContentHandler = new ContentHandler({
				sourceControl: new Button({
					text: "button"
				})
			});
		},
		afterEach: function() {
			// this.oStubGetAppComponentForControl.restore();
			// this.oUIComponent.destroy();
			this.oContentHandler.destroy();
		}
	});
	var fnHasVisibleLink = function(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.$().find("a:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].text === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	};
	var fnHasVisibleText = function(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.$().find("span:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].textContent === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	};
	var fnHasVisibleMoreLinksButton = function(assert, oPanel, bVisible) {
		assert.equal(oPanel.$().find("button:visible").length, bVisible ? 1 : 0);
		// fnHasVisibleText(assert, oPanel, sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc", undefined, false).getText("info.POPOVER_DEFINE_LINKS"), bVisible);
	};
	QUnit.test("invalid 'item' and less items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00" // invalid
				}), new LinkItem({
					text: "item 01" // invalid
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleText(assert, oPanel, "item 00", true);
			fnHasVisibleText(assert, oPanel, "item 01", true);

			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("invalid 'item' and many items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00" // invalid
				}), new LinkItem({
					text: "item 01" // invalid
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				}), new LinkItem({
					key: "item04",
					text: "item 04",
					href: "#item04"
				}), new LinkItem({
					key: "item05",
					text: "item 05",
					href: "#item05"
				}), new LinkItem({
					key: "item06",
					text: "item 06",
					href: "#item06"
				}), new LinkItem({
					key: "item07",
					text: "item 07",
					href: "#item07"
				}), new LinkItem({
					key: "item08",
					text: "item 08",
					href: "#item08"
				}), new LinkItem({
					key: "item09",
					text: "item 09",
					href: "#item09"
				}), new LinkItem({
					key: "item10",
					text: "item 10",
					href: "#item10"
				}), new LinkItem({
					key: "item11",
					text: "item 11",
					href: "#item11"
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleText(assert, oPanel, "item 00", true);
			fnHasVisibleText(assert, oPanel, "item 01", true);
			fnHasVisibleLink(assert, oPanel, "item 01", false);

			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleText(assert, oPanel, "item 03", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);
			fnHasVisibleText(assert, oPanel, "item 04", false);
			fnHasVisibleLink(assert, oPanel, "item 04", false);
			fnHasVisibleText(assert, oPanel, "item 05", false);
			fnHasVisibleLink(assert, oPanel, "item 05", false);
			fnHasVisibleText(assert, oPanel, "item 06", false);
			fnHasVisibleLink(assert, oPanel, "item 06", false);
			fnHasVisibleText(assert, oPanel, "item 07", false);
			fnHasVisibleLink(assert, oPanel, "item 07", false);
			fnHasVisibleText(assert, oPanel, "item 08", false);
			fnHasVisibleLink(assert, oPanel, "item 08", false);
			fnHasVisibleText(assert, oPanel, "item 09", false);
			fnHasVisibleLink(assert, oPanel, "item 09", false);
			fnHasVisibleText(assert, oPanel, "item 10", false);
			fnHasVisibleLink(assert, oPanel, "item 10", false);
			fnHasVisibleText(assert, oPanel, "item 11", false);
			fnHasVisibleLink(assert, oPanel, "item 11", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item' and less items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00",
					href: "#item00"
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					isSuperior: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", true);
			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", false);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item' and many items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00",
					href: "#item00"
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					isSuperior: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				}), new LinkItem({
					key: "item04",
					text: "item 04",
					href: "#item04"
				}), new LinkItem({
					key: "item05",
					text: "item 05",
					href: "#item05"
				}), new LinkItem({
					key: "item06",
					text: "item 06",
					href: "#item06"
				}), new LinkItem({
					key: "item07",
					text: "item 07",
					href: "#item07"
				}), new LinkItem({
					key: "item08",
					text: "item 08",
					href: "#item08"
				}), new LinkItem({
					key: "item09",
					text: "item 09",
					href: "#item09"
				}), new LinkItem({
					key: "item10",
					text: "item 10",
					href: "#item10"
				}), new LinkItem({
					key: "item11",
					text: "item 11",
					href: "#item11"
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", true);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", false);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item', invalid 'item' and less items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00",
					href: "#item00"
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					isSuperior: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03" // invalid item
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", true);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", false);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleText(assert, oPanel, "item 03", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item', invalid 'item' and many items", function(assert) {
		this.oContentHandler.setLinkHandler(new LinkHandler({
			items: [
				new LinkItem({
					key: "item00",
					isMain: true,
					text: "item 00",
					href: "#item00"
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					isSuperior: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03" // invalid item
				}), new LinkItem({
					key: "item04",
					text: "item 04",
					href: "#item04"
				}), new LinkItem({
					key: "item05",
					text: "item 05",
					href: "#item05"
				}), new LinkItem({
					key: "item06",
					text: "item 06",
					href: "#item06"
				}), new LinkItem({
					key: "item07",
					text: "item 07",
					href: "#item07"
				}), new LinkItem({
					key: "item08",
					text: "item 08",
					href: "#item08"
				}), new LinkItem({
					key: "item09",
					text: "item 09",
					href: "#item09"
				}), new LinkItem({
					key: "item10",
					text: "item 10",
					href: "#item10"
				}), new LinkItem({
					key: "item11",
					text: "item 11",
					href: "#item11"
				})
			]
		}));

		var done = assert.async();
		this.oContentHandler.getContent().then(function(oPanel) {

			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", true);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", false);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleText(assert, oPanel, "item 03", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);

			fnHasVisibleText(assert, oPanel, "item 04", false);
			fnHasVisibleLink(assert, oPanel, "item 04", false);
			fnHasVisibleText(assert, oPanel, "item 05", false);
			fnHasVisibleLink(assert, oPanel, "item 05", false);
			fnHasVisibleText(assert, oPanel, "item 06", false);
			fnHasVisibleLink(assert, oPanel, "item 06", false);
			fnHasVisibleText(assert, oPanel, "item 07", false);
			fnHasVisibleLink(assert, oPanel, "item 07", false);
			fnHasVisibleText(assert, oPanel, "item 08", false);
			fnHasVisibleLink(assert, oPanel, "item 08", false);
			fnHasVisibleText(assert, oPanel, "item 09", false);
			fnHasVisibleLink(assert, oPanel, "item 09", false);
			fnHasVisibleText(assert, oPanel, "item 10", false);
			fnHasVisibleLink(assert, oPanel, "item 10", false);
			fnHasVisibleText(assert, oPanel, "item 11", false);
			fnHasVisibleLink(assert, oPanel, "item 11", false);

			done();
			oPanel.destroy();
		});
	});
});
