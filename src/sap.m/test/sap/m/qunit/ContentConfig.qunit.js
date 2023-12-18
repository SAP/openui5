/*global QUnit */
sap.ui.define([
	"sap/m/TileAttribute",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/m/ContentConfig"
], function(TileAttribute,library,oCore,ContentConfig) {
	"use strict";

	//shortcut for sap.m.ContentConfigType
	var ContentConfigType = library.ContentConfigType;

    QUnit.module("ContentConfig rendering", {
		beforeEach: function() {
            this.oTileAttribute1 =  new TileAttribute({
                    label: "Agreement Type:",
                    contentConfig: new ContentConfig("contConfig",{
                        type:ContentConfigType.Text,
                        text:"SAP",
                        href:"https://www.sap.com/"
                    })
			}).placeAt("qunit-fixture");
            this.oTileAttribute2 =  new TileAttribute({
                label: "Agreement Type:",
                contentConfig: new ContentConfig("contConfig1",{
                    type:ContentConfigType.Link,
                    text:"SAP",
                    href:"https://www.sap.com/"
                })
            }).placeAt("qunit-fixture");
            oCore.applyChanges();
		},
		afterEach: function() {
			this.oTileAttribute1.destroy();
			this.oTileAttribute1 = null;

			this.oTileAttribute2.destroy();
			this.oTileAttribute2 = null;
		}
	});

    QUnit.test("Text to be rendered inside a TileAttribute when the type is set as text", function(assert) {
        var oText = this.oTileAttribute1.getContentConfig().getInnerControl();
		assert.ok(oText.isA("sap.m.Text"),"Text has been rendered");
    });

	QUnit.test("Link to be rendered inside a TileAttribute when the type is set as link", function(assert) {
		var oLink = this.oTileAttribute2.getContentConfig().getInnerControl();
		assert.ok(oLink.isA("sap.m.Link"),"Link has been rendered");
	});

});