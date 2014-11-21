/*!
 * ${copyright}
 */

// Provides control sap.m.Link.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator'],
	function(jQuery, library, Control, EnabledPropagator) {
	"use strict";


	
	/**
	 * Constructor for a new Link.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A hyperlink control which can be used to trigger actions or to navigate to other applications or web pages.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.Link
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Link = Control.extend("sap.m.Link", /** @lends sap.m.Link.prototype */ { metadata : {
	
		interfaces : [
			"sap.ui.core.IShrinkable"
		],
		library : "sap.m",
		properties : {
	
			/**
			 * Link text to be displayed.
			 */
			text : {type : "string", group : "Data", defaultValue : ''},
	
			/**
			 * Whether the link can be triggered by the user.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},
	
			/**
			 * Options are _self, _top, _blank, _parent, _search. Alternatively, a frame name can be entered.
			 */
			target : {type : "string", group : "Behavior", defaultValue : null},
	
			/**
			 * Width of text link. When it is set (CSS-size such as % or px), this is the exact size. When left blank, the text defines the size.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * The link target URI. Supports standard hyperlink behavior. If an action should be triggered, this should not be set, but instead an event handler for the "press" event should be registered.
			 */
			href : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
	
			/**
			 * Whether the link text is allowed to wrap when tehre is not sufficient space.
			 */
			wrapping : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * Subtle link is only to be used to help with visual hierarchy between large data lists of important and less important links. Subtle links should not be used in any other usecase
			 * @since 1.22
			 */
			subtle : {type : "boolean", group : "Behavior", defaultValue : false},
	
			/**
			 * Set this property to true if the link should appear emphasized.
			 * @since 1.22
			 */
			emphasized : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		events : {
	
			/**
			 * Event is fired when the user triggers the link control.
			 */
			press : {allowPreventDefault : true}
		}
	}});
	
	
	
	EnabledPropagator.call(Link.prototype);
	
	/**
	 * Also trigger link activation when space is pressed on the focused control
	 */
	Link.prototype.onsapspace = function(oEvent) {
		this._handlePress(oEvent); // this calls any JS event handlers
		// _handlePress() checks the return value of the event handler and prevents default if required or of the Link is disabled
		if (this.getHref() && !oEvent.isDefaultPrevented()) { 
			// Normal browser link, the browser does the job. According to the keyboard spec, Space should do the same as Enter/Click.
			// To make the browser REALLY do the same (history, referrer, frames, target,...), create a new "click" event and let the browser "do the needful".
			
			// first disarm the Space key event
			oEvent.preventDefault(); // prevent any scrolling which the browser might do because from its perspective the Link does not handle the "space" key
			oEvent.setMarked();
			
			// then create the click event
			var oClickEvent = document.createEvent('MouseEvents');
			oClickEvent.initEvent('click' /* event type */, false, true); // non-bubbling, cancelable
			this.getDomRef().dispatchEvent(oClickEvent);
		}
	};
	
	
	/**
	 * Function is called when Link is triggered.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Link.prototype._handlePress = function(oEvent) {
		if (this.getEnabled()) {
			if (!this.firePress()) { // fire event and check return value whether default action should be prevented
				oEvent.preventDefault();
			}
		} else { // disabled
			oEvent.preventDefault(); // even prevent URLs from being triggered
		}
	};
	
	if (sap.ui.Device.support.touch) {
		Link.prototype.ontap = Link.prototype._handlePress;
	} else {
		Link.prototype.onclick = Link.prototype._handlePress;
	}
	
	
	Link.prototype.ontouchstart = function(oEvent) {
		// for controls which need to know whether they should handle events bubbling from here
		oEvent.originalEvent._sapui_handledByControl = true;
	};
	
	Link.prototype.setText = function(sText){
		this.setProperty("text", sText, true);
		sText = this.getProperty("text");
		this.$().text(sText);
		return this;
	};
	
	Link.prototype.setHref = function(sUri){
		this.setProperty("href", sUri, true);
		sUri = this.getProperty("href");
		this.$().attr("href", sUri);
		return this;
	};
	
	Link.prototype.setSubtle = function(bSubtle){
		this.setProperty("subtle", bSubtle, true);
		this.$().toggleClass("sapMLnkSubtle", bSubtle);
		return this;
	};
	
	Link.prototype.setEmphasized = function(bEmphasized){
		this.setProperty("emphasized", bEmphasized, true);
		this.$().toggleClass("sapMLnkEmphasized", bEmphasized);
		return this;
	};
	
	Link.prototype.setWrapping = function(bWrapping){
		this.setProperty("wrapping", bWrapping, true);
		this.$().toggleClass("sapMLnkWrapping", bWrapping);
		return this;
	};
	
	Link.prototype.setEnabled = function(bEnbabled){
		this.setProperty("enabled", bEnbabled, true);
		this.$().toggleClass("sapMLnkDsbl", !bEnbabled);
		if (bEnbabled) {
			this.$().attr("disabled", false);
			this.$().attr("tabindex", "0");
		} else {
			this.$().attr("disabled", true);
			this.$().attr("tabindex", "-1");
		}
		return this;
	};
	
	Link.prototype.setWidth = function(sWidth){
		this.setProperty("width", sWidth, true);
		this.$().toggleClass("sapMLnkMaxWidth", !sWidth);
		this.$().css("width", sWidth);
		return this;
	};
	
	Link.prototype.setTarget = function(sTarget){
		this.setProperty("target", sTarget, true);
		if (!sTarget) {
			this.$().removeAttr("target");
		} else {
			this.$().attr("target", sTarget);
		}
		return this;
	};
	

	return Link;

}, /* bExport= */ true);
