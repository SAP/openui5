/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/link/waitForLink",
	"sap/ui/mdc/qunit/link/opa/test/Assertion"
], function(Opa5, waitForLink, LinkAssertion) {
	"use strict";

	const iShouldSeeAPopover = function(oLinkIdentifier, bOpen) {
		return waitForLink.call(this, oLinkIdentifier, {
			success: function(oLink) {
				const oField = oLink.getParent();
				const oFieldInfo = oField.getFieldInfo();
				const aDependents = oFieldInfo.getDependents();
				const bPopoverFound = aDependents.some(function(oDependent) {
					return oDependent.isA("sap.m.ResponsivePopover");
				});

				Opa5.assert.equal(bPopoverFound, bOpen, `should ${bOpen ? "" : "not"} see an open Popover for given Link`);
			}
		});
	};

	Opa5.createPageObjects({
		onAppUnderTestPageObject: {
			viewName: "sap.ui.mdc.LinkIntegrationTesting.appUnderTestPageObject.view.App",
			actions: {},
			assertions: {
				iShouldSeeAnOpenPopover: function(oLinkIdentifier) {
					return iShouldSeeAPopover.call(this, oLinkIdentifier, true);
				},
				iShouldNotSeeAnOpenPopover: function(oLinkIdentifier) {
					return iShouldSeeAPopover.call(this, oLinkIdentifier, false);
				},
				theApplicationURLContains: function(sText) {
					return new LinkAssertion().theApplicationURLContains.call(this, sText);
				}
			}
		}
	});

});
