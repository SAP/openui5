/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectListItem.
sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/base/ManagedObjectObserver',
	'./ListItemBase',
	'sap/ui/core/IconPool',
	'sap/m/ObjectNumber',
	'sap/ui/core/library',
	'./Text',
	'./ObjectListItemRenderer',
	"sap/m/ImageHelper"
],
function(
	Localization,
	ManagedObjectObserver,
	ListItemBase,
	IconPool,
	ObjectNumber,
	coreLibrary,
	Text,
	ObjectListItemRenderer,
	ImageHelper
) {
	"use strict";



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
	 */
	var ObjectListItem = ListItemBase.extend("sap.m.ObjectListItem", /** @lends sap.m.ObjectListItem.prototype */ {
		metadata : {

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
				numberTextDirection: {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
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
			designtime: "sap/m/designtime/ObjectListItem.designtime",
			dnd: { draggable: true, droppable: true }
		},

		renderer: ObjectListItemRenderer
	});

	/**
	 * Initializes the control.
	 * @param oEvent
	 */
	ObjectListItem.prototype.init = function (oEvent) {
		this._generateObjectNumber();

		this._observerObjectItemChanges = this._observerObjectItemChanges.bind(this);
		this._oItemsObservers = {};
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
			bPageRTL = Localization.getRTL(),
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
		return (this._hasAttributes() || this._hasStatus() || this._getVisibleMarkers().length > 0);
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

	ObjectListItem.prototype.addAttribute = function(oObject) {
		this._startObservingItem(oObject);

		return ListItemBase.prototype.addAggregation.call(this, "attributes", oObject);
	};

	ObjectListItem.prototype.insertAttribute = function(oObject, iIndex) {
		this._startObservingItem(oObject);

		return ListItemBase.prototype.insertAggregation.call(this, "attributes", oObject, iIndex);
	};

	ObjectListItem.prototype.removeAttribute = function(vObject) {
		var oObject = ListItemBase.prototype.removeAggregation.call(this, "attributes", vObject);

		this._stopObservingItem(oObject);

		return oObject;
	};

	ObjectListItem.prototype.removeAllAttributes = function() {
		var aItems = ListItemBase.prototype.removeAllAggregation.call(this, "attributes");

		for (var i = 0; i < aItems.length; i++) {
			this._stopObservingItem(aItems[i]);
		}

		return aItems;
	};

	ObjectListItem.prototype.destroyAttributes = function() {
		this.getAttributes().forEach(function (oAttribute) {
			this._stopObservingItem(oAttribute);
		}, this);

		return ListItemBase.prototype.destroyAggregation.call(this, "attributes");
	};

	/**
	 * @private
	 * @returns {Array} The visible markers of the control
	 */
	ObjectListItem.prototype._getVisibleMarkers = function() {

		var aAllMarkers = this.getMarkers();
		var aVisibleMarkers = [];

		for (var i = 0; i < aAllMarkers.length; i++) {
			if (aAllMarkers[i].getVisible()) {
				aVisibleMarkers.push(aAllMarkers[i]);
			}
		}

		return aVisibleMarkers;
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

		if (this._oImageControl && sActiveSrc) {
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
		if (this._oImageControl) {
			this._oImageControl.setSrc(sSrc);
		}
	};

	/*
	 * Sets the <code>number</code> property of the control.
	 * @param {string} sNumber <code>Number</code> showed in <code>ObjectListItem</code>
	 * @override
	 * @returns {this} this pointer for chaining
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
	 * @returns {this} this pointer for chaining
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
	 * @returns {this} this pointer for chaining
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
	 * @returns {this} this pointer for chaining
	 */
	ObjectListItem.prototype.setNumberState = function (oValueState) {
		//Do not rerender the whole control but only ObjectNumber control
		this.setProperty('numberState', oValueState, true);
		//Rerender only the ObjectNumber internal private field
		this.getAggregation("_objectNumber").setState(oValueState);

		return this;
	};

	ObjectListItem.prototype.addMarker = function(oObject) {
		this._startObservingItem(oObject);

		return ListItemBase.prototype.addAggregation.call(this, "markers", oObject);
	};

	ObjectListItem.prototype.insertMarker = function(oObject, iIndex) {
		this._startObservingItem(oObject);

		return ListItemBase.prototype.insertAggregation.call(this, "markers", oObject, iIndex);
	};

	ObjectListItem.prototype.removeMarker = function(vObject) {
		var oObject = ListItemBase.prototype.removeAggregation.call(this, "markers", vObject);

		this._stopObservingItem(oObject);

		return oObject;
	};

	ObjectListItem.prototype.removeAllMarkers = function() {
		var aItems = ListItemBase.prototype.removeAllAggregation.call(this, "markers");

		for (var i = 0; i < aItems.length; i++) {
			this._stopObservingItem(aItems[i]);
		}

		return aItems;
	};

	ObjectListItem.prototype.destroyMarkers = function() {
		this.getMarkers().forEach(function (oMarker) {
			this._stopObservingItem(oMarker);
		}, this);

		return ListItemBase.prototype.destroyAggregation.call(this, "markers");
	};

	/**
	 * @override
	 */
	ObjectListItem.prototype.getContentAnnouncement = function() {
	};

	ObjectListItem.prototype._observerObjectItemChanges = function (oChanges) {
		if (oChanges.current !== oChanges.old) {
			this.invalidate();
		}
	};

	ObjectListItem.prototype._startObservingItem = function (oItem) {
		var oObserver = new ManagedObjectObserver(this._observerObjectItemChanges);
		this._oItemsObservers[oItem.getId()] = oObserver;

		oObserver.observe(oItem, { properties: true });

		return this;
	};

	ObjectListItem.prototype._stopObservingItem = function (oItem) {
		var sItemId = oItem.getId();

		this._oItemsObservers[sItemId].disconnect();
		delete this._oItemsObservers[sItemId];

		return this;
	};

	/**
	 * @private
	 * @returns {sap.m.Text} Title text control
	 */
	ObjectListItem.prototype._getTitleText = function() {

		if (!this._oTitleText) {
			this._oTitleText = new Text(this.getId() + "-titleText", {
				maxLines: 2
			});

			this._oTitleText.setParent(this, null, true);
		}
		return this._oTitleText;
	};

	return ObjectListItem;
});
