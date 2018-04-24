/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectIdentifier.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'./ObjectIdentifierRenderer'
],
function(
	library,
	Control,
	IconPool,
	InvisibleText,
	coreLibrary,
	Device,
	ManagedObject,
	ObjectIdentifierRenderer
	) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;



	/**
	 * Constructor for a new ObjectIdentifier.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ObjectIdentifier is a display control that enables the user to easily identify a specific object. The ObjectIdentifier title is the key identifier of the object and additional text and icons can be used to further distinguish it from other objects.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectIdentifier
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectIdentifier = Control.extend("sap.m.ObjectIdentifier", /** @lends sap.m.ObjectIdentifier.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/ObjectIdentifier.designtime",
		properties : {

			/**
			 * Defines the object title.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the object text.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Indicates whether or not the notes icon is displayed.
			 * @deprecated as of version 1.24.0. There is no replacement for the moment.
			 */
			badgeNotes : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Indicates whether or not the address book icon is displayed.
			 * @deprecated as of version 1.24.0. There is no replacement for the moment.
			 */
			badgePeople : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Indicates whether or not the attachments icon is displayed.
			 * @deprecated as of version 1.24.0. There is no replacement for the moment.
			 */
			badgeAttachments : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Indicates if the ObjectIdentifier is visible. An invisible ObjectIdentifier is not being rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Indicates if the ObjectIdentifier's title is clickable.
			 * @since 1.26
			 */
			titleActive : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
		},
		aggregations : {

			/**
			 * Control to display the object title (can be either Text or Link).
			 *
			 * @private
			 */
			_titleControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * Text control to display the object text.
			 *
			 * @private
			 */
			_textControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when the title is active and the user taps/clicks on it.
			 * @since 1.26
			 */
			titlePress : {
				parameters : {

					/**
					 * DOM reference of the object identifier's title.
					 */
					domRef : {type : "object"}
				}
			}
		},
		associations: {
			/**
			 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		}
	}});


	/**
	 * Initializes the control
	 *
	 * @private
	 */
	ObjectIdentifier.prototype.init = function() {
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			ObjectIdentifier.OI_ARIA_ROLE = oLibraryResourceBundle.getText("OI_ARIA_ROLE");
			this._createAriaInfoTextControl();
		}
	};

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	ObjectIdentifier.prototype.exit = function() {

		if (this._attachmentsIcon) {
			this._attachmentsIcon.destroy();
			this._attachmentsIcon = null;
		}

		if (this._peopleIcon) {
			this._peopleIcon.destroy();
			this._peopleIcon = null;
		}

		if (this._notesIcon) {
			this._notesIcon.destroy();
			this._notesIcon = null;
		}

		if (this._oAriaCustomRole) {
			this._oAriaCustomRole.destroy();
			this._oAriaCustomRole = null;
		}
	};

	/**
	 * Lazy loads attachments icon.
	 * @returns {object} The attachments icon
	 * @private
	 */
	ObjectIdentifier.prototype._getAttachmentsIcon = function() {

		if (!this._attachmentsIcon) {
			this._attachmentsIcon = this._getIcon(IconPool.getIconURI("attachment"), this.getId() + "-attachments");
		}

		return this._attachmentsIcon;
	};

	/**
	 * Lazy loads people icon.
	 * @returns {object} The people icon
	 * @private
	 */
	ObjectIdentifier.prototype._getPeopleIcon = function() {

		if (!this._peopleIcon) {
			this._peopleIcon = this._getIcon(IconPool.getIconURI("group"), this.getId() + "-people");
		}

		return this._peopleIcon;
	};

	/**
	 * Lazy loads notes icon.
	 * @returns {object} The notes icon
	 * @private
	 */
	ObjectIdentifier.prototype._getNotesIcon = function() {

		if (!this._notesIcon ) {
			this._notesIcon  = this._getIcon(IconPool.getIconURI("notes"), this.getId() + "-notes");
		}

		return this._notesIcon;
	};

	/**
	 * Creates icon image.
	 * @param {string} sURI The URL of the icon image
	 * @param {string} sImageId The ID of the icon image
	 * @returns {object} The icon image
	 * @private
	 */
	ObjectIdentifier.prototype._getIcon = function(sURI, sImageId) {

		var sSize = Device.system.phone ? "1em" : "1em";
		var oImage;

		oImage = this._icon || IconPool.createControlByURI({
			src : sURI,
			id : sImageId + "-icon",
			size : sSize,
			useIconTooltip : false
		}, sap.m.Image);

		oImage.setSrc(sURI);

		return oImage;
	};

	/**
	 * Gets the proper control for the title.
	 * @returns {sap.m.Control} The control for the title
	 * @private
	 */
	ObjectIdentifier.prototype._getTitleControl = function() {
		var oTitleControl = this.getAggregation("_titleControl");

		if (!oTitleControl) {
			// Lazy initialization
			if (this.getProperty("titleActive")) {
				oTitleControl = new sap.m.Link({
					id : this.getId() + "-link",
					text: ManagedObject.escapeSettingsValue(this.getProperty("title")),
					//Add a custom hidden role "ObjectIdentifier" with hidden text
					ariaLabelledBy: this._oAriaCustomRole
				});
			} else {
				oTitleControl = new sap.m.Text({
					id : this.getId() + "-txt",
					text: ManagedObject.escapeSettingsValue(this.getProperty("title"))
				});
			}
			this.setAggregation("_titleControl", oTitleControl, true);
		}

		oTitleControl.setVisible(!!this.getTitle());

		return oTitleControl;
	};

	/**
	 * Updates the text of the title control and re-renders it if present in the DOM.
	 * @param {boolean} bIsTitleActive Update title control with the respect to the current 'titleActive' property value
	 *
	 * @private
	 */
	ObjectIdentifier.prototype._updateTitleControl = function(bIsTitleActive) {
		var oRm,
			oTitleControl = this._getTitleControl();

		if (bIsTitleActive && oTitleControl instanceof sap.m.Text) {
			this.destroyAggregation("_titleControl", true);
			oTitleControl = new sap.m.Link({
				id : this.getId() + "-link",
				text: ManagedObject.escapeSettingsValue(this.getProperty("title")),
				//Add a custom hidden role "ObjectIdentifier" with hidden text
				ariaLabelledBy: this._oAriaCustomRole
			});
			this.setAggregation("_titleControl", oTitleControl, true);
		} else if (!bIsTitleActive && oTitleControl instanceof sap.m.Link) {
			this.destroyAggregation("_titleControl", true);
			oTitleControl = new sap.m.Text({
				id : this.getId() + "-txt",
				text: ManagedObject.escapeSettingsValue(this.getProperty("title"))
			});
			this.setAggregation("_titleControl", oTitleControl, true);
		}

		// check if we have "-title" div rendered and if so rerender the Title inside it
		if (this.$("title").length) {
			oTitleControl.setProperty("text", this.getProperty("title"), true);

			oRm = sap.ui.getCore().createRenderManager();
			oRm.renderControl(oTitleControl);
			oRm.flush(this.$("title")[0]);
			oRm.destroy();
		}

		return oTitleControl;
	};

	/**
	 * Lazy loads _textControl aggregation.
	 * @returns {sap.m.Control} The control for the text
	 * @private
	 */
	ObjectIdentifier.prototype._getTextControl = function() {

		var oTextControl = this.getAggregation("_textControl");

		if (!oTextControl) {
			oTextControl = new sap.m.Text({
				text: ManagedObject.escapeSettingsValue(this.getProperty("text"))
			});
			this.setAggregation("_textControl", oTextControl, true);
		}

		oTextControl.setTextDirection(this.getTextDirection());
		oTextControl.setVisible(!!this.getText());

		return oTextControl;
	};


	/**
	 * Sets the title.
	 * Default value is empty/undefined.
	 * @public
	 * @param {string} sTitle New value for property title
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setTitle = function (sTitle) {
		//always suppress rerendering because title div is rendered
		//if text is empty or not
		var oTitleControl = this._getTitleControl();
		oTitleControl.setProperty("text", sTitle, false);
		oTitleControl.setVisible(!!oTitleControl.getText());
		this.setProperty("title", sTitle, true);
		this.$("text").toggleClass("sapMObjectIdentifierTextBellow",
				!!this.getProperty("text") && !!this.getProperty("title"));

		return this;
	};

	/**
	 * Sets text.
	 * Default value is empty/undefined.
	 * @public
	 * @param {string} sText New value for property text
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setText = function (sText) {
		//always suppress rerendering because text div is rendered
		//if text is empty or not
		this.setProperty("text", sText, true);

		var oTextControl = this._getTextControl();
		oTextControl.setProperty("text", sText, false);
		this.$("text").toggleClass("sapMObjectIdentifierTextBellow",
				!!this.getProperty("text") && !!this.getProperty("title"));

		return this;
	};

	/**
	 * Sets property titleActive.
	 * Default value is false.
	 * @public
	 * @param {boolean} bValue new value for property titleActive
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setTitleActive = function(bValue) {
		var bPrevValue = this.getProperty("titleActive");

		// Return if the new value is the same as the old one
		if (bPrevValue != bValue) {
			this.setProperty("titleActive", bValue, true);
			// If the title is already rendered, then the title control has to be updated and rerendered
			this._updateTitleControl(bValue);
		}
		return this;
	};

	/**
	 * Function is called when ObjectIdentifier's title is triggered.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	ObjectIdentifier.prototype._handlePress = function(oEvent) {
		var oClickedItem = oEvent.target;
		if (this.getTitleActive() && this.$("title")[0].firstChild == oClickedItem) { // checking if the title is clicked
			this.fireTitlePress({
				domRef: oClickedItem
			});

			// mark the event that it is handled by the control
			oEvent.setMarked();
		}
	};

	/**
	 * Event handler called when the enter key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	ObjectIdentifier.prototype.onsapenter = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};

	/**
	 * Event handler called when the space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	ObjectIdentifier.prototype.onsapspace = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};

	/**
	 * Event handler called when the title is clicked/taped.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	ObjectIdentifier.prototype.ontap = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};


	ObjectIdentifier.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		var oTitle = this.getAggregation("_titleControl");

		if (sAssociationName === "ariaLabelledBy") {
			if (this.getTitleActive() && oTitle instanceof sap.m.Link) {
				oTitle.addAssociation("ariaLabelledBy", sId, true);
			}
		}

		return Control.prototype.addAssociation.apply(this, arguments);
	};


	ObjectIdentifier.prototype.removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate) {
		var oTitle = this.getAggregation("_titleControl");

		if (sAssociationName === "ariaLabelledBy") {
			if (this.getTitleActive() && oTitle instanceof sap.m.Link) {
				oTitle.removeAssociation("ariaLabelledBy", vObject, true);
			}
		}

		return Control.prototype.removeAssociation.apply(this, arguments);
	};


	/**
	 * Creates additional aria hidden text with the role of the control.
	 * @returns {sap.ui.core.InvisibleText} The additional aria hidden text with the role of the control
	 * @private
	 */
	ObjectIdentifier.prototype._createAriaInfoTextControl = function () {

		if (!this._oAriaCustomRole) {
			this._oAriaCustomRole = new InvisibleText(this.getId() + "-oIHiddenText", { text: ObjectIdentifier.OI_ARIA_ROLE});
		}

		return this._oAriaCustomRole;
	};


	return ObjectIdentifier;

});
