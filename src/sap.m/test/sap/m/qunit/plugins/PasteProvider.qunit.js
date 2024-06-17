sap.ui.define([
	"sap/m/Button",
	"sap/m/Table",
	"sap/m/OverflowToolbarButton",
	"sap/m/plugins/PasteProvider",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Button, Table, OverflowToolbarButton, PasteProvider, Device, Element, Library, ShortcutHintsMixin, nextUIUpdate) {

	"use strict";
	/*global sinon, QUnit, ClipboardEvent, DataTransfer */

	function triggerPasteEvent(oDomRef, sText) {
		const oPasteEvent = new ClipboardEvent("paste", {
			clipboardData: new DataTransfer(),
			bubbles: true
		});

		oPasteEvent.clipboardData.setData("text", sText);
		oDomRef.dispatchEvent(oPasteEvent);
	}

	function getPopover() {
		const oPopoverDomRef = document.querySelector(".sapMPopover");
		return oPopoverDomRef && Element.getElementById(oPopoverDomRef.id);
	}

	function timeout(iDuration) {
		return new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	QUnit.test("Not Applicable", function(assert) {
		assert.throws(function() {
			new Table({dependents: new PasteProvider()});
		});
	});

	QUnit.test("Defaults", async function(assert) {
		const fnShortcutHintsMixinSpy = sinon.spy(ShortcutHintsMixin, "addConfig");
		const oBundle = Library.getResourceBundleFor("sap.m");
		const oTable = new Table();
		const oPlugin = new PasteProvider({
			pasteFor: oTable.getId()
		});
		const oButton = new Button({
			dependents: oPlugin
		});
		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oButton.getIcon(), "sap-icon://paste");
		assert.equal(oButton.getTooltip_AsString(), "Paste");
		assert.ok(oButton.hasListeners("press"));

		oPlugin.setEnabled(false);
		assert.notOk(oButton.hasListeners("press"));

		await timeout();

		assert.ok(ShortcutHintsMixin.isControlRegistered(oButton.getId()), "ShortcutHintsMixin is registered for the Button");
		assert.ok(fnShortcutHintsMixinSpy.calledWithExactly(
			oButton,
			sinon.match({ message: oBundle.getText(Device.os.macintosh ? "PASTEPROVIDER_SHORTCUT_MAC" : "PASTEPROVIDER_SHORTCUT_WIN") }),
			oTable
		), "ShortcutHintsMixin config of the Button is correct");
		fnShortcutHintsMixinSpy.restore();
	});

	QUnit.module("PasteProvider", {
		beforeEach: async function() {
			this.oAssociationPasteSpy = sinon.spy();
			this.oPluginPasteSpy = sinon.spy();

			this.oTable = new Table("table1");
			this.oTable.onpaste = this.oAssociationPasteSpy;

			this.oPlugin = new PasteProvider({
				paste: [function(oEvent) {
					this.oPluginPasteSpy(oEvent.getParameters());
				}, this],
				pasteFor: "table1"
			});
			this.oButton = new Button({
				dependents: this.oPlugin
			});

			this.oButton.placeAt("qunit-fixture");
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oButton.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("navigator.clipboard API: not supported", async function(assert) {
		const sClipboardText = "Aa\tBb\nCc\tDd";
		const oDeviceStub = sinon.stub(Device.system, "desktop").value(true);
		const oClipboardStub = sinon.stub(window, "navigator").value({clipboard: undefined});
		this.oButton.focus();
		this.oButton.firePress();

		await timeout(600); /* focus is not testable otherwise */

		assert.ok(getPopover().getShowArrow());
		assert.equal(getPopover().getPlacement(), "Auto");
		//assert.ok(getPopover().$().text().includes("+V"));
		assert.ok(this.oTable.$().hasClass("sapMPluginsPasteProviderHighlight"));
		assert.equal(document.activeElement, getPopover().$().find("[contenteditable]")[0]);

		getPopover().$().trigger("keypress");
		triggerPasteEvent(getPopover().getDomRef(), sClipboardText);
		assert.ok(this.oPluginPasteSpy.calledWithMatch({ text: sClipboardText, data: [["Aa", "Bb"], ["Cc", "Dd"]] }));
		assert.ok(this.oAssociationPasteSpy.calledOnce);

		assert.notOk(this.oTable.$().hasClass("sapMPluginsPasteProviderHighlight"));
		assert.ok(getPopover());

		await timeout(500);
		assert.notOk(getPopover().isOpen());
		assert.equal(document.activeElement, this.oButton.getFocusDomRef());

		oClipboardStub.restore();
		oDeviceStub.restore();
	});

	QUnit.test("navigator.clipboard API: Clipboard Access Denied", async function(assert) {
		const sClipboardText = "Dd\tBb\nCc\tAa";
		const oClipboardStub = sinon.stub(window, "navigator").value({
			clipboard: {
				readText: function() {
					return {
						then: function(fnFulfill, fnReject) {
							fnReject();
						}
					};
				}
			}
		});
		const sPasteRegionId = "nodata";
		this.oTable.getDomRef().removeAttribute("data-sap-ui-pasteregion");
		this.oTable.getDomRef(sPasteRegionId).setAttribute("data-sap-ui-pasteregion", "true");
		this.oButton.focus();
		this.oButton.firePress();

		assert.ok(this.oTable.$(sPasteRegionId).hasClass("sapMPluginsPasteProviderHighlight"));

		triggerPasteEvent(getPopover().getDomRef(), sClipboardText);
		assert.ok(this.oPluginPasteSpy.calledWithMatch({ text: sClipboardText, data: [["Dd", "Bb"], ["Cc", "Aa"]] }));
		assert.ok(this.oAssociationPasteSpy.calledOnce);

		assert.notOk(this.oTable.$(sPasteRegionId).hasClass("sapMPluginsPasteProviderHighlight"));
		assert.ok(getPopover());
		await timeout(400);

		assert.notOk(getPopover().isOpen());

		oClipboardStub.restore();
	});

	QUnit.test("navigator.clipboard API: Clipboard Access Granted", function(assert) {
		let sClipboardText;
		const oClipboardStub = sinon.stub(window, "navigator").value({
			clipboard: {
				readText: function() {
					return {
						then: function(fnFulfill, fnReject) {
							fnFulfill(sClipboardText);
						}
					};
				}
			}
		});
		sClipboardText = "";
		this.oButton.firePress();
		assert.equal(this.oAssociationPasteSpy.callCount, 0);

		sClipboardText = "Aa\tCc\nBb\tDd";
		this.oButton.firePress();
		assert.ok(this.oPluginPasteSpy.calledWithMatch({ text: sClipboardText, data: [["Aa", "Cc"], ["Bb", "Dd"]] }));
		assert.equal(this.oAssociationPasteSpy.callCount, 1);

		oClipboardStub.restore();
	});

	QUnit.test("Paste-Button", function(assert) {
		const sText = Library.getResourceBundleFor("sap.m").getText("PASTEPROVIDER_PASTE");
		assert.equal(this.oButton.getTooltip(), sText, "Paste Button Tooltip");
		assert.ok(!this.oButton.getText(), "Paste Button Text");
		this.oOverflowButton = new OverflowToolbarButton({
			dependents: this.oPlugin
		});
		assert.equal(this.oOverflowButton.getTooltip(), sText, "Paste Button Tooltip");
		assert.equal(this.oOverflowButton.getText(), sText, "Paste Button Text");
		this.oOverflowButton.destroy();
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(PasteProvider.findOn(this.oButton) === this.oPlugin, "Plugin found via PasteProvider.findOn");
	});

});