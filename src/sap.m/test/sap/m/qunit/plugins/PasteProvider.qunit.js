sap.ui.define([
	"sap/m/Table",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/m/plugins/PasteProvider",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/Icon",
	"sap/m/Popover"
], function(Table, Button, Device, Core, PasteProvider, Element) {

	"use strict";
	/*global sinon, QUnit, ClipboardEvent, DataTransfer */

	function triggerPasteEvent(oDomRef, sText) {
		var oPasteEvent = new ClipboardEvent("paste", {
			clipboardData: new DataTransfer(),
			bubbles: true
		});

		oPasteEvent.clipboardData.setData("text", sText);
		oDomRef.dispatchEvent(oPasteEvent);
	}

	function getPopover() {
		var oPopoverDomRef = document.querySelector(".sapMPopover");
		return oPopoverDomRef && Element.registry.get(oPopoverDomRef.id);
	}

	QUnit.test("Not Applicable", function(assert) {
		assert.throws(function() {
			new Table({dependents: new PasteProvider()});
		});
	});

	QUnit.test("Defaults", function(assert) {
		var oPlugin = new PasteProvider();
		var oButton = new Button({
			dependents: oPlugin
		});
		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.equal(oButton.getIcon(), "sap-icon://paste");
		assert.equal(oButton.getTooltip_AsString(), "Paste");
		assert.ok(oButton.hasListeners("press"));

		oPlugin.setEnabled(false);
		assert.notOk(oButton.hasListeners("press"));
	});

	QUnit.module("PasteProvider", {
		beforeEach: function() {
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
			Core.applyChanges();
		},
		afterEach: function() {
			this.oButton.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("navigator.clipboard API: not supported", function(assert) {
		var done = assert.async();
		var sClipboardText = "Aa\tBb\nCc\tDd";
		var oDeviceStub = sinon.stub(Device.system, "desktop").value(true);
		var oClipboardStub = sinon.stub(window, "navigator").value({clipboard: undefined});
		this.oButton.focus();
		this.oButton.firePress();

		setTimeout(function() {
			var oClock = sinon.useFakeTimers();
			assert.ok(getPopover().getShowArrow());
			assert.equal(getPopover().getPlacement(), "Auto");
			assert.ok(getPopover().$().text().includes(" + V"));
			assert.ok(this.oTable.$().hasClass("sapMPluginsPasteProviderHighlight"));
			assert.equal(document.activeElement, getPopover().$().find("[contenteditable]")[0]);

			getPopover().$().trigger("keypress");
			triggerPasteEvent(getPopover().getDomRef(), sClipboardText);
			assert.ok(this.oPluginPasteSpy.calledWithMatch({ text: sClipboardText, data: [["Aa", "Bb"], ["Cc", "Dd"]] }));
			assert.ok(this.oAssociationPasteSpy.calledOnce);

			assert.notOk(this.oTable.$().hasClass("sapMPluginsPasteProviderHighlight"));
			assert.ok(getPopover());

			oClock.tick(500);
			assert.notOk(getPopover().isOpen());
			assert.equal(document.activeElement, this.oButton.getFocusDomRef());

			oClipboardStub.restore();
			oDeviceStub.restore();
			oClock.restore();
			done();
		}.bind(this), 600 /* focus is not testable otherwise */);
	});

	QUnit.test("navigator.clipboard API: Clipboard Access Denied", function(assert) {
		var sClipboardText = "Dd\tBb\nCc\tAa";
		var oClipboardStub = sinon.stub(window, "navigator").value({
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
		var sPasteRegionId = "nodata";
		this.oTable.getDomRef().removeAttribute("data-sap-ui-pasteregion");
		this.oTable.getDomRef(sPasteRegionId).setAttribute("data-sap-ui-pasteregion", "true");
		this.oButton.focus();
		this.oButton.firePress();

		return Promise.resolve().then(function() {
			var oClock = sinon.useFakeTimers();
			assert.ok(this.oTable.$(sPasteRegionId).hasClass("sapMPluginsPasteProviderHighlight"));

			triggerPasteEvent(getPopover().getDomRef(), sClipboardText);
			assert.ok(this.oPluginPasteSpy.calledWithMatch({ text: sClipboardText, data: [["Dd", "Bb"], ["Cc", "Aa"]] }));
			assert.ok(this.oAssociationPasteSpy.calledOnce);

			assert.notOk(this.oTable.$(sPasteRegionId).hasClass("sapMPluginsPasteProviderHighlight"));
			assert.ok(getPopover());

			oClock.tick(400);
			assert.notOk(getPopover().isOpen());

			oClipboardStub.restore();
			oClock.restore();
		}.bind(this));
	});

	QUnit.test("navigator.clipboard API: Clipboard Access Granted", function(assert) {
		var sClipboardText;
		var oClipboardStub = sinon.stub(window, "navigator").value({
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

});