/*global QUnit */

sap.ui.define("sap.m.qunit.UploadSetToolbar", [
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/ui/unified/FileUploader",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/ToggleButton",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (UploadSet, UploadSetToolbarPlaceholder, Title, ToolbarSpacer, FileUploader, Button,
			 OverflowToolbar, ToggleButton, Log, nextUIUpdate) {
	"use strict";

	QUnit.module("UploadSet Toolbar Default", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("noToolbarTest", {});
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("No Toolbar is provided. Test that default toolbar is set", function (assert) {
		var aToolbarElements = this.oUploadSet._oList.getAggregation("headerToolbar").getAggregation("content");
		assert.equal(aToolbarElements.length, 2, "All elements are in the toolbar");
		assert.ok(aToolbarElements[0] instanceof ToolbarSpacer, "First element is an instance of sap.m.ToolbarSpacer");
		assert.ok(aToolbarElements[1] instanceof FileUploader, "Second element is an instance of sap.m.FileUploader");
	});

	QUnit.module("UploadSet Toolbar missing Placeholder", {
		beforeEach: function () {
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Test for adding file uploader to fallback position if UploadSetToolbarPlaceHolder instance missing", async function (assert) {
		//Act
		this.oUploadSet = new UploadSet("noPHToolbarTest", {
			toolbar: new OverflowToolbar({
				content: []
			})
		});
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		var aToolbarElements = this.oUploadSet._oList.getAggregation("headerToolbar").getAggregation("content");
		assert.ok(aToolbarElements[0] instanceof FileUploader, "File Uploader inserted at fallback position");
	});

	QUnit.module("UploadSet Toolbar Custom", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("PHToolbarTest", {
				toolbar: new OverflowToolbar({
					content: [new Button("element1", {text: "Filter"}),
						new ToolbarSpacer("element2"),
						new UploadSetToolbarPlaceholder("element3"),
						new Button("element4", {icon: "sap-icon://money-bills"}),
						new Button("element5", {text: "New"}),
						new ToggleButton("element6", {text: "Toggle"}),
						new Button("element7", {text: "Open"})
					]
				})
			});
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("A correct Toolbar is provided", function (assert) {
		var aToolbarElements = this.oUploadSet._oList.getAggregation("headerToolbar").getAggregation("content");
		assert.equal(aToolbarElements.length, 8, "All elements are in the toolbar");
		assert.ok(aToolbarElements[0] instanceof Button, "First element is a sap.m.Title");
		assert.ok(aToolbarElements[1] instanceof ToolbarSpacer, "Second element is a sap.m.ToolbarSpacer");
		assert.ok(aToolbarElements[2] instanceof FileUploader, "Third element is a sap.ui.unified.FileUploader");
		assert.ok(aToolbarElements[3] instanceof UploadSetToolbarPlaceholder, "Fourth element is an instance of sap.m.UploadSetToolbarPlaceholder");
		assert.ok(aToolbarElements[4] instanceof Button, "Fifth element is an instance of sap.m.Button");
		assert.ok(aToolbarElements[5] instanceof Button, "Sixth element is an instance of sap.m.Button");
		assert.ok(aToolbarElements[6] instanceof Button, "Seventh element is an instance of sap.m.Button");
		assert.ok(aToolbarElements[7] instanceof Button, "Eighth element is an instance of sap.m.Button");

		//Checks that every element is in the right position
		assert.deepEqual(aToolbarElements[0].getId(), "element1", "Element1 was placed in the right position");
		assert.deepEqual(aToolbarElements[1].getId(), "element2", "Element2 was placed in the right position");
		assert.deepEqual(aToolbarElements[3].getId(), "element3", "Element3 was placed in the right position");
		assert.deepEqual(aToolbarElements[4].getId(), "element4", "Element4 was placed in the right position");
		assert.deepEqual(aToolbarElements[5].getId(), "element5", "Element5 was placed in the right position");
		assert.deepEqual(aToolbarElements[6].getId(), "element6", "Element6 was placed in the right position");
		assert.deepEqual(aToolbarElements[7].getId(), "element7", "Element7 was placed in the right position");

	});
});
