/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.IndexLayout.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/core/Control', 'sap/ui/core/IntervalTrigger', './library'],
	function(jQuery, Device, Control, IntervalTrigger, library) {
	"use strict";


	
	/**
	 * Constructor for a new IndexLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Layout which renders content items with equal width and height. The items are arranged in rows.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.17.0
	 * @experimental Since version 1.17.0. 
	 * API is not yet finished and might change completely
	 * @name sap.ui.demokit.IndexLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IndexLayout = Control.extend("sap.ui.demokit.IndexLayout", /** @lends sap.ui.demokit.IndexLayout.prototype */ { metadata : {
	
		library : "sap.ui.demokit",
		properties : {
	
			/**
			 * The width of a content item. Only px values are allowed.
			 */
			itemWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '200px'},
	
			/**
			 * The height of a content item. Only px values are allowed.
			 */
			itemHeight : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '200px'},
	
			/**
			 * Whether the given item width/height should be scaled according to the screen size.
			 */
			enableScaling : {type : "boolean", group : "Appearance", defaultValue : true}
		},
		defaultAggregation : "content",
		aggregations : {
	
			/**
			 * The content items
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	}});
	
	
	IndexLayout._MINMARGIN = 18;
	IndexLayout._DEFAULT_ITEM_HEIGHT = 200;
	IndexLayout._DEFAULT_ITEM_WIDTH = 200;
	IndexLayout._pos = null;
	
	(function(){
		
	IndexLayout._IntervalTrigger = new IntervalTrigger(300);
	
	IndexLayout.prototype.init = function(){
		this._itemWidth = IndexLayout._DEFAULT_ITEM_WIDTH;
		this._itemHeight = IndexLayout._DEFAULT_ITEM_HEIGHT;
		this._tilesPerRow;
		this._width;
		this._registered = false;
		this._itemScaleFactor = 1;
		Device.media.attachHandler(setScaleFactor, this, Device.media.RANGESETS.SAP_STANDARD);
	};
	
	
	IndexLayout.prototype.exit = function(){
		this.onBeforeRendering();
		Device.media.detachHandler(setScaleFactor, this, Device.media.RANGESETS.SAP_STANDARD);
	};
	
	
	IndexLayout.prototype.setItemWidth = function(sItemWidth){
		this.setProperty("itemWidth", sItemWidth, true);
		if (!sItemWidth || sItemWidth.indexOf("px") < 0) {
			this._itemWidth = IndexLayout._DEFAULT_ITEM_WIDTH;
			this.setProperty("itemWidth", this._itemWidth, true);
		} else {
			this._itemWidth = parseInt(sItemWidth, 10);
		}
		_refresh(this);
		return this;
	};
	
	
	IndexLayout.prototype.setItemHeight = function(sItemHeight){
		this.setProperty("itemHeight", sItemHeight, true);
		if (!sItemHeight || sItemHeight.indexOf("px") < 0) {
			this._itemHeight = IndexLayout._DEFAULT_ITEM_HEIGHT;
			this.setProperty("itemHeight", this._itemHeight, true);
		} else {
			this._itemHeight = parseInt(sItemHeight, 10);
		}
		_refresh(this);
		return this;
	};
	
	
	IndexLayout.prototype.setEnableScaling = function(bEnableScaling){
		this.setProperty("enableScaling", bEnableScaling, true);
		_refresh(this);
		return this;
	};
	
	
	IndexLayout.prototype.onBeforeRendering = function(){
		if (this._registered) {
			IndexLayout._IntervalTrigger.removeListener(refresh, this);
			this._registered = false;
		}
		
		var mMediaParams = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD);
		setScaleFactor.apply(this, [mMediaParams, true]);
	};
	
	IndexLayout.prototype.onThemeChanged = function(){
		if (this.getDomRef()) {
			this.invalidate();
		}
	};
	
	IndexLayout.prototype.onAfterRendering = function(){
		if (!IndexLayout._pos) {
			var transform = null;
			var oStyle = this.getDomRef().style;
			if ("webkitTransform" in oStyle) {
				  transform = "-webkit-transform";
			} else if ("transform" in oStyle) {
				  transform = "transform";
			} else if ("msTransform" in oStyle) {
				  transform = "-ms-transform";
			} else if ("MozTransform" in oStyle) {
				  transform = "-moz-transform";
			}
			if (transform) {
				IndexLayout._pos = function($ref, x, y){
					$ref.css(transform, "translate(" + x + "px," + y + "px)");
				};
			} else {
				IndexLayout._pos = function($ref, x, y){
					$ref.css({top: y + "px", left: x + "px"});
				};
			}
		}
		
		if (!this._registered) {
			IndexLayout._IntervalTrigger.addListener(refresh, this);
			this._registered = true;
		}
		this.$().toggleClass("sapDkIdxLayoutHidden", false);
	};
	
	
	IndexLayout.prototype._scale = function(iVal){
		if (!this.getEnableScaling()) {
			return iVal;
		}
		return Math.floor(iVal * this._itemScaleFactor);
	};
	
	
	function _refresh(oLyt, bNoForce){
		refresh.apply(oLyt, [!bNoForce]);
	}
	
	
	function refresh(bInitial){
		if (!this.getDomRef()) {
			this.onBeforeRendering();
			return;
		}
		
		bInitial = bInitial || !this._registered;
		
		var $Layout = this.$(),
			w = $Layout.outerWidth(),
			h = $Layout.outerHeight(),
			heightChanged = this._height != h;
		
		if (this._width === w && !heightChanged && !bInitial) {
			return;
		}
		
		this._width = w;
		this._height = h;
	
		var itemCount = this.getContent().length,
			itemWidth = this._scale(this._itemWidth),
			itemHeight = this._scale(this._itemHeight),
			t = getOptimalTilesPerRow(this._width, itemCount, itemWidth),
			//leftpad = Math.max(sap.ui.demokit.IndexLayout._MINMARGIN, Math.floor((this._width - t*itemWidth)/2)),
			tilesPerRowChanged = this._tilesPerRow != t;
		
		this._tilesPerRow = t;
		
		if (!bInitial) {
			$Layout.toggleClass("sapDkIdxLayoutAnim", true);
		}
		
		//$Layout.css("padding-left", leftpad+"px");
		
		if (!tilesPerRowChanged && !bInitial && !heightChanged) {
			return;
		}
		
		var top = 0,
			left = 0;
			  
		this.$("cntnt").css({
			"padding-left": IndexLayout._MINMARGIN + "px",
			"width": (t * itemWidth + IndexLayout._MINMARGIN * 2) + "px",
			"height": Math.ceil(itemCount / t) * itemHeight
		}).children().each(function(index){
			if (index > 0 && index % t === 0) {
				top = top + itemHeight;
				left = 0;
			}
			IndexLayout._pos(jQuery(this), left, top);
			left = left + itemWidth;
		});
		
		if (bInitial) {
			$Layout.css({
				"padding-top": IndexLayout._MINMARGIN + "px",
				"padding-bottom": IndexLayout._MINMARGIN + "px"
			});
		}
	}
	
	
	function getOptimalTilesPerRow(width, itemCount, itemWidth){
		var t = Math.min(Math.floor((width - 2 * IndexLayout._MINMARGIN) / itemWidth), itemCount);
		var mod = itemCount % t;
		if (mod == 0 || itemCount <= t) {
			return t;
		}
	  
		function weight(x){
			var n = itemCount % x;
			return (t - x) * Math.floor(itemCount / x) + (n != 0 ? (t - n) : 0);
		}
	  
		var best = weight(t);
		var canditates = [t];
	  
		for (var i = t - 1; i >= 1; i--) {
			var w = weight(i);
			if (w < best) {
				canditates = [i];
				best = w;
			} else if (w == best) {
				canditates.push(i);
			}
		}
	
		for (var i = 0; i < canditates.length; i++) {
			var m = itemCount % canditates[i];
			if (m == 0) {
				return canditates[i];
			} else if (i == 0 || m > best) {
				best = m;
				t = canditates[i];
			}
		}
	  
		return t;
	}
	
	function setScaleFactor(mMediaParams, bSkipUpdate){
		switch (mMediaParams.name) {
			case "Tablet":
				this._itemScaleFactor = 0.75;
				break;
			case "Phone":
				this._itemScaleFactor = 0.5;
				break;
			default:
				this._itemScaleFactor = 1;
		}
		
		if (!this.getDomRef() || bSkipUpdate) {
			return;
		}
		
		var width = this._scale(this._itemWidth);
		var height = this._scale(this._itemHeight);
		
		this.$("cntnt").children().each(function(){
			jQuery(this).css({width: width, height: height});
		});
		
		_refresh(this);
	}
	
	
	//**********************************************
	
	Control.extend("sap.ui.demokit.IndexLayout._Tile", {
		
		metadata : {
			properties : {
				"title" : "string",
				"description" : "string",
				"target" : "string",
				"icon": "sap.ui.core.URI",
				"href": "sap.ui.core.URI"
			},
			events : {
				"press": {}
			}
		},
		
		onclick : function() {
			if (!this.getHref()) {
				this.firePress();
			}
		},
		
		renderer: function(oRm, oControl) {
			oRm.write("<a");
			oRm.addClass("sapDkIdxLayout_Tile");
			oRm.writeClasses();
			oRm.writeControlData(oControl);
			if (oControl.getHref()) {
				oRm.writeAttributeEscaped("href", oControl.getHref());
				if (oControl.getTarget()) {
					oRm.writeAttributeEscaped("target", oControl.getTarget());
				}
			}	else {
				/* eslint-disable no-script-url */
				oRm.writeAttribute("href", "javascript:void(0);");
				/* eslint-enable no-script-url */
			}
			oRm.writeAttributeEscaped("title", oControl.getDescription());
			oRm.write(">");
			
			oRm.write("<span class='sapDkIdxLayout_TileIcon'>");
			oRm.writeIcon(oControl.getIcon());
			oRm.write("</span>");
	
			oRm.write("<span class='sapDkIdxLayout_TileLabel'");
			oRm.writeAttributeEscaped("title", oControl.getTitle());
			oRm.write(">");
			oRm.writeEscaped(oControl.getTitle());
			oRm.write("</span>");
			
			oRm.write("<span class='sapDkIdxLayout_TileDesc'");
			oRm.writeAttributeEscaped("title", oControl.getDescription());
			oRm.write(">");
			oRm.writeEscaped(oControl.getDescription());
			oRm.write("</span>");
			
			oRm.write("</a>");
		}
	});
	
	})();
	

	return IndexLayout;

}, /* bExport= */ true);
