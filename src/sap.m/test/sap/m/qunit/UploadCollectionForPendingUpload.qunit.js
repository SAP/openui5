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
	assert.ok(jQuery.sap.log.error.calledOnce, "No error should be logged, because of valid API call.");
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
		instantUpload : false,
		multiple : true
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
	oFileUploader.fireChange({
		files: aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	assert.deepEqual(oFileUploader, oUploadCollection._aFileUploadersForPendingUpload[0], "Array _aFileUploadersForPendingUpload should contain the FileUploader instance on which Change Event was fired");
	assert.deepEqual(oFileUploader, sap.ui.getCore().byId(oUploadCollection.getItems()[0].getAssociation("fileUploader")), "Association fileUploader should contain the FileUploader instance with which the Change event was fired");
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

QUnit.module("Rendering of UploadCollection with instantUpload = false ", {

	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("uploadCollection1", {
			instantUpload : false
		});
		this.oUploadCollection.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
		var oFile = {name: "file1"};
		this.aFiles = [oFile];
	},
	teardown : function() {
		this.oUploadCollection.destroy();
	}
});

QUnit.test("Rendering after initial load", function(assert) {
	assert.ok(this.oUploadCollection, "UploadCollection instantiated");
	assert.ok(jQuery.sap.domById("uploadCollection1-list"), "Item list is rendered");
	assert.ok(jQuery.sap.domById("uploadCollection1-toolbar"), "Toolbar of the item list is rendered");
	assert.ok(jQuery.sap.domById("uploadCollection1-numberOfAttachmentsTitle"), "Title Number of attachments is rendered");
});

QUnit.test("Rendering of an item after change event", function(assert) {
	var oFileUploader = this.oUploadCollection._getFileUploader();
	oFileUploader.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() +  "-ta_filenameHL"), "FileName is rendered");
	assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId()+ "-ta_editFileName"), "No input field should be rendered if instantUpload = false ");
	assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-okButton"), "No OK button should be rendered if instantUpload = false");
	assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-cancelButton"), "No Cancel button should be rendered if instantUpload = false");
	assert.ok(!jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-editButton"), "No Edit button should be rendered if instantUpload = false");
	assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-deleteButton"), "Delete button should be rendered if instantUpload = false");
	assert.ok(jQuery.sap.domById(this.oUploadCollection.getItems()[0].getId() + "-ia_iconHL"), "Icon should be rendered if instantUpload = false");
});

QUnit.test("Setting of 'hidden' property on FileUploader instances", function(assert) {
	var oFileUploader1 = this.oUploadCollection._oFileUploader; // take the current FU instance
	oFileUploader1.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges(); // it leads to rerendering and thus a new FU instance is created in UploadCollection.prototype._getListHeader
	assert.ok(jQuery(jQuery.sap.domById(oFileUploader1.getId())).is(':hidden'), "The first FileUploader instance should be set to hidden after the second instance has been created");
	var oFileUploader2 = this.oUploadCollection._oFileUploader; // take the current FU instance
	assert.ok(!jQuery(jQuery.sap.domById(oFileUploader2.getId())).is(':hidden'), "The current FileUploader instance should not be hidden");
	oFileUploader2.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();// it leads to rerendering and thus a new FU instance is created in UploadCollection.prototype._getListHeader
	assert.ok(jQuery(jQuery.sap.domById(oFileUploader1.getId())).is(':hidden'), "The first FileUploader instance should be still hidden");
	assert.ok(jQuery(jQuery.sap.domById(oFileUploader2.getId())).is(':hidden'), "The second  FileUploader instance should be hidden now");
	var oFileUploader3 = this.oUploadCollection._oFileUploader;
	assert.ok(!jQuery(jQuery.sap.domById(oFileUploader3.getId())).is(':hidden'), "The current  FileUploader instance should not be hidden");
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[2], oFileUploader1, "oFileUploader1 should be on the third position in the toolbar");
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[3], oFileUploader2, "oFileUploader2 should be on the fourth position in the toolbar");
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[4], oFileUploader3, "oFileUploader3 should be on the fifth position in the toolbar");
});


