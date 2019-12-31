/*!
 * ${copyright}
 */

// Provides control sap.f.ProductSwitchItem
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/library",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/f/ProductSwitchItemRenderer"
],
	function (
		Control,
		Icon,
		library,
		Text,
		KeyCodes,
		ProductSwitchItemRenderer
	) {
		"use strict";

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = library.TextAlign;

		/**
		 * Constructor for a new <code>ProductSwitchItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is used as a child of <code>ProductSwitch</code>
		 *
		 * <b>Note:</b> <code>ProductSwitchItem</code> is not supported when used outside of <code>ProductSwitch</code>.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @experimental Since 1.72. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 * @alias sap.f.ProductSwitchItem
		 * @since 1.72
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ProductSwitchItem = Control.extend("sap.f.ProductSwitchItem", {
			metadata: {
				library: "sap.f",
				properties: {
					 /**
					 * Defines the icon to be displayed as graphical element within the <code>ProductSwitchItem</code>.
					 * It can be an image or an icon from the SAP icon font.
					 */
					src: { type: "sap.ui.core.URI", defaultValue: null },
					 /**
					 * Determines the title of the <code>ProductSwitchItem</code>.
					 */
					title: { type: "string", defaultValue: null },
					 /**
					 * Determines the subtitle of the <code>ProductSwitchItem</code>.
					 */
					subTitle: { type: "string", defaultValue: null },
					 /**
					 * Defines the <code>ProductSwitchItem</code> target URI. Supports standard hyperlink behavior.
					 */
					targetSrc: { type: "sap.ui.core.URI", group: "Data", defaultValue: null },
					 /**
					 * Specifies a target where the <code>targetSrc</code> content must be open.
					 *
					 * Options are the standard values for window.open() supported by browsers:
					 * <code>_self</code>, <code>_top</code>, <code>_blank</code>, <code>_parent</code>, <code>_search</code>.
					 * Alternatively, a frame name can be entered.
					 */
					target: { type: "string", group: "Behavior", defaultValue: null }
				},
				aggregations: {
					 /**
					 * Holds the internally created Icon.
					 */
					_icon: { type: "sap.ui.core.Icon", visibility: "hidden", multiple: false },
					 /**
					 * Holds the internally created Text.
					 */
					_title: { type: "sap.m.Text", visibility: "hidden", multiple: false }
				}
			}
		});

		ProductSwitchItem.prototype.init = function () {
			this._bSpaceEnterPressed = false;
			this._bEscapeShiftKeyPress = false;
		};

		ProductSwitchItem.prototype.setTitle = function (sTitle) {
			this.setProperty("title", sTitle);
			this._getTitle().setText(sTitle);

			return this;
		};

		ProductSwitchItem.prototype.setSrc = function (sSrc) {
			this.setProperty("src", sSrc);
			this._getIcon().setSrc(sSrc);

			return this;
		};

		ProductSwitchItem.prototype.setSubTitle = function (sSubTitle) {
			this.setProperty("subTitle", sSubTitle);
			this._getTitle().setMaxLines(sSubTitle ? 1 : 2);

			return this;
		};

		/**
		 * Gets content of aggregation _icon.
		 * @returns {sap.ui.core.Icon}
		 * @private
		 */
		ProductSwitchItem.prototype._getIcon = function () {
			var oIcon = this.getAggregation("_icon");

			if (!oIcon) {
				oIcon = new Icon();

				if (this.getSrc()) {
					oIcon.setSrc(this.getSrc());
				}

				this.setAggregation("_icon", oIcon);
			}

			return oIcon;
		};

		 /**
		 * Gets content of aggregation _title.
		 * @returns {sap.m.Text}
		 * @private
		 */
		ProductSwitchItem.prototype._getTitle = function () {
			var oText = this.getAggregation("_title");

			if (!oText) {
				oText = new Text({ text: this.getTitle(), maxLines: 2, textAlign: TextAlign.Initial })
					.addStyleClass("sapFPSItemMainTitle")
					.addStyleClass("sapFPSItemTitle");

				this.setAggregation("_title", oText);
			}

			return oText;
		};

		/**
		 * Gets the parent ProductSwitch instance.
		 * @returns {sap.f.ProductSwitch}
		 * @private
		 */
		ProductSwitchItem.prototype._getProductSwitch = function () {
			return this.getParent().getParent();
		};

		ProductSwitchItem.prototype.onkeyup = function (oEvent) {
			if ((oEvent.keyCode === KeyCodes.SPACE && !this._bEscapeShiftKeyPress)) {
				this.fireEvent("_itemPress");
			}

			if (oEvent.keyCode === KeyCodes.SPACE || oEvent.keyCode === KeyCodes.ENTER) {
				this._bSpaceEnterPressed = false;
				this._bEscapeShiftKeyPress = false;
			}
		};

		ProductSwitchItem.prototype.ontap = function () {
			this.fireEvent("_itemPress");
		};

		ProductSwitchItem.prototype.onkeydown = function (oEvent) {
			if ((oEvent.keyCode === KeyCodes.ESCAPE || oEvent.keyCode === KeyCodes.SHIFT) && this._bSpaceEnterPressed) {
				this._bEscapeShiftKeyPress = true;
			}

			if (oEvent.keyCode === KeyCodes.SPACE || oEvent.keyCode === KeyCodes.ENTER) {
				this._bSpaceEnterPressed = true;

				if (oEvent.keyCode === KeyCodes.ENTER && !this._bEscapeShiftKeyPress) {
					this.fireEvent("_itemPress");
				}
				oEvent.preventDefault();
			}
		};

		return ProductSwitchItem;

	});
