/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/Link",
	"sap/ui/test/actions/Press",
	"sap/ui/mdc/enums/LinkType"
], function(QUnit, LinkDelegate, LinkItem, Link, Press, LinkType) {
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
});