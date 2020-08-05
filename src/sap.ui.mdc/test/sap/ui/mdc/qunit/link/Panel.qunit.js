/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/library", "sap/ui/mdc/link/Panel", "sap/ui/mdc/link/PanelItem", "sap/ui/layout/form/SimpleForm", "sap/ui/core/Icon"
], function(layoutLibrary, Panel, PanelItem, SimpleForm, Icon) {
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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

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
					href: "#A"
				}), new PanelItem({
					text: "B",
					href: "#B"
				}), new PanelItem({
					text: "C",
					href: "#C"
				})
			]
		});
		this.oPanel.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert before act
		assert.equal(this.oPanel.getDependents().length, 0);

		// act
		var done = assert.async();
		sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			sap.ui.require([
				"sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
			], function(FlexRuntimeInfoAPI) {
				sinon.stub(FlexRuntimeInfoAPI, "isFlexSupported").returns(true);
				sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").resolves();

				this.oPanel.openSelectionDialog(false, true, undefined);

				setTimeout(function() {
					FlexRuntimeInfoAPI.isFlexSupported.restore();
					FlexRuntimeInfoAPI.waitForChanges.restore();
					assert.equal(this.oPanel.getDependents().length, 1);
					assert.ok(this.oPanel.getDependents()[0].isA("sap.ui.mdc.link.SelectionDialog"));
					done();
				}.bind(this), 500);
			}.bind(this));
		}.bind(this));
	});
});
