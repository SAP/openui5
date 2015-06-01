QUnit.module("PendingUpload", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("pendingUploads", {});
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("Set of 'instantUpload' at runtime is not allowed", function(assert) {
	var oUploadCollection = this.oUploadCollection;
	assert.ok(oUploadCollection.getInstantUpload(), "Default value is set to true.");
	this.oUploadCollection.setInstantUpload(false);
	assert.ok(oUploadCollection.getInstantUpload(), "Override of value is not possible at runtime.");
	oUploadCollection.destroy();
	oUploadCollection = null;

	oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	assert.ok(!oUploadCollection.getInstantUpload(), "Instance was created with false");
	this.oUploadCollection.setInstantUpload(true);
	assert.ok(!oUploadCollection.getInstantUpload(), "Override of value is not possible at runtime.");
	oUploadCollection.destroy();
	oUploadCollection = null;

	oUploadCollection = new sap.m.UploadCollection("secondContructorWayToCall", {
		instantUpload : false
	});
	assert.ok(!oUploadCollection.getInstantUpload(), "Instance was created with false");
	this.oUploadCollection.setInstantUpload(true);
	assert.ok(!oUploadCollection.getInstantUpload(), "Override of value is not possible at runtime.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("API method 'upload' exists and reacts depending on usages.", function(assert) {
	var oUploadCollection = this.oUploadCollection;
	sinon.spy(jQuery.sap.log, "error");
	oUploadCollection.upload();
	assert.equal(jQuery.sap.log.error.callCount, 1, "Error logging shall be happend.");
	oUploadCollection.destroy();
	oUploadCollection = null;

	oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	oUploadCollection.upload();
	assert.ok(jQuery.sap.log.error.calledOnce, "No Error should be logged, because of valid API call.");
	jQuery.sap.log.error.restore();
});

QUnit.test("Container for FileUploader instances is created and destroyed when exiting the control.", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	assert.ok(oUploadCollection._aFileUploadersForPendingUpload, "Container for pending uploads should exist after initialization of UploadCollection.");
	oUploadCollection.exit();
	assert.ok(!oUploadCollection._aFileUploadersForPendingUpload, "Container for pending uploads should be destroyed after exiting the UploadCollection.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method '_getFileUploader' for instantUpload = false", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	var oFileUploader1 = oUploadCollection._getFileUploader();
	var oFileUploader2 = oUploadCollection._getFileUploader();
	assert.notEqual(oFileUploader1.getId(), oFileUploader2.getId(), "Different File Uploader instances should have different IDs.");
	oUploadCollection._aFileUploadersForPendingUpload.push(oFileUploader1);
	oUploadCollection._aFileUploadersForPendingUpload.push(oFileUploader2);
	oUploadCollection.exit();
	assert.ok(!oUploadCollection._aFileUploadersForPendingUpload, "Array oUploadCollection._aFileUploadersForPendingUpload should not exist any longer after exit");
});

QUnit.test("Test for method _onChange for instantUpload = false", function(assert) {
	var oFile1 = {
			name: "file1"
		};
	var aFiles = [oFile1];
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	var oFileUploader = oUploadCollection._getFileUploader();
	oFileUploader.fireChange({files: aFiles});
	assert.deepEqual(oFileUploader, oUploadCollection._aFileUploadersForPendingUpload[0], "Array _aFileUploadersForPendingUpload should contain the FileUploader instance on which Change Event was fired");
	assert.equal(oFileUploader.getId(), oUploadCollection.getItems()[0].getAssociation("fileUploader"), "Association fileUploader should contain the FileUploader ID with which the Change event was fired");
	assert.equal(oUploadCollection.getItems()[0]._status, sap.m.UploadCollection._pendingUploadStatus, "Item should have the 'pendingUploadStatus'");
});


QUnit.module("PendingUpload: test setters", {
	setup : function() {
		this.createUploadCollection = function (oAddToContructor) {
			if (this.oUploadCollection) {
				this.oUploadCollection.destroy();
			}
			this.oUploadCollection = new sap.m.UploadCollection(oAddToContructor);
		};
		this.oUploadCollection = new sap.m.UploadCollection("pendingUploads", {});
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("Test for method setFileType", function(assert) {
	var aFileTypes = ["jpg", "png", "bmp", "unittest"];
	var aFileTypesExpected = aFileTypes.toString();
	this.createUploadCollection({
		instantUpload : false,
		fileType : aFileTypes
	});
	assert.equal(this.oUploadCollection.getFileType().toString(), aFileTypesExpected, "Initial fileType value is set correctly for instantUpload : false");
	this.oUploadCollection.setFileType([".txt, .xml"]);
	assert.equal(this.oUploadCollection.getFileType().toString(), aFileTypesExpected , "FileType should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setMaximumFilenameLength", function(assert) {
	this.createUploadCollection({
		instantUpload : false,
		maximumFilenameLength : 10
	});
	assert.equal(this.oUploadCollection.getMaximumFilenameLength(), 10, "Initial maximumFilenameLength value is set correctly for instantUpload : false");
	this.oUploadCollection.setMaximumFilenameLength(20);
	assert.equal(this.oUploadCollection.getMaximumFilenameLength(), 10, "MaximumFilenameLength property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setMaximumFileSize", function(assert) {
	this.createUploadCollection({
		instantUpload : false,
		maximumFileSize : 50
	});
	assert.equal(this.oUploadCollection.getMaximumFileSize(), 50, "Initial maximFileSize value is set correctly for instantUpload : false");
	this.oUploadCollection.setMaximumFileSize(20);
	assert.equal(this.oUploadCollection.getMaximumFileSize(), 50, "MaximumFileSize property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setMimeType", function(assert) {
	var aMimeTypes = ["text", "image", "unittest"];
	var aMimeTypesExpected = aMimeTypes.toString();
	this.createUploadCollection({
		instantUpload : false,
		mimeType : aMimeTypes
	});
	assert.equal(this.oUploadCollection.getMimeType().toString(), aMimeTypesExpected, "Initial mimeType value is set correctly for instantUpload : false");
	this.oUploadCollection.setMimeType([".somethingElse"]);
	assert.equal(this.oUploadCollection.getMimeType().toString(), aMimeTypesExpected, "MimeType property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setMultiple", function(assert) {
	this.createUploadCollection({
		instantUpload : false,
		multiple : true
	});
	assert.equal(this.oUploadCollection.getMultiple(), true, "Initial multiple value (true) is set correctly for instantUpload : false");
	this.oUploadCollection.setMultiple(false);
	assert.equal(this.oUploadCollection.getMultiple(), true, "Multiple property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setUploadEnabled", function(assert) {
	var bUploadEnabled = false;
	this.createUploadCollection({
		instantUpload : false,
		uploadEnabled : bUploadEnabled
	});
	assert.equal(this.oUploadCollection.getUploadEnabled(), bUploadEnabled, "Initial uploadEnabled value is set correctly for instantUpload : false");
	this.oUploadCollection.setUploadEnabled(true);
	assert.equal(this.oUploadCollection.getUploadEnabled(), bUploadEnabled, "UploadEnabled property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.test("Test for method setUploadUrl", function(assert) {
	var sUploadUrl = "my/upload/url";
	this.createUploadCollection({
		instantUpload : false,
		uploadUrl : sUploadUrl
	});
	assert.equal(this.oUploadCollection.getUploadUrl(), sUploadUrl, "Initial uploadUrl value is set correctly for instantUpload : false");
	this.oUploadCollection.setUploadUrl("my/another/url");
	assert.equal(this.oUploadCollection.getUploadUrl(), sUploadUrl, "UploadUrl property should not be overwritten at runtime if instantUpload is false.");
});

QUnit.module("Rendering of an item with instantUpload = false ", {

	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("uploadCollection1", {
			items : {
				path : "/items",
				template : oItemTemplate
			},
			instantUpload : false
		});
		this.oUploadCollection.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
	}
});

QUnit.test("Rendering after initial load", function(assert) {
	assert.ok(this.oUploadCollection, "UploadCollection instantiated");
	assert.ok(jQuery.sap.domById("uploadCollection1-list"), "Item list is rendered");
	assert.ok(jQuery.sap.domById("uploadCollection1-toolbar"), "Toolbar of the item list is rendered");
	assert.ok(jQuery.sap.domById("uploadCollection1-numberOfAttachmentsLabel"), "Label Number of attachments label is rendered");
});

QUnit.test("Rendering of an item after change event", function(assert) {
	var oFile1 = {
			name: "file1"
		};
		var aFiles = [oFile1];
		var oFileUploader = this.oUploadCollection._getFileUploader();
		oFileUploader.fireChange({files: aFiles});
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() +  "-ta_filenameHL"), "FileName is rendered");
		assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId()+ "-ta_editFileName"), "No input field should be rendered if instantUpload = false ");
		assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-okButton"), "No OK Button should be rendered if instantUpload = false");
		assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-cancelButton"), "No Cancel Button should be rendered if instantUpload = false");
		assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-editButton"), "No Edit Button should be rendered if instantUpload = false");
		assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-deleteButton"), "Delete Button should be rendered if instantUpload = false");
		assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-ia_iconHL"), "Icon should be rendered if instantUpload = false");
});

QUnit.module("PendingUpload",  {

	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
	}
});

QUnit.test("test Upload", function(assert) {
	var oFile1 = {
			name: "file1"
		};
	var aFiles = [oFile1];
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	var oFileUploader1 = oUploadCollection._getFileUploader();
	var fnFUUpload1 = this.spy(oFileUploader1, "upload");
	oFileUploader1.fireChange({files: aFiles});
	var oFileUploader2 = oUploadCollection._getFileUploader();
	var fnFUUpload2 = this.spy(oFileUploader2, "upload");
	oFileUploader2.fireChange({files: aFiles});
	oUploadCollection.upload();
	assert.ok(fnFUUpload1.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
	assert.ok(fnFUUpload2.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
});
