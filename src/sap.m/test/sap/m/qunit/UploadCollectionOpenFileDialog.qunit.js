QUnit.module("openFileDialog method", {
	beforeEach : function() {
		this.oUploadCollection = new sap.m.UploadCollection({
			items : {
				path : "/items",
				template : oItemTemplate
			}
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	},
	afterEach : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("The property multiple of the UploadCollection is set to true", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(true);
	var oItem = this.oUploadCollection.getItems()[0];

	// Act
	var oReturnValue = this.oUploadCollection.openFileDialog(oItem);
	var aLogs = jQuery.sap.log.getLog();
	var oLog = aLogs[aLogs.length - 1];

	// Assert
	assert.ok(oReturnValue instanceof sap.m.UploadCollection, "Function returns an instance of UploadCollection");
	assert.equal(oLog.message, "Version Upload cannot be used in multiple upload mode", "Warning log was generated correctly");
});

QUnit.test("Check trigger click event on FileUploader input element with item passed to openFileDialog", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItem = this.oUploadCollection.getItems()[0];

	// Act
	var oReturnValue = this.oUploadCollection.openFileDialog(oItem);
	var aInputField = this.oUploadCollection._oFileUploader.$().find("input[type=file]");

	// Assert
	assert.ok(oReturnValue instanceof sap.m.UploadCollection, "Function returns an instance of UploadCollection");
	assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
	aInputField.one('click', function (oEvent){
		assert.ok(true, "Click event was triggered.");
	});
	aInputField = aInputField.trigger("click");
	assert.notEqual(aInputField, 0, "The input file can trigger click event");
});

QUnit.test("Check trigger click event on FileUploader input element without an UploadCollectionItem passed to openFileDialog", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);

	// Act
	var oReturnValue = this.oUploadCollection.openFileDialog();
	var aInputField = this.oUploadCollection._oFileUploader.$().find("input[type=file]");

	// Assert
	assert.ok(oReturnValue instanceof sap.m.UploadCollection, "Function returns an instance of UploadCollection");
	assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
	aInputField.one('click', function (oEvent){
		assert.ok(true, "Click event was triggered.");
	});
	aInputField = aInputField.trigger("click");
	assert.notEqual(aInputField, 0, "The input file can trigger click event");
});

QUnit.test("In case of 'uploadNewVersion' use case check if oItemToUpdate is set correctly", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItem = this.oUploadCollection.getItems()[0];

	// Act
	var oReturnValue = this.oUploadCollection.openFileDialog(oItem);

	// Assert
	assert.ok(this.oUploadCollection._oItemToUpdate);
	assert.deepEqual(this.oUploadCollection._oItemToUpdate, oItem);
});

QUnit.module("openFileDialog Integration", {
	beforeEach : function() {
		this.oUploadCollection = new sap.m.UploadCollection({
			items : {
				path : "/items",
				template : oItemTemplate
			}
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.aFile = [{
			name: "file",
			size: 1,
			type: "type"
		}];
		this.sRequestId = "1";
	},
	afterEach : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("onChange event ends in rerendering without the item which is updated", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection.invalidate();
	sap.ui.getCore().applyChanges();
	// Assert
	assert.deepEqual(this.oUploadCollection.aItems.length, 5, "The new file is in the UploadCollection.aItems");
	assert.deepEqual(this.oUploadCollection._oList.getItems().length, 4, "The new file is not in the aggregated list");
});

QUnit.test("onChange event test NumberOfAttachmentTitle", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection.invalidate();
	sap.ui.getCore().applyChanges();
	// Assert
	assert.ok(this.oUploadCollection._oNumberOfAttachmentsTitle.getText().indexOf("4") > -1, "Number of attachments is reduced in case of uploadingNewVersion");
});

QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the first case of uploadComplete", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
	var aRequestHeaders = [{
		name : sHeaderName,
		value : this.sRequestId
	}];
	var oFileUploaderEventMock = {
		fileName : this.aFile[0].name,
		status : 200,
		headers : {
			sHeaderName : this.sRequestId
		}
	};
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection._getFileUploader().fireUploadStart({
		fileName : this.aFile[0].name,
		requestHeaders: aRequestHeaders
	});
	this.oUploadCollection._onUploadComplete(new sap.ui.base.Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

	// Assert
	assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
});

QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the second case of uploadComplete", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
	var aRequestHeaders = [{
		name : sHeaderName,
		value : this.sRequestId
	}];
	var oFileUploaderEventMock = {
		fileName : this.aFile[0].name,
		status : 103,
		headers : {
			sHeaderName : this.sRequestId
		}
	};
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection._getFileUploader().fireUploadStart({
		fileName : this.aFile[0].name,
		requestHeaders: aRequestHeaders
	});
	this.oUploadCollection._onUploadComplete(new sap.ui.base.Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

	// Assert
	assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
});

QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the third case of uploadComplete", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
	var aRequestHeaders = [{
		name : sHeaderName,
		value : this.sRequestId
	}];
	var oFileUploaderEventMock = {
		fileName : this.aFile[0].name,
		status : 200,
		headers : {
			sHeaderName : this.sRequestId
		},
		requestHeaders : aRequestHeaders
	};
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection._getFileUploader().fireUploadStart({
		fileName : this.aFile[0].name,
		requestHeaders: aRequestHeaders
	});
	this.oUploadCollection._onUploadComplete(new sap.ui.base.Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

	// Assert
	assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
});

QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the fourth case of uploadComplete", function(assert) {
	// Arrange
	this.oUploadCollection.setMultiple(false);
	var oItemToUpdate = this.oUploadCollection.getItems()[0];
	this.oUploadCollection._oItemToUpdate = oItemToUpdate;
	var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
	var aRequestHeaders = [{
		name : sHeaderName,
		value : this.sRequestId
	}];
	var oFileUploaderEventMock = {
		fileName : this.aFile[0].name,
		status : 103,
		headers : {
			sHeaderName : this.sRequestId
		},
		requestHeaders : aRequestHeaders
	};
	// Act
	this.oUploadCollection._getFileUploader().fireChange({
		files : this.aFile
	});
	this.oUploadCollection._getFileUploader().fireUploadStart({
		fileName : this.aFile[0].name,
		requestHeaders: aRequestHeaders
	});
	this.oUploadCollection._onUploadComplete(new sap.ui.base.Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

	// Assert
	assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
});