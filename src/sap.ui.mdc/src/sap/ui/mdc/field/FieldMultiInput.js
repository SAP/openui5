/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/MultiInput', 'sap/ui/mdc/field/FieldMultiInputRenderer', "sap/ui/Device"
], (
	MultiInput,
	FieldMultiInputRenderer,
	Device
) => {
	"use strict";

	/**
	 * Constructor for a new <code>FieldMultiInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>FieldMultiInput</code> control is used to render a multi-input field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * It enhances the {@link sap.m.MultiInput MultiInput} control to add ARIA attributes and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 * @extends sap.m.MultiInput
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldMultiInput
	 */
	const FieldMultiInput = MultiInput.extend("sap.ui.mdc.field.FieldMultiInput", /** @lends sap.ui.mdc.field.FieldMultiInput.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>MultiInput</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		},
		renderer: FieldMultiInputRenderer
	});

	FieldMultiInput.prototype.init = function () {

		MultiInput.prototype.init.apply(this, arguments);

		const oTokenizer = this.getAggregation("tokenizer");

		oTokenizer._fillClipboard = _fillClipboard;

	};


	/*
	 * MultiInput/Tokenizer may sometimes trigger _fillClipboard twice.
	 * As writing to navigator.clipboard is asynchronous, we prevent writing during a write being in progress (as clipboard otherwise may become empty).
	*/
	let bClipboardBusy = false;

	async function _fillClipboard(sShortcutName) {

		if (!navigator.clipboard) {
			throw new Error(this + " requires a secure context in order to access the clipboard API.");
		}

		if (!bClipboardBusy) {
			const aSelectedTokens = this.getSelectedTokens();
			if (aSelectedTokens.length === 0) {
				// no token is selected, but a normal character might be selected and will be copied
				return;
			}

			bClipboardBusy = true;
			const sModel = this.getBindingInfo("tokens").model;
			const sTokensTexts = aSelectedTokens.map((oToken) => {
				const oConditionType = oToken.getBinding("text").getType();
				const oCondition = oToken.getBindingContext(sModel).getObject();
				return oConditionType.getTextForCopy(oCondition);
			}).join("\r\n");

			const sTokensTextsHTML = "<table><tr>" + aSelectedTokens.map((oToken) => {
				// we copy it as it is on the token
				return "<td>" + oToken.getText() + "</td>";
			}).join("</tr><tr>") + "</tr></table>";

			if (_isHtmlMimeTypeAllowed()) {
				const sHtmlMimeType = "text/html";
				const sTextMimeType = "text/plain";
				const oClipboardItem = new ClipboardItem({
					[sTextMimeType]: new Blob([sTokensTexts], {type: sTextMimeType}),
					[sHtmlMimeType]: new Blob([sTokensTextsHTML], {type: sHtmlMimeType})
				});

				await navigator.clipboard.write([oClipboardItem]);
			} else {
				await navigator.clipboard.writeText(sTokensTexts);
			}

			if (bClipboardBusy) {
				bClipboardBusy = false;
			}
		}
	}

	function _isHtmlMimeTypeAllowed() {
		return Boolean(Device.system.desktop && window.ClipboardItem && navigator.clipboard?.write);
	}

	return FieldMultiInput;

});