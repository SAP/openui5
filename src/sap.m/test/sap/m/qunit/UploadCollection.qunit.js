/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionItem",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/UploadCollectionRenderer",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/ManagedObject",
	"sap/m/OverflowToolbar",
	"sap/m/MessageBox",
	"sap/ui/unified/FileUploader",
	"sap/m/ObjectMarker",
	"sap/ui/base/Event",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/Sorter",
	"sap/ui/core/Element",
	"sap/m/library",
	"sap/ui/events/jquery/EventExtension",
	"jquery.sap.keycodes"
], function(jQuery, UploadCollection, UploadCollectionItem, Toolbar, Label, UploadCollectionRenderer,
			ListItemBaseRenderer, Dialog, Device, JSONModel, ManagedObject, OverflowToolbar,
			MessageBox, FileUploader, ObjectMarker, Event, UploadCollectionParameter, Sorter, Element, library) {
	"use strict";


	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = library.ListSeparators;


	var IMAGE_PATH = "test-resources/sap/m/images/";

	var oData = {
		"items": [
			{
				"contributor": "Susan Baker",
				"tooltip": "Susan Baker",
				"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				"fileName": "Screenshot.jpg",
				"fileSize": 20,
				"mimeType": "image/jpg",
				"thumbnailUrl": "",
				"uploadedDate": "Date: 2014-07-30",
				"ariaLabelForPicture": "textForIconOfItemSusanBaker",
				"markers": [
					{
						"type": "Locked",
						"visibility": "IconAndText"
					}
				]
			}, {
				"contributor": "John Smith",
				"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
				"fileName": "Notes.txt",
				"fileSize": 10,
				"mimeType": "text/plain",
				"thumbnailUrl": "",
				"uploadedDate": "2014-08-01",
				"url": "/pathToTheFile/Notes.txt",
				"markers": [
					{
						"type": "Locked",
						"visibility": "IconAndText"
					}
				]
			}, {
				"contributor": "J Edgar Hoover",
				"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcdf",
				"enableEdit": false,
				"enableDelete": false,
				"fileName": "Document.txt",
				"fileSize": 15,
				"mimeType": "text/plain",
				"thumbnailUrl": "",
				"uploadedDate": "2014-09-01",
				"url": "/pathToTheFile/Document.txt"
			}, {
				"contributor": "Kate Brown",
				"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
				"enableEdit": false,
				"enableDelete": false,
				"visibleEdit": "{visibleEdit}",
				"visibleDelete": "{visibleDelete}",
				"fileName": "Picture of a woman.png",
				"fileSize": 70,
				"mimeType": "image/png",
				"thumbnailUrl": IMAGE_PATH + "Woman_04.png",
				"uploadedDate": "2014-07-25",
				"url": "/pathToTheFile/Woman_04.png",
				"ariaLabelForPicture": "textForImageOfItemKateBrown"
			}
		]
	};

	function createItemTemplate() {
		return new UploadCollectionItem({
			contributor: "{contributor}",
			tooltip: "{tooltip}",
			documentId: "{documentId}",
			enableEdit: "{enableEdit}",
			enableDelete: "{enableDelete}",
			fileName: "{fileName}",
			fileSize: "{fileSize}",
			mimeType: "{mimeType}",
			thumbnailUrl: "{thumbnailUrl}",
			uploadedDate: "{uploadedDate}",
			url: "{url}",
			ariaLabelForPicture: "{ariaLabelForPicture}",
			markers: {
				path: "markers",
				template: createMarkerTemplate(),
				templateShareable: false
			}
		});
	}

	function createMarkerTemplate() {
		return new ObjectMarker({
			type: "{type}",
			visibility: "{visibility}"
		});
	}

	/* --------------------------------------- */
	/* Test properties                         */
	/* --------------------------------------- */
	QUnit.module("Basic Rendering", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Composite Controls are rendered", function (assert) {
		//Assert
		assert.ok(jQuery.sap.domById("uploadCollection-list"), "Item list is rendered");
		assert.ok(jQuery.sap.domById("uploadCollection-toolbar"), "Toolbar of the item list is rendered");
		assert.ok(jQuery.sap.domById("uploadCollection-numberOfAttachmentsTitle"), "Title attachments is rendered");
		assert.ok(jQuery.sap.domById(this.oUploadCollection.getId() + "-" + this.oUploadCollection._iFUCounter + "-uploader"), "FileUploader is rendered");
	});

	QUnit.test("Marker is rendered with text and icon", function (assert) {
		//Arrange
		//Act
		var oFirstItem = this.oUploadCollection.getItems()[0];
		var aMarkers = oFirstItem.getMarkers();

		//Assert
		assert.ok(aMarkers.length, 1);
		assert.ok(aMarkers[0].$().hasClass("sapMUCObjectMarker"), "Css class sapMUCObjectMarker is present");
	});

	QUnit.test("Marker is rendered with the calculated width for the file name", function (assert) {
		//Arrange
		//Act
		var oFirstItem = this.oUploadCollection.getItems()[0];
		var $FileName = this.oUploadCollection.$().find("#" + oFirstItem.getId() + "-ta_filenameHL");
		var sFileNameStyle = $FileName.attr("style");

		//Assert
		assert.ok(sFileNameStyle.indexOf("max-width: calc(100%") >= 0, "FileName max width was calculated due to marker presence");
	});

	QUnit.test("Marker is not displayed when the item is in edit mode", function (assert) {
		//Arrange
		var oFirstItem = this.oUploadCollection.getItems()[0];
		var oMarkerFirstItem = oFirstItem.getMarkers()[0];
		var oSecondItem = this.oUploadCollection.getItems()[1];
		var oMarkerSecondItem = oSecondItem.getMarkers()[0];
		oFirstItem.setEnableEdit(true);
		oFirstItem._status = "Edit";
		this.oUploadCollection.rerender();
		//Act
		var $MarkerContainerFirstItem = jQuery.sap.domById(oMarkerFirstItem.getId()).parentNode;
		var sMarkerFirstItemStyle = $MarkerContainerFirstItem.getAttribute("style");
		var $MarkerContainerSecondItem = jQuery.sap.domById(oMarkerSecondItem.getId()).parentNode;
		var sMarkerSecondItemStyle = $MarkerContainerSecondItem.getAttribute("style");

		//Assert
		assert.ok(sMarkerFirstItemStyle.indexOf("display: none") >= 0, "First Item in edit mode: Marker not displayed");
		assert.ok(!sMarkerSecondItemStyle || sMarkerSecondItemStyle.indexOf("display: none") === -1, "Second Item in normal mode: Marker is displayed");
	});

	QUnit.test("Item with a non clickable placeholder is rendered", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[0];
		//Act
		var oListItem = this.oUploadCollection._getListItemById(oItem.getId() + "-cli");
		var oIconItem = oListItem.getContent()[0];
		var $IconItem = oIconItem.$();
		//Assert
		assert.ok($IconItem.hasClass("sapMUCItemIconInactive"), "Css class 'sapMUCItemIconInactive' is present");
		assert.ok($IconItem.hasClass("sapMUCItemPlaceholderInactive"), "Css class 'sapMUCItemPlaceholderInactive' is present");
	});

	QUnit.test("Item with a clickable placeholder is rendered", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[0];
		//Act
		oItem.setUrl("Screenshot.jpg");
		this.oUploadCollection.rerender();
		oItem.setUrl(""); // restore the url
		var oListItem = this.oUploadCollection._getListItemById(oItem.getId() + "-cli");
		var oIconItem = oListItem.getContent()[0];
		var $IconItem = oIconItem.$();

		//Assert
		assert.ok($IconItem.hasClass("sapMUCItemIcon"), "Css class 'sapMUCItemIcon' is present");
		assert.ok($IconItem.hasClass("sapMUCItemPlaceholder"), "Css class 'sapMUCItemPlaceholder' is present");
	});

	QUnit.test("Item with a clickable icon is rendered", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[1];
		//Act
		var oListItem = this.oUploadCollection._getListItemById(oItem.getId() + "-cli");
		var oIconItem = oListItem.getContent()[0];
		var $IconItem = oIconItem.$();

		//Assert
		assert.ok($IconItem.hasClass("sapMUCItemIcon"), "Css class 'sapMUCItemIcon' is present");
		assert.ok(!$IconItem.hasClass("sapMUCItemPlaceholder"), "Css class 'sapMUCItemPlaceholder' is not present");
		assert.ok(!$IconItem.hasClass("sapMUCItemPlaceholderInactive"), "Css class 'sapMUCItemPlaceholderInactive' is not present");
	});

	QUnit.test("Item with a non clickable icon is rendered", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[1];
		var sUrl = oItem.getUrl();
		//Act
		oItem.setUrl("");
		this.oUploadCollection.rerender();
		oItem.setUrl(sUrl); // restore the url
		var oListItem = this.oUploadCollection._getListItemById(oItem.getId() + "-cli");
		var oIconItem = oListItem.getContent()[0];
		var $IconItem = oIconItem.$();

		//Assert
		assert.ok($IconItem.hasClass("sapMUCItemIconInactive"), "Css class 'sapMUCItemIconInactive' is present");
		assert.ok(!$IconItem.hasClass("sapMUCItemPlaceholder"), "Css class 'sapMUCItemPlaceholder' is not present");
		assert.ok(!$IconItem.hasClass("sapMUCItemPlaceholderInactive"), "Css class 'sapMUCItemPlaceholderInactive' is not present");
	});

	QUnit.test("hideUploadButton hideTerminateUploadButton properties are initialized correctly", function (assert) {
		//Arrange
		//Act
		//Assert
		var bUploadButtonInvisible = this.oUploadCollection.getUploadButtonInvisible(),
			bUploadButtonEnabled = this.oUploadCollection.getTerminationEnabled();
		assert.strictEqual(bUploadButtonInvisible, false, "uploadButtonInvisible property is set to false by default");
		assert.strictEqual(bUploadButtonEnabled, true, "terminationEnabled property is set to true by default");
	});

	QUnit.test("File upload button is visible", function (assert) {
		//Arrange
		//Act
		//Assert
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), true, "File Uploader is visible");
	});

	QUnit.test("setUploadButtonInvisible returns when the existing value is passed", function (assert) {
		//Arrange
		var bUploadButtonInvisible = true,
			stubGetUploadButtonInvisible = sinon.stub(this.oUploadCollection, "getUploadButtonInvisible").returns(bUploadButtonInvisible),
			stubSetProperty = sinon.stub(this.oUploadCollection, "setProperty"),
			stubGetInstantUpload = sinon.stub(this.oUploadCollection, "getInstantUpload"),
			stubSetFileUploaderVisibility = sinon.stub(this.oUploadCollection, "_setFileUploaderVisibility");
		//Act
		var oInstance = this.oUploadCollection.setUploadButtonInvisible(bUploadButtonInvisible);
		//Assert
		assert.ok(stubGetUploadButtonInvisible.called, "getUploadButtonInvisible called");
		assert.ok(stubSetProperty.notCalled, "setProperty not called");
		assert.ok(stubGetInstantUpload.notCalled, "getInstantUpload not called");
		assert.ok(stubSetFileUploaderVisibility.notCalled, "_setFileUploaderVisibility not called");
		assert.deepEqual(oInstance, this.oUploadCollection, "Reference to this returned");
	});

	QUnit.test("setUploadButtonInvisible updates the property but doesn't update other (invisible) file uploaders in the instant upload scenario", function (assert) {
		//Arrange
		var bUploadButtonInvisible = true,
			bIsInstantUpload = true,
			stubGetUploadButtonInvisible = sinon.stub(this.oUploadCollection, "getUploadButtonInvisible").returns(!bUploadButtonInvisible),
			stubSetProperty = sinon.stub(this.oUploadCollection, "setProperty"),
			stubGetInstantUpload = sinon.stub(this.oUploadCollection, "getInstantUpload").returns(bIsInstantUpload),
			stubSetFileUploaderVisibility = sinon.stub(this.oUploadCollection, "_setFileUploaderVisibility");
		//Act
		var oInstance = this.oUploadCollection.setUploadButtonInvisible(bUploadButtonInvisible);
		//Assert
		assert.ok(stubGetUploadButtonInvisible.called, "getUploadButtonInvisible called");
		assert.ok(stubSetProperty.called, "setProperty called");
		assert.ok(stubSetProperty.calledWith("uploadButtonInvisible", bUploadButtonInvisible, true), "setProperty called with the correct arguments");
		assert.ok(stubGetInstantUpload.called, "getInstantUpload called");
		assert.ok(stubSetFileUploaderVisibility.notCalled, "_setFileUploaderVisibility not called");
		assert.deepEqual(oInstance, this.oUploadCollection, "Reference to this returned");
	});

	QUnit.test("setUploadButtonInvisible updates other file uploaders if it's not the instant upload", function (assert) {
		//Arrange
		var bUploadButtonInvisible = true,
			bIsInstantUpload = false,
			stubGetUploadButtonInvisible = sinon.stub(this.oUploadCollection, "getUploadButtonInvisible").returns(!bUploadButtonInvisible),
			stubSetProperty = sinon.stub(this.oUploadCollection, "setProperty"),
			stubGetInstantUpload = sinon.stub(this.oUploadCollection, "getInstantUpload").returns(bIsInstantUpload),
			stubSetFileUploaderVisibility = sinon.stub(this.oUploadCollection, "_setFileUploaderVisibility");
		//Act
		var oInstance = this.oUploadCollection.setUploadButtonInvisible(bUploadButtonInvisible);
		//Assert
		assert.ok(stubGetUploadButtonInvisible.called, "getUploadButtonInvisible called");
		assert.ok(stubSetProperty.called, "getUploadButtonInvisible called");
		assert.ok(stubSetProperty.calledWith("uploadButtonInvisible", bUploadButtonInvisible, true), "setProperty called with the correct arguments");
		assert.ok(stubGetInstantUpload.called, "getInstantUpload called");
		assert.ok(stubSetFileUploaderVisibility.called, "_setFileUploaderVisibility called");
		assert.ok(stubSetFileUploaderVisibility.calledWith(bUploadButtonInvisible), "_setFileUploaderVisibility called with the passed flag");
		assert.deepEqual(oInstance, this.oUploadCollection, "Reference to this returned");
	});

	QUnit.test("File upload button is not visible after setting uploadButtonInvisible to true", function (assert) {
		//Arrange
		this.oUploadCollection.setUploadButtonInvisible(true);
		//Act
		//Assert
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), false, "File Uploader is not visible");
	});

	QUnit.test("Info toolbar is not present", function (assert) {
		//Arrange
		//Act
		var oInfoToolbar = this.oUploadCollection.getInfoToolbar();
		var oInfoToolbarList = this.oUploadCollection._oList.getInfoToolbar();
		//Assert
		assert.ok(!oInfoToolbar, "Info toolbar is not present");
		assert.ok(!oInfoToolbarList, "Info toolbar list is not present");
	});

	QUnit.test("Info toolbar is rendered", function (assert) {
		//Arrange
		//Act
		var oInfoToolbar = new Toolbar("uploadCollection-infoToolbar", {
			content: [new Label("uploadCollection-infoToolbar-Label")]
		});
		this.oUploadCollection.setInfoToolbar(oInfoToolbar);
		var oInfoToolbar = this.oUploadCollection.getInfoToolbar();
		var oInfoToolbarList = this.oUploadCollection._oList.getInfoToolbar();
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(oInfoToolbar, oInfoToolbarList, "Info toolbar belongs to the item list");
		assert.ok(jQuery.sap.domById("uploadCollection-infoToolbar"), "Info toolbar is rendered");
		assert.ok(jQuery.sap.domById("uploadCollection-infoToolbar-Label"), "Info toolbar label is rendered");
	});

	QUnit.test("No data rendering", function (assert) {
		//Arrange
		this.oUploadCollection.unbindAggregation("items");
		var oSpy = sinon.spy(UploadCollectionRenderer, "renderNoData"),
			oSpyLIBRenderer = sinon.spy(ListItemBaseRenderer, "addFocusableClasses");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(oSpy.calledOnce, "no data rendering in upload collection is called");
		assert.ok(oSpyLIBRenderer.calledOnce, "Method addFocusableClasses of ListItemBaseRenderer is called");
		assert.ok(this.oUploadCollection._oList.$("nodata").hasClass("sapMLIB"), "The nodata area contains class sapMLIB");
		assert.ok(this.oUploadCollection._oList.$("nodata").hasClass("sapMUCNoDataPage"), "The nodata area contains class sapMUCNoDataPage");
		oSpy.restore();
	});

	QUnit.test("No data rendering in upload disabled state", function (assert) {
		//Arrange
		this.oUploadCollection.unbindAggregation("items");
		this.oUploadCollection.setUploadEnabled(false);
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(jQuery.sap.domById(this.oUploadCollection.getId() + "-no-data-text"), "No data text is rendered in upload disabled state");
		assert.notOk(jQuery.sap.domById(this.oUploadCollection.getId() + "-no-data-description"), "No data description is not rendered in upload disabled state");
	});

	QUnit.test("No data rendering - with default text", function (assert) {
		//Arrange
		this.oUploadCollection.unbindAggregation("items");
		var sNoDataText = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_NO_DATA_TEXT");
		var sNoDataDescription = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oUploadCollection.getNoDataText(), sNoDataText, "default text is returned for getNoDataText");
		assert.equal(this.oUploadCollection.getNoDataDescription(), sNoDataDescription, "default description is returned for getNoDataDescription");
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-text").text(), sNoDataText, "default no data text is rendered in upload collection");
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-description").text(), sNoDataDescription, "default no data description is rendered in upload collection");
	});

	QUnit.test("No data rendering - with user specified no data text", function (assert) {
		//Arrange
		this.oUploadCollection.setNoDataText("myNoDataText");
		this.oUploadCollection.unbindAggregation("items");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-text").text(), "myNoDataText", "The no data text set by user is rendered");
	});

	QUnit.test("No data rendering - with user specified no data description", function (assert) {
		//Arrange
		this.oUploadCollection.setNoDataDescription("myNoDataDescription");
		this.oUploadCollection.unbindAggregation("items");
		//Act
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-description").text(), "myNoDataDescription", "The no data description set by user is rendered");
	});

	QUnit.test("Reset renderNoData of the ListRenderer to the original function", function (assert) {
		//Arrange
		var oListRenderNoDataBefore = this.oUploadCollection._oList.getRenderer().renderNoData;
		var oListRenderNoDataAfter;
		//Act
		this.oUploadCollection.rerender();
		oListRenderNoDataAfter = this.oUploadCollection._oList.getRenderer().renderNoData;
		//Assert
		assert.equal(oListRenderNoDataAfter, oListRenderNoDataBefore, "Function renderNoData has been successfully reset to the original function");
	});

	QUnit.module("Rendering of UploadCollection with hideUploadButton = true", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollectionHideUpload1", {
				uploadButtonInvisible: true
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("File upload button is not visible", function (assert) {
		//Assert
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), false, "File Uploader is not visible");
	});

	QUnit.test("File upload button is visible after setting uploadButtonInvisible to false", function (assert) {
		//Arrange
		this.oUploadCollection.setUploadButtonInvisible(false);
		//Assert
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), true, "File Uploader is visible");
	});

	QUnit.module("API Methods", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection();
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Return type of overridden setter for property 'fileType'", function (assert) {
		assert.equal(this.oUploadCollection.setFileType(), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(this.oUploadCollection.setFileType(["gif", "jpg"]), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'fileType'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setFileType");

		//Act
		this.oUploadCollection.setFileType([]);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'maximumFilenameLength'", function (assert) {
		assert.equal(this.oUploadCollection.setMaximumFilenameLength(), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(this.oUploadCollection.setMaximumFilenameLength(10), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'maximumFilenameLength'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setMaximumFilenameLength");

		//Act
		this.oUploadCollection.setMaximumFilenameLength(10);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'maximumFileSize'", function (assert) {
		assert.equal(this.oUploadCollection.setMaximumFileSize(), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(this.oUploadCollection.setMaximumFileSize(10), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'maximumFileSize'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setMaximumFileSize");

		//Act
		this.oUploadCollection.setMaximumFileSize(100);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'mimeType'", function (assert) {
		assert.equal(this.oUploadCollection.setMimeType(), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'mimeType'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setMimeType");

		//Act
		this.oUploadCollection.setMimeType("application/json");

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'multiple'", function (assert) {
		assert.equal(this.oUploadCollection.setMultiple(true), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'multiple'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setMultiple");

		//Act
		this.oUploadCollection.setMultiple(true);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'showSeparators'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._oList, "setShowSeparators");

		//Act
		//Assert
		assert.equal(this.oUploadCollection.setShowSeparators(ListSeparators.None), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(oSpy.callCount, 1, "Setter function of List has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'uploadEnabled'", function (assert) {
		assert.equal(this.oUploadCollection.setUploadEnabled(false), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'uploadEnabled'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setEnabled");

		//Act
		this.oUploadCollection.setUploadEnabled(false);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'uploadUrl'", function (assert) {
		assert.equal(this.oUploadCollection.setUploadUrl("http://bla.de"), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'uploadUrl'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._getFileUploader(), "setUploadUrl");

		//Act
		this.oUploadCollection.setUploadUrl("http://bla.de");

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("Return type of overridden setter for property 'mode'", function (assert) {
		assert.equal(this.oUploadCollection.setMode(ListMode.Delete), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(this.oUploadCollection.setMode(ListMode.None), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
		assert.equal(this.oUploadCollection.setMode(ListMode.MultiSelect), this.oUploadCollection, "Correctly returned reference to UploadCollection.");
	});

	QUnit.test("Setter delegation to FileUploader for property 'mode'", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection._oList, "setMode");

		//Act
		this.oUploadCollection.setMode(ListMode.Delete);

		//Assert
		assert.equal(oSpy.callCount, 1, "Setter function of FileUploader has been called.");
	});

	QUnit.test("getInternalRequestHeaderNames returns correct request headers", function (assert) {
		//Act
		var aResult = this.oUploadCollection.getInternalRequestHeaderNames();
		//Assert
		assert.deepEqual(aResult[0], this.oUploadCollection._headerParamConst.fileNameRequestIdName);
		assert.deepEqual(aResult[1], this.oUploadCollection._headerParamConst.requestIdName);
	});

	QUnit.test("Return value of overridden getter for aggregation 'toolbar'", function (assert) {
		//Arrange
		this.oUploadCollection._oHeaderToolbar = new OverflowToolbar();

		//Act
		//Assert
		assert.deepEqual(this.oUploadCollection.getToolbar(), this.oUploadCollection._oHeaderToolbar, "The overridden getter has returned the correct control instance.");
	});

	QUnit.module("Internal Methods", {
		beforeEach: function () {
			this.oSpySetProperty = sinon.spy(ManagedObject.prototype, "setProperty");
			this.oSpyApplySettings = sinon.spy(ManagedObject.prototype, "applySettings");
			this.oItem = new UploadCollectionItem({
				fileName: "anyFileName"
			});
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: this.oItem
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.encodeToAscii = function (value) {
				var sEncodedValue = "";
				for (var i = 0; i < value.length; i++) {
					sEncodedValue = sEncodedValue + value.charCodeAt(i);
				}
				return sEncodedValue;
			};
		},
		afterEach: function () {
			this.oSpySetProperty.restore();
			this.oSpyApplySettings.restore();
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Function _findById returns correct item from the list based on the id", function (assert) {
		//Arrange
		var sId0 = "item0", sId1 = "item1",
			aListItems = [
				{
					getId: function () {
						return sId0;
					}
				},
				{
					getId: function () {
						return sId1;
					}
				}
			];
		//Act
		var oItem = UploadCollection._findById(sId1, aListItems);
		//Assert
		assert.deepEqual(oItem, aListItems[1], "Correct item has been returned by _findById");
	});

	QUnit.test("Function _getFileNameControl", function (assert) {
		//Arrange
		this.oItem._requestIdName = 0;
		var oFileName = this.oUploadCollection._getFileNameControl(this.oItem, this),
			oSpyGetter = sinon.spy(this.oItem, "_getFileNameLink");
		//Act
		oFileName = this.oUploadCollection._getFileNameControl(this.oItem, this);
		//Assert
		assert.equal(oSpyGetter.callCount, 1, "_getFileNameLink on oItem object was called once");
		assert.equal(oFileName.mEventRegistry.press.length, 1, "One press handler attached in case the function is called more times");
	});

	QUnit.test("Delete press event is fired", function (assert) {
		//Arrange
		var bDeleteButtonPressed = false;
		var oItem = new UploadCollectionItem({
			fileName: "anyFileName",
			deletePress: function () {
				bDeleteButtonPressed = true;
			}
		});
		this.oUploadCollection.insertItem(oItem);
		sap.ui.getCore().applyChanges();
		var oButton = oItem._getDeleteButton();
		//Act
		oButton.firePress();
		//Assert
		assert.equal(bDeleteButtonPressed, true, "Delete press event is fired");
	});

	QUnit.test("Custom event on FileNameLink press", function (assert) {
		//Arrange
		var oFileName,
			bLinkPressed = false;
		this.oItem.attachPress(function () {
			bLinkPressed = true;
		});
		//Act
		oFileName = this.oUploadCollection._getFileNameControl(this.oItem, this);
		oFileName.firePress();
		//Assert
		assert.equal(bLinkPressed, true, "Custom event triggered on FileNameLink press");
	});

	QUnit.test("Default event on FileNameLink press", function (assert) {
		//Arrange
		var oFileName,
			oStub = sinon.stub(this.oUploadCollection, "_triggerLink");
		this.oItem.setUrl("test.url");
		//Act
		oFileName = this.oUploadCollection._getFileNameControl(this.oItem, this);
		oFileName.firePress();
		//Assert
		assert.equal(this.oUploadCollection._triggerLink.callCount, 1, "Default event triggered on FileNameLink press");
		//Cleanup
		oStub.restore();
	});

	QUnit.test("Check if _createIcon returns an Icon", function (assert) {
		//Act
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oIcon.sId.indexOf("-ia_iconHL") > -1, "_createIcon returned an icon");
	});

	QUnit.test("Check if _createIcon returns an Image", function (assert) {
		//Act
		this.oItem.setThumbnailUrl("sap-icon://document");
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oIcon.sId.indexOf("-ia_imageHL") > -1, "_createIcon returned an image");
	});

	QUnit.test("Function _createIcon uses ManagedObject's setter for alt property if an icon is created", function (assert) {
		//Act
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oSpySetProperty.calledWith("alt", "anyFileName"), "Setter for alt property called with correct parameters");
	});

	QUnit.test("Function _createIcon doesn't set alt property during ManagedObject's create method if an icon is created", function (assert) {
		//Arrange
		var oSettings = {
			src: "sap-icon://document",
			decorative: false,
			useIconTooltip: false
		};
		//Act
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oSpyApplySettings.calledWith(oSettings), "Alt property is not set in ManagedObject's constructor");
	});

	QUnit.test("Function _createIcon uses ManagedObject's setter for alt property if an image is created", function (assert) {
		//Arrange
		this.oItem.setThumbnailUrl("anyFolder/myThumbnailFile.jpg");
		//Act
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oSpySetProperty.calledWith("alt", "anyFileName"), "Setter for alt property called with correct parameters");
	});

	QUnit.test("Function _createIcon doesn't set alt property during ManagedObject's create method if an image is created", function (assert) {
		//Arrange
		this.oItem.setThumbnailUrl("anyFolder/myThumbnailFile.jpg");
		var oSettings = {
			id: "item-ia_imageHL",
			src: "anyFolder/myThumbnailFile.jpg",
			decorative: false
		};
		//Act
		this.oIcon = this.oUploadCollection._createIcon(this.oItem, "item", this.oItem.getFileName(), this);
		//Assert
		assert.ok(this.oSpyApplySettings.calledWith(oSettings), "Alt property is not set in ManagedObject's constructor");
	});

	QUnit.test("Function _createDeleteButton", function (assert) {
		//Arrange
		var oItem = new UploadCollectionItem({
			fileName: "anyFileName",
			enableDelete: true
		});
		oItem._requestIdName = 0;
		this.oUploadCollection.insertItem(oItem);
		sap.ui.getCore().applyChanges();
		var oDeleteButton = this.oUploadCollection._createDeleteButton(oItem.getId(), "deleteButton", oItem, this);
		var oSpyGetter = sinon.spy(oItem, "_getDeleteButton");
		//Act
		oDeleteButton = this.oUploadCollection._createDeleteButton(oItem.getId(), "deleteButton", oItem, this);
		//Assert
		assert.equal(oSpyGetter.callCount, 1, "_getDeleteButton on oItem object was called once");
		assert.equal(oDeleteButton.mEventRegistry.press.length, 1, "One press handler attached in case the function is called several times");
	});

	QUnit.test("Set number of attachments title (default text)", function (assert) {
		var sText = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [999]);
		this.oUploadCollection._setNumberOfAttachmentsTitle(999);
		assert.strictEqual(this.oUploadCollection._oNumberOfAttachmentsTitle.getText(), sText, "Correct Title text for number of attachments.");
	});

	QUnit.test("Set number of attachments title", function (assert) {
		var sText = "My own text for attachments";
		this.oUploadCollection.setNumberOfAttachmentsText("My own text for attachments");
		this.oUploadCollection._setNumberOfAttachmentsTitle();
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oUploadCollection._oNumberOfAttachmentsTitle.getText(), sText, "Correct Title text for number of attachments.");
		assert.strictEqual(jQuery(jQuery.sap.domById("uploadCollection-numberOfAttachmentsTitle")).text(), sText);
	});

	QUnit.test("Set tooltip of FileUploader", function (assert) {
		var sText = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_UPLOAD");
		assert.strictEqual(this.oUploadCollection._oFileUploader.getTooltip(), sText, "Correct tooltip of FileUploader");
		assert.strictEqual(this.oUploadCollection._oFileUploader.getButtonText(), sText, "Correct tooltip of FileUploader");
	});

	QUnit.test("Determine icon from filename", function (assert) {
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName"), "sap-icon://document", "Document icon returned in case no file extension exists.");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.pdf"), "sap-icon://pdf-attachment", "Correct icon for file type .pdf determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.jpg"), "sap-icon://card", "Correct icon for file type .jpg determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("complexFileName.JPEG"), "sap-icon://card", "Correct icon for file type 'JPEG' determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.png"), "sap-icon://card", "Correct icon for file type .png determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.bmp"), "sap-icon://card", "Correct icon for file type .bmp determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.txt"), "sap-icon://document-text", "Correct icon for file type .txt determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.doc"), "sap-icon://doc-attachment", "Correct icon for file type .doc determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.docx"), "sap-icon://doc-attachment", "Correct icon for file type .docx determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.odt"), "sap-icon://doc-attachment", "Correct icon for file type .odt determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.xls"), "sap-icon://excel-attachment", "Correct icon for file type .xls determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.csv"), "sap-icon://excel-attachment", "Correct icon for file type .csv determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.ppt"), "sap-icon://ppt-attachment", "Correct icon for file type .ppt determined");
		assert.equal(this.oUploadCollection._getIconFromFilename("fileName.pptx"), "sap-icon://ppt-attachment", "Correct icon for file type .pptx determined");

		assert.equal(this.oUploadCollection._getIconFromFilename("complexFileName.123.pdf.jpg.png.bmp.ppt"), "sap-icon://ppt-attachment", "Correct icon for file type determined");
	});

	QUnit.test("Determine thumbnail of an item", function (assert) {
		var sThumbnailUrl = "anyFolder/myThumbnailFile.jpg";
		var sFilename = "complexFileName.123.pdf.jpg.png.bmp.ppt";
		this.oUploadCollection._getIconFromFilename = function () {
			return "_getIconFromFilename called";
		};

		// determine by thumbnail
		assert.equal(this.oUploadCollection._getThumbnail(sThumbnailUrl, sFilename), "anyFolder/myThumbnailFile.jpg", "Correct thumbnail determined by thumbnail url");

		// determine by file name
		sThumbnailUrl = "";
		assert.equal(this.oUploadCollection._getThumbnail(sThumbnailUrl, sFilename), "_getIconFromFilename called", "Correct thumbnail determined by file name, thumbnail Url not provided");
		sThumbnailUrl = null;
		assert.equal(this.oUploadCollection._getThumbnail(sThumbnailUrl, sFilename), "_getIconFromFilename called", "Correct thumbnail determined by file name, thumbnail Url is null");
		sFilename = "";
		assert.equal(this.oUploadCollection._getThumbnail(sThumbnailUrl, sFilename), "_getIconFromFilename called", "Correct thumbnail determined by file name, file name not provided");
		sFilename = null;
		assert.equal(this.oUploadCollection._getThumbnail(sThumbnailUrl, sFilename), "_getIconFromFilename called", "Correct thumbnail determined by file name, file name is null");
	});

	QUnit.test("Determine and set unique key for a file", function (assert) {
		var sFileName = "someFileName", sRequestId = "1", sFileNameRequestIdValue, aRequestHeaders = [
			{
				name: this.oUploadCollection._headerParamConst.requestIdName,
				value: sRequestId
			}
		];
		var oFileUploader = this.oUploadCollection._getFileUploader();
		oFileUploader.fireUploadStart({
			fileName: sFileName,
			requestHeaders: aRequestHeaders
		});
		var iParamCounter = aRequestHeaders.length;
		for (var i = 0; i < iParamCounter; i++) {
			if (aRequestHeaders[i].name === this.oUploadCollection._headerParamConst.fileNameRequestIdName) {
				sFileNameRequestIdValue = aRequestHeaders[i].value;
			}
		}
		assert.equal(sFileNameRequestIdValue, this.encodeToAscii(sFileName) + sRequestId, "Unique key for a File is set correctly into requestHeaders");
	});

	QUnit.test("handleTerminate - Function _handleTerminate called on terminate button press", function (assert) {
		var oDialogOpenStub = sinon.stub(Dialog.prototype, "open");
		var oHandleTerminateSpy = sinon.spy(this.oUploadCollection, "_handleTerminate");
		var oFileUploader = this.oUploadCollection._getFileUploader();
		oFileUploader._aXhr = [];
		var oFile2 = {
			name: "Document.txt"
		};
		oFileUploader.fireChange({
			files: [oFile2]
		});

		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();

		var oTerminateButton = this.oUploadCollection.aItems[0]._getTerminateButton();
		oTerminateButton.firePress();

		assert.equal(oHandleTerminateSpy.callCount, 1, "_handleTerminate on UploadCollection was called.");

		// Clean up
		var oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.destroy();
		oDialogOpenStub.restore();
	});

	QUnit.test("handleTerminate opens a dialog which could be cancelled.", function (assert) {
		var done = assert.async();
		var oItem = new UploadCollectionItem({
			fileName: "otto4711.txt"
		});
		this.oUploadCollection._handleTerminate({}, oItem);
		sap.ui.getCore().applyChanges();
		var oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		assert.ok(oDialog.getDomRef(), "Dialog was rendered.");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog is closed.");
			done();
		});
		oDialog.getButtons()[1].firePress();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Function _handleDelete creates the popup and changes the internal state of UploadCollection correctly", function (assert) {
		//Arrange
		var sItemId = this.oUploadCollection.aItems[0].sId,
			oMessageBoxStub = sinon.stub(MessageBox, "show"),
			oCloseMessageBoxStub = sinon.stub(this.oUploadCollection, "_onCloseMessageBoxDeleteItem"),
			sCompactClass = "sapUiSizeCompact",
			oEvent = {
				getParameters: function () {
					return {
						id: sItemId + "-deleteButton"
					};
				}
			};
		//Act
		this.oUploadCollection.addStyleClass(sCompactClass);
		this.oUploadCollection._handleDelete(oEvent);
		oMessageBoxStub.getCall(0).args[1].onClose();
		//Assert
		assert.ok(oCloseMessageBoxStub.called, "The _onCloseMessageBoxDeleteItem is correctly registered to handle the closing of MessageBox");
		assert.equal(this.oUploadCollection.sDeletedItemId, sItemId, "The internal id of the item that may be deleted is updated correctly");
		assert.equal(oMessageBoxStub.getCall(0).args[1].dialogId, "messageBoxDeleteFile", "Correct dialog id has been handed to the show function");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[0], MessageBox.Action.OK, "OK action is included in the MessageBox call");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[1], MessageBox.Action.CANCEL, "Cancel action is included in the MessageBox call");
		assert.equal(oMessageBoxStub.getCall(0).args[1].styleClass, sCompactClass, "Compact class has been handed from UploadCollection to the MessageBox successfully");
		//Restore
		oMessageBoxStub.restore();
	});

	QUnit.test("handleTerminate - abort on FileUploader is called.", function (assert) {
		var done = assert.async();
		// Prepare FileUploader Spy
		this.oUploadCollection._getFileUploader()._aXhr = [];
		sinon.spy(this.oUploadCollection._getFileUploader(), "abort");
		// Prepare UploadCollectionItem
		var oItem = new UploadCollectionItem({
			fileName: "otto4711.txt"
		});
		oItem._status = UploadCollection._uploadingStatus;
		oItem._requestIdName = 0;
		this.oUploadCollection.insertItem(oItem);
		sap.ui.getCore().applyChanges();
		// Call termination
		this.oUploadCollection._handleTerminate({}, oItem);
		var oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog is closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
		assert.equal(this.oUploadCollection._getFileUploader().abort.callCount, 1, "Abort on FileUploader was called.");
	});

	QUnit.test("handleTerminate - deleteFile is fired if the upload is done before a confirmation of the termination.", function (assert) {
		var done = assert.async();
		// Prepare UploadCollectionItem and UploadCollection itself
		var oItem = new UploadCollectionItem({
			fileName: "otto4711.txt",
			documentId: "4712"
		});
		oItem._status = UploadCollection._displayStatus;
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachFileDeleted(function (oEvent) {
			assert.equal(oEvent.getParameter("documentId"), "4712", "Correct documentId passed.");
			assert.deepEqual(oEvent.getParameter("item"), oItem, "Correct item passed.");
		});
		sap.ui.getCore().applyChanges();
		// Call termination
		this.oUploadCollection._handleTerminate({}, oItem);
		var oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog is closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
		sap.ui.getCore().applyChanges();
	});

    QUnit.test("handle Change - Special characters in the fileName property is displayed correctly", function (assert) {
        //Arrange
        var oFileUploader = this.oUploadCollection._getFileUploader();
        oFileUploader._aXhr = [];
        var oFile2 = {
            name: "{Document}.txt"
        };
        oFileUploader.fireChange({
            files: [oFile2]
        });
        //Act
        this.oUploadCollection.invalidate();
        sap.ui.getCore().applyChanges();
        //Assert
        assert.equal(this.oUploadCollection.aItems[0].getFileName(), oFile2.name, "Special characters in the fileName property is displayed correctly");
    });

	QUnit.module("List API Methods", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Event 'selectionChange' is attached once", function (assert) {
		//Arrange
		var nListeners = this.oUploadCollection._oList.mEventRegistry.selectionChange.length;
		//Act
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		//Assert
		assert.equal(this.oUploadCollection._oList.mEventRegistry.selectionChange.length, nListeners, "Event 'selectionChange' is attached once");
	});

	QUnit.test("Set and get selected items in Multiple Mode", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.MultiSelect);

		//Act
		var oReturnedUploadCollection = this.oUploadCollection.setSelectedItem(aAllItems[0], true);
		oReturnedUploadCollection = this.oUploadCollection.setSelectedItem(aAllItems[1], true);
		oReturnedUploadCollection = this.oUploadCollection.setSelectedItem(aAllItems[2], true);

		//Assert
		assert.ok(oReturnedUploadCollection instanceof UploadCollection, "Returned value is UploadCollection");
		assert.equal(this.oUploadCollection.getSelectedItems().length, 3, "3 items have been selected");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[0], aAllItems[0], "Data of first selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[0] instanceof UploadCollectionItem, "First item returned is UploadCollectionItem");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[1], aAllItems[1], "Data of second selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[1] instanceof UploadCollectionItem, "Second item returned is UploadCollectionItem");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[2], aAllItems[2], "Data of third selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[2] instanceof UploadCollectionItem, "Third item returned is UploadCollectionItem");
	});

	QUnit.test("Set and reset selected items in Multiple Mode", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.MultiSelect);

		//Act
		this.oUploadCollection.setSelectedItem(aAllItems[0], true);
		this.oUploadCollection.setSelectedItem(aAllItems[1], true);

		//Assert
		assert.equal(this.oUploadCollection.getSelectedItems().length, 2, "2 items have been selected before reset");
		this.oUploadCollection.setSelectedItem(aAllItems[0], false);
		assert.equal(this.oUploadCollection.getSelectedItems().length, 1, "1 item has been selected after reset");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[0], aAllItems[1], "Data of first selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[0] instanceof UploadCollectionItem, "First item returned is UploadCollectionItem");
		assert.ok(this.oUploadCollection.getItems()[1].getSelected(), "The getSelected of UploadCollectionItem has been set correctly");
	});

	QUnit.test("Set and reset selected items in Single Mode", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.SingleSelect);

		//Act
		this.oUploadCollection.setSelectedItem(aAllItems[0], true);
		this.oUploadCollection.setSelectedItem(aAllItems[1], true);

		//Assert
		assert.equal(this.oUploadCollection.getSelectedItems().length, 1, "1 item has been selected after reset");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[0], aAllItems[1], "Data of first selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[0] instanceof UploadCollectionItem, "First item returned is UploadCollectionItem");
		assert.ok(this.oUploadCollection.getItems()[1].getSelected(), "The getSelected of UploadCollectionItem has been set correctly");
		assert.equal(this.oUploadCollection.getItems()[0].getSelected(), false, "The getSelected of UploadCollectionItem has been reset correctly");
	});

	QUnit.test("Set and get selected items by Id", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.MultiSelect);

		//Act
		var oReturnedUploadCollection = this.oUploadCollection.setSelectedItemById(aAllItems[0].getId(), true);
		oReturnedUploadCollection = this.oUploadCollection.setSelectedItemById(aAllItems[2].getId(), true);

		//Assert
		assert.ok(oReturnedUploadCollection instanceof UploadCollection, "Returned value is UploadCollection");
		assert.equal(this.oUploadCollection.getSelectedItems().length, 2, "2 items have been selected");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[0], aAllItems[0], "Data of first selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[0] instanceof UploadCollectionItem, "First item returned is UploadCollectionItem");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[1], aAllItems[2], "Data of second selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[1] instanceof UploadCollectionItem, "Second item returned is UploadCollectionItem");
	});

	QUnit.test("Get selected items without selection", function (assert) {
		//Arrange

		//Act

		//Assert
		assert.equal(this.oUploadCollection.getSelectedItems().length, 0, "0 items have been selected");
	});

	QUnit.test("Set and get selected item", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.SingleSelect);

		//Act
		this.oUploadCollection.setSelectedItem(aAllItems[0], true);

		//Assert
		assert.deepEqual(this.oUploadCollection.getSelectedItem(), aAllItems[0], "Selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItem() instanceof UploadCollectionItem, "Item returned is UploadCollectionItem");
	});

	QUnit.test("Set and get selected item by Id", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.SingleSelectLeft);

		//Act
		var oReturnedUploadCollection = this.oUploadCollection.setSelectedItemById(aAllItems[0].getId(), true);

		//Assert
		assert.deepEqual(oReturnedUploadCollection, this.oUploadCollection, "Local Uploadcollection and returned element are deepEqual");
		assert.deepEqual(this.oUploadCollection.getSelectedItem(), aAllItems[0], "Selected item is correct");
		assert.ok(oReturnedUploadCollection.getItems()[0].getSelected(), "The getSelected of UploadCollectionItem has been set correctly");
		assert.ok(this.oUploadCollection.getSelectedItem() instanceof UploadCollectionItem, "Item returned is UploadCollectionItem");
	});

	QUnit.test("Get selected item without selection", function (assert) {
		//Arrange

		//Act

		//Assert
		assert.equal(this.oUploadCollection.getSelectedItem(), null, "Selected item is correct");
	});

	QUnit.test("Set all and get selected items", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.MultiSelect);

		//Act
		var oReturnedUploadCollection = this.oUploadCollection.selectAll();

		//Assert
		assert.ok(oReturnedUploadCollection instanceof UploadCollection, "Returned value is UploadCollection");
		assert.equal(this.oUploadCollection.getSelectedItems().length, aAllItems.length, "Input and Output amount of items are equal");
		assert.equal(oReturnedUploadCollection.getSelectedItems().length, this.oUploadCollection.getSelectedItems().length, "Return value of selectAll is equal to getSelectedItems");
		assert.deepEqual(oReturnedUploadCollection, this.oUploadCollection, "Local Uploadcollection and returned element are deepEqual");
		assert.deepEqual(this.oUploadCollection.getSelectedItems()[0], aAllItems[0], "Data of first selected item is correct");
		assert.ok(this.oUploadCollection.getSelectedItems()[0] instanceof UploadCollectionItem, "First item returned is UploadCollectionItem");
		assert.equal(this.oUploadCollection.getSelectedItem(), aAllItems[0], "getSelectedItem() returns first selected item for multiple selection");
	});

	QUnit.test("Set and reset all items manually to check sync state of UCIs and UC.", function (assert) {
		//Arrange
		var aAllItems = this.oUploadCollection.getItems();
		this.oUploadCollection.setMode(ListMode.MultiSelect);

		//Act
		for (var i = 0; i < aAllItems.length; i++) {
			aAllItems[i].setSelected(true);
		}
		for (var i = 0; i < aAllItems.length; i++) {
			aAllItems[i].setSelected(false);
		}

		//Assert
		assert.equal(this.oUploadCollection.getSelectedItems().length, 0, "0 items are selected");
	});

	QUnit.test("Set and get mode", function (assert) {
		//Arrange
		assert.equal(this.oUploadCollection.getMode(), ListMode.None, "Mode before setting value was 'None'");

		//Act
		this.oUploadCollection.setMode(ListMode.SingleSelectMaster);

		//Assert
		assert.equal(this.oUploadCollection.getMode(), ListMode.SingleSelectMaster, "Mode after setting value 'SingleSelectMaster'");
	});

	QUnit.test("Avoid setting sap.m.ListMode.Delete for UploadCollection using constructor", function (assert) {
		//Arrange
		this.oUploadCollection.destroy();

		//Act
		this.oUploadCollection = new UploadCollection("uploadCollection", {
			items: {
				path: "/items",
				template: createItemTemplate(),
				templateShareable: false
			},
			mode: ListMode.Delete
		});

		//Assert
		assert.equal(this.oUploadCollection.getMode(), ListMode.None, "Mode after setting 'Delete' is 'None'");
	});

	QUnit.test("Avoid setting sap.m.ListMode.Delete for UploadCollection using setter", function (assert) {
		//Arrange

		//Act
		this.oUploadCollection.setMode(ListMode.Delete);

		//Assert
		assert.equal(this.oUploadCollection.getMode(), ListMode.None, "Mode after setting 'Delete' is 'None'");
	});

	QUnit.test("Avoid setting sap.m.ListMode.Delete for UploadCollection on override existing value", function (assert) {
		//Arrange
		this.oUploadCollection.destroy();
		this.oUploadCollection = new UploadCollection("uploadCollection", {
			items: {
				path: "/items",
				template: createItemTemplate(),
				templateShareable: false
			},
			mode: ListMode.MultiSelect
		});
		assert.equal(this.oUploadCollection.getMode(), ListMode.MultiSelect, "Initial Mode before setting value is 'Multiple'");

		//Act
		this.oUploadCollection.setMode(ListMode.Delete);

		//Assert
		assert.equal(this.oUploadCollection.getMode(), ListMode.None, "Mode after setting 'Delete' is 'None'");
	});

	QUnit.test("Function _handleSelectionChange triggers the selection change", function (assert) {
		//Arrange
		var sListItem = "listItem", sListItems = "listItems", sSelected = "selected",
			aUploadCollectionListItems = ["dummy"],
			oUploadCollectionItem = new UploadCollectionItem(),
			bSelected = true,
			oListItem = {
				getSelected: function () {
					return true;
				}
			},
			oEvent = {
				getParameter: function (name) {
					if (name === sListItem) {
						return oListItem;
					} else if (name === sListItems) {
						return aUploadCollectionListItems;
					} else if (name === sSelected) {
						return bSelected;
					}
				}
			},
			oGetUploadCollectionItemsByListItems = sinon.stub(this.oUploadCollection, "_getUploadCollectionItemsByListItems")
				.returns(aUploadCollectionListItems),
			oGetUploadCollectionItemByListItem = sinon.stub(this.oUploadCollection, "_getUploadCollectionItemByListItem")
				.returns(oUploadCollectionItem),
			oFireSelectionChangeStub = sinon.stub(this.oUploadCollection, "fireSelectionChange"),
			oSetSelectedStub = sinon.stub(oUploadCollectionItem, "setSelected");
		//Act
		this.oUploadCollection._handleSelectionChange(oEvent);
		//Assert
		assert.strictEqual(oGetUploadCollectionItemByListItem.getCall(0).args[0], oListItem, "The function _getUploadCollectionItemByListItem has been called with correct argument");
		assert.strictEqual(oGetUploadCollectionItemsByListItems.getCall(0).args[0], aUploadCollectionListItems, "The function _getUploadCollectionItemsByListItems has been called with correct argument");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selectedItem"], oUploadCollectionItem, "The selectionChange event has correct selectedItem parameter");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selectedItems"], aUploadCollectionListItems, "The selectionChange event has correct selectedItems parameter");
		assert.strictEqual(oFireSelectionChangeStub.getCall(0).args[0]["selected"], bSelected, "The selectionChange event has correct selected parameter");
		assert.strictEqual(oSetSelectedStub.getCall(0).args[0], oListItem.getSelected(), "The setSelected method has been called with correct argument");
	});

	QUnit.module("Download Item Tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("To download an item without URL fails.", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[0];
		oItem.setUrl(null);
		//Act
		var bIsDownloaded = this.oUploadCollection.downloadItem(oItem, false);
		//Assert
		assert.equal(bIsDownloaded, false, "Download fails because the item has not URL.");
	});

	QUnit.test("Download an item returns true.", function (assert) {
		//Arrange
		var stub = sinon.stub(this.oUploadCollection, "downloadItem");
		var oItem = this.oUploadCollection.getItems()[3];
		//Act
		this.oUploadCollection.downloadItem(oItem, false);
		//Assert
		assert.ok(stub.called, "Download method was called.");
		assert.equal(stub.returns().toString(), "downloadItem", "Download returns the right method.");
	});

	QUnit.module("Terminate Upload Tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Terminate upload button is visible by default.", function (assert) {
		//Arrange
		var oItem = this.oUploadCollection.getItems()[0];
		var spyGetTerminationEnabled = sinon.spy(this.oUploadCollection, "getTerminationEnabled");
		//Act
		var oDeleteButton = this.oUploadCollection._createDeleteButton("visibleButtonTestId", "terminateButton", oItem, "", {});
		//Assert
		assert.ok(spyGetTerminationEnabled.called, "getTerminationEnabled method was called.");
		assert.strictEqual(oDeleteButton.getVisible(), true, "The terminate button is visible.");
	});

	QUnit.test("Terminate upload button is not visible when terminationEnabled is false.", function (assert) {
		//Arrange
		this.oUploadCollection.setTerminationEnabled(false);
		var oItem = this.oUploadCollection.getItems()[0];
		var spyGetTerminationEnabled = sinon.spy(this.oUploadCollection, "getTerminationEnabled");
		//Act
		var oDeleteButton = this.oUploadCollection._createDeleteButton("invisibleButtonTestId", "terminateButton", oItem, null, {});
		//Assert
		assert.ok(spyGetTerminationEnabled.called, "getTerminationEnabled method was called.");
		assert.strictEqual(oDeleteButton.getVisible(), false, "The terminate button is not visible.");
	});

	QUnit.test("Terminate upload button is not visible when button exists and terminationEnabled is false.", function (assert) {
		//Arrange
		this.oUploadCollection.setTerminationEnabled(false);
		var oItem = this.oUploadCollection.getItems()[0];
		var spyGetTerminationEnabled = sinon.spy(this.oUploadCollection, "getTerminationEnabled");
		//Act
		var oDeleteButton = this.oUploadCollection._createDeleteButton("invisibleButtonTestId", "terminateButton", oItem, null, {});
		// re-create the existing button
		this.oUploadCollection._createDeleteButton("invisibleButtonTestId", "terminateButton", oItem, null, {});
		//Assert
		assert.ok(spyGetTerminationEnabled.called, "getTerminationEnabled method was called.");
		assert.strictEqual(oDeleteButton.getVisible(), false, "The terminate button is not visible.");
	});

	QUnit.test("Terminate upload button is visible when button exists and terminationEnabled is true.", function (assert) {
		//Arrange
		this.oUploadCollection.setTerminationEnabled(true);
		var oItem = this.oUploadCollection.getItems()[0];
		var spyGetTerminationEnabled = sinon.spy(this.oUploadCollection, "getTerminationEnabled");
		//Act
		var oDeleteButton = this.oUploadCollection._createDeleteButton("invisibleButtonTestId", "terminateButton", oItem, null, {});
		// re-create the existing button
		this.oUploadCollection._createDeleteButton("invisibleButtonTestId", "terminateButton", oItem, null, {});
		//Assert
		assert.ok(spyGetTerminationEnabled.called, "getTerminationEnabled method was called.");
		assert.strictEqual(oDeleteButton.getVisible(), true, "The terminate button is visible.");
	});

	QUnit.test("_setFileUploaderVisibility updates the visibility of the file upload placeholder.", function (assert) {
		//Arrange
		var bUploadButtonInvisible = true;
		var oFileUploader = new FileUploader();
		var oContent = [{}, {}, oFileUploader];
		this.oUploadCollection._iFileUploaderPH = 2;
		var stubGetContent = sinon.stub(this.oUploadCollection._oHeaderToolbar, "getContent").returns(oContent);
		var stubSetVisible = sinon.stub(oFileUploader, "setVisible");
		this.oUploadCollection._aFileUploadersForPendingUpload = [{}];
		//Act
		this.oUploadCollection._setFileUploaderVisibility(bUploadButtonInvisible);
		//Assert
		assert.ok(true);
		assert.ok(stubGetContent.called, "getContent method on _oHeaderToolbar was called.");
		assert.ok(stubSetVisible.called, "setVisible method on the file uploder was called.");
		assert.ok(stubSetVisible.calledOnce, "setVisible method on the file uploder was called only once.");
		assert.ok(stubSetVisible.calledWith(!bUploadButtonInvisible), "setVisible was called with the opposite of bUploadButtonInvisible flag.");
		this.oUploadCollection._aFileUploadersForPendingUpload = [];
		stubGetContent.restore();
	});

	QUnit.module("Focus after item deletion", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Focus is only set once after delete", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection, "_setFocusAfterDeletion");
		this.oUploadCollection.sDeletedItemId = "someId";

		//Act
		this.oUploadCollection.rerender();
		this.oUploadCollection.rerender();

		//Assert
		assert.equal(this.oUploadCollection.sDeletedItemId, null, "Member sDeletedItemId has been reset.");
		assert.equal(oSpy.callCount, 1, "Focus has been set after deletion.");
	});

	/* --------------------------------------- */
	/* Test for upload progress rendering      */
	/* --------------------------------------- */
	QUnit.module("Upload progress rendering tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			});
			// stub UploadCollection's attributes
			this.oUploadCollection._headerParamConst.requestIdName = "1";
			this.oUploadCollection._getRequestId = function () {
				return "1";
			};
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Rendering of uploadProgress 50% uploaded", function (assert) {
		// at present it is very hard to simulate IE9 in QUnits with requestID
		if (Device.browser.msie && Device.browser.version <= 9) {
			assert.expect(0);
			return;
		}
		//Arrange
		var sUploadProgress = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_UPLOADING", [50]);
		var oFileUploader = this.oUploadCollection._getFileUploader();

		//Act
		oFileUploader.fireChange({
			files: [
				{
					name: "file1"
				}
			]
		});
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();

		oFileUploader.fireUploadProgress({
			fileName: "file1",
			loaded: 50,
			total: 100
		});
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-ta_progress").getText(), sUploadProgress, "Correct uploadProgress text");
		assert.equal(jQuery.sap.domById(this.oUploadCollection.aItems[0].sId + "-ia_indicator").getAttribute("aria-valuenow"), "50", "Correct ARIA-valuenow attribute");
	});

	QUnit.test("Rendering of uploadProgress 100% uploaded", function (assert) {
		// at present it is very hard to simulate IE9 in QUnits with requestID
		if (Device.browser.msie && Device.browser.version <= 9) {
			assert.expect(0);
			return;
		}
		//Arrange
		var sUploadCompleted = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_UPLOAD_COMPLETED");
		var oFileUploader = this.oUploadCollection._getFileUploader();

		//Act
		oFileUploader.fireChange({
			files: [
				{
					name: "file1"
				}
			]
		});
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();

		oFileUploader.fireUploadProgress({
			fileName: "file1",
			loaded: 100,
			total: 100
		});
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-ta_progress").getText(), sUploadCompleted, "Correct uploadCompleted text");
		assert.equal(jQuery.sap.domById(this.oUploadCollection.aItems[0].sId + "-ia_indicator").getAttribute("aria-label"), sUploadCompleted, "Correct ARIA-label attribute");
	});

	/* --------------------------------------- */
	/* Test events                             */
	/* --------------------------------------- */
	QUnit.module("Drag and drop", {
		beforeEach: function () {
			this.$RootNode = jQuery(document.body);
			this.oSpyOnChange = sinon.spy(UploadCollection.prototype, "_onChange");
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				},
				multiple: true
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSpyOnChange.restore();
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Drag file enter UIArea", function (assert) {
		//Arrange
		var oStubCheckForFiles = sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		//Act
		this.$RootNode.trigger("dragenter");
		//Assert
		assert.notOk(this.oUploadCollection.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is visible");
		assert.ok(oStubCheckForFiles.called, "The check for files has been performed");
	});

	QUnit.test("Drag file over UIArea", function (assert) {
		//Arrange
		var oStubCheckForFiles = sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		//Act
		this.$RootNode.trigger("dragover");
		//Assert
		assert.notOk(this.oUploadCollection.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is visible");
		assert.ok(oStubCheckForFiles.called, "The check for files has been performed");
	});

	QUnit.test("Drag file leave UIArea", function (assert) {
		//Arrange
		this.oUploadCollection.$("drag-drop-area").removeClass("sapMUCDragDropOverlayHide");
		this.oUploadCollection._oLastEnterUIArea = this.$RootNode[0];
		//Act
		this.$RootNode.trigger("dragleave");
		//Assert
		assert.ok(this.oUploadCollection.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is not visible");
	});

	QUnit.test("Drag file enter UploadCollection", function (assert) {
		//Arrange
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		var oStubCheckForFiles = sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		//Act
		$DragDropArea.trigger("dragenter");
		//Assert
		assert.notOk($DragDropArea.hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is visible");
		assert.ok(oStubCheckForFiles.called, "The check for files has been performed");
	});

	QUnit.test("Drag file leave UploadCollection", function (assert) {
		//Arrange
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		this.oUploadCollection.$("drag-drop-area").removeClass("sapMUCDragDropOverlayHide");
		//Act
		$DragDropArea.trigger("dragleave");
		//Assert
		assert.notOk($DragDropArea.hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is visible");
	});

	QUnit.test("Drop file in UIArea", function (assert) {
		//Arrange
		this.oUploadCollection.$("drag-drop-area").removeClass("sapMUCDragDropOverlayHide");
		//Act
		this.$RootNode.trigger("drop");
		//Assert
		assert.ok(this.oUploadCollection.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag overlay is not visible");
	});

	QUnit.test("Drop file in UploadCollection", function (assert) {
		//Arrange
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		var oSpySendFiles = sinon.spy(this.oUploadCollection._getFileUploader(), "_sendFilesFromDragAndDrop");
		var oStubFilesAllowed = sinon.stub(this.oUploadCollection._getFileUploader(), "_areFilesAllowed").returns(true);
		var oStubCheckForFiles = sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		var oEvent = jQuery.Event("drop", {
			originalEvent: {
				dataTransfer: {
					files: []
				}
			}
		});
		$DragDropArea.removeClass("sapMUCDragDropOverlayHide");
		$DragDropArea.addClass("sapMUCDropIndicator");
		//Act
		$DragDropArea.trigger(oEvent);

		//Assert
		assert.notOk($DragDropArea.hasClass("sapMUCDropIndicator"), "The UploadCollection drop indicator is hidden after drop");
		assert.ok($DragDropArea.hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag and drop overlay is hidden after drop");
		assert.equal(oSpySendFiles.callCount, 1, "The API method of FileUploader for UploadCollection was called");
		assert.equal(this.oSpyOnChange.callCount, 1, "The _onChange event is triggered when file is dropped in UC");
		assert.ok(oStubFilesAllowed.called, "The check for files from FileUploader has been performed");
		assert.ok(oStubCheckForFiles.called, "The check for files has been performed");
		assert.equal(this.oUploadCollection.getAggregation("_dragDropText").getText(), this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_DRAG_FILE_INDICATOR"), "The drag indicator text is set back after drop");
	});

	QUnit.test("Dropping more than one file is not allowed when multiple is false", function (assert) {
		//Arrange
		this.oUploadCollection.setMultiple(false);
		sap.ui.getCore().applyChanges();
		var oStubCheckForFiles = sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		var oStubMessageBox = sinon.stub(MessageBox, "error");
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		var oFileList = [
			{
				name: "file1"
			}, {
				name: "file2"
			}
		];
		var oEvent = jQuery.Event("drop", {
			originalEvent: {
				dataTransfer: {
					files: oFileList
				}
			}
		});
		//Act
		$DragDropArea.trigger(oEvent);
		//Assert
		assert.ok(this.oSpyOnChange.notCalled, "Files are not dropped in UploadCollection");
		assert.ok(oStubMessageBox.called, "Error Messagebox is displayed");
		//Restore
		oStubMessageBox.restore();
		oStubCheckForFiles.restore();
	});

	QUnit.test("Drag drop icon is hidden when height of drag drop area smaller than 10rem", function (assert) {
		//Arrange
		sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		this.oUploadCollection.$("drag-drop-area").height(150);
		//Act
		this.$RootNode.trigger("dragenter");
		//Assert
		assert.ok(this.oUploadCollection.getAggregation("_dragDropIcon").$().is(":hidden"), "The drag and drop icon is hidden");
	});

	QUnit.test("Drag drop icon is hidden when height of drag drop area smaller than 10rem", function (assert) {
		//Arrange
		sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		this.oUploadCollection.$("drag-drop-area").height(150);
		//Act
		this.$RootNode.trigger("dragenter");
		//Assert
		assert.ok(this.oUploadCollection.getAggregation("_dragDropIcon").$().is(":hidden"), "The drag and drop icon is hidden");
	});

	QUnit.test("Private function _isDragAndDropAllowed: success case", function (assert) {
		var bDragAndDropAllowed;
		//Arrange
		//Act
		bDragAndDropAllowed = this.oUploadCollection._isDragAndDropAllowed();
		//Assert
		assert.ok(bDragAndDropAllowed, "Function returns true when both uploadEnabled is set to true and uploadButtonInvisible is set to false");
	});

	QUnit.test("Private function _isDragAndDropAllowed: failure case", function (assert) {
		var bDragAndDropAllowed;
		//Arrange
		this.oUploadCollection.setUploadEnabled(false);
		//Act
		bDragAndDropAllowed = this.oUploadCollection._isDragAndDropAllowed();
		//Assert
		assert.notOk(bDragAndDropAllowed, "Function returns false when uploadEnabled is set to false");
	});

	QUnit.test("Drag and drop is not allowed", function (assert) {
		var $DragDropArea;
		//Arrange
		this.oUploadCollection.setUploadButtonInvisible(true);
		this.oUploadCollection.rerender();
		$DragDropArea = this.oUploadCollection.$("drag-drop-area");
		//Act
		$DragDropArea.trigger("dragenter");
		//Assert
		assert.ok(this.oUploadCollection.$("drag-drop-area").hasClass("sapMUCDragDropOverlayHide"), "Drag and drop is not possible when either upload is disabled or the upload button is invisible");
	});

	QUnit.test("Change of uploadButtonInvisible property", function (assert) {
		var oBindSpy,
			oUnBindSpy;
		//Arrange
		oBindSpy = sinon.spy(this.oUploadCollection, "_bindDragEnterLeave");
		oUnBindSpy = sinon.spy(this.oUploadCollection, "_unbindDragEnterLeave");
		//Act
		this.oUploadCollection.setUploadButtonInvisible(true);
		this.oUploadCollection.setUploadButtonInvisible(false);
		//Assert
		assert.ok(oUnBindSpy.calledOnce, "The change of uploadButtonInvisible to true leads to an unbind of the dragEnterLeave event");
		assert.ok(oBindSpy.calledOnce, "The change of uploadButtonInvisible to false leads to a bind of the dragEnterLeave event");
	});

	QUnit.test("Check for files with files", function (assert) {
		var bActual,
			oEvent;

		//Arrange
		oEvent = {
			originalEvent: {
				dataTransfer: {
					types: [
						"Files"
					]
				}
			}
		};
		//Act
		bActual = this.oUploadCollection._checkForFiles(oEvent);
		//Assert
		assert.ok(bActual, "The check successfully recognizes files in the event data");
	});

	QUnit.test("Check for files with other elements", function (assert) {
		var bActual,
			oEvent;

		//Arrange
		oEvent = {
			originalEvent: {
				dataTransfer: {
					types: [
						"text/plain",
						"text/html"
					]
				}
			}
		};
		//Act
		bActual = this.oUploadCollection._checkForFiles(oEvent);
		//Assert
		assert.notOk(bActual, "The check successfully recognizes that there are no files in the event data");
	});

	QUnit.module("Event tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				maximumFilenameLength: 35,
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oDataCopy = jQuery.extend(true, {}, oData);
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
			oData = this.oDataCopy;
		}
	});

	QUnit.test("Event typeMissmatch", function (assert) {
		assert.expect(18); // verifies the event handler was executed
		var oFile = {
			name: "someFileName",
			fileType: "someNotAllowedFileType",
			mimeType: "someNotAllowedMimeType"
		};

		function onTypeMissmatch(oEvent) {
			assert.ok(true, "Event typeMissmatch fired");
			assert.equal(oEvent.getId(), "typeMissmatch", "Event Id 'typeMissmatch' provided");
			// deprecated
			assert.equal(oEvent.mParameters.getParameter("fileName"), "someFileName", "Correct file name provided in typeMissmatch by oEvent.mParameters.getParameter('fileName')");
			assert.equal(oEvent.getParameters().getParameters()["fileName"], "someFileName", "Correct file name provided in typeMissmatch by oEvent.getParameters().getParameters()['fileName']");
			assert.equal(oEvent.getParameter("mParameters")["fileName"], "someFileName", "Correct file name provided in typeMissmatch by oEvent.getParameter('mParameters')['fileName']");
			assert.equal(oEvent.mParameters.getParameter("fileType"), "someNotAllowedFileType", "Correct file type provided in typeMissmatch by oEvent.mParameters.getParameter('fileType')");
			assert.equal(oEvent.getParameters().getParameters()["fileType"], "someNotAllowedFileType", "Correct file type provided in typeMissmatch by oEvent.getParameters().getParameters()['fileType']");
			assert.equal(oEvent.getParameter("mParameters")["fileType"], "someNotAllowedFileType", "Correct file type provided in typeMissmatch by oEvent.getParameter('mParameters')['fileType']");
			assert.equal(oEvent.mParameters.getParameter("mimeType"), "someNotAllowedMimeType", "Correct mime type provided in typeMissmatch by oEvent.mParameters.getParameter('mimeType')");
			assert.equal(oEvent.getParameters().getParameters()["mimeType"], "someNotAllowedMimeType", "Correct mime type provided in typeMissmatch by oEvent.getParameters().getParameters()['mimeType']");
			assert.equal(oEvent.getParameter("mParameters")["mimeType"], "someNotAllowedMimeType", "Correct mime type provided in typeMissmatch by oEvent.getParameter('mParameters')['mimeType']");
			//new
			assert.equal(oEvent.getParameter("files")[0].name, "someFileName", "Correct file name provided in typeMissmatch event by oEvent.getParameter('files')[0].name");
			assert.equal(oEvent.getParameters()["files"][0]["name"], "someFileName", "Correct file name provided in typeMissmatch event by oEvent.getParameters()['files'][0]['name']");
			assert.equal(oEvent.getParameter("files")[0].fileType, "someNotAllowedFileType", "Correct file type provided in typeMissmatch by oEvent.getParameter('files')[0].fileType");
			assert.equal(oEvent.getParameter("files")[0]["fileType"], "someNotAllowedFileType", "Correct file type provided in typeMissmatch by oEvent.getParameter('files')[0]['fileType']");
			assert.equal(oEvent.getParameter("files")[0].mimeType, "someNotAllowedMimeType", "Correct mime type provided in typeMissmatch by oEvent.getParameter('files')[0].mimeType");
			assert.equal(oEvent.getParameter("files")[0]["mimeType"], "someNotAllowedMimeType", "Correct mime type provided in typeMissmatch by oEvent.getParameter('files')[0]['mimeType']");
			assert.deepEqual(oEvent.getParameter("files")[0], oFile, "Correct file provided in typeMissmatch event by oEvent.getParameter('files')[0].");
		}

		this.oUploadCollection.attachTypeMissmatch(onTypeMissmatch);
		this.oUploadCollection._getFileUploader().fireTypeMissmatch({
			fileName: "someFileName",
			fileType: "someNotAllowedFileType",
			mimeType: "someNotAllowedMimeType"
		});
	});

	QUnit.test("Event fileSizeExceed", function (assert) {
		var sFileSize = "sizeOfTooBigFile";
		var sFileName = "nameOfTooBigFile";
		var oFileUploaderEventMock = {
			newValue: sFileName,
			fileSize: sFileSize,
			fileName: sFileName
		};

		function fileSizeExceed(oEvent) {
			var sFileName = "nameOfTooBigFile";
			var sDocumentId; // undefined
			var sFileSize = "sizeOfTooBigFile";
			var oBigFile = {
				name: sFileName,
				fileSize: sFileSize
			};
			assert.equal(oEvent.getId(), "fileSizeExceed", "Event Id 'fileSizeExceed' provided");
			if (Device.browser.msie && Device.browser.version <= 9) {
				// deprecated
				assert.equal(oEvent.getParameters().getParameter("newValue"), sFileName, "Correct file name in change event provided by oEvent.getParameters().getParameter('newValue')");
				assert.equal(oEvent.getParameters().getParameters()["newValue"], sFileName, "Correct file name in change event provided by oEvent.getParameters().getParameters()['newValue']");
				assert.equal(oEvent.getParameter("mParameters")["newValue"], sFileName, "Correct file name in change event provided by oEvent.getParameter('mParameters')['newValue']");
				// new
				assert.equal(oEvent.getParameter("files")[0].name, sFileName, "Correct file name in fileSizeExceed event provided by oEvent.getParameter('files')[0].name");
				assert.equal(oEvent.getParameters()["files"][0]["name"], sFileName, "Correct file name in fileSizeExceed event provided by oEvent.getParameters()['files'][0]['name']");
			} else {
				// deprecated
				assert.equal(oEvent.getParameters().getParameter("documentId"), sDocumentId, "Correct documentId in fileSizeExceed event provided by oEvent.getParameters().getParameter('documentId')");
				assert.equal(oEvent.getParameters().getParameters()["documentId"], sDocumentId, "Correct documentId in fileSizeExceed event provided by oEvent.getParameters().getParameters()['documentId']");
				assert.equal(oEvent.getParameter("mParameters")["documentId"], sDocumentId, "Correct documentId in fileSizeExceed event provided by oEvent.getParameter('mParameters')['documentId']");
				assert.equal(oEvent.getParameters().getParameter("fileSize"), sFileSize, "Correct fileSize in fileSizeExceed event provided by oEvent.getParameters().getParameter('fileSize')");
				assert.equal(oEvent.getParameters().getParameters()["fileSize"], sFileSize, "Correct fileSize in fileSizeExceed event provided by oEvent.getParameters().getParameters()['fileSize']");
				assert.equal(oEvent.getParameter("mParameters")["fileSize"], sFileSize, "Correct fileSize in fileSizeExceed event provided by oEvent.getParameter('mParameters')['fileSize']");
				// new
				assert.equal(oEvent.getParameter("files")[0].name, sFileName, "Correct file name in fileSizeExceed event provided by oEvent.getParameter('files')[0].name");
				assert.equal(oEvent.getParameters()["files"][0]["name"], sFileName, "Correct file name in fileSizeExceed event provided by oEvent.getParameters()['files'][0]['name']");
				assert.deepEqual(oEvent.getParameter("files")[0], oBigFile, "Correct file in fileSizeExceed event provided by oEvent.getParameter('files')[0]");
				assert.equal(oEvent.getParameter("files")[0].fileSize, sFileSize, "Correct file size in fileSizeExceed event provided by oEvent.getParameter('files')[0].fileSize");
				assert.equal(oEvent.getParameters()["files"][0]["fileSize"], sFileSize, "Correct file size in fileSizeExceed event provided by oEvent.getParameters()['files'][0]['fileSize']");
				assert.deepEqual(oEvent.getParameter("files")[0], oBigFile, "Correct file in fileSizeExceed event provided by oEvent.getParameter('files')[0]");
			}
		}

		this.oUploadCollection.attachFileSizeExceed(fileSizeExceed);
		this.oUploadCollection._onFileSizeExceed(new Event("fileSizeExceed", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));
	});

	QUnit.test("Event change", function (assert) {
		var oFile1 = {
			name: "file1",
			size: 1,
			type: "type1"
		};
		var oFile2 = {
			name: "file2",
			size: 2,
			type: "type2"
		};
		var aFiles = [oFile1, oFile2];

		function onChange(oEvent) {
			if (Device.browser.msie && Device.browser.version <= 9) {
				// deprecated
				assert.equal(oEvent.getParameters().getParameter("files")[0].name, "file1", "Correct file name in change event provided by oEvent.getParameters().getParameter('files').name");
				assert.equal(oEvent.getParameters().getParameters()["files"][0]["name"], "file1", "Correct file name in change event provided by oEvent.getParameters().getParameters()['files']['name']");
				assert.equal(oEvent.getParameter("mParameters")["files"][0]["name"], "file1", "Correct file 1 in change event provided by oEvent.getParameter('mParameters')['files'][0]['name']");

				// check for properly provided parameters
				assert.equal(oEvent.getParameter("files")[0].name, "file1", "Correct file name 1 in change event provided byoEvent.getParameter('files')[0].name");
				assert.equal(oEvent.getParameters()["files"][0]["name"], "file1", "Correct file name in change event provided by oEvent.getParameters()['files'][0]['name']");
			} else {
				// deprecated
				assert.deepEqual(oEvent.getParameters().getParameter("files")[0], oFile1, "Correct file 1 in change event provided by oEvent.getParameters().getParameter('files')");
				assert.deepEqual(oEvent.getParameters().getParameter("files")[1], oFile2, "Correct file 2 in change event provided by oEvent.getParameters().getParameter('files').");

				assert.deepEqual(oEvent.getParameters().getParameters()["files"][0], oFile1, "Correct file 1 in change event provided by oEvent.getParameters().getParameters()['files']");
				assert.deepEqual(oEvent.getParameters().getParameters()["files"][1], oFile2, "Correct file 2 in change event provided by oEvent.getParameters().getParameters()['files']");

				assert.deepEqual(oEvent.getParameter("mParameters").files[0], oFile1, "Correct file 1 in change event provided by oEvent.getParameter('mParameters').files[0]");
				assert.deepEqual(oEvent.getParameter("mParameters").files[1], oFile2, "Correct file 2 in change event provided by oEvent.getParameter('mParameters').files[1]");

				// checks for properly provided parameters
				assert.deepEqual(oEvent.getParameter("files")[0], oFile1, "Correct file 1 in change event provided by oEvent.getParameter('files')");
				assert.deepEqual(oEvent.getParameter("files")[1], oFile2, "Correct file 2 in change event provided by oEvent.getParameter('files')");
				assert.deepEqual(oEvent.getParameters()["files"][0], oFile1, "Correct file 1 in change event provided by oEvent.getParameters()['files']");
				assert.deepEqual(oEvent.getParameters()["files"][1], oFile2, "Correct file 2 in change event provided by oEvent.getParameters()['files']");
			}
		}

		this.oUploadCollection.attachChange(onChange);
		if (Device.browser.msie && Device.browser.version <= 9) {
			// at present FileUploader does not set the parameter files for IE9
			assert.expect(5);
			this.oUploadCollection._getFileUploader().fireChange({
				newValue: "file1"
			});
		} else {
			assert.expect(10); // verifies the event handler was executed
			this.oUploadCollection._getFileUploader().fireChange({
				files: aFiles
			});
		}
	});

	QUnit.test("Event fileDeleted", function (assert) {
		var oFileDelete = this.oUploadCollection.getItems()[1];
		this.oUploadCollection.attachFileDeleted(onDelete);
		this.oUploadCollection._oItemForDelete = {
			documentId: oFileDelete.getDocumentId(),
			_iLineNumber: 1
		};
		this.oUploadCollection._onCloseMessageBoxDeleteItem(MessageBox.Action.OK);

		// Assert
		function onDelete(oEvent) {
			// deprecated
			assert.equal(oEvent.getParameter("documentId"), "5082cc4d-da9f-2835-2c0a-8100ed47bcde", "Correct documentId in event delete");
			// new
			assert.equal(oEvent.getParameter("item"), oFileDelete, "Correct item in event delete");
		}

		assert.notOk(this.oUploadCollection._oItemForDelete, "oItemForDelete is null");
		assert.expect(3);
	});

	QUnit.test("Event filenameLengthExceed", function (assert) {
		assert.expect(8);

		function onFilenameLengthExceed(oEvent) {
			var oFile = {name: "tooLongFileName"};
			assert.ok(true, "Event filenameLengthExceed fired");
			assert.equal(oEvent.getId(), "filenameLengthExceed", "Event Id 'filenameLengthExceed' provided");
			// deprecated
			assert.equal(oEvent.getParameters().getParameter("fileName"), "tooLongFileName", "Correct file name in filenameLengthExceed event provided by oEvent.getParameters().getParameter('fileName')");
			assert.equal(oEvent.getParameters().getParameters()["fileName"], "tooLongFileName", "Correct file name in filenameLengthExceed event provided by oEvent.getParameters().getParameters()['fileName']");
			assert.equal(oEvent.getParameter("mParameters")["fileName"], "tooLongFileName", "Correct file name in filenameLengthExceed event provided by oEvent.getParameter('mParameters')['fileName']");
			// new
			assert.equal(oEvent.getParameter("files")[0].name, "tooLongFileName", "Correct file name in filenameLengthExceed event provided by oEvent.getParameter('files')[0].name");
			assert.equal(oEvent.getParameters()["files"][0]["name"], "tooLongFileName", "Correct file name in filenameLengthExceed event provided by oEvent.getParameters()['files'][0]['name']");
			assert.deepEqual(oEvent.getParameter("files")[0], oFile, "Correct file in filenameLengthExceed event provided by oEvent.getParameter('files')[0]");
		}

		this.oUploadCollection.attachFilenameLengthExceed(onFilenameLengthExceed);
		this.oUploadCollection._getFileUploader().fireFilenameLengthExceed({
			fileName: "tooLongFileName"
		});
	});

	QUnit.test("Event fileRenamed", function (assert) {
		assert.expect(7);

		function onFileRenamed(oEvent) {
			assert.equal(oEvent.getId(), "fileRenamed", "Event Id 'fileRenamed' provided");
			// deprecated
			assert.equal(oEvent.getParameter("fileName"), "renamedFileName.txt", "Correct file name in fileRenamed event provided by oEvent.getParameters().getParameter('fileName')");
			assert.equal(oEvent.getParameters()["fileName"], "renamedFileName.txt", "Correct file name in fileRenamed event provided by oEvent.getParameters().getParameters()['fileName']");
			assert.equal(oEvent.getParameter("documentId"), "5082cc4d-da9f-2835-2c0a-8100ed47bcdf", "Correct documentId in event fileRenamed provided by oEvent.getParameter('documentId')");
			assert.equal(oEvent.getParameters()["documentId"], "5082cc4d-da9f-2835-2c0a-8100ed47bcdf", "Correct documentId in event fileRenamed provided by oEvent.getParameters().getParameters()['documentId']");
			// new
			assert.equal(oEvent.getParameter("item"), this._oItemForRename, "Correct item in event fileRenamed");
			assert.equal(oEvent.getParameter("item").getFileName(), this._oItemForRename.getFileName(), "Correct item in event fileRenamed");
		}

		this.oUploadCollection.attachFileRenamed(onFileRenamed);
		this.oUploadCollection._oItemForRename = this.oUploadCollection.getItems()[2]; // contributor : "J Edgar Hoover", documentId : "5082cc4d-da9f-2835-2c0a-8100ed47bcdf"
		this.oUploadCollection._oItemForRename.setFileName("renamedFileName.txt");
		this.oUploadCollection._onEditItemOk("renamedFileName.txt");
	});

	QUnit.test("uploadComplete", function (assert) {
		var oFileUploaderEventMock = {
			fileName: "file1",
			response: {"propertyOne": "ValueOne"},
			readyStateXHR: 4,
			status: 200,
			responseRaw: "{ \"propertyOne\" : \"ValueOne\" }",
			headers: {
				"headerOne": "headerValueOne",
				"headerTwo": "headerValueTwo"
			}
		};

		function uploadComplete(oEvent) {
			// Deprecated
			assert.equal(oEvent.getParameters().getParameter("fileName"), "file1", "Correct file1 name in complete event");
			assert.equal(oEvent.getParameters().getParameter("response"), oFileUploaderEventMock.response, "Correct response in complete event");
			assert.equal(oEvent.getParameters().getParameter("readyStateXHR"), oFileUploaderEventMock.readyStateXHR, "Correct readyStateXHR in complete event");
			assert.equal(oEvent.getParameters().getParameter("status"), oFileUploaderEventMock.status, "Correct status in complete event");
			// check for properly provided parameters
			assert.equal(oEvent.getParameter("files")[0].fileName, "file1", "Correct file1 name in complete event");
			assert.equal(oEvent.getParameter("files")[0].response, oFileUploaderEventMock.response, "Correct response in complete event");
			assert.equal(oEvent.getParameter("files")[0].reponse, oFileUploaderEventMock.response, "Correct reponse in complete event - deprecated event property");
			assert.equal(oEvent.getParameter("files")[0].status, oFileUploaderEventMock.status, "Correct status in complete event");
			assert.equal(oEvent.getParameter("files")[0].responseRaw, oFileUploaderEventMock.responseRaw, "Correct raw response in complete event");
			assert.equal(oEvent.getParameter("files")[0].headers, oFileUploaderEventMock.headers, "Correct headers in complete event");
		}

		this.oUploadCollection.attachUploadComplete(uploadComplete);
		this.oUploadCollection._onUploadComplete(new Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));
	});

	QUnit.test("Event terminate", function (assert) {
		var sFileName = "file1";
		var aRequestHeaders = [
			{
				name: "someRequestHeaderName",
				value: "someRequestHeaderValue"
			}
		];
		var oUploadCollectionParamter = new UploadCollectionParameter({
			name: "someRequestHeaderName",
			value: "someRequestHeaderValue"
		});

		function onUploadTerminated(oEvent) {
			assert.equal(oEvent.getParameter("fileName"), sFileName, "FileName parameter is provided correctly by the uploadTerminated event");
			assert.ok(oEvent.getParameter("getHeaderParameter"), "Proper method 'getHeaderParameter' in parameters of uploadTerminated event");
			assert.equal(oEvent.getParameters().getHeaderParameter("someRequestHeaderName").getValue(), "someRequestHeaderValue", "Value of the request header parameter retrieved correctly, header parameter name specified");
			assert.equal(oEvent.getParameters().getHeaderParameter()[0].getName(), oUploadCollectionParamter.getName(), "Name of the request header parameter retrieved correctly, , header parameter name not specified");
			assert.equal(oEvent.getParameters().getHeaderParameter()[0].getValue(), oUploadCollectionParamter.getValue(), "Name of the request header parameter retrieved correctly, , header parameter name not specified");
		}

		this.oUploadCollection.attachUploadTerminated(onUploadTerminated);
		this.oUploadCollection._getFileUploader().fireUploadAborted({
			fileName: sFileName,
			requestHeaders: aRequestHeaders
		});
	});

	QUnit.test("Event beforeUploadStarts", function (assert) {
		var sFileName = "someFileName", sRequestId = "1", aRequestHeaders = [
			{
				name: this.oUploadCollection._headerParamConst.requestIdName,
				value: sRequestId
			}
		];
		var sSlugName = "slug", sSlugValueBefore = jQuery.now(), sSlugValueAfter,
			sSecurityTokenName = "securuityToken", sSecurityTokenValueBefore = jQuery.now(),
			sSecurityTokenValueAfter;

		function onBeforeUploadStarts(oEvent) {
			var oHeaderParameter1 = new UploadCollectionParameter({
				name: sSlugName,
				value: sSlugValueBefore
			});
			oEvent.getParameters().addHeaderParameter(oHeaderParameter1);
			var oHeaderParameter2 = new UploadCollectionParameter({
				name: sSecurityTokenName,
				value: sSecurityTokenValueBefore
			});
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
			fileName: sFileName,
			requestHeaders: aRequestHeaders
		});
		var iParamCounter = aRequestHeaders.length;
		for (var i = 0; i < iParamCounter; i++) {
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

	QUnit.module("Edit tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				maximumFilenameLength: 35,
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Edit", function (assert) {
		//trigger edit button of line 2 and check the status of the line
		var sEditButtonId = this.oUploadCollection.aItems[1].sId + "-editButton";
		sap.ui.getCore().byId(sEditButtonId).firePress();
		sap.ui.getCore().applyChanges();
		assert.equal(this.oUploadCollection.aItems[1]._status, "Edit", "Item 2 has status 'Edit'");
		assert.equal(this.oUploadCollection.aItems[1].sId, this.oUploadCollection.editModeItem, "EditModeItem is set correct");

		var oInputField1 = jQuery.sap.byId(this.oUploadCollection.aItems[1].sId + "-ta_editFileName-inner");
		oInputField1[0].value = "NewDocument_toCancel";
		sap.ui.getCore().applyChanges();

		//check cancel
		var oEvent = {};
		oEvent.oSource = {};
		oEvent.oSource.getId = function () {
			return this.sId;
		};
		oEvent.target = this.oUploadCollection.$().find(".sapMUCItem").eq(1).find(".sapMUCCancelBtn")[0];

		oData.items[1].fileName = "NewDocument_toCancel";
		this.oUploadCollection._handleClick(oEvent, this.oUploadCollection.aItems[1].sId);
		sap.ui.getCore().applyChanges();
		assert.equal(this.oUploadCollection.aItems[1]._status, "display", "Item 2 has status 'display' after 'cancel'");

		//check file name after cancel
		var sFileNameField = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-ta_filenameHL").getProperty("text");
		assert.equal("Notes.txt", sFileNameField, "Filename is correct after 'cancel'");

		//check save
		sap.ui.getCore().byId(sEditButtonId).firePress();
		sap.ui.getCore().applyChanges();
		var oInputField2 = jQuery.sap.byId(this.oUploadCollection.aItems[1].sId + "-ta_editFileName-inner");
		oInputField2[0].value = "NewDocument";
		sap.ui.getCore().applyChanges();
		oData.items[1].fileName = "NewDocument.txt";
		oEvent.target.id = this.oUploadCollection.aItems[1].sId + "-cli";
		oEvent.oSource.sId = this.oUploadCollection.aItems[1].sId;
		this.oUploadCollection._handleClick(oEvent, this.oUploadCollection.aItems[1].sId);
		sap.ui.getCore().applyChanges();
		assert.equal(this.oUploadCollection.aItems[1]._status, "display", "Item 2 has status 'display' after 'ok'");

		//check changed file name after save
		var sFileNameField = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-ta_filenameHL").getProperty("text");
		assert.equal("NewDocument.txt", sFileNameField, "Changed filename (NewDocument) is correct saved");

		//check sameFileNameAllowed == false!
		var sEditButtonId2 = this.oUploadCollection.aItems[2].sId + "-editButton";
		sap.ui.getCore().byId(sEditButtonId2).firePress();
		sap.ui.getCore().applyChanges();
		assert.equal(this.oUploadCollection.aItems[2]._status, "Edit", "Item 2 has status 'Edit'");
		assert.equal(this.oUploadCollection.aItems[2].sId, this.oUploadCollection.editModeItem, "EditModeItem is set correct");

		var oInputField3 = jQuery.sap.byId(this.oUploadCollection.aItems[2].sId + "-ta_editFileName-inner");
		oInputField3[0].value = "NewDocument";
		oData.items[2].fileName = "NewDocument.txt";
		oEvent.target.id = this.oUploadCollection.aItems[2].sId;
		this.oUploadCollection._handleClick(oEvent, this.oUploadCollection.aItems[2].sId);
		sap.ui.getCore().applyChanges();
		var bShowValueStateMessage = sap.ui.getCore().byId(this.oUploadCollection.aItems[2].sId + "-ta_editFileName").getShowValueStateMessage();
		assert.equal(bShowValueStateMessage, true, "Error message has to be shown, because the file name still exists");
		assert.equal(this.oUploadCollection.sErrorState, "Error", "Error state is set");

		// edit and delete buttons in case duplicated file name entered
		var oEditButton0 = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-editButton");
		var oEditButton1 = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-editButton");
		var oDeleteButton0 = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-deleteButton");
		var oDeleteButton1 = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-deleteButton");
		assert.equal(oEditButton0.getEnabled(), false, "Edit button of item 1 is NOT enabled");
		assert.equal(oEditButton1.getEnabled(), false, "Edit button of item 2 is NOT enabled");
		assert.equal(oDeleteButton0.getEnabled(), false, "Delete button of item 1 is NOT enabled");
		assert.equal(oDeleteButton1.getEnabled(), false, "Delete button of item 2 is NOT enabled");

		oEvent.target.id = this.oUploadCollection.aItems[2].sId + "-cancelButton";
		this.oUploadCollection._handleClick(oEvent, this.oUploadCollection.aItems[2].sId);
		sap.ui.getCore().applyChanges();
		assert.equal(this.oUploadCollection.aItems[2]._status, "display", "Item 3 has status 'display' after 'cancel'");

		// edit and delete buttons
		oEditButton0 = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-editButton");
		oEditButton1 = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-editButton");
		oDeleteButton0 = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-deleteButton");
		oDeleteButton1 = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-deleteButton");
		assert.equal(oEditButton0.getEnabled(), true, "Edit button of item 1 is enabled");
		assert.equal(oEditButton1.getEnabled(), true, "Edit button of item 2 is enabled");
		assert.equal(oDeleteButton0.getEnabled(), true, "Delete button of item 1 is enabled");
		assert.equal(oDeleteButton1.getEnabled(), true, "Delete button of item 2 is enabled");

		var oEditButton2 = sap.ui.getCore().byId(this.oUploadCollection.aItems[2].sId + "-editButton");
		var oEditButton3 = sap.ui.getCore().byId(this.oUploadCollection.aItems[3].sId + "-editButton");
		var oDeleteButton2 = sap.ui.getCore().byId(this.oUploadCollection.aItems[2].sId + "-deleteButton");
		var oDeleteButton3 = sap.ui.getCore().byId(this.oUploadCollection.aItems[3].sId + "-deleteButton");
		assert.equal(oEditButton2.getEnabled(), false, "Edit button of item 3 is NOT enabled");
		assert.equal(oEditButton3.getEnabled(), false, "Edit button of item 4 is NOT enabled");
		assert.equal(oDeleteButton2.getEnabled(), false, "Delete button of item 3 is NOT enabled");
		assert.equal(oDeleteButton3.getEnabled(), false, "Delete button of item 4 is NOT enabled");

	});

	QUnit.test("Cancel with different event target", function (assert) {
		// Arrange
		var sEditButtonId = this.oUploadCollection.aItems[1].sId + "-editButton";
		sap.ui.getCore().byId(sEditButtonId).firePress();
		sap.ui.getCore().applyChanges();

		var oSpy = sinon.spy(UploadCollection.prototype, "_handleCancel");
		var oEvent = {
			target: this.oUploadCollection.$().find(".sapMUCItem").eq(1).find(".sapMUCCancelBtn .sapMBtnContent")[0]
		};

		// Act
		this.oUploadCollection._handleClick(oEvent, this.oUploadCollection.aItems[1].sId);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oSpy.callCount, 1, "Cancel handling is done even for targets that are not the button itself.");

		// Cleanup
		oSpy.restore();
	});

	QUnit.test("Cancelling the edit mode of an item while another item is being uploaded", function (assert) {
		//Arrange
		var oItem = new UploadCollectionItem({
			fileName: "File.jpg"
		});

		oItem._status = UploadCollection._uploadingStatus;
		this.oUploadCollection.aItems.unshift(oItem);

		var sEditButtonId = this.oUploadCollection.aItems[1].sId + "-editButton";

		this.oUploadCollection.invalidate();
		sap.ui.getCore().byId(sEditButtonId).firePress();
		sap.ui.getCore().applyChanges();

		//Act
		this.oUploadCollection._handleCancel(null, this.oUploadCollection.editModeItem);
		//Assert
		assert.equal(this.oUploadCollection.aItems[1]._status, UploadCollection._displayStatus, "Cancelling the edit mode has been successfully executed");

		oItem.destroy();
	});

	QUnit.module("Tests starting with following scenario: open edit mode of list item, enter empty name, click ok", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				maximumFilenameLength: 35,
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var sEditButtonId = this.oUploadCollection.aItems[1].sId + "-editButton";
			sap.ui.getCore().byId(sEditButtonId).firePress();
			sap.ui.getCore().applyChanges();

			this.oUploadCollection.aItems[1].setFileName("");
			sap.ui.getCore().applyChanges();

			this.oObj = {
				oSource: {
					sId: this.oUploadCollection.aItems[1].sId,
					getId: function () {
						return this.sId;
					}
				},
				target: {
					id: this.oUploadCollection.aItems[1].sId + "-okButton"
				}
			};
			this.oUploadCollection._handleClick(this.oObj, this.oUploadCollection.aItems[1].sId);
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Delete the file name in edit", function (assert) {
		sap.ui.getCore().applyChanges();
		var bShowValueStateMessage = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-ta_editFileName").getShowValueStateMessage();
		var sValueState = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-ta_editFileName").getValueState();

		assert.equal(bShowValueStateMessage, true, "Error message has to be shown, because no file name entered");
		assert.equal(sValueState, "Error", "Error value state set");
		assert.equal(this.oUploadCollection.sErrorState, "Error", "Error state is set on UploadCOllection control");
	});

	QUnit.test("Exiting edit mode after an attemt to save an empty file in case same file names are allowed", function (assert) {
		//Arrange
		this.oUploadCollection.setSameFilenameAllowed(true);
		jQuery.sap.byId(this.oUploadCollection.aItems[1].sId + "-ta_editFileName-inner")[0].value = "Nonempty name";
		//Act
		this.oUploadCollection._handleClick(this.oObj, this.oUploadCollection.aItems[1].sId);
		//Assert
		assert.equal(this.oUploadCollection.sErrorState, null, "Error state has been removed");
		assert.equal(this.oUploadCollection.editModeItem, null, "Edit mode successfully exited");
		assert.equal(this.oUploadCollection.aItems[1].errorState, null, "Error value state has been removed from the item as well");

	});

	QUnit.module("Display tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Display", function (assert) {
		//check status = "display"
		var iLength = this.oUploadCollection.aItems.length;
		for (var i = 0; i < iLength; i++) {
			assert.equal(this.oUploadCollection.aItems[i]._status, "display", "Status of item " + i + " is correct");
		}

		var oFileName = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-ta_filenameHL");
		var oEditButton = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-editButton");
		var oDeleteButton = sap.ui.getCore().byId(this.oUploadCollection.aItems[1].sId + "-deleteButton");
		assert.equal(oEditButton.getEnabled(), true, "Edit button is enabled");
		assert.equal(oDeleteButton.getEnabled(), true, "Delete button is enabled");
		assert.equal(oFileName.getEnabled(), true, "File name is enabled");
	});

	QUnit.test("Link is triggered by icon press", function (assert) {
		//Arrange
		var oStub = sinon.stub(UploadCollection.prototype, "_triggerLink");

		//Act
		// An event is triggered, because there is a url provided at item[1]
		sap.ui.getCore().byId(this.oUploadCollection.getItems()[1].getId() + "-ia_iconHL").firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(UploadCollection.prototype._triggerLink.callCount, 1, "Function _triggerLink has been called once");

		//Cleanup
		oStub.restore();
	});

	QUnit.test("Link is not triggered by icon press", function (assert) {
		//Arrange
		var oStub = sinon.stub(UploadCollection.prototype, "_triggerLink");

		//Act
		// No event is triggered, because there is no url provided at item[0]
		sap.ui.getCore().byId(this.oUploadCollection.getItems()[0].getId() + "-ia_iconHL").firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(UploadCollection.prototype._triggerLink.callCount, 0, "Function _triggerLink has not been called");

		//Cleanup
		oStub.restore();
	});

	QUnit.module("Grouping tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false,
					sorter: new Sorter("contributor", false, function (oContext) {
						return {
							key: oContext.getProperty("contributor"),
							upperCase: false
						};
					})
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Rendering", function (assert) {
		//Arrange
		sinon.spy(this.oUploadCollection._oList, "addItemGroup");
		var aList = this.oUploadCollection._oList,
			aItems = aList.getItems();

		//Act
		this.oUploadCollection.rerender();

		//Assert
		assert.equal(this.oUploadCollection._oList.addItemGroup.callCount, 4, "Four groups were added");
		assert.equal(aItems.length, 8, "Each item is part of a separate group (we have inside 4 group items, each with 1 collection item)");
		jQuery.each(aItems, function (iIndex, oItem) {
			if (oItem._bGroupHeader) {
				assert.ok(oItem.getTitle().length > 0, "The group item has title property");
			}
		});
	});

	QUnit.module("Properties", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection();
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	function testSetter(oUploadCollection, sProperty, oPropertyValue, bPropagate, assert) {
		if (!bPropagate) {
			// set default value
			bPropagate = false;
		}
		var sPropertyFileUploader;
		var sSetterMethod = "set" + sProperty[0].toUpperCase() + sProperty.slice(1);
		var sGetterMethod = "get" + sProperty[0].toUpperCase() + sProperty.slice(1);
		var sGetterMethodFileUploader = "get" + sProperty[0].toUpperCase() + sProperty.slice(1);

		// map UploadCollection properties names to FileUploader properties names, e.g. "uploadenabled" on UC side ~ "enabled" on FU side
		switch (sProperty) {
			case "uploadEnabled":
				sPropertyFileUploader = "enabled";
				break;
			default:
				sPropertyFileUploader = sProperty;
		}
		var sGetterMethodFileUploader = "get" + sPropertyFileUploader[0].toUpperCase() + sPropertyFileUploader.slice(1);

		oUploadCollection[sSetterMethod](oPropertyValue);
		assert.deepEqual(oUploadCollection[sGetterMethod](), oPropertyValue, "UploadCollection setter method");
		if (bPropagate) {
			switch (sProperty) {
				case "noDataText":
					break;
				default:
					assert.deepEqual(oUploadCollection._oFileUploader[sGetterMethodFileUploader](), oPropertyValue, "Propagation to FileUploader");
			}
		}
	}

	QUnit.test("Default values", function (assert) {
		var sFileType,
			sMaximumFilenameLength = 0,
			nMaximumFileSize = 0,
			sMimeType,
			bMultiple = false,
			sNoDataText = "",
			bSameFilenameAllowed = false,
			bShowSeparators = ListSeparators.All,
			bUploadEnabled = true,
			sUploadUrl = "../../../upload";

		assert.strictEqual(this.oUploadCollection.getProperty("fileType"), sFileType, "Property 'fileType': default value is '" + sFileType + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("maximumFilenameLength"), sMaximumFilenameLength, "Property 'maximumFilenameLength': default value is '" + sMaximumFilenameLength + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("maximumFileSize"), nMaximumFileSize, "Property 'maximumFileSize': default value is '" + nMaximumFileSize + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("mimeType"), sMimeType, "Property 'mimeType': default value is '" + sMimeType + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("multiple"), bMultiple, "Property 'multiple': default value is '" + bMultiple + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("noDataText"), sNoDataText, "Property 'noDataText': default value is '" + sNoDataText + "'");
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-text").text(), this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_NO_DATA_TEXT"), "Property 'noDataText' properly rendered in DOM");
		assert.strictEqual(this.oUploadCollection.getProperty("sameFilenameAllowed"), bSameFilenameAllowed, "Property 'sameFilenameAllowed': default value is '" + bSameFilenameAllowed + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("showSeparators"), bShowSeparators, "Property 'showSeparators': default value is '" + bShowSeparators + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("uploadEnabled"), bUploadEnabled, "Property 'uploadEnabled': default value is '" + bUploadEnabled + "'");
		assert.strictEqual(this.oUploadCollection.getProperty("uploadUrl"), sUploadUrl, "Property 'uploadUrl': default value is '" + sUploadUrl + "'");
	});

	QUnit.test("fileType", function (assert) {
		var aFileTypes = ["jpg", "png", "bmp", "unittest"];
		testSetter(this.oUploadCollection, "fileType", aFileTypes, true, assert);
	});

	QUnit.test("fileType conversion", function (assert) {
		var aFileTypes = ["jpg", "png", "bmp", "unittest"];
		var aFileTypesExpected = aFileTypes.toString();
		var aFileTypesMix = ["JpG", "png", "bMp", "uniTTest"];
		this.oUploadCollection.setFileType(aFileTypesMix);
		var aFileTypes = this.oUploadCollection.getFileType().toString();
		assert.equal(aFileTypes, aFileTypesExpected, "Property 'fileType': Conversion to lower case");
	});

	QUnit.test("fileType empty", function (assert) {
		//undefined
		var aFileTypesEmpty;
		this.oUploadCollection.setFileType(aFileTypesEmpty);
		var FileTypesEmpty = this.oUploadCollection.getFileType();
		var FileTypesExpected;
		assert.equal(FileTypesEmpty, FileTypesExpected, "Property 'fileType': Call with undefined!");

		//empty array
		aFileTypesEmpty = [];
		this.oUploadCollection.setFileType(aFileTypesEmpty);
		var sFileTypesExpected = "";
		var sFileTypesEmpty = this.oUploadCollection.getFileType().toString();
		assert.equal(sFileTypesEmpty, sFileTypesExpected, "Property 'fileType': Call with an empty array!");
	});

	QUnit.test("maximumFilenameLength", function (assert) {
		var iMaximumFilenameLength = 4711;
		testSetter(this.oUploadCollection, "maximumFilenameLength", iMaximumFilenameLength, true, assert);
	});

	QUnit.test("maximumFileSize", function (assert) {
		var iMaximumFileSize = 4711;
		testSetter(this.oUploadCollection, "maximumFileSize", iMaximumFileSize, true, assert);
	});

	QUnit.test("mimeType", function (assert) {
		var aMimeTypes = ["text", "image", "unittest"];
		testSetter(this.oUploadCollection, "mimeType", aMimeTypes, true, assert);
	});

	QUnit.test("multiple", function (assert) {
		var bMultiple = true;
		testSetter(this.oUploadCollection, "multiple", bMultiple, true, assert);
	});

	QUnit.test("noDataText", function (assert) {
		var sNoDataText = "myNoDataText";
		testSetter(this.oUploadCollection, "noDataText", sNoDataText, true, assert);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId(this.oUploadCollection.getId() + "-no-data-text").text(), sNoDataText, "Property 'noDataText' properly rendered in DOM");
	});

	QUnit.test("sameFilenameAllowed", function (assert) {
		var bSameFilenameAllowed = true;
		var oFileUploader = this.oUploadCollection._getFileUploader();
		testSetter(this.oUploadCollection, "sameFilenameAllowed", bSameFilenameAllowed, false, assert);
		assert.equal(oFileUploader.getSameFilenameAllowed(), true, "Property 'sameFilenameAllowed' is correctly true ");
		bSameFilenameAllowed = false;
		testSetter(this.oUploadCollection, "sameFilenameAllowed", bSameFilenameAllowed, false, assert);
		assert.equal(oFileUploader.getSameFilenameAllowed(), true, "Property 'sameFilenameAllowed' should stay 'true' ");
	});

	QUnit.test("showSeparators", function (assert) {
		var bShowSeparators = "All";
		testSetter(this.oUploadCollection, "showSeparators", bShowSeparators, false, assert);
	});

	QUnit.test("uploadEnabled", function (assert) {
		var bUploadEnabled = false;
		testSetter(this.oUploadCollection, "uploadEnabled", bUploadEnabled, true, assert);
	});

	QUnit.test("uploadUrl", function (assert) {
		var sUploadUrl = "my/upload/url";
		testSetter(this.oUploadCollection, "uploadUrl", sUploadUrl, true, assert);
	});

	QUnit.module("Binding", {
		beforeEach: function () {
			var oData = {
				"items": [
					{
						"contributor": "Susan Baker",
						"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
						"fileName": "Screenshot.ico",
						"fileSize": 20,
						"thumbnailUrl": "",
						"uploadedDate": "2014-07-30",
						"url": ""
					}
				]
			};
			this.oModel = new JSONModel(oData);
			this.oUploadCollection = new UploadCollection({
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(this.oModel);
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
			this.oModel.destroy();
			this.oModel = null;
		}
	});

	QUnit.test("Model refresh with empty data", function (assert) {
		this.oModel.setProperty("/items", null);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oUploadCollection.getItems().length, 0);
		assert.strictEqual(this.oUploadCollection.aItems.length, 0);
		assert.strictEqual(this.oUploadCollection._oList.getItems().length, 0);
	});

	QUnit.test("Model refresh with more data", function (assert) {
		this.oModel.setProperty("/items", [
			{
				"contributor": "Susan Baker",
				"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				"fileName": "Screenshot.ico",
				"fileSize": 20,
				"thumbnailUrl": "",
				"uploadedDate": "2014-07-30",
				"url": ""
			}, {
				"contributor": "Susan Baker",
				"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				"fileName": "Screenshot.ico",
				"fileSize": 20,
				"thumbnailUrl": "",
				"uploadedDate": "2014-07-30",
				"url": ""
			}
		]);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oUploadCollection.getItems().length, 2);
		assert.strictEqual(this.oUploadCollection.aItems.length, 2);
		assert.strictEqual(this.oUploadCollection._oList.getItems().length, 2);
	});

	QUnit.test("Model refresh like ODataModel - check number of list preparation", function (assert) {
		sinon.spy(this.oUploadCollection, "_fillList");
		this.oModel.setProperty("/items", null);
		this.oModel.setProperty("/items", [
			{
				"contributor": "Susan Baker",
				"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				"fileName": "Screenshot.ico",
				"fileSize": 20,
				"thumbnailUrl": "",
				"uploadedDate": "2014-07-30",
				"url": ""
			}
		]);
		sap.ui.getCore().applyChanges();
		assert.ok(this.oUploadCollection._fillList.calledOnce);
		this.oUploadCollection._fillList.restore();
	});

	QUnit.module("Accessibility features", {
		beforeEach: function () {
			this.fnSpy = sinon.spy(Element.prototype, "setTooltip");
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.fnSpy.restore();
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Method setTooltip", function (assert) {
		//Assert
		assert.ok(this.fnSpy.called, "Method setTooltip called");
		assert.ok(this.fnSpy.calledWith("Susan Baker"), "Method setTooltip called with the correct text");
	});

	QUnit.test("Icon", function (assert) {
		var oIcon = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-ia_iconHL");
		var $Icon = jQuery.sap.domById(this.oUploadCollection.aItems[0].sId + "-ia_iconHL");
		assert.strictEqual(oIcon.getAlt(), "textForIconOfItemSusanBaker", "The icon has correct alt text");
		assert.strictEqual($Icon.getAttribute("aria-label"), "textForIconOfItemSusanBaker", "The DOM object icon has correct tooltip");
	});

	QUnit.test("Image", function (assert) {
		var oImage = sap.ui.getCore().byId(this.oUploadCollection.aItems[3].sId + "-ia_imageHL");
		var $Image = jQuery.sap.domById(this.oUploadCollection.aItems[3].sId + "-ia_imageHL");
		assert.strictEqual(oImage.getAlt(), "textForImageOfItemKateBrown", "The image has correct alt text");
		assert.strictEqual($Image.getAttribute("aria-label"), "textForImageOfItemKateBrown", "The DOM object image has correct tooltip");
	});

	QUnit.test("Edit Button", function (assert) {
		var oEditButton = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-editButton");
		assert.strictEqual(oEditButton.getTooltip(), this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_EDITBUTTON_TEXT"), "The edit button has correct tooltip");
	});

	QUnit.test("Delete Button", function (assert) {
		var oDeleteButton = sap.ui.getCore().byId(this.oUploadCollection.aItems[0].sId + "-deleteButton");
		assert.strictEqual(oDeleteButton.getTooltip(), this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_DELETEBUTTON_TEXT"), "The delete button has correct tooltip");
	});

	QUnit.test("F2 button pressed for the item in display mode", function (assert) {
		//Arrange
		var oListItem = this.oUploadCollection._oList.getItems()[0],
			sUCItemId = this.oUploadCollection.getItems()[0].getId(),
			oPressEvent = {
				target: {
					id: oListItem.getId()
				}
			},
			oEditButton = sap.ui.getCore().byId(sUCItemId + "-editButton"),
			oFirePressStub = sinon.stub(oEditButton, "firePress"),
			oHandleClickStub = sinon.stub(this.oUploadCollection, "_handleClick");
		this.oUploadCollection.editModeItem = this.oUploadCollection.getItems()[1].getId();
		//Act
		this.oUploadCollection._handleF2(oPressEvent);
		//Assert
		assert.deepEqual(oHandleClickStub.getCall(0).args[0], oPressEvent, "Press event has been forwarded to _handkeClick that has been called for other item that is already in the edit mode ");
		assert.deepEqual(oHandleClickStub.getCall(0).args[1], this.oUploadCollection.editModeItem, "The function _handleClick gets the id of the item previously residing in the edit mode");
		assert.strictEqual(oFirePressStub.callCount, 1, "The press event has been triggered on the correct edit button");
	});

	QUnit.test("F2 button pressed for item in editing mode when focused on the list item", function (assert) {
		//Arrange
		var oListItem = this.oUploadCollection._oList.getItems()[0],
			oPressEvent = {
				target: {
					id: oListItem.getId()
				}
			},
			oHandleClickStub = sinon.stub(this.oUploadCollection, "_handleClick");
		this.oUploadCollection.editModeItem = this.oUploadCollection.getItems()[0].getId();
		oListItem._status = undefined;
		//Act
		this.oUploadCollection._handleF2(oPressEvent);
		//Assert
		assert.deepEqual(oHandleClickStub.getCall(0).args[0], oPressEvent, "The press event has been triggered on the F2 button");
		assert.deepEqual(oHandleClickStub.getCall(0).args[1], this.oUploadCollection.editModeItem, "The press event has been triggered on the F2 button");
	});

	QUnit.test("F2 button pressed for item in editing mode when focused on the input field", function (assert) {
		//Arrange
		var sUCItemId = this.oUploadCollection.getItems()[0].getId(),
			oPressEvent = {
				target: {
					id: sUCItemId + "-ta_editFileName-inner"
				}
			},
			oHandleOkStub = sinon.stub(this.oUploadCollection, "_handleOk");
		this.oUploadCollection.editModeItem = this.oUploadCollection.getItems()[0].getId();
		//Act
		this.oUploadCollection._handleF2(oPressEvent);
		//Assert
		assert.deepEqual(oHandleOkStub.getCall(0).args[0], oPressEvent, "The press event has been triggered on the F2 button");
		assert.deepEqual(oHandleOkStub.getCall(0).args[1], this.oUploadCollection.editModeItem, "The press event has been triggered on the F2 button");
		assert.deepEqual(oHandleOkStub.getCall(0).args[2], true, "The press event has been triggered on the F2 button");
	});

	QUnit.test("Pressing keyboard DEL button while focused on list item", function (assert) {
		//Arrange
		var sUCItemId = this.oUploadCollection.getItems()[0].getId(),
			oPressEvent = {
				target: {
					id: sUCItemId + "-cli"
				}
			},
			oDeleteButton = sap.ui.getCore().byId(sUCItemId + "-deleteButton"),
			oFirePressStub = sinon.stub(oDeleteButton, "firePress");
		//Act
		this.oUploadCollection._handleDEL(oPressEvent);
		//Assert
		assert.strictEqual(oFirePressStub.callCount, 1, "The press event has been triggered on the delete button");
	});

	QUnit.test("Pressing keyboard F2 button results in correct handler call", function (assert) {
		//Arrange
		var oEvent = {
				keyCode: jQuery.sap.KeyCodes.F2,
				setMarked: sinon.stub()
			},
			oHandleF2Stub = sinon.stub(this.oUploadCollection, "_handleF2");
		//Act
		this.oUploadCollection.onkeydown(oEvent);
		//Assert
		assert.deepEqual(oHandleF2Stub.getCall(0).args[0], oEvent, "Correct handler has been executed");
		assert.ok(oEvent.setMarked.called, "Event has been marked");
	});

	QUnit.test("Pressing keyboard ESCAPE button results in correct handler call", function (assert) {
		//Arrange
		var oEvent = {
				keyCode: jQuery.sap.KeyCodes.ESCAPE,
				setMarked: sinon.stub()
			},
			oHandleESCAPEStub = sinon.stub(this.oUploadCollection, "_handleESC");
		//Act
		this.oUploadCollection.onkeydown(oEvent);
		//Assert
		assert.deepEqual(oHandleESCAPEStub.getCall(0).args[0], oEvent, "Correct handler has been executed");
		assert.ok(oEvent.setMarked.called, "Event has been marked");
	});

	QUnit.test("Pressing keyboard DELETE button results in correct handler call", function (assert) {
		//Arrange
		var oEvent = {
				keyCode: jQuery.sap.KeyCodes.DELETE,
				setMarked: sinon.stub()
			},
			oHandleDELETEStub = sinon.stub(this.oUploadCollection, "_handleDEL");
		//Act
		this.oUploadCollection.onkeydown(oEvent);
		//Assert
		assert.deepEqual(oHandleDELETEStub.getCall(0).args[0], oEvent, "Correct handler has been executed");
		assert.ok(oEvent.setMarked.called, "Event has been marked");
	});

	QUnit.test("Pressing keyboard ENTER button results in correct handler call", function (assert) {
		//Arrange
		var oEvent = {
				keyCode: jQuery.sap.KeyCodes.ENTER,
				setMarked: sinon.stub()
			},
			oHandleENTERStub = sinon.stub(this.oUploadCollection, "_handleENTER");
		//Act
		this.oUploadCollection.onkeydown(oEvent);
		//Assert
		assert.deepEqual(oHandleENTERStub.getCall(0).args[0], oEvent, "Correct handler has been executed");
		assert.ok(oEvent.setMarked.called, "Event has been marked");
	});

	QUnit.test("Pressing other keyboard buttons is correctly processed", function (assert) {
		//Arrange
		var oEvent = {
				keyCode: "Dummy",
				setMarked: sinon.stub()
			},
			oHandleF2Stub = sinon.stub(this.oUploadCollection, "_handleF2"),
			oHandleENTERStub = sinon.stub(this.oUploadCollection, "_handleENTER"),
			oHandleDELETEStub = sinon.stub(this.oUploadCollection, "_handleDEL"),
			oHandleESCAPEStub = sinon.stub(this.oUploadCollection, "_handleESC"),
			oSetMarkedStub = oEvent.setMarked;
		//Act
		this.oUploadCollection.onkeydown(oEvent);
		//Assert
		assert.equal(oHandleF2Stub.called, false, "Handler for F2 has not been called");
		assert.equal(oHandleENTERStub.called, false, "Handler for ENTER has not been called");
		assert.equal(oHandleDELETEStub.called, false, "Handler for DELETE has not been called");
		assert.equal(oHandleESCAPEStub.called, false, "Handler for ESCAPE has not been called");
		assert.equal(oSetMarkedStub.called, false, "Event has not been marked");
	});

	QUnit.module("Managing event delegates when entering and exiting edit mode", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});
	QUnit.test("First rendering after initialisation of UploadCollection", function (assert) {
		//Arrange
		//Act
		//Assert
		assert.strictEqual(!!this.oUploadCollection._oListEventDelegate, false, "No event delegations saved for deletion");
	});
	QUnit.test("In edit mode", function (assert) {
		//Arrange
		this.oUploadCollection.editModeItem = this.oUploadCollection.getItems()[0].getId();
		//Act
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		//Assert
		assert.strictEqual(!!this.oUploadCollection._oListEventDelegate, true, "Event delegations saved to be deleted on the beginning of the next rendering cycle");
	});
	QUnit.test("After exiting edit mode", function (assert) {
		//Arrange
		this.oUploadCollection.editModeItem = this.oUploadCollection.getItems()[0].getId();
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		this.oUploadCollection.editModeItem = null;
		//Act
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		//Assert
		assert.strictEqual(!!this.oUploadCollection._oListEventDelegate, false, "Event delegation has been successfully deleted while exiting edit mode");
	});

	QUnit.module("Factory binding Tests", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					factory: function () {
						return new UploadCollectionItem({
							contributor: "{contributor}",
							tooltip: "{tooltip}",
							documentId: "{documentId}",
							enableEdit: "{enableEdit}",
							enableDelete: "{enableDelete}",
							fileName: "{fileName}",
							fileSize: "{fileSize}",
							mimeType: "{mimeType}",
							thumbnailUrl: "{thumbnailUrl}",
							uploadedDate: "{uploadedDate}",
							url: "{url}"
						});
					}
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Test for triggerLink method when factory binding is used.", function (assert) {
		//Arrange
		var oSpy = sinon.spy(this.oUploadCollection, "_triggerLink");
		var oItem = this.oUploadCollection.getItems()[0];
		oItem.setUrl("test.jpg");
		//Act
		var oFileName = this.oUploadCollection._getFileNameControl(oItem, this);
		oFileName.firePress();
		//Assert
		assert.equal(oSpy.calledOnce,true, "Download Success");
	});
});