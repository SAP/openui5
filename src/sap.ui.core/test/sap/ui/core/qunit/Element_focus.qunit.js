/*global QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Input",
	"sap/m/Panel"
], function(BusyIndicator, Button, Dialog, createAndAppendDiv, nextUIUpdate, Input, Panel) {
	"use strict";

	QUnit.module("Focus Issue");

	/**
	 * Opens A Dialog, then opens a BusyIndicator (which remembers the last focused element which is in the Dialog).
	 * Then this closes the Dialog again, which removes the focused element.
	 * Then closes the BusyIndicator which tries to focus the element in the Dialog again.
	 * This effectively tests the fix (checking whether the element is still there) for this issue.
	 */
	QUnit.test("Focus a missing element (actual incident testcase)", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var oDialog = new Dialog({
			title : "Some Title",
			buttons : [new Button({text:"OK"})]
		});

		oDialog.open();

		setTimeout(function() {
			BusyIndicator.show(0);
			oDialog.close();

			setTimeout(function() {
				BusyIndicator.hide();
				assert.ok(true, "when this checkpoint is reached, the test is passed");
				done();
			}, 600);
		}, 600);
	});

	QUnit.module("Focus with preventScroll");

	QUnit.test("Focus an element with preventScroll should NOT cause scrolling", async function(assert) {
		var oContainerElement = createAndAppendDiv("scroll_container");
		oContainerElement.style.overflow = "scroll";
		oContainerElement.style.height = "400px";
		createAndAppendDiv("input_uiarea", oContainerElement);
		createAndAppendDiv("large_content", oContainerElement).style.height = "3000px";
		var oInputAtEnd = document.createElement("input");
		oContainerElement.appendChild(oInputAtEnd);

		var oInput = new Input();
		oInput.placeAt("input_uiarea");
		await nextUIUpdate();

		oInputAtEnd.scrollIntoView();

		var iScrollY = oContainerElement.scrollTop;
		assert.ok(iScrollY > 0,
			"Setting the focus to the last input element should already have caused scrolling in the container");

		// act
		oInput.focus({
			preventScroll: true
		});

		var done = assert.async();
		setTimeout(function() {
			assert.equal(oContainerElement.scrollTop, iScrollY, "The vertical scroll position of the container isn't changed");

			// cleanup
			oInput.destroy();
			oContainerElement.remove();
			done();
		}, 0);
	});

	QUnit.module("#isFocusable");

	QUnit.test("Element isn't focusable when it's invisible", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		oInput.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		oInput.setVisible(false);
		await nextUIUpdate();

		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because it's invisible");

		oInput.destroy();
		oUIArea.remove();
	});

	QUnit.test("Element isn't focusable when it's busy", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		oInput.setBusyIndicatorDelay(0);
		oInput.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(oInput.isFocusable(), "The input control should now be focusable");


		oInput.setBusy(true);
		await nextUIUpdate();

		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because it's busy");

		oInput.destroy();
		oUIArea.remove();
	});

	/**
	 * @deprecated As of 1.69
	 */
	QUnit.test("Element isn't focusable when it's blocked", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		oInput.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		oInput.setBlocked(true);
		await nextUIUpdate();

		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because it's blocked");

		oInput.destroy();
		oUIArea.remove();
	});

	QUnit.test("Element isn't focusable when its parent is busy", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		var oPanel = new Panel({
			content: oInput
		});
		oPanel.setBusyIndicatorDelay(0);
		oPanel.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(!oPanel.isFocusable(), "Panel doesn't have focusable DOM element");
		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		oPanel.setBusy(true);
		await nextUIUpdate();

		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because its parent is busy");

		oPanel.destroy();
		oUIArea.remove();
	});

	/**
	 * @deprecated As of 1.69
	 */
	QUnit.test("Element isn't focusable when its parent is blocked", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		var oPanel = new Panel({
			content: oInput
		});
		oPanel.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(!oPanel.isFocusable(), "Panel doesn't have focusable DOM element");
		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		oPanel.setBlocked(true);
		await nextUIUpdate();

		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because its parent is busy");

		oPanel.destroy();
		oUIArea.remove();
	});

	QUnit.test("Element isn't focusable when global BusyIndicator is open", async function(assert) {
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		oInput.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		BusyIndicator.show(0);
		assert.ok(!oInput.isFocusable(), "The input control should be not focusable because it's blocked");

		BusyIndicator.hide();
		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		oInput.destroy();
		oUIArea.remove();
	});

	QUnit.test("Element isn't focusable when modal Popup is open", async function(assert) {
		var done = assert.async();
		var oUIArea = createAndAppendDiv("uiarea_focus");

		var oInput = new Input();
		oInput.placeAt("uiarea_focus");
		await nextUIUpdate();

		assert.ok(oInput.isFocusable(), "The input control should now be focusable");

		var oDialog = new Dialog();
		oDialog.attachAfterOpen(function() {
			assert.ok(!oInput.isFocusable(), "The input control should be not focusable because modal popup is open");

			oDialog.destroy();
			oInput.destroy();
			oUIArea.remove();
			done();
		});

		oDialog.open();
	});

	QUnit.test("Element is focusable when modal Popup is open and it's in the modal popup", function(assert) {
		var done = assert.async();
		var oInput = new Input();
		var oDialog = new Dialog({
			content: oInput
		});

		oDialog.attachAfterOpen(function() {
			assert.ok(oInput.isFocusable(), "The input control should now be focusable");

			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				done();
			});

			oDialog.close();
		});

		oDialog.open();
	});

	QUnit.test("Element is focusable even when it's covered due to scrolling", async function(assert) {
		var done = assert.async();
		var sContent =
			"<div style='overflow-y: scroll; height: 400px; position:relative'>" +
				"<div style='position: fixed; height: 100px; width: 100%'></div>" +
				"<div id='uiarea11'></div>" +
				"<div style='height: 3000px; margin-top: 100px'></div>" +
				"<input id='input11' />" +
			"</div>";

		var oContainerDOM = createAndAppendDiv("container");
		oContainerDOM.innerHTML = sContent;

		var oInput = new Input();
		oInput.placeAt("uiarea11");
		await nextUIUpdate();

		// focus the last <input> causes the "uiarea11" to scorlled out of the view port
		document.getElementById("input11").focus();

		assert.ok(oInput.isFocusable(), "Input control is still focusable");

		var oDialog = new Dialog({ });

		oDialog.attachAfterOpen(function() {
			assert.notOk(oInput.isFocusable(), "The input control isn't focusable because it's blocked by the block layer");

			oDialog.attachAfterClose(function() {
				oDialog.destroy();
				oInput.destroy();
				oContainerDOM.remove();
				done();
			});

			oDialog.close();
		});

		oDialog.open();
	});
});
