/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/ui/core/Core", "sap/ui/core/util/PasteHelper"], function(PluginBase, Core, PasteHelper) {
	"use strict";

	/*global ClipboardEvent, DataTransfer */

	/**
	 * Constructor for a new PasteProvider plugin.
	 *
	 * @example
	 * sap.ui.require(["sap/m/Button", "sap/m/plugins/PasteProvider"], function(Button, PasteProvider) {
	 *   var oPasteButton = new Button();
	 *   oPasteButton.addDependent(new PasteProvider({
	 *     pasteFor: oTable.getId() // Reference to the control the paste is associated with, e.g. a sap.m.Table
	 *   }));
	 * });
	 *
	 * @param {string} [sId] ID for the new <code>PasteProvider</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>PasteProvider</code>
	 *
	 * @class
	 * Provides cross-platform paste capabilities for the <code>sap.m.Button</code> control which allows the user to initiate a paste action.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.91
	 * @alias sap.m.plugins.PasteProvider
	 */
	var PasteProvider = PluginBase.extend("sap.m.plugins.PasteProvider", /** @lends sap.m.plugins.PasteProvider.prototype */ { metadata: {
		library: "sap.m",
		associations: {
			/**
			 * Defines the control which the paste is associated with.
			 */
			pasteFor: { type: "sap.ui.core.Control", multiple: false }
		},
		events: {
			/**
			 * This event gets fired when the user pastes content from the clipboard or when the Paste button is pressed if the clipboard access has already been granted.
			 * Pasting can be done via the paste feature of the mobile device or the standard paste keyboard shortcut while the popover is open.
			 * By default, a synthetic <code>Clipboard</code> event that represents the paste data gets dispatched for the control defined in the <code>pasteFor</code> association.
			 * To avoid this, call <code>preventDefault</code> on the event instance.
			 */
			paste: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * Two-dimentional array of strings with data from the clipboard. The first dimension represents the rows,
					 * and the second dimension represents the cells of the tabular data.
					 */
					data: { type: "string[][]" },

					/**
					 * The text data, with all special characters, from the clipboard.
					 */
					text: { type: "string" }
				}
			}
		}
	}});

	var oPopover = null;
	var oActivePlugin = null;
	var sPasteRegionSelector = "[data-sap-ui-pasteregion]";

	PasteProvider.prototype.onActivate = function(oControl) {
		oControl.attachEvent(this.getConfig("pressEvent"), this._onPress, this);
	};

	PasteProvider.prototype.onDeactivate = function(oControl) {
		oControl.detachEvent(this.getConfig("pressEvent"), this._onPress, this);
	};

	PasteProvider.prototype._onPress = function() {
		if (oPopover) {
			oPopover.close();
		}

		oActivePlugin = this;
		var oClipboard = navigator.clipboard;
		if (oClipboard && oClipboard.readText) {
			oClipboard.readText().then(function(sClipboardText) {
				firePaste(sClipboardText);
				oActivePlugin = null;
			}, showPopover);
		} else {
			showPopover();
		}
	};

	function firePaste(vEventOrText) {
		var sClipboardText = PasteHelper.getClipboardText(vEventOrText);
		if (!sClipboardText) {
			return;
		}

		var mEventParameters = { text: sClipboardText };
		Object.defineProperty(mEventParameters, "data", {
			get: PasteHelper.getPastedDataAs2DArray.bind(PasteHelper, sClipboardText)
		});

		if (!oActivePlugin.firePaste(mEventParameters)) {
			return;
		}

		var oPasteForDomRef = getPasteForDomRef();
		if (!oPasteForDomRef) {
			return;
		}

		var oPasteEvent = new ClipboardEvent("paste", {
			clipboardData: new DataTransfer(),
			bubbles: true
		});
		oPasteEvent.clipboardData.setData("text", sClipboardText);
		oPasteForDomRef.dispatchEvent(oPasteEvent);
	}

	function getPasteForDomRef() {
		var oPasteFor = Core.byId(oActivePlugin.getPasteFor());
		var oPasteForDomRef = oPasteFor && oPasteFor.getDomRef();
		if (!oPasteForDomRef) {
			return;
		}
		if (oPasteForDomRef.matches(sPasteRegionSelector)) {
			return oPasteForDomRef;
		} else {
			return oPasteForDomRef.querySelector(sPasteRegionSelector) || oPasteForDomRef;
		}
	}

	function toggleHighlight(bShowOrHide) {
		var oPasteForDomRef = getPasteForDomRef();
		oPasteForDomRef && oPasteForDomRef.classList.toggle("sapMPluginsPasteProviderHighlight", bShowOrHide);
	}

	function showPopover() {
		var oControl = oActivePlugin.getControl();
		if (oPopover) {
			return oPopover.openBy(oControl);
		}

		sap.ui.require(["sap/ui/Device", "sap/ui/core/HTML", "sap/ui/core/Icon", "sap/m/Popover"], function(Device, HTML, Icon, Popover) {
			var sMessage, oRB = Core.getLibraryResourceBundle("sap.m");
			var bDesktop = Device.system.desktop && !Device.os.ios && !Device.os.android;
			if (bDesktop) {
				var sShortCut = oRB.getText("PASTEPROVIDER_SHORTCUT_" + (Device.os.name == "mac" ? "MAC" : "WIN"));
				sMessage = oRB.getText("PASTEPROVIDER_DESKTOP_MSG", '<span class="sapMPluginsPasteProviderShortCut">' + sShortCut + '</span>');
			} else {
				sMessage = oRB.getText("PASTEPROVIDER_MOBILE_MSG");
			}

			var oContent = new HTML({
				content: '<div contenteditable="true" class="sapMPluginsPasteProviderMessage">' + sMessage + '</div>',
				preferDOM: false
			});

			oPopover = new Popover({
				title: oRB.getText("PASTEPROVIDER_TITLE"),
				showArrow: bDesktop,
				horizontalScrolling: false,
				verticalScrolling: false,
				placement: "Auto",
				content: oContent,
				initialFocus: oContent.getId(),
				beginButton: new Icon({
					src: "sap-icon://message-information"
				}),
				beforeOpen: function() {
					toggleHighlight(true);
				},
				beforeClose: function() {
					toggleHighlight(false);
					oActivePlugin = null;
				}
			});

			oPopover.addEventDelegate({
				onpaste: function(oEvent) {
					oEvent.preventDefault(); // do not let conteneditable to be changed
					firePaste(oEvent.originalEvent);
					oPopover.close();
				},
				onkeypress: function(oEvent) {
					oEvent.preventDefault(); // do not let conteneditable to be changed
				}
			});

			oPopover.openBy(oControl);
		});
	}

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.Button": {
			pressEvent: "press",
			onActivate: function(oButton) {
				if (!oButton.getText() && !oButton.getIcon() && !oButton.getTooltip_AsString()) {
					oButton.setTooltip(Core.getLibraryResourceBundle("sap.m").getText("PASTEPROVIDER_PASTE"));
					oButton.setIcon("sap-icon://paste");
				}
			}
		}
	}, PasteProvider);

	return PasteProvider;

});