QUnit.test("Positions of the FileUploader instances in the toolbar", function(assert) {
	var oFileUploader1 = this.oUploadCollection._oFileUploader; // take the current FU instance
	oFileUploader1.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges(); // it leads to rerendering and thus a new FU instance is created in UploadCollection.prototype._getListHeader
	var oFileUploader2 = this.oUploadCollection._oFileUploader; // take the current FU instance
	oFileUploader2.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();// it leads to rerendering and thus a new FU instance is created in UploadCollection.prototype._getListHeader
	var oFileUploader3 = this.oUploadCollection._oFileUploader;
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[2], oFileUploader1, "oFileUploader1 should be on the third position in the toolbar");
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[3], oFileUploader2, "oFileUploader2 should be on the fourth position in the toolbar");
	assert.deepEqual(this.oUploadCollection.oHeaderToolbar.getContent()[4], oFileUploader3, "oFileUploader3 should be on the fifth position in the toolbar");
});

QUnit.module("PendingUpload",  {

	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection({instantUpload : false});
		var oFile = {
				name: "file1"
			};
		this.aFiles = [oFile];
		this.oUploadCollection.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
	}
});

QUnit.test("test Upload", function(assert) {
	var oFileUploader1 = this.oUploadCollection._getFileUploader();
	var fnFUUpload1 = this.spy(oFileUploader1, "upload");
	oFileUploader1.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	var oFileUploader2 = this.oUploadCollection._getFileUploader();
	var fnFUUpload2 = this.spy(oFileUploader2, "upload");
	oFileUploader2.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	this.oUploadCollection.upload();
	assert.ok(fnFUUpload1.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
	assert.ok(fnFUUpload2.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
});

QUnit.test("Creation of a new FileUploader Instance during rerendering" , function(assert) {
	var oFileUploader1 = this.oUploadCollection._oFileUploader;
	oFileUploader1.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	assert.notEqual(oFileUploader1.getId(), this.oUploadCollection._oFileUploader.getId(), "After the Change Event has been fired a new FileUploader instance should be created");
	oFileUploader1 = this.oUploadCollection._oFileUploader;
	// delete the item
	this.oUploadCollection._oItemForDelete = this.oUploadCollection.getAggregation("items")[0];
	this.oUploadCollection._oItemForDelete._iLineNumber = 0;
	this.oUploadCollection._onCloseMessageBoxDeleteItem(sap.m.MessageBox.Action.OK);
	sap.ui.getCore().applyChanges();
	assert.deepEqual(oFileUploader1, this.oUploadCollection._oFileUploader, "After an item has been deleted from the list no new FileUploader instance should be created, thus the current one should be used for the next upload");
	//create two more items
	oFileUploader1 = this.oUploadCollection._oFileUploader;
	oFileUploader1.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	var oFileUploader2 = this.oUploadCollection._oFileUploader;
	oFileUploader2.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	var oFileUploader3 = this.oUploadCollection._oFileUploader;
	oFileUploader3.fireChange({
		files: this.aFiles,
		newValue : "file1"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	assert.notEqual(oFileUploader1.getId(), this.oUploadCollection._oFileUploader.getId(), "After the Change Event has been fired a new FileUploader instance should be created");
	assert.notEqual(oFileUploader2.getId(), this.oUploadCollection._oFileUploader.getId(), "After the Change Event has been fired a new FileUploader instance should be created");
	assert.notEqual(oFileUploader3.getId(), this.oUploadCollection._oFileUploader.getId(), "After the Change Event has been fired a new FileUploader instance should be created");
	var oFileUploader4 = this.oUploadCollection._oFileUploader;
	//delete an item in the middle of the list
	this.oUploadCollection._oItemForDelete = this.oUploadCollection.getAggregation("items")[1];
	this.oUploadCollection._oItemForDelete._iLineNumber = 1;
	this.oUploadCollection._onCloseMessageBoxDeleteItem(sap.m.MessageBox.Action.OK);
	sap.ui.getCore().applyChanges();
	assert.deepEqual(oFileUploader4, this.oUploadCollection._oFileUploader, "After an item has been deleted from the list no new FileUploader instance should be created, thus the current one should be used for the next upload");
});


QUnit.test("uploadComplete", function(assert) {
	var oFileUploaderEventMock = {
		fileName : "file1",
		reponse : { "propertyOne" : "ValueOne" },
		readyStateXHR : 4,
		status : 200,
		responseRaw : '{ "propertyOne" : "ValueOne" }',
		headers : {
			"headerOne" : "headerValueOne",
			"headerTwo" : "headerValueTwo",
		}
	};
	function uploadComplete(oEvent) {
		assert.equal(oEvent.getParameter("files")[0].fileName, "file1", "Correct file1 name in complete event of pending upload");
		assert.equal(oEvent.getParameter("files")[0].response, oFileUploaderEventMock.response, "Correct response in complete event of pending upload");
		assert.equal(oEvent.getParameter("files")[0].status, oFileUploaderEventMock.status, "Correct status in complete event of pending upload");
		assert.equal(oEvent.getParameter("files")[0].responseRaw, oFileUploaderEventMock.responseRaw, "Correct raw response in complete event of pending upload");
		assert.equal(oEvent.getParameter("files")[0].headers, oFileUploaderEventMock.headers, "Correct headers in complete event of pending upload");
	}
	this.oUploadCollection.attachUploadComplete(uploadComplete);
	this.oUploadCollection._onUploadComplete(new sap.ui.base.Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));
});

QUnit.test("Event beforeUploadStarts", function(assert) {
	var sFileName = "someFileName", sRequestId = "1",  aRequestHeaders = [{
		name: this.oUploadCollection._headerParamConst.requestIdName,
		value: sRequestId
	}];
	var sSlugName = "slug", sSlugValueBefore = jQuery.now(), sSlugValueAfter, sSecurityTokenName = "securuityToken", sSecurityTokenValueBefore = jQuery.now(), sSecurityTokenValueAfter;
	function onBeforeUploadStarts(oEvent) {
		var oHeaderParameter1 = new sap.m.UploadCollectionParameter({name: sSlugName, value: sSlugValueBefore});
		oEvent.getParameters().addHeaderParameter(oHeaderParameter1);
		var oHeaderParameter2 = new sap.m.UploadCollectionParameter({name: sSecurityTokenName, value: sSecurityTokenValueBefore});
		oEvent.getParameters().addHeaderParameter(oHeaderParameter2);
		assert.equal(oEvent.getParameter("fileName"), sFileName, "Correct FileName in beforeUploadStarts event");
		assert.ok(oEvent.getParameter("addHeaderParameter"), "Correct method 'addHeaderParameter' in parameters of beforeUploadStarts event");
		assert.ok(oEvent.getParameter("getHeaderParameter"), "Correct method 'getHeaderParameter' in parameters of beforeUploadStarts event");
		assert.equal(oEvent.getParameters().getHeaderParameter(sSlugName).getValue(), sSlugValueBefore, "Value of the header parameter1 retrieved correctly");
		assert.equal(oEvent.getParameters().getHeaderParameter(sSecurityTokenName).getValue(), sSecurityTokenValueBefore, "Value of the header parameter2 retrieved correctly");
		assert.equal(oEvent.getParameters().getHeaderParameter()[2].getName(), sSlugName, "Name of the first header parameter should be slug.");

		var oSlugParameter = oEvent.getParameters().getHeaderParameter()[2];
		oSlugParameter.setValue("ChangedSlugValue");
	}
	this.oUploadCollection.attachBeforeUploadStarts(onBeforeUploadStarts);
	this.oUploadCollection._getFileUploader().fireUploadStart({
		fileName : sFileName,
		requestHeaders: aRequestHeaders
	});
	var iParamCounter = aRequestHeaders.length;
	for (var i = 0; i < iParamCounter; i++ ) {
		if (aRequestHeaders[i].name === sSlugName) {
			sSlugValueAfter = aRequestHeaders[i].value;
		}
		if (aRequestHeaders[i].name === sSecurityTokenName) {
			sSecurityTokenValueAfter = aRequestHeaders[i].value;
		}
	}
	assert.equal(sSlugValueAfter, "ChangedSlugValue");
	assert.notEqual(sSlugValueBefore, sSlugValueAfter, "Slug value is set correctly by the method 'addHeaderParameter' of the beforeUploadStarts event");
	assert.equal(sSecurityTokenValueBefore, sSecurityTokenValueAfter, "SecurityToken value is set correctly by the method 'addHeaderParameter' of the beforeUploadStarts event");
});

QUnit.module("Delete PendingUpload Item", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("pendingUploads", {
			instantUpload : false
		});
		this.oUploadCollection.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("Check file list", function(assert) {
	assert.expect(4);
	var oFile0 = {
			name : "Screenshot.ico",
	};
	var oFile1 = {
			name : "Notes.txt",
	};
	var oFile2 = {
			name : "Document.txt",
	};
	var oFile3 = {
			name : "Picture of a woman.png",
	};
	var aFiles = [oFile0];
	var oFileUploader = this.oUploadCollection._oFileUploader;
	oFileUploader.fireChange({
		files: aFiles,
		newValue : "Screenshot.ico"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	aFiles = [oFile1];
	oFileUploader.fireChange({
		files: aFiles,
		newValue : "Notes.txt"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	aFiles = [oFile2];
	oFileUploader.fireChange({
		files: aFiles,
		newValue : "Document.txt"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();
	aFiles = [oFile3];
	oFileUploader.fireChange({
		files: aFiles,
		newValue : "Picture of a woman.png"	// needed to enable IE9 support and non failing tests
	});
	sap.ui.getCore().applyChanges();

	var fnTestHandleDelete = function(oEvent, oContext) {
		assert.ok(true, "Function '_handleDelete' was called");
	};
	//check the call of _handleDelete
	var fnBaseHandleDelete = this.oUploadCollection._handleDelete;
	sap.m.UploadCollection.prototype._handleDelete = fnTestHandleDelete;
	var sDeleteButtonId = this.oUploadCollection.aItems[0].getId() + "-deleteButton";
	var oDeleteButton = sap.ui.getCore().byId(sDeleteButtonId);
	oDeleteButton.firePress();
	sap.ui.getCore().applyChanges();
	sap.m.UploadCollection.prototype._handleDelete = fnBaseHandleDelete;

	//check the number of list items
	var iLengthBeforeDeletion = this.oUploadCollection.getItems().length;
	var sNameBeforeDeletion = this.oUploadCollection.getItems()[0].getFileName();
	assert.equal(iLengthBeforeDeletion, 4, "4 list items available");

	this.oUploadCollection._oItemForDelete = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemForDelete._iLineNumber = 0;
	this.oUploadCollection._onCloseMessageBoxDeleteItem(sap.m.MessageBox.Action.OK);
	sap.ui.getCore().applyChanges();

	//check the deleted item by comparison of the name before and after the deletion
	var sNameAfterDeletion = this.oUploadCollection.getItems()[0].getFileName();
	assert.notEqual(sNameBeforeDeletion, sNameAfterDeletion, "Item was deleted, checked by different names!");

	//check the deleted item by comparison of the number of list items before and after the deletion
	var iLengthAfterDeletion = this.oUploadCollection.getItems().length;
	assert.notEqual(iLengthBeforeDeletion, iLengthAfterDeletion, "Item was deleted, checked by different number of items!");
});

QUnit.module("Delete PendingUpload Item, multiple FileUploaderInstances", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("pendingUploads", {
			instantUpload : false
		});
		this.oUploadCollection.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
		this.oFile0 = {
			name : "file0",
		};
		this.oFile1 = {
			name : "file1",
		};
		this.oFile2 = {
			name : "file2",
		};
		this.oFile3 = {
			name : "file3",
		};
		this.oFile4 = {
			name : "file4",
		};
		this.simulateDeleteLastAddedItem = function (){
			this.oUploadCollection._oItemForDelete = this.oUploadCollection.getItems()[0];
			this.oUploadCollection._oItemForDelete._iLineNumber = 0;
			this.oUploadCollection._onCloseMessageBoxDeleteItem(sap.m.MessageBox.Action.OK);
			sap.ui.getCore().applyChanges();
		};
		this.simulateFilePreselection = function (aFiles){
			var oFileUploader = this.oUploadCollection._oFileUploader;
			oFileUploader.fireChange({
				files : aFiles,
				newValue : aFiles[0].name
			});
			sap.ui.getCore().applyChanges();
		};
		this.simulateXhrPreuploadProcessing = function (fileUploader, fileName, callOrder){
			this.oUploadCollection._iUploadStartCallCounter = callOrder;
			fileUploader.fireUploadStart({
				"fileName" : fileName,
				"requestHeaders" : fileUploader.getHeaderParameters()
			});
		};
		this.abortStub = sinon.stub(sap.ui.unified.FileUploader.prototype, "abort");
		this.encodeToAscii = function (value) {
			var sEncodedValue = "";
			for (var i = 0; i < value.length; i++) {
				sEncodedValue = sEncodedValue + value.charCodeAt(i);
			}
			return sEncodedValue;
		};
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
		this.abortStub.restore();
	}
});

QUnit.test("Check if the item is properly saved to prevent further upload", function(assert) {
	var properCancellationHeaderParameterExists = false;
	this.simulateFilePreselection.bind(this)([this.oFile0]);

	this.simulateDeleteLastAddedItem.bind(this)();

	sap.ui.getCore().applyChanges();
	jQuery.each(this.oUploadCollection._aDeletedItemForPendingUpload, function (iIndex, item) {
		if (item.getAssociation("fileUploader") === this.oUploadCollection._aFileUploadersForPendingUpload[0].sId && item.getFileName() === this.oFile0.name){
			properCancellationHeaderParameterExists = true;
		}
	}.bind(this));
	assert.equal(properCancellationHeaderParameterExists, true, "File is registered for cancellation of upload");
});

QUnit.test("Checking if abort is properly called. 1 file, 1 instance of File Uploader", function(assert) {
	this.simulateFilePreselection.bind(this)([this.oFile0]);
	this.simulateDeleteLastAddedItem.bind(this)();

	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);

	assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
	assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
});

QUnit.test("Checking if abort is properly called. 2 files, 1 instance of File Uploader", function(assert) {
	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
		// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
		assert.expect(0);
		return;
	}
	this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile1]);
	this.simulateDeleteLastAddedItem.bind(this)();

	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile1.name, 1);

	assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
	assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile1.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
});

QUnit.test("Checking if abort is properly called. 2 files, 2 instances of File Uploader, ", function(assert) {
	this.simulateFilePreselection.bind(this)([this.oFile0]);
	this.simulateFilePreselection.bind(this)([this.oFile1]);
	this.simulateDeleteLastAddedItem.bind(this)();

	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile1.name, 0);

	assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
	assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[1]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile1.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
});

QUnit.test("Checking if abort is properly called. 5 files, 2 instances of File Uploader, 2 deletions ", function(assert) {
	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
		// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
		assert.expect(0);
		return;
	}
	this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile1, this.oFile2]);
	this.simulateDeleteLastAddedItem.bind(this)();
	this.simulateFilePreselection.bind(this)([this.oFile3, this.oFile4]);
	this.simulateDeleteLastAddedItem.bind(this)();

	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile1.name, 1);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile2.name, 2);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile3.name, 0);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile4.name, 1);

	assert.equal(this.abortStub.callCount, 2, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
	assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile2.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	assert.equal(this.abortStub.getCall(1).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[1]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(1).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile4.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
});

