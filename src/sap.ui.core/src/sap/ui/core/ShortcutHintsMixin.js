/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/EventProvider",
	"./Element",
	"./ShortcutHint",
	"./Popup",
	"./InvisibleText",
	"sap/ui/events/checkMouseEnterOrLeave",
	"sap/ui/Device"
],
	function(
		EventProvider,
		Element,
		ShortcutHint,
		Popup,
		InvisibleText,
		checkMouseEnterOrLeave,
		Device
	) {
	"use strict";

	/**
	 * A mixin that adds shortcut hints to a control's instance. A shortcut hint
	 * may be provided directly as a text, as a key from the message bundle, or
	 * as an event name to get it from a command execution attached to that event.
	 * The shortcut shows in a popup next to conrol on focusin and mouseover.
	 * The popup shows in place of the native tooltip, merging the tooltip text
	 * with the provided hint.
	 *
	 * @private
	 * @alias sap.ui.core.ShortcutHintsMixin
	 * @mixin
	 * @since 1.80.0
	 * @ui5-restricted sap.m.Button
	 */
	var ShortcutHintsMixin = function(oControl) {
		this.sControlId = oControl.getId();
		this._hintConfigs = [];
	};

	ShortcutHintsMixin.init = function(oControl) {
		oControl._shortcutHintsMixin = new ShortcutHintsMixin(oControl);
	};

	/**
	 * Adds a config describing a hint.
	 * @param {sap.ui.core.Control} oControl The control that will show the config
	 * @param {object} [oConfig] An object which defines the options
	 * @param {string} [oConfig.domrefid_suffix] A suffix used to identify the DOM node that
	 * shows the shortcut hint popup. It is concatenated with the ID of the control that is registered
	 * for a command execution. (Attaches the popup to the element with ID CONTROL_ID + domrefid_suffix)
	 * If it is omitted the CONTROL_ID will be used without suffix
	 * @param {string} [oConfig.position] Left and top offset of the shortcut hint popup from the default positioning
	 * (center top of the popup appears at center bottom of the referring DOM node)- e.g. "5 0"
	 * @param {boolean} [oConfig.addAccessibilityLabel] Whether we add an area-describedby label - ID to a hidden
	 * label with the content of the replaced native tooltip (for screen readers)
	 * @param {boolean} [oConfig.message] The string to be used as a shortcut hint
	 * @param {boolean} [oConfig.messageBundleKey] A message bundle key in the hint
	 * provider's library to be used as a translatable shortcut hint
	 * @param {boolean} [oConfig.event] Event name - to show a shortcut hint for a command
	 * attached to that event
	 * @param {sap.ui.core.Control} oHintProviderControl The control that will provide the hint content
	 * (e.g. the shortcut of a command registered to it)
	 */
	ShortcutHintsMixin.addConfig = function(oControl, oConfig, oHintProviderControl) {
		if (Device.system.phone) {
			return;
		}

		if (/sap-ui-xx-noshortcuthints=true/.test(document.location.search)) {
			return;
		}

		var oMixin = oControl._shortcutHintsMixin;

		if (!oMixin) {
			ShortcutHintsMixin.init(oControl);
			oMixin = oControl._shortcutHintsMixin;
		}

		oMixin._hintConfigs.push(oConfig);

		oMixin.initHint(oConfig, oHintProviderControl);
	};

	/*
	 * Hides the shortcuts hints for all registered controls.
	 */
	ShortcutHintsMixin.hideAll = function() {
		var oControl;

		for (var sControlId in oHintRegistry.mControls) {
			oControl = Element.registry.get(sControlId);

			if (oControl) {
				oControl._shortcutHintsMixin.hideShortcutHint();
			}
		}
	};

	/**
	 * Checks whether a dom node is registered to show a hint.
	 *
	 * @param {string} sDOMRefID The ID of the dom node to check
	 */
	ShortcutHintsMixin.isDOMIDRegistered = function(sDOMRefID) {
		return oHintRegistry.mDOMNodes[sDOMRefID]
			&& !!oHintRegistry.mDOMNodes[sDOMRefID].length;
	};

	/**
	 * Checks whether a control is registered to show a hint.
	 *
	 * @param {string} sControlId The ID of the control to check
	 */
	ShortcutHintsMixin.isControlRegistered = function(sControlId) {
		return !!oHintRegistry.mControls[sControlId];
	};

	ShortcutHintsMixin.prototype._attachToEvents = function() {
		var oControl;

		if (!ShortcutHintsMixin.isControlRegistered(this.sControlId)) {
			oControl = Element.registry.get(this.sControlId);
			oControl.addEventDelegate(oHintsEventDelegate, this);
		}
	};

	/*
	 * Registers the control for showing a commands' shortcut hint on focus and
	 * on hover.
	 */
	ShortcutHintsMixin.prototype.register = function(sDOMRefID, oConfig, oHintProviderControl) {
		this._attachToEvents();

		if (!ShortcutHintsMixin.isControlRegistered(this.sControlId)) {
			var oControl = Element.registry.get(this.sControlId);

			oControl._originalExit = oControl.exit;
			oControl.exit = function() {
				if (oControl._originalExit) {
					oControl._originalExit.apply(oControl, arguments);
				}
				this.deregister();
			}.bind(this);
		}

		oHintRegistry.mControls[this.sControlId] = true;

		if (!oHintRegistry.mDOMNodes[sDOMRefID]) {
			oHintRegistry.mDOMNodes[sDOMRefID] = [];
		}

		oHintRegistry.mDOMNodes[sDOMRefID].push(new ShortcutHint(oHintProviderControl, oConfig));
	};

	ShortcutHintsMixin.prototype.deregister = function() {
		var aInfos = this.getRegisteredShortcutInfos(),
			i;

		delete oHintRegistry.mControls[this.sControlId];

		for (i = 0; i < aInfos.length; i++) {
			delete oHintRegistry.mDOMNodes[aInfos[i].id];
		}
	};

	ShortcutHintsMixin.prototype.initHint = function(oConfig, oHintProviderControl) {
		var oHintInfo = this._getShortcutHintInfo(oConfig);

		if (oHintInfo.message) {
			this.register(oHintInfo.id,
				{ message: oHintInfo.message },
				oHintProviderControl);
		} else if (oHintInfo.messageBundleKey) {
			this.register(oHintInfo.id,
				{ messageBundleKey: oHintInfo.messageBundleKey },
				oHintProviderControl);
		} else if (oHintInfo.event) {
			var oEventListeners = EventProvider.getEventList(oHintProviderControl)[oHintInfo.event],
				aAttachedCommands = [];

			if (oEventListeners) {
				aAttachedCommands = oEventListeners.reduce(function(aResults, oListener) {
					if (oListener.fFunction && oListener.fFunction._sapui_commandName) {
						aResults.push(oListener.fFunction._sapui_commandName);
					}

					return aResults;
				}, []);
			}

			if (aAttachedCommands.length) {
				this.register(oHintInfo.id,
					{
						commandName: aAttachedCommands[0]
					},
					oHintProviderControl
				);
			} else {
				oHintProviderControl.attachEvent("EventHandlerChange", function(oEvent) {
					var oFn = oEvent.getParameter("func");

					if (oEvent.getParameter("type") === "listenerAttached"
						&& oFn && oFn._sapui_commandName
						&& oEvent.getParameter("EventId") === oHintInfo.event) {
						this.register(oHintInfo.id,
							{
								commandName: oFn._sapui_commandName
							},
							oHintProviderControl
						);
					}
				}, this);
			}
		}
	};

	/**
	 * Returns an array of runtime shortcut hint information objects for the control,
	 * containing the actual reference element in the DOM.
	 */
	ShortcutHintsMixin.prototype._getShortcutHintInfos = function() {
		return this._hintConfigs.map(this._getShortcutHintInfo, this);
	};

	/**
	 * Gets a shortcut hint information object for the provided config.
	 * The same as a config, but as a runtime object - resolves the actual DOM
	 * reference id where the popup is shown.
	 *
	 * @param {object} option A shortcut hint config
	 */
	ShortcutHintsMixin.prototype._getShortcutHintInfo = function(option) {
		var id;

		if (option.domrefid) {
			id = option.domrefid;
		} else if (option.domrefid_suffix) {
			id = this.sControlId + option.domrefid_suffix;
		} else {
			id = this.sControlId;
		}

		return {
			id: id,
			event: option.event,
			position: option.position,
			messageBundleKey: option.messageBundleKey,
			message: option.message,
			addAccessibilityLabel: option.addAccessibilityLabel
		};
	};

	ShortcutHintsMixin.prototype.getRegisteredShortcutInfos = function() {
		return this._getShortcutHintInfos().filter(function(info) {
			return ShortcutHintsMixin.isDOMIDRegistered(info.id);
		}, this);
	};

	/**
	 * Shows a shortcut hint for this instance for the attached command.
	 */
	ShortcutHintsMixin.prototype.showShortcutHint = function(oHintInfos) {
		var sTimeoutID,
			sPosition = oHintInfos[0].position || "0 8",
			sMy = Popup.Dock.CenterTop,
			sOf = Popup.Dock.CenterBottom,
			oPopup = _getHintPopup(),
			$ShortcutHintRef = oHintInfos[0].ref,
			sShortcut = _getShortcutHintText(oHintInfos[0].id),
			mTooltips;

		if (!_isElementVisible($ShortcutHintRef) || !_isElementInViewport($ShortcutHintRef)) {
			return;
		}

		// concatenate with the tooltip
		mTooltips = this._getControlTooltips();
		if (mTooltips[oHintInfos[0].id]) {
			sShortcut = mTooltips[oHintInfos[0].id].tooltip + " (" + sShortcut + ")";
		}

		if (!oPopup) {
			oPopup = _createShortcutHintPopup(sShortcut);
		}
		oPopup.oContent.children[0].textContent = sShortcut;

		// in the mass case open, only once with the position for the lead control of the group
		if (!oPopup.isOpen()) {
			oPopup.open(1000, sMy, sOf, $ShortcutHintRef, sPosition, "flipfit", function(params) {
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
	};

	/**
	 * Hides the shortcut hint for this instance.
	 */
	ShortcutHintsMixin.prototype.hideShortcutHint = function() {
		var oPopup = _getHintPopup();
		if (oPopup && oPopup.isOpen()) {
			oPopup.close();
		}
	};

	/**
	 * Finds the matching shortcut hint info that
	 * refers or contains the DOM event target.
	 * As a side effect caches the tested DOM references.
	 */
	ShortcutHintsMixin.prototype._findShortcutOptionsForRef = function(domEventTarget) {
		var oHintInfo,
			aInfos = this.getRegisteredShortcutInfos(),
			i,
			aResultInfos = [];

		for (i = 0; i < aInfos.length; i++) {
			oHintInfo = aInfos[i];
			oHintInfo.ref = document.getElementById(oHintInfo.id);

			if (oHintInfo.ref && oHintInfo.ref.contains(domEventTarget)) {
				aResultInfos.push(oHintInfo);
			}
		}

		return aResultInfos;
	};

	/**
	 * Gets all the native tooltip texts for a control. Relies on a
	 * control-provided tooltip getter - _getTitleAttribute. Uses
	 * control's getTooltip as a fallback.
	 *
	 * @returns {object} A map with tooltip strings by DOM node
	 */
	ShortcutHintsMixin.prototype._getControlTooltips = function() {
		var aInfos = this.getRegisteredShortcutInfos(),
			oControl = Element.registry.get(this.sControlId);

		return aInfos.reduce(function(mResult, oHintInfo) {
			var sTooltip = oControl._getTitleAttribute && oControl._getTitleAttribute(oHintInfo.id);

			if (!sTooltip) {
				sTooltip = oControl.getTooltip();
			}

			if (sTooltip) {
				mResult[oHintInfo.id] = {
					tooltip: sTooltip
				};
			}

			return mResult;
		}, {});
	};

	/**
	 * Maintains the accessibility label's content and reference to the control's DOM.
	 *
	 * @param {object} oHintInfo An object with the registration details for the shortcut
	 */
	ShortcutHintsMixin.prototype._updateShortcutHintAccLabel = function(oHintInfo) {
		var oInvText,
			sInvTextId,
			oControl;

		if (!oHintInfo.addAccessibilityLabel) {
			return;
		}

		oControl = Element.registry.get(this.sControlId);

		if (!oControl.getAriaDescribedBy) {
			return;
		}

		oInvText = getInvisibleText(oControl);
		sInvTextId = oInvText.getId();

		oInvText.setText(_getShortcutHintText(oHintInfo.id));

		if (!oInvText.getText()) {
			oControl.removeAriaDescribedBy(sInvTextId);
		} else if (oControl.getAriaDescribedBy().indexOf(sInvTextId) === -1) {
			oControl.addAriaDescribedBy(sInvTextId);
		}
	};

	/*
	* This is a registry for all controls interested in showing command shortcuts.
	*/
	var oHintRegistry = Object.create(null);
	oHintRegistry.mControls = {};
	oHintRegistry.mDOMNodes = {};

	var oHintsEventDelegate = {
		"onfocusin": function(oEvent) {
			var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);

			if (!oShortcutHintRefs.length) {
				return;
			}

			ShortcutHintsMixin.hideAll();

			this._updateShortcutHintAccLabel(oShortcutHintRefs[0]);
			this.showShortcutHint(oShortcutHintRefs);
		},
		"onfocusout": function(oEvent) {
			var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);

			if (!oShortcutHintRefs.length) {
				return;
			}

			this.hideShortcutHint();
		},
		"onmouseover": function(oEvent) {
			var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target),
				oDOMRef;

			if (!oShortcutHintRefs.length) {
				return;
			}

			oDOMRef = oShortcutHintRefs[0].ref;

			if (!_isElementFocusable(oDOMRef)) {
				return;
			}

			if (checkMouseEnterOrLeave(oEvent, oDOMRef)) {
				ShortcutHintsMixin.hideAll();

				this.showShortcutHint(oShortcutHintRefs);
			}
		},
		"onmouseout": function(oEvent) {
			var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);

			if (!oShortcutHintRefs.length) {
				return;
			}

			if (checkMouseEnterOrLeave(oEvent, oShortcutHintRefs[0].ref)) {
				// do not hide if the element is focused
				if (oShortcutHintRefs[0].ref.contains(document.activeElement)) {
					return;
				}

				this.hideShortcutHint();
			}
		},
		"onAfterRendering": function() {
			var aInfos = this.getRegisteredShortcutInfos(),
				oElement,
				sDOMRefID;

			for (var i = 0; i < aInfos.length; i++) {
				sDOMRefID = aInfos[i].id;
				oElement = document.getElementById(sDOMRefID);
				oElement.setAttribute("aria-keyshortcuts", _getShortcutHintText(sDOMRefID));
			}
		}
	};

	/**
	 * Gets the shortcut hint text for a registered DOM node.
	 *
	 * @param {string} sDOMRefID A registered DOM node ID
	 */
	function _getShortcutHintText(sDOMRefID) {
		var aHints = oHintRegistry.mDOMNodes[sDOMRefID];

		if (!aHints || !aHints.length) {
			return;
		}

		return aHints.map(function(oHint) {
			return oHint._getShortcutText();
		}).join(", ");
	}

	/**
	 * Gets or creates an InvisibleText for the control's shortcut accessiblity.
	 *
	 * @param {sap.ui.core.Control} oControl A control that have shortcut assigned
	 */
	function getInvisibleText(oControl) {
		if (!oControl._shortcutInvisibleText) {
			var oFunc = oControl.exit;
			oControl._shortcutInvisibleText = new InvisibleText();
			oControl._shortcutInvisibleText.toStatic();
			oControl.exit = function() {
				this._shortcutInvisibleText.destroy();
				oFunc.call(this);
			};
		}

		return oControl._shortcutInvisibleText;
	}

	/**
	 * Gets a popup for the shortcut hint.
	 */
	function _getHintPopup() {
		return ShortcutHintsMixin._popup;
	}

	/**
	 * Creates a popup with the provided text content.
	 *
	 * @param {string} sTextContent Text content for the popup
	 */
	function _createShortcutHintPopup(sTextContent) {
		var oPopup,
			oContainerElement,
			oTextContentElement;

		oContainerElement = document.createElement("span");
		oContainerElement.classList.add("sapUiHintContainer");

		oTextContentElement = document.createElement("div");
		oTextContentElement.classList.add("sapUiHintText");
		oTextContentElement.textContent = sTextContent;

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

		ShortcutHintsMixin._popup = oPopup;

		return oPopup;
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
	 * Determines if a DOM element has a tabindex.
	 */
	function _elementHasTabIndex(elem) {
		var iTabIndex = elem.tabIndex;

		return iTabIndex != null
			&& iTabIndex >= 0
			&& (elem.getAttribute("disabled") == null
				|| elem.getAttribute("tabindex"));
	}

	/**
	 * Determines if a DOM element is focusable.
	 */
	function _isElementFocusable(elem) {
		return elem.nodeType == 1
			&& _isElementVisible(elem)
			&& _elementHasTabIndex(elem);
	}

	return ShortcutHintsMixin;
});