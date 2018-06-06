/*global QUnit,sinon*/

sap.ui.define("sap.m.qunit.UploadCollectionToolbar", [
	"jquery.sap.global",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionToolbarPlaceholder",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/ui/unified/FileUploader",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/ToggleButton"
], function (jQuery, UploadCollection, UploadCollectionToolbarPlaceholder, Title, ToolbarSpacer, FileUploader, Button,
             OverflowToolbar, ToggleButton) {
	"use strict";

	QUnit.module("Toolbar Default", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("noToolbarTest", {});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("No Toolbar is provided. Test that default toolbar is set", function (assert) {
		var aToolbarElements = this.oUploadCollection._oList.getAggregation("headerToolbar").getAggregation("content");
		assert.equal(aToolbarElements.length, 3, "All elements are in the toolbar");
		assert.ok(aToolbarElements[0] instanceof Title, "First element is an instance of sap.m.Title");
		assert.ok(aToolbarElements[1] instanceof ToolbarSpacer, "Second element is an instance of sap.m.ToolbarSpacer");
		assert.ok(aToolbarElements[2] instanceof FileUploader, "Third element is an instance of sap.m.FileUploader");
	});

	QUnit.module("Toolbar missing Placeholder", {
		beforeEach: function () {
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
			jQuery.sap.log.info.restore();
		}
	});

	QUnit.test("A Toolbar without place holder is provided. Test that an info log has been written", function (assert) {
		//Arrange
		var oInfoLogStub = sinon.stub(jQuery.sap.log, "info");

		//Act
		this.oUploadCollection = new UploadCollection("noPHToolbarTest", {
			toolbar: new OverflowToolbar({
				content: [new Button({text: "Filter"}),
					new ToolbarSpacer(),
					new Button({icon: "sap-icon://money-bills"}),
					new Button({text: "New"}),
					new ToggleButton({text: "Toggle"}),
					new Button({text: "Open"})
				]
			})
		});
		this.oUploadCollection.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var bInfoTextWasFound = false;
		var aStubCalls = oInfoLogStub.getCalls(); //Get correct call of jQuery.sap.log.info(...)
		for (var i = 0; i < aStubCalls.length; i++) {
			if (aStubCalls[i] && aStubCalls[i].args && aStubCalls[i].args[0] === "A place holder of type 'sap.m.UploadCollectionPlaceholder' needs to be provided.") {
				bInfoTextWasFound = true;
			}
		}

		//Assert
		assert.ok(oInfoLogStub.called, "jQuery.sap.log.info has been called.");
		assert.ok(bInfoTextWasFound, "jQuery.sap.log.info has been called with correct parameter.");
	});

	QUnit.module("Toolbar Custom", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("PHToolbarTest", {
				toolbar: new OverflowToolbar({
					content: [new Button("element1", {text: "Filter"}),
						new ToolbarSpacer("element2"),
						new UploadCollectionToolbarPlaceholder("element3"),
						new Button("element4", {icon: "sap-icon://money-bills"}),
						new Button("element5", {text: "New"}),
						new ToggleButton("element6", {text: "Toggle"}),
						new Button("element7", {text: "Open"})
					]
				})
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("A correct Toolbar is provided", function (assert) {
		var aToolbarElements = this.oUploadCollection._oList.getAggregation("headerToolbar").getAggregation("content");
		assert.equal(aToolbarElements.length, 8, "All elements are in the toolbar");
		assert.ok(aToolbarElements[0] instanceof Button, "First element is a sap.m.Title");
		assert.ok(aToolbarElements[1] instanceof ToolbarSpacer, "Second element is a sap.m.ToolbarSpacer");
		assert.ok(aToolbarElements[2] instanceof FileUploader, "Third element is a sap.ui.unified.FileUploader");
		assert.ok(aToolbarElements[3] instanceof UploadCollectionToolbarPlaceholder, "Fourth element is an instance of sap.m.UploadCollectionToolbarPlaceholder");
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
