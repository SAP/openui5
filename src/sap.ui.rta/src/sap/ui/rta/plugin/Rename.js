/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Rename.
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/plugin/Plugin', 'sap/ui/dt/ElementUtil', 'sap/ui/dt/OverlayUtil',
		'sap/ui/dt/OverlayRegistry', 'sap/ui/rta/Utils', 'sap/ui/dt/DOMUtil'],
		function(jQuery, Plugin, ElementUtil, OverlayUtil, OverlayRegistry, Utils, DOMUtil) {
	"use strict";

	/**
	 * Constructor for a new Rename.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 *
	 * @class The Rename allows to create a set of Overlays above the root elements and their public children and manage
	 *        their events.
	 * @extends sap.ui.rta.plugin.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.Rename
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */
	{
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				oldValue : "string"
			},
			associations : {},
			events : {
				/** Fired when renaming is possible */
				"editable" : {},

				/** Fired when renaming is switched off */
				"nonEditable" : {}
			}
		}
	});

	/**
	 * @override
	 */
	Rename.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);

		if (this._$oEditableControlDomRef) {
			this._stopEdit();
		}

		clearTimeout(this._iStopTimeout);
	};

	/**
	 * @override
	 */
	Rename.prototype.setDesignTime = function(oDesignTime) {
		this._aSelection = [];
		var oOldDesignTime = this.getDesignTime();

		if (oOldDesignTime) {
			oOldDesignTime.detachSelectionChange(this._onDesignTimeSelectionChange, this);
		}
		Plugin.prototype.setDesignTime.apply(this, arguments);

		if (oDesignTime) {
			oDesignTime.attachSelectionChange(this._onDesignTimeSelectionChange, this);
			this._aSelection = oDesignTime.getSelection();
		}
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @returns {string} action value
	 * @private
	 */
	Rename.prototype._getRenameAction = function(oOverlay) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		if (oDesignTimeMetadata && oDesignTimeMetadata.getAction) {
			return oDesignTimeMetadata.getAction("rename", oOverlay.getElementInstance());
		}
	};

	/**
	 * Checks if rename is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @returns {boolean} true if it's editable
	 * @public
	 */
	Rename.prototype.isRenameAvailable = function(oOverlay) {
		return this._isEditableByPlugin(oOverlay);
	};

	/**
	 * Checks if rename is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @returns {boolean} true if it's enabled
	 * @public
	 */
	Rename.prototype.isRenameEnabled = function(oOverlay) {
		var bIsEnabled = true;
		var oAction = this._getRenameAction(oOverlay);
		if (!oAction) {
			bIsEnabled = false;
		}

		if (bIsEnabled && typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsEnabled = oAction.isEnabled(oOverlay.getElementInstance());
			} else {
				bIsEnabled = oAction.isEnabled;
			}
		}

		if (bIsEnabled) {
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			if (!oDesignTimeMetadata.getAssociatedDomRef(oOverlay.getElementInstance(), oAction.domRef)) {
				bIsEnabled = false;
			}
		}

		return bIsEnabled;
	};

	/**
	 * @override
	 */
	Rename.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachEvent("editableChange", this._manageClickEvent, this);


		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for editable
	 * @returns {boolean} true if it's editable
	 * @private
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		var bEditable = false;
		var oElement = oOverlay.getElementInstance();

		if (!Utils.getRelevantContainerDesigntimeMetadata(oOverlay)) {
			return false;
		}

		var oRenameAction = this._getRenameAction(oOverlay);
		if (oRenameAction && oRenameAction.changeType) {
			if (oRenameAction.changeOnRelevantContainer) {
				oElement = oOverlay.getRelevantContainer();
			}
			bEditable = this.hasChangeHandler(oRenameAction.changeType, oElement);
		}

		if (bEditable) {
			return this.hasStableId(oOverlay);
		}

		return bEditable;
	};

	/**
	 * @override
	 */
	Rename.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachEvent("editableChange", this._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", this._onClick, this);

		this.removeFromPluginsList(oOverlay);
	};

	/**
	 * @param {sap.ui.base.Event} oEvent - event object
	 * @private
	 */
	Rename.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (this.isRenameEnabled(oOverlay) && !oEvent.metaKey && !oEvent.ctrlKey) {
			this.startEdit(oOverlay);
			oEvent.preventDefault();
		}
	};

	/**
	 * @override
	 */
	Rename.prototype._onDesignTimeSelectionChange = function(oEvent) {
		var aSelection = oEvent.getParameter("selection");

		// detach events from previous selection
		this._aSelection.forEach(this._manageClickEvent, this);
		// attach events to the new selection
		aSelection.forEach(this._manageClickEvent, this);

		this._aSelection = aSelection;
	};


	/**
	 * @override
	 */
	Rename.prototype._manageClickEvent = function(vEventOrElement) {
		var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
		if (oOverlay.isSelected() && this.isRenameAvailable(oOverlay)) {
			oOverlay.attachBrowserEvent("click", this._onClick, this);
		} else {
			oOverlay.detachBrowserEvent("click", this._onClick, this);
		}
	};

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay - target overlay
	 * @public
	 */
	Rename.prototype.startEdit = function(oOverlay) {

		this._oEditedOverlay = oOverlay;

		var oElement = oOverlay.getElementInstance();
		var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();
		var vDomRef = oDesignTimeMetadata.getAction("rename", oElement).domRef;

		var oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, vDomRef);

		this._$oEditableControlDomRef = jQuery(oEditableControlDomRef);

		var oEditableControlOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oEditableControlDomRef.id) || oOverlay;

		var oWrapper = jQuery("<div class='sapUiRtaEditableField'></div>").appendTo(oEditableControlOverlay.$());
		this._$editableField = jQuery("<div contentEditable='true'></div>").appendTo(oWrapper);

		// if label is empty, set a preliminary dummy text at the control to get an overlay
		if (this._$oEditableControlDomRef.text() === "") {
			this._$oEditableControlDomRef.text("_?_");
			this._$editableField.text("");
		} else {
			this._$editableField.text(this._$oEditableControlDomRef.text());
		}

		DOMUtil.copyComputedStyle(this._$oEditableControlDomRef, this._$editableField);
		this._$editableField.children().remove();
		this._$editableField.offset({ left: this._$oEditableControlDomRef.offset().left });
		this._$editableField.offset({ top: this._$oEditableControlDomRef.offset().top });

		// TODO : for all browsers
		this._$editableField.css({
			"-moz-user-modify" : "read-write",
			"-webkit-user-modify" : "read-write",
			"-ms-user-modify" : "read-write",
			"user-modify" : "read-write",
			"text-overflow" : "clip"
		});

		this._$oEditableControlDomRef.css("visibility", "hidden");

		this._$editableField.one("focus", this._onEditableFieldFocus.bind(this));

		this._$editableField.on("blur", this._onEditableFieldBlur.bind(this));
		this._$editableField.on("keydown", this._onEditableFieldKeydown.bind(this));
		this._$editableField.on("dragstart", this._stopPropagation.bind(this));
		this._$editableField.on("drag", this._stopPropagation.bind(this));
		this._$editableField.on("dragend", this._stopPropagation.bind(this));

		this._$editableField.on("click", this._stopPropagation.bind(this));
		this._$editableField.on("mousedown", this._stopPropagation.bind(this));

		this._$editableField.focus();

		// keep Overlay selected while renaming
		oOverlay.setSelected(true);

		this.setOldValue(this._getCurrentEditableFieldText());
	};

	/**
	 * @param {sap.ui.base.Event} oEvent - event object
	 * @private
	 */
	Rename.prototype._stopPropagation = function(oEvent) {
		oEvent.stopPropagation();
	};

	/**
	 * @param {sap.ui.base.Event} oEvent - event object
	 * @private
	 */
	Rename.prototype._onEditableFieldFocus = function(oEvent) {
		this._oEditedOverlay.setSelected(false);
		var el = oEvent.target;
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	};

	/**
	 * @param {boolean} bRestoreFocus - true if the focus should be restored on overlay after rename
	 * @private
	 */
	Rename.prototype._stopEdit = function(bRestoreFocus) {
		// exchange the dummy text at the label with the genuine empty text (see start_edit function)
		if (this._$oEditableControlDomRef.text() === "_?_") {
			this._$oEditableControlDomRef.text("");
		}

		this._oEditedOverlay.$().find(".sapUiRtaEditableField").remove();
		this._$oEditableControlDomRef.css("visibility", "visible");

		if (bRestoreFocus) {
			var oOverlay = this._oEditedOverlay;

			// timeout is needed because of invalidation (test on bounded fields)
			// TODO: get rid of timeout! prevent UI5 from taking focus out of overlays
			this._iStopTimeout = setTimeout(function() {
				oOverlay.setSelected(true);
				oOverlay.focus();
			}, 500);
		}

		this._oEditedOverlay.setSelected(false);

		delete this._$editableField;
		delete this._$oEditableControlDomRef;
		delete this._oEditedOverlay;
	};

	/**
	 * @param {sap.ui.base.Event} oEvent - event object
	 * @private
	 */
	Rename.prototype._onEditableFieldBlur = function(oEvent) {
		this._emitLabelChangeEvent();
		this._stopEdit();
	};

	/**
	 * @param {sap.ui.base.Event} oEvent - event object
	 * @private
	 */
	Rename.prototype._onEditableFieldKeydown = function(oEvent) {
		switch (oEvent.keyCode) {
			case jQuery.sap.KeyCodes.ENTER:
				this._emitLabelChangeEvent();
				this._stopEdit(true);
				oEvent.preventDefault();
				break;
			case jQuery.sap.KeyCodes.ESCAPE:
				this._stopEdit(true);
				oEvent.preventDefault();
				break;
			case jQuery.sap.KeyCodes.DELETE:
				//Incident ID: #1680315103
				oEvent.stopPropagation();
				break;
			default:
		}
	};

	/**
	 * @private
	 */
	Rename.prototype._emitLabelChangeEvent = function() {
		var sText = this._getCurrentEditableFieldText();
		if (this.getOldValue() !== sText) { //check for real change before creating a command
			this._$oEditableControlDomRef.text(sText);
			try {
				var oRenameCommand;
				var oRenamedElement = this._oEditedOverlay.getElementInstance();
				var oDesignTimeMetadata = this._oEditedOverlay.getDesignTimeMetadata();

				oRenameCommand = this.getCommandFactory().getCommandFor(oRenamedElement, "rename", {
					renamedElement : oRenamedElement,
					newValue : sText
				}, oDesignTimeMetadata);
				this.fireElementModified({
					"command" : oRenameCommand
				});
			} catch (oError) {
				jQuery.sap.log.error("Error during rename : ", oError);
			}
		}
	};

	/**
	 * @returns {string} current editable field text
	 * @private
	 */
	Rename.prototype._getCurrentEditableFieldText = function() {
		var sText = this._$editableField.text();
		// Rename to empty string should not be possible
		// to prevent issues with disappearing elements
		if (sText === ""){
			sText = '\xa0'; // = non-breaking space (&nbsp)
		}
		return sText;
	};

	return Rename;
}, /* bExport= */true);
