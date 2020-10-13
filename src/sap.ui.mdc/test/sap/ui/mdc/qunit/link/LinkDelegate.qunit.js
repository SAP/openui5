/*globals sinon*/
sap.ui.define([
    "sap/ui/thirdparty/qunit-2",
    "sap/ui/mdc/BaseDelegate",
    "sap/ui/mdc/util/TypeUtil",
    "sap/ui/mdc/LinkDelegate",
    "sap/ui/mdc/link/LinkItem",
    "sap/ui/mdc/Link",
    "sap/ui/test/actions/Press"
], function(QUnit, BaseDelegate, TypeUtil, LinkDelegate, LinkItem, Link, Press) {
    "use strict";

    var aLinkItems = [
        new LinkItem({
            text: "testLInkItem",
            href: "",
            initiallyVisible: true
        })
    ];

    QUnit.test("BaseDelegate", function(assert) {
        assert.deepEqual(BaseDelegate.getTypeUtil(), TypeUtil, "BaseDelegate returns correct TypeUtil");
    });

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

        var oPayload = oLink.getPayload() ? oLink.getPayload() : {};
        var oBindingContext = oLink._getControlBindingContext();
        var oInfoLog = oLink._getInfoLog();

        var fnCheckFetchLinkItems = function(oDelegate) {
            var oSpyFetchLinkItems = sinon.spy(oDelegate, "fetchLinkItems");
            oLink._retrieveUnmodifiedLinkItems().then(function() {
                assert.ok(oSpyFetchLinkItems.alwaysCalledWith(oPayload, oBindingContext, oInfoLog), "fetchLinkItems called with correct parameters");
                done();
            });
        };

        var fnCheckFetchLinkType = function(oDelegate) {
            var oSpyFetchLinkType = sinon.spy(oDelegate, "fetchLinkType");

            oLink.retrieveLinkType().then(function() {
                assert.ok(oSpyFetchLinkType.alwaysCalledWith(oPayload, oLink), "fetchLinkType called with correct parameters");
                done();
            });
        };

        var fnCheckFetchAdditionalContent = function(oDelegate) {
            var oSpyFetchAdditionalContent = sinon.spy(oDelegate, "fetchAdditionalContent");

            oLink.retrieveAdditionalContent().then(function() {
                assert.ok(oSpyFetchAdditionalContent.alwaysCalledWith(oPayload, oLink), "fetchAdditionalContent called with correct parameters");
                done();
            });
        };

        var fnCheckModifyLinkItems = function(oDelegate) {
            var oSpyModifyLinkItems = sinon.spy(oDelegate, "modifyLinkItems");
            oLink._retrieveUnmodifiedLinkItems().then(function(aUnmodifiedLinkItems) {
                oLink.retrieveLinkItems().then(function() {
                    assert.ok(oSpyModifyLinkItems.alwaysCalledWith(oPayload, oBindingContext, aUnmodifiedLinkItems), "modifyLinkitems called with correct parameters");
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
                assert.ok(oSpyBeforeNavigationCallback.alwaysCalledWith(oPayload, oEvent), "beforeNavigationCallback called with correct parameters");
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