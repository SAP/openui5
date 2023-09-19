/*globals sinon*/
sap.ui.define([
    "sap/ui/thirdparty/qunit-2",
    "sap/ui/mdc/LinkDelegate",
    "sap/ui/mdc/link/LinkItem",
    "sap/ui/mdc/Link",
    "sap/ui/test/actions/Press"
], function(QUnit, LinkDelegate, LinkItem, Link, Press) {
    "use strict";

    const aLinkItems = [
        new LinkItem({
            text: "testLInkItem",
            href: window.location.href + "#Link1",
            initiallyVisible: true
        })
    ];

    QUnit.test("Default values for delegate calls", function(assert) {
        const done = assert.async(5);

        LinkDelegate.fetchLinkItems().then(function(aLinkItems) {
            assert.equal(aLinkItems, null, "fetchLinkItems returns null");
            done();
        });

        LinkDelegate.fetchLinkType().then(function(oLinkType) {
            const oDefaultInitialType = {
                type: 2,
                directLink: undefined
            };
            assert.deepEqual(oLinkType.initialType, oDefaultInitialType, "initialType has type 2 and undefined direct link");
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
    });

    QUnit.test("Function call parameters", function(assert) {
        const done = assert.async(5);
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

        oLink.awaitControlDelegate().then(function() {
            const oDelegate = oLink.getControlDelegate();

            fnCheckFetchLinkItems(oDelegate);
            fnCheckFetchLinkType(oDelegate);
            fnCheckFetchAdditionalContent(oDelegate);
            fnCheckModifyLinkItems(oDelegate);
            fnCheckBeforeNavigationCallback(oDelegate);
        });
    });
});