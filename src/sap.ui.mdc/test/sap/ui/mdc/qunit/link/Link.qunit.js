/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/link/LinkItem",
	"sap/m/Button",
	"sap/ui/mdc/Link",
	"sap/m/MessageToast"
], function(QUnit, LinkItem, Button, Link, MessageToast) {
	"use strict";

	QUnit.module("sap.ui.mdc.Link: API");

	QUnit.test("Instance", function(assert) {
		var done = assert.async(2);
		var oLink = new Link();
		assert.ok(oLink);
		assert.equal(oLink.getEnablePersonalization(), true);
		assert.equal(oLink.getSourceControl(), null);
		oLink.retrieveAdditionalContent().then(function(aAdditionalContent) {
			assert.deepEqual(aAdditionalContent, []);
			done();
		});
		oLink.retrieveAdditionalContent().then(function(aLinkItems) {
			assert.deepEqual(aLinkItems, []);
			done();
		});
	});

	QUnit.module("sap.ui.mdc.Link: visibility of items");
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
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
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
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleText(assert, oPanel, "item 00", false);
			fnHasVisibleText(assert, oPanel, "item 01", false);

			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("invalid 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
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
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleText(assert, oPanel, "item 00", false);
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
	QUnit.test("superior 'item' and less items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
							text: "item 00",
							href: "#item00"
						}), new LinkItem({
							key: "item01",
							text: "item 01",
							href: "#item01",
							// Superior
							initiallyVisible: true
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
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", false);
			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", true);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
							text: "item 00",
							href: "#item00"
						}), new LinkItem({
							key: "item01",
							text: "item 01",
							href: "#item01",
							// Superior
							initiallyVisible: true
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
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", false);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", true);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item', invalid 'item' and less items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
							text: "item 00",
							href: "#item00"
						}), new LinkItem({
							key: "item01",
							text: "item 01",
							href: "#item01",
							// Superior
							initiallyVisible: true
						}), new LinkItem({
							key: "item02",
							text: "item 02",
							href: "#item02"
						}), new LinkItem({
							key: "item03",
							text: "item 03" // invalid item
						})
					]
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", false);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", true);
			fnHasVisibleText(assert, oPanel, "item 02", false);
			fnHasVisibleLink(assert, oPanel, "item 02", false);
			fnHasVisibleText(assert, oPanel, "item 03", false);
			fnHasVisibleLink(assert, oPanel, "item 03", false);

			done();
			oPanel.destroy();
		});
	});
	QUnit.test("superior 'item', invalid 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							key: "item00",
							text: "item 00",
							href: "#item00"
						}), new LinkItem({
							key: "item01",
							text: "item 01",
							href: "#item01",
							// Superior
							initiallyVisible: true
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
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);
			fnHasVisibleLink(assert, oPanel, "item 00", false);

			fnHasVisibleText(assert, oPanel, "item 01", false);
			fnHasVisibleLink(assert, oPanel, "item 01", true);
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

	QUnit.module("Delegate tests", {
		beforeEach: function() {
			this.oLink = null;
		},
		afterEach: function() {
			this.oLink.destroy();
		}
	});

	QUnit.test("modifyLinkItemsBeforePopoverOpens", function(assert) {
		var done = assert.async(2);
		var aModfiedLinkItemTexts = [];
		aModfiedLinkItemTexts["Link1"] = "New Text Link1";
		aModfiedLinkItemTexts["Link2"] = "New Text Link2";

		this.oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: "#Action01"
						}),
						new LinkItem({
							text: "Link2",
							href: "#Action02"
						})
					],
					modfiedLinkItemTexts: aModfiedLinkItemTexts
				}
			}
		});
		this.oLink._retrieveUnmodifiedLinkItems().then(function(aLinkItems) {
			assert.equal(aLinkItems[0].getText(), "Link1");
			assert.equal(aLinkItems[1].getText(), "Link2");
			done();
		});
		this.oLink.retrieveLinkItems().then(function(aModfiedLinkItems) {
			assert.equal(aModfiedLinkItems[0].getText(), "New Text Link1");
			assert.equal(aModfiedLinkItems[1].getText(), "New Text Link2");
			done();
		});
	});

	var fnClickOnVisibleLink = function(assert, oPanel, sText) {
		var aElements = oPanel.$().find("a:visible");
		var oLink;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].text === sText) {
				oLink = aElements[iIndex];
			}
		});
		if (oLink) {
			oLink.click();
		} else {
			assert.ok(false, "no visible Link found to click for text " + sText);
		}
	};

	QUnit.test("beforeNavigationCallback - open MessageToast before navigation", function(assert) {
		var done = assert.async();
		this.oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: "#Action01",
							initiallyVisible: true
						}),
						new LinkItem({
							text: "Link2",
							href: "#Action02"
						})
					],
					fn: function() {
						return new Promise(function(resolve) {
							MessageToast.show("test");
							resolve(false);
						});
					}
				}
			}
		});

		var fnMessageToastSpy = sinon.spy(MessageToast, "show");

		this.oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			assert.ok(fnMessageToastSpy.notCalled);
			fnClickOnVisibleLink(assert, oPanel, "Link1");
			assert.ok(fnMessageToastSpy.calledOnce);
			done();
		});
	});
});
