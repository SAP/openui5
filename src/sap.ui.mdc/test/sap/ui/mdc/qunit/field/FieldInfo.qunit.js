/* global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/Field",
	"sap/ui/core/util/MockServer",
	"testutils/link/FakeUShellConnector",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/mdc/link/LinkItem",
	"sap/m/Button",
	"sap/ui/mdc/Link",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/mdc/enums/LinkType"
], function(
	qutils,
	Device,
	FieldEditMode,
	Field,
	MockServer,
	FakeUShellConnector,
	ODataModel,
	LinkItem,
	Button,
	Link,
	nextUIUpdate,
	Element,
	LinkType) {
	"use strict";

	let oMockServer;

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

	function enableFakeUShellConnector(oSetting) {
		FakeUShellConnector.enableFakeConnector(oSetting);
	}

	function disableFakeUShellConnector() {
		FakeUShellConnector.disableFakeConnector();
	}

	QUnit.module("sap.ui.mdc.field.FieldInfo: API", {
		beforeEach: function() {
			this.oFieldInfo = new Link();
		},
		afterEach: function() {
			this.oFieldInfo.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(this.oFieldInfo);
	});

	// ----------------------------------------------------------------------------------------------------------------
	// ------------------------------------- open popup ---------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------------------

	QUnit.module("sap.ui.mdc.field.FieldInfo: rendered as a text", {
		beforeEach: async function() {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: FieldEditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			stopMockServer();
			disableFakeUShellConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	const fnTestRenderAsAText = function(assert, oField) {
		// act
		const done = assert.async();
		oField.setFieldInfo(new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {
					semanticObjects: ["SODummy"]
				}
			}
		}));
		assert.equal(oField.$().find("a").length, 0);
		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			assert.equal(sHref, null);
			done();
		});
	};

	QUnit.test("no semantic object, no content", function(assert) {
		enableFakeUShellConnector({});

		fnTestRenderAsAText(assert, this.oField);
	});

	QUnit.test("no semantic object, no content", function(assert) {
		enableFakeUShellConnector({
			SO1: {
				links: []
			}
		});

		fnTestRenderAsAText(assert, this.oField);
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open direct navigation", {
		beforeEach: async function() {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: FieldEditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			stopMockServer();
			disableFakeUShellConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	QUnit.test("direct link with target='_blank'", function(assert) {
		const sTarget = "_blank";
		const done = assert.async();
		enableFakeUShellConnector({});
		const oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					linkType: {
						type: LinkType.DirectLink,
						directLink: new LinkItem({
							href: "#action01",
							target: sTarget
						})
					}
				}
			}
		});
		this.oField.setFieldInfo(oLink);
		oLink.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(this.oField.$().find("a").length, 1);
				assert.equal(this.oField.$().find("a")[0].text, "click me");
				assert.equal(oLinkItem.href, "#action01");
				assert.equal(oLinkItem.target, sTarget);
				done();
			}.bind(this), 100);
		}.bind(this));
	});

	QUnit.test("item: with 'href'", function(assert) {
		const sTarget = "_self";
		const done = assert.async();
		enableFakeUShellConnector({});
		const oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					linkType: {
						type: LinkType.DirectLink,
						directLink: new LinkItem({
							href: "#action01"
						})
					}
				}
			}
		});
		this.oField.setFieldInfo(oLink);
		oLink.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(this.oField.$().find("a").length, 1);
				assert.equal(this.oField.$().find("a")[0].text, "click me");
				assert.equal(oLinkItem.href, "#action01");
				assert.equal(oLinkItem.target, sTarget);
				done();
			}.bind(this), 100);
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open empty popover", {
		beforeEach: async function() {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: FieldEditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			stopMockServer();
			disableFakeUShellConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	QUnit.test("no links, no popover", function(assert) {
		const done = assert.async();
		const oField = this.oField;
		enableFakeUShellConnector({
			SO1: {
				links: []
			}
		});
		oField.setFieldInfo(new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					semanticObjects: ["SO1"]
				}
			},
			popoverAfterOpen: function (oEvent) {
				const oPopover = oEvent.getSource().getDependents().find(function(oDependent) {
					return oDependent.isA("sap.m.ResponsivePopover");
				});
				assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 1);
				done();
			}
		}));
		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(oField.$().find("a").length, 1);
				assert.equal(sHref, null);
				qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
					srcControl: Element.closestTo(oField.$().find("a")[0])
				});
			}, 100);
		});
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open not empty popover", {
		beforeEach: async function() {
			startMockServer("test-resources/sap/ui/mdc/qunit/base/info/mockserver/metadata.xml", "test-resources/sap/ui/mdc/qunit/base/info/mockserver/", "/odataFake/");
			this.oODataModel = new ODataModel("/odataFake/");

			this.oField = new Field({
				value: "click me",
				editMode: FieldEditMode.Display
			});
			this.oField.setModel(this.oODataModel);
			this.oField.bindElement({
				path: "/ProductCollection('38094020.0')"
			});

			this.oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			stopMockServer();
			disableFakeUShellConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	const fnTestOpenNotEmptyPopover = function(assert, fnCheckPopover) {
		// act
		const done = assert.async();

		return function(oEvent) {
			const oFieldInfo = oEvent.getSource();
			fnCheckPopover(oFieldInfo);
			done();
		};
	};

	/* Not needed as we navigate directly in case of a mdc.Link as FieldInfo. Keeping the coding in as we might implement other FieldInfos in the future.
	QUnit.test("item: with 'text'", function(assert) {
		enableFakeUShellConnector({});
		var oField = this.oField;
		var fnForPopoverAfterOpen = function(oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[1];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 1);
			assert.equal(oPopover.$().find(".sapMLabel:visible")[0].textContent, "Link Item 01", "Available action");
		};
		oField.setFieldInfo(new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					semanticObjects: [],
					items: [
						new LinkItem({
							text: "Link Item 01",
							initiallyVisible: true
						})
					]
				}
			},
			popoverAfterOpen: fnTestOpenNotEmptyPopover(assert, fnForPopoverAfterOpen)
		}));
		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(oField.$().find("a").length, 1);
				assert.equal(sHref, null);
				qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
					srcControl: Element.closestTo(oField.$().find("a")[0])
				});
			}, 100);
		});
	});
	*/

	QUnit.test("content", function(assert) {
		enableFakeUShellConnector({});
		const oField = this.oField;
		const fnForPopoverAfterOpen = function(oFieldInfo) {
			const oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 0);
		};
		oField.setFieldInfo(new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					semanticObjects: [],
					loadAdditionalContent: true
				}
			},
			popoverAfterOpen: fnTestOpenNotEmptyPopover(assert, fnForPopoverAfterOpen)
		}));

		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(oField.$().find("a").length, 1);
				assert.equal(sHref, null);
				qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
					srcControl: Element.closestTo(oField.$().find("a")[0])
				});
			}, 100);
		});
	});

	QUnit.test("multiple content", function(assert) {
		enableFakeUShellConnector({});
		const oField = this.oField;
		const fnForPopoverAfterOpen = function(oFieldInfo) {
			const oPopover = oFieldInfo.getDependents()[0];
			assert.equal(oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 0);
			assert.equal(oPopover.$().find("a").length, 0);
			assert.equal(oPopover.$().find(".sapMLabel:visible").length, 0);
		};
		oField.setFieldInfo(new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					semanticObjects: [],
					loadAdditionalContent: true,
					addAdditionalContent: new Button({
						text: "Additional Button"
					})
				}
			},
			popoverAfterOpen: fnTestOpenNotEmptyPopover(assert, fnForPopoverAfterOpen)
		}));
		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(oField.$().find("a").length, 1);
				assert.equal(sHref, null);
				qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
					srcControl: Element.closestTo(oField.$().find("a")[0])
				});
			}, 100);
		});
	});
});
