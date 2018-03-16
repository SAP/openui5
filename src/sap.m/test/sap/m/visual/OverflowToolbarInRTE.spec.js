/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.OverflowToolbarInRTE", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.richtexteditor.RichTextEditor';

	function interactWithButtons(sButtonId, sScreenShotId) {
		// Act
		element(by.id(sButtonId)).click();

		// Screenshot
		expect(takeScreenshot()).toLookAs("OverflowToolbarRTE-" + sScreenShotId);

		//Cleanup
		element(by.id(sButtonId)).click();
	}

	it("OverflowToolar initial rendering", function () {
		expect(takeScreenshot()).toLookAs("overflowToolbarRTE-initial-rendering");
	});

	it("Interaction with Bold", function () {
		interactWithButtons("myRTE__wrapper0-Bold", "Bold");
	});

	it("Interaction with Italic", function () {
		interactWithButtons("myRTE__wrapper0-Italic", "Italic");
	});

	it("Interaction with Underline", function () {
		interactWithButtons("myRTE__wrapper0-Underline", "Underline");
	});

	it("Interaction with Strikethrough", function () {
		interactWithButtons("myRTE__wrapper0-Strikethrough", "Strikethrough");
	});

	it("Interaction with TextColor", function () {
		interactWithButtons("myRTE__wrapper0-TextColor", "TextColor");
	});

	it("Interaction with BackgroundColor", function () {
		interactWithButtons("myRTE__wrapper0-BackgroundColor", "BackgroundColor");
	});

	it("Interaction with UnorderedList", function () {
		interactWithButtons("myRTE__wrapper0-UnorderedList", "UnorderedList");
	});

	it("Interaction with OrderedList", function () {
		interactWithButtons("myRTE__wrapper0-OrderedList", "OrderedList");
	});

	it("Interaction with Outdent", function () {
		interactWithButtons("myRTE__wrapper0-Outdent", "Outdent");
	});

	it("Interaction with Indent", function () {
		interactWithButtons("myRTE__wrapper0-Indent", "Indent");
	});

	it("Interaction with InsertLink", function () {
		interactWithButtons("myRTE__wrapper0-InsertLink", "InsertLink");

		//Cleanup
		element(by.id("myRTE__wrapper0-CancelInsertLinkButton")).click();
	});

	it("Interaction with InsertImage", function () {
		interactWithButtons("myRTE__wrapper0-InsertImage", "InsertImage");

		//Cleanup
		element(by.id("myRTE__wrapper0-CancelInsertImageButton")).click();
	});

	it("Interaction with Undo", function () {
		interactWithButtons("myRTE__wrapper0-Undo", "Undo");
	});

	it("Interaction with Redo", function () {
		interactWithButtons("myRTE__wrapper0-Redo", "Redo");
	});

	it("Interaction with Custom Button", function () {
		interactWithButtons("my-custom-button", "CustomButton");
	});
});