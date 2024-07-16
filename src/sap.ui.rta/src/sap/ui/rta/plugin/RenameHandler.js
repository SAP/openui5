/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RenameHandler.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/EventBus",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/util/validateText",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/Utils",
	"sap/ui/dt/DOMUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/dt/OverlayUtil"
], function(
	jQuery,
	Device,
	Element,
	EventBus,
	Plugin,
	validateText,
	Overlay,
	ElementUtil,
	OverlayRegistry,
	Utils,
	DOMUtil,
	KeyCodes,
	OverlayUtil
) {
	"use strict";

	// this key is used as replacement for an empty string to not break anything. It's the same as &nbsp (no-break space)
	var sEmptyTextKey = "\xa0";

	/**
	 * Provides Rename handling functionality
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.plugin.RenameHandler
	 */

	var RenameHandler = {

		errorStyleClass: "sapUiRtaErrorBg",

		/**
		 * @override
		 */
		async _manageClickEvent(vEventOrElement) {
			const oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
			const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay) || oOverlay;
			if (this._isEditableByPlugin(oResponsibleElementOverlay) === undefined) {
				// The responsibleElement editableByPlugin state was not evaluated yet e.g. because it
				// has no visible geometry, thus evaluateEditable now
				// This async check leads to a slight delay where the second click is not registered
				// which shouldn't be a problem since a human user needs > 100ms to click twice
				await this.evaluateEditable([oResponsibleElementOverlay], { onRegistration: false });
			}
			if (
				oOverlay.isSelected()
				&& this.isRenameAvailable(oOverlay)
				&& this.isRenameAvailable(oResponsibleElementOverlay)
				&& this.isRenameEnabled([oOverlay])
			) {
				oOverlay.attachBrowserEvent("click", RenameHandler._onClick, this);
			}
		},

		_setEditableFieldPosition() {
			if (this._oEditableField) {
				jQuery(this._oEditableField).offset({left: DOMUtil.getOffset(this._oEditableControlDomRef).left});
				jQuery(this._oEditableField).offset({top: DOMUtil.getOffset(this._oEditableControlDomRef).top});
				this._oEditedOverlay.setSelected(true);
				this._oEditableField.focus();
			}
		},

		/**
		 * @param {map} mPropertyBag - (required) contains required properties
		 * @public
		 */
		startEdit(mPropertyBag) {
			if (this.getBusy()) {
				return;
			}
			this.setBusy(true);
			this._oEditedOverlay = mPropertyBag.overlay;

			this._bPreviouslyMovable = this._oEditedOverlay.getMovable();
			// This prevents a bug in firefox where the element can be dragged during rename
			this._oEditedOverlay.setMovable(false);
			OverlayUtil.setFirstParentMovable(this._oEditedOverlay, false);

			var oElement = mPropertyBag.overlay.getElement();

			var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();

			var oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);

			// if the Control is currently not visible on the screen, we have to scroll it into view
			if (!DOMUtil.isElementInViewport(oEditableControlDomRef)) {
				oEditableControlDomRef.get(0).scrollIntoView();
			}

			this._oEditableControlDomRef = oEditableControlDomRef.get(0); /* Text Control */
			var mMutators = typeof mPropertyBag.getTextMutators === "function"
				? mPropertyBag.getTextMutators(oElement)
				: {
					getText: function() {
						return this._oEditableControlDomRef.textContent;
					}.bind(this),
					setText: function(sNewText) {
						this._oEditableControlDomRef.textContent = sNewText;
					}.bind(this)
				};
			this._fnGetControlText = mMutators.getText;
			this._fnSetControlText = mMutators.setText;
			var iWidthDifference = 0;

			// case where the editable control has it's own overlay
			var oOverlayForWrapper = OverlayRegistry.getOverlay(
				oEditableControlDomRef.jquery
					? oEditableControlDomRef.get(0).id
					: oEditableControlDomRef.id
			);

			// if the editable control overlay could not be found, then the passed overlay should be considered
			// for this purpose the width of the editable control should be adjusted
			if (!oOverlayForWrapper) {
				oOverlayForWrapper = this._oEditedOverlay;
				var _oControlForWrapperDomRef = ElementUtil.getDomRef(oElement); /* Main Control */
				var _oEditableControlParentDomRef = this._oEditableControlDomRef.parentNode; /* Text Control parent */
				var iControlForWrapperWidth = _oControlForWrapperDomRef ? parseInt(_oControlForWrapperDomRef.offsetWidth) : "NaN"; /* Main Control Width */

				if (!isNaN(iControlForWrapperWidth)) {
					var iEditableControlWidth = parseInt(this._oEditableControlDomRef.offsetWidth);
					var iEditableControlParentWidth = parseInt(_oEditableControlParentDomRef.offsetWidth);
					iWidthDifference = iControlForWrapperWidth - iEditableControlWidth;

					var aCHildren = Array.from(_oEditableControlParentDomRef.children);
					var aVisibleChildren = aCHildren.filter(function(oNode) {
						return DOMUtil.isVisible(oNode);
					});

					if (iWidthDifference < 0 && iEditableControlParentWidth) {
						if (_oEditableControlParentDomRef.id !== _oControlForWrapperDomRef.id
							&& aVisibleChildren.length === 1
							&& aVisibleChildren[0].id === this._oEditableControlDomRef.id
							&& iControlForWrapperWidth > iEditableControlParentWidth) {
							iWidthDifference = iControlForWrapperWidth - iEditableControlParentWidth;
						} else {
							iWidthDifference = 0;
						}
					}
				}
			}

			var _oWrapperDomRef = document.createElement("div");
			_oWrapperDomRef.classList.add("sapUiRtaEditableField");
			_oWrapperDomRef.style.whiteSpace = "nowrap";
			_oWrapperDomRef.style.overflow = "hidden";
			_oWrapperDomRef.style.width = `calc(100% - (${iWidthDifference}px))`;
			oOverlayForWrapper.getDomRef().append(_oWrapperDomRef);
			var _oEditableFieldDomRef = document.createElement("div");
			_oEditableFieldDomRef.setAttribute("contentEditable", "true");
			_oWrapperDomRef.append(_oEditableFieldDomRef);
			this._oEditableField = _oEditableFieldDomRef;

			// if label is empty, set a preliminary dummy text at the control to get an overlay
			var sCurrentText = this._fnGetControlText();
			if (sCurrentText === "") {
				this._fnSetControlText("_?_");
				this._oEditableField.textContent = "";
			} else {
				this._oEditableField.textContent = sCurrentText;
			}

			this.setOldValue(RenameHandler._getCurrentEditableFieldText.call(this));

			DOMUtil.copyComputedStyle(this._oEditableControlDomRef, this._oEditableField);
			while (this._oEditableField.lastElementChild) {
				this._oEditableField.removeChild(this._oEditableField.lastElementChild);
			}

			this._oEditableField.style.visibility = "hidden";
			this._oEditableField.style["-moz-user-modify"] = "read-write";
			this._oEditableField.style["-webkit-user-modify"] = "read-write";
			this._oEditableField.style["-ms-user-modify"] = "read-write";
			this._oEditableField.style["user-modify"] = "read-write";
			this._oEditableField.style.userSelect = "text";
			this._oEditableField.style["-webkit-user-select"] = "text";
			this._oEditableField.style.textOverflow = "clip";
			this._oEditableField.style.whiteSpace = "nowrap";

			// only for renaming variants in edge browser [SPECIAL CASE]
			if (
				Device.browser.name === "ed"
				&& oElement.getMetadata().getName() === "sap.ui.fl.variants.VariantManagement"
			) {
				this._oEditableField.style.lineHeight = "normal";
			}

			Overlay.getMutationObserver().ignoreOnce({
				target: this._oEditableControlDomRef
			});

			this._FocusHandler = RenameHandler._onEditableFieldFocus.bind(this);
			this._oBlurHandler = RenameHandler._onEditableFieldBlur.bind(this);
			this._oKeyDownHandler = RenameHandler._onEditableFieldKeydown.bind(this);
			this._oStopPropagationHandler = RenameHandler._stopPropagation.bind(this);

			this._oEditableField.addEventListener("focus", this._FocusHandler, {once: true});
			this._oEditableField.addEventListener("blur", this._oBlurHandler);
			this._oEditableField.addEventListener("keydown", this._oKeyDownHandler);
			this._oEditableField.addEventListener("dragstart", this._oStopPropagationHandler);
			this._oEditableField.addEventListener("drag", this._oStopPropagationHandler);
			this._oEditableField.addEventListener("dragend", this._oStopPropagationHandler);
			this._oEditableField.addEventListener("click", this._oStopPropagationHandler);
			this._oEditableField.addEventListener("mousedown", this._oStopPropagationHandler);

			this._oEditableControlDomRef.style.visibility = "hidden";
			jQuery(_oWrapperDomRef).offset({left: DOMUtil.getOffset(this._oEditableControlDomRef).left});
			RenameHandler._setEditableFieldPosition.apply(this);
			this._oEditableField.style.visibility = "";
			this._oEditableField.focus();

			// If scrolling happens during startEdit, the position of the editable field can be wrong
			// To avoid this, the position is recalculated after the scrollbar synchronization is ready
			this._aOverlaysWithScrollbar = OverlayUtil.findParentOverlaysWithScrollbar(oOverlayForWrapper);
			this._aOverlaysWithScrollbar.forEach(function(oOverlayWithScrollbar) {
				oOverlayWithScrollbar.attachScrollSynced(RenameHandler._setEditableFieldPosition, this);
			}.bind(this));

			// keep Overlay selected while renaming
			mPropertyBag.overlay.setSelected(true);
			EventBus.getInstance().publish("sap.ui.rta", mPropertyBag.pluginMethodName, {
				overlay: mPropertyBag.overlay,
				editableField: this._oEditableField
			});
		},

		_setDesignTime(...aArgs) {
			const [oDesignTime] = aArgs;
			this._aSelection = [];
			var oOldDesignTime = this.getDesignTime();

			if (oOldDesignTime) {
				oOldDesignTime.getSelectionManager().detachChange(RenameHandler._onDesignTimeSelectionChange, this);
			}
			Plugin.prototype.setDesignTime.apply(this, aArgs);

			if (oDesignTime) {
				oDesignTime.getSelectionManager().attachChange(RenameHandler._onDesignTimeSelectionChange, this);
				this._aSelection = this.getSelectedOverlays();
			}
		},

		/**
		 * @override
		 */
		_onDesignTimeSelectionChange(oEvent) {
			var aSelection = oEvent.getParameter("selection");

			// detach events from previous selection
			this._aSelection.forEach((vSelection) => {
				const oOverlay = vSelection.getSource ? vSelection.getSource() : vSelection;
				oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);
			});
			// attach events to the new selection
			aSelection.forEach(RenameHandler._manageClickEvent, this);

			this._aSelection = aSelection;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_stopPropagation(oEvent) {
			oEvent.stopPropagation();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_preventDefault(oEvent) {
			oEvent.preventDefault();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldFocus(oEvent) {
			var el = oEvent.target;
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},

		/**
		 * @param {boolean} bRestoreFocus - true if the focus should be restored on overlay after rename
		 * @param {string} sPluginMethodName - method name of the plugin
		 * @private
		 */
		_stopEdit(bRestoreFocus, sPluginMethodName) {
			var oOverlay;
			this.setBusy(false);
			this._oEditableField.removeEventListener("blur", this._oBlurHandler);
			this._oEditableField.removeEventListener("focus", this._FocusHandler);
			this._oEditableField.removeEventListener("keydown", this._oKeyDownHandler);
			this._oEditableField.removeEventListener("dragstart", this._oStopPropagationHandler);
			this._oEditableField.removeEventListener("drag", this._oStopPropagationHandler);
			this._oEditableField.removeEventListener("dragend", this._oStopPropagationHandler);
			this._oEditableField.removeEventListener("click", this._oStopPropagationHandler);
			this._oEditableField.removeEventListener("mousedown", this._oStopPropagationHandler);

			// exchange the dummy text at the label with the genuine empty text (see start_edit function)
			if (this._fnGetControlText() === "_?_") {
				this._fnSetControlText("");
			}

			Overlay.getMutationObserver().ignoreOnce({
				target: this._oEditableControlDomRef
			});
			this._oEditableControlDomRef.style.visibility = "visible";

			if (bRestoreFocus) {
				oOverlay = this._oEditedOverlay;
				oOverlay.setSelected(true);
				oOverlay.focus();
			}

			this._aOverlaysWithScrollbar.forEach(function(oOverlayWithScrollbar) {
				oOverlayWithScrollbar.detachScrollSynced(RenameHandler._setEditableFieldPosition, this);
			}.bind(this));
			delete this._oEditableField;
			var oEditField = this._oEditedOverlay.getDomRef() && this._oEditedOverlay.getDomRef().querySelector(".sapUiRtaEditableField");
			if (oEditField) {
				oEditField.remove();
			}
			this._oEditedOverlay.setMovable(this._bPreviouslyMovable);
			OverlayUtil.setFirstParentMovable(this._oEditedOverlay, true);
			delete this._oEditableControlDomRef;
			delete this._oEditedOverlay;
			delete this._bBlurOrKeyDownStarted;
			delete this._fnGetControlText;
			delete this._fnSetControlText;

			EventBus.getInstance().publish("sap.ui.rta", sPluginMethodName, {
				overlay: oOverlay
			});
		},

		_onEditableFieldBlur(oEvent) {
			// Destroying the overlay (or removing it from a parent) also triggers a "blur" event
			// coming from the remove() call, but we should not react on it
			if (!this._oEditedOverlay.isDestroyStarted() && this._oEditedOverlay.getParentElementOverlay()) {
				RenameHandler._handlePostRename.call(this, false, oEvent);
			}
		},

		async _handlePostRename(bRestoreFocus, oEvent) {
			let fnErrorHandler;
			if (!this._bBlurOrKeyDownStarted) {
				this._oEditedOverlay.removeStyleClass(RenameHandler.errorStyleClass);
				this._bBlurOrKeyDownStarted = true;
				if (oEvent) {
					RenameHandler._preventDefault.call(this, oEvent);
					RenameHandler._stopPropagation.call(this, oEvent);
				}
				try {
					try {
						RenameHandler._validateNewText.call(this);
						fnErrorHandler = await this._emitLabelChangeEvent();
					} catch (oError) {
						if (oError.message !== "sameTextError") {
							throw oError;
						}
					}
					this.stopEdit(bRestoreFocus);
					// ControlVariant rename handles the validation itself
					if (typeof fnErrorHandler === "function") {
						fnErrorHandler(); // contains startEdit()
					}
				} catch (oError) {
					await RenameHandler._handleInvalidRename.call(this, oError.message, bRestoreFocus);
				}
			}
		},

		_handleInvalidRename(sErrorMessage, bRestoreFocus) {
			return Utils.showMessageBox("error", sErrorMessage, {
				titleKey: "RENAME_ERROR_TITLE"
			})
			.then(function() {
				var oOverlay = this._oEditedOverlay;
				oOverlay.setIgnoreEnterKeyUpOnce(false);
				oOverlay.addStyleClass(RenameHandler.errorStyleClass);
				this.stopEdit(bRestoreFocus);
				this.startEdit(oOverlay);
			}.bind(this));
		},

		_validateNewText() {
			var oResponsibleOverlay = this.getResponsibleElementOverlay(this._oEditedOverlay);
			var oRenameAction = this.getAction(oResponsibleOverlay);
			var sNewText = RenameHandler._getCurrentEditableFieldText.call(this);
			validateText(sNewText, this.getOldValue(), oRenameAction);
		},

		_onEditableFieldKeydown(oEvent) {
			switch (oEvent.keyCode) {
				case KeyCodes.ENTER:
					// to prevent context menu from opening when rename is finished
					this._oEditedOverlay.setIgnoreEnterKeyUpOnce(true);
					return RenameHandler._handlePostRename.call(this, true, oEvent);
				case KeyCodes.ESCAPE:
					this._oEditedOverlay.removeStyleClass(RenameHandler.errorStyleClass);
					this.stopEdit(true);
					RenameHandler._preventDefault.call(this, oEvent);
					break;
				case KeyCodes.DELETE:
				case KeyCodes.BACKSPACE:
					// Incident IDs: #1680315103, #2380033173
					RenameHandler._stopPropagation.call(this, oEvent);
					break;
				default:
			}
			return Promise.resolve();
		},

		/**
		 * @returns {string} current editable field text
		 * @private
		 */
		_getCurrentEditableFieldText() {
			// Rename to empty string should not be possible
			// to prevent issues with disappearing elements
			var sText = this._oEditableField ? this._oEditableField.textContent.trim() : "";
			return sText === "" ? sEmptyTextKey : sText;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onClick(oEvent) {
			var oOverlay = Element.getElementById(oEvent.currentTarget.id);
			if (this.isRenameEnabled([oOverlay]) && !oEvent.metaKey && !oEvent.ctrlKey && !oEvent.shiftKey) {
				this.startEdit(oOverlay);
				RenameHandler._preventDefault.call(this, oEvent);
			}
		},

		_exit() {
			if (this._oEditableControlDomRef) {
				this.stopEdit(false);
			}
		}
	};
	return RenameHandler;
});