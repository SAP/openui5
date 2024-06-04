/*global QUnit, window */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/FileUploader",
	"sap/ui/unified/library",
	"sap/ui/core/StaticArea",
	"sap/ui/core/TooltipBase",
	"sap/ui/core/InvisibleText",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(Library, qutils, nextUIUpdate, FileUploader, unifiedLibrary, StaticArea, TooltipBase, InvisibleText, Label, Text, Device, jQuery) {
	"use strict";

	// shortcut for sap.ui.unified.FileUploaderHttpRequestMethod
	var FileUploaderHttpRequestMethod = unifiedLibrary.FileUploaderHttpRequestMethod;

	/**
	* Helper function to create a FileUploader with useful default value
	*/
	var createFileUploader = function (mProps) {
		mProps = mProps || {};
		return new FileUploader({
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
	 * @param {object} mProps
	 * @param {boolean} bIsFirefox
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

	QUnit.test("Test enabled property - setter/getter", async function (assert) {
		var oFileUploader = createFileUploader(),
				$fileUploader,
				sDisabledClassName = "sapUiFupDisabled",
				fnTestDisabledClass = function(fileUploader, bExpected) {
					assert.equal(fileUploader.hasClass(sDisabledClassName), bExpected,
							"The FUploader should " + (bExpected ? "" : "not") + " have the " + sDisabledClassName + " class.");
				};

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestDisabledClass($fileUploader, false);
		// prepare
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setEnabled(false);
		await nextUIUpdate();

		// assert
		fnTestDisabledClass($fileUploader, true);
		assert.ok(oAfterRenderingHookSpy.calledOnce, "The enabled property setter causes invalidation");

		// cleanup
		oAfterRenderingHookSpy.restore();

		// act
		oFileUploader.setEnabled(true);
		await nextUIUpdate();
		// assert
		fnTestDisabledClass($fileUploader, false);

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Destroy: cleans the file uploader input filed from static area", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader(),
			oStaticArea = StaticArea.getDomRef();

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		// Trigger invalidation by using a setter,
		// That way before rendering hook will be executed,
		// control won't be rendered, after rendering
		// hook won't be executed and file uploader input
		// field will be left in static area
		oFileUploader.setVisible(false);
		await nextUIUpdate();

		// assert
		assert.ok(oStaticArea.querySelector("[type='file']"), "File uploader input field exits in the static area");
		assert.ok(oFileUploader.FUEl, "File type input element is cached");
		assert.ok(oFileUploader.FUDataEl, "File input data element is cached");

		// act
		oFileUploader.destroy();

		// assert
		assert.notOk(oStaticArea.querySelector("[type='file']"), "File uploader input field is removed from static area");
		assert.notOk(oFileUploader.FUEl, "File type input element reference is null");
		assert.notOk(oFileUploader.FUDataEl, "File input data element reference is null");
	});

	QUnit.test("Test buttonOnly property - setter/getter", async function (assert) {
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
		await nextUIUpdate();
		$fileUploader = oFileUploader.$();

		// assert default
		fnTestButtonOnlyClass($fileUploader, true);

		// act
		oFileUploader.setButtonOnly(false);
		await nextUIUpdate();
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

	QUnit.test("Test mimeType property - setter", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader();

		oFileUploader.placeAt("content");
		await nextUIUpdate();

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				//assert
				assert.equal(document.querySelectorAll("[type='file']").length, 1, "There is only one upload input element");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);

		//act
		oFileUploader.setMimeType(["audio"]);
	});

	QUnit.test("Test multiple property - setter", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader(),
			oInput;

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				oInput = document.querySelector("[type='file']");

				//assert
				assert.strictEqual(oInput.getAttribute("name"), oFileUploader.getId() + "[]", "multiple files expected");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);

		//act
		oFileUploader.setMultiple(true);
	});

	QUnit.test("Test directory property - setter", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader(),
			oInput;

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				oInput = document.querySelector("[type='file']");

				//assert
				assert.strictEqual(oInput.getAttribute("name"), oFileUploader.getId() + "[]", "multiple files expected");
				assert.ok(oInput.hasAttribute("webkitdirectory"), "attribute properly set");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);

		//act
		oFileUploader.setDirectory(true);
	});

	QUnit.test("Setters used on after rendering, don't create additional input field type file", async function (assert) {
		//prepare
		var done = assert.async(),
			oFileUploader = new FileUploader({
				multiple: false
			});

		var oAfterRenderingDelegate = {
			onAfterRendering: function() {
				//act
				oFileUploader.setMultiple(true);

				//assert
				assert.strictEqual(document.querySelectorAll("[type='file']").length, 1, "There is only one input field");

				//clean
				oFileUploader.removeDelegate(oAfterRenderingDelegate);
				oFileUploader.destroy();
				done();
			}
		};

		oFileUploader.addDelegate(oAfterRenderingDelegate);
		oFileUploader.placeAt("content");
		await nextUIUpdate();
	});

	QUnit.test("Test httpRequestMethod property with native form submit", async function (assert) {
		//Setup
		var oFileUploader = new FileUploader();

		//Act
		oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.Put);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(
			oFileUploader.getDomRef().querySelector("form").getAttribute("method"),
			oFileUploader.getHttpRequestMethod().toLowerCase(),
			"Correct method attribute value is set"
		);

		//Clean
		oFileUploader.destroy();
	});

	QUnit.test("Test httpRequestMethod property with XMLHttpRequest", async function (assert) {
		//Setup
		var oFileUploader = createFileUploader(),
			aFiles = {
				"0": createFakeFile({
					name: "FileUploader.qunit.html",
					type: "text/html",
					size: 404450
				}),
				"length" : 1
			},
			oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.Put);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oFileUploader._sendFilesWithXHR(aFiles);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith(FileUploaderHttpRequestMethod.Put), "XHL Http put request is made");

		//Clean
		oFileUploader.destroy();
		oXMLHttpRequestOpenSpy.restore();
	});

	//BCP: 1970125350
	//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	QUnit.test("input has the correct accept attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			mimeType: ["image/png", "image/jpeg"],
			fileType: ["txt", "pdf"]
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".txt,.pdf,image/png,image/jpeg",
			"accept attribute is correct");

		//cleanup
		oFileUploader.destroy();
	});

	//BCP: 2070139852
	QUnit.test("input has the correct accept attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			fileType: ["XML"],
			mimeType: []
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".XML",
			"accept attribute is correct initially");

		oFileUploader.setFileType(["JSON"]);
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("accept"),
			".JSON",
			"accept attribute is correct after using setter");
		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("input has the correct name attribute", async function(assert) {
		//Setup
		var oFileUploader = createFileUploader({
			name: "testNameAttribute"
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("name"),
			"testNameAttribute",
			"name attribute is correct initially");

		oFileUploader.setName("newTestNameAttribute");
		await nextUIUpdate();

		assert.equal(oFileUploader.$().find("input[type='file']").attr("name"),
			"newTestNameAttribute",
			"name attribute is correct after using setter");
		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test valueStateText property - setter/getter", async function (assert) {
		var oFileUploader = createFileUploader(),
			VALUE_STATE_TEXT = "Test";

		//Set up
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert default
		assert.equal(oFileUploader.getValueStateText(), "", "setValueStateText() --> getValueStateText() should return an empty string by default");

		// act
		oFileUploader.setValueStateText(VALUE_STATE_TEXT);
		await nextUIUpdate();

		// assert
		assert.equal(oFileUploader.getValueStateText(), VALUE_STATE_TEXT, "setValueStateText() --> getValueStateText() should return '" + VALUE_STATE_TEXT + "'");
		assert.equal(oFileUploader.oFilePath.getValueStateText(), VALUE_STATE_TEXT, "Child input setValueStateText() --> getValueStateText() should return '" + VALUE_STATE_TEXT + "'");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip", async function (assert) {
		//Set up
		var sTooltip = "this is \"the\" file uploader";
		var oFileUploader = createFileUploader({
			tooltip: "MyFileUploader"
		});


		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.setTooltip(sTooltip);
		await nextUIUpdate();

		// assert
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "FileUploader tooltip is correct");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test setTooltip with none-string tooltip", async function (assert) {
		// Set up
		var oTooltip = new TooltipBase({text: "test"});
		var oFileUploader = createFileUploader({
			tooltip: oTooltip
		});

		// act
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert (only tooltip type of string are added via the 'title' attribute)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), oFileUploader._getNoFileChosenText(), "The title attribute is set to default 'no file chosen' value");
		assert.equal(oFileUploader.$().find(".sapUiFupInputMask")[0].getAttribute("title"), null, "The title attribute is not set");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test associated label interaction", async function (assert) {
		//Set up
		var oFileUploader = createFileUploader({}),
			oSpy,
			FUEl;

		// override onclick handler to prevent file dialog opening, causing the test execution to stop
		oFileUploader.onclick = function (oEvent) {
			oEvent.preventDefault();
		};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		//act
		FUEl = oFileUploader.getDomRef("fu");
		oSpy = this.spy(FUEl, "click");
		qutils.triggerEvent("click", oFileUploader.oBrowse.getId());

		// assert
		assert.strictEqual(oSpy.callCount, 1, "Clicking on browse button should trigger click on the input");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Externally referenced label interaction", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader("uploader"),
			oLabel = new Label({labelFor: "uploader", text: "label"}),
			oClickEvent = new MouseEvent("click", {bubbles: true, cancelable: true}),
			oBrowseClickSpy;

		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oBrowseClickSpy = this.spy(oFileUploader.getDomRef("fu"), "click");

		// act
		oLabel.getDomRef().dispatchEvent(oClickEvent);

		// assert
		assert.ok(oBrowseClickSpy.calledOnce, "The browse button gets activated");

		// clean
		oLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("dependency of submit and rendering", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader().placeAt("qunit-fixture");

		await nextUIUpdate();

		// act
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRendering, false, "The submit is performed without a dependency of the rendering.");

		// act
		oFileUploader.setUploadUrl("test");
		oFileUploader.upload();

		// assert
		assert.strictEqual(oFileUploader._submitAfterRendering, true, "The submit is performed after there is rendering caused by setter of uploadUrl.");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("'uploadStart' event is fired with native form submit", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader({ uploadUrl: "test" }).placeAt("qunit-fixture"),
			oFireUploadStartSpy = this.spy(oFileUploader, "fireUploadStart");

		await nextUIUpdate();

		// act
		oFileUploader.upload();

		// assert
		assert.ok(oFireUploadStartSpy.calledOnce, "'uploadStart' event is fired.");

		// cleanup
		oFileUploader.destroy();
		oFireUploadStartSpy.restore();
	});

	QUnit.test("'fireBeforeOpen', 'fileAfterClose' are properly called", async function (assert) {
		// arrange
		var oFileUploader = new FileUploader().placeAt("content"),
			oFireBeforeDialogOpenSpy = this.spy(oFileUploader, "fireBeforeDialogOpen"),
			oFireAfterDialogCloseSpy = this.spy(oFileUploader, "fireAfterDialogClose"),
			oInputElement = document.createElement("input"),
			oFakeEvent = {};

		await nextUIUpdate();
		oInputElement.setAttribute("type", "file");
		oFakeEvent.target = oInputElement;

		// act
		oFileUploader.onclick(oFakeEvent);

		// assert
		assert.ok(oFireBeforeDialogOpenSpy.calledOnce, "'fireBeforeDialogOpen' event called once");

		// act
		document.body.onfocus();

		// assert
		assert.ok(oFireAfterDialogCloseSpy.calledOnce, "'fireAfterDialogClose' event called once");

		// cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Test valueState property - setter", async function (assert) {
		//prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setValueState("Error");
		await nextUIUpdate();

		// assert
		assert.ok(oAfterRenderingHookSpy.calledOnce, "ValueState stter causes invalidation");

		// clean
		oFileUploader.destroy();
		oAfterRenderingHookSpy.restore();
	});

	QUnit.test("Test valueStateText property - setter", async function (assert) {
		//prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oAfterRenderingHookSpy = this.spy(oFileUploader, "onAfterRendering");

		// act
		oFileUploader.setValueStateText("Error text");
		await nextUIUpdate();

		// assert
		assert.ok(oAfterRenderingHookSpy.calledOnce, "ValueStateText stter causes invalidation");

		// clean
		oFileUploader.destroy();
		oAfterRenderingHookSpy.restore();
	});

	QUnit.module("'title' attribute of the internal <input type='file'>");
	QUnit.test("Test 'title' attribute in different scenarios", async function (assert){
		var oFileUploader = new FileUploader(),
			sDefaultTitle = oFileUploader._getNoFileChosenText(),
			sFileName = "test.txt",
			sTooltip = "My tooltip";

		// act
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert (default 'no file chosen' text must be added as 'title' attribute if there is no file chosen and no tooltip set)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sDefaultTitle, "The title attribute is set to default 'no file chosen' value");

		// act
		oFileUploader.setValue(sFileName);

		// assert (file name passed as value must be added as 'title' attribute if there is no tooltip set)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sFileName, "The title attribute is set to file name passed as value");

		// act
		oFileUploader.setTooltip(sTooltip);

		// assert (passed tooltip must be added as 'title' attribute no matter if there is value set or not)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "The title attribute is set to passed tooltip when there is value set");

		// act
		oFileUploader.setValue("");

		// assert (passed tooltip must be added as 'title' attribute no matter if there is value set or not)
		assert.equal(oFileUploader.oFileUpload.getAttribute("title"), sTooltip, "The title attribute is set to passed tooltip when there is no value set");

		oFileUploader.destroy();
	});

	QUnit.test("dependency of submit and rendering", async function (assert) {
		// arrange
		var done = assert.async(),
			oFileUploader = new FileUploader(),
			oAfterRenderingDelegate = {
				onAfterRendering: function() {
					// act
					oFileUploader.setEnabled(null);

					// assert
					assert.notOk(oFileUploader.FUEl.getAttribute("disabled"), "File uploader is enabled");

					// clean
					oFileUploader.removeDelegate(oAfterRenderingDelegate);
					oFileUploader.destroy();
					done();
				}
			};

		oFileUploader.addDelegate(oAfterRenderingDelegate);
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("File validation");
	QUnit.test("Test file type validation - handlechange()", async function (assert){
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
		await nextUIUpdate();


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

		assert.equal(oFileAllowedSpy.callCount, 1, "fileAllowed Event should be called exactly ONCE");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Unknown mime types doesn't block file from uploading", async function (assert) {
		// prepare
		var oFileUploader = new FileUploader({
				uploadUrl: "/upload",
				mimeType: ["image/png", "image/jpeg"],
				fileType: ["msg", "jpeg", "png"]
			}),
			fakeEvent = {
				type: "change",
				target: {
					files : {
						"0": createFakeFile({
								name: "test.msg",
								type: "unknown",
								size: 404450
							}),
						"length" : 1
					}
				}
			},
			oFileAllowedSpy = this.spy(oFileUploader, "fireFileAllowed");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		oFileUploader.handlechange(fakeEvent);

		// assert
		assert.ok(oFileAllowedSpy.calledOnce, "File upload is allowed");

		// clean
		oFileUploader.destroy();
	});

	QUnit.test("Testing the filename lenth validation handling - handlechange()", async function (assert) {
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
		await nextUIUpdate();

		oFileUploader.attachEvent("filenameLengthExceed", fnFilenameLengthExceedHandler);

		oFileUploader.handlechange(fakeEvent);
		assert.equal(oSpy.callCount, 1, "filenameLengthExceed Event should be called exactly ONCE");

		//cleanup
		oFileUploader.destroy();
	});


	QUnit.test("Testing the clearing of the input fields - clear()", async function (assert) {
		//setup
		var oFileUploader = createFileUploader(),
			oSpy = this.spy(oFileUploader, "setValue"),
			domFileInputField;

		//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader.setValue("Testfilename.txt");
		assert.equal(oFileUploader.getValue(), "Testfilename.txt", "Check if filename is set correctly");
		assert.equal(oSpy.callCount, 1, "setValue was called ONCE");

		//clearing the FUP
		oFileUploader.clear();
		assert.equal(oFileUploader.getValue(), "", "Value should be empty string: ''");

		//check if the text fields are empty as expected
		domFileInputField = oFileUploader.getDomRef("fu");
		assert.equal(domFileInputField.value, "", "File-Input TextField should be empty now");
		assert.equal(oSpy.callCount, 2, "setValue should now be called TWICE");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Empty file event is fired", async function (assert){
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
		await nextUIUpdate();

		oFileUploader.handlechange(oTestEvent);
		assert.equal(fnFireFileEmpty.calledOnce, true, "Event on empty file upload is fired.");

		//Clean up
		oFileUploader.destroy();
	});

	/**
	 * Test private functions
	 */
	QUnit.module("private functions");
	QUnit.test("Testing sending passed files with XHR", async function (assert) {
		var oFileUploader = createFileUploader(),
			bIsExecutedInFireFox = Device.browser.firefox,
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
		await nextUIUpdate();

		oFileUploader._sendFilesWithXHR(aFiles);

		assert.ok(oSpy.called, "XHR request is made");

		//cleanup
		oFileUploader.destroy();
	});

	QUnit.test("BCP: 1770523801 - FormData.append called with third argument fails under Safari browser if passed file " +
			"is not a Blob", async function (assert) {
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
		await nextUIUpdate();

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
		oAppendSpy.resetHistory();
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

	QUnit.test("Change event listener is reattached to the rerendered inner input field", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader(),
			oChangeHandlerSpy = this.spy(oFileUploader, "handlechange"),
			oCacheDOMEls;
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		oCacheDOMEls = this.spy(oFileUploader, "_cacheDOMEls");

		// act
		oFileUploader.setMultiple(false);
		oFileUploader.oFileUpload.dispatchEvent(createNewEvent("change"));

		// assert
		assert.ok(oChangeHandlerSpy.calledOnce, "Change handler is attached");
		assert.ok(oCacheDOMEls.calledOnce, "Elements are cached");

		// clean
		oFileUploader.destroy();
	});

	QUnit.test("setEnabled will call _resizeDomElements after input is re-rendered", async function (assert) {
		// setup
		var oFileUploader = createFileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// act
		var oResizeDomElementsSpy = this.spy(oFileUploader, "_resizeDomElements");
		oFileUploader["setEnabled"](false);
		await nextUIUpdate(this.clock);

		// assert
		assert.equal(oResizeDomElementsSpy.callCount, 2, "_resizeDomElements should be called once when input is re-rendered");

		// cleanup
		oResizeDomElementsSpy.restore();
		oFileUploader.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("setPlaceholder will call _resizeDomElements after input is re-rendered", async function (assert) {
		// setup
		var oFileUploader = createFileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act
		var oResizeDomElementsSpy = this.spy(oFileUploader, "_resizeDomElements");
		oFileUploader["setPlaceholder"]("placeholder");
		await nextUIUpdate();

		// assert
		assert.equal(oResizeDomElementsSpy.callCount, 2, "_resizeDomElements should be called once when input is re-rendered");

		// cleanup
		oResizeDomElementsSpy.restore();
		oFileUploader.destroy();
		await nextUIUpdate();
	});


	QUnit.test("Drop file over the browse button", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oEventParams = {
			originalEvent: {
				dataTransfer: {
					files: new DataTransfer().files
				}
			},
			preventDefault: () => {},
			stopPropagation: () => {}
		};
		var oHandleChangeSpy = this.spy(oFileUploader, "handlechange");
		var oPreventDefaultSpy = this.spy(oEventParams, "preventDefault");
		var oStopPropagationSpy = this.spy(oEventParams, "stopPropagation");

		// act
		qutils.triggerEvent("drop", oFileUploader.oBrowse.getId(), oEventParams);

		// assert
		assert.ok(oPreventDefaultSpy.calledOnce, "The default is prevented");
		assert.ok(oStopPropagationSpy.calledOnce, "The default is prevented");
		assert.ok(oHandleChangeSpy.calledOnce, "Change event is triggered");

		// clean
		oFileUploader.destroy();
		oHandleChangeSpy.restore();
		oPreventDefaultSpy.restore();
	});

	QUnit.test("Input type file element has the proper events registered", async function(assert) {
		// prepare
		var oFileUploader = new FileUploader();
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oEvents = jQuery._data(oFileUploader.oBrowse.getDomRef(), "events");
		// assert
		assert.ok(oEvents.mouseover, "mouseover registed");
		assert.strictEqual(oEvents.mouseover.length, 1, "mouseover registed once");
		assert.ok(oEvents.click, "click registed");
		assert.strictEqual(oEvents.click.length, 1, "click registed once");
		assert.ok(oEvents.dragover, "dragover registed");
		assert.strictEqual(oEvents.dragover.length, 1, "dragover registed once");
		assert.ok(oEvents.dragenter, "dragenter registed");
		assert.strictEqual(oEvents.dragenter.length, 1, "dragenter registed once");
		assert.ok(oEvents.drop, "drop registed");
		assert.strictEqual(oEvents.drop.length, 1, "drop registed once");

		// clean
		oFileUploader.destroy();
	});

	QUnit.module("BlindLayer", {
		beforeEach: async function() {
			this.oFileUploader = createFileUploader();

			//explicit place the FileUploader somewhere, otherwise there are some internal objects missing!
			this.oFileUploader.placeAt("qunit-fixture");
			await nextUIUpdate();
		},

		afterEach: function() {
			this.oFileUploader.destroy();
		}
	});

	QUnit.test("Check if BlindLayer is in DOM", function(assert) {
		var $Frame = this.oFileUploader.$("frame");

		var oParentRef = $Frame.parent().get(0);
		var oStatic = StaticArea.getDomRef();

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

	QUnit.test("getFocusDomRef returns the proper element", function(assert) {

		// assert
		assert.strictEqual(
			this.oFileUploader.getFocusDomRef().id,
			this.oFileUploader.oBrowse.getId(),
			"Browse button returned"
		);
	});

	QUnit.module("Keyboard handling");

	QUnit.test("ESCAPE key propagation", async function (assert) {
		var oFileUploader = createFileUploader(),
			oMockEscapePress = {
				keyCode: 27,
				stopPropagation: function() {},
				preventDefault: function () {}
			},
			stopPropagationSpy = this.spy(oMockEscapePress, "stopPropagation");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oFileUploader.onkeydown(oMockEscapePress);

		assert.strictEqual(stopPropagationSpy.callCount, 0, "stopPropagation shouldn't be fired on ESCAPE key press");

		oFileUploader.destroy();
	});

	QUnit.test("Browse logic is fired correctly", async function (assert) {
		// Prepare
		var oFileUploader = createFileUploader().placeAt("qunit-fixture"),
			oFakeEvent = {
				keyCode: 32, // space
				stopPropagation: function() {},
				preventDefault: function () {}
			},
			oClickSpy;

		await nextUIUpdate();
		oClickSpy = this.spy(oFileUploader.oFileUpload, "click");

		// Act
		oFileUploader.onkeydown(oFakeEvent);
		oFileUploader.onkeyup(oFakeEvent);

		// Assert
		assert.strictEqual(oClickSpy.callCount, 1, "SPACE key executes click on the browse button on key up");

		//Prepare
		oFakeEvent.keyCode = 13; // enter

		// Act
		oFileUploader.onkeydown(oFakeEvent);
		oFileUploader.onkeyup(oFakeEvent);

		// Assert
		assert.strictEqual(oClickSpy.callCount, 2, "ENTER key executes click on the browse button on key down");

		// Clean
		oFileUploader.destroy();
	});

	QUnit.test("prototype.openFilePicker", async function(assert) {
		// Prepare
		var oFU = new FileUploader();
		oFU.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oElementClickSpy = this.spy(oFU.getInputReference(), "click");

		// Act
		oFU.openFilePicker();

		// Assert
		assert.ok(oElementClickSpy.calledOnce, "File picker is opened.");

		// Clean
		oFU.destroy();
	});

	QUnit.test("prototype.getInputReference", async function(assert) {
		// Prepare
		var oFU = new FileUploader();
		oFU.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		// Assert
		assert.deepEqual(oFU.getInputReference(), oFU.getDomRef().querySelector("[type='file']"), "Proper input reference gets returned");

		// Clean
		oFU.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("AriaLabelledBy", async function(assert) {
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
		await nextUIUpdate();

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

	QUnit.test("Label is redirected to internal button", async function (assert) {
		// setup
		var sInternalButtonAriaLabelledby,
			oLabel = new Label("newLabel", {
				text: "Select Document",
				labelFor: "fu"
			}),
			oFileUploader = new FileUploader("fu");

		// act
		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		sInternalButtonAriaLabelledby = oFileUploader.oBrowse.$().attr("aria-labelledby");

		// assert
		assert.ok(sInternalButtonAriaLabelledby.indexOf("newLabel") !== -1, "Internal button has reference to the newly created label");

		// cleanup
		oLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("Label added dynamicaly", async function (assert) {
		// setup
		var oNewLabel,
			sInternalButtonAriaLabelledby,
			oLabel = new Label("initialLabel", {
				text: "Select Document",
				labelFor: "fu"
			}),
			oFileUploader = new FileUploader("fu");

		// act
		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oNewLabel = new Label("newLabel", { labelFor: "fu" });

		oNewLabel.placeAt("content");
		await nextUIUpdate();

		sInternalButtonAriaLabelledby = oFileUploader.oBrowse.$().attr("aria-labelledby");

		// assert
		assert.ok(sInternalButtonAriaLabelledby.indexOf("initialLabel") !== -1, "Internal button has reference to the initialy created label");
		assert.ok(sInternalButtonAriaLabelledby.indexOf("newLabel") !== -1, "Internal button has reference to the newly created label");

		// cleanup
		oLabel.destroy();
		oNewLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("Browse button tooltip", async function(assert) {
		var oFileUploader = new FileUploader({
			buttonText: "Something"
		});

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oFileUploader.oBrowse.getTooltip(), "It shouldn't have one while FileUploader has text");

		oFileUploader.setIconOnly(true);
		oFileUploader.setIcon("sap-icon://add");
		await nextUIUpdate();

		assert.strictEqual(oFileUploader.oBrowse.getTooltip(), oFileUploader.getBrowseText(),
				"Once FileUploader becomes icon-only, then it should contain just the 'Browse...' text");

		oFileUploader.destroy();
	});

	QUnit.test("Description for default FileUploader", async function (assert) {
		// Setup
		var oFileUploader = new FileUploader("fu"),
			oRB = Library.getResourceBundleFor("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var $description = oFileUploader.$().find("#fu-AccDescr");
		assert.strictEqual($description.text(), oRB.getText("FILEUPLOAD_ACC"), "Description contains information just for activating.");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader with tooltip and placeholder", async function (assert) {
		// Setup
		var oFileUploader = new FileUploader("fu", {
				tooltip: "the-tooltip",
				placeholder: "the-placeholder"
			}),
			oRB = Library.getResourceBundleFor("sap.ui.unified");

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var sDescriptionText = oFileUploader.$().find("#fu-AccDescr").text();
		assert.ok(sDescriptionText.indexOf(oRB.getText("FILEUPLOAD_ACC")) !== -1, "Activation information is placed in the description");
		assert.ok(sDescriptionText.indexOf("the-tooltip") !== -1, "FileUploader's tooltip is in the description");
		assert.ok(sDescriptionText.indexOf("the-placeholder") !== -1, "FileUploader's placeholder is in the description");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader after tooltip update", async function (assert) {
		// Setup
		var sInitialTooltip = "initial-tooltip",
			sUpdatedTooltip = "updated-tooltip",
			oFileUploader = new FileUploader("fu", {
				tooltip: sInitialTooltip
			}),
			sAccDescription;

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oFileUploader.setTooltip(sUpdatedTooltip);
		await nextUIUpdate();

		// Assert
		sAccDescription = document.getElementById("fu-AccDescr").innerHTML;
		assert.ok(sAccDescription.indexOf(sInitialTooltip) === -1, "FileUploader's initial tooltip isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedTooltip) !== -1, "FileUploader's updated tooltip is in the description");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for FileUploader after placeholder update", async function (assert) {
		// Setup
		var sInitialPlaceholder = "initial-placeholder",
			sUpdatedPlaceholder = "updated-placeholder",
			oFileUploader = new FileUploader("fu", {
				placeholder: sInitialPlaceholder
			}),
			sAccDescription;

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oFileUploader.setPlaceholder(sUpdatedPlaceholder);
		await nextUIUpdate();

		// Assert
		sAccDescription = document.getElementById("fu-AccDescr").innerHTML;
		assert.ok(sAccDescription.indexOf(sInitialPlaceholder) === -1, "FileUploader's initial placeholder isn't in the description");
		assert.ok(sAccDescription.indexOf(sUpdatedPlaceholder) !== -1, "FileUploader's updated placeholder is in the description");

		// Cleanup
		oFileUploader.destroy();
	});

	QUnit.test("Description for required FileUploader", async function (assert) {
		// Setup
		var oLabel = new Label({ text: "Label", labelFor: "fu", required: true }),
			oFileUploader = new FileUploader("fu"),
			sRequiredText = Library.getResourceBundleFor("sap.ui.unified").getText("FILEUPLOAD_REQUIRED");

		oLabel.placeAt("qunit-fixture");
		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var $description = oFileUploader.$().find("#fu-AccDescr");
		assert.ok($description.text().indexOf(sRequiredText) !== -1, "Word Required is added in the description");

		// Cleanup
		oLabel.destroy();
		oFileUploader.destroy();
	});

	QUnit.test("Internal hidden label for the Input", async function (assert) {
		var oFileUploader = new FileUploader(),
			sExpectedLabelId = InvisibleText.getStaticId("sap.ui.unified", "FILEUPLOAD_FILENAME"),
			aInputLabels;

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();

		aInputLabels = oFileUploader.oFilePath.getAriaLabelledBy();
		assert.strictEqual(aInputLabels[0], sExpectedLabelId, "A hidden label is added to FileUploader's input");

		oFileUploader.destroy();
	});

	QUnit.test("Click focuses the fileuploader button", async function (assert) {
		//Arrange
		this.stub(Device, "browser").value({"safari": true});
		var oFileUploader = new FileUploader("fu"),
			oSpy = this.spy(oFileUploader.oBrowse, "focus"),
			oFakeEvent = {};

		oFileUploader.placeAt("qunit-fixture");
		await nextUIUpdate();
		oFakeEvent.target = oFileUploader.getDomRef();

		//Act
		oFileUploader.onclick(oFakeEvent);

		//Assert
		assert.strictEqual(oSpy.callCount, 1, "Clicking on browse button should focus the button in safari");

		//Clean
		oFileUploader.destroy();
	});

	QUnit.test("External label reference", function(assert) {
		// setup
		var oFileUploader = new FileUploader("fu");

		// assert
		assert.strictEqual(oFileUploader.getIdForLabel(), "fu", "The file uploader id is used for external label references");
	});

	//IE has no Event constructor
	function createNewEvent(eventName) {
		var oEvent;
		if (typeof (Event) === 'function') {
			oEvent = new Event(eventName);
		} else {
			oEvent = document.createEvent('Event');
			oEvent.initEvent(eventName, true, true);
		}
		return oEvent;
	}
});