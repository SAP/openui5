/*!
 * ${copyright}
 */

// Provides control sap.m.StandardListItem.
sap.ui.define(['jquery.sap.global', './ListItemBase', './library', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool'],
	function(jQuery, ListItemBase, library, EnabledPropagator, IconPool) {
	"use strict";


	
	/**
	 * Constructor for a new StandardListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The StandardListItem is a list item providing image, titel and description.
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
			 * List item text
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Description gets only visible when the title property is not empty.
			 */
			description : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * List item icon
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * If false image will not be shown as embedded icon. Instead it will take the full height of the listitem.
			 */
			iconInset : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * List item active icon
			 */
			activeIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
	
			/**
			 * Info text shown on the right side of the description.
			 */
			info : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Info state defines the color of the info text. E.g. Error, Warning, Success...
			 */
			infoState : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * By default the title size adapts to the available space and gets bigger if the description is empty. If you have list items with and without description this results in titles with different sizes. In this cases it can be better to switch the size adaption off with setting this property to "false".
			 * @since 1.16.3
			 */
			adaptTitleSize : {type : "boolean", group : "Appearance", defaultValue : true},
			
			/**
			 * This property specifies the title text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
			
			/**
			 * This property specifies the info text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			infoTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
		}
	}});
	
	
	StandardListItem.prototype.exit = function() {
		if (this._image) {
			this._image.destroy();
		}
	
		ListItemBase.prototype.exit.apply(this, arguments);
	};
	
	
	/**
	 * @private
	 */
	StandardListItem.prototype._getImage = function(sImgId, sImgStyle, sSrc, bIconDensityAware) {
		var oImage = this._image;
	
		if (oImage) {
			oImage.setSrc(sSrc);
			if (oImage instanceof sap.m.Image) {
				oImage.setDensityAware(bIconDensityAware);
			}
		} else {
			oImage = IconPool.createControlByURI({
				id: sImgId,
				src : sSrc,
				densityAware : bIconDensityAware,
				useIconTooltip : false
			}, sap.m.Image).setParent(this, null, true);
		}
	
		if (oImage instanceof sap.m.Image) {
			oImage.addStyleClass(sImgStyle, true);
		} else {
			oImage.addStyleClass(sImgStyle + "Icon", true);
		}
	
		this._image = oImage;
		return this._image;
	};
	
	// overwrite base method to hook into the active handling
	StandardListItem.prototype._activeHandlingInheritor = function() {
		var oImage = sap.ui.getCore().byId(this.getId() + "-img");
		if (oImage instanceof sap.ui.core.Icon) {
			oImage.$().toggleClass("sapMSLIIconActive", this._active);
		}
	
		if (oImage && this.getActiveIcon()) {
			oImage.setSrc(this.getActiveIcon());
		}
	};
	
	// overwrite base method to hook into the inactive handling
	StandardListItem.prototype._inactiveHandlingInheritor = function() {
		var oImage = sap.ui.getCore().byId(this.getId() + "-img");
		if (oImage instanceof sap.ui.core.Icon) {
			oImage.$().toggleClass("sapMSLIIconActive", this._active);
		}
	
		if (oImage) {
			oImage.setSrc(this.getIcon());
		}
	};

	return StandardListItem;

}, /* bExport= */ true);
