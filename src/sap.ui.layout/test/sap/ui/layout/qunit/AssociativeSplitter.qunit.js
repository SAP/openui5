(function () {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.qunit.QUnitUtils");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
	jQuery.sap.require("sap.ui.layout.AssociativeSplitter");
	sinon.config.useFakeTimers = true;
	var DOM_RENDER_LOCATION = "qunit-fixture";

	function initSetup() {

	}

	QUnit.module("Responsiveness", {
		setup: function () {
			this.oSplitter = new sap.ui.layout.AssociativeSplitter();
			this.oContainer = new sap.m.ScrollContainer({ content: this.oSplitter, width: "400px", height: "300px"});
			this.oSplitter.addAssociatedContentArea(new sap.m.Button);
			this.oSplitter.addAssociatedContentArea(new sap.m.Button);

			this.oContainer.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.oContainer.destroy();
		}
	});

	QUnit.test("After resize of a SplitBar", function (assert) {
		var iFirstContentAreaWidth, iSecondContentAreaWidth,
			aCalculatedSizes;

		sap.ui.getCore().byId(this.oSplitter.getAssociatedContentAreas()[0]).getLayoutData().setSize("100px");
		this.oContainer.setWidth("500px");
		sap.ui.getCore().applyChanges();

		aCalculatedSizes = this.oSplitter.getCalculatedSizes();
		iFirstContentAreaWidth = aCalculatedSizes[0];
		iSecondContentAreaWidth = aCalculatedSizes[1];

		assert.strictEqual(iFirstContentAreaWidth + iSecondContentAreaWidth, 500, "Sum of the widths of content areas should be equal to the size of the container");
	});
})();
