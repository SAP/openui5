/* global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/Field",
	"sap/ui/core/util/MockServer",
	"sap/ui/mdc/link/FakeFlpConnector",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/mdc/link/ContactDetails",
	"sap/ui/mdc/link/LinkItem",
	"sap/m/Button",
	"sap/ui/mdc/Link"
], function(jQuery,
	qutils,
	Device,
	EditMode,
	Field,
	MockServer,
	FakeFlpConnector,
	ODataModel,
	ContactDetails,
	LinkItem,
	Button,
	Link) {
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
		beforeEach: function() {
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
		afterEach: function() {
			stopMockServer();
			disableFakeFlpConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	var fnTestRenderAsAText = function(assert, oField) {
		// act
		var done = assert.async();
		oField.setFieldInfo(new Link({
			delegate: {
				name: "sap/ui/mdc/flp/FlpLinkDelegate",
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
		enableFakeFlpConnector({});

		fnTestRenderAsAText(assert, this.oField);
	});

	QUnit.test("no semantic object, no content", function(assert) {
		enableFakeFlpConnector({
			SO1: {
				links: []
			}
		});

		fnTestRenderAsAText(assert, this.oField);
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open direct navigation", {
		beforeEach: function() {
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
		afterEach: function() {
			stopMockServer();
			disableFakeFlpConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	QUnit.test("direct link with target='_blank'", function(assert) {
		var sTarget = "_blank";
		var done = assert.async();
		enableFakeFlpConnector({});
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					linkType: {
						type: 1,
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
		var sTarget = "_self";
		var done = assert.async();
		enableFakeFlpConnector({});
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/field/FieldInfoLinkDelegate",
				payload: {
					linkType: {
						type: 1,
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
		beforeEach: function() {
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
		afterEach: function() {
			stopMockServer();
			disableFakeFlpConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	QUnit.test("no links, no popover", function(assert) {
		var done = assert.async();
		var oField = this.oField;
		enableFakeFlpConnector({
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
				assert.equal(oEvent.getSource()._oPopover.$().find(".mdcbaseinfoPanelDefaultAdditionalContent").length, 1);
				done();
			}
		}));
		oField.getFieldInfo().getTriggerHref().then(function(sHref) {
			// wait until mdc.Field has been re-created and sap.m.Link is rendered
			setTimeout(function() {
				assert.equal(oField.$().find("a").length, 1);
				assert.equal(sHref, null);
				qutils.triggerEvent(Device.support.touch ? "tap" : "click", oField.$().find("a")[0], {
					srcControl: jQuery(oField.$().find("a")[0]).control(0)
				});
			}, 100);
		});
	});

	QUnit.module("sap.ui.mdc.field.FieldInfo: open not empty popover", {
		beforeEach: function() {
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
		afterEach: function() {
			stopMockServer();
			disableFakeFlpConnector();
			this.oField.destroy();
			this.oODataModel.destroy();
		}
	});

	var fnTestOpenNotEmptyPopover = function(assert, fnCheckPopover) {
		// act
		var done = assert.async();

		return function(oEvent) {
			var oFieldInfo = oEvent.getSource();
			fnCheckPopover(oFieldInfo);
			done();
		};
	};

	QUnit.test("item: with 'text'", function(assert) {
		enableFakeFlpConnector({});
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
					srcControl: jQuery(oField.$().find("a")[0]).control(0)
				});
			}, 100);
		});
	});

	QUnit.test("content", function(assert) {
		enableFakeFlpConnector({});
		var oField = this.oField;
		var fnForPopoverAfterOpen = function(oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
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
					srcControl: jQuery(oField.$().find("a")[0]).control(0)
				});
			}, 100);
		});
	});

	QUnit.test("multiple content", function(assert) {
		enableFakeFlpConnector({});
		var oField = this.oField;
		var fnForPopoverAfterOpen = function(oFieldInfo) {
			var oPopover = oFieldInfo.getDependents()[0];
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
					srcControl: jQuery(oField.$().find("a")[0]).control(0)
				});
			}, 100);
		});
	});
});
