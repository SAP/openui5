/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.RadioButton.
jQuery.sap.declare("sap.m.RadioButton");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new RadioButton.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getSelected selected} : boolean (default: false)</li>
 * <li>{@link #getGroupName groupName} : string (default: 'sapMRbDefaultGroup')</li>
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getTextDirection textDirection} : sap.ui.core.TextDirection (default: sap.ui.core.TextDirection.Inherit)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '')</li>
 * <li>{@link #getActiveHandling activeHandling} : boolean (default: true)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.RadioButton#event:select select} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Generally, you would create at least two radio button controls which should have the same GroupName;
 * by this, you provide a limited choice for the user. Triggers an Event when User makes a change.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.RadioButton
 */
sap.ui.core.Control.extend("sap.m.RadioButton", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"setActiveState"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"selected" : {type : "boolean", group : "Data", defaultValue : false},
		"groupName" : {type : "string", group : "Behavior", defaultValue : 'sapMRbDefaultGroup'},
		"text" : {type : "string", group : "Appearance", defaultValue : null},
		"textDirection" : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},
		"activeHandling" : {type : "boolean", group : "Appearance", defaultValue : true}
	},
	events : {
		"select" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.RadioButton with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.m.RadioButton.extend
 * @function
 */

sap.m.RadioButton.M_EVENTS = {'select':'select'};


/**
 * Getter for property <code>visible</code>.
 * Invisible radio buttons are not rendered.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.RadioButton#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setVisible
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Disabled controls are displayed in another color.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.RadioButton#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setEnabled
 * @function
 */

/**
 * Getter for property <code>selected</code>.
 * Specifies the select state of the radio button
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>selected</code>
 * @public
 * @name sap.m.RadioButton#getSelected
 * @function
 */


/**
 * Setter for property <code>selected</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bSelected  new value for property <code>selected</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setSelected
 * @function
 */

/**
 * Getter for property <code>groupName</code>.
 * Name of the radio button group the current radio button belongs to. You can define a new name for the group.
 * If no new name is specified, this radio button belongs to the sapMRbDefaultGroup per default. Default behavior of a radio button in a group is that when one of the radio buttons in a group is selected, all others are unselected.
 *
 * Default value is <code>'sapMRbDefaultGroup'</code>
 *
 * @return {string} the value of property <code>groupName</code>
 * @public
 * @name sap.m.RadioButton#getGroupName
 * @function
 */


/**
 * Setter for property <code>groupName</code>.
 *
 * Default value is <code>'sapMRbDefaultGroup'</code> 
 *
 * @param {string} sGroupName  new value for property <code>groupName</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setGroupName
 * @function
 */

/**
 * Getter for property <code>text</code>.
 * Defines the text displayed next to the RadioButton
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.RadioButton#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setText
 * @function
 */

/**
 * Getter for property <code>textDirection</code>.
 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code>
 *
 * @return {sap.ui.core.TextDirection} the value of property <code>textDirection</code>
 * @public
 * @name sap.m.RadioButton#getTextDirection
 * @function
 */


/**
 * Setter for property <code>textDirection</code>.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code> 
 *
 * @param {sap.ui.core.TextDirection} oTextDirection  new value for property <code>textDirection</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setTextDirection
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Width of Label
 *
 * Default value is <code>''</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.RadioButton#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>''</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setWidth
 * @function
 */

/**
 * Getter for property <code>activeHandling</code>.
 * this is a flag to switch on activeHandling, when it is switch
 * ed off, there will not be visual changes on active state. Default value is 'true'
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>activeHandling</code>
 * @public
 * @name sap.m.RadioButton#getActiveHandling
 * @function
 */


/**
 * Setter for property <code>activeHandling</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bActiveHandling  new value for property <code>activeHandling</code>
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#setActiveHandling
 * @function
 */

/**
 * Event is triggered when the user makes a change on the radio button. 
 *
 * @name sap.m.RadioButton#select
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'select' event of this <code>sap.m.RadioButton</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.RadioButton</code>.<br/> itself. 
 *  
 * Event is triggered when the user makes a change on the radio button. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.RadioButton</code>.<br/> itself.
 *
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#attachSelect
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'select' event of this <code>sap.m.RadioButton</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.RadioButton#detachSelect
 * @function
 */


/**
 * Fire event select to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.RadioButton} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.RadioButton#fireSelect
 * @function
 */

/**
 * Method to set a RadioButton's state to active or inactive.
 *
 * @name sap.m.RadioButton.prototype.setActiveState
 * @function
 * @param {boolean} 
 *         bActive
 *         boolean to set the active state to true or false

 * @type void
 * @public
 */


// Start of sap\m\RadioButton.js
/**
 * This file defines behavior for the control,
 */

/**
 * Function is called when radiobutton is tapped.
 * 
 * @private
 */
sap.m.RadioButton.prototype.ontap = function(oEvent) {
	if (this.getEnabled()) {
		if (!this.getSelected()) {
			this.setSelected(true);
			this.fireSelect({/* no parameters */});
		}
	}else{
		// readOnly or disabled -> don't allow browser to switch RadioButton on
		//oEvent.preventDefault();
	}
};
/**
 * Function is called when radiobutton is being touched. Only necessary for Android/Black-Berry.
 * 
 * @private
 */
sap.m.RadioButton.prototype.ontouchstart = function(oEvent) {
	//for control who need to know if they should handle events from the CheckBox control
	oEvent.originalEvent._sapui_handledByControl = true
	if(this.getEnabled() && this.getActiveHandling()) {
		this.$().toggleClass('sapMRbBTouched', true);
	}
}
	
sap.m.RadioButton.prototype.ontouchend = function(oEvent) {
	this.$().toggleClass('sapMRbBTouched', false);
}


// #############################################################################		
// Overwritten methods that are also generated in RadioButton.API.js		
// #############################################################################		

/*	
 * Overwrite the definition from RadioButton.API.js		
 */
sap.m.RadioButton.prototype.setSelected = function(bSelected) {
	
	var bSelectedOld = this.getSelected();

	this.setProperty("selected", bSelected, true); // No re-rendering

	if (bSelected) { // If this radio button is selected, explicitly deselect the other radio buttons of the same group
		if (this.getGroupName() && (this.getGroupName() !== "")) { // Do it only if groupName is set
			// TODO: Add control references to some static list when they are constructed, in order to avoid searching every time
			var others = jQuery("input[name='"+ this.getGroupName() +"']:radio");
			for (var i = 0; i < others.length; i++) {
				var other = others[i];
				// Recommendation is that the HTML radio button has an ID ending with "-RB"
				if (other.id && (other.id.length > 3) && (other.id.substr(other.id.length-3) === "-RB")) {
					// The SAPUI5 control is known by an ID without the "-RB" suffix
					var oControl = sap.ui.getCore().getElementById(other.id.substr(0, other.id.length-3));
					if (oControl instanceof sap.m.RadioButton && (oControl !== this)) {
						oControl.setSelected(false);
					}
				}
			}
		}
	}
	if ((bSelectedOld !== bSelected) && this.getDomRef()){
		
			jQuery.sap.byId(this.getId()).toggleClass('sapMRbSel', bSelected).attr('aria-checked', bSelected);
	if(bSelected){
		jQuery.sap.domById(this.getId()+'-RB').checked = true;
		jQuery.sap.domById(this.getId()+'-RB').setAttribute('checked', 'checked');
	}else{
		jQuery.sap.domById(this.getId()+'-RB').checked = false;
		jQuery.sap.domById(this.getId()+'-RB').removeAttribute('checked');
	}
	}

	return this;
};

sap.m.RadioButton.prototype.setActiveState = function(bActive) {
	this.$().toggleClass('sapMRbBTouched', bActive);
}

sap.m.RadioButton.prototype.setText = function(sText){
	this.setProperty("text", sText, true);	
	if(this._oLabel){
		this._oLabel.setText(this.getText());
	}else{
		this._createLabel("text", this.getText());
	}
	return this;
};

sap.m.RadioButton.prototype.setWidth = function(sWidth){
	this.setProperty("width", sWidth, true);	
	if(this._oLabel){
		this._oLabel.setWidth(this.getWidth());
	}else{
		this._createLabel("width", this.getWidth());
	}
	return this;
};

sap.m.RadioButton.prototype.setTextDirection = function(sDirection){
	this.setProperty("textDirection", sDirection, true);	
	if(this._oLabel){			
		this._oLabel.setTextDirection(this.getTextDirection());
	}else{
		this._createLabel("textDirection", this.getTextDirection());
	}
	return this;
};

sap.m.RadioButton.prototype.exit = function() {
	if(this._oLabel){
		this._oLabel.destroy();
	}
};

sap.m.RadioButton.prototype._createLabel = function(prop, value){
	this._oLabel = new sap.m.Label(this.getId() + "-label", {
					}).addStyleClass("sapMRbBLabel").setParent(this, null, true);
	this._oLabel.setProperty(prop, value, false);
};