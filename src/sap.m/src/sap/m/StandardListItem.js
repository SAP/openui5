/*!
 * ${copyright}
 */

// Provides control sap.m.StandardListItem.
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/IconPool",
	"sap/ui/core/theming/Parameters",
	"sap/ui/Device",
	"./library",
	"./ListItemBase",
	"./Image",
	"./StandardListItemRenderer",
	"sap/base/Log"
],
	function(coreLibrary, IconPool, ThemeParameters, Device, library, ListItemBase, Image, StandardListItemRenderer, Log) {
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
	 * @see {@link fiori:/standard-list-item/ Standard List Item}
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
			 * <b>Note:</b>
			 * A wrapping of the information text is also supported as of version 1.95, if <code>wrapping=true</code>. Although long strings are supported for the information text, it is recommended to use short strings. For more details, see {@link #getWrapping wrapping}.
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
			infoTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Defines the wrapping behavior of title and description texts.
			 *
			 * <b>Note:</b>
			 *
			 * In the desktop mode, initial rendering of the control contains 300 characters along with a button to expand and collapse the text whereas in the phone mode, the character limit is set to 100 characters.<br>
			 * A wrapping of the information text is supported as of 1.95. But expanding and collapsing the information text is not possible.
			 * A wrapping of the information text is disabled if <code>infoStateInverted</code> is set to <code>true</code>.
			 * @since 1.67
			 */
			wrapping : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Determines the inverted rendering behavior of the info text and the info state.
			 * The color defined by the <code>infoState</code> property is rendered as the background color for the info text, if this property is set to <code>true</code>.
			 *
			 * @since 1.74
			 */
			infoStateInverted : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * This property can be used to change the default character limits for the wrapping behavior.
			 *
			 * If this property is set to 0, then the default character limit used by the wrapping behavior is used. For details see {@link #getWrapping wrapping}.
			 *
			 * <b>Note:</b>
			 *
			 * 0 or a positive integer must be used for this property.
			 * @since 1.94
			 */
			wrapCharLimit : {type : "int", group : "Behavior", defaultValue : 0}
		},
		aggregations : {
			/**
			 * A <code>sap.m.Avatar</code> control instance that, if set, is used instead of an icon or image.
			 *
			 * The size of the <code>Avatar</code> control depends on the <code>insetIcon</code> property of <code>StandardListItem</code>.
			 * The <code>displaySize</code> property of the <code>Avatar</code> control is not supported. If the <code>insetIcon</code> property of <code>StandardListItem</code> is set to <code>true</code>, the size of the <code>Avatar</code> control is set to XS; if the <code>insetIcon</code> property of <code>StandardListItem</code> is set to <code>false</code>, the size of the <code>Avatar</code> control is set to "S".
			 *
			 * @since 1.98
			 */
			avatar: {type: 'sap.m.Avatar', multiple: false}
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

	// overwrite setter of Avatar to control it's display size
	StandardListItem.prototype.setAvatar = function(oAvatar) {
		if (this.getAvatar() === oAvatar) {
			return this;
		}
		if (oAvatar) {
			oAvatar.addStyleClass("sapMSLIAvatar");
			oAvatar.setDisplaySize = function(){return this;};
		}
		this.setAggregation("avatar", oAvatar);

		return this;
	};

	StandardListItem.prototype.setWrapCharLimit = function(iLimit) {
		var iOldCharLimit = this.getWrapCharLimit();

		if (iOldCharLimit === iLimit) {
		  return this;
		}
		if (iLimit < 0) {
		  Log.error("The property wrapCharLimit must be 0 or greater than 0 - " + this.getId());
		  return this;
		}

		this.setProperty("wrapCharLimit", iLimit);
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

		var sImgStyle = this.getIconInset() ? "sapMSLIImg" : "sapMSLIImgNoInset";
		oImage.addStyleClass(oImage instanceof Image ? sImgStyle : sImgStyle + "Icon", true);

		this._oImage = oImage;
		return this._oImage;
	};

	// overwrite base method to hook into the inactive handling
	StandardListItem.prototype._getAvatar = function() {
		var oAvatar = this.getAvatar();
		var sSize = this.getIconInset() ? library.AvatarSize.XS : library.AvatarSize.S;
		oAvatar.setProperty("displaySize", sSize, true);
		return oAvatar;
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
		var sInfoState = this.getInfoState(),
			sTitle = this.getTitle(),
			sTitleButtonText,
			sDescription = this.getDescription(),
			sDescriptionButtonText,
			oTitleButton,
			oDescriptionButton,
			aOutput = [],
			sInfo = this.getInfo();

		if (this.getWrapping()) {
			oTitleButton = this.getDomRef("titleButton");
			oDescriptionButton = this.getDomRef("descriptionButton");
			sTitle = this._bTitleTextExpanded ? sTitle : this._getCollapsedText(sTitle);
			sDescription = this._bDescriptionTextExpanded ? sDescription : this._getCollapsedText(sDescription);

			aOutput.push(sTitle);

			if (oTitleButton) {
				sTitleButtonText = oTitleButton.textContent + " " + oBundle.getText("ACC_CTR_TYPE_BUTTON");
				sTitleButtonText && aOutput.push(sTitleButtonText);
			}

			aOutput.push(sDescription);

			if (oDescriptionButton) {
				sDescriptionButtonText = oDescriptionButton.textContent + " . " + oBundle.getText("ACC_CTR_TYPE_BUTTON");
				sDescriptionButtonText && aOutput.push(sDescriptionButtonText);
			}
		} else {
			sTitle && aOutput.push(sTitle);
			sDescription && aOutput.push(sDescription);
		}

		sInfo && aOutput.push(sInfo);

		if (sInfoState != "None" && sInfoState != this.getHighlight()) {
			aOutput.push(oBundle.getText("LIST_ITEM_STATE_" + sInfoState.toUpperCase()));
		}

		return aOutput.join(" . ").trim();
	};

	/**
	 * Measures the info text width.
	 * @param {boolean} bThemeChanged Indicated whether font style should be reinitialized if theme is changed
	 *
	 * @returns {int} Info text width
	 * @private
	 */
	StandardListItem.prototype._measureInfoTextWidth = function(bThemeChanged) {
		if (!StandardListItem._themeInfo) {
			StandardListItem._themeInfo = {};
		}

		var fBaseFontSize = parseFloat(library.BaseFontSize) || 16;

		if (!StandardListItem._themeInfo.sFontFamily || bThemeChanged) {
			StandardListItem._themeInfo.sFontFamily = ThemeParameters.get({
				name: "sapUiFontFamily"
			}) || "Arial";
		}

		if (!StandardListItem._themeInfo.sFontStyleInfoStateInverted || bThemeChanged) {
			StandardListItem._themeInfo.sFontStyleInfoStateInverted = "bold " + parseFloat(ThemeParameters.get({
				name: "sapMFontSmallSize"
			}) || "0.75rem") * fBaseFontSize + "px " + StandardListItem._themeInfo.sFontFamily;
		}

		if (!StandardListItem._themeInfo.sFontStyle || bThemeChanged) {
			StandardListItem._themeInfo.sFontStyle = parseFloat(ThemeParameters.get({
				name: "sapMFontMediumSize"
			}) || "0.875rem") * fBaseFontSize + "px " + StandardListItem._themeInfo.sFontFamily;
		}

		if (!StandardListItem._oCtx) {
			StandardListItem._oCtx = document.createElement("canvas").getContext("2d");
		}

		StandardListItem._oCtx.font = StandardListItem._themeInfo[this.getInfoStateInverted() ? "sFontStyleInfoStateInverted" : "sFontStyle"];

		return Math.ceil(StandardListItem._oCtx.measureText(this.getInfo()).width) / fBaseFontSize;
	};

	/**
	 * Returns the measured info text width in rem value.
	 * @param {float} fWidth Measured info text width
	 * @returns {string} rem value for info text min-width
	 * @private
	 */
	StandardListItem.prototype._getInfoTextMinWidth = function(fWidth) {
		if (this.getInfoStateInverted() && fWidth <= 7.5) {
			// 0.625rem padding for the infoText if infoStateInverted=true
			return fWidth + 0.625 + "rem";
		}

		if (fWidth <= 7.5) {
			// no padding if infoStateInverted=false
			return fWidth + "rem";
		}

		return "7.5rem";
	};

	StandardListItem.prototype.ontap = function(oEvent) {
		this._checkExpandCollapse(oEvent);

		return ListItemBase.prototype.ontap.apply(this, arguments);
	};

	StandardListItem.prototype.ontouchstart = function(oEvent) {
		var sId = oEvent.target && oEvent.target.id,
			sStdListId = this.getId();

		if (sId === sStdListId + "-titleButton" || sId === sStdListId + "-descriptionButton") {
			oEvent.setMarked();
		}

		return ListItemBase.prototype.ontouchstart.apply(this, arguments);
	  };

	StandardListItem.prototype.onsapspace = function(oEvent) {
		// prevent default not to scroll down, hence 2nd parameter is true
		this._checkExpandCollapse(oEvent, true);

		if (!oEvent.isMarked()) {
			return ListItemBase.prototype.onsapspace.apply(this, arguments);
		}
	};

	// checks whether expand/collapse action should be performed on the text.
	StandardListItem.prototype._checkExpandCollapse = function(oEvent, bPreventDefault) {
		var oTarget = oEvent.target,
			sId = oTarget && oTarget.id;

		if (sId && sId === this.getId() + "-titleButton") {
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
			oEvent.setMarked();
			return this._toggleExpandCollapse("title", this._bTitleTextExpanded);
		}

		if (sId && sId === this.getId() + "-descriptionButton") {
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
			oEvent.setMarked();
			return this._toggleExpandCollapse("description", this._bDescriptionTextExpanded);
		}
	};

	/**
	 * Toggles the text of the expand and collapse button.
	 *
	 * @param {string} sWrapArea Defines the wrapping text area
	 * @param {boolean} bTextExpanded If <code>true</code>,the text is expanded
	 * @private
	 */
	StandardListItem.prototype._toggleExpandCollapse = function(sWrapArea, bTextExpanded) {
		var oText = this.getDomRef(sWrapArea + "Text"),
			oThreeDots = this.getDomRef(sWrapArea + "ThreeDots"),
			oButton = this.getDomRef(sWrapArea + "Button"),
			sText = sWrapArea === "title" ? this.getTitle() : this.getDescription(),
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		if (!bTextExpanded) {
			oText.textContent = sText;
			oThreeDots.textContent = " ";
			oButton.textContent = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS");
			bTextExpanded = true;
		} else {
			oText.textContent = this._getCollapsedText(sText);
			oThreeDots.textContent = " ... ";
			oButton.textContent = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE");
			bTextExpanded = false;
		}

		if (sWrapArea === "title") {
			this._bTitleTextExpanded = bTextExpanded;
		} else {
			this._bDescriptionTextExpanded = bTextExpanded;
		}
	};

	/**
	 * Returns the collapsed text.
	 *
	 * @param {string} sText Text
	 * @returns {string} Collapsed text
	 * @private
	 */
	StandardListItem.prototype._getCollapsedText = function(sText) {
		return sText.substr(0, this._getWrapCharLimit());
	};

	StandardListItem.prototype._getWrapCharLimit = function() {
		return this.getWrapCharLimit() || (Device.system.phone ? 100 : 300);
	};

	StandardListItem.prototype.onThemeChanged = function(oEvent) {
		ListItemBase.prototype.onThemeChanged.apply(this, arguments);

		var sTheme = oEvent.theme;
		if (!this._initialRender) {
			this._initialRender = true;
			if (!StandardListItem._themeInfo) {
				StandardListItem._themeInfo = {};
			}
			if (!StandardListItem._themeInfo.sCurrentTheme) {
				StandardListItem._themeInfo.sCurrentTheme = sTheme;
			}
			return;
		}

		var oInfoDomRef = this.getDomRef("info");

		if (oInfoDomRef) {
			var fWidth;

			if (StandardListItem._themeInfo.sCurrentTheme !== sTheme) {
				StandardListItem._themeInfo.sCurrentTheme = sTheme;
				fWidth = this._measureInfoTextWidth(true);
			} else {
				fWidth = this._measureInfoTextWidth();
			}

			oInfoDomRef.style.minWidth = this._getInfoTextMinWidth(fWidth);
		}
	};

	return StandardListItem;

});
