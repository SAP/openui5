/*global QUnit */
sap.ui.define([
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Element",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/Input",
	"sap/m/Panel",
	"sap/m/Text"
], function(BusyIndicator, Element, Button, Dialog, Popover, createAndAppendDiv, nextUIUpdate, Input, Panel, Text) {
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

	QUnit.module("Focus handling");

	QUnit.test("Focus correct when current element get's disabled", async function(assert) {
		createAndAppendDiv("uiarea_focus");

		const oButton1 = new Button();
		const oButton2 = new Button({
			id: "btn_2"
		});
		const oButton3 = new Button({
			press: function() {
				this.setEnabled(false);
				oButton2.focus();
			}
		});
		const oButton4 = new Button();

		const oPanel = new Panel({
			content: [oButton1, oButton2, oButton3, oButton4]
		});

		oPanel.placeAt("uiarea_focus");
		await nextUIUpdate();

		oButton1.focus();
		assert.ok(oButton1.getDomRef() === document.activeElement, "Initially, oButton1 should be focused");

		oButton1.setEnabled(false);
		await nextUIUpdate();

		assert.ok(oButton2.getDomRef() === document.activeElement, "After oButton1 has been disabled, the focus should be moved correctly on oButton2");

		oButton3.firePress();
		await nextUIUpdate();
		assert.ok(oButton2.getDomRef() === document.activeElement, "After oButton3 has been pressed, the focus should be moved correctly on oButton2 by the focus call of the press handler");

		oButton2.setEnabled(false);
		await nextUIUpdate();

		assert.ok(oButton4.getDomRef().contains(document.activeElement), "After oButton2 has been disabled, the focus is moved to oButton4 since it is the only left.");

		oButton4.setEnabled(false);
		await nextUIUpdate();

		assert.ok(document.activeElement === document.body, "After all buttons have been disabled, the focus is moved to the document.body.");
		oPanel.destroy();
	});


	QUnit.test("Focus correct when current element get's invisible", async function(assert) {
		createAndAppendDiv("uiarea_focus");

		const oButton1 = new Button();
		const oButton2 = new Button();
		const oPanel = new Panel({
			content: [oButton1, oButton2]
		});

		oPanel.placeAt("uiarea_focus");
		await nextUIUpdate();

		oButton1.focus();
		assert.ok(oButton1.getDomRef() === document.activeElement, "Initially, oButton1 should be focused");

		oButton1.setVisible(false);
		await nextUIUpdate();

		assert.ok(oButton2.getDomRef() === document.activeElement, "After oButton1 has been hidden, the focus should be moved correctly on oButton2");

		oButton2.setVisible(false);
		await nextUIUpdate();

		assert.ok(document.activeElement === document.body, "After both buttons have been hidden, the focus is moved to the document.body");
		oPanel.destroy();
	});

	QUnit.test("Popover, Dialog", async function(assert) {
		const done = assert.async();

		createAndAppendDiv("uiarea_focus");

		const oBtn_inside_dialog = new Button({
			text: "Close Dialog",
			id: "btn_inside_dialog",
			press: function() {
				oDialog.close(0);
			}
		});

		const oBtn_inside_popover = new Button({
			id: "btn_inside_popover",
			text: "Open Dialog",
			press: function() {
				oDialog ??= new Dialog({
					content: oBtn_inside_dialog
				});

				oPanel.addDependent(oDialog);

				oDialog.attachAfterOpen(function() {
					assert.ok(oDialog.getDomRef().contains(document.activeElement), "After the dialog opens, the focus should be moved inside.");
					oBtn_inside_dialog.firePress();
				});

				oDialog.attachAfterClose(function() {
					setTimeout(() => {
						// Explanation:
						// After the dialog closes, it attempts to restore focus to the button inside the popover that was focused previously.
						// However, since the popover is already closed, the focus is expected to shift to the next element in the parent’s content hierarchy, which is the initial button.
						assert.ok(oBtn_openPopover.getDomRef().contains(document.activeElement), "After the dialog closes, the focus should be moved onto oBtn_openPopover.");
						oPanel.destroy();
						done();
					}, 100);
				});

				oDialog.open();
			}
		});

		const oBtn_openPopover = new Button({
			id: "btn_to_open_popover",
			text: "Open popver",
			press: function() {
				const oPopover = new Popover({
					placement: "Bottom",
					initialFocus: "btn_inside_popover",
					footer: [oBtn_inside_popover]

				});

				oPanel.addDependent(oPopover);

				oPopover.attachAfterOpen(function() {
					assert.ok(oPopover.getDomRef().contains(document.activeElement), "After the popover opens, the focus should be moved inside.");
					oBtn_inside_popover.firePress();
				});

				oPopover.openBy(oBtn_openPopover);
			}
		});

		let oDialog;
		const oPanel = new Panel({
			content: [oBtn_openPopover]
		}).placeAt("uiarea_focus");

		await nextUIUpdate();

		// test start, open popover
		oBtn_openPopover.firePress();
	});

	QUnit.test("Event 'FocusFail' shouldn't be fired when the control isn't focusable but the current focus is within the control", async function(assert) {
		const oUIArea = createAndAppendDiv("uiarea_focus");

		const oPanel = new Panel({
			expandable: true,
			headerText: "Panel with a header text",
			width: "auto",
			content: new Text({
				text: "Lorem ipsum dolor st amet"
			})
		});

		oPanel.placeAt("uiarea_focus");
		await nextUIUpdate();

		const oDomRef = oPanel.getDomRef();
		const oFocusableDom = oDomRef.querySelector("[tabindex='0']");
		oFocusableDom.focus();

		const oSpy = this.spy(Element, "fireFocusFail");

		oPanel.invalidate();
		await nextUIUpdate();

		assert.equal(oSpy.callCount, 0, "fireFocusFail isn't called");

		return new Promise((resolve, reject) => {
			setTimeout(() => {
				assert.ok(oDomRef.contains(document.activeElement), "Panel still has the focus");

				oPanel.destroy();
				oUIArea.remove();

				resolve();
			}, 0);
		});
	});
});
