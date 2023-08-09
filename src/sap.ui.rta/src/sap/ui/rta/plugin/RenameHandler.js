/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RenameHandler.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
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
		_manageClickEvent: function(vEventOrElement) {
			var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
			if (oOverlay.isSelected() && this.isRenameAvailable(oOverlay) && this.isRenameEnabled([oOverlay])) {
				oOverlay.attachBrowserEvent("click", RenameHandler._onClick, this);
			} else {
				oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);
			}
		},

		_setEditableFieldPosition: function() {
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
		startEdit: function(mPropertyBag) {
			this.setBusy(true);
			this._oEditedOverlay = mPropertyBag.overlay;

			var oElement = mPropertyBag.overlay.getElement();

			var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();

			var oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);

			// if the Control is currently not visible on the screen, we have to scroll it into view
			if (!Utils.isElementInViewport(oEditableControlDomRef)) {
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
			_oWrapperDomRef.style.width = "calc(100% - (" + iWidthDifference + "px))";
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
			sap.ui.getCore().getEventBus().publish("sap.ui.rta", mPropertyBag.pluginMethodName, {
				overlay: mPropertyBag.overlay,
				editableField: this._oEditableField
			});
		},

		_setDesignTime: function(oDesignTime) {
			this._aSelection = [];
			var oOldDesignTime = this.getDesignTime();

			if (oOldDesignTime) {
				oOldDesignTime.getSelectionManager().detachChange(RenameHandler._onDesignTimeSelectionChange, this);
			}
			Plugin.prototype.setDesignTime.apply(this, arguments);

			if (oDesignTime) {
				oDesignTime.getSelectionManager().attachChange(RenameHandler._onDesignTimeSelectionChange, this);
				this._aSelection = this.getSelectedOverlays();
			}
		},

		/**
		 * @override
		 */
		_onDesignTimeSelectionChange: function(oEvent) {
			var aSelection = oEvent.getParameter("selection");

			// detach events from previous selection
			this._aSelection.forEach(RenameHandler._manageClickEvent, this);
			// attach events to the new selection
			aSelection.forEach(RenameHandler._manageClickEvent, this);

			this._aSelection = aSelection;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_stopPropagation: function(oEvent) {
			oEvent.stopPropagation();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_preventDefault: function(oEvent) {
			oEvent.preventDefault();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldFocus: function(oEvent) {
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
		_stopEdit: function(bRestoreFocus, sPluginMethodName) {
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
			delete this._oEditableControlDomRef;
			delete this._oEditedOverlay;
			delete this._bBlurOrKeyDownStarted;
			delete this._fnGetControlText;
			delete this._fnSetControlText;

			sap.ui.getCore().getEventBus().publish("sap.ui.rta", sPluginMethodName, {
				overlay: oOverlay
			});
		},

		_onEditableFieldBlur: function(oEvent) {
			return RenameHandler._handlePostRename.call(this, false, oEvent);
		},

		_handlePostRename: function(bRestoreFocus, oEvent) {
			if (!this._bBlurOrKeyDownStarted) {
				this._oEditedOverlay.removeStyleClass(RenameHandler.errorStyleClass);
				this._bBlurOrKeyDownStarted = true;
				if (oEvent) {
					RenameHandler._preventDefault.call(this, oEvent);
					RenameHandler._stopPropagation.call(this, oEvent);
				}
				return Promise.resolve()
				.then(RenameHandler._validateNewText.bind(this))
				.then(this._emitLabelChangeEvent.bind(this))
				.catch(function(oError) {
					if (oError.message === "sameTextError") {
						return;
					}
					throw oError;
				})
				.then(function(fnErrorHandler) {
					this.stopEdit(bRestoreFocus);
					// ControlVariant rename handles the validation itself
					if (typeof fnErrorHandler === "function") {
						fnErrorHandler(); // contains startEdit()
					}
				}.bind(this))
				.catch(function(oError) {
					return RenameHandler._handleInvalidRename.call(this, oError.message, bRestoreFocus);
				}.bind(this));
			}
			return Promise.resolve();
		},

		_handleInvalidRename: function(sErrorMessage, bRestoreFocus) {
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

		_validateNewText: function() {
			var oResponsibleOverlay = this.getResponsibleElementOverlay(this._oEditedOverlay);
			var oRenameAction = this.getAction(oResponsibleOverlay);
			var sNewText = RenameHandler._getCurrentEditableFieldText.call(this);

			validateText(sNewText, this.getOldValue(), oRenameAction);
		},

		_onEditableFieldKeydown: function(oEvent) {
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
		_getCurrentEditableFieldText: function() {
			// Rename to empty string should not be possible
			// to prevent issues with disappearing elements
			var sText = this._oEditableField ? this._oEditableField.textContent.trim() : "";
			return sText === "" ? sEmptyTextKey : sText;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onClick: function(oEvent) {
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (this.isRenameEnabled([oOverlay]) && !oEvent.metaKey && !oEvent.ctrlKey && !oEvent.shiftKey) {
				this.startEdit(oOverlay);
				RenameHandler._preventDefault.call(this, oEvent);
			}
		},

		_exit: function() {
			if (this._oEditableControlDomRef) {
				this.stopEdit(false);
			}
		}
	};
	return RenameHandler;
}, true);