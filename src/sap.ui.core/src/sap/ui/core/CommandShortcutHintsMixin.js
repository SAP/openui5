/*!
 * ${copyright}
 */

sap.ui.define(["./CommandShortcutHints", "./Popup", "./InvisibleText"],
	function(CommandShortcutHints, Popup, InvisibleText) {
	"use strict";

	/**
	 * Applying the CommandShortcutHintsMixin to a control's prototype adds functions to show
	 * and hide the command's shortcut in a popup next to the control's DOM ref.
	 *
	 * Please be aware, that only controls supporting a shortcut hint should apply this mixin to their prototype.
	 *
	 * @param {object} [options] An object which defines the options
	 * @param {string} [options.domrefid_suffix] The suffix used to identify the DOM node that
	 * shows the shortcut hint popup. It is concatenated with the ID of the control that is registered
	 * for a command execution. (Attaches the popup to the element with ID CONTROL_ID + domrefid_suffix)
	 * @param {string} [options.position] Left and top offset of the shortcut hint popup from the default positioning
	 * (center top of the popup appears at center bottom of the referring DOM node)- e.g. "5 0"
	 * @param {boolean} [options.addAccessibilityLabel] Whether we add an area-describedby label - ID to a hidden
	 * label with the content of the replaced native tooltip (for screen readers)
	 *
	 * @protected
	 * @alias sap.ui.core.CommandShortcutHintsMixin
	 * @mixin
	 * @since 1.80.0
	 * @ui5-restricted sap.m.Button
	 */
	var CommandShortcutHintsMixin = function(options) {
		this._attachCommand = _attachCommand;
		this._getHintPopup = _getHintPopup;
		this._createPopup = _createPopup;
		this.showShortcutHint = showShortcutHint;
		this.hideShortcutHint = hideShortcutHint;
		this.getShortcutHintRef = getShortcutHintRef;
		this.getShortcutHintText = getShortcutHintText;
		this.updateAccessibilityLabel = updateAccessibilityLabel;
		this._shortcutHintOptions = options;
	};

	/**
	 * Called when a command is attached as an event handler to enhance the control
	 * to be able to show the commands shortcut.
	 * @param {string} sCommand The command's name
	 */
	function _attachCommand(sCommand) {
		CommandShortcutHints.register(this, sCommand);

		var oAfterRenderingDelegate = {
			"onAfterRendering": function() {
				var sInnerId = getShortcutHintRefId.call(this),
					oElement,
					sTitleAttribute;

				if (sInnerId) {
					oElement = document.getElementById(sInnerId);
					oElement.setAttribute("aria-keyshortcuts", this.getShortcutHintText());

					sTitleAttribute = oElement.getAttribute("title");
					if (sTitleAttribute) {
						oElement.removeAttribute("title");
						this._titleAttribute = sTitleAttribute;
					}
				}
			}
		};

		this.addEventDelegate(oAfterRenderingDelegate, this);
	}

	/**
	 * Gets the DOM reference ID next to which the shortcut hint will be positioned.
	 */
	function getShortcutHintRefId() {
		if (this._shortcutHintOptions && this._shortcutHintOptions.domrefid) {
			return this._shortcutHintOptions.domrefid;
		}

		if (this._shortcutHintOptions && this._shortcutHintOptions.domrefid_suffix) {
			return this.getId() + this._shortcutHintOptions.domrefid_suffix;
		}

		return this.getId();
	}

	/**
	 * Gets the DOM reference next to which the shortcut hint will be positioned.
	 */
	function getShortcutHintRef() {
		return document.getElementById(getShortcutHintRefId.call(this));
	}

	/**
	 * Shows a shortcut hint for this instance for the attached command.
	 */
	function showShortcutHint() {
		var sTimeoutID,
			sPosition = (this._shortcutHintOptions && this._shortcutHintOptions.position) || "0 8",
			sMy = Popup.Dock.CenterTop,
			sOf = Popup.Dock.CenterBottom,
			oPopup = this._getHintPopup(),
			$ShortcutHintRef = this.getShortcutHintRef(),
			sShortcut = this.getShortcutHintText();

		// cancel the opening if the element is not visible
		if (!_isElementVisible($ShortcutHintRef) || !_isElementInViewport($ShortcutHintRef)) {
			return;
		}

		// concatenate with the tooltip
		if (this._titleAttribute) {
			sShortcut = this._titleAttribute + " (" + sShortcut + ")";
		}

		if (!oPopup) {
			oPopup = this._createPopup(sShortcut);
		}
		oPopup.oContent.children[0].innerHTML = sShortcut;

		// in the mass case open, only once with the position for the lead control of the group
		if (!oPopup.isOpen()) {
			oPopup.open(1000, sMy, sOf, $ShortcutHintRef, sPosition, "flip", function(params) {
				oPopup.oContent.style.visibility = "hidden";
				if (sTimeoutID) {
					clearTimeout(sTimeoutID);
				}
				sTimeoutID = setTimeout(function() {
					if (!_isElementVisible($ShortcutHintRef) || !_isElementInViewport($ShortcutHintRef)) {
						return;
					}

					oPopup.oContent.style.visibility = "visible";
				}, 1000);

				oPopup._applyPosition(oPopup._oLastPosition);
			});
		}
	}

	/**
	 * Hides the shortcut hint for this instance.
	 */
	function hideShortcutHint() {
		var oPopup = this._getHintPopup();
		if (oPopup && oPopup.isOpen()) {
			oPopup.close();
		}
	}

	/**
	 * Gets the shortcut hint text for the command attached to this control.
	 */
	function getShortcutHintText() {
		var oCommand = CommandShortcutHints.getCommandForControl(this.getId());

		if (oCommand) {
			return oCommand.shortcut;
		}
	}

	/**
	 * Determines if a DOM element is inside the viewport.
	 */
	function _isElementInViewport(oDomElement) {
		var mRect;

		if (!oDomElement) {
			return false;
		}

		mRect = oDomElement.getBoundingClientRect();

		return (
			mRect.top >= 0 &&
			mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	/**
	 * Determines if a DOM element is visible.
	 */
	function _isElementVisible(elem) {
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	}

	/**
	 * Gets a popup for the shortcut hint.
	 */
	function _getHintPopup() {
		return CommandShortcutHintsMixin._popup;
	}

	/**
	 * Creates a popup for this shortcut hint.
	 */
	function _createPopup(sTextContent) {
		var oPopup,
			oContainerElement,
			oTextContentElement;

		oContainerElement = document.createElement("span");
		oContainerElement.classList.add("sapUiHintContainer");

		oTextContentElement = document.createElement("div");
		oTextContentElement.classList.add("sapUiHintText");
		oTextContentElement.innerHTML = sTextContent;
		oContainerElement.appendChild(oTextContentElement);

		oPopup = new Popup(
			oContainerElement,
			false,
			false,
			false
		);

		//set open animation
		oPopup.setAnimations(function($ref, iDuration, callback) {
			setTimeout(callback, iDuration);
		}, function($ref, iDuration, callback) {
			callback();
		});

		CommandShortcutHintsMixin._popup = oPopup;

		return oPopup;
	}

	/**
	 * Maintains the accessibility label's content and reference to the control's DOM.
	 */
	function updateAccessibilityLabel() {
		var oInvText,
			sInvTextId,
			oRef;

		if (!this._shortcutHintOptions.addAccessibilityLabel) {
			return;
		}

		oInvText = getInvisibleText();
		sInvTextId = oInvText.getId();
		oRef = this.getShortcutHintRef();

		oInvText.setText(this._titleAttribute);

		if (oInvText.getText()) {
			addToAttributeList(oRef, "aria-describedby", sInvTextId);
		} else {
			removeFromAttributeList(oRef, "aria-describedby", sInvTextId);
		}
	}

	/**
	 * Gets or creates an InvisibleText for the shortcut's accessiblity.
	 */
	function getInvisibleText() {
		if (!CommandShortcutHintsMixin._invisibleText) {
			CommandShortcutHintsMixin._invisibleText = new InvisibleText();
			CommandShortcutHintsMixin._invisibleText.toStatic();
		}

		return CommandShortcutHintsMixin._invisibleText;
	}

	/**
	 * Adds a value to a DOM element's attribute. Does nothing if already there.
	 * @param {object} node DOM node
	 * @param {string} sAttribute An attrubute
	 * @param {string} sValue The string value to add (for the 'class' attribute
	 * usually a className or for 'aria-describedby' an ID)
	 * @param {boolean} bPrepend Adds the value to the front of the list
	 * @private
	 */
	function addToAttributeList(node, sAttribute, sValue, bPrepend) {
		var sAttributes = node.getAttribute(sAttribute);
		if (!sAttributes) {
			node.setAttribute(sAttribute, sValue);
			return;
		}

		var aAttributes = sAttributes.split(" ");
		if (aAttributes.indexOf(sValue) == -1) {
			bPrepend ? aAttributes.unshift(sValue) : aAttributes.push(sValue);
			node.setAttribute(sAttribute, aAttributes.join(" "));
		}
	}

	/**
	 * Removes a string value from an a DOM element's attribute.
	 * @param {object} node DOM node
	 * @param {string} sAttribute An attrubute
	 * @param {string} sValue The string value to remove (for the 'class' attribute
	 * usually a className or for 'aria-describedby' an ID)
	 * @private
	 */
	function removeFromAttributeList(node, sAttribute, sValue) {
		var sAttributes = node.getAttribute(sAttribute) || "",
			aAttributes = sAttributes.split(" "),
			iIndex = aAttributes.indexOf(sValue);

		if (iIndex == -1) {
			return;
		}

		aAttributes.splice(iIndex, 1);
		if (aAttributes.length) {
			node.setAttribute(sAttribute, aAttributes.join(" "));
		} else {
			node.removeAttribute(sAttribute);
		}

		return this;
	}

	return CommandShortcutHintsMixin;
}, /* bExport= */ true);