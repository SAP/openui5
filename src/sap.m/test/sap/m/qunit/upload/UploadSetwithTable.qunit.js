/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/m/upload/UploadSetwithTableRenderer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"./UploadSetwithTableTestUtils",
	"sap/m/upload/UploaderTableItem",
	"sap/m/library",
	"sap/m/ToolbarSpacer",
	"sap/ui/unified/FileUploader",
	"sap/m/upload/UploadSetToolbarPlaceholder",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/OverflowToolbar",
	"sap/m/IllustratedMessageType",
	"sap/m/upload/UploaderHttpRequestMethod"
], function (UploadSetwithTable, UploadSetwithTableItem, UploadSetwithTableRenderer, JSONModel, nextUIUpdate, TestUtils, Uploader, Library,
	ToolbarSpacer, FileUploader, UploadSetToolbarPlaceholder, Button, ToggleButton, OverflowToolbar, IllustratedMessageType, UploaderHttpRequestMethod) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4"
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false
				}
			]
		};
	}
	var UploadState = Library.UploadState;

	QUnit.module("UploadSetwithTable general functionality", {
		beforeEach: async function () {
			this.oUploadSetwithTable = new UploadSetwithTable("UploadSetwithTable", {
				fileTypes: "txt,doc,png",
				mediaTypes: "text/plain,application/msword,image/jpeg,image/png",
				maxFileNameLength: 50,
				maxFileSize: 5,
				uploadEnabled: true,
				items: {
					path: "/items",
					template: new UploadSetwithTableItem(),
					templateShareable: false
				}
			});
			this.oUploadSetwithTable.setModel(new JSONModel(getData()));
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Test for UploadSetwithTable Instance Creation and default properties", function (assert) {
		//arrange
		assert.ok(this.oUploadSetwithTable, "Instance created successfully");
		assert.equal(JSON.stringify(this.oUploadSetwithTable.getFileTypes()), '["txt","doc","png"]', "Default value for property FileTypes is correct");
		assert.equal(this.oUploadSetwithTable.getMaxFileNameLength(), 50, "Default value for property MaxFileNameLength is correct");
		assert.equal(this.oUploadSetwithTable.getMaxFileSize(), 5, "Default value for property MaxFileSize is correct");
		assert.equal(JSON.stringify(this.oUploadSetwithTable.getMediaTypes()), '["text/plain","application/msword","image/jpeg","image/png"]', "Default value for property MediaTypes is correct");
		assert.equal(this.oUploadSetwithTable.getNoDataText(), "No documents available", "Default value for property NoDataText is correct");
		assert.equal(this.oUploadSetwithTable.getNoDataDescription(), "Drag and drop files here to upload", "Default value for property NoDataDescription is correct");
		assert.equal(this.oUploadSetwithTable.getUploadUrl(), "", "Default value for property UploadUrl is correct");
		assert.equal(this.oUploadSetwithTable.getHttpRequestMethod(), UploaderHttpRequestMethod.Post, "Default value for property HttpRequestMethod is correct");
		assert.equal(this.oUploadSetwithTable.getMultiple(), false, "Default value for property Multiplel is correct");
		assert.equal(this.oUploadSetwithTable.getUploadButtonInvisible(), false, "Default value for property UploadButtonInvisible is correct");
		assert.equal(this.oUploadSetwithTable.getUploadEnabled(), true, "Default value for property UploadEnabled is correct");
		assert.equal(this.oUploadSetwithTable.getItemValidationHandler(), null, "Default value for property ItemValidationHandler is correct");
		assert.equal(this.oUploadSetwithTable.getDirectory(), false, "Default value for property Directory is correct");
		assert.equal(this.oUploadSetwithTable.getNoDataIllustrationType(), IllustratedMessageType.UploadCollection, "Default value for property NoDataIllustrationType is correct");
		assert.equal(this.oUploadSetwithTable.getEnableVariantManagement(), false, "Default value for property EnableVariantManagement is correct");
	});

	QUnit.test("Test for HearderTool Bar Instance Creation", function (assert) {
		//arrange
		assert.ok(this.oUploadSetwithTable.getHeaderToolbar(), "Instance of HearderTool Bar created successfully");
	});

	QUnit.test("Default No data type illustrated message/text/description rendering", async function (assert) {
		//Arrange
		this.oUploadSetwithTable.unbindAggregation("items");
		var oIllustratedMessage = this.oUploadSetwithTable.getNoData();

		await nextUIUpdate();
		//Assert
		assert.equal(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.UploadCollection, "The default no data illustrated message is rendred");
		assert.equal(oIllustratedMessage.getTitle(), this.oUploadSetwithTable.getNoDataText(), "correct Title is included in illustrated message");
		assert.equal(oIllustratedMessage.getDescription(), this.oUploadSetwithTable.getNoDataDescription(), "correct Description is included in illustrated message");
	});


	QUnit.test("No data rendering - with user specified no data illustration type", async function (assert) {
		//Arrange
		this.oUploadSetwithTable.setNoDataIllustrationType(IllustratedMessageType.SuccessBalloon);
		this.oUploadSetwithTable.setNoDataText("No Items");
		this.oUploadSetwithTable.setNoDataDescription("All the items has been removed");
		this.oUploadSetwithTable.unbindAggregation("items");
		var oIllustratedMessage = this.oUploadSetwithTable.getNoData();

		await nextUIUpdate();
		//Assert
		assert.equal(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.SuccessBalloon, "The custom illustrated message type is rendred");
		assert.equal(oIllustratedMessage.getTitle(), "No Items", "User specified Title is included in no data illustrated message");
		assert.equal(oIllustratedMessage.getDescription(), "All the items has been removed", "user specified Description is included in no data illustrated message");
	});

	QUnit.test("Test for invalid file type, change Upload set fileTypes value and make upload attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.xxx",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.yyy",
				size: 1,
				type: "application/pdf"
			},
			length: 2
		};
		this.oUploadSetwithTable.setMediaTypes([]);
		this.oUploadSetwithTable.setFileTypes(["xxx"]);

		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("fileTypeMismatch", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getMediaType(), "yyy", "mismatched Item type received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file name maximum length, upload to table attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader(),
			sLongFileName = "12345678901234567890123456789012345678901234567890.txt",
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
				0: {
					name: "Sample File 1.txt",
					size: 1,
					type: "text/plain"
				},
				1: {
					name: sLongFileName,
					size: 1,
					type: "text/plain"
				},
				2: {
					name: "Sample File 3.txt",
					size: 1,
					type: "text/plain"
				},
				length: 3
			};
		assert.equal(this.oUploadSetwithTable.getMaxFileNameLength(), 50, "upload set with table file name maximum length is ok");
		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("fileNameLengthExceeded", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), sLongFileName, "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file name maximum length, change Upload set maxFileNameLength value and make upload attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader(),
			sLongFileName = "12345678901234567890.txt",
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
				0: {
					name: "Sample File 1.txt",
					size: 1,
					type: "text/plain"
				},
				1: {
					name: sLongFileName,
					size: 1,
					type: "text/plain"
				},
				2: {
					name: "Sample File 3.txt",
					size: 1,
					type: "text/plain"
				},
				length: 3
			};
		assert.equal(this.oUploadSetwithTable.getMaxFileNameLength(), 50, "upload set file name maximum length is ok");
		this.oUploadSetwithTable.setMaxFileNameLength(20);
		assert.equal(this.oUploadSetwithTable.getMaxFileNameLength(), 20, "upload set file name maximum length changed");

		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("fileNameLengthExceeded", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), sLongFileName, "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file maximum size, upload to table attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader(),
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
				0: {
					name: "Sample File 1.txt",
					size: 1,
					type: "text/plain"
				},
				1: {
					name: "Sample File 2.txt",
					size: 6 * 1024 * 1024,
					type: "text/plain"
				},
				length: 2
			};
		assert.equal(this.oUploadSetwithTable.getMaxFileSize(), 5, "upload set with table file maximum size is ok");
		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("fileSizeExceeded", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.txt", "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file maximum size, change UploadWithTable set maxFileSize value and make upload attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader(),
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
				0: {
					name: "Sample File 1.txt",
					size: 1,
					type: "text/plain"
				},
				1: {
					name: "Sample File 2.txt",
					size: 4 * 1024 * 1024,
					type: "text/plain"
				},
				length: 2
			};
		assert.equal(this.oUploadSetwithTable.getMaxFileSize(), 5, "upload set with table file maximum size is ok");
		this.oUploadSetwithTable.setMaxFileSize(3);
		assert.equal(this.oUploadSetwithTable.getMaxFileSize(), 3, "upload set with table file maximum size have changed");
		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("fileSizeExceeded", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.txt", "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for invalid media type, change Uploadset with table mediaTypes value and make upload attempt", function (assert) {
		//arrange
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader();
		var oFileList = {
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "type1"
			},
			1: {
				name: "Sample File 2.txt",
				size: 1,
				type: "type2"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "unknown-type"
			},
			length: 3
		};
		this.oUploadSetwithTable.setMediaTypes(["type1", "type2"]);

		var done = assert.async();

		this.oUploadSetwithTable.attachEventOnce("mediaTypeMismatch", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 3.txt", "mismatched UploadSetwithTable Item's name is received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Upload button is not visible after setting uploadButtonInvisible to true", function (assert) {
		//Arrange
		this.oUploadSetwithTable.setUploadButtonInvisible(true);

		//Assert
		assert.equal(this.oUploadSetwithTable.getDefaultFileUploader().getVisible(), false, "Upload is not visible");
	});

	QUnit.test("Test for method setMultiple", function (assert) {
		assert.equal(this.oUploadSetwithTable.getMultiple(), false, "Initial multiple value (false) is set correctly");
		this.oUploadSetwithTable.setMultiple(true);
		assert.equal(this.oUploadSetwithTable.getMultiple(), true, "Multiple property should be set to true");
	});

	QUnit.test("Test for method setUploadEnabled", function (assert) {
		assert.equal(this.oUploadSetwithTable.getUploadEnabled(), true, "UploadEnabled value (false) is set correctly");
		this.oUploadSetwithTable.setUploadEnabled(false);
		assert.equal(this.oUploadSetwithTable.getUploadEnabled(), false, "UploadEnabled property should be set to true");
	});

	QUnit.test("Test for method getIconForFileType", function (assert) {
		assert.equal(UploadSetwithTable.getIconForFileType(null, "sample.pdf"), "sap-icon://pdf-attachment", "IconForFileType .pdf is set correctly");
		// assert.equal(UploadSetwithTable.getIconForFileType("image/gif", "sample"), "sap-icon://attachment-photo", "Icon For media type image/gif is set correctly");
		assert.equal(UploadSetwithTable.getIconForFileType(null, "sample.mp4"), "sap-icon://document", "IconForFileType .mp4 is set correctly");
	});

	QUnit.test("Test for method registerUploaderEvents (uploadstarted, uploadCompleted), oXhr parameters are not empty", async function (assert) {
		var oUploader = new Uploader(),
			oItem = this.oUploadSetwithTable.getItems()[0],
			done = assert.async();

		oUploader.attachEventOnce("uploadProgressed", function (oEvent) {
			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getUploadState(), UploadState.Uploading, "uploading started and the status is Uploading");
		});

		this.oUploadSetwithTable.attachEventOnce("beforeUploadStarts", function (oEvent) {
			assert.equal(oEvent.getParameter("item"), "uploading completed");
		});

		this.oUploadSetwithTable.attachEventOnce("uploadCompleted", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item param present");
			assert.ok(oEvent.mParameters.hasOwnProperty("response"), "response param present");
			assert.equal(oEvent.getParameter("responseXML"), null, "response xml param not present");
			assert.ok(oEvent.getParameter("readyState"), "readystate param present");
			assert.ok(oEvent.getParameter("status"), "status param present");
			assert.ok(oEvent.getParameter("headers"), "headers param present");
			done();
		});

		//Arrange
		this.oUploadSetwithTable.registerUploaderEvents(oUploader);
		this.oUploadSetwithTable.addDependent(oUploader);
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);
	});

	QUnit.test("Check multi-part form data in XMLHttpRequest", async function (assert) {
		//Setup
		var oUploader = new Uploader({
			useMultipart: true
		}),
			oItem = this.oUploadSetwithTable.getItems()[0],
			oXMLHttpRequestSendSpy = this.spy(window.XMLHttpRequest.prototype, "send");
		var oFormData = new window.FormData();

		this.oUploadSetwithTable.setAggregation("uploader", oUploader);
		this.oUploadSetwithTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestSendSpy.calledWith(oFormData), "XML Http request is made with form-data");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test for method getFileSizeWithUnits", function (assert) {
		assert.equal(UploadSetwithTable.getFileSizeWithUnits(1234322), "1.18 MB", "FileSize for Units determine correctly");
		assert.equal(UploadSetwithTable.getFileSizeWithUnits(12343222343223), "11495.52 GB", "FileSize for Units determine correctly");
	});

	QUnit.test("Test for method renameItem", function (assert) {
		var oItem = this.oUploadSetwithTable.getItems()[0];

		this.oUploadSetwithTable.attachEventOnce("itemRenamed", function (oEvent) {
			assert.ok(true, "FileRenamed event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "Test", "File name should be correct.");
		});

		var oDialog = this.oUploadSetwithTable._getFileRenameDialog(oItem);
		oDialog.open();
		oDialog.getContent()[1].setValue("Test");

		oDialog.getBeginButton().firePress();
	});

	QUnit.test("Test for method uploadItemViaUrl", function (assert) {
		var sName = "test.gif";
		var sUrl = "uploadSetTableDemo/SampleFiles/Animation.gif";
		var oPromise = new Promise(function (resolve, reject) {
			setTimeout(() => {
				resolve(true);
			}, 300);
		});
		var done = assert.async();
		this.oUploadSetwithTable.attachEventOnce("uploadCompleted", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item param present");
			assert.ok(oEvent.mParameters.hasOwnProperty("response"), "response param present");
			assert.equal(oEvent.getParameter("responseXML"), null, "response xml param not present");
			assert.ok(oEvent.getParameter("readyState"), "readystate param present");
			assert.ok(oEvent.getParameter("status"), "status param present");
			assert.ok(oEvent.getParameter("headers"), "headers param present");
			done();
		});

		this.oUploadSetwithTable.uploadItemViaUrl(sName, sUrl, oPromise);

	});

	QUnit.test("Test for method uploadItemWithoutFile", function (assert) {
		var oPromise = new Promise(function (resolve, reject) {
			setTimeout(() => {
				resolve(true);
			}, 300);
		});
		var done = assert.async();
		this.oUploadSetwithTable.attachEventOnce("uploadCompleted", function (oEvent) {
			//Assert
			assert.ok(oEvent.getParameter("item"), "item param present");
			assert.ok(oEvent.mParameters.hasOwnProperty("response"), "response param present");
			assert.equal(oEvent.getParameter("responseXML"), null, "response xml param not present");
			assert.ok(oEvent.getParameter("readyState"), "readystate param present");
			assert.ok(oEvent.getParameter("status"), "status param present");
			assert.ok(oEvent.getParameter("headers"), "headers param present");
			done();
		});

		this.oUploadSetwithTable.uploadItemWithoutFile(oPromise);

	});


	QUnit.module("UploadSet with Table HeaderToolbar Default", {
		beforeEach: async function () {
			this.oUploadSetwithTable = new UploadSetwithTable("noToolbarTest", {});
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("No HeaderToolbar is provided. Test that default toolbar is set", function (assert) {
		var oHeaderToolbar = this.oUploadSetwithTable.getHeaderToolbar();
		var aHeaderToolbarElements = oHeaderToolbar.getAggregation("content");


		assert.equal(aHeaderToolbarElements.length, 2, "All elements are in the toolbar");
		assert.ok(aHeaderToolbarElements[0] instanceof ToolbarSpacer, "First element is an instance of sap.m.ToolbarSpacer");
		assert.ok(aHeaderToolbarElements[1] instanceof FileUploader, "Second element is an instance of sap.m.FileUploader");
	});

	QUnit.module("UploadSetwithTable HeaderToolbar missing Placeholder", {
		beforeEach: function () {
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Test for adding file uploader to fallback position if UploadSetwithTable ToolbarPlaceHolder instance missing", async function (assert) {
		//Act
		this.oUploadSetwithTable = new UploadSetwithTable("noPHToolbarTest", {
			headerToolbar: new OverflowToolbar({
				content: []
			})
		});
		this.oUploadSetwithTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		var aHeaderToolbarElements = this.oUploadSetwithTable.getHeaderToolbar().getAggregation("content");
		assert.ok(aHeaderToolbarElements[0] instanceof FileUploader, "File Uploader inserted at fallback position");
	});

	QUnit.module("UploadSetwithTable HeaderToolbar Custom", {
		beforeEach: async function () {
			this.oUploadSetwithTable = new UploadSetwithTable("PHToolbarTest", {
				headerToolbar: new OverflowToolbar({
					content: [new Button("element1", { text: "Filter" }),
					new ToolbarSpacer("element2"),
					new UploadSetToolbarPlaceholder("element3"),
					new Button("element4", { icon: "sap-icon://money-bills" }),
					new Button("element5", { text: "New" }),
					new ToggleButton("element6", { text: "Toggle" }),
					new Button("element7", { text: "Open" })
					]
				})
			});
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("A correct HeaderToolbar is provided", function (assert) {
		var aHeaderToolbarElements = this.oUploadSetwithTable.getHeaderToolbar().getAggregation("content");
		assert.equal(aHeaderToolbarElements.length, 8, "All elements are in the toolbar");
		assert.ok(aHeaderToolbarElements[0] instanceof Button, "First element is a sap.m.Title");
		assert.ok(aHeaderToolbarElements[1] instanceof ToolbarSpacer, "Second element is a sap.m.ToolbarSpacer");
		assert.ok(aHeaderToolbarElements[2] instanceof UploadSetToolbarPlaceholder, "third element is an instance of sap.m.UploadSetToolbarPlaceholder");
		assert.ok(aHeaderToolbarElements[3] instanceof Button, "Fourth element is an instance of sap.m.Button");
		assert.ok(aHeaderToolbarElements[4] instanceof Button, "Fifth element is an instance of sap.m.Button");
		assert.ok(aHeaderToolbarElements[5] instanceof Button, "Sixth element is an instance of sap.m.Button");
		assert.ok(aHeaderToolbarElements[6] instanceof Button, "Seventh element is an instance of sap.m.Button");

		//Checks that every element is in the right position
		assert.deepEqual(aHeaderToolbarElements[0].getId(), "element1", "Element1 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[1].getId(), "element2", "Element2 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[2].getId(), "element3", "Element3 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[3].getId(), "element4", "Element4 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[4].getId(), "element5", "Element5 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[5].getId(), "element6", "Element6 was placed in the right position");
		assert.deepEqual(aHeaderToolbarElements[6].getId(), "element7", "Element7 was placed in the right position");

	});



	function getData1() {
		return {
			items: [
				{
					fileName: "Alice.mp4",
					"markers": [
						{
							"type": "Locked",
							"visibility": "IconAndText"
						}
					]
				},
				{
					fileName: "Test.mp4",
					"markers": [
						{
							"type": "Locked",
							"visibility": "IconAndText"
						}
					]
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false
				}
			]
		};
	}
	QUnit.module("Directory Uploads", {
		beforeEach: async function () {
			this.oUploadSetwithTable = new UploadSetwithTable("UploadSetwithTable", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData1()));
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Directory uploads setter/getter test", function (assert) {
		//Assert
		assert.equal(this.oUploadSetwithTable.getDirectory(), false, "By default directory uploads are set to false");

		//act
		this.oUploadSetwithTable.setDirectory(true);

		//assert
		assert.equal(this.oUploadSetwithTable.getDirectory(), true, "Directory uploads are now enabled with setter");
	});

	QUnit.test("Upload files from directory using directory feature", function (assert) {

		//act
		this.oUploadSetwithTable.setDirectory(true);

		var oInput = document.querySelector("[type='file']");

		//assert
		assert.ok(oInput.hasAttribute("webkitdirectory"), "Attribute properly set");

		//arrange
		var oProcessNewFileObjects = this.spy(this.oUploadSetwithTable, '_processSelectedFileObjects');
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader();
		var oFileList = {
			0: {
				name: "Sample File 1",
				size: 1,
				type: "type"
			},
			1: {
				name: "Sample File 2",
				size: 1,
				type: "type"
			},
			length: 2
		};

		//act
		oFileUploader.fireChange({ id: 'directory-uploads', newValue: '', files: oFileList });

		//assert
		assert.ok(oProcessNewFileObjects.calledWith(oFileList), "Uploadset will upload files from directory");
	});

	QUnit.test("Upload files from directory & sub directories using directory uploads", function (assert) {
		//arrange
		var oProcessNewFileObjects = this.spy(this.oUploadSetwithTable, '_processSelectedFileObjects');
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 1.txt"
			},
			1: {
				name: "Sample File 2",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 2.txt"
			},
			2: {
				name: "Sample File 3",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 3.txt"
			},
			3: {
				name: "Sample File 4",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 4.txt"
			},
			4: {
				name: "Sample File 5",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 5.txt"
			},
			length: 5
		};

		//act
		oFileUploader.fireChange({ id: 'directory-uploads', newValue: '', files: oFileList });

		//assert
		assert.ok(oProcessNewFileObjects.calledWith(oFileList), "Uploadset will upload files from directories & sub directories");
	});

	QUnit.test("Directory uploads aborted with mismatch file/files types of selected directory files", function (assert) {
		//arrange
		var oFileUploaderChangeSpy = this.spy(this.oUploadSetwithTable, '_onFileUploaderChange');
		var oFileUploader = this.oUploadSetwithTable.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 1.txt"
			},
			1: {
				name: "Sample File 2.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 2.txt"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 3.txt"
			},
			3: {
				name: "Sample File 4.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 4.txt"
			},
			4: {
				name: "Sample File 5.pdf",
				size: 1,
				type: "application/pdf",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 5.pdf"
			},
			length: 5
		};

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});

		//assert
		assert.ok(oFileUploaderChangeSpy.notCalled, "Directory uploads aborted with restrited file types");
	});

});