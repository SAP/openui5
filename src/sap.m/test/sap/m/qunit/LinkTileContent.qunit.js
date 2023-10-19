/*global QUnit */
sap.ui.define([
	"sap/m/GenericTile",
	"sap/m/LinkTileContent",
	"sap/ui/core/Core"
], function(GenericTile,LinkTileContent,oCore) {
	"use strict";
	QUnit.module("Rendering tests", {
		beforeEach: function() {
			this.oGenericTile = new GenericTile({
				linkTileContents: [
					{
						iconSrc: "sap-icon://action-settings",
						linkText: "SAP",
						linkHref: "www.sap.com"
					}
				]
			}).placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oGenericTile.destroy();
			this.oGenericTile = null;
		}
	});

	QUnit.test("Link and Icon rendered", function(assert) {
		const oLinkTileContent = this.oGenericTile.getLinkTileContents()[0];
		assert.ok(oLinkTileContent._getLink().isA("sap.m.Link"),"Link is rendered");
		assert.ok(oLinkTileContent._getIcon().isA("sap.ui.core.Icon"),"Icon is rendered");
	});
	QUnit.test("Link press event",function(assert){
		const oLinkTileContent = this.oGenericTile.getLinkTileContents()[0];
		let isEventFired = false;
		oLinkTileContent.attachLinkPress(() => {
			isEventFired = true;
		});
		oLinkTileContent.fireLinkPress();
		assert.ok(isEventFired,"Link press event has been pressed");
	});
});