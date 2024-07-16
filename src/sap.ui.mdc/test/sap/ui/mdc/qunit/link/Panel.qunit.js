/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/library",
	"sap/ui/mdc/link/Panel",
	"sap/ui/mdc/link/PanelItem",
	"sap/ui/core/Icon",
	"sap/m/p13n/Engine",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Text",
	"sap/ui/mdc/Link",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Event",
	"sap/m/Link",
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(layoutLibrary, Panel, PanelItem, Icon, Engine, nextUIUpdate, Text, Link, LinkItem, JSONModel, jQuery, Event, MLink, Library, CoreLibrary) {
	"use strict";

	const { HasPopup } = CoreLibrary.aria;

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
		beforeEach: function() {},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	function fnHasVisibleText(assert, oPanel, sText, bVisible) {
		const aElements = oPanel.$().find("span:visible");
		let bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].textContent === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	}
	function fnHasVisibleLink(assert, oPanel, sText, bVisible) {
		const aElements = oPanel.$().find("a:visible");
		let bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].text === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	}
	function fnHasVisibleIcons(assert, oPanel, iCountVisibleIcons) {
		const aElements = oPanel.$().find("span:visible");
		let iCount = 0;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].style.cssText.indexOf("SAP-icons") > -1) {
				iCount++;
			}
		});
		assert.equal(iCount, iCountVisibleIcons, `Has ${iCountVisibleIcons} visible Icon${iCountVisibleIcons === 1 ? "" : "s"}`);
	}
	function fnHasVisibleMoreLinksButton(assert, oPanel, bVisible) {
		assert.equal(oPanel.$().find("button:visible").length, bVisible ? 1 : 0, `Has ${!bVisible ? "in" : ""}visible "More Links" button.`);
		// fnHasVisibleText(assert, oPanel, Library.getResourceBundleFor("sap.ui.mdc").getText("info.POPOVER_DEFINE_LINKS"), bVisible);
	}
	QUnit.test("no 'item'", async function(assert) {
		this.oPanel = new Panel({
			items: []
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);

	});
	QUnit.test("invalid 'item'", async function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A" // invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid 'item'", async function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid main 'item'", async function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A",
					href: "#A"
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("invalid main 'item'", async function(assert) {
		this.oPanel = new Panel({
			items: [
				new PanelItem({
					text: "A" // invalid item
				})
			]
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("'additionalContent'", async function(assert) {
		this.oPanel = new Panel({
			additionalContent: new Icon({
				src: "sap-icon://person-placeholder"
			})
		});

		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		fnHasVisibleIcons(assert, this.oPanel, 1);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true); // nothing to be persisted
	});

	QUnit.module("sap.ui.mdc.link.Panel: visibility of items", {
		beforeEach: function() {},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("invalid visible 'item'", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleText(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("invalid invisible 'item'", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleText(assert, this.oPanel, "A", false, "Panel is not responsible for the visibility of items, it takes them as they are");
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid visible 'item'", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleLink(assert, this.oPanel, "A", true);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});
	QUnit.test("valid invisible 'item'", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleText(assert, this.oPanel, "A", false);
		fnHasVisibleMoreLinksButton(assert, this.oPanel, true);
	});

	QUnit.module("sap.ui.mdc.link.Panel: default icon", {
		beforeEach: function() {},
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("all items have not icon", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleIcons(assert, this.oPanel, 0);
	});
	QUnit.test("all items have icon", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleIcons(assert, this.oPanel, 2);
	});
	QUnit.test("an item have not icon", async function(assert) {
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
		await nextUIUpdate();

		fnHasVisibleIcons(assert, this.oPanel, 2);
	});

	const fnLinkSelectionPanelGetLink = function(oLinkSelectionPanel, iIndex) {
		return oLinkSelectionPanel.getAggregation("_content").getItems()[0].getItems()[iIndex].getCells()[0].getItems()[0].getItems()[0];
	};

	QUnit.module("sap.ui.mdc.link.Panel: open selection dialog", {
		afterEach: function() {
			this.oPanel.destroy();
		}
	});
	QUnit.test("test 01", async function(assert) {
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
		await nextUIUpdate();

		// assert before act
		assert.equal(this.oPanel.getDependents().length, 0);

		// act
		const done = assert.async();
		Library.load({ name: 'sap.ui.fl' }).then(function() {
			sap.ui.require([
				"sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
			], function(FlexRuntimeInfoAPI) {
				sinon.stub(FlexRuntimeInfoAPI, "isFlexSupported").returns(true);
				sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").resolves();

				this.oPanel._openPersonalizationDialog().then(function(oDialog) {
					FlexRuntimeInfoAPI.isFlexSupported.restore();
					FlexRuntimeInfoAPI.waitForChanges.restore();
					assert.ok(oDialog.isOpen(), "Dialog opened");
					assert.ok(this.oPanel.getDependents()[0].isA("sap.m.p13n.Popup"), "Dialog is a 'sap.m.p13n.Popup'");
					assert.ok(oDialog.getPanels()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");
					assert.equal(oDialog.getPanels()[0].getEnableReorder(), false, "enableReorder property of LinkSelectionPanel is false");
					assert.equal(oDialog.getPanels()[0].getAggregation("_content").getItems()[0].getColumns().length, 1, "Only one column in column aggregation of LinkSelectionPanel -> no reorder column");

					done();
				}.bind(this));

			}.bind(this));
		}.bind(this));
	});

	QUnit.test("check internalHref", function(assert) {
		const sBaseUrl = window.location.href;
		const done = assert.async();
		const oLink = new Link({
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
			this.oPanel._openPersonalizationDialog().then(function(oDialog) {
				assert.ok(oDialog.isOpen(), "Dialog opened");
				assert.ok(oDialog.isA("sap.m.p13n.Popup"), "Popup is a 'sap.m.p13n.Popup'");
				assert.ok(oDialog.getPanels()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");
				assert.equal(fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 0).getCustomData()[0].getValue(), sBaseUrl + "#AInternal", "Correct internal href");
				assert.equal(fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 1).getCustomData()[0].getValue(), "#BInternal", "Correct internal href");
				assert.equal(fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 2).getCustomData()[0].getValue(), "#CInternal", "Correct internal href");

				fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 0).firePress();
				setTimeout(function() {
					assert.equal(window.location.href, sBaseUrl + "#AInternal", "Navigation happened with internalHref");

					done();
				}, 50);
			});
		}.bind(this));
	});

	QUnit.test("check navigation without internalHref", function(assert) {
		const sBaseUrl = window.location.href;
		const done = assert.async();
		const oLink = new Link({
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
			this.oPanel._openPersonalizationDialog().then(function(oDialog) {
				assert.ok(oDialog.isOpen(), "Dialog opened");
				assert.ok(oDialog.isA("sap.m.p13n.Popup"), "Popup is a 'sap.m.p13n.Popup'");
				assert.ok(oDialog.getPanels()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");

				fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 0).firePress();
				setTimeout(function() {
					assert.equal(window.location.href, sBaseUrl + "#A", "Navigation happened without internalHref");

					done();
				}, 50);
			});
		}.bind(this));
	});

	const fnCheckLinkSelectionPanelNavigation = function(assert, oEventSettings) {
		const sBaseUrl = window.location.href;
		const done = assert.async();
		const oLink = new Link({
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
						})
					]
				}
			}
		});
		oLink.createPopover().then(function(oPopover) {
			this.oPanel = oPopover.getContent()[0];
			this.oPanel._openPersonalizationDialog().then(function(oDialog) {
				assert.ok(oDialog.isOpen(), "Dialog opened");
				assert.ok(oDialog.isA("sap.m.p13n.Popup"), "Popup is a 'sap.m.p13n.Popup'");
				assert.ok(oDialog.getPanels()[0].isA("sap.ui.mdc.p13n.panels.LinkSelectionPanel"), "Dialog content is a 'sap.ui.mdc.p13n.panels.LinkSelectionPanel'");

				fnLinkSelectionPanelGetLink(oDialog.getPanels()[0], 0).firePress(oEventSettings);

				setTimeout(function() {
					assert.equal(window.location.href, sBaseUrl, "navigation prevented");
					done();
				}, 50);
			});
		}.bind(this));
	};

	[
		{ ctrlKey: true, metaKey: false },
		{ ctrlKey: false, metaKey: true },
		{ ctrlKey: true, metaKey: true }
	].forEach(function(oEventSettings) {
		QUnit.test("Prevent navigation when ctrlKey" + (!oEventSettings.ctrlKey ? " not" : "") + " pressed and metaKey " + (!oEventSettings.metaKey ? " not" : "") + " pressed", function(assert) {
			fnCheckLinkSelectionPanelNavigation.call(this, assert, oEventSettings);
		});
	});

	QUnit.test("initialization of MetadataHelper", async function(assert) {
		this.oPanel = new Panel();
		const oLinkRetrieveAllMetadataSpy = sinon.spy(Link, "retrieveAllMetadata");

		// assert before act
		assert.equal(this.oPanel._oMetadataHelper, null);
		assert.ok(oLinkRetrieveAllMetadataSpy.notCalled, "Link 'retrieveAllMetadata' function not called after initPropertyHelper");

		// act
		const oPropertyHelper = await this.oPanel.initPropertyHelper();

		// assert
		assert.ok(oLinkRetrieveAllMetadataSpy.calledOnce, "Link 'retrieveAllMetadata' function called after initPropertyHelper");
		assert.ok(this.oPanel._oMetadataHelper instanceof Function, "exists");
		assert.ok(oPropertyHelper.getProperties instanceof Function, "'getProperties' function exists for PropertyHelper");
	});


	QUnit.module("basic methods");

	QUnit.test("navigate without FLP", function(assert) {
		const sBaseUrl = window.location.href;

		Panel.navigate(sBaseUrl + "#navigate");
		assert.equal(window.location.href, sBaseUrl + "#navigate", "Navigation happened");
		assert.equal(Panel.oNavigationPromise, undefined, "Navigation Promise is undefined");
	});

	QUnit.module("onPressLink", {
		beforeEach: function() {
			this.oMLink = new MLink({});
		},
		afterEach: function() {
			this.oMLink.destroy();
		}
	});

	const fnCheckPreventedNavigation = function(assert, oPanel, oEvent) {
		const oPanelNavigateSpy = sinon.spy(Panel, "navigate");

		assert.ok(oPanelNavigateSpy.notCalled, "Panel 'navigate' function not called before onPressLink");
		oPanel.onPressLink(oEvent);

		assert.ok(oPanelNavigateSpy.notCalled, "Panel 'navigate' function not called after 'onPressLink'");
		oPanelNavigateSpy.restore();
	};

	QUnit.test("without beforeNavigationCallback", function(assert) {
		const oPanel = new Panel({});
		const oEvent = new Event("eventId", this.oMLink, {});

		fnCheckPreventedNavigation(assert, oPanel, oEvent);
	});

	QUnit.test("with target='_blank'", function(assert) {
		const oPanel = new Panel({
			beforeNavigationCallback: function() {
				return Promise.resolve(true);
			}
		});
		this.oMLink.setTarget("_blank");
		const oEvent = new Event("eventId", this.oMLink, {});

		fnCheckPreventedNavigation(assert, oPanel, oEvent);
	});

	[
		{ ctrlKey: true, metaKey: false },
		{ ctrlKey: false, metaKey: true },
		{ ctrlKey: true, metaKey: true }
	].forEach(function(oEventSettings) {
		QUnit.test("ctrlKey" + (!oEventSettings.ctrlKey ? " not" : "") + " pressed and metaKey " + (!oEventSettings.metaKey ? " not" : "") + " pressed", function(assert) {
			const oPanel = new Panel({
				beforeNavigationCallback: function() {
					return Promise.resolve(true);
				}
			});
			const oEvent = new Event("eventId", this.oMLink, oEventSettings);

			fnCheckPreventedNavigation(assert, oPanel, oEvent);
		});
	});

	QUnit.test("straight forward", function(assert) {
		const done = assert.async();
		const sBaseUrl = window.location.href;
		const oPanel = new Panel({
			beforeNavigationCallback: function() {
				return Promise.resolve(true);
			}
		});
		this.oMLink.setHref(sBaseUrl + "#onNavigate");
		const oEvent = new Event("eventId", this.oMLink, {});
		const oPanelNavigateSpy = sinon.spy(Panel, "navigate");

		assert.ok(oPanelNavigateSpy.notCalled, "Panel 'navigate' function not called before onPressLink");
		oPanel.onPressLink(oEvent);

		setTimeout(function() {
			assert.ok(oPanelNavigateSpy.calledOnce, "Panel 'navigate' function called after onPressLink");
			assert.equal(window.location.href, sBaseUrl + "#onNavigate", "Navigation happened");

			oPanelNavigateSpy.restore();
			done();
		}, 50);
	});

	QUnit.module("applySettings");

	QUnit.test("with additionalContent", function(assert) {
		const oText = new Text({ text: "Text" });
		const oPanel = new Panel({
			additionalContent: [oText]
		});

		// Check if additionalContent got forwarded
		assert.deepEqual(oPanel.getAdditionalContent(), [], "additionalContent aggregation of Panel is empty");
		assert.deepEqual(oPanel._getAdditionalContentArea().getItems(), [oText], "additionalContent got forwarded to internal '_content' aggregation");
	});

	QUnit.test("enablePersonalization false", function(assert) {
		const oPanel = new Panel({
			enablePersonalization: false
		});

		assert.equal(oPanel._getPersonalizationButton().getVisible(), false, "personalization buttons visibility set to false");
		assert.equal(oPanel._getPersonalizationButton().getAriaHasPopup(), HasPopup.Dialog, "personalization button has correct ariaHasPopup value");
	});

	QUnit.test("check if seperator is visible", async function(assert) {
		const oPanelItem = new PanelItem({
			text: "PanelItem",
			href: "#PanelItem"
		});
		const oText = new Text({ text: "AdditionalContentText" });
		const oPanel = new Panel({
			items: [oPanelItem],
			additionalContent: [oText]
		});

		oPanel.setModel(new JSONModel({
			metadata: jQuery.extend(true, [], [oPanelItem])
		}), "$sapuimdcLink");

		oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Check if seperator is visible
		assert.ok(oPanel._getSeparator().getVisible(), "seperator is visible");
	});

});