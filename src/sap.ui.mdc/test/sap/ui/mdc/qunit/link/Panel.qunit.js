/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/mdc/link/Panel",
	"sap/ui/mdc/link/PanelItem",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Icon",
	"sap/ui/mdc/p13n/Engine",
	"sap/ui/core/Core",
	"sap/m/Text",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(layoutLibrary, Panel, PanelItem, SimpleForm, Icon, Engine, oCore, Text, Link, LinkItem, JSONModel, jQuery) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	QUnit.module("sap.ui.mdc.link.Panel: API", {
		beforeEach: function() {
			this.oPanel = new Panel();
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("Instance", function(assert) {
		assert.ok(this.oPanel);
	});
	QUnit.test("Properties", function(assert) {
		assert.deepEqual(this.oPanel.getItems(), []);
		assert.deepEqual(this.oPanel.getAdditionalContent(), []);
	});

	QUnit.module("sap.ui.mdc.link.Panel: display", {
		beforeEach: function() {
			this.oPanel;
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	function fnHasVisibleText(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.$().find("span:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].textContent === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	}
	function fnHasVisibleLink(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.$().find("a:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].text === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	}
	function fnHasVisibleIcons(assert, oPanel, iCountVisibleIcons) {
		var aElements = oPanel.$().find("span:visible");
		var iCount = 0;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].style.cssText.indexOf("SAP-icons") > -1) {
				iCount++;
			}
		});
		assert.equal(iCount, iCountVisibleIcons);
	}
	function fnHasVisibleMoreLinksButton(assert, oPanel, bVisible) {
		assert.equal(oPanel.$().find("button:visible").length, bVisible ? 1 : 0);
		// fnHasVisibleText(assert, oPanel, sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_DEFINE_LINKS"), bVisible);
	}
	QUnit.test("no 'item'", function(assert) {
		this.oPanel = new Panel({
			items: []
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);

	});
	QUnit.test("invalid 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A" // invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid main 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("invalid main 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A" // invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("'additionalContent'", function(assert) {
		this.oPanel = new Panel({
			additionalContent: new SimpleForm({
				layout: SimpleFormLayout.ResponsiveGridLayout,
				content: [
					new Icon({
						src: "sap-icon://person-placeholder"
					})
				]
			})
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleIcons(assert, this.oPanel, 0);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true); // nothing to be persisted
	});

	QUnit.module("sap.ui.mdc.link.Panel: visibility of items", {
		beforeEach: function() {
			this.oPanel;
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("invalid visible 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					visible: true
				// invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("invalid invisible 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					visible: false
				// invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleText(assert, this.oPanel, "A", false, "Panel is not responsible for the visibility of items, it takes them as they are");
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid visible 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A",
					visible: true
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid invisible 'item'", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A",
					visible: false
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleText(assert, this.oPanel, "A", false);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});

	QUnit.module("sap.ui.mdc.link.Panel: default icon", {
		beforeEach: function() {
			this.oPanel;
		},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("all items have not icon", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A"
				}), new PanelItem({
					text: "B",
					href: "#B"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleIcons(assert, this.oPanel, 0);
	});
	QUnit.test("all items have icon", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A",
					icon: "sap-icon://user-edit"
				}), new PanelItem({
					text: "B",
					href: "#B",
					icon: "sap-icon://user-edit"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleIcons(assert, this.oPanel, 2);
	});
	QUnit.test("an item have not icon", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A",
					icon: "sap-icon://user-edit"
				}), new PanelItem({
					text: "B",
					href: "#B"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		fnHasVisibleIcons(assert, this.oPanel, 2);
	});

	QUnit.module("sap.ui.mdc.link.Panel: open selection dialog", {
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("test 01", function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A",
					internalHref: "#AInternal"
				}), new PanelItem({
					text: "B",
					href: "#B",
					internalHref: "#BInternal"
				}), new PanelItem({
					text: "C",
					href: "#C",
					internalHref: "#CInternal"
				})
			]
		});
		this.oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		// assert before act
		assert.equal(this.oPanel.getDependents().length, 0);

		// act
		var done = assert.async();
		oCore.loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			sap.ui.require([
				"sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
			], function(FlexRuntimeInfoAPI) {
				sinon.stub(FlexRuntimeInfoAPI, "isFlexSupported").returns(true);
				sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").resolves();

				Engine.getInstance().uimanager.show(this.oPanel, "LinkItems");
				//this.oPanel.openSelectionDialog(false, true, undefined);

				setTimeout(function() {
					FlexRuntimeInfoAPI.isFlexSupported.restore();
					FlexRuntimeInfoAPI.waitForChanges.restore();
					assert.equal(this.oPanel.getDependents().length, 1, "Dialog opened");
					assert.ok(this.oPanel.getDependents()[0].isA("sap.m.Dialog"), "Dialog is a 'sap.m.Dialog'");
					assert.ok(this.oPanel.getDependents()[0].getContent()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");
					done();
				}.bind(this), 500);
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("check internalHref", function(assert) {
		var sBaseUrl = window.location.href;
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "A",
							href: sBaseUrl + "#A",
							internalHref: sBaseUrl + "#AInternal"
						}),
						new LinkItem({
							text: "B",
							href: "#B",
							internalHref: "#BInternal"
						}),
						new LinkItem({
							text: "C",
							href: "#C",
							internalHref: "#CInternal"
						})
					]
				}
			}
		});

		oLink.createPopover().then(function(oPopover) {
			this.oPanel = oPopover.getContent()[0];
			this.oPanel.onPressLinkPersonalization();

			setTimeout(function() {
				assert.equal(this.oPanel.getDependents().length, 1, "Dialog opened");
				assert.ok(this.oPanel.getDependents()[0].isA("sap.m.Dialog"), "Dialog is a 'sap.m.Dialog'");
				assert.ok(this.oPanel.getDependents()[0].getContent()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");
				assert.equal(this.oPanel.getDependents()[0].getContent()[0].getAggregation("_content").getItems()[0].getItems()[0].getCells()[0].getItems()[0].getItems()[0].getCustomData()[0].getValue(), sBaseUrl + "#AInternal", "Correct internal href");
				assert.equal(this.oPanel.getDependents()[0].getContent()[0].getAggregation("_content").getItems()[0].getItems()[1].getCells()[0].getItems()[0].getItems()[0].getCustomData()[0].getValue(), "#BInternal", "Correct internal href");
				assert.equal(this.oPanel.getDependents()[0].getContent()[0].getAggregation("_content").getItems()[0].getItems()[2].getCells()[0].getItems()[0].getItems()[0].getCustomData()[0].getValue(), "#CInternal", "Correct internal href");

				this.oPanel.getDependents()[0].getContent()[0].getAggregation("_content").getItems()[0].getItems()[0].getCells()[0].getItems()[0].getItems()[0].firePress();

				setTimeout(function() {
					assert.equal(window.location.href, sBaseUrl + "#AInternal", "Navigation happened with internalHref");

					done();
				}, 50);
			}.bind(this), 500);
		}.bind(this));
	});

	QUnit.test("check navigation without internalHref", function(assert) {
		var sBaseUrl = window.location.href;
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "A",
							href: sBaseUrl + "#A"
						}),
						new LinkItem({
							text: "B",
							href: "#B",
							internalHref: "#BInternal"
						}),
						new LinkItem({
							text: "C",
							href: "#C",
							internalHref: "#CInternal"
						})
					]
				}
			}
		});

		oLink.createPopover().then(function(oPopover) {
			this.oPanel = oPopover.getContent()[0];
			this.oPanel.onPressLinkPersonalization();

			setTimeout(function() {
				assert.equal(this.oPanel.getDependents().length, 1, "Dialog opened");
				assert.ok(this.oPanel.getDependents()[0].isA("sap.m.Dialog"), "Dialog is a 'sap.m.Dialog'");
				assert.ok(this.oPanel.getDependents()[0].getContent()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");

				this.oPanel.getDependents()[0].getContent()[0].getAggregation("_content").getItems()[0].getItems()[0].getCells()[0].getItems()[0].getItems()[0].firePress();

				setTimeout(function() {
					assert.equal(window.location.href, sBaseUrl + "#A", "Navigation happened without internalHref");

					done();
				}, 50);
			}.bind(this), 500);
		}.bind(this));
	});

	QUnit.module("basic methods");

	QUnit.test("navigate without FLP", function(assert) {
		var sBaseUrl = window.location.href;

		Panel.navigate(sBaseUrl + "#navigate");
		assert.equal(window.location.href, sBaseUrl + "#navigate", "Navigation happened");
		assert.equal(Panel.oNavigationPromise, undefined, "Navigation Promise is undefined");
	});

	QUnit.module("applySettings");

	QUnit.test("with additionalContent", function(assert) {
		var oText = new Text({ text: "Text" });
		var oPanel = new Panel({
			additionalContent: [ oText ]
		});

		// Check if additionalContent got forwarded
		assert.deepEqual(oPanel.getAdditionalContent(), [], "additionalContent aggregation of Panel is empty");
		assert.deepEqual(oPanel.getAggregation("_content").getContent()[0].getItems(), [oText], "additionalContent got forwarded to internal '_content' aggregation");
	});

	QUnit.test("enablePersonalization false", function(assert) {
		var oPanel = new Panel({
			enablePersonalization: false
		});

		assert.equal(oPanel.getAggregation("_content").getContent()[3].getItems()[0].getVisible(), false, "personalization buttons visibility set to false");
	});

	QUnit.test("check if seperator is visible", function (assert) {
		var oPanelItem = new PanelItem({
			text: "PanelItem",
			href: "#PanelItem"
		});
		var oText = new Text({ text: "AdditionalContentText" });
		var oPanel = new Panel({
			items: [ oPanelItem ],
			additionalContent: [ oText ]
		});

		oPanel.setModel(new JSONModel({
			metadata: jQuery.extend(true, [], [ oPanelItem ])
		}), "$sapuimdcLink");

		oPanel.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Check if seperator is visible
		assert.ok(oPanel.getAggregation("_content").getContent()[1].getVisible(), "seperator is visible");
	});

});