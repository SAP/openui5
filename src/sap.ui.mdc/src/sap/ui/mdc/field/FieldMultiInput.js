/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/m/MultiInput',
	'sap/m/Tokenizer',
	'sap/ui/mdc/field/FieldMultiInputRenderer',
	'sap/ui/Device',
	'sap/ui/base/ManagedObjectObserver'
], (
	Element,
	MultiInput,
	Tokenizer,
	FieldMultiInputRenderer,
	Device,
	ManagedObjectObserver

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

		oTokenizer._handleNMoreIndicator = function (iHiddenTokensCount) {

			const oBinding = this.getBinding("tokens");
			const iLength = oBinding.getLength(); // tokens available in binding
			const iTokensLength = this.getTokens().length;
			const iMissingTokens = iLength - iTokensLength;

			return Tokenizer.prototype._handleNMoreIndicator.apply(this, [iHiddenTokensCount + iMissingTokens]);

		};

		oTokenizer._handleNMoreIndicatorPress = function () {

			const oMultiInput = this.getParent();
			_bindAllTokens.call(oMultiInput); // get all tokens as list has no paging

			return Tokenizer.prototype._handleNMoreIndicatorPress.apply(this, arguments);

		};

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["ariaAttributes"]
		});

	};

	FieldMultiInput.prototype.exit = function() {

		MultiInput.prototype.exit.apply(this, arguments);

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	FieldMultiInput.prototype.onfocusin = function(oEvent) {

		if (oEvent.srcControl.isA("sap.m.Token")) { // let first finish the focus on Token or Delete of Token
			const iIndex = this.indexOfToken(oEvent.srcControl);
			if (iIndex >= 0) {
				this._iRestoreTokenFocus = this.getTokens().length - iIndex; // to always have the current one, independent of multiple calls
			}

			if (this._oUpdateBindingTimer || this._bUpdateBinding) { // if update is running handle multiple token focus while update (programmatically set in MultiInput or Tokenizer)
				this.bDeletePressed = false; // initialize (only set on detete token)
				this.iFocusedIndexBeforeUpdate = 0; // initialize (only set on detete token)
			}
			_bindAllTokens.call(this, true); // get all tokens as paging would need support from Tokenizer
			oEvent.setMark("doNotOpenOnFocus", true); // prevent opening of ValueHelp if Token is focused
		} else {
			delete this._iRestoreTokenFocus;
			_bindAllTokens.call(this, false); // get all tokens as paging would need support from Tokenizer
		}

		MultiInput.prototype.onfocusin.apply(this, arguments);

	};

	FieldMultiInput.prototype.ontap = function(oEvent) {

		if (oEvent.target.classList.contains("sapMTokenizerIndicator")) {
			oEvent.setMark("tokenizerMoreIndicatorTap");
		}

		MultiInput.prototype.ontap.apply(this, arguments);

	};

	FieldMultiInput.prototype.onAfterRendering = function () {

		const {bDeletePressed, bTokensUpdated} = this;
		const iIndex = this.iFocusedIndexBeforeUpdate;
		let bRestore = false;

		if (this._oUpdateBindingTimer) {
			// update still pending -> don't set the focus
			this.bTokensUpdated = false;
			this.bDeletePressed = false;
			bRestore = true;
		} else if (this._bUpdateBinding && this._iRestoreTokenFocus !== undefined) {
			this.iFocusedIndexBeforeUpdate = this.getTokens().length - this._iRestoreTokenFocus; // reuse existing focus logic
			delete this._iRestoreTokenFocus;
			delete this._bUpdateBinding;
			this.bDeletePressed = true; // to run into setting focus
			const oTokenizer = this.getAggregation("tokenizer");
			if (oTokenizer._oSelectionOrigin) {
				// set to new token (for shift-tap)
				oTokenizer._oSelectionOrigin = oTokenizer.getTokens()[this.iFocusedIndexBeforeUpdate];
			}
			bRestore = true;
		}

		MultiInput.prototype.onAfterRendering.apply(this, arguments);

		if (bRestore) {
			this.bDeletePressed = bDeletePressed; // restore
			this.iFocusedIndexBeforeUpdate = iIndex; // restore
			this.bTokensUpdated = bTokensUpdated; // restore
		}

	};

	FieldMultiInput.prototype.shouldSuggetionsPopoverOpenOnMobile = function(oEvent) {

		const oField = this.getParent();
		const sValueHelpID = oField?.getValueHelp?.();
		const oValueHelp = sValueHelpID && Element.getElementById(sValueHelpID);

		if (oValueHelp?.getTypeahead()) {
			// don't open MultiInputs own suggestion popup to display tokens as ValueHelp implements own one
			return false;
		} else {
			return MultiInput.prototype.shouldSuggetionsPopoverOpenOnMobile.apply(this, arguments);
		}

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

	function _bindAllTokens(bAsync) {

		const oBindingInfo = this.getBindingInfo("tokens");
		if (!this._oUpdateBindingTimer && (oBindingInfo.length || oBindingInfo.startIndex)) {
			const fnUpdate = () => {
				let oToken = oBindingInfo.template;
				let bTemplateShareable = true;
				if (oBindingInfo.templateShareable !== true) {
					oToken = oToken.clone();
					bTemplateShareable = false;
				}

				this._bUpdateBinding = true;
				this.bindAggregation("tokens", { path: oBindingInfo.path, model: oBindingInfo.model, template: oToken, templateShareable: bTemplateShareable });
			};

			if (bAsync) {
				// in Token-focus case keep binding stable if there are less Tokens that length. In this case a rebind is not needed (What leads to a re-creation of the Tokens)
				const oBinding = this.getBinding("tokens");
				const iLength = oBinding.getLength(); // tokens available in binding
				if (iLength >= oBindingInfo.length) {
					this._oUpdateBindingTimer = setTimeout(() => {
						delete this._oUpdateBindingTimer;
						fnUpdate();
					}, 200); // as press event on delete-icon is somehow async
				}
			} else {
				fnUpdate();
			}

		}

	}

	function _observeChanges(oChanges) {

		if (oChanges.name === "ariaAttributes") {
			// set aria-activedescendant directly to prevent anouncement of old one
			if (oChanges.current.aria?.activedescendant !== oChanges.old.aria?.activedescendant) {
				const oDomRef = this.getFocusDomRef();
				if (!oChanges.current.aria?.activedescendant) {
					oDomRef.removeAttribute("aria-activedescendant");
				} else {
					oDomRef.setAttribute("aria-activedescendant", oChanges.current.aria.activedescendant);
				}
			}
		}

	}

	return FieldMultiInput;

});