/*globals sinon*/
sap.ui.define([
    "sap/ui/thirdparty/qunit-2",
    "sap/ui/mdc/LinkDelegate",
    "sap/ui/mdc/link/LinkItem",
    "sap/ui/mdc/Link",
    "sap/ui/test/actions/Press"
], function(QUnit, LinkDelegate, LinkItem, Link, Press) {
    "use strict";

    var aLinkItems = [
        new LinkItem({
            text: "testLInkItem",
            href: window.location.href + "#Link1",
            initiallyVisible: true
        })
    ];

    QUnit.test("Default values for delegate calls", function(assert) {
        var done = assert.async(5);

        LinkDelegate.fetchLinkItems().then(function(aLinkItems) {
            assert.equal(aLinkItems, null, "fetchLinkItems returns null");
            done();
        });

        LinkDelegate.fetchLinkType().then(function(oLinkType) {
            var oDefaultInitialType = {
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
        var done = assert.async(5);
        var oLink = new Link({
            delegate: {
                name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
                payload: {
                    items: aLinkItems
                }
            }
        });

        var oBindingContext = oLink._getControlBindingContext();
        var oInfoLog = oLink._getInfoLog();

        var fnCheckFetchLinkItems = function(oDelegate) {
            var oSpyFetchLinkItems = sinon.spy(oDelegate, "fetchLinkItems");
            oLink._retrieveUnmodifiedLinkItems().then(function() {
                assert.ok(oSpyFetchLinkItems.alwaysCalledWith(oLink, oBindingContext, oInfoLog), "fetchLinkItems called with correct parameters");
                done();
            });
        };

        var fnCheckFetchLinkType = function(oDelegate) {
            var oSpyFetchLinkType = sinon.spy(oDelegate, "fetchLinkType");

            oLink.retrieveLinkType().then(function() {
                assert.ok(oSpyFetchLinkType.alwaysCalledWith(oLink), "fetchLinkType called with correct parameters");
                done();
            });
        };

        var fnCheckFetchAdditionalContent = function(oDelegate) {
            var oSpyFetchAdditionalContent = sinon.spy(oDelegate, "fetchAdditionalContent");

            oLink.retrieveAdditionalContent().then(function() {
                assert.ok(oSpyFetchAdditionalContent.alwaysCalledWith(oLink), "fetchAdditionalContent called with correct parameters");
                done();
            });
        };

        var fnCheckModifyLinkItems = function(oDelegate) {
            var oSpyModifyLinkItems = sinon.spy(oDelegate, "modifyLinkItems");
            oLink._retrieveUnmodifiedLinkItems().then(function(aUnmodifiedLinkItems) {
                oLink.retrieveLinkItems().then(function() {
                    assert.ok(oSpyModifyLinkItems.alwaysCalledWith(oLink, oBindingContext, aUnmodifiedLinkItems), "modifyLinkitems called with correct parameters");
                    done();
                });
            });
        };

        var fnCheckBeforeNavigationCallback = function(oDelegate) {
            var oSpyBeforeNavigationCallback = sinon.spy(oDelegate, "beforeNavigationCallback");
            oLink.getContent().then(function(oPanel) {
                var oEvent = {
                    href: "testHref",
                    target: undefined
                };
                oLink._beforeNavigationCallback(oEvent);
                assert.ok(oSpyBeforeNavigationCallback.alwaysCalledWith(oLink, oEvent), "beforeNavigationCallback called with correct parameters");
                done();
            });
        };

        oLink.awaitControlDelegate().then(function() {
            var oDelegate = oLink.getControlDelegate();

            fnCheckFetchLinkItems(oDelegate);
            fnCheckFetchLinkType(oDelegate);
            fnCheckFetchAdditionalContent(oDelegate);
            fnCheckModifyLinkItems(oDelegate);
            fnCheckBeforeNavigationCallback(oDelegate);
        });
    });
});