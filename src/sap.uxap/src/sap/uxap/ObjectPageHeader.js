/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeader.
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "sap/ui/core/CustomData",
    "sap/ui/Device",
    "sap/m/Breadcrumbs",
    "./ObjectPageHeaderActionButton",
    "sap/ui/core/ResizeHandler",
    "sap/m/Button",
    "sap/m/ActionSheet",
    "./ObjectImageHelper",
    "./ObjectPageHeaderContent",
    "./library",
    "sap/m/library",
    "./ObjectPageHeaderRenderer"
], function(
    jQuery,
	Control,
	IconPool,
	CustomData,
	Device,
	Breadcrumbs,
	ObjectPageHeaderActionButton,
	ResizeHandler,
	Button,
	ActionSheet,
	ObjectImageHelper,
	ObjectPageHeaderContent,
	library,
	mobileLibrary,
	ObjectPageHeaderRenderer
) {
	"use strict";

	// shortcut for sap.uxap.Importance
	var Importance = library.Importance;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.uxap.ObjectPageHeaderDesign
	var ObjectPageHeaderDesign = library.ObjectPageHeaderDesign;

	// shortcut for sap.uxap.ObjectPageHeaderPictureShape
	var ObjectPageHeaderPictureShape = library.ObjectPageHeaderPictureShape;

	function isFunction(oObject) {
		return typeof oObject === "function";
	}

	/**
	 * Constructor for a new <code>ObjectPageHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents the static part (header title) of the classic header of the {@link sap.uxap.ObjectPageLayout}.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>ObjectPageHeader</code> is used to display the basic information about a business object,
	 * such as title/description/picture, as well as a list of common actions.
	 *
	 * <b>Note:</b> The <code>ObjectPageHeader</code> is meant to be used inside the <code>ObjectPageLayout</code>
	 * control. Any other usage is not supported and can lead to unexpected behavior.
	 *
	 * @see {@link topic:0fecbce45e39406aa939bd25e89823f4 Object Page Classic Header}
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 * @see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/snapping-header/ Object Page Header}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-page/ UX Guidelines: Object Page}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.uxap.IHeaderTitle
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageHeader
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageHeader = Control.extend("sap.uxap.ObjectPageHeader", /** @lends sap.uxap.ObjectPageHeader.prototype */ {
		metadata: {
			library: "sap.uxap",
			interfaces: ["sap.uxap.IHeaderTitle"],
			properties: {

				/**
				 * The URL of the image, representing the business object
				 */
				objectImageURI: {type: "string", defaultValue: null},

				/**
				 * The text to be used for the Alt and Tooltip attribute of the image, supplied via the objectImageURI property
				 */
				objectImageAlt: {type: "string", defaultValue: ''},

				/**
				 * The value of densityAware for the image, supplied via the objectImageURI property.
				 * See sap.m.Image for more details on densityAware.
				 */
				objectImageDensityAware: {type: "boolean", defaultValue: false},

				/**
				 * The title of the object
				 */
				objectTitle: {type: "string", defaultValue: null},

				/**
				 * The description of the object
				 */
				objectSubtitle: {type: "string", defaultValue: null},

				/**
				 * Determines whether the picture should be displayed in a square or with a circle-shaped mask.
				 */
				objectImageShape: {
					type: "sap.uxap.ObjectPageHeaderPictureShape",
					defaultValue: ObjectPageHeaderPictureShape.Square
				},

				/**
				 * Determines whether the icon should always be visible or visible only when the header is snapped.
				 */
				isObjectIconAlwaysVisible: {type: "boolean", defaultValue: false},

				/**
				 * Determines whether the title should always be visible or visible only when the header is snapped.
				 */
				isObjectTitleAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the subtitle should always be visible or visible only when the header is snapped.
				 */
				isObjectSubtitleAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the action buttons should always be visible or visible only when the header is snapped.
				 */
				isActionAreaAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines the design of the header - Light or Dark.
				 * <b>Note: </b>This property is deprecated. It will continue to work in the Blue Crystal theme,
				 * but it will not be taken into account for the Belize themes.
				 * @deprecated Since version 1.40.1
				 */
				headerDesign: {
					type: "sap.uxap.ObjectPageHeaderDesign",
					defaultValue: ObjectPageHeaderDesign.Light
				},

				/**
				 * When set to true, the selector arrow icon/image is shown and can be pressed.
				 */
				showTitleSelector: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set the favorite state to true or false. The showMarkers property must be true for this property to take effect.
				 */
				markFavorite: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set the flagged state to true or false. The showMarkers property must be true for this property to take effect.
				 */
				markFlagged: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Indicates if object page header title supports showing markers such as flagged and favorite.
				 */
				showMarkers: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Set the locked state of the objectPageHeader.
				 */
				markLocked: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Enables support of a placeholder image in case no image is specified or the URL of the provided image is invalid.
				 */
				showPlaceholder: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Marks that there are unsaved changes in the objectPageHeader.
				 * The markChanges state cannot be used together with the markLocked state.
				 * If both are set to true, only the locked state will be displayed.
				 * @since 1.34.0
				 */
				markChanges: {type: "boolean", group: "Misc", defaultValue: false}
			},
			defaultAggregation: "actions",
			aggregations: {

				/**
				 *
				 * Internal aggregation for the legacy breadCrumbsLinks.
				 */
				_breadCrumbs: {type: "sap.m.Breadcrumbs", multiple: false, visibility: "hidden"},

				/**
				 *
				 * The breadcrumbs displayed in the <code>ObjectPageHeader</code>.
				 * If this aggregation is set, the <code>breadCrumbsLinks</code> aggregation is omitted.
				 * @since 1.50
				 */
				breadcrumbs: {type: "sap.m.Breadcrumbs", multiple: false, singularName: "breadcrumb"},

				/**
				 *
				 * A list of all the active link elements in the BreadCrumbs control.
				 * @deprecated as of version 1.50, use the <code>breadcrumbs</code> aggregation instead.
				 */
				breadCrumbsLinks: {type: "sap.m.Link", multiple: true, singularName: "breadCrumbLink"},

				/**
				 *
				 * Internal aggregation for the overflow button in the header.
				 */
				_overflowButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 *
				 * Internal aggregation for the expand header button.
				 */
				_expandButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 *
				 * Icon for the identifier line.
				 */
				_objectImage: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				_placeholder: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_lockIconCont: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_lockIcon: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_titleArrowIconCont: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_titleArrowIcon: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_favIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_flagIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_overflowActionSheet: {type: "sap.m.ActionSheet", multiple: false, visibility: "hidden"},
				_changesIconCont: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_changesIcon: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_sideContentBtn: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 *
				 * An instance of sap.m.Bar to be embedded in the header
				 */
				navigationBar: {type: "sap.m.Bar", multiple: false},

				/**
				 *
				 * List of actions that will be displayed in the header.
				 * You can use ObjectPageHeaderActionButton controls to achieve a different visual representation of the action buttons in the action bar and the action sheet (overflow menu).
				 * You can use ObjectPageHeaderLayoutData to display a visual separator.
				 *
				 * <b>Note:</b> If an action is placed inside the overflow area, an additional
				 * <code>bInOverflow</code> parameter is passed along with the <code>press</code>
				 * event to indicate that a popup shouldn't be opened from that action and a dialog
				 * should be used instead.
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"},

				/**
				 *
				 * A button that is used for opening the side content of the page or some additional content.
				 * @since 1.38.0
				 */
				sideContentButton: {type: "sap.m.Button", multiple: false},

				/**
				 * A custom tooltip for the title selector button.
				 *
				 * The custom tooltip will be visible if the <code>showTitleSelector</code>
				 * property is set to <code>true</code>.
				 *
				 * <b>Note:</b> If the aggregation is destroyed or set to invalid value, the
				 * default tooltip will be set. The default tooltip text is "Related options".
				 *
				 * @since 1.56
				 */
				titleSelectorTooltip: {type: "sap.ui.core.TooltipBase", altTypes: ["string"], multiple: false}
			},
			events: {

				/**
				 * The event is fired when the objectPage header title selector (down-arrow) is pressed
				 */
				titleSelectorPress: {
					parameters: {

						/**
						 * DOM reference of the title item's icon to be used for positioning.
						 */
						domRef: {type: "string"}
					}
				},

				/**
				 * The event is fired when the Locked button is pressed
				 */
				markLockedPress: {
					parameters: {

						/**
						 * DOM reference of the lock item's icon to be used for positioning.
						 */
						domRef: {type: "string"}
					}
				},

				/**
				 * The event is fired when the unsaved changes button is pressed
				 */
				markChangesPress: {
					parameters: {

						/**
						 * DOM reference of the changed item's icon to be used for positioning.
						 * @since 1.34.0
						 */
						domRef: {type: "string"}
					}
				}
			},
			designtime: "sap/uxap/designtime/ObjectPageHeader.designtime"
		}
	});

	ObjectPageHeader.prototype._iAvailablePercentageForActions = 0.3;

	ObjectPageHeader.prototype.init = function () {
		this._bFirstRendering = true;

		if (!this.oLibraryResourceBundle) {
			this.oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"); // get resource translation bundle
		}
		if (!this.oLibraryResourceBundleOP) {
			this.oLibraryResourceBundleOP = sap.ui.getCore().getLibraryResourceBundle("sap.uxap"); // get resource translation bundle
		}

		// Overflow button
		this._oOverflowActionSheet = this._lazyLoadInternalAggregation("_overflowActionSheet", true);
		this._oOverflowButton = this._lazyLoadInternalAggregation("_overflowButton", true).attachPress(this._handleOverflowButtonPress, this);
		this._oExpandButton = this._lazyLoadInternalAggregation("_expandButton", true);
		this._oActionSheetButtonMap = {};
		this._oFlagIcon = this._lazyLoadInternalAggregation("_flagIcon", true);
		this._oFavIcon = this._lazyLoadInternalAggregation("_favIcon", true);
		this._oTitleArrowIcon = this._lazyLoadInternalAggregation("_titleArrowIcon", true).attachPress(this._handleArrowPress, this);
		this._oTitleArrowIconCont = this._lazyLoadInternalAggregation("_titleArrowIconCont", true).attachPress(this._handleArrowPress, this);
		this._oLockIcon = this._lazyLoadInternalAggregation("_lockIcon", true).attachPress(this._handleLockPress, this);
		this._oLockIconCont = this._lazyLoadInternalAggregation("_lockIconCont", true).attachPress(this._handleLockPress, this);
		this._oChangesIcon = this._lazyLoadInternalAggregation("_changesIcon", true).attachPress(this._handleChangesPress, this);
		this._oChangesIconCont = this._lazyLoadInternalAggregation("_changesIconCont", true).attachPress(this._handleChangesPress, this);
	};

	ObjectPageHeader.getMetadata().forwardAggregation(
		"breadCrumbsLinks",
		{
			getter: function() { // TODO: is invalidation needed for non-getters?
				return this._lazyLoadInternalAggregation("_breadCrumbs");
			},
			aggregation: "links"
		}
	);

	ObjectPageHeader.prototype._handleOverflowButtonPress = function (oEvent) {
		this._oOverflowActionSheet.openBy(this._oOverflowButton);
	};

	ObjectPageHeader.prototype._handleArrowPress = function (oEvent) {
		this.fireTitleSelectorPress({
			domRef: oEvent.getSource().getDomRef()
		});
	};

	ObjectPageHeader.prototype._handleLockPress = function (oEvent) {
		this.fireMarkLockedPress({
			domRef: oEvent.getSource().getDomRef()
		});
	};

	ObjectPageHeader.prototype._handleChangesPress = function (oEvent) {
		this.fireMarkChangesPress({
			domRef: oEvent.getSource().getDomRef()
		});
	};

	ObjectPageHeader._internalAggregationFactory = {
		"_objectImage": ObjectImageHelper.createObjectImage,
		"_placeholder": ObjectImageHelper.createPlaceholder,
		"_overflowActionSheet": function () {
			return new ActionSheet({placement: PlacementType.Bottom});
		},
		"_lockIconCont": function (oParent) {
			return this._getButton(oParent, "sap-icon://private", "lock-cont", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_LOCK_MARK_VALUE"));
		},
		"_breadCrumbs": function (oParent) {
			return new Breadcrumbs({
				links: oParent.getAggregation("breadCrumbLinks")
			});
		},
		"_lockIcon": function (oParent) {
			return this._getButton(oParent, "sap-icon://private", "lock", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_LOCK_MARK_VALUE"));
		},
		"_titleArrowIconCont": function (oParent) {
			return this._getButton(oParent, "sap-icon://slim-arrow-down", "titleArrow-cont", oParent.oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"));
		},
		"_titleArrowIcon": function (oParent) {
			return this._getButton(oParent, "sap-icon://slim-arrow-down", "titleArrow", oParent.oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"));
		},
		"_favIcon": function (oParent) {
			return this._getIcon(oParent, "favorite", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_FAVORITE_MARK_VALUE"));
		},
		"_flagIcon": function (oParent) {
			return this._getIcon(oParent, "flag", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_FLAG_MARK_VALUE"));
		},
		"_overflowButton": function (oParent) {
			return this._getButton(oParent, "sap-icon://overflow", "overflow", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_OVERFLOW_BTN"));
		},
		"_expandButton": function (oParent) {
			return this._getButton(oParent, "sap-icon://slim-arrow-down", "expand", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_EXPAND_HEADER_BTN"));
		},
		"_changesIconCont": function (oParent) {
			return this._getButton(oParent, "sap-icon://user-edit", "changes-cont", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_CHANGES_MARK_VALUE"));
		},
		"_changesIcon": function (oParent) {
			return this._getButton(oParent, "sap-icon://user-edit", "changes", oParent.oLibraryResourceBundleOP.getText("TOOLTIP_OP_CHANGES_MARK_VALUE"));
		},
		_getIcon: function (oParent, sIcon, sTooltip) {
			return IconPool.createControlByURI({
				id: this._getParentAugmentedId(oParent, sIcon),
				tooltip: sTooltip,
				src: IconPool.getIconURI(sIcon),
				visible: false
			});
		},
		_getButton: function (oParent, sIcon, sChildSignature, sTooltip) {
			return new Button({
				id: this._getParentAugmentedId(oParent, sChildSignature),
				tooltip: sTooltip,
				icon: sIcon,
				type: ButtonType.Transparent
			});
		},
		_getParentAugmentedId: function (oParent, sChildSignature) {
			return oParent.getId() + "-" + sChildSignature;
		}
	};


	ObjectPageHeader.prototype._lazyLoadInternalAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (!this.getAggregation(sAggregationName)) {
			this.setAggregation(sAggregationName, ObjectPageHeader._internalAggregationFactory[sAggregationName](this), bSuppressInvalidate);
		}
		return this.getAggregation(sAggregationName);
	};

	ObjectPageHeader.prototype._applyActionProperty = function (sPropertyName, aArguments) {
		var newValue = aArguments[0];

		if (this.getProperty(sPropertyName) !== newValue) {
			aArguments.unshift(sPropertyName);
			this.setProperty.apply(this, aArguments);

			if (!this._bFirstRendering) {
				this._notifyParentOfChanges();
			}
		}

		return this;
	};

	ObjectPageHeader.prototype._applyObjectImageProperty = function (sPropertyName, aArguments) {
		var newValue = aArguments[0];

		if (this.getProperty(sPropertyName) !== newValue) {
			aArguments.unshift(sPropertyName);
			this.setProperty.apply(this, aArguments);
			this._destroyObjectImage();

			if (!this._bFirstRendering) {
				this._notifyParentOfChanges(true);
			}
		}

		return this;
	};

	ObjectPageHeader.prototype._setAggregationTooltip = function (sAggregationName, vTooltip) {
		var oAggregation = this.getAggregation(sAggregationName);

	   if (oAggregation) {
		   oAggregation.setTooltip(vTooltip);
	   }

	   return this;
	};

	ObjectPageHeader.prototype._setTitleSelectorTooltip = function(vTooltip) {
		if (vTooltip === null || vTooltip === undefined) {
			vTooltip = this.oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP");
		}
		this._setAggregationTooltip("_titleArrowIcon", vTooltip);
		this._setAggregationTooltip("_titleArrowIconCont", vTooltip);

		return this;
	};

	ObjectPageHeader.prototype.setHeaderDesign = function (sHeaderDesign) {
		this.setProperty("headerDesign", sHeaderDesign);
		if (this.getParent()) {
			this.getParent().invalidate(); // Force rerendering of ObjectPageLayout if the design change
		}
		return this;
	};

	ObjectPageHeader.prototype.setObjectTitle = function (sNewTitle) {

		var oParent = this.getParent(),
			sOldTitle = this.getProperty("objectTitle"),
			bChanged = sOldTitle !== sNewTitle;

		this._applyActionProperty("objectTitle", Array.prototype.slice.call(arguments));
		oParent && isFunction(oParent._updateAriaLabels) && oParent._updateAriaLabels();

		if (bChanged && this.mEventRegistry["_titleChange"]) {
			this.fireEvent("_titleChange", {
				"id": this.getId(),
				"name": "objectTitle",
				"oldValue": sOldTitle,
				"newValue": sNewTitle
			});
		}

		return this;
	};

	var aPropertiesToOverride = ["objectSubtitle", "showTitleSelector", "markLocked", "markFavorite", "markFlagged",
			"showMarkers", "showPlaceholder", "markChanges"],
		aObjectImageProperties = ["objectImageURI", "objectImageAlt", "objectImageDensityAware", "objectImageShape"];

	var fnGenerateSetterForAction = function (sPropertyName) {
		var sConvertedSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

		ObjectPageHeader.prototype[sConvertedSetterName] = function () {
			var aArgumentsPassedToTheProperty = Array.prototype.slice.call(arguments);
			this._applyActionProperty.call(this, sPropertyName, aArgumentsPassedToTheProperty);
			return this;
		};
	};

	var fnGenerateSetterForObjectImageProperties = function (sPropertyName) {
		var sConvertedSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

		ObjectPageHeader.prototype[sConvertedSetterName] = function () {
			var aArgumentsPassedToTheProperty = Array.prototype.slice.call(arguments);
			this._applyObjectImageProperty.call(this, sPropertyName, aArgumentsPassedToTheProperty);
			return this;
		};
	};

	var fnGenerateSetterProxy = function (sPropertyName, oSourceObject, oTargetObject) {
		var sConvertedSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

		oSourceObject[sConvertedSetterName] = function () {
			var aArgumentsPassedToTheProperty = Array.prototype.slice.call(arguments);
			aArgumentsPassedToTheProperty.unshift(sPropertyName);

			oTargetObject.setProperty.apply(oTargetObject, aArgumentsPassedToTheProperty);
			return this.setProperty.apply(this, aArgumentsPassedToTheProperty);
		};
	};

	aPropertiesToOverride.forEach(fnGenerateSetterForAction);
	aObjectImageProperties.forEach(fnGenerateSetterForObjectImageProperties);

	ObjectPageHeader.prototype._destroyObjectImage = function () {
		var sObjectImage = "_objectImage",
			oObjectImage = this.getAggregation(sObjectImage);

		if (oObjectImage) {
			oObjectImage.destroy();
			this.setAggregation(sObjectImage, null);
		}
	};

	ObjectPageHeader.prototype.onBeforeRendering = function () {
		var oSideBtn = this.getSideContentButton(),
			that = this;
		if (oSideBtn && !oSideBtn.getTooltip()) {
			oSideBtn.setTooltip(this.oLibraryResourceBundleOP.getText("TOOLTIP_OP_SHOW_SIDE_CONTENT"));
		}

		var aActions = this.getActions() || [];
		this._oOverflowActionSheet.removeAllButtons();

		// BCP: 1870085555 - Ensure all buttons from previous rendering are being destroyed
		this._resetActionSheetMap();

		//display overflow if there are more than 1 item or only 1 item and it is showing its text
		if (aActions.length > 1 || this._hasOneButtonShowText(aActions)) {
			//create responsive equivalents of the provided controls
			aActions.forEach(function (oAction) {
				// Set internal visibility for normal buttons like for ObjectPageHeaderActionButton
				if (oAction instanceof Button && !(oAction instanceof ObjectPageHeaderActionButton)) {

					oAction._bInternalVisible = oAction.getVisible();
					oAction._getInternalVisible = function () {
						return this._bInternalVisible;
					};
					oAction._setInternalVisible = function (bValue, bInvalidate) {
						this.$().toggle(bValue);
						if (bValue != this._bInternalVisible) {
							this._bInternalVisible = bValue;
							if (bInvalidate) {
								this.invalidate();
							}
						}
					};

					oAction.setVisible = function (bVisible) {
						oAction._setInternalVisible(bVisible, true);
						Button.prototype.setVisible.call(this, bVisible);
					};

					oAction.onAfterRendering = function () {
						if (!this._getInternalVisible()) {
							this.$().hide();
						}

						that._resizeIdentifierLineContainer();

					};
				}

				if (oAction instanceof Button && oAction.getVisible()) {
					var oActionSheetButton = this._createActionSheetButton(oAction);

					this._oActionSheetButtonMap[oAction.getId()] = oActionSheetButton; //store the originalId/reference for later use (adaptLayout)
					this._oOverflowActionSheet.addButton(oActionSheetButton);
					fnGenerateSetterProxy("text", oAction, oActionSheetButton);
					fnGenerateSetterProxy("icon", oAction, oActionSheetButton);
					fnGenerateSetterProxy("enabled", oAction, oActionSheetButton);
				}
			}, this);
		}
		this._oTitleArrowIcon.setVisible(this.getShowTitleSelector());
		this._oFavIcon.setVisible(this.getMarkFavorite());
		this._oFlagIcon.setVisible(this.getMarkFlagged());
		this._attachDetachActionButtonsHandler(false);
		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
			this._iResizeId = null;
		}
		this._bFirstRendering = false;
	};

	/**
	 * Destroys all created action sheet buttons contained in _oActionSheetButtonMap and empty the object
	 * @private
	 */
	ObjectPageHeader.prototype._resetActionSheetMap = function () {
		Object.keys(this._oActionSheetButtonMap).forEach(function (sButton) {
			this._oActionSheetButtonMap[sButton].destroy();
		}.bind(this));
		this._oActionSheetButtonMap = {};
	};

	/**
	 * "clone" the button provided by the app developer in order to create an equivalent for the actionsheet (displayed in overflowing scenarios)
	 * @param {*} oButton the button to copy
	 * @returns {sap.m.Button} the copied button
	 * @private
	 */
	ObjectPageHeader.prototype._createActionSheetButton = function (oButton) {
		return new Button({
			press: jQuery.proxy(this._onSeeMoreContentSelect, this),
			enabled: oButton.getEnabled(),
			text: oButton.getText(),
			icon: oButton.getIcon(),
			tooltip: oButton.getTooltip(),
			customData: new CustomData({
				key: "originalId",
				value: oButton.getId()
			})
		});
	};

	ObjectPageHeader.prototype._handleImageNotFoundError = function () {
		var oObjectImage = this._lazyLoadInternalAggregation("_objectImage"),
			oParent = this.getParent(),
			$context = oParent ? oParent.$() : this.$();

		if (this.getShowPlaceholder()) {
			/* The following two selectors affect both the HeaderTitle and HeaderContent */
			$context.find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").hide();
			$context.find(".sapUxAPObjectPageHeaderPlaceholder").removeClass("sapUxAPHidePlaceholder");
		} else {
			oObjectImage.addStyleClass("sapMNoImg");
		}
	};

	ObjectPageHeader.prototype._clearImageNotFoundHandler = function (){
		this._lazyLoadInternalAggregation("_objectImage").$().off("error");
	};

	ObjectPageHeader.prototype.onAfterRendering = function () {
		var $objectImage = this._lazyLoadInternalAggregation("_objectImage").$();
		this._adaptLayout();

		this._clearImageNotFoundHandler();
		$objectImage.error(this._handleImageNotFoundError.bind(this));

		if (!this.getObjectImageURI()){
			this._handleImageNotFoundError();
		}

		if (!this._iResizeId) {
			this._iResizeId = ResizeHandler.register(this, this._onHeaderResize.bind(this));
		}

		this._attachDetachActionButtonsHandler(true);
	};

	ObjectPageHeader.prototype._onHeaderResize = function (oEvent) {
		this._adaptLayout();
		if (this.getParent() && typeof this.getParent()._onUpdateHeaderTitleSize === "function") {
			this.getParent()._onUpdateHeaderTitleSize(oEvent);
		}
	};

	ObjectPageHeader.prototype._attachDetachActionButtonsHandler = function (bAttach) {
		var aActions = this.getActions() || [];
		if (aActions.length < 1) {
			return;
		}
		aActions.forEach(function (oAction) {
			if (oAction instanceof Button) {
				var oActionSheetButton = this._oActionSheetButtonMap[oAction.getId()];
				if (bAttach) {
					oAction.attachEvent("_change", this._adaptLayout, this);
					if (oActionSheetButton) {
						oActionSheetButton.attachEvent("_change", this._adaptOverflow, this);
					}
				} else {
					oAction.detachEvent("_change", this._adaptLayout, this);
					if (oActionSheetButton) {
						oActionSheetButton.detachEvent("_change", this._adaptOverflow, this);
					}
				}
			}
		}, this);
	};

	ObjectPageHeader.prototype._onSeeMoreContentSelect = function (oEvent) {
		var oPressedButton = oEvent.getSource(),
			oOriginalControl = sap.ui.getCore().byId(oPressedButton.data("originalId"));

		//forward press event
		if (oOriginalControl.firePress) {
			//provide parameters in case the handlers wants to know where was the event fired from
			oOriginalControl.firePress({
				overflowButtonId: this._oOverflowButton.getId(),
				bInOverflow: true
			});
		}
		this._oOverflowActionSheet.close();
	};

	ObjectPageHeader._actionImportanceMap = {
		"Low": 3,
		"Medium": 2,
		"High": 1
	};

	/**
	 * Actions custom sorter function
	 * @private
	 */
	ObjectPageHeader._sortActionsByImportance = function (oActionA, oActionB) {
		var sImportanceA = (oActionA instanceof ObjectPageHeaderActionButton) ? oActionA.getImportance() : Importance.High,
			sImportanceB = (oActionB instanceof ObjectPageHeaderActionButton) ? oActionB.getImportance() : Importance.High,
			iImportanceDifference = ObjectPageHeader._actionImportanceMap[sImportanceA] - ObjectPageHeader._actionImportanceMap[sImportanceB];

		if (iImportanceDifference === 0) {
			return oActionA.position - oActionB.position;
		}

		return iImportanceDifference;
	};

	ObjectPageHeader.prototype._hasOneButtonShowText = function (aActions) {
		var bOneButtonShowingText = false;

		if (aActions.length !== 1) {
			return bOneButtonShowingText;
		}

		if (aActions[0] instanceof ObjectPageHeaderActionButton) {
			bOneButtonShowingText = (!aActions[0].getHideText() && aActions[0].getText() != "" );
		} else if (aActions[0] instanceof Button) {
			bOneButtonShowingText = (aActions[0].getText() != "" );
		}

		return bOneButtonShowingText;
	};

	/*************************************************************************************
	 * Adapting ObjectPage image, title/subtitle container and actions container
	 ************************************************************************************/

	/**
	 * Adapt title/subtitle container and action buttons and overflow button
	 * @private
	 */
	ObjectPageHeader.prototype._adaptLayout = function (oEvent) {

		this._adaptLayoutForDomElement(null, oEvent);
	};

	/**
	 * Adapts the layout of the given headerTitle domElement
	 *
	 * @param {object} $headerDomRef The reference to the header dom element
	 * @param {object} oEvent The event of child-element that brought the need to adapt the headerTitle layout
	 *
	 * @private
	 */
	ObjectPageHeader.prototype._adaptLayoutForDomElement = function ($headerDomRef, oEvent) {

		var $identifierLine = this._findById($headerDomRef, "identifierLine"),
			iIdentifierContWidth = $identifierLine.width(),
			iActionsWidth = this._getActionsWidth(), // the width off all actions without hidden one
			iActionsContProportion = iActionsWidth / iIdentifierContWidth, // the percentage(proportion) that action buttons take from the available space
			iAvailableSpaceForActions = this._iAvailablePercentageForActions * iIdentifierContWidth,
			$overflowButton = this._oOverflowButton.$(),
			$actions = this._findById($headerDomRef, "actions"),
			$actionButtons = $actions.find(".sapMBtn").not(".sapUxAPObjectPageHeaderExpandButton");

		if (iIdentifierContWidth === 0) {
			return;
		}

		if (iActionsContProportion > this._iAvailablePercentageForActions) {
			this._adaptActions(iAvailableSpaceForActions);
		} else if (oEvent && oEvent.getSource() instanceof ObjectPageHeaderActionButton) {
			oEvent.getSource()._setInternalVisible(true);
		}

		if (Device.system.phone) {
			// revert the visibility css style only for the actions whose style was modified by _getActionsWidth
			this.getActions().forEach(function (oAction) {
				if (oAction instanceof Button) {
					oAction.$().css("visibility", "visible");
				}
			});
		}

		// verify overflow button visibility
		if ($actionButtons.filter(":visible").length === $actionButtons.length) {
			$overflowButton.hide();
		}

		this._adaptObjectPageHeaderIndentifierLine($headerDomRef);
	};

	ObjectPageHeader.prototype._adaptLayoutDelayed = function () {
		if (this._adaptLayoutTimeout) {
			clearTimeout(this._adaptLayoutTimeout);
		}
		this._adaptLayoutTimeout = setTimeout(function() {
			this._adaptLayoutTimeout = null;
			this._adaptLayout();
		}.bind(this), 0);
	};

	/**
	 * Adapt title/subtitle container and action buttons
	 * @private
	 */
	ObjectPageHeader.prototype._adaptObjectPageHeaderIndentifierLine = function ($domRef) {

		var $identifierLine = this._findById($domRef, "identifierLine"),
			$title = $identifierLine.find(".sapUxAPObjectPageHeaderIdentifierTitle"),
			$subtitle = this._findById($domRef, "subtitle"),
			$innerTitle = this._findById($domRef, "innerTitle"),
			iSubtitleBottom,
			iTitleBottom,
			sOriginalHeight = null,
			iPixelTolerance = this.$().parents().hasClass('sapUiSizeCompact') ? 7 : 3;  // the tolerance of pixels from which we can tell that the title and subtitle are on the same row

		this._adaptObjectPageHeaderTitle($title);

		if ($subtitle.length) {
			if ($subtitle.hasClass("sapOPHSubtitleBlock")) {

				// save the original height and
				// set the height of the wrapping div to a constant value before temporarily changing its inner state
				// to avoid flickering (as the temporary inner change will affect its height as well)
				sOriginalHeight = $identifierLine.get(0).style.height;
				$identifierLine.css("height", $identifierLine.height());

				// temporarily toggle the default subtitle display
				$subtitle.removeClass("sapOPHSubtitleBlock");
			}

			iSubtitleBottom = $subtitle.outerHeight() + $subtitle.position().top;
			iTitleBottom = $innerTitle.outerHeight() + $innerTitle.position().top;
			// check if subtitle is below the title and add it a display block class
			if (Math.abs(iSubtitleBottom - iTitleBottom) > iPixelTolerance) {
				$subtitle.addClass("sapOPHSubtitleBlock");
			}

			if (sOriginalHeight !== null) { // restore the original height
				$identifierLine.get(0).style.height = sOriginalHeight;
			}
		}

		this._resizeIdentifierLineContainer($domRef);
	};

	ObjectPageHeader.prototype._resizeIdentifierLineContainer = function ($domRef) {
		var $identifierLineContainer = this._findById($domRef, "identifierLineContainer"),
			$actions = this._findById($domRef, "actions"),
			$identifierLine = this._findById($domRef, "identifierLine"),
			iIdentifierContWidth = $identifierLine.width(),
			$imageContainer = $domRef ? $domRef.find(".sapUxAPObjectPageHeaderObjectImageContainer") : this.$().find(".sapUxAPObjectPageHeaderObjectImageContainer"),
			iActionsAndImageWidth = $actions.width() + $imageContainer.width();

			$identifierLineContainer.width((0.95 - (iActionsAndImageWidth / iIdentifierContWidth)) * 100 + "%");
	};

	/**
	 * Adapt title text parts
	 * @private
	 */
	ObjectPageHeader.prototype._adaptObjectPageHeaderTitle = function ($titleDom) {

		var iTitleWidth = $titleDom.width(),
			aTitleTextParts = $titleDom.find(".sapUxAPObjectPageHeaderTitleText"),
			iTitleTextParts = aTitleTextParts.length,
			$nextPart;

		for (var i = 0; i < iTitleTextParts; i++) {
			$nextPart = jQuery(aTitleTextParts.get(i));
			$nextPart.toggleClass("sapUxAPObjectPageHeaderTitleTextRestrictedWidth", false); // restore default
			if ($nextPart.width() > iTitleWidth) {
				// we constrain only if needed (not by default)
				// because of implications that come from change of "display" property
				$nextPart.toggleClass("sapUxAPObjectPageHeaderTitleTextRestrictedWidth", true);
			}
		}
	};

	/**
	 * Show or hide action buttons depending on how much space is available
	 * @private
	 */
	ObjectPageHeader.prototype._adaptActions = function (iAvailableSpaceForActions) {
		var bMobileScenario = library.Utilities.isPhoneScenario(this._getCurrentMediaContainerRange()) || Device.system.phone,
			$_oOverflowButton = this._oOverflowButton.$(),
			iVisibleActionsWidth = $_oOverflowButton.show().width(), // overflowButton is now visible
			aActions = this.getActions(),
			iActionsLength = aActions.length,
			oActionSheetButton;

		for (var i = 0; i < iActionsLength; i++) {
			aActions[i].position = i;
		}
		aActions.sort(ObjectPageHeader._sortActionsByImportance);

		aActions.forEach(function (oAction) {
			oActionSheetButton = this._oActionSheetButtonMap[oAction.getId()];

			//separators and non sap.m.Button or not visible buttons have no equivalent in the overflow
			if (oActionSheetButton) {
				iVisibleActionsWidth += oAction.$().width();
				if (iAvailableSpaceForActions > iVisibleActionsWidth && !bMobileScenario) {
					this._setActionButtonVisibility(oAction, true);
					$_oOverflowButton.hide();
				} else {
					this._setActionButtonVisibility(oAction, false);
					$_oOverflowButton.show();
				}
			}
		}, this);
	};

	/**
	 * Show or hide the overflow button and action sheet according to visible buttons inside
	 * @private
	 */
	ObjectPageHeader.prototype._adaptOverflow = function () {
		var aActionSheetButtons = this._oOverflowActionSheet.getButtons();

		var bHasVisible = aActionSheetButtons.some(function (oActionSheetButton) {
			return oActionSheetButton.getVisible();
		});

		this._oOverflowButton.$().toggle(bHasVisible);
	};

	/**
	 * Set visibility of action button and the button in action sheet
	 * @private
	 */
	ObjectPageHeader.prototype._setActionButtonVisibility = function (oAction, bVisible) {
		var oActionSheetButton = this._oActionSheetButtonMap[oAction.getId()];

		//separators and non sap.m.Button or not visible buttons have no equivalent in the overflow
		if (oActionSheetButton) {
			if (oAction.getVisible()) {
				oAction._setInternalVisible(bVisible);
				oActionSheetButton.setVisible(!bVisible);
			} else {
				oActionSheetButton.setVisible(false);
			}
		}
	};

	/**
	 * The sum of widths(+ margins) of all action buttons
	 * @private
	 */
	ObjectPageHeader.prototype._getActionsWidth = function () {
		var iWidthSum = 0;

		this.getActions().forEach(function (oAction) {
			if (oAction instanceof Button) {
				oAction.$().show();

				if (Device.system.phone) {
					oAction.$().css("visibility", "hidden");
				}

				iWidthSum += oAction.$().outerWidth(true);
			}
		});

		return iWidthSum;
	};

	/**
	 * Finds the sub-element with the given <code>sId</code> contained
	 * within <code>$headerDomRef</code> (if <code>$headerDomRef</code> is supplied) or
	 * globally, prepended with own id (if <code>$headerDomRef</code> is not supplied)
	 *
	 * @param {object} jQuery reference to the header dom element
	 * @param {string} the id of the element to be found
	 *
	 * Returns the jQuery reference to the dom element with the given sId
	 * @private
	 */
	ObjectPageHeader.prototype._findById = function ($headerDomRef, sId) {
		var sEscapedId;

		if (!sId) {
			return null;
		}

		if ($headerDomRef) {
			sId = this.getId() + '-' + sId;
			sEscapedId = "#" + sId.replace(/(:|\.)/g,'\\$1');
			return $headerDomRef.find(sEscapedId);
		}

		return this.$(sId); //if no dom reference then search within its own id-space (prepended with own id)
	};

	/**
	 * Determines whether to render the <code>breadcrumbs</code> or the <code>breadCrumbsLinks</code> aggregation.
	 * If <code>breadcrumbs</code> is set, the <code>breadCrumbsLinks</code> is omitted.
	 * @private
	 */
	ObjectPageHeader.prototype._getBreadcrumbsAggregation = function () {
		var oBreadCrumbs = this.getBreadcrumbs(),
		oBreadCrumbsLegacy = this._lazyLoadInternalAggregation('_breadCrumbs', true);

		return oBreadCrumbs
			|| ((oBreadCrumbsLegacy && oBreadCrumbsLegacy.getLinks().length) ? oBreadCrumbsLegacy : null);
	};

	/*************************************************************************************/

	/**
	 * Notifies the parent control, when <code>sap.uxap.ObjectPageHeader</code> changes.
	 * @param {boolean} bIsObjectImageChange Whether the image-related property was changed
	 * @private
	 */
	ObjectPageHeader.prototype._notifyParentOfChanges = function (bIsObjectImageChange) {
		var oParent = this.getParent();

		if (oParent && typeof oParent._headerTitleChangeHandler === "function") {
			oParent._headerTitleChangeHandler(bIsObjectImageChange);
		}
	};

	ObjectPageHeader.prototype.setTitleSelectorTooltip = function (vTooltip) {
		this._setTitleSelectorTooltip(vTooltip);

		this.setAggregation("titleSelectorTooltip", vTooltip, true);

		return this;
	};

	ObjectPageHeader.prototype.destroyTitleSelectorTooltip = function () {
		this._setTitleSelectorTooltip(null);

		this.destroyAggregation("titleSelectorTooltip", true);

		return this;
	};

	ObjectPageHeader.prototype.exit = function () {
		this._clearImageNotFoundHandler();
		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
			this._iResizeId = null;
		}

		// BCP: 1870085555 - Ensure all action sheet buttons are destroyed
		this._resetActionSheetMap();
	};

	/* Fiori 2.0 adaptation */

	ObjectPageHeader.prototype.setNavigationBar = function (oBar) {

		this.setAggregation("navigationBar", oBar);

		if (oBar && this.mEventRegistry["_adaptableContentChange"]) {
			this.fireEvent("_adaptableContentChange", {
				"parent": this,
				"adaptableContent": oBar
			});
		}

		return this;
	};

	ObjectPageHeader.prototype._getAdaptableContent = function () {
		return this.getNavigationBar();
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface.
	 * @returns {*}
	 */
	ObjectPageHeader.prototype.isDynamic = function () {
		return false;
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @returns {sap.uxap.ObjectPageHeaderContent}
	 */
	ObjectPageHeader.prototype.getCompatibleHeaderContentClass = function () {
		return ObjectPageHeaderContent;
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @returns {boolean}
	 */
	ObjectPageHeader.prototype.supportsToggleHeaderOnTitleClick = function () {
		return false;
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @returns {boolean}
	 */
	ObjectPageHeader.prototype.supportsTitleInHeaderContent = function () {
		return true;
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @returns {boolean}
	 */
	ObjectPageHeader.prototype.supportsAdaptLayoutForDomElement = function () {
		return true;
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @returns {boolean}
	 */
	ObjectPageHeader.prototype.supportsBackgroundDesign = function () {
		return false;
	};


	/**
	 * Returns the text that represents the title of the page.
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 */
	ObjectPageHeader.prototype.getTitleText = function () {
		return this.getObjectTitle();
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 */
	ObjectPageHeader.prototype.snap = function () {
		this._adaptLayout();
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 */
	ObjectPageHeader.prototype.unSnap = function () {
		this._adaptLayout();
	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @param {boolean} bToggle
	 * @private
	 */
	ObjectPageHeader.prototype._toggleExpandButton = function (bToggle) {

	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @param {boolean} bValue
	 * @private
	 */
	ObjectPageHeader.prototype._setShowExpandButton = function (bValue) {

	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @private
	 */
	ObjectPageHeader.prototype._focusExpandButton = function () {

	};

	/**
	 * Required by the {@link sap.uxap.IHeaderTitle} interface
	 * @param {boolean} bFocusable
	 * @private
	 */
	ObjectPageHeader.prototype._toggleFocusableState = function (bFocusable) {

	};

	return ObjectPageHeader;
});