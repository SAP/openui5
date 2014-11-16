/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.FixFlex.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/ResizeHandler', './library'],
	function(jQuery, Control, EnabledPropagator, ResizeHandler, library) {
	"use strict";


	
	/**
	 * Constructor for a new FixFlex.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The FixFlex control builds the container for a layout with a fixed and a flexible part. The flexible container adapts its size to the fix container. The fix container can hold any number of controls, while the flexible container can hold only one. 
	 * 
	 * In order for the FixFlex to stretch properly, the parent element, in which the control is placed, needs to have a specified height or needs to have an absolute position.
	 *
	 * Note: If the child control of the flex or the fix container has width/height bigger than the container itself, the child control will be cropped in the view.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.25.0
	 * @alias sap.ui.layout.FixFlex
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FixFlex = Control.extend("sap.ui.layout.FixFlex", /** @lends sap.ui.layout.FixFlex.prototype */ { metadata : {
	
		library : "sap.ui.layout",
		properties : {
	
			/**
			 * Determines the direction of the layout of child elements. True for vertical and false for horizontal layout.
			 */
			vertical : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Determines whether the fixed-size area should be on the beginning/top ( if the value is 'true') or beginning/bottom ( if the value is 'false').
			 */
			fixFirst : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Determines the height (if the vertical property is 'true') or the width (if the vertical property is 'false') of the fixed area. If left at the default value "auto", the fixed-size area will be as large as its content. In this case the content cannot use percentage sizes.
			 */
			fixContentSize : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'}
		},
		aggregations : {
	
			/**
			 * Controls in the fixed part of the layout.
			 */
			fixContent : {type : "sap.ui.core.Control", multiple : true, singularName : "fixContent"}, 
	
			/**
			 * Control in the stretching part of the layout.
			 */
			flexContent : {type : "sap.ui.core.Control", multiple : false}
		}
	}});
	
	
	EnabledPropagator.call(FixFlex.prototype);
	
	/**
	 * Calculate height/width on the flex part when flexbox is not supported
	 * 
	 * @private
	 */
	FixFlex.prototype._handlerResizeNoFlexBoxSupport = function() {
		var $Control = this.$(),
			$FixChild,
			$FlexChild;
	
		// Exit if the container is invisible
		if (!$Control.is(":visible")) {
			return;
		}
	
		$FixChild = this.$("Fixed");
		$FlexChild = this.$("Flexible");
	
		if (this.getVertical()) {
			$FlexChild.height(Math.floor($Control.height() - $FixChild.height()));
		} else {
			$FlexChild.width(Math.floor($Control.width() - $FixChild.width()));
			$FixChild.width(Math.floor($FixChild.width()));
		}
	};
	
	/**
	 * Deregister the control
	 * 
	 * @private
	 */
	FixFlex.prototype._deregisterControl = function() {
		// Deregister resize event
		if (this.sResizeListenerNoFlexBoxSupportId) {
			ResizeHandler.deregister(this.sResizeListenerNoFlexBoxSupportId);
			this.sResizeListenerNoFlexBoxSupportId = null;
		}
		// Deregister resize event for Fixed part
		if (this.sResizeListenerNoFlexBoxSupportFixedId) {
			ResizeHandler.deregister(this.sResizeListenerNoFlexBoxSupportFixedId);
			this.sResizeListenerNoFlexBoxSupportFixedId = null;
		}
	};
	
	FixFlex.prototype.exit = function() {
		this._deregisterControl();
	};
	
	FixFlex.prototype.onBeforeRendering = function() {
		this._deregisterControl();
	};
	
	FixFlex.prototype.onAfterRendering = function() {
	
		// Fallback for older browsers
		if (!jQuery.support.hasFlexBoxSupport) {
			this.sResizeListenerNoFlexBoxSupportFixedId = ResizeHandler.register(this.getDomRef("Fixed"), jQuery.proxy(this._handlerResizeNoFlexBoxSupport, this));
			this.sResizeListenerNoFlexBoxSupportId = ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._handlerResizeNoFlexBoxSupport, this));
			this._handlerResizeNoFlexBoxSupport();
		}
	};
	

	return FixFlex;

}, /* bExport= */ true);
