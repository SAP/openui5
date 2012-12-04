/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.SegmentedButton.
jQuery.sap.declare("sap.m.SegmentedButton");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new SegmentedButton.
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
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getButtons buttons} : sap.m.Button[]</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getSelectedButton selectedButton} : string | sap.m.Button</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.SegmentedButton#event:select select} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A SegmentedButton Control is a horizontal control made of multiple buttons which can display a title or an image. It automatically resizes the buttons to fit proportionally within the control. When no width is set, the control uses the available width.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.SegmentedButton
 */
sap.ui.core.Control.extend("sap.m.SegmentedButton", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"createButton"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true}
	},
	defaultAggregation : "buttons",
	aggregations : {
    	"buttons" : {type : "sap.m.Button", multiple : true, singularName : "button"}
	},
	associations : {
		"selectedButton" : {type : "sap.m.Button", multiple : false}
	},
	events : {
		"select" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.SegmentedButton with name <code>sClassName</code> 
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
 * @name sap.m.SegmentedButton.extend
 * @function
 */

sap.m.SegmentedButton.M_EVENTS = {'select':'select'};


/**
 * Getter for property <code>width</code>.
 * Set the width of the SegmentedButton control. If not set, it consumes the complete available width.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.SegmentedButton#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#setWidth
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * boolean property to make the control visible or invisible
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.SegmentedButton#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#setVisible
 * @function
 */
	
/**
 * Getter for aggregation <code>buttons</code>.<br/>
 * Buttons of the SegmentedButton control
 * 
 * @return {sap.m.Button[]}
 * @public
 * @name sap.m.SegmentedButton#getButtons
 * @function
 */

/**
 * Inserts a button into the aggregation named <code>buttons</code>.
 *
 * @param {sap.m.Button}
 *          oButton the button to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the button should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the button is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the button is inserted at 
 *             the last position        
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#insertButton
 * @function
 */


/**
 * Adds some button <code>oButton</code> 
 * to the aggregation named <code>buttons</code>.
 *
 * @param {sap.m.Button}
 *            oButton the button to add; if empty, nothing is inserted
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#addButton
 * @function
 */


/**
 * Removes an button from the aggregation named <code>buttons</code>.
 *
 * @param {int | string | sap.m.Button} vButton the button to remove or its index or id
 * @return {sap.m.Button} the removed button or null
 * @public
 * @name sap.m.SegmentedButton#removeButton
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>buttons</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.m.Button[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.SegmentedButton#removeAllButtons
 * @function
 */


/**
 * Checks for the provided <code>sap.m.Button</code> in the aggregation named <code>buttons</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.m.Button}
 *            oButton the button whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.SegmentedButton#indexOfButton
 * @function
 */


/**
 * Destroys all the buttons in the aggregation 
 * named <code>buttons</code>.
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#destroyButtons
 * @function
 */

/**
 * Pointer to the selected button of a SegmentedButton control.
 *
 * @return {string} Id of the element which is the current target of the <code>selectedButton</code> association, or null
 * @public
 * @name sap.m.SegmentedButton#getSelectedButton
 * @function
 */


/**
 * Pointer to the selected button of a SegmentedButton control.
 *
 * @param {string | sap.m.Button} vSelectedButton 
 *    Id of an element which becomes the new target of this <code>selectedButton</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#setSelectedButton
 * @function
 */

/**
 * Event is fired when the user selects a button, which returns the id and button object 
 *
 * @name sap.m.SegmentedButton#select
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.m.Button} oControlEvent.getParameters.button Reference to the button that has just been selected
 * @param {string} oControlEvent.getParameters.id Id of the button which has just been selected
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'select' event of this <code>sap.m.SegmentedButton</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.SegmentedButton</code>.<br/> itself. 
 *  
 * Event is fired when the user selects a button, which returns the id and button object 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.SegmentedButton</code>.<br/> itself.
 *
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#attachSelect
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'select' event of this <code>sap.m.SegmentedButton</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.SegmentedButton#detachSelect
 * @function
 */


/**
 * Fire event select to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'button' of type <code>sap.m.Button</code> Reference to the button that has just been selected</li>
 * <li>'id' of type <code>string</code> Id of the button which has just been selected</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.SegmentedButton} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.SegmentedButton#fireSelect
 * @function
 */

/**
 * Convenient method to add a button with a text as title OR an URI for an icon. Using both is not supported.
 *
 * @name sap.m.SegmentedButton.prototype.createButton
 * @function
 * @param {string} 
 *         sText
 *         Set the text of a SegmentedButton button.
 * @param {sap.ui.core.URI} 
 *         sIcon
 *         Icon to be displayed as graphical element within the button.
 * 
 * Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided.
 * @param {boolean} 
 *         bEnabled
 *         Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings

 * @type void
 * @public
 */


// Start of sap\m\SegmentedButton.js
sap.m.SegmentedButton.prototype.init = function() {
	if(jQuery.os.android || jQuery.os.blackberry) {
		sap.m.SegmentedButton.prototype.ontouchstart = this._ontouchstart;
		sap.m.SegmentedButton.prototype.ontouchend = this._ontouchend;
	}
	//bind the resize event to window
	jQuery(window).resize(jQuery.proxy(this._fHandleResize, this));
};

sap.m.SegmentedButton.prototype.onAfterRendering = function() {
	//Flag if control is inside the bar. If inside bar the buttons always use the width they need.
	this._bInsideBar = (this.$().closest('.sapMBar').length > 0) ? true : false;
	this._fCalcBtnWidth();

	
};
/**
 * Called after the theme has been switched, required for new width calc
 * @private
 */
sap.m.SegmentedButton.prototype.onThemeChanged = function(oEvent){
	this._fCalcBtnWidth();
};
/**
 * This function is called to manually set the width of each segmentedbutton button 
 * on the basis of the widest item after they have been rendered or an orientation change/theme change
 * took place. 
 * @private
 */
sap.m.SegmentedButton.prototype._fCalcBtnWidth = function() {
	var iItm = this.getButtons().length,
		aBtnWidth = [],
		iMaxWidth = 5,
		$this = this.$(),
		iInnerWidth = $this.children('#' + this.getButtons()[0].getId()).outerWidth(true)-$this.children('#' + this.getButtons()[0].getId()).width(),
		//Outerwidth of control, if developer manually sets margin or padding to the control itself
		iCntOutWidth = $this.outerWidth(true) - $this.width();
		//if parent width is bigger than actual screen width set parent width to screen width => android 2.3
		var iParentWidth = (window.screen.width < $this.parent().width()) ? window.screen.width : $this.parent().width();
	if(this.getWidth() && this.getWidth().indexOf("%") === -1) {
		iMaxWidth = parseInt(this.getWidth()) / iItm;
		for(var i = 0; i < iItm; i++) {
			aBtnWidth.push($this.children('#' + this.getButtons()[i].getId()).outerWidth()-$this.children('#' + this.getButtons()[i].getId()).width());	
		}
		var iMaxOuterWidth = Math.max.apply(null, aBtnWidth);
		iMaxWidth = iMaxWidth - iMaxOuterWidth;
	} else {
		for(var i = 0; i < iItm; i++) {
			aBtnWidth.push($this.children('#' + this.getButtons()[i].getId()).outerWidth(true));	
		}
		iMaxWidth = Math.max.apply(null, aBtnWidth);
		if (((iParentWidth -iCntOutWidth) > iMaxWidth * iItm || this._bInsideBar) && this.getWidth().indexOf("%") === -1) {
			iMaxWidth = iMaxWidth - iInnerWidth;
		} else {
			iMaxWidth = (iParentWidth-iCntOutWidth) / iItm;
			iMaxWidth = iMaxWidth - iInnerWidth;
		}
	}
	for(var i = 0; i < iItm; i++) {
		if (!isNaN(iMaxWidth))
			$this.children('#' + this.getButtons()[i].getId()).width(iMaxWidth).css('visibility', 'visible');			
	}
};
/**
 * The orientationchange event listener
*/
sap.m.SegmentedButton.prototype._fHandleResize = function() {
	//check if control is hidden (not shown) when resize event is fired. Happens when keyboard is shown on another page, for example.
	if(this.$().is(":visible")) {
		if(!this.getWidth() || this.getWidth().indexOf("%") !== -1) {
			for(var i = 0; i < this.getButtons().length; i++) {			
				this.$().children('#' + this.getButtons()[i].getId()).width('').css('visibility', 'hidden');	
			}
			this._fCalcBtnWidth();
		}
	}
};
/**
 * Convenient method to add a button with a text as title or an uri for an icon. 
 * Only one is allowed.
 *
 * @param {sap.ui.core/string}
 *         sText defines the title text of the newly created button
 * @param {sap.ui.core/URI}
 *        sURI defines the icon uri of the button
 * @param {boolean}
 *        [bEnabled] sets the enabled status of the button
 * @param {function}
 *        [fTapListener] sets callback function for tap events
 * @return
 * @type {sap.m.Button}
 * @public
 */
sap.m.SegmentedButton.prototype.createButton = function(sText, sURI, bEnabled) {
	var oButton = new sap.m.Button();
	
	if(sURI === null && sText !== null){
		oButton.setText(sText);
	}else if(sURI !== null && sText === null){
		oButton.setIcon(sURI);
	}else
		throw new Error("in control: " + this.toString() + ": method createButton() just accepts text or icon");
	if(bEnabled || bEnabled === undefined) {
		oButton.setEnabled(true);
	}else {
		oButton.setEnabled(false);
	}
	this.addButton(oButton);

	return oButton;
};

sap.m.SegmentedButton.prototype.addButton = function(oButton) {
var that = this;
	oButton.attachTap(function(oEvent){
		that.$().children().removeClass('sapMSegBBtnSel');
		oEvent.getSource().$().addClass('sapMSegBBtnSel');
		if (that.getSelectedButton() !== oEvent.getSource().getId()) {
			that.setAssociation('selectedButton', oEvent.getSource(), true);
			that.fireSelect({button:oEvent.getSource(), id: oEvent.getSource().getId()});
		}
	});
	this.addAggregation('buttons',oButton);
	return this;
};

sap.m.SegmentedButton.prototype.insertButton = function(oButton) {
	var that = this;
	oButton.attachTap(function(oEvent){
		that.$().children().removeClass('sapMSegBBtnSel');
		oEvent.getSource().$().addClass('sapMSegBBtnSel');
		if (that.getSelectedButton() !== oEvent.getSource().getId()) {
			that.setAssociation('selectedButton', oEvent.getSource(), true);
			that.fireSelect({button:oEvent.getSource(), id: oEvent.getSource().getId()});
		}
	});
	this.insertAggregation('buttons',oButton);
	return this;
};

sap.m.SegmentedButton.prototype._ontouchstart = function(oEvent) {
	if (oEvent.srcControl.getEnabled())
		jQuery(oEvent.target).toggleClass('sapMSegBBtnTouched', true);
};

sap.m.SegmentedButton.prototype._ontouchend = function(oEvent) {
	if (oEvent.srcControl.getEnabled())
		jQuery(oEvent.target).toggleClass('sapMSegBBtnTouched', false);
};