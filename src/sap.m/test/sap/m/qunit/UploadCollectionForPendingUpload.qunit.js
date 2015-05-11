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