/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectMarker.
sap.ui.define(['jquery.sap.global', "sap/ui/core/Control", 'sap/ui/core/Renderer'], function(jQuery, Control, Renderer) {
	"use strict";

	/**
	 * Constructor for a new ObjectMarker.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.ObjectMarker</code> control represents one of the following predefined types:
	 * <ul>
	 * <li><code>Flagged</code>
	 * <li><code>Favorite</code>
	 * <li><code>Draft</code>
	 * <li><code>Locked</code>
	 * <li><code>LockedBy</code>
	 * <li><code>Unsaved</code>
	 * <li><code>UnsavedBy</code>
	 * </ul>
	 * <b>Note</b>: Use the <code>LockedBy/UnsavedBy</code> type along with the <code>additionalInfo</code> property to display the name of the user who locked/changed the object.
	 * If <code>additionalInfo</code> property is not set when using <code>LockedBy/UnsavedBy</code> types, the string "Locked by another user"/"Unsaved changes by another user" will be displayed.
	 * If you don't want to display name of the user, simply use the <code>Locked/Unsaved</code> types.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.m.ObjectMarker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectMarker = Control.extend("sap.m.ObjectMarker", /** @lends sap.m.ObjectMarker.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Sets one of the predefined types.
				 *
				 * <b>Note</b>: If the <code>visibility</code> property is not specified explicitly, every <code>type</code> comes with predefined one as follows:
				 * <ul>
				 *                 <li>For <code>Flagged</code> and <code>Favorite</code> the icon is visible and the text is not displayed</li>
				 *                 <li>For <code>Draft</code> the text is visible and the icon is not displayed</li>
				 *                 <li>For <code>Locked</code>, <code>LockedBy</code>, <code>Unsaved</code> and <code>UnsavedBy</code> - on screens larger than 600px both icon and text are visible, otherwise only the icon</li>
				 *
				 * </ul>
				 */
				type: {type: "sap.m.ObjectMarkerType", group: "Misc"},

				/**
				 * Sets one of the visibility states.
				 * Visibility states are as follows:
				 * <ul>
				 *                 <li><code>IconOnly</code> - displays only icon, regardless of the screen size</li>
				 *                 <li><code>TextOnly</code> - displays only text, regardless of the screen size</li>
				 *                 <li><code>IconAndText</code> - displays both icon and text, regardless of the screen size</li>
				 * </ul>
				 */
				visibility: {type: "sap.m.ObjectMarkerVisibility", group: "Misc"},

				/**
				 * Sets additional information to the displayed <code>type</code>.
				 *
				 * <b>Note:</b> If no type is set, the additional information will not be displayed.
				 */
				additionalInfo: {type: "string", group: "Misc", defaultValue: ""}
			},
			aggregations: {

				/**
				 * Internal control that should be <code>sap.m.Link</code> for interactive and <code>sap.m.Text</code>
				 * for non-interactive <code>ObjectMarker</code>.
				 */
				_innerControl: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * Event is fired when the <code>ObjectMarker</code> is interactive and the user taps/clicks on it.
				 */
				press: {

					/**
					 * Type of the <code>ObjectMarker</code>.
					 */
					type: {type: "sap.m.ObjectMarkerType"}
				}
			}
		}
	});

	/**
	 * Library internationalization resource bundle.
	 *
	 * @type {jQuery.sap.util.ResourceBundle}
	 */
	var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * Map of predefined <code>ObjectMarker</code> types.
	 *
	 * @static
	 */
	ObjectMarker.M_PREDEFINED_TYPES = {
		Flagged: {
			icon: {
				src: "sap-icon://flag",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_FLAG"),
				visibility: {
					small: false,
					large: false
				}
			}
		},
		Favorite: {
			icon: {
				src: "sap-icon://favorite",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_FAVORITE"),
				visibility: {
					small: false,
					large: false
				}
			}
		},
		Draft: {
			icon: {
				src: "sap-icon://request",
				visibility: {
					small: false,
					large: false
				}
			},
			text: {
				value: oRB.getText("OM_DRAFT"),
				visibility: {
					small: true,
					large: true
				}
			}
		},
		Locked: {
			icon: {
				src: "sap-icon://private",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_LOCKED"),
				visibility: {
					small: false,
					large: true
				}
			}
		},
		Unsaved: {
			icon: {
				src: "sap-icon://user-edit",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_UNSAVED"),
				visibility: {
					small: false,
					large: true
				}
			}
		},
		LockedBy: {
			icon: {
				src: "sap-icon://private",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_LOCKED_BY"),
				visibility: {
					small: false,
					large: true
				}
			}
		},
		UnsavedBy: {
			icon: {
				src: "sap-icon://user-edit",
				visibility: {
					small: true,
					large: true
				}
			},
			text: {
				value: oRB.getText("OM_UNSAVED_BY"),
				visibility: {
					small: false,
					large: true
				}
			}
		}
	};

	/**
	 * Initializes the control.
	 *
	 * @override
	 */
	ObjectMarker.prototype.init = function() {
		// Defines custom screen range set: smaller or equal 600px defines 'small' and bigger that defines 'large' screen
		sap.ui.Device.media.initRangeSet("DeviceSet", [600], "px", ["small", "large"]);
	};

	/**
	 * Function is called when the rendering of the control is completed.
	 *
	 * @override
	 */
	ObjectMarker.prototype.onAfterRendering = function() {
		this._attachMediaContainerWidthChange(this._handleMediaChange, this, "DeviceSet");
	};

	/**
	 * Function is called before the rendering of the control is started.
	 *
	 * @override
	 */
	ObjectMarker.prototype.onBeforeRendering = function() {
		// Cleanup resize event registration before re-rendering
		this._cleanup();

		// Inner control can be determined here as all property values are known
		this._adjustControl();
	};

	/**
	 * Cleans up the element instance before destruction.
	 *
	 * @override
	 */
	ObjectMarker.prototype.exit = function() {
		// Cleanup resize event registration on exit
		this._cleanup();
	};

	/**
	 * Intercepts <code>attachPress</code> to be able to re-render.
	 * If <code>press</code> event is attached and the control is rendered as text, than the control will be
	 * re-rendered as link.
	 *
	 * @returns {sap.m.ObjectMarker} <code>this</code> pointer for chaining
	 */
	ObjectMarker.prototype.attachPress = function () {
		var oInnerControl = this._getInnerControl();

		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.attachEvent.apply(this, arguments);

		if (this.hasListeners("press") && oInnerControl && oInnerControl instanceof CustomText) {
			oInnerControl.destroy();
			this.setAggregation("_innerControl", this._createCustomLink(), true);
			this._adjustControl();
		}

		return this;
	};

	/**
	 * Intercepts <code>detachPress</code> to be able to re-render.
	 * If <code>press</code> event is detached and the control is rendered as a link, than the control will be
	 * re-rendered as a text.
	 *
	 * @returns {sap.m.ObjectMarker} <code>this</code> pointer for chaining
	 */
	ObjectMarker.prototype.detachPress = function() {
		var oInnerControl = this._getInnerControl();

		Array.prototype.unshift.apply(arguments, ["press"]);
		Control.prototype.detachEvent.apply(this, arguments);

		if (!this.hasListeners("press") && oInnerControl && oInnerControl instanceof CustomLink) {
			oInnerControl.destroy();
			this.setAggregation("_innerControl", this._createCustomText(), true);
			this._adjustControl();
		}

		return this;
	};

	/**
	 * Cleans up the control.
	 *
	 * @private
	 */
	ObjectMarker.prototype._cleanup = function() {
		// Device Media Change handler
		this._detachMediaContainerWidthChange(this._handleMediaChange, this, "DeviceSet");
	};

	/**
	 * Device Media Change handler.
	 *
	 * @private
	 */
	ObjectMarker.prototype._handleMediaChange  = function() {
		this._adjustControl();
	};

	/**
	 * Determines if the icon/text should be visible, etc.
	 *
	 * @returns {boolean} <code>true</code> if the adjustment is done and <code>false</code> if there is no inner control and no adjustment happened.
	 * @private
	 */
	ObjectMarker.prototype._adjustControl  = function() {

		var oType = ObjectMarker.M_PREDEFINED_TYPES[this.getType()],
			oInnerControl = this._getInnerControl(),
			sAdditionalInfo = this.getAdditionalInfo(),
			sType = this.getType(),
			sText;

		// If we have no inner control at this stage we don't need to adjust
		if (!oInnerControl) {
			return false;
		}

		if (oType) {
			sText = this._getMarkerText(oType, sType, sAdditionalInfo);
		}

		if (this._isIconVisible()) {
			oInnerControl.setIcon(oType.icon.src);
			this.addStyleClass("sapMObjectMarkerIcon");
		} else {
			oInnerControl.setIcon(null);
			this.removeStyleClass("sapMObjectMarkerIcon");
		}

		if (this._isTextVisible()) {
			oInnerControl.setTooltip(null);
			oInnerControl.setText(sText);
			this.addStyleClass("sapMObjectMarkerText");
		} else {
			if (oInnerControl.getIcon()) {
				oInnerControl.setTooltip(sText);
			}
			oInnerControl.setText(null);
			this.removeStyleClass("sapMObjectMarkerText");
		}

		return true;
	};

	/**
	 * Gets the marker text.
	 *
	 * @returns {String}, concatenated from type and additionalInfo text
	 * @private
	 */
	ObjectMarker.prototype._getMarkerText = function (oType, sType, sAdditionalInfo) {

		switch (sType) {
			case "LockedBy":
				return (sAdditionalInfo === "") ? oRB.getText('OM_LOCKED_BY_ANOTHER_USER') : oRB.getText('OM_LOCKED_BY', [sAdditionalInfo]);
			case "UnsavedBy":
				return (sAdditionalInfo === "") ? oRB.getText('OM_UNSAVED_BY_ANOTHER_USER') : oRB.getText('OM_UNSAVED_BY', [sAdditionalInfo]);
			default:
				return (sAdditionalInfo === "") ? oType.text.value : oType.text.value + " " + sAdditionalInfo;
		}
	};

	/**
	 * Determines if the icon of the control should be visible or not.
	 *
	 * @returns {boolean} <code>true</code>, if the icon should be visible
	 * @private
	 */
	ObjectMarker.prototype._isIconVisible = function () {
		var oType = ObjectMarker.M_PREDEFINED_TYPES[this.getType()],
			sVisibility = this.getVisibility(),
			sDeviceType = this._getDeviceType(),
			bTypeIconVisibility = oType && oType.icon.visibility[sDeviceType] || false;

		return sVisibility === sap.m.ObjectMarkerVisibility.IconOnly ||
			sVisibility === sap.m.ObjectMarkerVisibility.IconAndText ||
			(sVisibility !== sap.m.ObjectMarkerVisibility.TextOnly && bTypeIconVisibility);
	};

	/**
	 * Determines if the text of the control should be visible or not.
	 *
	 * @returns {boolean} <code>true</code>, if the text should be visible
	 * @private
	 */
	ObjectMarker.prototype._isTextVisible = function () {
		var oType = ObjectMarker.M_PREDEFINED_TYPES[this.getType()],
			sVisibility = this.getVisibility(),
			sDeviceType = this._getDeviceType(),
			bTypeTextVisibility = oType && oType.text.visibility[sDeviceType] || false;

		return sVisibility === sap.m.ObjectMarkerVisibility.TextOnly ||
			sVisibility === sap.m.ObjectMarkerVisibility.IconAndText ||
			(sVisibility !== sap.m.ObjectMarkerVisibility.IconOnly && bTypeTextVisibility);
	};

	/**
	 * Returns the device type according to the current range set.
	 *
	 * @returns {string} type of the device ("small" or "large")
	 * @private
	 */
	ObjectMarker.prototype._getDeviceType = function () {
		return this._getCurrentMediaContainerRange("DeviceSet").name.toLowerCase();
	};

	/**
	 * Returns the inner control.
	 *
	 * @private
	 */
	ObjectMarker.prototype._getInnerControl = function () {
		var oInnerControl = this.getAggregation("_innerControl");

		if (!oInnerControl && this.getType()) {
			oInnerControl = this._createInnerControl();
			this.setAggregation("_innerControl", oInnerControl, true);
			this._adjustControl();
		}

		return oInnerControl;
	};

	/**
	 * Returns an inner control: <code>sap.m.Text</code> if <code>ObjectMarker</code> is non-interactive or
	 * <code>sap.m.Link</code> - if interactive.
	 *
	 * @private
	 */
	ObjectMarker.prototype._createInnerControl = function () {
		if (this.hasListeners("press")) {
			return this._createCustomLink();
		} else {
			return this._createCustomText();
		}
	};

	/**
	 * Returns a new custom link control.
	 *
	 * @returns {*} custom link control
	 * @private
	 */
	ObjectMarker.prototype._createCustomLink = function () {
		var oCustomLink = new CustomLink(this.getId() + "-link", {
			wrapping: true
		});

		oCustomLink.attachPress(function(oEvent) {
			this.firePress({
				type: this.getType()
			});
		}, this);

		return oCustomLink;
	};

	/**
	 * Returns a new custom text control.
	 *
	 * @returns {*} custom text control
	 * @private
	 */
	ObjectMarker.prototype._createCustomText = function () {
		return new CustomText(this.getId() + "-text", {
			textAlign: sap.ui.core.TextAlign.Initial
		});
	};

	/****************************************** CUSTOM TEXT CONTROL ****************************************************/

	var CustomTextRenderer = Renderer.extend(sap.m.TextRenderer);

	CustomTextRenderer.renderText = function(oRm, oControl) {
		oRm.renderControl(oControl._getIconAggregation());
		sap.m.TextRenderer.renderText(oRm, oControl);
	};

	var CustomText = sap.m.Text.extend("CustomText", {
		metadata: {
			properties: {
				icon: {type : "sap.ui.core.URI", group : "Data", defaultValue : null}
			},
			aggregations: {
				_iconControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			}
		},
		renderer: CustomTextRenderer
	});

	CustomText.prototype.setIcon = function(sIcon) {
		var oIcon = this._getIconAggregation();

		this.setProperty("icon", sIcon , false);
		oIcon.setSrc(sIcon);
	};

	CustomText.prototype._getIconAggregation = function() {
		var oIcon = this.getAggregation("_iconControl");

		if (!oIcon) {
			oIcon = new sap.ui.core.Icon();
			this.setAggregation("_iconControl", oIcon);
		}

		return oIcon;
	};

	CustomText.prototype.setText = function(sText) {
		this.setProperty("text", sText , true);
	};

	/****************************************** CUSTOM LINK CONTROL ****************************************************/

	var CustomLinkRenderer = Renderer.extend(sap.m.LinkRenderer);

	CustomLinkRenderer.renderText = function(oRm, oControl) {
		oRm.renderControl(oControl._getIconAggregation());
		sap.m.LinkRenderer.renderText(oRm, oControl);
	};

	var CustomLink = sap.m.Link.extend("CustomLink", {
		metadata: {
			properties: {
				icon: {type : "sap.ui.core.URI", group : "Data", defaultValue : null}
			},
			aggregations: {
				_iconControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			}
		},
		renderer: CustomLinkRenderer

	});

	CustomLink.prototype.setIcon = function(sIcon) {
		var oIcon = this._getIconAggregation();

		this.setProperty("icon", sIcon , false);
		oIcon.setSrc(sIcon);
	};

	CustomLink.prototype._getIconAggregation = function() {
		var oIcon = this.getAggregation("_iconControl");

		if (!oIcon) {
			oIcon = new sap.ui.core.Icon();
			this.setAggregation("_iconControl", oIcon);
		}

		return oIcon;
	};

	CustomLink.prototype.setText = function(sText){
		this.setProperty("text", sText, true);
	};


	return ObjectMarker;

}, /* bExport= */ true);