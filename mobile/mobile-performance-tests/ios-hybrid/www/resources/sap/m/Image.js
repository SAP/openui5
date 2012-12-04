/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Image.
jQuery.sap.declare("sap.m.Image");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Image.
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
 * <li>{@link #getSrc src} : sap.ui.core.URI</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize</li>
 * <li>{@link #getDecorative decorative} : boolean (default: true)</li>
 * <li>{@link #getAlt alt} : string</li>
 * <li>{@link #getUseMap useMap} : string</li>
 * <li>{@link #getDensityAware densityAware} : boolean (default: true)</li>
 * <li>{@link #getActiveSrc activeSrc} : sap.ui.core.URI (default: "")</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Image#event:tap tap} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A wrapper around the IMG tag. The image can be loaded from a remote or local server.
 * 
 * Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided. The valid desity values are 1, 1.5, 2. If the original devicePixelRatio isn't one of the three valid numbers, it's rounded up to the nearest one.
 * 
 * There are various size setting options available, and the images can be combined with actions.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Image
 */
sap.ui.core.Control.extend("sap.m.Image", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"src" : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"height" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"decorative" : {type : "boolean", group : "Accessibility", defaultValue : true},
		"alt" : {type : "string", group : "Accessibility", defaultValue : null},
		"useMap" : {type : "string", group : "Misc", defaultValue : null},
		"densityAware" : {type : "boolean", group : "Misc", defaultValue : true},
		"activeSrc" : {type : "sap.ui.core.URI", group : "Data", defaultValue : ""}
	},
	events : {
		"tap" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Image with name <code>sClassName</code> 
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
 * @name sap.m.Image.extend
 * @function
 */

sap.m.Image.M_EVENTS = {'tap':'tap'};


/**
 * Getter for property <code>src</code>.
 * Relative or absolute path to URL where the image file is stored. The path will be adapted to the density aware format according to the density of the device following the convention that [imageName]@[densityValue].[extension]
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>src</code>
 * @public
 * @name sap.m.Image#getSrc
 * @function
 */


/**
 * Setter for property <code>src</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sSrc  new value for property <code>src</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setSrc
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible images are not rendered.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Image#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setVisible
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Image#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setWidth
 * @function
 */

/**
 * Getter for property <code>height</code>.
 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the original ratio between width/height is maintained.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.m.Image#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setHeight
 * @function
 */

/**
 * Getter for property <code>decorative</code>.
 * A decorative image is included for design reasons. Accessibility tools will ignore decorative images.
 * 
 * Note: If the Image has an image map (useMap is set), this property will be overridden (the image will not be rendered as decorative).
 * A decorative image has no ALT attribute, so the Alt property is ignored if the image is decorative.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>decorative</code>
 * @public
 * @name sap.m.Image#getDecorative
 * @function
 */


/**
 * Setter for property <code>decorative</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bDecorative  new value for property <code>decorative</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setDecorative
 * @function
 */

/**
 * Getter for property <code>alt</code>.
 * The alternative text that is displayed in case the Image is not available, or cannot be displayed.
 * If the image is set to decorative this property is ignored.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>alt</code>
 * @public
 * @name sap.m.Image#getAlt
 * @function
 */


/**
 * Setter for property <code>alt</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sAlt  new value for property <code>alt</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setAlt
 * @function
 */

/**
 * Getter for property <code>useMap</code>.
 * The name of the image map that defines the clickable areas
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>useMap</code>
 * @public
 * @name sap.m.Image#getUseMap
 * @function
 */


/**
 * Setter for property <code>useMap</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sUseMap  new value for property <code>useMap</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setUseMap
 * @function
 */

/**
 * Getter for property <code>densityAware</code>.
 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
 * 
 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
 * 
 * If bandwidth is the key for the application, set this value to false.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>densityAware</code>
 * @public
 * @name sap.m.Image#getDensityAware
 * @function
 */


/**
 * Setter for property <code>densityAware</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bDensityAware  new value for property <code>densityAware</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setDensityAware
 * @function
 */

/**
 * Getter for property <code>activeSrc</code>.
 * The source property when this image is tapped.
 *
 * Default value is <code>""</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>activeSrc</code>
 * @public
 * @name sap.m.Image#getActiveSrc
 * @function
 */


/**
 * Setter for property <code>activeSrc</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {sap.ui.core.URI} sActiveSrc  new value for property <code>activeSrc</code>
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#setActiveSrc
 * @function
 */

/**
 * Event is fired when the user clicks on the control. 
 *
 * @name sap.m.Image#tap
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'tap' event of this <code>sap.m.Image</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Image</code>.<br/> itself. 
 *  
 * Event is fired when the user clicks on the control. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Image</code>.<br/> itself.
 *
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#attachTap
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'tap' event of this <code>sap.m.Image</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Image#detachTap
 * @function
 */


/**
 * Fire event tap to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Image} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Image#fireTap
 * @function
 */

// Start of sap\m\Image.js
sap.m.Image._currentDevicePixelRatio = (function(){
	// if devicePixelRatio property is not available, value 1 is assumed by default.
	var ratio = (window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio);
	
	//for ratio in our library, only 1 1.5 2 are valid
	if(ratio <= 1){
		ratio = 1;
	}else{
	//round it to the nearest valid value
		ratio *= 2;
		ratio = Math.round(ratio);
		ratio /= 2;
	}
	
	if(ratio > 2){
		ratio = 2;
	}
	return ratio;
}());

/**
 * Function is called when image is loaded successfully.
 * @param {jQuery.Event} oEvent
 * @private
 */
sap.m.Image.prototype.onload = function(oEvent){
	//this is used to fix the late load event handler problem on ios platform, if the event handler 
	//has not been called right after image is loaded, event is triggered manually in onAfterRendering
	//method. 
	if(!this._defaultEventTriggered){
		this._defaultEventTriggered = true;
	}
	
	var $domNode = this.$(), domRef = $domNode[0];
	
	if(!this._isWidthOrHeightSet()){
		if(this._iLoadImageDensity > 1){
			if(($domNode.width() === domRef.naturalWidth) && ($domNode.height() === domRef.naturalHeight)){
				$domNode.width( $domNode.width() / this._iLoadImageDensity );
			}
		}
	}
	$domNode.removeClass("sapMNoImg");
};

/**
 * Function is called when error occurs during image loading.
 * @param {jQuery.Event} oEvent
 * @private
 */
sap.m.Image.prototype.onerror = function(oEvent){
	//this is used to fix the late load event handler problem on ios platform, if the event handler 
	//has not been called right after image is loaded with errors, event is triggered manually in onAfterRendering
	//method.
	if(!this._defaultEventTriggered){
		this._defaultEventTriggered = true;
	}
	
	var $domNode = this.$(), 
		sCurrentSrc = $domNode.attr("src"),
		d = sap.m.Image._currentDevicePixelRatio;

	$domNode.addClass("sapMNoImg");
	
	//if src is empty or there's no image existing, just stop
	if(!sCurrentSrc || this._iLoadImageDensity === 1){
		return;
	}
	
	if(d === 2 || d < 1){
		//load the default image
		this._iLoadImageDensity = 1;
		$domNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 1));
	}else if(d === 1.5){
		if(this._bVersion2Tried){
			//if version 2 isn't on the server, load the default image
			this._iLoadImageDensity = 1;
			$domNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 1));
		}else{
			//special treatment for density 1.5
			//verify if the version for density 2 is provided or not
			this._iLoadImageDensity = 2;
			$domNode.attr("src", this._generateSrcByDensity(this._isActiveState ? this.getActiveSrc() : this.getSrc(), 2));
			this._bVersion2Tried = true;
		}
	}
};


/**
 * This function is called to register event handlers for load and error event on the image DOM after it's rendered.
 * It also check if the event handlers are called accordingly after the image is loaded, if not the event handlers are triggered
 * manually.
 * @private
 */
sap.m.Image.prototype.onAfterRendering = function(){
	//if densityAware is set to true, we need to do extra steps for getting and resizing the density perfect version of the image.
	if(this.getDensityAware()){
		var $DomNode = this.$();
	
		//bind the load and error event handler
		$DomNode.bind("load", jQuery.proxy(this.onload, this));
		$DomNode.bind("error", jQuery.proxy(this.onerror, this));
		
		var domRef = this.getDomRef();
		
		//if image has already been loaded and the load or error event handler hasn't been called, trigger it manually.
		if(domRef.complete && !this._defaultEventTriggered){
			//need to use the naturalWidth property instead of jDomNode.width(), the later one returns positive value even in case of broken image
			if(domRef.naturalWidth > 0){
				//image loaded successfully
				$DomNode.trigger("load");
			}else{
				//image loaded with error
				$DomNode.trigger("error");
			}
		}
	}
};

/**
 * This binds to the touchstart event to change the src property of the image to the activeSrc
 * @private
 *
 */
sap.m.Image.prototype.ontouchstart = function(oEvent){
	//for control who need to know if they should handle events from the image control
	if(oEvent.srcControl.mEventRegistry["tap"]){
		oEvent.originalEvent._sapui_handledByControl = true;
	}

	var sActiveSrc = this.getActiveSrc();
	if(sActiveSrc){
		//change the source only when the first finger is on the image, the following fingers doesn't affect
		if((oEvent.targetTouches && oEvent.targetTouches.length === 1) || !oEvent.targetTouches){
			this.$().attr("src", this._getDensityAwareActiveSrc());

			this._isActiveState = true;
			if(!this._touchEndProxy){
				this._touchEndProxy = jQuery.proxy(this._ontouchend, this);
			}
			
			if(jQuery.sap.touchEventMode !== "ON"){
				//binding to document when runs in desktop browser
				//here also bound to the mouseup event to enable it working in desktop browsers
				jQuery(window.document).bind("vmouseup", this._touchEndProxy);
			}else{
				//binding to the image itself when runs in mobile device
				//Galaxy Note (4.0.4) can't bubble the touchend event to document
				this.$().bind("touchcancel touchend", this._touchEndProxy);
			}
		}
	}
	
	//disable the select callout in android
	//-webkit-touch-callout: none doesn't work in android
	//preventDefault causes issues for ios
	if(jQuery.os.android){
		oEvent.preventDefault();
	}
};

/**
 * This changes the src property of the image back to the src property of the image control.
 * @private
 *
 */
sap.m.Image.prototype._ontouchend = function(oEvent){
	//change the source back only when all fingers leave the image
	if((oEvent.targetTouches && oEvent.targetTouches.length === 0) || !oEvent.targetTouches){
		this._isActiveState = false;
		this.$().attr("src", this._getDensityAwareSrc()).removeClass("sapMNoImg");
		if(jQuery.sap.touchEventMode !== "ON"){
			jQuery(window.document).unbind("vmouseup", this._touchEndProxy);
		}else{
			this.$().unbind("touchcancel touchend", this._touchEndProxy);
		}
	}
};

/**
 * This overrides the default setter of the src property and update the dom node.
 * @public
 */
sap.m.Image.prototype.setSrc = function(sSrc){
	if(sSrc === this.getSrc()){
		return;
	}
	this.setProperty("src", sSrc, true);
	
	var oDomRef = this.getDomRef();
	if(oDomRef){
		this.$().attr("src", this._getDensityAwareSrc());
	}
};

/**
 * This overrides the default setter of the activeSrc property in order to avoid the rerendering.
 * @public
 *
 */
sap.m.Image.prototype.setActiveSrc = function(sActiveSrc){
	if(!sActiveSrc){
		sActiveSrc = "";
	}
	this.setProperty("activeSrc", sActiveSrc, true);
};


/**
 * Function is called when image is clicked.
 * @param {jQuery.Event} oEvent
 * @private
 */
sap.m.Image.prototype.ontap = function(oEvent) {
	this.fireTap({/* no parameters */});	
};


/**
 * Test if at least one of the width and height properties is set.
 * @private
 */
sap.m.Image.prototype._isWidthOrHeightSet = function(){
	return (this.getWidth() && this.getWidth() !== '') || (this.getHeight() && this.getHeight() !== '');
};


/**
 * This function returns the density aware source based on the deviceDensityRatio value. 
 * The return value is in the format [src]@[densityValue].[extension] if the densityValue not equal 1, otherwise it returns the src property.
 * @private
 */
sap.m.Image.prototype._getDensityAwareSrc = function(){
	var d = sap.m.Image._currentDevicePixelRatio,
		sSrc = this.getSrc();
	
	//this property is used for resizing the higher resolution image when image is loaded.
	this._iLoadImageDensity = d;

	//if devicePixelRatio equals 1 or densityAware set to false, simply return the src property
	if(d === 1 || !this.getDensityAware()){
		return sSrc;
	}
	
	return this._generateSrcByDensity(sSrc, d);
};

/**
 * This function returns the density aware version of the Active source base on the deviceDensityRatio value.
 * @private
 */
sap.m.Image.prototype._getDensityAwareActiveSrc = function(){
	var d = sap.m.Image._currentDevicePixelRatio,
		sActiveSrc = this.getActiveSrc();
	
	//this property is used for resizing the higher resolution image when image is loaded.
	this._iLoadImageDensity = d;

	//if devicePixelRatio equals 1 or densityAware set to false, simply return the src property
	if(d === 1 || !this.getDensityAware()){
		return sActiveSrc;
	}
	
	return this._generateSrcByDensity(sActiveSrc, d);
};

/**
 * This function generates the density aware version of the src property according to the iDensity provided. 
 * It returns the density aware version of the src property.
 * @private
 */
sap.m.Image.prototype._generateSrcByDensity = function(sSrc, iDensity){	
	if(!sSrc){
		return "";
	}
	
	// if src is in data uri format, disable the density handling
	if(this._isDataUri(sSrc)){
		this._iLoadImageDensity = 1;
		return sSrc;
	}

	var iPos = sSrc.lastIndexOf("."),
		sName = sSrc.substring(0, iPos),
		sExtension = sSrc.substring(iPos);
//		iAtPos = sName.lastIndexOf("@");
	
	//if there's no extension
	if(iPos == -1){
		return sSrc + "@" + iDensity;
	}
	
	//remove the existing density information
	//this is disabled because the orignal src or activeSrc is used
//	if(iAtPos !== -1 && sName.length - iAtPos < 6){//@2 @1.5 @0.75 only these three cases, if the image itself has a @, these are the only checks we can do.
//		sName = sName.substring(0, iAtPos);
//	}
	
	if(iDensity === 1){
		return sName + sExtension;
	}

	sName = sName + "@" + iDensity;
	return sName + sExtension;
};


sap.m.Image.prototype._isDataUri = function(src){
	if(src){
		return src.indexOf("data:") === 0;
	}else{
		return false;
	}
};