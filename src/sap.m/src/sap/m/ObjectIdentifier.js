/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectIdentifier.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
	"use strict";


	
	/**
	 * Constructor for a new ObjectIdentifier.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectIdentifier is a display control that enables the user to easily identify a specific object. The object identifier title is the key identifier of the object and additional text and icons can be used to further distinguish it from other objects.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @name sap.m.ObjectIdentifier
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectIdentifier = Control.extend("sap.m.ObjectIdentifier", /** @lends sap.m.ObjectIdentifier.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * The object title.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The object text.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates whether or not the notes icon is displayed.
			 * @deprecated Since version 1.24.0. 
			 * Will be replaced in the future by a more generic mechansism.
			 */
			badgeNotes : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},
	
			/**
			 * Indicates whether or not the address book icon is displayed.
			 * @deprecated Since version 1.24.0. 
			 * Will be replaced in the future by a more generic mechansism.
			 */
			badgePeople : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},
	
			/**
			 * Indicates whether or not the attachments icon is displayed.
			 * @deprecated Since version 1.24.0. 
			 * Will be replaced in the future by a more generic mechansism.
			 */
			badgeAttachments : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},
	
			/**
			 * Indicates if the object identifier is visible. An invisible object identifier is not being rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Indicates if the object identifier's title is clickable.
			 * @since 1.26
			 */
			titleActive : {type : "boolean", group : "Misc", defaultValue : false}
		},
		aggregations : {
	
			/**
			 * Text control to display the object title
			 * 
			 * @private
			 */
			_titleTextControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},
			
			/**
			 * Link control to display the clickable object title (titleActive = true)
			 * 
			 * @private
			 */
			_titleLinkControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},
			
			/**
			 * Text control to display the object text
			 * 
			 * @private
			 */
			_textControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {
	
			/**
			 * Event is fired when the title is active and the user taps/clicks on it.
			 * @since 1.26
			 */
			titlePress : {
				parameters : {
	
					/**
					 * Dom reference of the object identifier's title
					 */
					domRef : {type : "object"}
				}
			}
		}
	}});
	
	///**
	// * This file defines behavior for the control
	// */
	
	/**
	 *  Initialize member variables
	 * 
	 * @private
	 */
	sap.m.ObjectIdentifier.prototype.init = function() {
		this.setAggregation("_textControl", new sap.m.Text());
		this.setAggregation("_titleTextControl", new sap.m.Text());
		this.setAggregation("_titleLinkControl", new sap.m.Link());
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
	};
	
	/**
	 * Lazy load attachments icon.
	 * 
	 * @private
	 */
	ObjectIdentifier.prototype._getAttachmentsIcon = function() {
	
		if (!this._attachmentsIcon) {
			this._attachmentsIcon = this._getIcon(IconPool.getIconURI("attachment"), this.getId() + "-attachments");
		}
	
	    return this._attachmentsIcon;
	};
	
	/**
	 * Lazy load people icon.
	 * 
	 * @private
	 */
	ObjectIdentifier.prototype._getPeopleIcon = function() {
	
		if (!this._peopleIcon) {
			this._peopleIcon = this._getIcon(IconPool.getIconURI("group"), this.getId() + "-people");
		}
	
	    return this._peopleIcon;
	};
	
	/**
	 * Lazy load notes icon.
	 * 
	 * @private
	 */
	ObjectIdentifier.prototype._getNotesIcon = function() {
	
		if (!this._notesIcon ) {
			this._notesIcon  = this._getIcon(IconPool.getIconURI("notes"), this.getId() + "-notes");
		}
	
	    return this._notesIcon;
	};
	
	/**
	 * Create icon image.
	 * 
	 * @private
	 */
	ObjectIdentifier.prototype._getIcon = function(sURI, sImageId) {
	
	    var sSize = sap.ui.Device.system.phone ? "1em" : "1em";
	    var oImage;
	
	    oImage = this._icon || IconPool.createControlByURI({
	        src : sURI,
	        id : sImageId + "-icon",
	        size : sSize
	    }, sap.m.Image);
	
	    oImage.setSrc(sURI);
	
	    return oImage;
	};
	
	/**
	 * Get the proper control for the title.
	 * 
	 * @private
	 */
	sap.m.ObjectIdentifier.prototype._getTitleControl = function() {
		if (this.getProperty("titleActive")) {
			return this.getAggregation("_titleLinkControl");
		} else {
			return this.getAggregation("_titleTextControl");
		}
	};
	
	/**
	 * Updates the text of the title control and rerenders it
	 * If titleActive = true, a Link control is rendered,
	 * otherwise a Text control will be rendered
	 * 
	 * @private
	 */
	ObjectIdentifier.prototype._rerenderTitle = function() {
		this._getTitleControl().setProperty("text", this.getTitle());
		var oRm = sap.ui.getCore().createRenderManager();
		oRm.renderControl(this._getTitleControl());
		oRm.flush(this.$("title")[0]);
		oRm.destroy();
	};
	
	/**
	 * Setter for property title.
	 * Default value is empty/undefined
	 * @public
	 * @param {string} sTitle new value for property title
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setTitle = function (sTitle) {
		//always suppress rerendering because title div is rendered
		//if text is empty or not
		this.setProperty("title", sTitle, true);
		
		var oTitleControl = this._getTitleControl();
		oTitleControl.setProperty("text", this.getTitle());
		
		this.$("text").toggleClass("sapMObjectIdentifierTextBellow", 
				!!this.getProperty("text") && !!this.getProperty("title"));
	
		return this;
	};
	
	/**
	 * Setter for property text.
	 * Default value is empty/undefined
	 * @public
	 * @param {string} sText new value for property text
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setText = function (sText) {
		//always suppress rerendering because text div is rendered
		//if text is empty or not
		this.setProperty("text", sText, true);
		
		var oTextControl = this.getAggregation("_textControl");
		oTextControl.setProperty("text", this.getText());
		
		this.$("text").toggleClass("sapMObjectIdentifierTextBellow", 
				!!this.getProperty("text") && !!this.getProperty("title"));
	
		return this;
	};
	
	/**
	 * Setter for property titleActive.
	 * Default value is false
	 * @public
	 * @param {boolean} bValue new value for property titleActive
	 * @returns {sap.m.ObjectIdentifier} this to allow method chaining
	 */
	ObjectIdentifier.prototype.setTitleActive = function(bValue) {
		var bPrevValue = this.getProperty("titleActive");
		this.setProperty("titleActive", bValue, true);

		// If titleActive is actually changed and the title is already rendered,
		// then the title control has to be updated and rerendered
		if ((bPrevValue != bValue) && (this.$("title").children().length > 0)) {
			this._rerenderTitle();
		}
		
		return this;
	};
	
	/**
	 * Function is called when ObjectIdentifier's title is triggered.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectIdentifier.prototype._handlePress = function(oEvent) {
		var oClickedItem = oEvent.target;
		if (this.getTitleActive() && this.$("title")[0].firstChild == oClickedItem) { // checking if the title is clicked
			this.fireTitlePress({
				domRef: oClickedItem
			});
		}
	};
	
	/**
	 * Event handler called when the enter key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectIdentifier.prototype.onsapenter = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};
	
	/**
	 * Event handler called when the space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectIdentifier.prototype.onsapspace = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};
	
	/**
	 * Event handler called when the title is clicked/taped. 
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectIdentifier.prototype.ontap = function(oEvent) {
		ObjectIdentifier.prototype._handlePress.apply(this, arguments);
	};
	

	return ObjectIdentifier;

}, /* bExport= */ true);
