/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RenameHandler.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils',
	'sap/ui/dt/DOMUtil'
], function(
	jQuery,
	Plugin,
	Overlay,
	ElementUtil,
	OverlayUtil,
	OverlayRegistry,
	Utils,
	DOMUtil
) {
	"use strict";

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
		/**
		 * @override
		 */
		_manageClickEvent : function (vEventOrElement) {
			var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
			if (oOverlay.isSelected() && this.isRenameAvailable(oOverlay) && this.isRenameEnabled(oOverlay)) {
				oOverlay.attachBrowserEvent("click", RenameHandler._onClick, this);
			} else {
				oOverlay.detachBrowserEvent("click", RenameHandler._onClick, this);
			}
		},

		/**
		 * @param {sap.ui.dt.Overlay} oOverlay - target overlay
		 * @public
		 */
		startEdit : function (mPropertyBag) {
			this._bPreventMenu = true;
			this._oEditedOverlay = mPropertyBag.overlay;

			var oElement = mPropertyBag.overlay.getElement();

			var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();

			var vEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);

			// if the Control is currently not visible on the screen, we have to scroll it into view
			if (!Utils.isElementInViewport(vEditableControlDomRef)) {
				vEditableControlDomRef.get(0).scrollIntoView();
			}

			var _$ControlForWrapperDomRef = jQuery(ElementUtil.getDomRef(oElement)); /* Main Control */
			this._$oEditableControlDomRef = jQuery(vEditableControlDomRef); /* Text Control */
			var _$oEditableControlParentDomRef = this._$oEditableControlDomRef.parent(); /* Text Control parent*/

			var iWidthDifference = 0;

			var iControlForWrapperWidth = parseInt(_$ControlForWrapperDomRef.outerWidth(), 10);

			if (!isNaN(iControlForWrapperWidth)) {
				var iEditableControlWidth = parseInt(this._$oEditableControlDomRef.outerWidth(), 10);
				var iEditableControlParentWidth = parseInt(_$oEditableControlParentDomRef.outerWidth(), 10);

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

			var oOverlayForWrapper = sap.ui.dt.OverlayRegistry.getOverlay(
				vEditableControlDomRef instanceof jQuery
					? vEditableControlDomRef.get(0).id
					: vEditableControlDomRef.id
			) || mPropertyBag.overlay;

			var _$oWrapper = jQuery("<div class='sapUiRtaEditableField'></div>")
				.css({
					"white-space": "nowrap",
					"overflow":"hidden",
					"width": "calc(100% - (" + iWidthDifference + "px))"
				}).appendTo(oOverlayForWrapper.$());
			this._$editableField = jQuery("<div contentEditable='true'></div>").appendTo(_$oWrapper);

			// if label is empty, set a preliminary dummy text at the control to get an overlay
			if (this._$oEditableControlDomRef.text() === "") {
				this._$oEditableControlDomRef.text("_?_");
				this._$editableField.text("");
			} else {
				this._$editableField.text(this._$oEditableControlDomRef.text());
			}

			this.setOldValue(RenameHandler._getCurrentEditableFieldText.call(this));

			DOMUtil.copyComputedStyle(this._$oEditableControlDomRef, this._$editableField);
			this._$editableField.children().remove();
			this._$editableField.css('visibility', 'hidden');


			// TODO : for all browsers
			this._$editableField.css({
				"-moz-user-modify": "read-write",
				"-webkit-user-modify": "read-write",
				"-ms-user-modify": "read-write",
				"user-modify": "read-write",
				"text-overflow": "clip",
				"white-space": "nowrap"
			});

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

			// BCP: 1780352883
			setTimeout(function () {
				this._$oEditableControlDomRef.css("visibility", "hidden");
				_$oWrapper.offset({left: this._$oEditableControlDomRef.offset().left});
				this._$editableField.offset({left: this._$oEditableControlDomRef.offset().left});
				this._$editableField.offset({top: this._$oEditableControlDomRef.offset().top});
				this._$editableField.css('visibility', '');
				this._$editableField.focus();

				// keep Overlay selected while renaming
				mPropertyBag.overlay.setSelected(true);
				sap.ui.getCore().getEventBus().publish('sap.ui.rta', mPropertyBag.pluginMethodName, {
					overlay: mPropertyBag.overlay,
					editableField: this._$editableField
				});
			}.bind(this), 0);
		},

		_setDesignTime : function (oDesignTime) {
			this._aSelection = [];
			var oOldDesignTime = this.getDesignTime();

			if (oOldDesignTime) {
				oOldDesignTime.detachSelectionChange(RenameHandler._onDesignTimeSelectionChange, this);
			}
			Plugin.prototype.setDesignTime.apply(this, arguments);

			if (oDesignTime) {
				oDesignTime.attachSelectionChange(RenameHandler._onDesignTimeSelectionChange, this);
				this._aSelection = this.getSelectedOverlays();
			}
		},

		/**
		 * @override
		 */
		_onDesignTimeSelectionChange : function(oEvent) {
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
		_stopPropagation : function (oEvent) {
			oEvent.stopPropagation();
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldFocus : function (oEvent) {
			var el = oEvent.target;
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},

		/**
		 * @param {boolean} bRestoreFocus - true if the focus should be restored on overlay after rename
		 * @private
		 */
		_stopEdit : function (bRestoreFocus, sPluginMethodName) {
			this._bPreventMenu = false;

			// exchange the dummy text at the label with the genuine empty text (see start_edit function)
			if (this._$oEditableControlDomRef.text() === "_?_") {
				this._$oEditableControlDomRef.text("");
			}

			this._oEditedOverlay.$().find(".sapUiRtaEditableField").remove();
			Overlay.getMutationObserver().ignoreOnce({
				target: this._$oEditableControlDomRef.get(0)
			});
			this._$oEditableControlDomRef.css("visibility", "visible");

			if (bRestoreFocus) {
				var oOverlay = this._oEditedOverlay;

				oOverlay.setSelected(true);
				oOverlay.focus();
			}

			delete this._$editableField;
			delete this._$oEditableControlDomRef;
			delete this._oEditedOverlay;

			sap.ui.getCore().getEventBus().publish('sap.ui.rta', sPluginMethodName, {
				overlay: oOverlay
			});
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldBlur : function (oEvent) {
			this._emitLabelChangeEvent();
			this.stopEdit(false);
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onEditableFieldKeydown : function (oEvent) {
			switch (oEvent.keyCode) {
				case jQuery.sap.KeyCodes.ENTER:
					this._emitLabelChangeEvent();
					this.stopEdit(true);
					oEvent.preventDefault();
					break;
				case jQuery.sap.KeyCodes.ESCAPE:
					this.stopEdit(true);
					oEvent.preventDefault();
					break;
				case jQuery.sap.KeyCodes.DELETE:
					//Incident ID: #1680315103
					oEvent.stopPropagation();
					break;
				default:
			}
		},

		/**
		 * @returns {string} current editable field text
		 * @private
		 */
		_getCurrentEditableFieldText : function () {
			// Rename to empty string should not be possible
			// to prevent issues with disappearing elements
			// '\xa0' = non-breaking space (&nbsp)
			var sText = this._$editableField.text().trim();
			return sText === "" ? '\xa0' : sText;
		},

		/**
		 * @param {sap.ui.base.Event} oEvent - event object
		 * @private
		 */
		_onClick : function(oEvent) {
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (this.isRenameEnabled(oOverlay) && !oEvent.metaKey && !oEvent.ctrlKey) {
				this.startEdit(oOverlay);
				oEvent.preventDefault();
			}
		},

		_exit : function() {
			if (this._$oEditableControlDomRef) {
				this.stopEdit(false);
			}
		}
	};
	return RenameHandler;
}, true);