/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.CheckBox.
jQuery.sap.declare("sap.m.CheckBox");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new CheckBox.
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
 * <li>{@link #getSelected selected} : boolean (default: false)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getName name} : string</li>
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
 * <li>{@link sap.m.CheckBox#event:select select} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * CheckBox control
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.CheckBox
 */
sap.ui.core.Control.extend("sap.m.CheckBox", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"selected" : {type : "boolean", group : "Data", defaultValue : false},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"name" : {type : "string", group : "Misc", defaultValue : null},
		"text" : {type : "string", group : "Appearance", defaultValue : null},
		"textDirection" : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},
		"activeHandling" : {type : "boolean", group : "Misc", defaultValue : true}
	},
	events : {
		"select" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.CheckBox with name <code>sClassName</code> 
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
 * @name sap.m.CheckBox.extend
 * @function
 */

sap.m.CheckBox.M_EVENTS = {'select':'select'};


/**
 * Getter for property <code>selected</code>.
 * Contains the state of the control whether it is flagged with a check mark, or not
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>selected</code>
 * @public
 * @name sap.m.CheckBox#getSelected
 * @function
 */


/**
 * Setter for property <code>selected</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bSelected  new value for property <code>selected</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setSelected
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible control is not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.CheckBox#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setVisible
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Using this property, the control could be disabled, if required.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.CheckBox#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setEnabled
 * @function
 */

/**
 * Getter for property <code>name</code>.
 * The 'name' property to be used in the HTML code, for example for HTML forms that send data to the server via submit.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.m.CheckBox#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setName
 * @function
 */

/**
 * Getter for property <code>text</code>.
 * Defines the text displayed next to the check box
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.CheckBox#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setText
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
 * @name sap.m.CheckBox#getTextDirection
 * @function
 */


/**
 * Setter for property <code>textDirection</code>.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code> 
 *
 * @param {sap.ui.core.TextDirection} oTextDirection  new value for property <code>textDirection</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setTextDirection
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
 * @name sap.m.CheckBox#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>''</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setWidth
 * @function
 */

/**
 * Getter for property <code>activeHandling</code>.
 * this is a flag to switch on activeHandling, when it is switched off, there will not be visual changes on active state. Default value is 'true'
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>activeHandling</code>
 * @public
 * @name sap.m.CheckBox#getActiveHandling
 * @function
 */


/**
 * Setter for property <code>activeHandling</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bActiveHandling  new value for property <code>activeHandling</code>
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#setActiveHandling
 * @function
 */

/**
 * Event is triggered when the control status is changed by the user by selecting or deselecting the checkbox. 
 *
 * @name sap.m.CheckBox#select
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {boolean} oControlEvent.getParameters.selected Checks whether the CheckBox is flagged or not flagged.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'select' event of this <code>sap.m.CheckBox</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.CheckBox</code>.<br/> itself. 
 *  
 * Event is triggered when the control status is changed by the user by selecting or deselecting the checkbox. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.CheckBox</code>.<br/> itself.
 *
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#attachSelect
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'select' event of this <code>sap.m.CheckBox</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.CheckBox#detachSelect
 * @function
 */


/**
 * Fire event select to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'selected' of type <code>boolean</code> Checks whether the CheckBox is flagged or not flagged.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.CheckBox} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.CheckBox#fireSelect
 * @function
 */

// Start of sap\m\CheckBox.js

sap.m.CheckBox.prototype.init = function() {
	this.addActiveState(this);
};


/**
 * Called when the control is touched.
 *
 * @private
 */
sap.m.CheckBox.prototype.ontouchstart = function(oEvent) {
	//for control who need to know if they should handle events from the CheckBox control
	oEvent.originalEvent._sapui_handledByControl = true;
};

sap.m.CheckBox.prototype.setSelected = function(bSelected) {
	jQuery.sap.byId(this.getId()+'-CB').toggleClass("sapMCbMarkChecked", bSelected);
	this.setProperty("selected", bSelected, true);
	return this;
}

/**
 * Function is called when CheckBox is tapped.
 * 
 * @private
 */
sap.m.CheckBox.prototype.ontap = function(oEvent) {
	if (this.getEnabled()) {
		var bSelected = !this.getSelected();
		this.setSelected(bSelected);
		this.fireSelect({selected:bSelected});
	}
};

/**
 * add ActiveState to non-supported mobile platform
 * @private
 */
 
sap.m.CheckBox.prototype.addActiveState = function(oControl) {
	if (jQuery.os.blackberry || (jQuery.os.android && (jQuery.os.version.match(/[23]\./)))){
		oControl.addDelegate({
			ontouchstart: function(oEvent){
				jQuery(oControl.getDomRef()).addClass("sapMActive");
			},
			ontouchend: function(oEvent){
				jQuery(oControl.getDomRef()).removeClass("sapMActive");
			}
		});
	}
};

sap.m.CheckBox.prototype.setText = function(sText){
	this.setProperty("text", sText, true);	
	if(this._oLabel){
		this._oLabel.setText(this.getText());
	}else{
		this._createLabel("text", this.getText());
	}
	return this;
};

sap.m.CheckBox.prototype.setWidth = function(sWidth){
	this.setProperty("width", sWidth, true);	
	if(this._oLabel){
		this._oLabel.setWidth(this.getWidth());
	}else{
		this._createLabel("width", this.getWidth());
	}
	return this;
};

sap.m.CheckBox.prototype.setTextDirection = function(sDirection){
	this.setProperty("textDirection", sDirection, true);	
	if(this._oLabel){			
		this._oLabel.setTextDirection(this.getTextDirection());
	}else{
		this._createLabel("textDirection", this.getTextDirection());
	}
	return this;
};

sap.m.CheckBox.prototype.exit = function() {
	if(this._oLabel){
		this._oLabel.destroy();
	}
}

sap.m.CheckBox.prototype._createLabel = function(prop, value){
	this._oLabel = new sap.m.Label(this.getId() + "-label", {
					}).addStyleClass("sapMRbBLabel").setParent(this, null, true);
	this._oLabel.setProperty(prop, value, false);
}
