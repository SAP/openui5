/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectListItem.
sap.ui.define([
	'./ListItemBase',
	'./library',
	'sap/ui/core/IconPool',
	'sap/m/ObjectNumber',
	'sap/ui/core/library',
	'./ObjectListItemRenderer'
],
function(
	ListItemBase,
	library,
	IconPool,
	ObjectNumber,
	coreLibrary,
	ObjectListItemRenderer
	) {
		"use strict";



		// shortcut for sap.m.ObjectMarkerType
		var ObjectMarkerType = library.ObjectMarkerType;

		// shortcut for sap.m.ImageHelper
		var ImageHelper = library.ImageHelper;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;



		/**
		 * Constructor for a new ObjectListItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * ObjectListItem is a display control that provides summary information about an object as a list item. The ObjectListItem title is the key identifier of the object. Additional text and icons can be used to further distinguish it from other objects. Attributes and statuses can be used to provide additional meaning about the object to the user.
		 *
		 * <b>Note:</b> The control must only be used in the context of a list.
		 * @extends sap.m.ListItemBase
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.12
		 * @alias sap.m.ObjectListItem
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-list-item/ Object List Item}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ObjectListItem = ListItemBase.extend("sap.m.ObjectListItem", /** @lends sap.m.ObjectListItem.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Defines the ObjectListItem title.
				 */
				title : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the ObjectListItem number.
				 */
				number : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the number units qualifier of the ObjectListItem.
				 */
				numberUnit : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the introductory text for the ObjectListItem.
				 */
				intro : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * ObjectListItem icon displayed to the left of the title.
				 */
				icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

				/**
				 * Icon displayed when the ObjectListItem is active.
				 */
				activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

				/**
				 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image (in case this version of image doesn't exist on the server).
				 *
				 * If bandwidth is key for the application, set this value to false.
				 */
				iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * Sets the favorite state for the ObjectListItem.<br><br>
				 *
				 * @since 1.16.0
				 * @deprecated as of version 1.42.0, replaced by <code>markers</code> aggregation.
				 * Add {@link sap.m.ObjectMarker} with type <code>sap.m.ObjectMarkerType.Favorite</code>.
				 * You should use either this property or the <code>markers</code> aggregation, using both may lead to unpredicted behavior.
				 */
				markFavorite : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

				/**
				 * Sets the flagged state for the ObjectListItem.<br><br>
				 *
				 * @since 1.16.0
				 * @deprecated as of version 1.42.0, replaced by <code>markers</code> aggregation.
				 * Add {@link sap.m.ObjectMarker} with type <code>sap.m.ObjectMarkerType.Flagged</code>.
				 * You should use either this property or the <code>markers</code> aggregation, using both may lead to unpredicted behavior.
				 */
				markFlagged : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

				/**
				 * If set to true, the ObjectListItem can be marked with icons such as favorite and flag.<br><br>
				 *
				 * @since 1.16.0
				 * @deprecated as of version 1.42.0, replaced by <code>markers</code> aggregation.
				 * This property is valid only if you are using the already deprecated properties - <code>markFlagged</code>, <code>markFavorite</code>, and <code>markLocked</code>.
				 * If you are using the <code>markers</code> aggregation, the visibility of the markers depends on what is set in the aggregation itself.
				 */
				showMarkers : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true},

				/**
				 * Defines the ObjectListItem number and numberUnit value state.
				 * @since 1.16.0
				 */
				numberState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : ValueState.None},

				/**
				 * Determines the text direction of the item title.
				 * Available options for the title direction are LTR (left-to-right) and RTL (right-to-left).
				 * By default the item title inherits the text direction from its parent.
				 */
				titleTextDirection: {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Determines the text direction of the item intro.
				 * Available options for the intro direction are LTR (left-to-right) and RTL (right-to-left).
				 * By default the item intro inherits the text direction from its parent.
				 */
				introTextDirection: {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Determines the text direction of the item number.
				 * Available options for the number direction are LTR (left-to-right) and RTL (right-to-left).
				 * By default the item number inherits the text direction from its parent.
				 */
				numberTextDirection: {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Sets the locked state of the ObjectListItem.<br><br>
				 *
				 * @since 1.28
				 * @deprecated as of version 1.42.0, replaced by <code>markers</code> aggregation.
				 * Add {@link sap.m.ObjectMarker} with type <code>sap.m.ObjectMarkerType.Locked</code>.
				 * You should use either this property or the <code>markers</code> aggregation, using both may lead to unpredicted behavior.<br><br>
				 */
				markLocked : {type : "boolean", group : "Misc", defaultValue : false, deprecated: true}
			},
			defaultAggregation : "attributes",
			aggregations : {

				/**
				 * List of attributes displayed below the title to the left of the status fields.
				 */
				attributes : {type : "sap.m.ObjectAttribute", multiple : true, singularName : "attribute"},

				/**
				 * First status text field displayed on the right side of the attributes.
				 */
				firstStatus : {type : "sap.m.ObjectStatus", multiple : false},

				/**
				 * Second status text field displayed on the right side of the attributes.
				 */
				secondStatus : {type : "sap.m.ObjectStatus", multiple : false},

				/**
				 * List of markers (icon and/or text) that can be displayed for the <code>ObjectListItems</code>, such as favorite and flagged.<br><br>
				 * <b>Note:</b> You should use either this aggregation or the already deprecated properties - <code>markFlagged</code>, <code>markFavorite</code>, and <code>markLocked</code>. Using both can lead to unexpected results.
				 */
				markers : {type : "sap.m.ObjectMarker", multiple : true, singularName : "marker"},

				/**
				 * Internal <code>sap.m.ObjectNumber</code> control which is created based on the <code>number</code>, <code>numberUnit</code>, <code>numberState</code>, <code>numberTextDirection</code>
				 */
				_objectNumber: {type: "sap.m.ObjectNumber", multiple: false, visibility: "hidden"}
			},
			designtime: "sap/m/designtime/ObjectListItem.designtime"
		}});

		/**
		 * Initializes the control.
		 * @param oEvent
		 */
		ObjectListItem.prototype.init = function (oEvent) {
			this._generateObjectNumber();
		};

		/**
		 * @private
		 */
		ObjectListItem.prototype.exit = function(oEvent) {
			// image or icon if initialized
			if (this._oImageControl) {
				this._oImageControl.destroy();
			}

			if (this._oTitleText) {
				this._oTitleText.destroy();
				this._oTitleText = undefined;
			}

			ListItemBase.prototype.exit.apply(this);
		};

		ObjectListItem.prototype.onAfterRendering = function() {
			var oObjectNumber = this.getAggregation("_objectNumber"),
				bPageRTL = sap.ui.getCore().getConfiguration().getRTL(),
				sTextAlign = bPageRTL ? TextAlign.Left : TextAlign.Right;

			if (oObjectNumber && oObjectNumber.getNumber()) { // adjust alignment according the design specification
				oObjectNumber.setTextAlign(sTextAlign);
			}
		};

		/**
		 * Initiates the <code>sap.m.ObjectNumber</code> aggregation based on the <code>number</code>, <code>numberUnit</code>, <code>numberState</code> and <code>numberTextDirection</code> properties.
		 * @private
		 */
		ObjectListItem.prototype._generateObjectNumber = function () {
			var sNumber = this.getNumber(),
				sNumberUnit = this.getNumberUnit(),
				oState = this.getNumberState(),
				oTextDirection = this.getNumberTextDirection();

			this.setAggregation("_objectNumber", new ObjectNumber(this.getId() + "-ObjectNumber", {
				number: sNumber,
				unit: sNumberUnit,
				state: oState,
				textDirection: oTextDirection
			}), true);
		};

		/**
		 * @private
		 * @returns {boolean} If the sap.m.ObjectListItem has attributes
		 */
		ObjectListItem.prototype._hasAttributes = function() {
			var attributes = this.getAttributes();
			if (attributes.length > 0) {
				for (var i = 0; i < attributes.length; i++) {
					if (!attributes[i]._isEmpty()) {
						return true;
					}
				}
			}
			return false;
		};

		/**
		 * @private
		 * @returns {boolean} If the sap.m.ObjectListItem has status
		 */
		ObjectListItem.prototype._hasStatus = function() {
			return ((this.getFirstStatus() && !this.getFirstStatus()._isEmpty())
			|| (this.getSecondStatus() && !this.getSecondStatus()._isEmpty() ));
		};

		/**
		 * @private
		 * @returns {boolean} If the sap.m.ObjectListItem has bottom content
		 */
		ObjectListItem.prototype._hasBottomContent = function() {

			return (this._hasAttributes() || this._hasStatus() || this.getShowMarkers() || this.getMarkLocked() || this.getMarkers().length > 0);
		};

		/**
		 * @private
		 * @returns {Array} The visible attributes of the control
		 */
		ObjectListItem.prototype._getVisibleAttributes = function() {

			var aAllAttributes = this.getAttributes();
			var aVisibleAttributes = [];

			for (var i = 0; i < aAllAttributes.length; i++) {
				if (aAllAttributes[i].getVisible()) {
					aVisibleAttributes.push(aAllAttributes[i]);
				}
			}

			return aVisibleAttributes;
		};

		/**
		 * Lazy loads ObjectListItem's image.
		 * @returns {object} The image control
		 * @private
		 */
		ObjectListItem.prototype._getImageControl = function() {

			var sImgId = this.getId() + '-img';
			var sSize = "2.5rem";
			var mProperties;
			if (IconPool.isIconURI(this.getIcon())) {
				mProperties = {
					src : this.getIcon(),
					height : sSize,
					width : sSize,
					size: sSize,
					useIconTooltip : false,
					densityAware : this.getIconDensityAware()
				};
			} else {
				mProperties = {
					src : this.getIcon(),
					useIconTooltip : false,
					densityAware : this.getIconDensityAware()
				};
			}

			var aCssClasses = ['sapMObjLIcon'];

			this._oImageControl = ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties, aCssClasses);

			return this._oImageControl;
		};

		/**
		 * Overwrites base method to hook into ObjectListItem's active handling.
		 *
		 * @private
		 */
		ObjectListItem.prototype._activeHandlingInheritor = function() {
			var sActiveSrc = this.getActiveIcon();

			if (!!this._oImageControl  && !!sActiveSrc) {
				this._oImageControl.setSrc(sActiveSrc);
			}
		};

		/**
		 * Overwrites base method to hook into ObjectListItem's inactive handling.
		 *
		 * @private
		 */
		ObjectListItem.prototype._inactiveHandlingInheritor = function() {
			var sSrc = this.getIcon();
			if (!!this._oImageControl) {
				this._oImageControl.setSrc(sSrc);
			}
		};

		/*
		 * Sets the <code>number</code> property of the control.
		 * @param {string} sNumber <code>Number</code> showed in <code>ObjectListItem</code>
		 * @override
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setNumber = function (sNumber) {
			//Do not rerender the whole control ObjectListItem control
			this.setProperty('number', sNumber, true);
			//Rerender only the ObjectNumber internal private field
			this.getAggregation("_objectNumber").setNumber(sNumber);

			return this;
		};

		/*
		 * Sets the <code>numberUnit</code> property of the control.
		 * @param {string} sNumberUnit <code>NumberUnit</code> showed in <code>ObjectListItem</code>
		 * @override
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setNumberUnit = function (sNumberUnit) {
			//Do not rerender the whole control but only ObjectNumber control
			this.setProperty('numberUnit', sNumberUnit, true);
			//Rerender only the ObjectNumber internal private field
			this.getAggregation('_objectNumber').setUnit(sNumberUnit);

			return this;
		};

		/*
		 * Sets the <code>numberTextDirection</code> property of the control.
		 * @param {sap.ui.core.TextDirection} oTextDirection The text direction of the internal <code>ObjectNumber</code>
		 * @override
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setNumberTextDirection = function (oTextDirection) {
			//Do not rerender the whole control but only ObjectNumber control
			this.setProperty('numberTextDirection', oTextDirection, true);
			//Rerender only the ObjectNumber internal private field
			this.getAggregation("_objectNumber").setTextDirection(oTextDirection);

			return this;
		};

		/*
		 * Sets the <code>numberState</code> property of the control.
		 * @param {sap.ui.core.ValueState} oValueState The <code>valueState</code> of the internal <code>ObjectNumber</code>
		 * @override
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setNumberState = function (oValueState) {
			//Do not rerender the whole control but only ObjectNumber control
			this.setProperty('numberState', oValueState, true);
			//Rerender only the ObjectNumber internal private field
			this.getAggregation("_objectNumber").setState(oValueState);

			return this;
		};

		/**
		 * Sets the visibility value of the Favorite marker.
		 * @override
		 * @public
		 * @param {boolean} bMarked the new value
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setMarkFavorite = function (bMarked) {
			return this._setOldMarkers(ObjectMarkerType.Favorite, bMarked);
		};

		/**
		 * Sets the visibility value of the Flagged marker.
		 * @override
		 * @public
		 * @param {boolean} bMarked the new value
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setMarkFlagged = function (bMarked) {
			return this._setOldMarkers(ObjectMarkerType.Flagged, bMarked);
		};

		/**
		 * Sets the visibility value of the Favorite marker.
		 * @override
		 * @public
		 * @param {boolean} bMarked the new value
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setMarkLocked = function (bMarked) {
			return this._setOldMarkers(ObjectMarkerType.Locked, bMarked);
		};

		/**
		 * Sets the visibility value of the Flagged and Favorite markers.
		 * @override
		 * @public
		 * @param {boolean} bMarked the new value
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype.setShowMarkers = function (bMarked) {
			var sMarkerType;
			var aAllMarkers = this.getMarkers();

			this.setProperty("showMarkers", bMarked, false);

			for (var i = 0; i < aAllMarkers.length; i++) {
				sMarkerType = aAllMarkers[i].getType();

				if ((sMarkerType === ObjectMarkerType.Flagged && this.getMarkFlagged()) ||
					(sMarkerType === ObjectMarkerType.Favorite && this.getMarkFavorite()) ||
					(sMarkerType === ObjectMarkerType.Locked && this.getMarkLocked())) {
						aAllMarkers[i].setVisible(bMarked);
				}
			}

			return this;
		};

		/**
		 * @private
		 * @param {string} markerType the type of the marker which should be created to updated
		 * @param {boolean} bMarked the new value
		 * @returns {sap.m.ObjectListItem} this pointer for chaining
		 */
		ObjectListItem.prototype._setOldMarkers = function (markerType, bMarked) {
			var aAllMarkers = this.getMarkers();
			var bHasMarker = false;
			var oIds = {
				Flagged : "-flag",
				Favorite : "-favorite",
				Locked : "-lock"
			};

			this.setProperty("mark" + markerType, bMarked, false);

			if (!this.getShowMarkers()) {
				bMarked = false;
			}

			for (var i = 0; i < aAllMarkers.length; i++) {
				if (aAllMarkers[i].getType() === markerType) {
					bHasMarker = true;
					aAllMarkers[i].setVisible(bMarked);

					break;
				}
			}

			if (!bHasMarker) {
				this.insertAggregation("markers", new sap.m.ObjectMarker({
					id: this.getId() + oIds[markerType],
					type: markerType,
					visible: bMarked
				}));
			}

			return this;
		};


		/**
		 * @private
		 * @returns {sap.m.ObjectListItem} Title text control
		 */
		ObjectListItem.prototype._getTitleText = function() {

			if (!this._oTitleText) {
				this._oTitleText = new sap.m.Text(this.getId() + "-titleText", {
					maxLines: 2
				});

				this._oTitleText.setParent(this, null, true);
			}
			return this._oTitleText;
		};

		return ObjectListItem;
	});
