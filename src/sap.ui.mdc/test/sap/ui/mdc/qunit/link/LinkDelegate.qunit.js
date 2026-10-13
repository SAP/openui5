/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/Link",
	"sap/ui/test/actions/Press",
	"sap/ui/mdc/enums/LinkType",
	"sap/ui/core/Lib"
], function(QUnit, LinkDelegate, LinkItem, Link, Press, LinkType, Lib) {
	"use strict";

	const aLinkItems = [
		new LinkItem({
			text: "testLInkItem",
			href: window.location.href + "#Link1",
			initiallyVisible: true
		})
	];

	QUnit.test("Default values for delegate calls", async function(assert) {
		const done = assert.async(5);

		LinkDelegate.fetchLinkItems().then(function(aLinkItems) {
			assert.equal(aLinkItems, null, "fetchLinkItems returns null");
			done();
		});

		LinkDelegate.fetchLinkType().then(function(oLinkType) {
			const oDefaultInitialType = {
				type: LinkType.Popover,
				directLink: undefined
			};
			assert.deepEqual(oLinkType.initialType, oDefaultInitialType, "initialType has type 'Popover' and undefined direct link");
			assert.equal(oLinkType.runtimeType, null, "runtimeType is null");
			done();
		});

		LinkDelegate.fetchAdditionalContent().then(function(aAdditionalContent) {
			assert.deepEqual(aAdditionalContent, [], "fetchAdditionalContent returns an empty array");
			done();
		});

		LinkDelegate.modifyLinkItems(null, null, aLinkItems).then(function(aModifiedLinkItems) {
			assert.deepEqual(aModifiedLinkItems, aLinkItems, "modifyLinkItems returns given LinkItem array");
			done();
		});

		LinkDelegate.beforeNavigationCallback().then(function(bNavigate) {
			assert.ok(bNavigate, "beforeNavigationCallback returns true");
			done();
		});

		assert.equal(LinkDelegate.getPanelId(new Link("link_test")), "link_test-idInfoPanel", "Correct id returned for panel");

		const { sTitle, oLabelledByControl } = await LinkDelegate.fetchPopoverTitle();
		assert.equal(sTitle, "", "No title returned");
		assert.equal(oLabelledByControl, undefined, "No labelledByControl returned");
	});

	QUnit.test("Function call parameters", async function(assert) {
		const done = assert.async(7);
		const oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: aLinkItems
				}
			}
		});
		const oBindingContext = oLink._getControlBindingContext();
		const oInfoLog = oLink._getInfoLog();


		const fnCheckFetchLinkItems = function(oDelegate) {
			const oSpyFetchLinkItems = sinon.spy(oDelegate, "fetchLinkItems");
			oLink._retrieveUnmodifiedLinkItems().then(function() {
				assert.ok(oSpyFetchLinkItems.alwaysCalledWith(oLink, oBindingContext, oInfoLog), "fetchLinkItems called with correct parameters");
				done();
			});
		};

		const fnCheckFetchLinkType = function(oDelegate) {
			const oSpyFetchLinkType = sinon.spy(oDelegate, "fetchLinkType");

			oLink.retrieveLinkType().then(function() {
				assert.ok(oSpyFetchLinkType.alwaysCalledWith(oLink), "fetchLinkType called with correct parameters");
				done();
			});
		};

		const fnCheckFetchAdditionalContent = function(oDelegate) {
			const oSpyFetchAdditionalContent = sinon.spy(oDelegate, "fetchAdditionalContent");

			oLink.retrieveAdditionalContent().then(function() {
				assert.ok(oSpyFetchAdditionalContent.alwaysCalledWith(oLink), "fetchAdditionalContent called with correct parameters");
				done();
			});
		};

		const fnCheckModifyLinkItems = function(oDelegate) {
			const oSpyModifyLinkItems = sinon.spy(oDelegate, "modifyLinkItems");
			oLink._retrieveUnmodifiedLinkItems().then(function(aUnmodifiedLinkItems) {
				oLink.retrieveLinkItems().then(function() {
					assert.ok(oSpyModifyLinkItems.alwaysCalledWith(oLink, oBindingContext, aUnmodifiedLinkItems), "modifyLinkitems called with correct parameters");
					done();
				});
			});
		};

		const fnCheckBeforeNavigationCallback = function(oDelegate) {
			const oSpyBeforeNavigationCallback = sinon.spy(oDelegate, "beforeNavigationCallback");
			oLink.getContent().then(function(oPanel) {
				const oEvent = {
					href: "testHref",
					target: undefined
				};
				oLink._beforeNavigationCallback(oEvent);
				assert.ok(oSpyBeforeNavigationCallback.alwaysCalledWith(oLink, oEvent), "beforeNavigationCallback called with correct parameters");
				done();
			});
		};

		const fnCheckGetPanelId = function(oDelegate) {
			const oSpyCheckGetPanelId = sinon.spy(oDelegate, "getPanelId");
			oLink.retrievePanelId().then(function(sPanelId) {
				assert.ok(oSpyCheckGetPanelId.alwaysCalledWith(oLink), "getPanelId called with correct parameters");
				assert.equal(sPanelId, "__link0-idInfoPanel", "getPanelId returns correct id.");
				done();
			});
		};

		const fnCheckFetchPopoverTitle = async function(oDelegate) {
			const oSpyCheckFetchPopoverTitle = sinon.spy(oDelegate, "fetchPopoverTitle");
			const oPanel = await oLink.getContent();
			const { sTitle, oLabelledByControl } = await oLink.retrievePopoverTitle(oPanel);

			assert.ok(oSpyCheckFetchPopoverTitle.alwaysCalledWith(oLink, oPanel), "fetchPopoverTitle called with correct parameters");
			assert.equal(sTitle, undefined, "Correct Title returned");
			assert.equal(oLabelledByControl, LinkDelegate._getLabelledByControl(oPanel), "Correct labelledByControl returned");
			done();
		};

		const oDelegate = await oLink.awaitControlDelegate();

		fnCheckFetchLinkItems(oDelegate);
		fnCheckFetchLinkType(oDelegate);
		fnCheckFetchAdditionalContent(oDelegate);
		fnCheckModifyLinkItems(oDelegate);
		fnCheckBeforeNavigationCallback(oDelegate);
		fnCheckGetPanelId(oDelegate);
		fnCheckFetchPopoverTitle(oDelegate);
	});

	QUnit.module("getPanelId", {
		beforeEach: function() {
			this.sandbox = sinon.sandbox.create();
			this.oLink = new Link("panelIdLink");
		},
		afterEach: function() {
			this.sandbox.restore();
			this.oLink.destroy();
			this.oLink = null;
		}
	});

	QUnit.test("sap.ui.fl not loaded - returns non-component-scoped id", function(assert) {
		// Arrange
		this.sandbox.stub(Lib, "isLoaded").withArgs("sap.ui.fl").returns(false);
		const oRequireSpy = this.sandbox.spy(sap.ui, "require");

		// Act
		const sPanelId = LinkDelegate.getPanelId(this.oLink);

		// Assert
		assert.equal(sPanelId, this.oLink.getId() + "-idInfoPanel", "Fallback panel id returned when sap.ui.fl is not loaded");
		assert.notOk(oRequireSpy.calledWith("sap/ui/fl/apply/api/FlexRuntimeInfoAPI"),
			"FlexRuntimeInfoAPI is not required when sap.ui.fl is not loaded");
	});

	QUnit.test("Flex not supported - returns non-component-scoped id", function(assert) {
		// Arrange
		const oFlexRuntimeInfoAPI = { isFlexSupported: this.sandbox.stub().returns(false) };
		this.sandbox.stub(Lib, "isLoaded").withArgs("sap.ui.fl").returns(true);
		this.sandbox.stub(sap.ui, "require")
			.withArgs("sap/ui/fl/apply/api/FlexRuntimeInfoAPI").returns(oFlexRuntimeInfoAPI);

		// Act
		const sPanelId = LinkDelegate.getPanelId(this.oLink);

		// Assert
		assert.equal(sPanelId, this.oLink.getId() + "-idInfoPanel", "Fallback panel id returned when flex is not supported");
		assert.ok(oFlexRuntimeInfoAPI.isFlexSupported.called, "isFlexSupported was consulted");
	});

	QUnit.test("Flex supported - returns component-scoped id", function(assert) {
		// Arrange
		const oAppComponent = { createId: this.sandbox.stub().returns("appComponent---idInfoPanel") };
		const oFlexRuntimeInfoAPI = { isFlexSupported: this.sandbox.stub().returns(true) };
		// Component is resolved inline via sap.ui.require; use a function so `instanceof` is valid.
		const Component = function() {};
		Component.getOwnerIdFor = this.sandbox.stub().returns("myComponentId");
		Component.getComponentById = this.sandbox.stub().withArgs("myComponentId").returns(oAppComponent);

		this.sandbox.stub(this.oLink, "_getSourceControl").returns({});
		this.sandbox.stub(Lib, "isLoaded").withArgs("sap.ui.fl").returns(true);
		const oRequireStub = this.sandbox.stub(sap.ui, "require");
		oRequireStub.withArgs("sap/ui/fl/apply/api/FlexRuntimeInfoAPI").returns(oFlexRuntimeInfoAPI);
		oRequireStub.withArgs("sap/ui/core/Component").returns(Component);

		// Act
		const sPanelId = LinkDelegate.getPanelId(this.oLink);

		// Assert
		assert.equal(sPanelId, "appComponent---idInfoPanel", "Component-scoped panel id returned when flex is supported");
		assert.ok(oAppComponent.createId.calledWith("idInfoPanel"), "createId called with 'idInfoPanel'");
	});

	QUnit.test("No source control - falls back to the parent as source control", function(assert) {
		// Arrange
		const oField = {};
		this.sandbox.stub(this.oLink, "getParent").returns(oField);
		this.sandbox.stub(this.oLink, "_getSourceControl").returns(undefined);
		const oSetSourceControlStub = this.sandbox.stub(this.oLink, "setSourceControl");
		this.sandbox.stub(Lib, "isLoaded").withArgs("sap.ui.fl").returns(false);

		// Act
		const sPanelId = LinkDelegate.getPanelId(this.oLink);

		// Assert
		assert.ok(oSetSourceControlStub.calledWith(oField), "setSourceControl called with the parent as fallback");
		assert.equal(sPanelId, this.oLink.getId() + "-idInfoPanel", "Fallback panel id returned");
	});
});