QUnit.test("Checking if abort is properly called. 3 files with same names, 1 instance of File Uploader, 2 deletions ", function(assert) {
	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version <= 9) {
		// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
		assert.expect(0);
		return;
	}
	this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile0, this.oFile0]);
	this.simulateDeleteLastAddedItem.bind(this)();
	this.simulateDeleteLastAddedItem.bind(this)();

	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 1);
	this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 2);

	assert.equal(this.abortStub.callCount, 2, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
	assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	assert.equal(this.abortStub.getCall(1).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
	assert.equal(this.abortStub.getCall(1).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName),new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
});

QUnit.module("PendingUpload uploadProgress Event", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("pendingUploads", {
			instantUpload : false
		});
		this.oUploadCollection2 = new sap.m.UploadCollection("pendingUploads2", {
			instantUpload: true
		});
		this.oUploadCollection.placeAt("uiArea");
		this.oUploadCollection2.placeAt("uiArea");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
		this.oUploadCollection2.destroy();
		this.oUploadCollection2 = null;
	}
});

QUnit.test("Check onUploadProgress", function(assert) {
	var spy = sinon.spy(this.oUploadCollection, "_onUploadProgress");
	this.oUploadCollection._oFileUploader.fireUploadProgress();
	assert.strictEqual(spy.callCount, 0);

	var spy2 = sinon.spy(this.oUploadCollection2, "_onUploadProgress");
	this.oUploadCollection2._oFileUploader.fireUploadProgress();
	assert.strictEqual(spy2.callCount, 1);
});
