/*!
 * ${copyright}
 */

// Provides control sap.m.StandardListItem.
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/IconPool",
	"./library",
	"./ListItemBase",
	"./Image",
	"./StandardListItemRenderer"
],
	function(coreLibrary, IconPool, library, ListItemBase, Image, StandardListItemRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * Constructor for a new StandardListItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.StandardListItem</code> is a list item providing the most common use cases, e.g. image, title and description.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.StandardListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StandardListItem = ListItemBase.extend("sap.m.StandardListItem", /** @lends sap.m.StandardListItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the title of the list item.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the additional information for the title.
			 * <b>Note:</b> This is only visible when the <code>title</code> property is not empty.
			 */
			description : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the list item icon.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Defines the indentation of the icon. If set to <code>false</code>, the icon will not be shown as embedded. Instead it will take the full height of the list item.
			 */
			iconInset : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * By default, one or more requests are sent to get the density perfect version of the icon if the given version of the icon doesn't exist on the server.
			 * <b>Note:</b> If bandwidth is a key factor for the application, set this value to <code>false</code>.
			 */
			iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Defines the icon that is shown while the list item is pressed.
			 */
			activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Defines an additional information text.
			 */
			info : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the state of the information text, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
			 */
			infoState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : ValueState.None},

			/**
			 * By default, the title size adapts to the available space and gets bigger if the description is empty. If you have list items with and without descriptions, this results in titles with different sizes. In this case, it can be better to switch the size adaption off by setting this property to <code>false</code>.
			 * @since 1.16.3
			 */
			adaptTitleSize : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Defines the <code>title</code> text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Defines the <code>info</code> directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			infoTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
		},
		designtime: "sap/m/designtime/StandardListItem.designtime"
	}});

	StandardListItem.prototype.exit = function() {
		if (this._oImage) {
			this._oImage.destroy("KeepDom");
		}

		ListItemBase.prototype.exit.apply(this, arguments);
	};

	StandardListItem.prototype.setIcon = function(sIcon) {
		var sOldIcon = this.getIcon();
		this.setProperty("icon", sIcon);

		// destroy the internal control if it is changed from Icon to Image or Image to Icon
		if (this._oImage && (!sIcon || IconPool.isIconURI(sIcon) != IconPool.isIconURI(sOldIcon))) {
			this._oImage.destroy("KeepDom");
			this._oImage = undefined;
		}

		return this;
	};

	/**
	 * @private
	 */
	StandardListItem.prototype._getImage = function() {
		var oImage = this._oImage;

		if (oImage) {
			oImage.setSrc(this.getIcon());
			if (oImage.setDensityAware) {
				oImage.setDensityAware(this.getIconDensityAware());
			}
		} else {
			oImage = IconPool.createControlByURI({
				id: this.getId() + "-img",
				src: this.getIcon(),
				densityAware: this.getIconDensityAware(),
				useIconTooltip: false
			}, Image).setParent(this, null, true);
		}

		var sImgStyle = this.getIconInset() ? "sapMSLIImg" : "sapMSLIImgThumb";
		oImage.addStyleClass(oImage instanceof Image ? sImgStyle : sImgStyle + "Icon", true);

		this._oImage = oImage;
		return this._oImage;
	};

	// overwrite base method to hook into the active handling
	StandardListItem.prototype._activeHandlingInheritor = function() {
		if (this._oImage) {
			var sActiveIcon = this.getActiveIcon();
			sActiveIcon && this._oImage.setSrc(sActiveIcon);
		}
	};

	// overwrite base method to hook into the inactive handling
	StandardListItem.prototype._inactiveHandlingInheritor = function() {
		if (this._oImage) {
			this._oImage.setSrc(this.getIcon());
		}
	};

	StandardListItem.prototype.getContentAnnouncement = function(oBundle) {
		var sAnnouncement = "",
			sInfoState = this.getInfoState(),
			oIconInfo = IconPool.getIconInfo(this.getIcon()) || {};

		sAnnouncement += (oIconInfo.text || oIconInfo.name || "") + " ";
		sAnnouncement += this.getTitle() + " " + this.getDescription() + " " + this.getInfo() + " ";

		if (sInfoState != "None" && sInfoState != this.getHighlight()) {
			sAnnouncement += oBundle.getText("LIST_ITEM_STATE_" + sInfoState.toUpperCase());
		}

		return sAnnouncement;
	};

	return StandardListItem;

});
