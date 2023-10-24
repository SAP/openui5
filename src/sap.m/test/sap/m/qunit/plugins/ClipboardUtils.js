/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";
	/*global sinon*/

	class FakeClipboardItem {
		#mData;

		constructor(mData) {
			this.#mData = mData;
		}

		getType(sType) {
			return Promise.resolve(this.#mData[sType]);
		}

		get types() {
			return Object.keys(this.#mData);
		}
	}

	class FakeTextClipboard {
		#sClipboardText = "";

		readText() {
			return Promise.resolve(this.#sClipboardText);
		}

		writeText(sClipboardText) {
			this.#sClipboardText = sClipboardText;
			return Promise.resolve();
		}
	}

	class FakeClipboard extends FakeTextClipboard {
		#aClipboardItems = [];

		read() {
			return Promise.resolve(this.#aClipboardItems);
		}

		write(aClipboardItems) {
			this.#aClipboardItems = aClipboardItems;
			return Promise.resolve();
		}
	}

	class ClipboardUtils {
		static #mStubs = {};

		static stub(bOnlyTextApi = false) {
			if (ClipboardUtils.#mStubs.isSecureContext) {
				return;
			}

			window.navigator ??= {};
			window.navigator.clipboard ??= undefined;
			window.ClipboardItem ??= undefined;

			ClipboardUtils.#mStubs.isSecureContext = sinon.stub(window, "isSecureContext");
			ClipboardUtils.#mStubs.isSecureContext.value(true);

			ClipboardUtils.#mStubs.ClipboardItem = sinon.stub(window, "ClipboardItem");
			ClipboardUtils.#mStubs.ClipboardItem.value(FakeClipboardItem);

			ClipboardUtils.#mStubs.clipboard = sinon.stub(window.navigator, "clipboard");
			ClipboardUtils.#mStubs.clipboard.value(
				bOnlyTextApi ? new FakeTextClipboard() : new FakeClipboard()
			);
		}

		static restore() {
			if (!ClipboardUtils.#mStubs.isSecureContext) {
				return;
			}

			ClipboardUtils.#mStubs.isSecureContext.restore();
			ClipboardUtils.#mStubs.ClipboardItem.restore();
			ClipboardUtils.#mStubs.clipboard.restore();
			ClipboardUtils.#mStubs = {};
		}

		static triggerCopy(vDomRefOrSelector = ".sapMLIBFocusable, .sapUiTableCell") {
			const oDomRef = typeof vDomRefOrSelector === "string" ? document.querySelector(vDomRefOrSelector) : vDomRefOrSelector;
			const oEvent = new KeyboardEvent("keydown", {
				code: "KeyC",
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});

			oDomRef.focus();
			oDomRef.dispatchEvent(oEvent);
		}
	}

	return ClipboardUtils;
});