/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.TooltipBase.
jQuery.sap.declare("sap.ui.core.TooltipBase");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new TooltipBase.
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
 * <li>{@link #getText text} : string (default: "")</li>
 * <li>{@link #getOpenDuration openDuration} : int (default: 200)</li>
 * <li>{@link #getCloseDuration closeDuration} : int (default: 200)</li>
 * <li>{@link #getMyPosition myPosition} : sap.ui.core.Dock (default: 'begin top')</li>
 * <li>{@link #getAtPosition atPosition} : sap.ui.core.Dock (default: 'begin bottom')</li>
 * <li>{@link #getOffset offset} : string (default: '10 3')</li>
 * <li>{@link #getCollision collision} : sap.ui.core.Collision (default: 'flip')</li>
 * <li>{@link #getOpenDelay openDelay} : int (default: 500)</li>
 * <li>{@link #getCloseDelay closeDelay} : int (default: 100)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Abstract class that can be extended in order to implement any extended tooltip. For example, RichTooltip Control is based on it. It provides the opening/closing behavior and the main "text" property.
 * @extends sap.ui.core.Control
 *
 * @author  
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.TooltipBase
 */
sap.ui.core.Control.extend("sap.ui.core.TooltipBase", { metadata : {

	// ---- object ----
	"abstract" : true,

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"text" : {type : "string", group : "Misc", defaultValue : ""},
		"openDuration" : {type : "int", group : "Behavior", defaultValue : 200},
		"closeDuration" : {type : "int", group : "Behavior", defaultValue : 200},
		"myPosition" : {type : "sap.ui.core.Dock", group : "Behavior", defaultValue : 'begin top'},
		"atPosition" : {type : "sap.ui.core.Dock", group : "Behavior", defaultValue : 'begin bottom'},
		"offset" : {type : "string", group : "Behavior", defaultValue : '10 3'},
		"collision" : {type : "sap.ui.core.Collision", group : "Behavior", defaultValue : 'flip'},
		"openDelay" : {type : "int", group : "Misc", defaultValue : 500},
		"closeDelay" : {type : "int", group : "Misc", defaultValue : 100}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.TooltipBase with name <code>sClassName</code> 
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
 * @name sap.ui.core.TooltipBase.extend
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * The text that is shown in the tooltip that extends the TooltipBase class, for example in RichTooltip.
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.ui.core.TooltipBase#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setText
 * @function
 */

/**
 * Getter for property <code>openDuration</code>.
 * Optional. Open Duration in milliseconds.
 *
 * Default value is <code>200</code>
 *
 * @return {int} the value of property <code>openDuration</code>
 * @public
 * @name sap.ui.core.TooltipBase#getOpenDuration
 * @function
 */


/**
 * Setter for property <code>openDuration</code>.
 *
 * Default value is <code>200</code> 
 *
 * @param {int} iOpenDuration  new value for property <code>openDuration</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setOpenDuration
 * @function
 */

/**
 * Getter for property <code>closeDuration</code>.
 * Optional. Close Duration in milliseconds.
 *
 * Default value is <code>200</code>
 *
 * @return {int} the value of property <code>closeDuration</code>
 * @public
 * @name sap.ui.core.TooltipBase#getCloseDuration
 * @function
 */


/**
 * Setter for property <code>closeDuration</code>.
 *
 * Default value is <code>200</code> 
 *
 * @param {int} iCloseDuration  new value for property <code>closeDuration</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setCloseDuration
 * @function
 */

/**
 * Getter for property <code>myPosition</code>.
 * Optional. My position defines which position on the extended tooltip being positioned to align with the target control.
 *
 * Default value is <code>begin top</code>
 *
 * @return {sap.ui.core.Dock} the value of property <code>myPosition</code>
 * @public
 * @name sap.ui.core.TooltipBase#getMyPosition
 * @function
 */


/**
 * Setter for property <code>myPosition</code>.
 *
 * Default value is <code>begin top</code> 
 *
 * @param {sap.ui.core.Dock} sMyPosition  new value for property <code>myPosition</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setMyPosition
 * @function
 */

/**
 * Getter for property <code>atPosition</code>.
 * Optional. At position defines which position on the target control to align the positioned tooltip.
 *
 * Default value is <code>begin bottom</code>
 *
 * @return {sap.ui.core.Dock} the value of property <code>atPosition</code>
 * @public
 * @name sap.ui.core.TooltipBase#getAtPosition
 * @function
 */


/**
 * Setter for property <code>atPosition</code>.
 *
 * Default value is <code>begin bottom</code> 
 *
 * @param {sap.ui.core.Dock} sAtPosition  new value for property <code>atPosition</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setAtPosition
 * @function
 */

/**
 * Getter for property <code>offset</code>.
 * Optional. Offset adds these left-top values to the calculated position.
 * Example: "10 3".
 *
 * Default value is <code>10 3</code>
 *
 * @return {string} the value of property <code>offset</code>
 * @public
 * @name sap.ui.core.TooltipBase#getOffset
 * @function
 */


/**
 * Setter for property <code>offset</code>.
 *
 * Default value is <code>10 3</code> 
 *
 * @param {string} sOffset  new value for property <code>offset</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setOffset
 * @function
 */

/**
 * Getter for property <code>collision</code>.
 * Optional. Collision - when the positioned element overflows the window in some direction, move it to an alternative position.
 *
 * Default value is <code>flip</code>
 *
 * @return {sap.ui.core.Collision} the value of property <code>collision</code>
 * @public
 * @name sap.ui.core.TooltipBase#getCollision
 * @function
 */


/**
 * Setter for property <code>collision</code>.
 *
 * Default value is <code>flip</code> 
 *
 * @param {sap.ui.core.Collision} sCollision  new value for property <code>collision</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setCollision
 * @function
 */

/**
 * Getter for property <code>openDelay</code>.
 * Opening delay of the tooltip in milliseconds
 *
 * Default value is <code>500</code>
 *
 * @return {int} the value of property <code>openDelay</code>
 * @public
 * @name sap.ui.core.TooltipBase#getOpenDelay
 * @function
 */


/**
 * Setter for property <code>openDelay</code>.
 *
 * Default value is <code>500</code> 
 *
 * @param {int} iOpenDelay  new value for property <code>openDelay</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setOpenDelay
 * @function
 */

/**
 * Getter for property <code>closeDelay</code>.
 * Closing delay of the tooltip in milliseconds
 *
 * Default value is <code>100</code>
 *
 * @return {int} the value of property <code>closeDelay</code>
 * @public
 * @name sap.ui.core.TooltipBase#getCloseDelay
 * @function
 */


/**
 * Setter for property <code>closeDelay</code>.
 *
 * Default value is <code>100</code> 
 *
 * @param {int} iCloseDelay  new value for property <code>closeDelay</code>
 * @return {sap.ui.core.TooltipBase} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.TooltipBase#setCloseDelay
 * @function
 */

// Start of sap\ui\core\TooltipBase.js
jQuery.sap.require("sap.ui.core.Popup");

/**
 * Return the popup to use but do not expose it to the outside.
 * @type sap.ui.commons.Popup
 * @return The popup to use
 * @private
 */
sap.ui.core.TooltipBase.prototype._getPopup = jQuery.sap.getter((function() {
		var oPopup = new sap.ui.core.Popup();
			oPopup.setShadow(true);
			return oPopup;
		}())
);

/**
 * When a control that has a Tooltip gets the focus, this method is called.
 * @param {jQuery.EventObject} oEvent The event that occurred on the Control that has extended Tooltip.
 * @private
 */
sap.ui.core.TooltipBase.prototype.onfocusin = function(oEvent) {

	var oSC = jQuery(oEvent.target).control(0);
	if (oSC != null) {
		var oDomRef = oSC.getFocusDomRef();
		this.sStoredTooltip = null;
		if (oDomRef.title && oDomRef.title!= "") {
			this.sStoredTooltip = oDomRef.title;
			oDomRef.title = "";
		}

		var oPopup = this._getPopup();
		if (!(oPopup.isOpen() && oPopup.getContent() == this)) {
			// Update Tooltip or create a new span with texts.
			sap.ui.getCore().getRenderManager().render(this, sap.ui.getCore().getStaticAreaRef(), true);
		}

		// Attach accessibility info to the control oSC
		var sValue = oDomRef.getAttribute("aria-describedby");
		var sIdsString = this.getId() + "-title " + this.getId() +"-txt";
		if (sValue == null || sValue== "" ) {
			oDomRef.setAttribute("aria-describedby", sIdsString);
		}
		else if (sValue.indexOf(sIdsString) == -1) {
			oDomRef.setAttribute("aria-describedby", sValue + " " + sIdsString);
		}
	}
};

/**
 * When a control that has a Tooltip looses the focus, this method is called.
 * @param {jQuery.EventObject} oEvent The event that occurred on the extended Tooltip.
 * @private
 */
sap.ui.core.TooltipBase.prototype.onfocusout = function(oEvent) {
	var oSC = jQuery(oEvent.target).control(0);
	if (oSC != null) {

		var oDomRef = oSC.getFocusDomRef();
		if (this.sStoredTooltip) {
			oDomRef.title = this.sStoredTooltip;
		}

		// Detach accessibility information from control oSC.
		var sValue = oDomRef.getAttribute("aria-describedby");
		var sIdsString = this.getId() + "-title " + this.getId() +"-txt";
		if (sValue && sValue.indexOf(sIdsString) >= 0){
			if (jQuery.trim(sValue) == sIdsString) {
				oDomRef.removeAttribute("aria-describedby");
			}
			else  {
				sValue = sValue.replace(sIdsString, "");
				oDomRef.setAttribute("aria-describedby", sValue);
			}
		}
	}
	if (this.sOpenTimeout){
		jQuery.sap.clearDelayedCall(this.sOpenTimeout);
		this.sOpenTimeout = null;
	}

	// Avoid closing the popup when there is a move inside the control to another control or element (for example div)
	this.sCloseNowTimeout = jQuery.sap.delayedCall(this.getCloseDelay(), this, "closePopup");
};

/**
 *	Check if the parameter is a standard browser Tooltip.
 * @return {boolean} - true if the Tooltip is a standard tooltip type of string. False if not a string or empty.
 * @private
 */
sap.ui.core.TooltipBase.prototype.isStandardTooltip = function(oTooltip) {
	return  (typeof oTooltip === "string" &&  (jQuery.trim(oTooltip)) !== "");
};

/**
* Handle the mouseover event of a Control that has a Tooltip.
* @param {jQuery.EventObject} oEvent - The event that occurred on the Control.
* @private
 */
sap.ui.core.TooltipBase.prototype.onmouseover = function(oEvent) {

	// The Element or Control that initiated the event.
	var oEventSource = jQuery(oEvent.target).control(0);
    //jQuery.sap.log.debug("MOUSE OVER    " +  oEventSource + "  " + jQuery(oEvent.currentTarget).control(0));
	if ( oEventSource != null) {

		// If we move in the tooltip itself then do not close the tooltip.
		if ( oEventSource === this) {
			if (this.sCloseNowTimeout) {
					jQuery.sap.clearDelayedCall(this.sCloseNowTimeout);
					this.sCloseNowTimeout = null;
				}
				oEvent.stopPropagation();
				oEvent.preventDefault();
				return;
		}
		// The current Element or Control within the event bubbling phase.
		var oCurrentElement = jQuery(oEvent.currentTarget).control(0);
		// Cancel close event if we move from parent with extended tooltip to child without own tooltip
		if ( oCurrentElement !== oEventSource &&  !this.isStandardTooltip(oEventSource.getTooltip()))  {
			if (this.sCloseNowTimeout){
				jQuery.sap.clearDelayedCall(this.sCloseNowTimeout);
				this.sCloseNowTimeout = null;
				oEvent.stopPropagation();
				oEvent.preventDefault();
				return;
			}
		}

		// Indicates the element being exited.
		var oLeftElement = jQuery(oEvent.relatedTarget).control(0);
		if (oLeftElement) {

			// Cancel close event if we move from child without own tooltip to the parent with rtt - current element has to have rtt.
			if (oLeftElement.getParent()){
				if (oLeftElement.getParent() === oCurrentElement && oCurrentElement === oEventSource) {
					// It is a child of the current element and has no tooltip
					var oLeftElementTooltip = oLeftElement.getTooltip();
					if ( !this.isStandardTooltip(oLeftElementTooltip) && (!oLeftElementTooltip || !(oLeftElementTooltip instanceof sap.ui.core.TooltipBase))) {
						if (this.sCloseNowTimeout){
							jQuery.sap.clearDelayedCall(this.sCloseNowTimeout);
							this.sCloseNowTimeout = null;
								oEvent.stopPropagation();
								oEvent.preventDefault();
							return;
						}
					}
				}
			}
		}

		// Open the popup
		if (this._currentControl === oEventSource || !this.isStandardTooltip(oEventSource.getTooltip())) {
			// Set all standard tooltips to empty string
			this.removeStandardTooltips(oEventSource);
			// Open with delay 0,5 sec.
			this.sOpenTimeout = jQuery.sap.delayedCall(this.getOpenDelay(), this, "openPopup", [this._currentControl]);
			// We need this for the scenario if the both a child and his parent have an RichTooltip
			oEvent.stopPropagation();
			oEvent.preventDefault();
		}
	}
};

/**
 * Handle the mouseout event  of a Control that has a Tooltip.
 * @param {jQuery.EventObject} oEvent Event that occurred on the Control that has extended Tooltip.
 * @private
 */
sap.ui.core.TooltipBase.prototype.onmouseout = function(oEvent) {
	//jQuery.sap.log.debug("MOUSE OUT    " + jQuery(oEvent.target).control(0) + "   "+ jQuery(oEvent.currentTarget).control(0) );
	if (this.sOpenTimeout){
		jQuery.sap.clearDelayedCall(this.sOpenTimeout);
		this.sOpenTimeout = null;
	}
	// Avoid closing the popup when there is a move inside the control to another control or element (for example div)
	if (!this.sCloseNowTimeout) {
		this.sCloseNowTimeout = jQuery.sap.delayedCall(this.getCloseDelay(), this, "closePopup");
	}
	this.restoreStandardTooltips();
	oEvent.stopPropagation();
	oEvent.preventDefault();
};

/**
 * Close the popup holding the content of the tooltip.
 * Clears all delayed calls for closing this popup as those are not needed anymore.
 * @private
 */
sap.ui.core.TooltipBase.prototype.closePopup = function() {
	var oPopup = this._getPopup();
	if (this.sCloseNowTimeout) {
		jQuery.sap.clearDelayedCall(this.sCloseNowTimeout);
	}
	this.sCloseNowTimeout = null;
	//jQuery.sap.log.debug("CLOSE POPUP");
	oPopup.close();
	this.restoreStandardTooltips();
};


/**
 * Open the popup holding the content of the tooltip.
 * @param {Object} oSC - the Control that has extended Tooltip.
 * @private
 */
sap.ui.core.TooltipBase.prototype.openPopup = function(oSC) {
	if (oSC.getTooltip() != null) {

		// Clear Delayed Call if exist
		if (this.sCloseNowTimeout){
			jQuery.sap.clearDelayedCall(this.sCloseNowTimeout);
			this.sCloseNowTimeout = null;
			return;
		}

		// If already opened with the needed content then return
		var oPopup = this._getPopup();
		if (oPopup.isOpen() && oPopup.getContent() == this) {
			return;
		}

		// Tooltip will be displayed. Ensure the content is rendered. As this is no control, the popup will not take care of rendering.
		sap.ui.getCore().getRenderManager().render(this, sap.ui.getCore().getStaticAreaRef(), true);

		// Open popup
		var oDomRef = oSC.getDomRef();
		oPopup.setContent(this);
		oPopup.setPosition(this.getMyPosition(), this.getAtPosition(), oDomRef, this.getOffset(), this.getCollision());
		oPopup.setDurations(this.getOpenDuration(), this.getCloseDuration());
		oPopup.open();
		this.removeStandardTooltips(this._currentControl);
	}
};

/**
 * Switch off the browser standard tooltips and store then in an array.
 * @private
*/
sap.ui.core.TooltipBase.prototype.removeStandardTooltips = function() {

	var oDomRef = this._currentControl.getDomRef();
	if (!this.aStoredTooltips) {
		this.aStoredTooltips = [];
	} else{
		return;
	}

	var tooltip = "";
	while (oDomRef && !(oDomRef === document)) {
		tooltip = oDomRef.title;
		if ( tooltip ) {
			this.aStoredTooltips.push({ domref : oDomRef, tooltip : tooltip });
			oDomRef.title = "";
		}
		oDomRef = oDomRef.parentNode;
	}

	// Do it for the specified elements under the root Dom ref.
	if (this._currentControl.getTooltipDomRefs) {
		// oDomRefs is jQuery Object that contains DOM nodes of the elements to remove the tooltips
		var aDomRefs = this._currentControl.getTooltipDomRefs();
		for (var i = 0; i < aDomRefs.length; i++) {
			oDomRef = aDomRefs[i];
			if (oDomRef) {
				tooltip = oDomRef.title;
				if (tooltip) {
					this.aStoredTooltips.push({ domref : oDomRef, tooltip : tooltip });
					oDomRef.title = "";
				}
			}
		}
	}
};

/**
 * Restore the standard browser tooltips.
 * @private
 */
sap.ui.core.TooltipBase.prototype.restoreStandardTooltips = function() {

	var oPopup = this._getPopup();
	var eState = oPopup.getOpenState();
	if (eState === sap.ui.core.OpenState.OPEN || eState === sap.ui.core.OpenState.OPENING) {
		//jQuery.sap.log.debug(oPopup.getOpenState());
		return;
	}
	if (this.sOpenTimeout){
		return;
	}
	if (this.aStoredTooltips){
		for (var i = 0; i < this.aStoredTooltips.length; i++) {
			var oDomRef = this.aStoredTooltips[i].domref;
			oDomRef.title = this.aStoredTooltips[i].tooltip;
		}
	}
	this.aStoredTooltips = null;
};

/* Store reference to original setParent function */
sap.ui.core.TooltipBase.prototype._setParent = sap.ui.core.TooltipBase.prototype.setParent;

/**
 * Defines the new parent of this TooltipBase using {@link sap.ui.core.Element#setParent}.
 * Additionally closes the Tooltip.
 *
 * @param {sap.ui.core.Element} oParent The element that becomes this element's parent.
 * @param {string} sAggregationName - The name of the parent element's aggregation.
 * @private
 */
sap.ui.core.TooltipBase.prototype.setParent = function(oParent, sAggregationName) {
	// As there is a new parent, close popup.
	this.closePopup();
	this._setParent.apply(this, arguments);
};
/**
 * Handle the key down event Ctrl+i and ESCAPE.
 * @param {jQuery.Event} oEvent - the event that occurred on the Parent of the Extended Tooltip.
 * @private
 */
sap.ui.core.TooltipBase.prototype.onkeydown = function(oEvent) {
	// Ctrl is pressed together with "i" - Open Rich tooltip.
	if(oEvent.ctrlKey && oEvent.which == jQuery.sap.KeyCodes.I) {
		// The Element or Control that initiated the event.

		var oEventSource = jQuery(oEvent.target).control(0);
		if (oEventSource != null) {
			// If the current control is the event source or event source does not have a standard tooltip
			if (this._currentControl === oEventSource || !this.isStandardTooltip(oEventSource.getTooltip())) {

				// Set all standard tooltips to empty string
				this.removeStandardTooltips(oEventSource);

				// Open extended tooltip
				this.openPopup( this._currentControl);

				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		}
	}
	// If Ecs is pressed then close the Rich Tooltip.
	else if(oEvent.which == jQuery.sap.KeyCodes.ESCAPE) {
		if (this.sOpenTimeout) {
			jQuery.sap.clearDelayedCall(this.sOpenTimeout);
			this.sOpenTimeout = null;
		}
		this.closePopup();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	}
};
