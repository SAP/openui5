/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RenameHandler.
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/Utils",
	"sap/ui/dt/DOMUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/dt/OverlayUtil"
], function(
	BindingParser,
	jQuery,
	Device,
	Plugin,
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

	function checkPreconditionsAndThrowError(sNewText, sOldText) {
		if (sOldText === sNewText) {
			throw Error("sameTextError");
		}

		var oBindingParserResult;
		var bError;
		try {
			oBindingParserResult = BindingParser.complexParser(sNewText, undefined, true);
		} catch (error) {
			bError = true;
		}

		if (oBindingParserResult && typeof oBindingParserResult === "object" || bError) {
			throw Error(sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("RENAME_BINDING_ERROR_TEXT"));
		}
	}

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
	 * @experimental Since 1.52. This class is experimental and provides only limited functionality. Also the API might be
	 * changed in future.
	 */
	var RenameHandler = {

		errorStyleClass: "sapUiRtaErrorBg",

		validators: {
			noEmptyText: {
				validatorFunction: function(sNewText) {
					return sNewText !== sEmptyTextKey;
				},
				errorMessage: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("RENAME_EMPTY_ERROR_TEXT")
			}
		},

		/**
		 * @override
		 */
		_manageClickEvent: function (vEventOrElement) {
			var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
			if (oOverlay.isSelected() && this.isRenameAvailable(oOverlay) && this.isRenameEnabled([oOverlay])) {
				oOverlay.attachBrowserEvent("click", RenameHandler._onClick, this);
			} else {
				oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);
			}
		},

		_setEditableFieldPosition: function() {
			if (this._$editableField) {
				this._$editableField.offset({left: this._$oEditableControlDomRef.offset().left});
				this._$editableField.offset({top: this._$oEditableControlDomRef.offset().top});
			}
		},

		/**
		 * @param {map} mPropertyBag - (required) contains required properties
		 * @public
		 */
		startEdit: function (mPropertyBag) {
			this.setBusy(true);
			this._oEditedOverlay = mPropertyBag.overlay;

			var oElement = mPropertyBag.overlay.getElement();

			var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();

			var vEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);

			// if the Control is currently not visible on the screen, we have to scroll it into view
			if (!Utils.isElementInViewport(vEditableControlDomRef)) {
				vEditableControlDomRef.get(0).scrollIntoView();
			}

			this._$oEditableControlDomRef = jQuery(vEditableControlDomRef); /* Text Control */
			var mMutators = typeof mPropertyBag.getTextMutators === "function"
				? mPropertyBag.getTextMutators(oElement)
				: {
					getText: function () {
						return this._$oEditableControlDomRef.text();
					}.bind(this),
					setText: function (sNewText) {
						this._$oEditableControlDomRef.text(sNewText);
					}.bind(this)
				};
			this._fnGetControlText = mMutators.getText;
			this._fnSetControlText = mMutators.setText;
			var iWidthDifference = 0;

			// case where the editable control has it's own overlay
			var oOverlayForWrapper = OverlayRegistry.getOverlay(
				vEditableControlDomRef instanceof jQuery
					? vEditableControlDomRef.get(0).id
					: vEditableControlDomRef.id
			);

			// if the editable control overlay could not be found, then the passed overlay should be considered
			// for this purpose the width of the editable control should be adjusted
			if (!oOverlayForWrapper) {
				oOverlayForWrapper = this._oEditedOverlay;
				var _$ControlForWrapperDomRef = jQuery(ElementUtil.getDomRef(oElement)); /* Main Control */
				var _$oEditableControlParentDomRef = this._$oEditableControlDomRef.parent(); /* Text Control parent */
				var iControlForWrapperWidth = parseInt(_$ControlForWrapperDomRef.outerWidth()); /* Main Control Width */

				if (!isNaN(iControlForWrapperWidth)) {
					var iEditableControlWidth = parseInt(this._$oEditableControlDomRef.outerWidth());
					var iEditableControlParentWidth = parseInt(_$oEditableControlParentDomRef.outerWidth());

					iWidthDifference = iControlForWrapperWidth - iEditableControlWidth;

					if (iWidthDifference < 0 && iEditableControlParentWidth) {
						if (_$oEditableControlParentDomRef.get(0).id !== _$ControlForWrapperDomRef.get(0).id
							&& _$oEditableControlParentDomRef.children(":visible").length === 1
							&& _$oEditableControlParentDomRef.children(":visible").get(0).id === this._$oEditableControlDomRef.get(0).id
							&& iControlForWrapperWidth > iEditableControlParentWidth) {
							iWidthDifference = iControlForWrapperWidth - iEditableControlParentWidth;
						} else {
							iWidthDifference = 0;
						}
					}
				}
			}

			var _$oWrapper = jQuery("<div class='sapUiRtaEditableField'></div>")
				.css({
					"white-space": "nowrap",
					overflow: "hidden",
					width: "calc(100% - (" + iWidthDifference + "px))"
				}).appendTo(oOverlayForWrapper.$());
			this._$editableField = jQuery("<div contentEditable='true'></div>").appendTo(_$oWrapper);

			// if label is empty, set a preliminary dummy text at the control to get an overlay
			var sCurrentText = this._fnGetControlText();
			if (sCurrentText === "") {
				this._fnSetControlText("_?_");
				this._$editableField.text("");
			} else {
				this._$editableField.text(sCurrentText);
			}

			this.setOldValue(RenameHandler._getCurrentEditableFieldText.call(this));

			DOMUtil.copyComputedStyle(this._$oEditableControlDomRef, this._$editableField);
			this._$editableField.children().remove();
			this._$editableField.css("visibility", "hidden");

			this._$editableField.css({
				"-moz-user-modify": "read-write",
				"-webkit-user-modify": "read-write",
				"-ms-user-modify": "read-write",
				"user-modify": "read-write",
				"user-select": "text",
				"-webkit-user-select": "text",
				"text-overflow": "clip",
				"white-space": "nowrap"
			});

			//only for renaming variants in edge browser [SPECIAL CASE]
			if (
				Device.browser.name === "ed"
				&& oElement.getMetadata().getName() === "sap.ui.fl.variants.VariantManagement"
			) {
				this._$editableField.css({
					"line-height": "normal"
				});
			}

			Overlay.getMutationObserver().ignoreOnce({
				target: this._$oEditableControlDomRef.get(0)
			});

			this._$editableField.one("focus", RenameHandler._onEditableFieldFocus.bind(this));

			this._$editableField.on("blur", RenameHandler._onEditableFieldBlur.bind(this));
			this._$editableField.on("keydown", RenameHandler._onEditableFieldKeydown.bind(this));
			this._$editableField.on("dragstart", RenameHandler._stopPropagation.bind(this));
			this._$editableField.on("drag", RenameHandler._stopPropagation.bind(this));
			this._$editableField.on("dragend", RenameHandler._stopPropagation.bind(this));

			this._$editableField.on("click", RenameHandler._stopPropagation.bind(this));
			this._$editableField.on("mousedown", RenameHandler._stopPropagation.bind(this));

			this._$oEditableControlDomRef.css("visibility", "hidden");
			_$oWrapper.offset({left: this._$oEditableControlDomRef.offset().left});
			RenameHandler._setEditableFieldPosition.apply(this);
			this._$editableField.css("visibility", "");
			this._$editableField.trigger("focus");

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
				editableField: this._$editableField
			});
		},

		_setDesignTime: function (oDesignTime) {
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
		_stopPropagation: function (oEvent) {
			oEvent.stopPropagation();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_preventDefault: function (oEvent) {
			oEvent.preventDefault();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldFocus: function (oEvent) {
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
		_stopEdit: function (bRestoreFocus, sPluginMethodName) {
			var oOverlay;
			this.setBusy(false);

			// exchange the dummy text at the label with the genuine empty text (see start_edit function)
			if (this._fnGetControlText() === "_?_") {
				this._fnSetControlText("");
			}

			this._oEditedOverlay.$().find(".sapUiRtaEditableField").remove();
			Overlay.getMutationObserver().ignoreOnce({
				target: this._$oEditableControlDomRef.get(0)
			});
			this._$oEditableControlDomRef.css("visibility", "visible");

			if (bRestoreFocus) {
				oOverlay = this._oEditedOverlay;

				oOverlay.setSelected(true);
				oOverlay.focus();
			}

			this._aOverlaysWithScrollbar.forEach(function(oOverlayWithScrollbar) {
				oOverlayWithScrollbar.detachScrollSynced(RenameHandler._setEditableFieldPosition, this);
			}.bind(this));
			delete this._$editableField;
			delete this._$oEditableControlDomRef;
			delete this._oEditedOverlay;
			delete this._bBlurOrKeyDownStarted;
			delete this._fnGetControlText;
			delete this._fnSetControlText;

			sap.ui.getCore().getEventBus().publish("sap.ui.rta", sPluginMethodName, {
				overlay: oOverlay
			});
		},

		_onEditableFieldBlur: function () {
			return RenameHandler._handlePostRename.call(this, false);
		},

		_handlePostRename: function (bRestoreFocus, oEvent) {
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
				.then(function (fnErrorHandler) {
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
			var sErrorText;
			var sNewText = RenameHandler._getCurrentEditableFieldText.call(this);

			checkPreconditionsAndThrowError(sNewText, this.getOldValue());

			var oResponsibleOverlay = this.getResponsibleElementOverlay(this._oEditedOverlay);
			var oRenameAction = this.getAction(oResponsibleOverlay);
			var aValidators = oRenameAction && oRenameAction.validators || [];
			aValidators.some(function(vValidator) {
				var oValidator;
				if (
					typeof vValidator === "string"
					&& RenameHandler.validators[vValidator]
				) {
					oValidator = RenameHandler.validators[vValidator];
				} else {
					oValidator = vValidator;
				}

				if (!oValidator.validatorFunction(sNewText)) {
					sErrorText = oValidator.errorMessage;
					return true;
				}
			});

			if (sErrorText) {
				throw Error(sErrorText);
			}
		},

		_onEditableFieldKeydown: function (oEvent) {
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
					//Incident ID: #1680315103
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
		_getCurrentEditableFieldText: function () {
			// Rename to empty string should not be possible
			// to prevent issues with disappearing elements
			var sText = this._$editableField.text().trim();
			return sText === "" ? sEmptyTextKey : sText;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onClick: function(oEvent) {
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (this.isRenameEnabled([oOverlay]) && !oEvent.metaKey && !oEvent.ctrlKey) {
				this.startEdit(oOverlay);
				RenameHandler._preventDefault.call(this, oEvent);
			}
		},

		_exit: function() {
			if (this._$oEditableControlDomRef) {
				this.stopEdit(false);
			}
		}
	};
	return RenameHandler;
}, true);