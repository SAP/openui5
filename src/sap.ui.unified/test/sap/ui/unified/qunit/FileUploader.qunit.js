/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/FileUploader",
	"sap/ui/core/TooltipBase",
	"sap/m/Label",
	"sap/m/Text"
], function(qutils, FileUploader, TooltipBase, Label, Text) {
	"use strict";

	/**
 	 * Helper function to create a FileUploader with useful default value
 	 */
	var createFileUploader = function (mProps) {
		mProps = mProps || {};
		return new FileUploader("upload_1", {
			name: mProps.name || "test1",
			enabled: true,
			uploadUrl: mProps.uploadUrl || "../../../../upload/",
			sendXHR: mProps.sendXHR || true,
			multiple: mProps.multiple,
			value: mProps.value || "",
			width: mProps.width || "400px",
			tooltip: mProps.tooltip || "Upload your file to the local server.",
			placeholder: mProps.placeholder || "Choose a file for uploading...",
			fileType: mProps.fileType || ["pptx","txt","js"],
			mimeType: mProps.mimeType || ["image/jpeg","application/javascript","text/coffeescript"],
			maximumFilenameLength: mProps.maximumFilenameLength || 0,
			maximumFileSize: mProps.maximumFileSize || 2,
			uploadOnChange: mProps.uploadOnChange || false,
			buttonText: mProps.buttonText || "Choose!",
			buttonOnly: mProps.buttonOnly || false,
			additionalData: mProps.additionalData || "abc=123&test=456"
		});
	};

	/**
	 * Helper function to create a fake file object, which has the same properties
	 * as a real native File-Object.
	 * If the browser is Firefox we need to wrap the file object in a Blob.
	 * @param {Object} mProps
	 * @param {Boolean} bIsFirefox
	 */
	var createFakeFile = function (mProps, bIsFirefox) {
		var mProps = mProps || {},
			oFileObject = {
				"webkitRelativePath": mProps.webkitRelativePath || "",
				"lastModifiedDate": mProps.lastModifiedDate || "2014-08-14T09:42:09.000Z",
				"name": mProps.name || "FileUploader.js",
				"type": mProps.type || "application/javascript",
				"size": mProps.size || 401599
		};

		if (mProps.size === 0){
			oFileObject.size = 0;
		}

		return bIsFirefox ? new Blob([oFileObject]) : oFileObject;
	};

	/**
	 * Test Public Interface
	 */
	QUnit.module("public interface");

	QUnit.test("Test enabled property - setter/getter", function (assert) {
		var oFileUploader = createFileUploader(),
				$fileUploader,
				sDisabledClassName = "sapUiFupDisabled",
				fnTestDisabledClass = function(fileUploader, bExpected) {
					assert.equal(fileUploader.hasClass(sDisabledClassName), bExpected,
							"The FUploader should " + (bExpected ? "" : "not") + " have the " + sDisabledClassName + " class.");
				};

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestDisabledClass($fileUploader, false);

		// act
		oFileUploader.setEnabled(false);
		sap.ui.getCore().applyChanges();
		// assert
		fnTestDisabledClass($fileUploader, true);

		// act
		oFileUploader.setEnabled(true);
		sap.ui.getCore().applyChanges();
		// assert
		fnTestDisabledClass($fileUploader, false);

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test buttonOnly property - setter/getter", function (assert) {
		var oFileUploader = createFileUploader({
				buttonOnly: true
			}),
			$fileUploader,
			sButtonOnlyClassName = "sapUiFupButtonOnly",
			fnTestButtonOnlyClass = function(fileUploader, bExpected) {
				assert.equal(fileUploader.hasClass(sButtonOnlyClassName), bExpected,
					"The FUploader should " + (bExpected ? "" : "not") + " have the " + sButtonOnlyClassName + " class.");
			};

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestButtonOnlyClass($fileUploader, true);

		// act
		oFileUploader.setButtonOnly(false);
		sap.ui.getCore().applyChanges();
		$fileUploader = oFileUploader.$();
		// assert
		fnTestButtonOnlyClass($fileUploader, false);

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test fileType property - setter/getter - compatibility cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
			fileType: "doc,docx,txt,rtf"
		});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getFileType(), ["doc", "docx", "txt", "rtf"], "initial property value 'doc,docx,txt,rtf' should be converted to an array");

		//standard cases
		oFileUploader.setFileType("bmp");
		assert.deepEqual(oFileUploader.getFileType(), ["bmp"], "setFileType('bmp') --> getFileType() should return the file types converted to an array");

		oFileUploader.setFileType("bmp,png,jpeg");
		assert.deepEqual(oFileUploader.getFileType(), ["bmp", "png", "jpeg"], "setFileType('bmp,png,jpeg') --> getFileType() should return the file types converted to an array");

		//Edge case
		oFileUploader.setFileType("");
		assert.deepEqual(oFileUploader.getFileType(), [], "setFileType('') --> getFileType() should return an empty array");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test fileType property - setter/getter - standard cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
				fileType: ["doc", "docx", "txt", "rtf"]
			});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getFileType(), ["doc", "docx", "txt", "rtf"], "initial property value should be converted to an array");

		//Standard cases
		oFileUploader.setFileType(["bmp"]);
		assert.deepEqual(oFileUploader.getFileType(), ["bmp"], "setFileType(['bmp']) --> getFileType() should return a specific array");

		oFileUploader.setFileType(["bmp", "png", "jpeg"]);
		assert.deepEqual(oFileUploader.getFileType(), ["bmp", "png", "jpeg"], "setFileType(['bmp', 'png', 'jpeg']) --> getFileType() should return a specific array");

		//Edge cases
		oFileUploader.setFileType([]);
		assert.deepEqual(oFileUploader.getFileType(), [], "setFileType([]) --> getFileType() should return an empty array");

		oFileUploader.setFileType(null);
		assert.equal(oFileUploader.getFileType(), null, "setFileType(null) --> getFileType() should return null");

		oFileUploader.setFileType();
		assert.equal(oFileUploader.getFileType(), undefined, "setFileType() --> getFileType() should return undefined");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test mimeType property - setter/getter - compatibility cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
			mimeType: "image/png,image,image/jpeg,application/javascript"
		});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getMimeType(), ["image/png", "image", "image/jpeg", "application/javascript"], "initial property value 'image/png,image,image/jpeg,application/javascript' should be converted to an array");

		//standard case
		oFileUploader.setMimeType("image/jpeg,audio/mpeg3,text");
		assert.deepEqual(oFileUploader.getMimeType(), ["image/jpeg", "audio/mpeg3", "text"], "setMimeType('image/jpeg,audio/mpeg3,text') --> getMimeType() should return the file types converted to an array");

		//Edge Cases
		oFileUploader.setMimeType("");
		assert.deepEqual(oFileUploader.getMimeType(), [], "setMimeType('') --> getMimeType() should return an empty array");

		oFileUploader.setMimeType("application");
		assert.deepEqual(oFileUploader.getMimeType(), ["application"], "setMimeType('application') --> getMimeType() should return the file types converted to an array");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test mimeType property - setter/getter - standard cases", function (assert) {
		//Setup
		var oFileUploader = createFileUploader({
				mimeType: ["image/png", "image", "image/jpeg", "application/javascript"]
			});

		//Initial Array Check
		assert.deepEqual(oFileUploader.getMimeType(), ["image/png", "image", "image/jpeg", "application/javascript"], "initial property value should be converted to an array");

		//standard cases
		oFileUploader.setMimeType(["audio"]);
		assert.deepEqual(oFileUploader.getMimeType(), ["audio"], "setMimeType(['audio']) --> getMimeType() should return an array with the original content");

		oFileUploader.setMimeType(["image", "audio/mpeg3", "text/x-java-source"]);
		assert.deepEqual(oFileUploader.getMimeType(), ["image", "audio/mpeg3", "text/x-java-source"], "setMimeType(['image', 'audio/mpeg3', 'text/x-java-source']) --> getMimeType() should return a specific array");

		//Edge cases
		oFileUploader.setMimeType([]);
		assert.deepEqual(oFileUploader.getMimeType(), [], "setMimeType([]) --> getMimeType() should return an empty array");

		oFileUploader.setMimeType(null);
		assert.equal(oFileUploader.getMimeType(), null, "setMimeType(null) --> getMimeType() should return null");

		oFileUploader.setMimeType();
		assert.equal(oFileUploader.getMimeType(), undefined, "setMimeType() --> getMimeType() should return undefined");

		//cleanup
		oFileUploader.destroy();
	});

	//BCP: 1970125350
	//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	QUnit.test("input has the correct accept attribute", function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			mimeType: ["image/png", "image/jpeg"],
			fileType: ["txt", "pdf"]
		});

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".txt,.pdf,image/png,image/jpeg",
			"accept attribute is correct");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test valueStateText property - setter/getter", function (assert) {
		var oFileUploader = createFileUploader(),
			VALUE_STATE_TEXT = "Test";

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert default
		assert.equal(oFileUploader.getValueStateText(), "", "setValueStateText() --> getValueStateText() should return an empty string by default");

		// act
		oFileUploader.setValueStateText(VALUE_STATE_TEXT);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oFileUploader.getValueStateText(), VALUE_STATE_TEXT, "setValueStateText() --> getValueStateText() should return '" + VALUE_STATE_TEXT + "'");
		assert.equal(oFileUploader.oFilePath.getValueStateText(), VALUE_STATE_TEXT, "Child input setValueStateText() --> getValueStateText() should return '" + VALUE_STATE_TEXT + "'");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip", function (assert) {
		//Set up
		var sTooltip = "this is \"the\" file uploader";
		var oFileUploader = createFileUploader({
			tooltip: "MyFileUploader"
		});


		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oFileUploader.setTooltip(sTooltip);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "FileUploader tooltip is correct");
		assert.equal(oFileUploader.$().find(".sapUiFupInputMask")[0].getAttribute("title"), sTooltip, "FileUploader mask tooltip is correct");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip with none-string tooltip", function (assert) {
		// Set up
		var oTooltip = new TooltipBase({text: "test"});
		var oFileUploader = createFileUploader({
			tooltip: oTooltip
		});

		// act
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert (only tooltip type of string are added via the 'title' attribute)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), null, "The title attribute is not set");
		assert.equal(oFileUploader.$().find(".sapUiFupInputMask")[0].getAttribute("title"), null, "The title attribute is not set");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test associated label interaction", function (assert) {
		//Set up
		var oFileUploader = createFileUploader({}),
			oSpy,
			FUEl;

		// override onclick handler to prevent file dialog opening, causing the test execution to stop
		oFileUploader.onclick = function (oEvent) {
			oEvent.preventDefault();
		};

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		FUEl = oFileUploader.getDomRef("fu");
		oSpy = this.spy(FUEl, "click");
		qutils.triggerEvent("click", oFileUploader.oBrowse.getId());

		// assert
		assert.strictEqual(oSpy.callCount, 1, "Clicking on browse button should trigger click on the input");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("dependency of submit and rendering", function (assert) {
		// arrange
		var oFileUploader = new FileUploader().placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// act
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRedering, false, "The submit is performed without a dependency of the rendering.");

		// act
		oFileUploader.setUploadUrl("test");
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRedering, true, "The submit is performed after there is rendering caused by setter of uploadUrl.");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.module("File validation");
	QUnit.test("Test file type validation - handlechange()", function (assert){
		//setup
		var oFileUploader = createFileUploader({
				fileType: ["bmp", "png", "jpg"]
			}),
			//rebuilding the native event structure
			fakeEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name:"FileUploader.qunit.html",
								type:"text/html",
								size:404450
							}),
						"length" : 1
					}
				}
			},
			fnTypeMissmatchHandler = function (oEvent) {
				//this branch is necessary because, the typeMissmatch Event is fired if either the fileType or mimeType is wrong
				if (oEvent.getParameter("fileType")) {
					assert.equal(oEvent.getParameter("fileName"), "FileUploader.qunit.html", "typeMissmatch Event has the correct parameter");
				} else if (oEvent.getParameter("fileType") === "") {
					// when file has no extension it should return empty string for the fileType
					assert.equal(oEvent.getParameter("fileType"), "", "parameter fileType is empty, when file has no extension");
				} else if (oEvent.getParameter("mimeType")) {
					assert.equal(oEvent.getParameter("fileName"), "hallo.png", "typeMissmatch Event has the correct parameter");
				}
			},
			fnFileAllowedHandler = function (oEvent) {
				assert.equal(oEvent.getParameter("fileName"), undefined, "fileAllowed should not have any parameters");
			},
			oTypeMissmatchSpy = this.spy(oFileUploader, "fireTypeMissmatch"),
			oFileAllowedSpy = this.spy(oFileUploader, "fireFileAllowed");

		//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		//attach the events which will be fired
		oFileUploader.attachEvent("typeMissmatch", fnTypeMissmatchHandler);
		oFileUploader.attachEvent("fileAllowed", fnFileAllowedHandler);

		//type mismatch on the *fileType*
		oFileUploader.setMimeType(["text/html"]);
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 1, "typeMissmatch (fileType) Event should be called exactly ONCE");

		//type mismatch on the *mimeType*
		oFileUploader.setMimeType(["text/html"]);
		fakeEvent.target.files[0] = createFakeFile({
			name: "hallo.png",
			type: "image/png",
			size: 166311
		});
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 2, "typeMissmatch (mimeType) Event should be called TWICE now");

		//type mismatch on the empty *fileType*
		oFileUploader.setMimeType();
		fakeEvent.target.files[0] = createFakeFile({
			name: "hallo",
			type: "unknown",
			size: 166311
		});
		oFileUploader.handlechange(fakeEvent);
		assert.equal(oTypeMissmatchSpy.callCount, 3, "typeMissmatch (fileType) Event should be called TRICE now");

		//file allowed
		oFileUploader.setFileType(["html"]);
		oFileUploader.setMimeType(["text/html"]);
		fakeEvent.target.files[0] = createFakeFile({
			name: "FileUploader.qunit.html",
			type: "text/html",
			size: 100301
		});
		oFileUploader.handlechange(fakeEvent);
		if (!(!!sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10)) {
			assert.equal(oFileAllowedSpy.callCount, 1, "fileAllowed Event should be called exactly ONCE");
		}

		//cleanup
		oFileUploader.destroy();
	});

	if (!(!!sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10)) {
		QUnit.test("Testing the filename lenth validation handling - handlechange()", function (assert) {
			//setup
			var oFileUploader = createFileUploader({
					maximumFilenameLength: 10,
					fileType: ["java"],
					mimeType: ["text/x-java-source,java"]
				}),
				//rebuilding the native event structure
				fakeEvent = {
					type: "change",
					target: {
						files : {
							"0": createFakeFile({
									name:"AbstractSingletonProxyFactoryBean.java",
									type:"text/x-java-source,java",
									size:1226
								}),
							"length" : 1
						}
					}
				},
				fnFilenameLengthExceedHandler = function (oEvent) {
					assert.equal(oEvent.getParameter("fileName"), "AbstractSingletonProxyFactoryBean.java", "filenameLengthExceed Event delivers correct fileName, which is too long");
				},
				oSpy = this.spy(oFileUploader, "fireFilenameLengthExceed");

			//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
			oFileUploader.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oFileUploader.attachEvent("filenameLengthExceed", fnFilenameLengthExceedHandler);

			oFileUploader.handlechange(fakeEvent);
			assert.equal(oSpy.callCount, 1, "filenameLengthExceed Event should be called exactly ONCE");

			//cleanup
			oFileUploader.destroy();
		});
	}

	QUnit.test("Testing the clearing of the input fields - clear()", function (assert) {
		//setup
		var oFileUploader = createFileUploader(),
			oSpy = this.spy(oFileUploader, "setValue"),
			domFileInputField;

		//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oFileUploader.setValue("Testfilename.txt");
		assert.equal(oFileUploader.getValue(), "Testfilename.txt", "Check if filename is set correctly");
		assert.equal(oSpy.callCount, 1, "setValue was called ONCE");

		//clearing the FUP
		oFileUploader.clear();
		assert.equal(oFileUploader.getValue(), "", "Value should be empty string: ''");

		//check if the text fields are empty as expected
		domFileInputField = jQuery.sap.domById(oFileUploader.getId() + "-fu");
		assert.equal(domFileInputField.value, "", "File-Input TextField should be empty now");
		assert.equal(oSpy.callCount, 2, "setValue should now be called TWICE");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Empty file event is fired", function (assert){
		var oFileUploader = createFileUploader(),
			fnFireFileEmpty = this.spy( oFileUploader, "fireFileEmpty"),
			oTestEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name: "emptyFile.txt",
								type: "text/html",
								size: 0
							}),
						"length" : 1
					}
				}
		};

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oFileUploader.handlechange(oTestEvent);
		assert.equal(fnFireFileEmpty.calledOnce, true, "Event on empty file upload is fired.");

		//Clean up
		oFileUploader.destroy();
	});

	/**
	 * Test private functions
	 */
	QUnit.module("private functions");
	QUnit.test("Testing sending passed files with XHR", function (assert) {
		var oFileUploader = createFileUploader(),
			bIsExecutedInFireFox = sap.ui.Device.browser.firefox,
			aFiles = {
				"0": createFakeFile({
					name:"FileUploader.qunit.html",
					type:"text/html",
					size:404450
				}, bIsExecutedInFireFox),
				"1": createFakeFile({
					name:"FileUploader2.qunit.html",
					type:"text/html",
					size:404450
				}, bIsExecutedInFireFox),
				"length" : 2
			},
			oSpy = this.spy(window.XMLHttpRequest.prototype, "send");

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oFileUploader._sendFilesWithXHR(aFiles);

		assert.ok(oSpy.called, "XHR request is made");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("BCP: 1770523801 - FormData.append called with third argument fails under Safari browser if passed file " +
			"is not a Blob", function (assert) {
		// Arrange
		var oFileUploader = createFileUploader(),
			sExpectedFileName = "FileUploader.qunit.html",
			oFormData = new window.FormData(),
			oBlob,
			oMSBlobBuilder,
			aFiles,
			oFile = createFakeFile({
				name: "FileUploader.qunit.html",
				type: "text/html",
				size: 404450
			}, false /* In this test we always pass a Blob object */),
			oAppendFileSpy = this.spy(oFileUploader, "_appendFileToFormData"),
			oAppendSpy = this.spy(oFormData, "append");

		// NOTE: To create a Blob in Internet Explorer we have to use MSBlobBuilder when available because
		// normal window.Blob constructor will fail.
		if (window.MSBlobBuilder) {
			oMSBlobBuilder = new window.MSBlobBuilder();
			oMSBlobBuilder.append(oFile);
			oBlob = oMSBlobBuilder.getBlob();
		} else {
			oBlob = new window.Blob([oFile]);
		}

		// Mock array like object with file as a Blob
		aFiles = {
			"0": oBlob,
			"length" : 1
		};

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act - send files to make sure _appendFileToFormData method is used
		oFileUploader._sendFilesWithXHR(aFiles);

		// Assert
		assert.strictEqual(oAppendFileSpy.callCount, 1, "_sendFilesWithXHR calls internally _appendFileToFormData.");

		// Act - Send a Blob object without a name
		oFileUploader._appendFileToFormData(oFormData, 'test', oBlob);

		// Assert
		assert.strictEqual(oAppendSpy.getCall(0).args.length, 2,
				"FormData.append method is called with only two parameters when the Blob object has no 'name' property");

		// Act - add name property to the oBlob object
		oAppendSpy.reset();
		oBlob.name = sExpectedFileName;
		oFileUploader._appendFileToFormData(oFormData, 'test', oBlob);

		// Assert
		assert.strictEqual(oAppendSpy.getCall(0).args.length, 3,
				"FormData.append method is called with three parameters");

		assert.strictEqual(oAppendSpy.getCall(0).args[2], sExpectedFileName,
				"The third parameter passed to FormData.append equals the expected file name.");

		// Cleanup
		oAppendFileSpy.restore();
		oAppendSpy.restore();
		oFileUploader.destroy();
	});

	QUnit.test("Testing the filename length handling - _isFilenameTooLong", function (assert) {
		//setup
		var oFileUploader = createFileUploader({
			maximumFilenameLength: 5
		});

		//initial check cases
		assert.ok(oFileUploader._isFilenameTooLong("15_AppDev_Components_Exercises.pptx"), "Initial check: Filename should be too long");

		//standard case
		oFileUploader.setMaximumFilenameLength(20);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should NOT be too long");

		oFileUploader.setMaximumFilenameLength(10);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		//edge cases
		oFileUploader.setMaximumFilenameLength(15);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should NOT be too long");

		oFileUploader.setMaximumFilenameLength(14);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength(-4);
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), true, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength();
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength() --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		oFileUploader.setMaximumFilenameLength(null);
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength(null) --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		var undefinedVariable;
		oFileUploader.setMaximumFilenameLength(undefinedVariable);
		assert.equal(oFileUploader.getMaximumFilenameLength(), 0, "setMaximumFilenameLength(undefined) --> maximumFilenameLength should be 0 (default)");
		assert.equal(oFileUploader._isFilenameTooLong("FileUploader.js"), false, "Filename should be too long");

		//cleanup
		oFileUploader.destroy();
	});

	testInputRerender("setEnabled", false);
	testInputRerender("setPlaceholder", "placeholder");

	QUnit.module("BlindLayer", {
		beforeEach: function() {
			this.oFileUploader = createFileUploader();

			//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
			this.oFileUploader.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},

		afterEach: function() {
			this.oFileUploader.destroy();
		}
	});

	QUnit.test("Check if BlindLayer is in DOM", function(assert) {
		var $Frame = this.oFileUploader.$("frame");

		var oParentRef = $Frame.parent().get(0);
		var oStatic = sap.ui.getCore().getStaticAreaRef();

		assert.equal($Frame.length, 1, "iFrame was inserted into DOM");
		assert.equal(oParentRef, oStatic, "FileUploader's Blindlayer UI-area is the static UI-area");

		assert.equal($Frame.css("display"), "none", "Blindlayer is 'display:none'");
	});

	QUnit.test("File uploader input field and browse button have stable IDs", function (assert) {
		var sBrowseButtonSuffix = "-fu_button",
			sTextFueldSuffix = "-fu_input";

		// assert
		assert.strictEqual(
			this.oFileUploader.oBrowse.getId(),
			this.oFileUploader.getId()  + sBrowseButtonSuffix,
			"Browse button ID is stable"
		);
		assert.strictEqual(
			this.oFileUploader.oFilePath.getId(),
			this.oFileUploader.getId()  + sTextFueldSuffix,
			"Input field ID is stable"
		);
	});

	QUnit.module("Keyboard handling");

	QUnit.test("ESCAPE key propagation", function (assert) {
		var oFileUploader = createFileUploader(),
			oMockEscapePress = {
				keyCode: 27,
				stopPropagation: function() {},
				preventDefault: function () {}
			},
			stopPropagationSpy = this.spy(oMockEscapePress, "stopPropagation");

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oFileUploader.onkeypress(oMockEscapePress);

		assert.strictEqual(stopPropagationSpy.callCount, 0, "stopPropagation shouldn't be fired on ESCAPE key press");

		oFileUploader.destroy();
	});

	function testInputRerender(sMethodName, vValue) {
		QUnit.test(sMethodName + " will call _resizeDomElements after input is re-rendered", function (assert) {
			// setup
			var oCore = sap.ui.getCore(),
					oFileUploader = createFileUploader();
			oFileUploader.placeAt("qunit-fixture");
			oCore.applyChanges();

			// act
			var oResizeDomElementsSpy = this.spy(oFileUploader, "_resizeDomElements");
			oFileUploader[sMethodName](vValue);
			oCore.applyChanges();

			// assert
			assert.equal(oResizeDomElementsSpy.callCount, 1, "_resizeDomElements should be called once when input is re-rendered");

			// cleanup
			oResizeDomElementsSpy.restore();
			oFileUploader.destroy();
		});
	}

	QUnit.module("Accessibility");

	QUnit.test("AriaLabelledBy", function(assert) {
		// setup
		var oFileUploader = new FileUploader("fu"),
			oLabel = new Label({
				text: "label for",
				labelFor: "fu"
			}),
			oBrowse = oFileUploader.oBrowse,
			aLabelledBy = [
				new Text({text: "Labelled by 1"}),
				new Text("labelledby2", {text: "Labelled by 2"}),
				new Text({text: "Labelled by 3"})
			];

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		aLabelledBy.forEach(function(oLabel) {
			oFileUploader.addAriaLabelledBy(oLabel.getId());
		});

		// assert
		assert.strictEqual(oFileUploader.getAriaLabelledBy().length, 3, "All three aria label IDs are added to the FileUploader 'ariaLabelledBy' association");
		assert.ok(oBrowse.getAriaLabelledBy().indexOf("labelledby2") >= 0, "ID 'labelledby2' is added to the browse button 'ariaLabelledBy' association");

		// act
		oFileUploader.removeAriaLabelledBy("labelledby2");

		// assert
		assert.strictEqual(oFileUploader.getAriaLabelledBy().length, 2, "Aria label ID is removed from FileUploader 'ariaLabelledBy' association");
		assert.ok(oFileUploader.getAriaLabelledBy().indexOf("labelledby2") === -1, "ID 'labelledby2' is removed from FileUploader 'ariaLabelledBy' association");
		assert.ok(oBrowse.getAriaLabelledBy().indexOf("labelledby2") === -1, "ID 'labelledby2' is removed from browse button 'ariaLabelledBy' association");

		// act
		oFileUploader.removeAllAriaLabelledBy();

		// assert
		assert.ok(oFileUploader.getAriaLabelledBy().length === 0, "All label IDs are removed from FileUploader 'ariaLabelledBy' association");
		assert.ok(oBrowse.getAriaLabelledBy().length === 1, "Initial label ID remains in the 'Browse' button 'ariaLabelledBy' association");

		// cleanup
		oLabel.destroy();
		aLabelledBy.forEach(function(oLabel) {
			oLabel.destroy();
		});
		oFileUploader.destroy();

	});

	QUnit.test("AriaDescribedBy", function(assert) {
		// setup
		var oFileUploader = new FileUploader("fu"),
			oLabel = new Label({
				text: "label for",
				labelFor: "fu"
			}),
			oBrowse = oFileUploader.oBrowse,
			aDescribedBy = [
				new Text({text: "Described by 1"}),
				new Text("describedby2", {text: "Described by 2"}),
				new Text({text: "Described by 3"})
			];

		// act
		aDescribedBy.forEach(function(oDesc) {
			oFileUploader.addAriaDescribedBy(oDesc.getId());
		});

		// assert
		assert.strictEqual(oFileUploader.getAriaDescribedBy().length, 3, "All three description IDs are added to the FileUploader 'ariaDescribedBy' association");
		assert.ok(oBrowse.getAriaDescribedBy().indexOf("describedby2") >= 0, "ID 'describedby2' is added to the browse button 'ariaDescribedBy' association");

		// act
		oFileUploader.removeAriaDescribedBy("describedby2");

		// assert
		assert.strictEqual(oFileUploader.getAriaDescribedBy().length, 2, "Aria description ID is removed from FileUploader 'ariaDescribedBy' association");
		assert.ok(oFileUploader.getAriaDescribedBy().indexOf("describedby2") === -1, "ID 'describedby2' is removed from FileUploader 'ariaDescribedBy' association");
		assert.ok(oBrowse.getAriaDescribedBy().indexOf("describedby2") === -1, "ID 'describedby2' is removed from browse button 'ariaDescribedBy' association");

		// act
		oFileUploader.removeAllAriaDescribedBy();

		// assert
		assert.ok(oFileUploader.getAriaDescribedBy().length === 0, "All IDs are removed from FileUploader 'ariaDescribedBy' association");
		assert.ok(oBrowse.getAriaDescribedBy().length === 1, "Initial description ID remains in the 'Browse' sap.m.Button 'ariaDescribedBy' association");

		// cleanup
		oLabel.destroy();
		aDescribedBy.forEach(function(oDesc) {
			oDesc.destroy();
		});
		oFileUploader.destroy();
	});

	QUnit.test("Label is redirected to internal button", function (assert) {
		// setup
		var sInternalButtonAriaLabelledby,
			oLabel = new sap.m.Label("newLabel", {
				text: "Select Document",
				labelFor: "fu"
			}),
			oFileUploader = new sap.ui.unified.FileUploader("fu");

		// act
		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		sInternalButtonAriaLabelledby = oFileUploader.oBrowse.$().attr("aria-labelledby");

		// assert
		assert.ok(sInternalButtonAriaLabelledby.indexOf("newLabel") !== -1, "Internal button has reference to the newly created label");

		// cleanup
		oLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("Label added dynamicaly", function (assert) {
		// setup
		var oNewLabel,
			sInternalButtonAriaLabelledby,
			oLabel = new sap.m.Label("initialLabel", {
				text: "Select Document",
				labelFor: "fu"
			}),
			oFileUploader = new sap.ui.unified.FileUploader("fu");

		// act
		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oNewLabel = new sap.m.Label("newLabel", { labelFor: "fu" });

		oNewLabel.placeAt("content");
		sap.ui.getCore().applyChanges();

		sInternalButtonAriaLabelledby = oFileUploader.oBrowse.$().attr("aria-labelledby");

		// assert
		assert.ok(sInternalButtonAriaLabelledby.indexOf("initialLabel") !== -1, "Internal button has reference to the initialy created label");
		assert.ok(sInternalButtonAriaLabelledby.indexOf("newLabel") !== -1, "Internal button has reference to the newly created label");

		// cleanup
		oLabel.destroy();
		oNewLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("Description for default FileUploader", function (assert) {
		// Setup
		var oFileUploader = new sap.ui.unified.FileUploader("fu"),
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $description = oFileUploader.$().find("#fu-AccDescr");
		assert.strictEqual($description.text(), oRB.getText("FILEUPLOAD_ACC"), "Description contains information just for activating.");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader with tooltip and placeholder", function (assert) {
		// Setup
		var oFileUploader = new sap.ui.unified.FileUploader("fu", {
				tooltip: "the-tooltip",
				placeholder: "the-placeholder"
			}),
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var sDescriptionText = oFileUploader.$().find("#fu-AccDescr").text();
		assert.ok(sDescriptionText.indexOf(oRB.getText("FILEUPLOAD_ACC")) !== -1, "Activation information is placed in the description");
		assert.ok(sDescriptionText.indexOf("the-tooltip") !== -1, "FileUploader's tooltip is in the description");
		assert.ok(sDescriptionText.indexOf("the-placeholder") !== -1, "FileUploader's placeholder is in the description");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader after tooltip update", function (assert) {
		// Setup
		var sInitialTooltip = "initial-tooltip",
			sUpdatedTooltip = "updated-tooltip",
			oFileUploader = new sap.ui.unified.FileUploader("fu", {
				tooltip: sInitialTooltip
			}),
			sAccDescription;

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oFileUploader.setTooltip(sUpdatedTooltip);

		// Assert
		sAccDescription = document.getElementById("fu-AccDescr").innerHTML;
		assert.ok(sAccDescription.indexOf(sInitialTooltip) === -1, "FileUploader's initial tooltip isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedTooltip) !== -1, "FileUploader's updated tooltip is in the description");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader after placeholder update", function (assert) {
		// Setup
		var sInitialPlaceholder = "initial-placeholder",
			sUpdatedPlaceholder = "updated-placeholder",
			oFileUploader = new sap.ui.unified.FileUploader("fu", {
				placeholder: sInitialPlaceholder
			}),
			sAccDescription;

		oFileUploader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oFileUploader.setPlaceholder(sUpdatedPlaceholder);

		// Assert
		sAccDescription = document.getElementById("fu-AccDescr").innerHTML;
		assert.ok(sAccDescription.indexOf(sInitialPlaceholder) === -1, "FileUploader's initial placeholder isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedPlaceholder) !== -1, "FileUploader's updated placeholder is in the description");

		// Cleanup
		oFileUploader.destroy();
	});
});