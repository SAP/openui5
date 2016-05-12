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
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * ObjectHeader is a display control that enables the user to easily identify a specific object. The object header title is the key identifier of the object and additional text and icons can be used to further distinguish it from other objects.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectHeader
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
			 * Object header number units qualifier
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Introductory text for the object header
			 */
			intro : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Indicates that the intro is clickable
			 */
			introActive : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Indicates that the title is clickable and is set only if a title is provided
			 */
			titleActive : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Object header icon.
			 *
			 * <b>Note:</b> Recursive resolution of binding expressions is not supported by the framework.
			 * It works only in ObjectHeader, since it is a composite control and creates an Image control internally.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Indicates that the object header icon is clickable
			 */
			iconActive : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Object header icon alternative text that is displayed in case the Image is not available, or cannot be displayed.
			 */
			iconAlt : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 *
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Sets the favorite state to true or false. The showMarkers property must be true for this property to take effect.
			 * @since 1.16.0
			 */
			markFavorite : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Sets the flagged state to true or false. The showMarkers property must be true for this property to take effect.
			 * @since 1.16.0
			 */
			markFlagged : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Indicates if object header supports showing markers such as flagged and favorite.
			 * @since 1.16.0
			 */
			showMarkers : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * When set to true, the selector arrow icon/image is shown and can be pressed.
			 * @since 1.16.0
			 */
			showTitleSelector : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Object header number and numberUnit value state.
			 * @since 1.16.0
			 */
			numberState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},

			/**
			 * <code>ObjectHeader</code> with title, one attribute, number, and number unit.<br>
			 * <b>Note:</b> Only applied if the <code>responsive</code> property is set to <code>false</code>.
			 */
			condensed : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * This property is used to set the background color of the ObjectHeader. Possible values are "Solid", "Translucent" and "Transparent".
			 * NOTE: The different types of ObjectHeader come with different default background.
			 * - non responsive ObjectHeader: Transparent
			 * - responsive ObjectHeader: Translucent
			 * - condensed ObjectHeder: Solid
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance"},

			/**
			 * If this property is set to true the ObjectHeader is rendered with a different design and reacts responsively to the screen sizes.
			 * Be aware that the design and behavior of the responsive ObjectHeader can change without further notification.
			 * @since 1.21.1
			 */
			responsive : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Optimizes the display of the elements of the <code>ObjectHeader</code>.<br>
			 * <b>Note</b>: Only applied if the <code>responsive</code> property is set to <code>true</code>.
			 *
			 * If set to <code>false</code>, the attributes and statuses are being positioned below the Title/Number of the <code>ObjectHeader</code> in 2 or 3 columns depending on their number:
			 * <ul>
			 *                <li>On desktop, 1-4 attributes/statuses - 2 columns</li>
			 *                <li>On desktop, 5+ attributes/statuses - 3 columns</li>
			 *                <li>On tablet, always in 2 columns</li>
			 * </ul>
			 * If set to <code>true</code>, the following situations apply:
			 * <ul>
			 *                 <li>On desktop, 1-3 attributes/statuses - positioned as a third block on the right side of the Title/Number group</li>
			 *                 <li>On desktop, 4+ attributes/statuses - 4 columns below the Title/Number</li>
			 *                 <li>On tablet (portrait mode), always in 2 columns below the Title/Number</li>
			 *                 <li>On tablet (landscape mode), 1-2 attributes/statuses - 2 columns below the Title/Number</li>
			 *                 <li>On tablet (landscape mode), 3+ attributes/statuses - 3 columns below the Title/Number</li>
			 *
			 * On phone, the attributes and statuses are always positioned in 1 column below the Title/Number of the <code>ObjectHeader</code>.
			 *
			 * @since 1.28
			 */
			fullScreenOptimized : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * The title link target URI. Supports standard hyperlink behavior. If an action should be triggered, this should not be set, but instead an event handler for the "titlePress" event should be registered.
			 * @since 1.28
			 */
			titleHref : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Options are _self, _top, _blank, _parent, _search. Alternatively, a frame name can be entered.
			 * @since 1.28
			 */
			titleTarget : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * The intro link target URI. Supports standard hyperlink behavior. If an action should be triggered, this should not be set, but instead an event handler for the "introPress" event should be registered.
			 * @since 1.28
			 */
			introHref : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Options are _self, _top, _blank, _parent, _search. Alternatively, a frame name can be entered.
			 * @since 1.28
			 */
			introTarget : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * This property specifies the title text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * This property specifies the intro text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			introTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * This property specifies the number and unit directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			numberTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * Sets custom text for the tooltip of the select title arrow. If not set, a default text of the tooltip will be displayed.
			 * @since 1.30.0
			 */
			titleSelectorTooltip : {type : "string", group : "Misc", defaultValue : "Options"},

			/**
			 * Defines the semantic level of the title.
			 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
			 * Depending on this setting a HTML h1-h6 element is used.
			 */
			titleLevel : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : sap.ui.core.TitleLevel.H1}

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
			 * NOTE: Only applied if you set "responsive=false".
			 * Additional object numbers and units are managed in this aggregation.
			 * The numbers are hidden on tablet and phone size screens.
			 * When only one number is provided, it is rendered with additional separator from the main ObjectHeader number.
			 * @since 1.38.0
			 */
			additionalNumbers : {type : "sap.m.ObjectNumber", multiple : true, singularName : "additionalNumber"},

			/**
			 * This aggregation takes only effect when you set "responsive" to true.
			 * It can either be filled with an sap.m.IconTabBar or a sap.suite.ui.commons.HeaderContainer control. Overflow handling must be taken care of by the inner control. If used with an IconTabBar control, only the header will be displayed inside the object header, the content will be displayed below the ObjectHeader.
			 * @since 1.21.1
			 */
			headerContainer : {type : "sap.m.ObjectHeaderContainer", multiple : false}
		},
		associations : {

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * Event is fired when the title is active and the user taps/clicks on it
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
			 * Event is fired when the intro is active and the user taps/clicks on it
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
			 * Event is fired when the title icon is active and the user taps/clicks on it
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

	ObjectHeader.prototype.init = function() {
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"); // get resource translation bundle;

		//TODO Remove placeholder when Safari iconFont issue is addressed.
		this._oPlaceholderIcon = IconPool.createControlByURI({
			id : this.getId() + "-placeholder",
			useIconTooltip : false,
			src : IconPool.getIconURI("fridge")
		});
		this._oPlaceholderIcon.addStyleClass("sapMObjStatusMarkerInvisible");

		this._oFlagIcon = IconPool.createControlByURI({
			id : this.getId() + "-flag",
			tooltip: oLibraryResourceBundle.getText("TOOLTIP_OH_FLAG_MARK_VALUE"),
			src : IconPool.getIconURI("flag"),
			visible : false
		});

		this._oFavIcon = IconPool.createControlByURI({
			id : this.getId() + "-favorite",
			tooltip: oLibraryResourceBundle.getText("TOOLTIP_OH_FAVORITE_MARK_VALUE"),
			src : IconPool.getIconURI("favorite"),
			visible : false
		});

		this._oTitleArrowIcon = IconPool.createControlByURI({
			id : this.getId() + "-titleArrow",
			src: IconPool.getIconURI("arrow-down"),
			decorative: false,
			visible : false,
			tooltip: oLibraryResourceBundle.getText("OH_SELECT_ARROW_TOOLTIP"),
			size: "1.375rem",
			press : function(oEvent) {
				// empty function here becuase icon needs an event handler in order to show pointer cursor
			}
		});

		this._fNumberWidth = undefined;
		this._titleText = new sap.m.Text(this.getId() + "-titleText");
		this._titleText.setMaxLines(3);

	};

	ObjectHeader.prototype.insertAttribute = function (oAttribute, iIndex) {
		var vResult = this.insertAggregation("attributes", oAttribute, iIndex);
		this._registerControlListener(oAttribute);
		return vResult;
	};

	ObjectHeader.prototype.addAttribute = function (oAttribute) {
		var vResult = this.addAggregation("attributes", oAttribute);
		this._registerControlListener(oAttribute);
		return vResult;
	};

	ObjectHeader.prototype.removeAttribute = function (oAttribute) {
		var vResult = this.removeAggregation("attributes", oAttribute);
		this._deregisterControlListener(vResult);
		return vResult;
	};

	ObjectHeader.prototype.removeAllAttributes = function () {
		var aAttributes = this.removeAllAggregation("attributes");
		aAttributes.forEach(this._deregisterControlListener, this);
		return aAttributes;
	};

	ObjectHeader.prototype.destroyAttributes = function () {
		var aAttributes = this.getAggregation("attributes");
		if (aAttributes !== null) {
			aAttributes.forEach(this._deregisterControlListener, this);
		}
		return this.destroyAggregation("attributes");
	};

	ObjectHeader.prototype.insertStatus = function (oStatus, iIndex) {
		var vResult = this.insertAggregation("statuses", oStatus, iIndex);
		this._registerControlListener(oStatus);
		return vResult;
	};

	ObjectHeader.prototype.addStatus = function (oStatus) {
		var vResult = this.addAggregation("statuses", oStatus);
		this._registerControlListener(oStatus);
		return vResult;
	};

	ObjectHeader.prototype.removeStatus = function (oStatus) {
		var vResult =  this.removeAggregation("statuses", oStatus);
		this._deregisterControlListener(vResult);
		return vResult;
	};

	ObjectHeader.prototype.removeAllStatuses = function () {
		var aStatuses = this.removeAllAggregation("statuses");
		aStatuses.forEach(this._deregisterControlListener, this);
		return aStatuses;
	};

	ObjectHeader.prototype.destroyStatuses = function () {
		var aStatuses = this.getAggregation("statuses");
		if (aStatuses !== null) {
			aStatuses.forEach(this._deregisterControlListener, this);
		}
		return this.destroyAggregation("statuses");
	};

	/**
	 * Every time a control is inserted in the ObjectHeader, it must be monitored for size/visibility changes
	 * @param oControl
	 * @private
	 */
	ObjectHeader.prototype._registerControlListener = function (oControl) {
		if (oControl) {
			oControl.attachEvent("_change", this.invalidate, this);
		}
	};

	/**
	 * Each time a control is removed from the ObjectHeader, detach listeners
	 * @param oControl
	 * @private
	 */
	ObjectHeader.prototype._deregisterControlListener = function (oControl) {
		if (oControl) {
			oControl.detachEvent("_change", this.invalidate, this);
		}
	};


	/**
	 * Set the condensed flag
	 * @override
	 * @public
	 * @param {boolean} bCondensed the new value
	 * @returns {sap.m.ObjectHeader} this pointer for chaining
	 */
	ObjectHeader.prototype.setCondensed = function (bCondensed) {
		this.setProperty("condensed", bCondensed);
		if (this.getCondensed()) {
			this._oTitleArrowIcon.setSize("1rem");
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
	 * @returns {sap.m.ObjectHeader} this pointer for chaining
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
	 * @returns {sap.m.ObjectHeader} this pointer for chaining
	 */
	ObjectHeader.prototype.setNumberUnit = function (sUnit) {
		this.setProperty("numberUnit", sUnit);
		this._getObjectNumber().setUnit(sUnit);
		return this;
	};

	/**
	 * Set the number state to the internal aggregation
	 * @override
	 * @public
	 * @param {sap.ui.core.ValueState} sState the new value
	 * @returns {sap.m.ObjectHeader} this pointer for chaining
	 */
	ObjectHeader.prototype.setNumberState = function (sState) {
		this.setProperty("numberState", sState, true);
		this._getObjectNumber().setState(sState);
		return this;
	};

	/**
	 * Sets the new text for the tooltip of the select title arrow to the internal aggregation
	 * @override
	 * @public
	 * @param sTooltip the new value
	 * @returns {sap.m.ObjectHeader} this pointer for chaining
	 */
	ObjectHeader.prototype.setTitleSelectorTooltip = function (sTooltip) {
		this.setProperty("titleSelectorTooltip", sTooltip, false);
		this._oTitleArrowIcon.setTooltip(sTooltip);
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

	/**
	 * Gets the correct focus domRef.
	 * @override
	 * @returns {Object} the domRef of the ObjectHeader title
	 */
	ObjectHeader.prototype.getFocusDomRef = function() {
		if (this.getResponsive()) {
			return this.$("txt");
		} else {
			return this.$("title");
		}
	};

	ObjectHeader.prototype.ontap = function(oEvent) {
		var sSourceId = oEvent.target.id;
		if (this.getIntroActive() && sSourceId === this.getId() + "-intro") {
			if (!this.getIntroHref()) {
				this.fireIntroPress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			}
		} else if (!this.getResponsive() && this.getTitleActive() && ( sSourceId === this.getId() + "-title" ||
				jQuery(oEvent.target).parent().attr('id') === this.getId() + "-title" || // check if the parent of the "h" tag is the "title"
				sSourceId === this.getId() + "-titleText-inner" )) {
			if (!this.getTitleHref()) {
				oEvent.preventDefault();
				sSourceId = this.getId() + "-title";

				this.fireTitlePress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			}
		} else if (this.getResponsive() && this.getTitleActive() && ( sSourceId === this.getId() + "-txt" || jQuery(oEvent.target).parent().attr('id') === this.getId() + "-txt" )) {
			if (!this.getTitleHref()) {
				oEvent.preventDefault();
				// The sourceId should be always the id of the "a", even if we click on the inside span element
				sSourceId = this.getId() + "-txt";

				this.fireTitlePress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			}
		} else if (this.getIconActive() && (sSourceId === this.getId() + "-img" || sSourceId === this.getId() + "-icon")) {
			this.fireIconPress({
				domRef : jQuery.sap.domById(sSourceId)
			});
		} else if (sSourceId === this.getId() + "-titleArrow") {
			this.fireTitleSelectorPress({
				domRef : jQuery.sap.domById(sSourceId)
			});
		}
	};

	/**
	 * Handles space or enter key
	 *
	 * @private
	 */
	ObjectHeader.prototype._handleSpaceOrEnter = function(oEvent) {
		var sSourceId = oEvent.target.id;

		// mark the event that it is handled by the control
		oEvent.setMarked();

		if (!this.getResponsive() && this.getTitleActive() && ( sSourceId === this.getId() + "-title" ||
				jQuery(oEvent.target).parent().attr('id') === this.getId() + "-title" || // check if the parent of the "h" tag is the "title"
				sSourceId === this.getId() + "-titleText-inner" )) {
			if (oEvent.type === "sapspace") {
				oEvent.preventDefault();
			}
			sSourceId = this.getId() + "-title";

			if (!this.getTitleHref()) {
				oEvent.preventDefault();
				this.fireTitlePress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			} else {
				if (oEvent.type === "sapspace") {
					this._linkClick(oEvent, sSourceId);
				}
			}
		} else if (this.getResponsive() && this.getTitleActive() && ( sSourceId === this.getId() + "-txt" || jQuery(oEvent.target).parent().attr('id') === this.getId() + "-txt" )) {
			if (oEvent.type === "sapspace") {
				oEvent.preventDefault();
			}
			// The sourceId should be always the id of the "a", even if we click on the inside span element
			sSourceId = this.getId() + "-txt";

			if (!this.getTitleHref()) {
				oEvent.preventDefault();
				this.fireTitlePress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			} else {
				if (oEvent.type === "sapspace") {
					this._linkClick(oEvent, sSourceId);
				}
			}
		} else if (this.getIntroActive() && sSourceId === this.getId() + "-intro") {
			if (oEvent.type === "sapspace") {
				oEvent.preventDefault();
			}
			if (!this.getIntroHref()) {
				this.fireIntroPress({
					domRef : jQuery.sap.domById(sSourceId)
				});
			}
		} else if (this.getIconActive() && jQuery(oEvent.target).hasClass('sapMOHIcon')){
			if (oEvent.type === "sapspace") {
				oEvent.preventDefault();
			}

			var iconOrImg = jQuery.sap.domById(this.getId() + "-icon");
			if (!iconOrImg) {
				iconOrImg = jQuery.sap.domById(this.getId() + "-img");
			}

			this.fireIconPress({
				domRef : iconOrImg
			});
		} else if (sSourceId === this.getId() + "-titleArrow") {
			if (oEvent.type === "sapspace") {
				oEvent.preventDefault();
			}
			this.fireTitleSelectorPress({
				domRef : jQuery.sap.domById(sSourceId)
			});
		}
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
	 * Handle link behaviour of the link and title when are active
	 *
	 * @private
	 */
	ObjectHeader.prototype._linkClick = function(oEvent, sSourceId) {
		// mark the event for components that needs to know if the event was handled
		oEvent.setMarked();

		// When there is the normal browser link, the browser does the job. According to the keyboard specification, Space should do the same as Enter or Click.
		// To make the browser REALLY do the same (history, referrer, frames, target,...), create a new "click" event and let the browser "do the needful".
		var oClickEvent = document.createEvent('MouseEvents');
		oClickEvent.initEvent('click', false, true); //event type, non-bubbling, cancelable
		jQuery.sap.domById(sSourceId).dispatchEvent(oClickEvent);
	};

	/**
	 * The title or states are rendered in a different way depending of the device
	 * when the orientation is changed
	 *
	 * @private
	 */
	ObjectHeader.prototype._onOrientationChange = function() {
		var sId = this.getId();

		if (sap.ui.Device.system.tablet && this.getFullScreenOptimized() && (this._hasAttributes() || this._hasStatus())){
			this._rerenderStates();
		}

		if (sap.ui.Device.system.phone) {

			if (sap.ui.Device.orientation.portrait){

				if (this.getTitle().length > 50) { // if on phone portrait mode, cut the title to 50 characters
					this._rerenderTitle(50);
				}

				if (this.getIcon()){
					jQuery.sap.byId(sId + "-titlediv").removeClass("sapMOHRTitleIcon");
					jQuery.sap.byId(sId + "-titleIcon").addClass("sapMOHRHideIcon");
				}
			} else {
				if (sap.ui.Device.orientation.landscape) {

					if (this.getTitle().length > 80) { // if on phone landscape mode, cut the title to 80 characters
						this._rerenderTitle(80);
					}
					if (this.getIcon()){
						jQuery.sap.byId(sId + "-titlediv").addClass("sapMOHRTitleIcon");
						jQuery.sap.byId(sId + "-titleIcon").removeClass("sapMOHRHideIcon");
					}
				}
			}
			this._adjustNumberDiv();
		}
		this._adjustIntroDiv();
	};

	/**
	 * Called on orientation change to rerender the title.
	 * nCutLen - the number of the characters to which the title should be cut
	 * according to the design specification (80 or 50 chars)
	 *
	 * @private
	 */
	ObjectHeader.prototype._rerenderTitle = function(nCutLen) {
		var oRm = sap.ui.getCore().createRenderManager();
		this.getRenderer()._rerenderTitle(oRm, this, nCutLen);
		oRm.destroy();
	};

	/**
	 * Called on orientation changed to rerender states.
	 *
	 * @private
	 */
	ObjectHeader.prototype._rerenderStates = function() {
		var oRm = sap.ui.getCore().createRenderManager();
		this.getRenderer()._rerenderResponsiveStates(oRm, this);
		oRm.destroy();
	};

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	ObjectHeader.prototype.exit = function() {
		if (sap.ui.Device.system.desktop) {
			sap.ui.Device.media.detachHandler(this._rerenderOHR, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
		}

		if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
			sap.ui.Device.orientation.detachHandler(this._onOrientationChange, this);
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

		if (this._introText) {
			this._introText.destroy();
			this._introText = undefined;
		}
	};

	/**
	 * Lazy load object header's image.
	 *
	 * @private
	 */
	ObjectHeader.prototype._getImageControl = function() {
		var sImgId = this.getId() + "-img";
		var sSize = "2.5rem";

		var mProperties = jQuery.extend(
			{
				src : this.getIcon(),
				alt: this.getIconAlt(),
				useIconTooltip : false,
				densityAware : this.getIconDensityAware()
			},
				IconPool.isIconURI(this.getIcon()) ? { size : sSize } : {}
		);

		this._oImageControl = sap.m.ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);

		return this._oImageControl;
	};

	ObjectHeader.prototype.onBeforeRendering = function() {
		if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
			sap.ui.Device.orientation.detachHandler(this._onOrientationChange, this);
		}
		if (sap.ui.Device.system.desktop) {
			sap.ui.Device.media.detachHandler(this._rerenderOHR, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
		}

		if (this._introText) {
			this._introText.destroy();
			this._introText = undefined;
		}
	};

	ObjectHeader.prototype.onAfterRendering = function() {
		var oObjectNumber = this.getAggregation("_objectNumber");
		var bPageRTL = sap.ui.getCore().getConfiguration().getRTL();
		var $titleArrow = this.$("titleArrow");

		$titleArrow.attr("role", "button");

		if (this.getResponsive()) {
			this._adjustIntroDiv();

			if (oObjectNumber && oObjectNumber.getNumber()) {// adjust alignment according the design specification
				if (sap.ui.Device.system.desktop && jQuery('html').hasClass("sapUiMedia-Std-Desktop") && this.getFullScreenOptimized() && this._iCountVisAttrStat >= 1 && this._iCountVisAttrStat <= 3) {
					oObjectNumber.setTextAlign(bPageRTL ? sap.ui.core.TextAlign.Right : sap.ui.core.TextAlign.Left);
				} else {
					oObjectNumber.setTextAlign(bPageRTL ? sap.ui.core.TextAlign.Left : sap.ui.core.TextAlign.Right);
				}
			}
			// adjust number div after initial alignment
			this._adjustNumberDiv();

			// watch for orientation change only on tablet and phone
			if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
				sap.ui.Device.orientation.attachHandler(this._onOrientationChange, this);
			}

			// When size of the browser window is changed and sap ui media query is changed rerender Responsive OH
			if (sap.ui.Device.system.desktop) {
				sap.ui.Device.media.attachHandler(this._rerenderOHR, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
			}
		} else {
			var sTextAlign = bPageRTL ? sap.ui.core.TextAlign.Left : sap.ui.core.TextAlign.Right;
			if (oObjectNumber && oObjectNumber.getNumber()) { // adjust alignment according the design specification
				oObjectNumber.setTextAlign(sTextAlign);
			}
			if (this.getAdditionalNumbers()) { // do the same for the additional numbers
				this._setTextAlignANum(sTextAlign);
			}
		}
	};

	/**
	 * Called on device media changed to rerender the OHR accordingly.
	 *
	 * @private
	 */
	ObjectHeader.prototype._rerenderOHR = function() {
		this.invalidate();
	};

	/**
	 * Adjust Number div depending on it's size
	 *
	 * @private
	 */
	ObjectHeader.prototype._adjustNumberDiv = function() {
		var sId = this.getId();
		var oObjectNumber = this.getAggregation("_objectNumber");
		var bPageRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (oObjectNumber && oObjectNumber.getNumber()) {
			var $numberDiv = jQuery.sap.byId(sId + "-number");
			var $titleDiv = jQuery.sap.byId(sId + "-titlediv");

			if (sap.ui.Device.system.phone || (sap.ui.Device.system.desktop && jQuery('html').hasClass("sapUiMedia-Std-Phone"))) {
				if ($numberDiv.hasClass("sapMObjectNumberBelowTitle")) {
					// change alignment to fit the design depending
					oObjectNumber.setTextAlign(bPageRTL ? sap.ui.core.TextAlign.Left : sap.ui.core.TextAlign.Right);
					$numberDiv.removeClass("sapMObjectNumberBelowTitle");
					$titleDiv.removeClass("sapMOHRTitleDivFull");
				}

				var nParentWidth40 = $numberDiv.parent().width() * 0.4; //calculate 40% number div in pixels

				if ($numberDiv.outerWidth() > nParentWidth40) {
					// change alignment to fit the design
					oObjectNumber.setTextAlign(bPageRTL ? sap.ui.core.TextAlign.Right : sap.ui.core.TextAlign.Left);
					$numberDiv.addClass("sapMObjectNumberBelowTitle");
					$titleDiv.addClass("sapMOHRTitleDivFull");
				}
			}
		}
	};

	/**
	 * Adjust margin of the Intro div depending on size of the title and title arrow
	 *
	 * @private
	 */
	ObjectHeader.prototype._adjustIntroDiv = function() {
		var sId = this.getId();
		var $titleTxt = jQuery.sap.byId(sId + "-txt");
		var $titleArrow = jQuery.sap.byId(sId + "-titleArrow");
		var $intro = jQuery.sap.byId(sId + "-intro");

		if ($intro.parent().hasClass("sapMOHRIntroMargin")) {
			$intro.parent().removeClass("sapMOHRIntroMargin");
		}

		if ($titleArrow.height() !== null && ($titleTxt.height() < $titleArrow.height())) {
			$intro.parent().addClass("sapMOHRIntroMargin");
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
				} else if (statuses[i] instanceof sap.m.ProgressIndicator) {
					bHasStatus = true;
					break;
				}
			}
		}
		return bHasStatus;
	};

	/**
	 * Returns the default background design for the different types of the ObjectHeader
	 * @private
	 * @returns {sap.m.BackgroundDesign}
	 */
	ObjectHeader.prototype._getDefaultBackgroundDesign = function() {
		if (this.getCondensed()) {
			return sap.m.BackgroundDesign.Solid;
		} else {
			if (this.getResponsive()) {
				return sap.m.BackgroundDesign.Translucent;
			} else { // old none responsive OH
				return sap.m.BackgroundDesign.Transparent;
			}
		}

	};


	/**
	 * Returns either the default background or the one that is set by the user
	 *
	 * @private
	 */
	ObjectHeader.prototype._getBackground = function() {

		if (this.getBackgroundDesign() === undefined) {
			return this._getDefaultBackgroundDesign();
		} else {
			return this.getBackgroundDesign();
		}

	};

	/**
	 * Sets the text alignment for all additional numbers inside the AdditionalNumbers aggregation
	 *
	 * @private
	 */
	ObjectHeader.prototype._setTextAlignANum = function(sTextAlign) {
		var numbers = this.getAdditionalNumbers();
		for (var i = 0; i < numbers.length; i++) {
			numbers[i].setTextAlign(sTextAlign);
		}
	};

	return ObjectHeader;

}, /* bExport= */ true);
