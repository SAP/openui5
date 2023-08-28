/*global QUnit */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/m/ObjectMarker",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"sap/ui/base/Event",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(ManagedObject, ObjectAttribute, ObjectStatus, ObjectMarker, Label, JSONModel, mlibrary, Sorter, MessageBox, Event, library, oCore) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;

	var ObjectMarkerType = mlibrary.ObjectMarkerType;
	var ObjectMarkerVisibility = mlibrary.ObjectMarkerVisibility;

	function createSpySetup(module) {
		module.oManagedObjectSpy = this.spy(ManagedObject.prototype, "applySettings");
	}

	function restoreSpySetup(module) {
	}

	function checkDestroy(module, assert) {
		var aInstances = module.oManagedObjectSpy.returnValues;
		for (var i = 0; i < aInstances.length; i++) {
			if (aInstances[i].getMetadata().getName() === "sap.ui.core.UIArea" ||
				aInstances[i].getMetadata().getName() === "sap.ui.core.InvisibleText" ||
				aInstances[i].getMetadata().getName() === "sap.ui.core.Popup" ||
				isInMessageBox(aInstances[i])) {
				continue;
			}
			assert.ok(aInstances[i]._bIsBeingDestroyed, "ManagedObject: " + aInstances[i].getMetadata().getName() + ", with id: " + aInstances[i].getId() + " is marked as destroyed");
		}

		function isInMessageBox(oControl) {
			var oCheck = oControl;
			do {
				if (oCheck.getMetadata().getName() === 'sap.m.Dialog') {
					return true;
				}
				oCheck = oCheck.getParent();
			} while (oCheck);
			return false;
		}
	}

	function getItem() {
		return new undefined/*UploadCollectionItem*/({
			contributor: "Otto",
			documentId: "4711",
			fileName: "MyBusinessPlan.gif",
			mimeType: "image/gif",
			thumbnailUrl: "http://mydomain.subdomain.com/path/thumbnail.jpg",
			uploadedDate: "01.04.1972",
			enableEdit: false,
			enableDelete: false,
			visibleEdit: false,
			visibleDelete: false,
			ariaLabelForPicture: "Some hidden text",
			selected: false,
			attributes: [
				new ObjectAttribute({
					title: "My super title",
					text: "My super text",
					active: false
				})
			],
			statuses: [
				new ObjectStatus({
					title: "My super title",
					text: "My super text",
					state: ValueState.None,
					icon: ""
				})
			],
			markers: [
				new ObjectMarker({
					type: ObjectMarkerType.Locked,
					visibility: ObjectMarkerVisibility.IconAndText,
					additionalInfo: "Some super text"
				})
			]
		});
	}

	QUnit.module("Setup check", {
		beforeEach: function () {
			createSpySetup(this);
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});

	QUnit.skip("Creating a new control and ID is saved", function (assert) {
		//Act
		var oLabel = new Label("labelOne");
		//Assert
		assert.ok(this.oManagedObjectSpy.callCount, "Spy was called");
		assert.equal(this.oManagedObjectSpy.returnValues[0].getId(), "labelOne", "Spy returns created ManagedObject");
		//Cleanup
		oLabel.destroy();
	});

	QUnit.skip("Helper 'checkDestroy'", function (assert) {
		//Arrange
		var oLabel = new Label("labelOne");
		var oStub = this.stub(assert, "ok");
		//Act
		checkDestroy(this, assert);
		oStub.restore();
		//Assert
		assert.ok(oStub.called);
		//Cleanup
		oLabel.destroy();
	});

	QUnit.module("Display - no interaction", {
		beforeEach: function () {
			createSpySetup(this);
			this.oItem = getItem();
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});
	QUnit.skip("UCI read only", function (assert) {
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("UCI without thumbnail url", function (assert) {
		this.oItem.setThumbnailUrl();
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("UCI with edit and delete button", function (assert) {
		this.oItem.setEnableEdit(true);
		this.oItem.setEnableDelete(true);
		this.oItem.setVisibleEdit(true);
		this.oItem.setVisibleDelete(true);
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.module("Display - no interaction, but grouping", {
		beforeEach: function () {
			createSpySetup(this);
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});

	QUnit.skip("UCI with grouping", function (assert) {
		var oModel = new JSONModel({
			"items": [
				{
					contributor: "Otto",
					documentId: "4711",
					fileName: "MyBusinessPlan.gif",
					mimeType: "image/gif",
					thumbnailUrl: "http://mydomain.subdomain.com/path/thumbnail.jpg",
					uploadedDate: "01.04.1972"
				},
				{
					contributor: "Otto",
					documentId: "4711",
					fileName: "MyBusinessPlan.gif",
					mimeType: "image/gif",
					thumbnailUrl: "http://mydomain.subdomain.com/path/thumbnail.jpg",
					uploadedDate: "02.04.1972"
				}
			]
		});
		var oCollection = new undefined/*UploadCollection*/({
			items: {
				path: "/items",
				template: new undefined/*UploadCollectionItem*/({
					contributor: "{contributor}",
					documentId: "{documentId}",
					fileName: "{fileName}f",
					mimeType: "{mimeType}",
					thumbnailUrl: "{thumbnailUrl}",
					uploadedDate: "{uploadedDate}"
				}),
				templateShareable: false,
				sorter: new Sorter("/uploadedDate", true, true)
			}
		}).setModel(oModel).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.module("Edit", {
		beforeEach: function () {
			createSpySetup(this);
			this.oItem = getItem();
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});

	QUnit.skip("UCI enter edit", function (assert) {
		this.oItem.setEnableEdit(true);
		this.oItem.setVisibleEdit(true);
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-editButton").firePress();
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("UCI enter edit - cancel edit", function (assert) {
		this.oItem.setEnableEdit(true);
		this.oItem.setVisibleEdit(true);
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-editButton").firePress();
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-cancelButton").firePress();
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("UCI enter edit - change name - cancel edit", function (assert) {
		this.oItem.setEnableEdit(true);
		this.oItem.setVisibleEdit(true);
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-editButton").firePress();
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-ta_editFileName").setValue("NewFileName");
		oCore.applyChanges();
		oCore.byId(this.oItem.getId() + "-okButton").firePress();
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.module("Delete", {
		beforeEach: function () {
			createSpySetup(this);
			this.oItem = getItem();
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});

	QUnit.skip("UCI delete item", function (assert) {
		this.oItem.setEnableDelete(true);
		this.oItem.setVisibleDelete(true);
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		this.stub(MessageBox, "show");
		oCore.byId(this.oItem.getId() + "-deleteButton").firePress();
		oCore.applyChanges();
		oCollection._onCloseMessageBoxDeleteItem(MessageBox.Action.OK);
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.module("Uploading", {
		beforeEach: function () {
			createSpySetup(this);
		},
		afterEach: function () {
			restoreSpySetup(this);
		}
	});

	QUnit.skip("Uploading a file - progress case", function (assert) {
		var oCollection = new undefined/*UploadCollection*/().placeAt("qunit-fixture");
		oCore.applyChanges();
		var oFileUploader = oCollection._getFileUploader();
		oFileUploader.fireChange({
			files: [{
				name: "file1"
			}]
		});
		oCollection.invalidate();
		oCore.applyChanges();

		oFileUploader.fireUploadProgress({
			fileName: "file1",
			loaded: 50,
			total: 100
		});
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("Uploading a file - upload complete", function (assert) {
		var oCollection = new undefined/*UploadCollection*/({
			items: [this.oItem]
		}).placeAt("qunit-fixture");
		oCore.applyChanges();
		var oFileUploader = oCollection._getFileUploader();
		oFileUploader.fireChange({
			files: [{
				name: "file1"
			}]
		});
		oCollection.invalidate();
		oCore.applyChanges();
		var oFileUploaderEventMock = {
			fileName: "file1",
			response: {"propertyOne": "ValueOne"},
			readyStateXHR: 4,
			status: 200,
			responseRaw: '{ "propertyOne": "ValueOne" }',
			headers: {
				"headerOne": "headerValueOne",
				"headerTwo": "headerValueTwo"
			}
		};
		oCollection._onUploadComplete(new Event("uploadComplete", oFileUploader, oFileUploaderEventMock));
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("Uploading a file - terminate upload", function (assert) {
		var oCollection = new undefined/*UploadCollection*/().placeAt("qunit-fixture");
		oCore.applyChanges();
		var oFileUploader = oCollection._getFileUploader();
		oFileUploader.fireChange({
			files: [{
				name: "file1"
			}]
		});
		oCollection.invalidate();
		oCore.applyChanges();
		oCollection._getFileUploader().fireUploadAborted({
			fileName: "file1",
			requestHeaders: []
		});
		oCore.applyChanges();
		oCollection.destroy();
		checkDestroy(this, assert);
	});

	QUnit.skip("Uploading a file - terminate upload via popover", function (assert) {
		var oCollection = new undefined/*UploadCollection*/().placeAt("qunit-fixture");
		oCore.applyChanges();
		var oFileUploader = oCollection._getFileUploader();
		oFileUploader.fireChange({
			files: [{
				name: "file1"
			}]
		});
		oCollection.invalidate();
		oCore.applyChanges();
		oCollection._handleTerminateRequest({}, oCollection.aItems[0]);
		oCore.applyChanges();
		var oDialog = oCore.byId(oCollection.getId() + "deleteDialog");
		oDialog.getButtons()[1].firePress();
		oCore.applyChanges();
		oDialog.fireEvent("afterClose");
		oCollection.destroy();
		checkDestroy(this, assert);
	});
});