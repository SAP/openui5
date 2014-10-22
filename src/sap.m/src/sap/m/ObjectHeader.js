/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectHeader.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
	"use strict";


	
	/**
	 * Constructor for a new ObjectHeader.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectHeader is a display control that enables the user to easily identify a specific object. The object header title is the key identifier of the object and additional text and icons can be used to further distinguish it from other objects.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @name sap.m.ObjectHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectHeader = Control.extend("sap.m.ObjectHeader", /** @lends sap.m.ObjectHeader.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Object header title
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Object header number field
			 */
			number : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Object header number units qualifier.
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Introductory text for the object header.
			 */
			intro : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates that the intro is clickable
			 */
			introActive : {type : "boolean", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates that the title is clickable
			 */
			titleActive : {type : "boolean", group : "Misc", defaultValue : null},
	
			/**
			 * Object header icon
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates that the object header icon is clickable
			 */
			iconActive : {type : "boolean", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates if object header is visible. Invisible object headers are not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Set the favorite state to true or false. The showMarkers property must be true for this property to take effect.
			 * @since 1.16.0
			 */
			markFavorite : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Set the flagged state to true or false. The showMarkers property must be true for this property to take effect.
			 * @since 1.16.0
			 */
			markFlagged : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Indicates if object header supports showing markers such as flagged and favorite.
			 * @since 1.16.0
			 */
			showMarkers : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * When it is true, the selector arrow icon/image is shown and can be pressed.
			 * @since 1.16.0
			 */
			showTitleSelector : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Object header number and numberUnit value state.
			 * @since 1.16.0
			 */
			numberState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * Displays the condensed object header with title, one attribute, number and number unit.
			 */
			condensed : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * NOTE: Only applied if you set "condensed=true" or "responsive=true".
			 * This property is used to set the background color of the ObjectHeader. Possible values are "Solid", "Translucent" and "Transparent".
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : sap.m.BackgroundDesign.Transparent},
	
			/**
			 * If this property is set to true the ObjectHeader is rendered with a different design and reacts responsively to the screen sizes.
			 * Be aware that the design and behavior of the responsive ObjectHeader can change without further notification.
			 * @since 1.21.1
			 */
			responsive : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		defaultAggregation : "attributes",
		aggregations : {
	
			/**
			 * The list of Object Attributes
			 */
			attributes : {type : "sap.m.ObjectAttribute", multiple : true, singularName : "attribute"}, 
	
			/**
			 * First status shown on the right side of the attributes above the second status.
			 * If it is not set the first attribute will expand to take the entire row.
			 * @deprecated Since version 1.16.0. 
			 * Use the statuses aggregation instead.
			 */
			firstStatus : {type : "sap.m.ObjectStatus", multiple : false, deprecated: true}, 
	
			/**
			 * Second status shown on the right side of the attributes below the first status.
			 * If it is not set the second attribute will expand to take the entire row.
			 * @deprecated Since version 1.16.0. 
			 * Use the statuses aggregation instead.
			 */
			secondStatus : {type : "sap.m.ObjectStatus", multiple : false, deprecated: true}, 
	
			/**
			 * The list of Object sap.ui.core.Control. It will only allow sap.m.ObjectStatus and sap.m.ProgressIndicator controls.
			 * @since 1.16.0
			 */
			statuses : {type : "sap.ui.core.Control", multiple : true, singularName : "status"}, 
	
			/**
			 * The object number and unit are managed in this aggregation
			 */
			_objectNumber : {type : "sap.m.ObjectNumber", multiple : false, visibility : "hidden"}, 
	
			/**
			 * This aggregation takes only effect when you set "responsive" to true.
			 * This is an association for the end area of the object header. It can either be filled with an sap.m.IconTabBar or a sap.suite.ui.commons.HeaderContainer control. Overflow handling must be taken care of by the inner control. If used with an IconTabBar control, only the header will be displayed inside the object header, the content will be displayed below the ObjectHeader.
			 * @since 1.21.1
			 */
			headerContainer : {type : "sap.m.ObjectHeaderContainer", multiple : false}
		},
		events : {
	
			/**
			 * Event is fired when the title is active and the user tap/click on it
			 */
			titlePress : {
				parameters : {
	
					/**
					 * Dom reference of the object header' title to be used for positioning.
					 */
					domRef : {type : "object"}
				}
			}, 
	
			/**
			 * Event is fired when the title is active and the user tap/click on it
			 */
			introPress : {
				parameters : {
	
					/**
					 * Dom reference of the object header' intro to be used for positioning.
					 */
					domRef : {type : "object"}
				}
			}, 
	
			/**
			 * Event is fired when the title icon is active and the user tap/click on it
			 */
			iconPress : {
				parameters : {
	
					/**
					 * Dom reference of the object header' icon to be used for positioning.
					 */
					domRef : {type : "object"}
				}
			}, 
	
			/**
			 * Event is fired when the object header title selector (down-arrow) is pressed
			 * @since 1.16.0
			 */
			titleSelectorPress : {
				parameters : {
	
					/**
					 * Dom reference of the object header' titleArrow to be used for positioning.
					 */
					domRef : {type : "object"}
				}
			}
		}
	}});
	
	///**
	
	ObjectHeader.prototype.init = function() {
		var that = this;
	
		//TODO Remove placeholder when Safari iconFont issue is addressed.
		this._oPlaceholderIcon = IconPool.createControlByURI({
			id : this.getId() + "-placeholder",
			src : IconPool.getIconURI("fridge")
		});
		this._oPlaceholderIcon.addStyleClass("sapMObjStatusMarkerInvisible");
	
		this._oFlagIcon = IconPool.createControlByURI({
			id : this.getId() + "-flag",
			src : IconPool.getIconURI("flag"),
			visible : false
		});
	
		this._oFavIcon = IconPool.createControlByURI({
			id : this.getId() + "-favorite",
			src : IconPool.getIconURI("favorite"),
			visible : false
		});
	
		this._oTitleArrowIcon = IconPool.createControlByURI({
			id : this.getId() + "-titleArrow",
			src: IconPool.getIconURI("arrow-down"),
			decorative: false,
			visible : false,
			size: (this.getCondensed() ? "1.125rem" : "1.375rem"),
			press : function(oEvent) {
				that.fireTitleSelectorPress({
					domRef : this.getDomRef()
				});
			}
		});
	
		this._fNumberWidth = undefined;
		this._titleText = new sap.m.Text(this.getId() + "-titleText");
		this._titleText.setMaxLines(3);
	
	};
	
	/**
	 * Set the condensed flag
	 * @override
	 * @public
	 * @param {boolean} bCondensed the new value
	 * @returns {this} this pointer for chaining
	 */
	ObjectHeader.prototype.setCondensed = function (bCondensed) {
		this.setProperty("condensed", bCondensed);
		if (this.getCondensed()) {
			this._oTitleArrowIcon.setSize("1.125rem");
		} else {
			this._oTitleArrowIcon.setSize("1.375rem");
		}
		return this;
	};
	
	/**
	 * Set the number value to the internal aggregation
	 * @override
	 * @public
	 * @param {string} sNumber the new value
	 * @returns {this} this pointer for chaining
	 */
	ObjectHeader.prototype.setNumber = function (sNumber) {
		this.setProperty("number", sNumber);
		this._getObjectNumber().setNumber(sNumber);
		return this;
	};
	
	/**
	 * Set the number unit to the internal aggregation
	 * @override
	 * @public
	 * @param {string} sUnit the new value
	 * @returns {this} this pointer for chaining
	 */
	ObjectHeader.prototype.setNumberUnit = function (sUnit) {
		this.setProperty("numberUnit", sUnit);
		this._getObjectNumber().setNumberUnit(sUnit);
		return this;
	};
	
	/**
	 * Set the number state to the internal aggregation
	 * @override
	 * @public
	 * @param {string} sState the new value
	 * @returns {this} this pointer for chaining
	 */
	ObjectHeader.prototype.setNumberState = function (sState) {
		this.setProperty("numberState", sState,true);
		this._getObjectNumber().setState(sState);
		return this;
	};
	
	/**
	 * lazy initializes the object number aggregation
	 * @private
	 * @returns {Object} the newly created control
	 */
	ObjectHeader.prototype._getObjectNumber = function () {
		var oControl = this.getAggregation("_objectNumber");
	
		if (!oControl) {
			oControl = new sap.m.ObjectNumber(this.getId() + "-number", {
				emphasized: false
			});
			this.setAggregation("_objectNumber", oControl, true);
		}
		return oControl;
	};
	
	ObjectHeader.prototype.ontap = function(oEvent) {
		var sourceId = oEvent.target.id;
		if (this.getIntroActive() && sourceId === this.getId() + "-intro") {
			this.fireIntroPress({
				domRef : jQuery.sap.domById(sourceId)
			});
		} else if (this.getTitleActive() && oEvent.srcControl === this._titleText) {
			this.fireTitlePress({
				domRef : this._titleText.getFocusDomRef()
			});
		} else if (this.getIconActive() && (sourceId === this.getId() + "-img" || sourceId === this.getId() + "-icon")) {
			this.fireIconPress({
				domRef : jQuery.sap.domById(sourceId)
			});
		}
	};

	/**
	 * Handles space or enter key
	 *
	 * @private
	 */
	ObjectHeader.prototype._handleSpaceOrEnter = function(oEvent) {
		var sourceId = oEvent.target.id;
		if (this.getTitleActive() && sourceId === this.getId() + "-title") {
			this.fireTitlePress({
				domRef : this._titleText.getFocusDomRef()
			});
		} else if (this.getIntroActive() && sourceId === this.getId() + "-intro") {
			this.fireIntroPress({
				domRef : jQuery.sap.domById(sourceId)
			});
		} else if (this.getIconActive() && jQuery(oEvent.target).hasClass('sapMOHIcon')){
			var iconOrImg = jQuery.sap.domById(this.getId() + "-icon");
			if (!iconOrImg) {
				iconOrImg = jQuery.sap.domById(this.getId() + "-img");
			}
			this.fireIconPress({
				domRef : iconOrImg
			});
		} else if (jQuery(oEvent.target).hasClass('sapMObjectAttributeActive')) {
			var sFocusedAttr = sap.ui.getCore().byId(oEvent.target.id);
			sFocusedAttr.firePress({
				domRef : sFocusedAttr.getDomRef()
			});
		}

		oEvent.preventDefault();
	};

	/**
	 * Handles space key
	 *
	 * @private
	*/
	ObjectHeader.prototype.onsapspace = ObjectHeader.prototype._handleSpaceOrEnter;

	/**
	 * Handles enter key
	 *
	 * @private
	 */
	ObjectHeader.prototype.onsapenter = ObjectHeader.prototype._handleSpaceOrEnter;

	/**
	 * Called when the control is destroyed.
	 * 
	 * @private
	 */
	ObjectHeader.prototype.exit = function() {
	
		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	
		if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = undefined;
		}
	
		if (this._oPlaceholderIcon) {
			this._oPlaceholderIcon.destroy();
			this._oPlaceholderIcon = undefined;
		}
	
		if (this._oFavIcon) {
			this._oFavIcon.destroy();
			this._oFavIcon = undefined;
		}
	
		if (this._oFlagIcon) {
			this._oFlagIcon.destroy();
			this._oFlagIcon = undefined;
		}
		
		if (this._oTitleArrowIcon) {
			this._oTitleArrowIcon.destroy();
			this._oTitleArrowIcon = undefined;
		}
		
		if (this._titleText) {
			this._titleText.destroy();
			this._titleText = undefined;
		}
	
	};
	
	/**
	 * Lazy load object header's image.
	 * 
	 * @private
	 */
	 
	ObjectHeader.prototype._getImageControl = function() {
	
		var sImgId = this.getId() + "-img";
		var sSize = sap.ui.Device.system.phone ? "2.5rem" : "3rem";
		var sHeight = sSize;
		var sWidth = sSize;
		
		if (this.getResponsive()) {
			sSize = "2.5rem";
			sHeight = "3rem";
			sWidth = "3rem";
		}
	
		var mProperties = {
			src : this.getIcon(),
			height : sHeight,
			width : sWidth,
			size : sSize,
			densityAware : this.getIconDensityAware()
		};
	
		this._oImageControl = sap.m.ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);
	
		return this._oImageControl;
	};
	
	ObjectHeader.prototype.onBeforeRendering = function() {
		// the icontabbar content is rendered internally by the object header
		// therefore we have to remove it manually before re-rendering
		if (this.getHeaderContainer() instanceof Control && this.getHeaderContainer().$()) {
			this.getHeaderContainer().$().remove();
		}
	
		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	
	};
	
	ObjectHeader.prototype.onAfterRendering = function() {
		
		if (this.getShowTitleSelector()) {
			this._oTitleArrowIcon.$().css("cursor", "pointer");
		}
	
		if (this.$("number").length > 0) {
			this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._resizeElements, this));
			setTimeout(jQuery.proxy(this._resizeElements, this));
		}
	
	};
	
	ObjectHeader.prototype._resizeElements = function() {
	
		if (!this.getDomRef()) {
			return;
		}
	
		var id = this.getId();
		if (!this.getResponsive()) {
			var $numberDiv = jQuery.sap.byId(id + "-numberdiv");
			var bHasWrap = $numberDiv.hasClass("sapMOHNumberWrap");
		
			if (this._fNumberWidth === undefined) {
				this._fNumberWidth = $numberDiv.outerWidth();
			}
		
			var bOverflow = $numberDiv.parent().width() * 35 / 100 < this._fNumberWidth;
		
			if (bOverflow != bHasWrap) {
				$numberDiv.toggleClass("sapMOHNumberWrap");
				jQuery.sap.byId(id + "-titlediv").toggleClass("sapMOHNumberWrap");
		
				jQuery(ObjectHeader._escapeId(id) + " .sapMOHBottomRow").css("margin-top", bOverflow && sap.ui.Device.system.phone ? ".25rem" : "");
				this._titleText.setMaxLines(bOverflow ? 2 : 3).rerender();
			}
		}
	};
	
	/**
	 * @param [string]
	 *            sId control id to be escaped
	 * @returns escaped control id with "#" prefix
	 * @private
	 */
	ObjectHeader._escapeId = function(sId) {
	
		return sId ? "#" + sId.replace(/(:|\.)/g, '\\$1') : "";
	};
	
	/**
	 * @private
	 * @returns {boolean}
	 */
	ObjectHeader.prototype._hasBottomContent = function() {
	
		return (this._hasAttributes() || this._hasStatus() || this.getShowMarkers());
	};
	
	/**
	 * @private
	 * @returns {boolean}
	 */
	ObjectHeader.prototype._hasIcon = function() {
	
		return !!this.getIcon().trim();
	};
	
	/**
	 * @private
	 * @returns {boolean}
	 */
	ObjectHeader.prototype._hasAttributes = function() {
	
		var attributes = this.getAttributes();
		if (attributes && attributes.length > 0) {
			for ( var i = 0; i < attributes.length; i++) {
				if (!attributes[i]._isEmpty()) {
					return true;
				}
			}
		}
		return false;
	};
	
	/**
	 * @private
	 * @returns {boolean}
	 */
	ObjectHeader.prototype._hasStatus = function() {
	
		var bHasStatus = ((this.getFirstStatus() && !this.getFirstStatus()._isEmpty()) || (this.getSecondStatus() && !this.getSecondStatus()._isEmpty()));
	
		if (!bHasStatus && this.getStatuses() && this.getStatuses().length > 0) {
			var statuses = this.getStatuses();
			for ( var i = 0; i < statuses.length; i++) {
				if (statuses[i] instanceof sap.m.ObjectStatus && !statuses[i]._isEmpty()) {
					bHasStatus = true;
					break;
				}
				else if (statuses[i] instanceof sap.m.ProgressIndicator) {
					bHasStatus = true;
					break;
				}
			}
		}
	
		return bHasStatus;
	};
	

	return ObjectHeader;

}, /* bExport= */ true);
