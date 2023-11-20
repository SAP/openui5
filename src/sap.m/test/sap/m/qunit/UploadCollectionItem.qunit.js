/*global QUnit, sinon */
sap.ui.define([
	"sap/m/UploadCollectionItem",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectMarker",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/util/File",
	"sap/ui/core/Core"
], function(UploadCollectionItem, ObjectAttribute, ObjectMarker, mlibrary, Device, File, oCore) {
	"use strict";


	var ObjectMarkerType = mlibrary.ObjectMarkerType;
	var ObjectMarkerVisibility = mlibrary.ObjectMarkerVisibility;
	var URLHelper = mlibrary.URLHelper;

	QUnit.module("Initial Test deprecated properties", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				contributor : "Susan Baker",
				documentId : "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				enableEdit : true,
				enableDelete : true,
				fileName : "Screenshot.ico",
				fileSize : 20,
				mimeType : "image/jpg",
				thumbnailUrl : "",
				uploadedDate : "2014-07-30",
				url : ""
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Check if the deprecated properties were set with initial load", function(assert) {
		assert.ok(this.oUploadCollectionItem, "UploadCollectionItem instantiated");
		assert.equal(this.oUploadCollectionItem.getContributor(), "Susan Baker", "Contributor property is set");
		assert.equal(this.oUploadCollectionItem.getUploadedDate(), "2014-07-30", "UploadedDate property is set");
		assert.equal(this.oUploadCollectionItem.getFileSize(), "20", "FileSize property is set");
	});

	QUnit.test("Check the correct sequence and completeness of deprecated properties in the aggregation attributes", function(assert) {
		var aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation.length, "3", "Empty aggregation filled with 3 attributes");
		assert.equal(aAggregation[0].getText(), "2014-07-30", "1. attribute: uploadedDate");
		assert.equal(aAggregation[1].getText(), "Susan Baker", "2. attribute: contributor");
		assert.equal(aAggregation[2].getText(), "20", "3. attribute: fileSize");
	});

	QUnit.test("Check deprecated properties before and after a change with the corresponding setter function", function(assert) {
		var aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		//before change
		assert.equal(aAggregation.length, "3", "Empty aggregation filled with 3 attributes");
		assert.equal(aAggregation[0].getText(), "2014-07-30", "2. attribute: uploadedDate");
		assert.equal(aAggregation[1].getText(), "Susan Baker", "1. attribute: contributor");
		assert.equal(aAggregation[2].getText(), "20", "3. attribute: fileSize");
		//corresponding setter functions of the deprecated properties
		this.oUploadCollectionItem.setContributor("John Doe");
		this.oUploadCollectionItem.setFileSize(45);
		this.oUploadCollectionItem.setUploadedDate("2015-08-31");
		//after change
		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation[0].getText(), "2015-08-31", "Attribute 'uploadedDate' updated");
		assert.equal(aAggregation[1].getText(), "John Doe", "Attribute 'contributor' updated");
		assert.equal(aAggregation[2].getText(), "45", "Attribute 'fileSize' updated");
	});

	QUnit.module("Deprecated properties with setter", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				documentId : "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				enableEdit : true,
				enableDelete : true,
				fileName : "Screenshot.ico",
				mimeType : "image/jpg",
				thumbnailUrl : "",
				url : ""
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Set deprecated properties in mixed sequence", function(assert) {
		assert.ok(this.oUploadCollectionItem, "UploadCollectionItem instantiated");
		//fileSize
		this.oUploadCollectionItem.setFileSize(20);
		var aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation[0].getText(), "20", "1. attribute 'fileSize'");
		//uploadedDate
		this.oUploadCollectionItem.setUploadedDate("2014-07-30");
		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation[0].getText(), "2014-07-30", "1. attribute 'uploadedDate'");
		assert.equal(aAggregation[1].getText(), "20", "2. attribute 'fileSize'");
		//contributor
		this.oUploadCollectionItem.setContributor("Susan Baker");
		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation.length, "3", "Aggregation filled with 3 attributes");
		assert.equal(aAggregation[0].getText(), "2014-07-30", "1. attribute: uploadedDate");
		assert.equal(aAggregation[1].getText(), "Susan Baker", "2. attribute: contributor");
		assert.equal(aAggregation[2].getText(), "20", "3. attribute: fileSize");
	});

	QUnit.module("Deprecated properties with pre-filled aggregation", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				attributes : [ new ObjectAttribute({
					active : false,
					text : "Test"
				})]
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Check of the removeAllAggregation/removeAllAttributes", function(assert) {
		assert.ok(this.oUploadCollectionItem, "UploadCollectionItem instantiated");

		//removeAllAggregation
		this.oUploadCollectionItem.removeAllAggregation("attributes");
		var aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		assert.equal(aAggregation, null, "Original attributes with RemoveAllAggregation were deleted");
		//removeAllAttributes
		this.oUploadCollectionItem.addAttribute(new ObjectAttribute({
			active : false,
			text : "Test 1"
		}));
		this.oUploadCollectionItem.removeAllAttributes();
		aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		assert.equal(aAggregation, null, "Original attributes with RemoveAllAggregation were deleted");
	});

	QUnit.test("Check of the removeAllAggregation with deprecated Properties", function(assert) {
		this.oUploadCollectionItem.setFileSize(45);
		this.oUploadCollectionItem.setUploadedDate("2015-08-31");
		this.oUploadCollectionItem.setContributor("John Doe");
		var aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation[0].getText(), "2015-08-31", "Attribute 'uploadedDate' set");
		assert.equal(aAggregation[1].getText(), "John Doe", "Attribute 'contributor' set");
		assert.equal(aAggregation[2].getText(), "45", "Attribute 'fileSize' set");
		assert.equal(aAggregation.length, 3, "Additional attribute added");

		aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		assert.equal(aAggregation.length, 1, "Additional attribute added");

		this.oUploadCollectionItem.removeAllAggregation("attributes");
		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation.length, 3, "Additional attribute added");
		assert.equal(aAggregation[0].getText(), "2015-08-31", "Attribute 'uploadedDate' set");
		assert.equal(aAggregation[1].getText(), "John Doe", "Attribute 'contributor' set");
		assert.equal(aAggregation[2].getText(), "45", "Attribute 'fileSize' set");
	});

	QUnit.test("Set deprecated properties with prefilled attributes aggregation", function(assert) {
		var aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		assert.equal(aAggregation.length, 1, "1 attribute available");
		this.oUploadCollectionItem.setFileSize(45);
		this.oUploadCollectionItem.setUploadedDate("2015-08-31");
		this.oUploadCollectionItem.setContributor("John Doe");

		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation.length, 3, "3 deprecated attributes available");

		//add additional attribute
		this.oUploadCollectionItem.addAttribute(new ObjectAttribute({
			active : false,
			text : "Test 2"
		}));
		aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		//check existence/position of original attributes
		assert.equal(aAggregation[0].getText(), "Test", "Original attribute still available");
		assert.equal(aAggregation[1].getText(), "Test 2", "Original attribute correct added");
		assert.equal(aAggregation.length, 2, "2 attributes available");

		var dummyName = "";
		this.oUploadCollectionItem.removeAllAggregation(dummyName);
		aAggregation = this.oUploadCollectionItem.getAggregation("attributes");
		assert.equal(aAggregation.length, 2, "2 attributes still available");

		aAggregation = this.oUploadCollectionItem.getAggregation("_propertyAttributes");
		assert.equal(aAggregation.length, 3, "3 deprecated attributes still available");
	});

	QUnit.module("Test getter for all attributes", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				attributes : [ new ObjectAttribute({
					active : false,
					text : "Test"
				})]
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Test getAllAttributes", function(assert) {
		//set deprecated properties
		this.oUploadCollectionItem.setContributor("deprecatedContributor");
		this.oUploadCollectionItem.setUploadedDate("deprecatedDate");
		this.oUploadCollectionItem.setFileSize(555);

		this.oUploadCollectionItem.addAggregation("attributes", new ObjectAttribute({
			active : false,
			text : "someAttribute"
		}), true);
		var aAggregation = this.oUploadCollectionItem.getAllAttributes();
		assert.equal(aAggregation.length, 5, "Aggregation with 5 items");
		assert.equal(aAggregation[0].getText(), "deprecatedDate", "Deprecated property uploadedDate at first position");
		assert.equal(aAggregation[1].getText(), "deprecatedContributor", "Deprecated property contributor at second position");
		assert.equal(aAggregation[2].getText(), "555", "Deprecated property fileSize at third position");
		assert.equal(aAggregation[3].getText(), "Test", "Attribute Test at fourth position");
		assert.equal(aAggregation[4].getText(), "someAttribute", "Attribute someAttribute at fifth position");
	});

	QUnit.module("UploadCollectionItem selected", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				attributes : [ new ObjectAttribute({
					active : false,
					text : "Test"
				})]
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Test set and get selected", function(assert) {
		//Arrange
		var oStub = this.stub(this.oUploadCollectionItem, "fireEvent");

		//Act
		this.oUploadCollectionItem.setSelected(true);

		//Assert
		assert.equal(oStub.callCount, 1, "Function 'fireEvent' was called once");
		assert.ok(oStub.calledWithExactly("selected"), "Function 'fireEvent' was called with parameter 'selected'");
		assert.ok(this.oUploadCollectionItem.getSelected(), "Item has been selected");
	});

	QUnit.module("UploadCollectionItem with markers", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				markers : [ new ObjectMarker({
					type : "Locked",
					visibility : "IconOnly"
				})]
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
		}
	});

	QUnit.test("Test accessing marker", function(assert) {
		//Arrange
		//Act
		var aMarkers = this.oUploadCollectionItem.getMarkers();

		//Assert
		assert.ok(aMarkers.length, 1);
		assert.ok(aMarkers[0].getType(), ObjectMarkerType.Locked);
		assert.ok(aMarkers[0].getVisibility(), ObjectMarkerVisibility.IconOnly);
	});

	QUnit.module("Download method - XMLHttpRequest", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				contributor : "Susan Baker",
				documentId : "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				enableEdit : true,
				enableDelete : true,
				fileName : "Screenshot.ico",
				fileSize : 20,
				mimeType : "image/jpg",
				thumbnailUrl : "",
				uploadedDate : "2014-07-30",
				url : "/pathToTheFile/Woman_04.png"
			});
			oCore.applyChanges();
		},
		initFakeServer: function(sResponseCode) {
			this.aFakeRequest = this._oSandbox.useFakeServer();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
			this.oUploadCollectionItem = null;
		}
	});

	QUnit.test("Test that XMLHttpRequest is correct", function(assert) {
		if (Device.browser.name === "sf") {
			assert.expect(0);
			return;
		}
		//Arrange
		this.initFakeServer.bind(this)();

		//Act
		this.oUploadCollectionItem.download(true);

		//Assert
		assert.equal(this.aFakeRequest.requests.length, 1, "The request was called only once");
		var sURL = this.aFakeRequest.requests[0].url;
		var sExpectedURL = this.oUploadCollectionItem.getUrl();
		assert.equal(sURL, sExpectedURL, "The URL of the request is correct");
	});

	QUnit.test("Check that sap.ui.core.util.File.save was called and it was called with the right arguments", function(assert) {
		if (Device.browser.name === "sf") {
			assert.expect(0);
			return;
		}
		//Arrange
		var stub = this.stub(File, "save");
		var sFileName = this.oUploadCollectionItem.getFileName();
		var oFileNameAndExtension = this.oUploadCollectionItem._splitFileName(sFileName, false);
		var sFileExtension = oFileNameAndExtension.extension;
		sFileName = oFileNameAndExtension.name;

		//Act
		this.initFakeServer();
		this.oUploadCollectionItem.download(true);
		this.aFakeRequest.requests[0].respond(200, {}, "Empty String");

		//Assert
		assert.ok(stub.calledWith(sinon.match.any, sFileName, sFileExtension, "image/jpg", 'utf-8'), "sap.ui.core.util.File.save was called with the right arguments");
	});


	QUnit.test("Check if in case of safari sap.m.URLHelper is called", function(assert) {
		if (Device.browser.name !== "sf") {
			assert.expect(0);
			return;
		}
		//Arrange
		var stub = this.stub(URLHelper, "redirect");

		//Act
		var bDownloadResult = this.oUploadCollectionItem.download(false);

		//Assert
		assert.ok(bDownloadResult, "Download call was succesfull");
		assert.ok(stub.called, "Redirect was, at least, called");
		assert.ok(stub.calledWith(this.oUploadCollectionItem.getUrl(), true), "Redirect was called with the right arguments");
	});

	QUnit.module("Download Methods", {
		beforeEach : function() {
			this.oUploadCollectionItem = new UploadCollectionItem({
				contributor : "Susan Baker",
				documentId : "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				enableEdit : true,
				enableDelete : true,
				fileName : "Screenshot.ico",
				fileSize : 20,
				mimeType : "image/jpg",
				thumbnailUrl : "",
				uploadedDate : "2014-07-30",
				url : "/pathToTheFile/Woman_04.png"
			});
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oUploadCollectionItem.destroy();
			this.oUploadCollectionItem = null;
		}
	});

	QUnit.test("Check that sap.m.URLHelper.redirect is called if askForLocation is set to false", function(assert) {
		//Arrange
		var stub = this.stub(URLHelper, "redirect");

		//Act
		var bDownloadResult = this.oUploadCollectionItem.download(false);

		//Assert
		assert.ok(bDownloadResult, "Download call was succesfull");
		assert.ok(stub.called, "Redirect was, at least, called");
		assert.ok(stub.calledWith(this.oUploadCollectionItem.getUrl(), true), "Redirect was called with the right arguments");
	});

	QUnit.test("Test to download an item without URL", function(assert) {
		//Arrange
		this.oUploadCollectionItem.setUrl(null);

		//Act
		var bDownloadResult = this.oUploadCollectionItem.download(false);

		//Assert
		assert.equal(bDownloadResult, false, "Item was downloaded successfully.");
	});

	QUnit.test("_splitFileName extracts the correct information", function(assert) {
		//Arrange
		var sFileName = "pic1.jpg";
		//Act
		var oResultWithDot = this.oUploadCollectionItem._splitFileName(sFileName, true),
			oResultWithoutDot = this.oUploadCollectionItem._splitFileName(sFileName, false);
		//Assert
		assert.equal(oResultWithDot.name, "pic1", "File name has been extracted successfully");
		assert.equal(oResultWithDot.extension, ".jpg", "File extension with dot has been extracted successfully");
		assert.equal(oResultWithoutDot.extension, "jpg", "File extension without dot has been extracted successfully");
	});

	QUnit.module("Items related control instance management", {
		beforeEach : function() {
			this.oItem = new UploadCollectionItem();
		},
		afterEach : function() {
			if (this.oItem) {
				this.oItem.destroy();
				this.oItem = null;
			}
		}
	});

	QUnit.test("Instance created and returned", function(assert) {
		//Act
		var oResult = this.oItem._getControl("sap.m.Button");
		//Assert
		assert.equal(oResult.getMetadata().getName(), "sap.m.Button", "Correct instance created and returned");
	});

	QUnit.test("Instance created and settings applied", function(assert) {
		//Act
		var oResult = this.oItem._getControl("sap.m.Button", {
			text: "myText"
		});
		//Assert
		assert.equal(oResult.getText(), "myText", "Settings applied");
	});

	QUnit.test("Instance created and internally stored", function(assert) {
		//Act
		this.oItem._getControl("sap.m.Button");
		//Assert
		assert.equal(this.oItem._aManagedInstances.length, 1, "Created instance internally stored");
	});

	QUnit.test("Internal instances destroyed if item is destroyed", function(assert) {
		//Arrange
		var oResult = this.oItem._getControl("sap.m.Button");
		//Act
		this.oItem.destroy();
		//Assert
		assert.equal(oResult._bIsBeingDestroyed, true, "Created instance marked as destroyed");
	});

	QUnit.test("Instance getter created if name provided", function(assert) {
		//Act
		var oResult = this.oItem._getControl("sap.m.Button", null, "Otto");
		//Assert
		assert.equal(this.oItem._getOtto(), oResult, "Generated getter returns sames object");
	});

	QUnit.test("Function _getItemPressEnabled", function(assert) {
		//Assert
		assert.equal(this.oItem._getPressEnabled(this.oItem), false, "Press disbaled when no handler or URL exists");
	});

	QUnit.test("Function _getItemPressEnabled with press handler", function(assert) {
		//Act
		this.oItem.attachPress("press", function() {});
		//Assert
		assert.equal(this.oItem._getPressEnabled(this.oItem), true, "Press enabled when handler exists");
	});
	QUnit.test("Function _getItemPressEnabled with URL", function(assert) {
		//Act
		this.oItem.setProperty("url", "test.url");
		//Assert
		assert.equal(this.oItem._getPressEnabled(this.oItem), true, "Press enabled when URL exists");
	});

});