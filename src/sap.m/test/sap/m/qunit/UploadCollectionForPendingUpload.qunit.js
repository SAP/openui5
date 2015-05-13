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
	assert.ok(oUploadCollection._aPendingUploadItems, "Container for pending uploads should exist after initialization of UploadCollection.");
	oUploadCollection.exit();
	assert.ok(!oUploadCollection._aPendingUploadItems, "Container for pending uploads should be destroyed after exiting the UploadCollection.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method '_getFileUploader'.", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false
	});
	var oFileUploader1 = oUploadCollection._getFileUploader();
	var oFileUploader2 = oUploadCollection._getFileUploader();
//TODO erweitern nachdem in Change FU Instanzen dem Container hinzugefügt wrden
	assert.notEqual(oFileUploader1.getId(), oFileUploader2.getId(), "Different File Uploader instances should have different IDs.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setFileType", function(assert) {
	var aFileTypes = ["jpg", "png", "bmp", "unittest"];
	var aFileTypesExpected = aFileTypes.toString();
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		fileType : aFileTypes
	});
	assert.equal(oUploadCollection.getFileType().toString(), aFileTypesExpected, "Initial fileType value is set correctly for instantUpload : false");
	oUploadCollection.setFileType([".txt, .xml"]);
	assert.equal(oUploadCollection.getFileType().toString(), aFileTypesExpected , "FileType should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setMaximumFilenameLength", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		maximumFilenameLength : 10
	});
	assert.equal(oUploadCollection.getMaximumFilenameLength(), 10, "Initial maximumFilenameLength value is set correctly for instantUpload : false");
	oUploadCollection.setMaximumFilenameLength(20);
	assert.equal(oUploadCollection.getMaximumFilenameLength(), 10, "MaximumFilenameLength property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setMaximumFileSize", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		maximumFileSize : 50
	});
	assert.equal(oUploadCollection.getMaximumFileSize(), 50, "Initial maximFileSize value is set correctly for instantUpload : false");
	oUploadCollection.setMaximumFileSize(20);
	assert.equal(oUploadCollection.getMaximumFileSize(), 50, "MaximumFileSize property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setMimeType", function(assert) {
	var aMimeTypes = ["text", "image", "unittest"];
	var aMimeTypesExpected = aMimeTypes.toString();
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		mimeType : aMimeTypes
	});
	assert.equal(oUploadCollection.getMimeType().toString(), aMimeTypesExpected, "Initial mimeType value is set correctly for instantUpload : false");
	oUploadCollection.setMimeType([".somethingElse"]);
	assert.equal(oUploadCollection.getMimeType().toString(), aMimeTypesExpected, "MimeType property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setMultiple", function(assert) {
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		multiple : true
	});
	assert.equal(oUploadCollection.getMultiple(), true, "Initial multiple value (true) is set correctly for instantUpload : false");
	oUploadCollection.setMultiple(false);
	assert.equal(oUploadCollection.getMultiple(), true, "Multiple property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setUploadEnabled", function(assert) {
	var bUploadEnabled = false;
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		uploadEnabled : bUploadEnabled
	});
	assert.equal(oUploadCollection.getUploadEnabled(), bUploadEnabled, "Initial uploadEnabled value is set correctly for instantUpload : false");
	oUploadCollection.setUploadEnabled(true);
	assert.equal(oUploadCollection.getUploadEnabled(), bUploadEnabled, "UploadEnabled property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});

QUnit.test("Test for method setUploadUrl", function(assert) {
	var sUploadUrl = "my/upload/url";
	var oUploadCollection = new sap.m.UploadCollection({
		instantUpload : false,
		uploadUrl : sUploadUrl
	});
	assert.equal(oUploadCollection.getUploadUrl(), sUploadUrl, "Initial uploadUrl value is set correctly for instantUpload : false");
	oUploadCollection.setUploadUrl("my/another/url");
	assert.equal(oUploadCollection.getUploadUrl(), sUploadUrl, "UploadUrl property should not be overwritten at runtime if instantUpload is false.");
	oUploadCollection.destroy();
	oUploadCollection = null;
});
