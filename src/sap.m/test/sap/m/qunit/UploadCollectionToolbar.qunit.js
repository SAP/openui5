QUnit.module("Toolbar Default", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("noToolbarTest", {});
		this.oUploadCollection.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("No Toolbar is provided. Test that default toolbar is set", function(assert) {
	var aToolbarElements = this.oUploadCollection._oList.getAggregation("headerToolbar").getAggregation("content");
	assert.equal(aToolbarElements.length, 3, "All elements are in the toolbar");
	assert.ok(aToolbarElements[0] instanceof sap.m.Title, "First element is an instance of sap.m.Title");
	assert.ok(aToolbarElements[1] instanceof sap.m.ToolbarSpacer, "Second element is an instance of sap.m.ToolbarSpacer");
	assert.ok(aToolbarElements[2] instanceof sap.ui.unified.FileUploader, "Third element is an instance of sap.m.FileUploader");
});

QUnit.module("Toolbar missing Placeholder", {
	setup : function() {
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
		jQuery.sap.log.info.restore();
	}
});

QUnit.test("A Toolbar without place holder is provided. Test that an info log has been written", function(assert) {
	//Arrange
	var oInfoLogStub = sinon.stub(jQuery.sap.log, "info");

	//Act
	this.oUploadCollection = new sap.m.UploadCollection("noPHToolbarTest", {
		toolbar : new sap.m.OverflowToolbar({
			content : [ new sap.m.Button({text: "Filter"}),
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({icon: "sap-icon://money-bills"}),
						new sap.m.Button({text: "New"}),
						new sap.m.ToggleButton({text: "Toggle"}),
						new sap.m.Button({text: "Open"})
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
	assert.ok(oInfoLogStub.called,"jQuery.sap.log.info has been called.");
	assert.ok(bInfoTextWasFound, "jQuery.sap.log.info has been called with correct parameter.")
});

QUnit.module("Toolbar Custom", {
	setup : function() {
		this.oUploadCollection = new sap.m.UploadCollection("PHToolbarTest", {
			toolbar : new sap.m.OverflowToolbar({
				content : [ new sap.m.Button("element1", {text: "Filter"}),
							new sap.m.ToolbarSpacer("element2"),
							new sap.m.UploadCollectionToolbarPlaceholder("element3"),
							new sap.m.Button("element4", {icon: "sap-icon://money-bills"}),
							new sap.m.Button("element5", {text: "New"}),
							new sap.m.ToggleButton("element6", {text: "Toggle"}),
							new sap.m.Button("element7", {text: "Open"})
				]
			})
		});
		this.oUploadCollection.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
	},
	teardown : function() {
		this.oUploadCollection.destroy();
		this.oUploadCollection = null;
	}
});

QUnit.test("A correct Toolbar is provided", function(assert) {
	var aToolbarElements = this.oUploadCollection._oList.getAggregation("headerToolbar").getAggregation("content");
	assert.equal(aToolbarElements.length, 8, "All elements are in the toolbar");
	assert.ok(aToolbarElements[0] instanceof sap.m.Button, "First element is a sap.m.Title");
	assert.ok(aToolbarElements[1] instanceof sap.m.ToolbarSpacer, "Second element is a sap.m.ToolbarSpacer");
	assert.ok(aToolbarElements[2] instanceof sap.ui.unified.FileUploader, "Third element is a sap.ui.unified.FileUploader");
	assert.ok(aToolbarElements[3] instanceof sap.m.UploadCollectionToolbarPlaceholder, "Fourth element is an instance of sap.m.UploadCollectionToolbarPlaceholder");
	assert.ok(aToolbarElements[4] instanceof sap.m.Button, "Fifth element is an instance of sap.m.Button");
	assert.ok(aToolbarElements[5] instanceof sap.m.Button, "Sixth element is an instance of sap.m.Button");
	assert.ok(aToolbarElements[6] instanceof sap.m.Button, "Seventh element is an instance of sap.m.Button");
	assert.ok(aToolbarElements[7] instanceof sap.m.Button, "Eighth element is an instance of sap.m.Button");

	//Checks that every element is in the right position
	assert.deepEqual(aToolbarElements[0].getId(), "element1", "Element1 was placed in the right position")
	assert.deepEqual(aToolbarElements[1].getId(), "element2", "Element2 was placed in the right position")
	assert.deepEqual(aToolbarElements[3].getId(), "element3", "Element3 was placed in the right position")
	assert.deepEqual(aToolbarElements[4].getId(), "element4", "Element4 was placed in the right position")
	assert.deepEqual(aToolbarElements[5].getId(), "element5", "Element5 was placed in the right position")
	assert.deepEqual(aToolbarElements[6].getId(), "element6", "Element6 was placed in the right position")
	assert.deepEqual(aToolbarElements[7].getId(), "element7", "Element7 was placed in the right position")

});