/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Scope.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";

	/**
	 * Constructor for a new Scope.
	 *
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The Scope is a wrapper for the window object of the root element.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.Scope
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Scope = function(oDesignTime) {
		this._oElement = undefined;
		// TODO All Drag relevant code should be moved to another class (e.g. DragManager)
		this.dropAreaId = "widget-droparea";
		this._oDesignTime = oDesignTime;
		this._oEventBus = oDesignTime.oEventBus;
	};
	
	Scope.prototype.destroy = function() {
		this.bIsDestroyed = true;
		this._removeEventListener();
		
		var oStyleElement = this.getStyleElement();
		if (oStyleElement) {
			oStyleElement.onload = undefined;
			// TODO remove the style element. When this line is active the view is not rendered right - why? seems to be because it is async
			//this.getHeadElement().removeChild(oStyleElement);
		}

		delete this._oDesignTime;
		delete this._oEventBus;
		delete this._oElement;
	};
	
	/*
	 * @private
	 */
	Scope.prototype._removeEventListener = function() {
		var oWindow = this.getWindow();
		if (oWindow) {
			if (this._onWindowChangedProxy) {
				this.getWindow().removeEventListener("resize", this._onWindowChangedProxy);
				this.getWindow().removeEventListener("scroll", this._onWindowChangedProxy, true);
				this._onWindowChangedProxy = undefined;
			}	
		}
		
		var oBody = this.getBodyElement();
		if (oBody) {
			if (this._onDragOverProxy) {
				this.getHTMLElement()[0].removeEventListener("dragover", this._onDragOverProxy);
			}
			if (this._onDropProxy) {
				this.getHTMLElement()[0].removeEventListener("drop", this._onDropProxy);
			}

			if (this._onTransitionEndProxy) {
				oBody.removeEventListener("webkitTransitionEnd", this._onTransitionEndProxy);
				this._onTransitionEndProxy = undefined;
			}
		}
		
		if (this._onDragOverProxy) {
			document.body.removeEventListener("dragover", this._onDragOverProxy);
			this._onDragOverProxy = undefined;
		}
		
		if (this._onDropProxy) {
			document.body.removeEventListener("drop", this._onDropProxy);
			this._onDropProxy = undefined;
		}
		
	};

	//TODO find a better place and clarify why the D&D handler are needed here.
	Scope.prototype.setElement = function(oElement, fnCallback) {
		this._removeEventListener();
		
		this._oElement = oElement;
		if (!this.getDropArea()) {
			var div = this.getDocument().createElement("div");
			div.id = this.getDropAreaId();
			this.getBodyElement().appendChild(div);
		}
		
		this._onWindowChangedProxy = jQuery.proxy(this._onWindowChanged, this);
		this._onDragOverProxy = jQuery.proxy(this._onDragOver, this);
		this._onDropProxy = jQuery.proxy(this._onDrop, this);
		this._onTransitionEndProxy = jQuery.proxy(this._onTransitionEnd, this);

		this.getWindow().addEventListener("resize", this._onWindowChangedProxy);
		//this.getWindow().addEventListener("scroll", this._onWindowChangedProxy, true);
		this.getHTMLElement()[0].addEventListener("dragover", this._onDragOverProxy);
		this.getHTMLElement()[0].addEventListener("drop", this._onDropProxy);
		this.getBodyElement().addEventListener("webkitTransitionEnd", this._onTransitionEndProxy);

		// When the widget is dropped outside the iframe
		document.body.addEventListener("dragover", this._onDragOverProxy);
		document.body.addEventListener("drop", this._onDropProxy);
		
		// TODO add window resize event

		var fnLoaded = function() {
			this.dataset.sapUiDtLoaded = true;
			fnCallback();
		};
		
		// TODO: Move to a better place?
		var oStyleElement = this.getStyleElement();
		if (!oStyleElement) {
			this._bLoaded = false;
			this.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
			this.require("sap.ui.thirdparty.jqueryui.jquery-ui-widget");
			this.require("sap.ui.thirdparty.jqueryui.jquery-ui-mouse");
			this.require("sap.ui.thirdparty.jqueryui.jquery-ui-resizable");

			//TODO: Make relative path (can we use require.toUrl here or should the control be kept as ui5 only)
			var sHref = this.getWindow().jQuery.sap
					.getResourcePath("sap/ui/dt/style/style.css");
			var $style = jQuery("<link id='widget-style-element' href='" + sHref + "' type='text/css' rel='stylesheet' />");
			$style[0].onload = fnLoaded;
			this.getHeadElement().appendChild($style[0]);
		} else {
			if (oStyleElement.dataset.sapUiDtLoaded) {
				fnCallback();	
			} else {
				// Make sure that only the last handler is called (this happens when the view is rendered several times during startup and the styles are not loaded yet)
				this.getStyleElement().onload = fnLoaded;
			}
		}

		return this;
	};
	
	/*
	 * @private
	 */
	Scope.prototype._onTransitionEnd = function(oEvent) {
		this._oEventBus.publish("dom.changed");
	};
	
	/*
	 * @private
	 */
	Scope.prototype._onWindowChanged = function(oEvent) {
		this._oEventBus.publish("dom.changed");
	};
	
	/*
	 * @private
	 */
	Scope.prototype._onDragOver = function(oEvent) {
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};
	
	/*
	 * @private
	 */
	Scope.prototype._onDrop = function(oEvent) {
		// control is dropped outside the views => remove it
		oEvent.stopPropagation();
		
		// When a control is dropped out of the canvas it will be removed
		var oControl = this._oDesignTime.oWidgets.getDraggable();
		this._oEventBus.publish("control.remove", {
			"oControl" : oControl,
			"drop" : true
		});

		this._oEventBus.publish("drag.ended", {
			"oControl" : oControl
		});
	};


	Scope.prototype.fixDropArea = function() {
		return this.getDocument().body.appendChild(this.getDropArea());
	};

	Scope.prototype.getElement = function() {
		return this._oElement;
	};

	Scope.prototype.getDropAreaId = function() {
		return this.dropAreaId;
	};

	Scope.prototype.getOverlayContainer = function() {
		return this.getElement() && this.getDocument().querySelector("#overlay-container");
	};

	Scope.prototype.getDropArea = function() {
		return this.getElement() && this.getDocument().getElementById(this.getDropAreaId());
	};

	Scope.prototype.getDocument = function() {
		var oElement = this.getElement();
		var oDocument = null;
		if (oElement) {
			// First check if this is an iframe
			oDocument = oElement.contentDocument;
			if (!oDocument) {
				oDocument = oElement.ownerDocument;		
			}
		}
		return oDocument;
	};


	Scope.prototype.getWindow = function() {
		var oDocument = this.getDocument();
		var oWindow = null;
		if (oDocument) {
			oWindow = oDocument.defaultView || oDocument.parentWindow;
		}
		return oWindow;
	};

	Scope.prototype.getElementById = function(sId) {
		return this.getDocument() && this.getDocument().getElementById(sId);
	};

	Scope.prototype.getHTMLElement = function() {
		return this.getDocument().getElementsByTagName("html");
	};

	Scope.prototype.getStyleElement = function() {
		return this.getElement() && this.getDocument().querySelector("#widget-style-element");
	};


	Scope.prototype.getBodyElement = function() {
		return this.getDocument() && this.getDocument().body;
	};

	Scope.prototype.getHeadElement = function() {
		return this.getDocument() && this.getDocument().head;
	};

	Scope.prototype.getLoadedLibraries = function(sClass) {
		return this.getCore().getLoadedLibraries();
	};

	Scope.prototype.require = function(sClass) {
		return this.getWindow().jQuery.sap.require(sClass);
	};

	Scope.prototype.getCore = function() {
		return this.getWindow() && this.getWindow().sap.ui.getCore();
	};

	Scope.prototype.getControl = function(sId) {
		return this.getCore() && this.getCore().byId(sId);
	};

	Scope.prototype.registerModulePath = function(sPrefix, sUrl) {
		return this.getWindow().jQuery.sap.registerModulePath(sPrefix, sUrl);
	};

	Scope.prototype.getUIArea = function(sId) {
		sId = sId || "content";
		return this.getCore().getUIArea(sId);
	};

	Scope.prototype.getObject = function(sObject) {
		return this.getWindow().jQuery.sap.getObject(sObject);
	};

	Scope.prototype.jQuery = function(vQuery) {
		return this.getWindow().jQuery(vQuery);
	};


	// TODO: These Overlay methods should be moved away from the scope

	Scope.prototype.showOverlayContainer = function() {
		jQuery(this.getOverlayContainer()).css("display", "");
		return this;
	};

	Scope.prototype.hideOverlayContainer = function() {
		jQuery(this.getOverlayContainer()).css("display", "none");
		return this;
	};

	// TODO move all the CSS into css file
	Scope.prototype.coverUpIframe = function() {
		this.jQuery("<div id='iframe-cover'></div>").css({
			position : "absolute",
			zIndex : 2147483647,
			opacity : 0.2,
			width : "100%",
			height : "100%",
			backgroundColor : "black"
		}).appendTo("body");
	};

	Scope.prototype.revealIframe = function() {
		this.jQuery("#iframe-cover").remove();
	};

	return Scope;
}, /* bExport= */ true);