/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeader.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/CustomData",
	"sap/ui/Device",
	"./BreadCrumbs",
	"./ObjectPageHeaderActionButton",
	"sap/ui/core/ResizeHandler",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/ActionSheet",
	"sap/m/Image",
	"sap/ui/core/Icon",
	"./library"
], function (Control, IconPool, CustomData, Device, BreadCrumbs, ObjectPageHeaderActionButton,
			 ResizeHandler, Text, Button, ActionSheet, Image, Icon, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageHeader.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectPageHeader represents the static part of an Object page header.
	 * Typically used to display the basic information about a business object, such as title/description/picture, as well as a list of common actions.
	 * @extends sap.ui.core.Control
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
			properties: {

				/**
				 * The URL of the image, representing the business object
				 */
				objectImageURI: {type: "string", defaultValue: null},

				/**
				 * The text to be used for the Alt attribute of the image, supplied via the objectImageURI property
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
					defaultValue: sap.uxap.ObjectPageHeaderPictureShape.Square
				},

				/**
				 * Determines whether the icon should always be visible or if it should be visible only when scrolling.
				 */
				isObjectIconAlwaysVisible: {type: "boolean", defaultValue: false},

				/**
				 * Determines whether the title should always be visible or if it should be visible only when scrolling.
				 */
				isObjectTitleAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the subtitle should always be visible or if it should be visible only when scrolling.
				 */
				isObjectSubtitleAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the action buttons should always be visible or if they should be visible only when scrolling.
				 */
				isActionAreaAlwaysVisible: {type: "boolean", defaultValue: true},

				/**
				 * Determines the design of the header - Light or Dark
				 */
				headerDesign: {
					type: "sap.uxap.ObjectPageHeaderDesign",
					defaultValue: sap.uxap.ObjectPageHeaderDesign.Light
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
				showPlaceholder: {type: "boolean", group: "Misc", defaultValue: false}
			},
			defaultAggregation: "actions",
			aggregations: {

				/**
				 *
				 * Internal aggregation for the BreadCrumbs in the header.
				 */
				_breadCrumbs: {type: "sap.uxap.BreadCrumbs", multiple: false, visibility: "hidden"},

				/**
				 *
				 * A list of all the active link elements in the BreadCrumbs control.
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
				_lockIconCont: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_lockIcon: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_titleArrowIconCont: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_titleArrowIcon: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_favIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_flagIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				_overflowActionSheet: {type: "sap.m.ActionSheet", multiple: false, visibility: "hidden"},

				/**
				 *
				 * An instance of sap.uxap.AnchorBar to be embedded in the header
				 */
				navigationBar: {type: "sap.m.Bar", multiple: false},

				/**
				 *
				 * List of actions that will be displayed in the header.
				 * You can use ObjectPageHeaderActionButton controls to achieve a different visual representation of the action buttons in the action bar and the action sheet (overflow menu).
				 * You can use ObjectPageHeaderLayoutData to display a visual separator.
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"}
			},
			events: {

				/**
				 * The event is fired when the objectPage header title selector (down-arrow) is pressed
				 */
				titleSelectorPress: {
					parameters: {

						/**
						 * Dom reference of the title item's icon to be used for positioning.
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
						 * Dom reference of the lock item's icon to be used for positioning.
						 */
						domRef: {type: "string"}
					}
				}
			}
		}
	});

	ObjectPageHeader.prototype._iAvailablePercentageForActions = 0.3;

	ObjectPageHeader.prototype.init = function () {
		if (!this.oLibraryResourceBundle) {
			this.oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"); // get resource translation bundle
		}

		// Overflow button
		this._oOverflowActionSheet = this._getInternalAggregation("_overflowActionSheet");
		this._oOverflowButton = this._getInternalAggregation("_overflowButton").attachPress(this._handleOverflowButtonPress, this);
		this._oExpandButton = this._getInternalAggregation("_expandButton");
		this._oActionSheetButtonMap = {};
		this._oFlagIcon = this._getInternalAggregation("_flagIcon");
		this._oFavIcon = this._getInternalAggregation("_favIcon");
		this._oTitleArrowIcon = this._getInternalAggregation("_titleArrowIcon").attachPress(this._handleArrowPress, this);
		this._oTitleArrowIconCont = this._getInternalAggregation("_titleArrowIconCont").attachPress(this._handleArrowPress, this);
		this._oLockIcon = this._getInternalAggregation("_lockIcon").attachPress(this._handleLockPress, this);
		this._oLockIconCont = this._getInternalAggregation("_lockIconCont").attachPress(this._handleLockPress, this);
	};

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

	ObjectPageHeader._internalAggregationFactory = {
		"_objectImage": function (oParent) {
			var oObjectImage,
				sObjectImageURI = oParent.getObjectImageURI();

			if (sObjectImageURI.indexOf("sap-icon://") == 0) {
				oObjectImage = new Icon();
			} else {
				oObjectImage = new Image({
					densityAware: oParent.getObjectImageDensityAware(),
					alt: oParent.getObjectImageAlt(),
					decorative: false
				});
			}

			oObjectImage.setSrc(sObjectImageURI);
			oObjectImage.addStyleClass("sapUxAPObjectPageHeaderObjectImage");
			return oObjectImage;
		},
		"_overflowActionSheet": function () {
			return new ActionSheet({placement: sap.m.PlacementType.Bottom});
		},
		"_lockIconCont": function (oParent) {
			return this._getButton(oParent, "sap-icon://locked", "lock-cont");
		},
		"_breadCrumbs": function (oParent) {
			return new BreadCrumbs({
				links: oParent.getAggregation("breadCrumbLinks"),
				currentLocation: new Text({
					text: oParent.getProperty("objectTitle")
				}),
				showCurrentLocation: false
			});
		},
		"_lockIcon": function (oParent) {
			return this._getButton(oParent, "sap-icon://locked", "lock");
		},
		"_titleArrowIconCont": function (oParent) {
			return this._getButton(oParent, "sap-icon://arrow-down", "titleArrow-cont");
		},
		"_titleArrowIcon": function (parent) {
			return this._getButton(parent, "sap-icon://arrow-down", "titleArrow");
		},
		"_favIcon": function (oParent) {
			return this._getIcon(oParent, "favorite");
		},
		"_flagIcon": function (oParent) {
			return this._getIcon(oParent, "flag");
		},
		"_overflowButton": function (oParent) {
			return this._getButton(oParent, "sap-icon://overflow", "overflow");
		},
		"_expandButton": function (oParent) {
			return this._getButton(oParent, "sap-icon://slim-arrow-down", "expand");
		},
		_getIcon: function (oParent, sIcon) {
			return IconPool.createControlByURI({
				id: this._getParentAugmentedId(oParent, sIcon),
				src: IconPool.getIconURI(sIcon),
				visible: false
			});
		},
		_getButton: function (oParent, sIcon, sChildSignature) {
			return new Button({
				id: this._getParentAugmentedId(oParent, sChildSignature),
				icon: sIcon,
				type: sap.m.ButtonType.Transparent
			});
		},
		_getParentAugmentedId: function (oParent, sChildSignature) {
			return oParent.getId() + "-" + sChildSignature;
		}
	};


	ObjectPageHeader.prototype._getInternalAggregation = function (sAggregationName) {
		if (!this.getAggregation(sAggregationName)) {
			this.setAggregation(sAggregationName, ObjectPageHeader._internalAggregationFactory[sAggregationName](this));
		}
		return this.getAggregation(sAggregationName);
	};

	ObjectPageHeader.prototype._applyActionProperty = function (sPropertyName, aArguments) {
		var newValue = aArguments[0];

		if (this.getProperty(sPropertyName) !== newValue) {
			aArguments.unshift(sPropertyName);
			this.setProperty.apply(this, aArguments);
			this._notifyParentOfChanges();
		}

		return this;
	};

	ObjectPageHeader.prototype._applyObjectImageProperty = function (sPropertyName, aArguments) {
		var newValue = aArguments[0];

		if (this.getProperty(sPropertyName) !== newValue) {
			aArguments.unshift(sPropertyName);
			this.setProperty.apply(this, aArguments);
			this._destroyObjectImage();
			this._notifyParentOfChanges();
		}

		return this;
	};

	ObjectPageHeader.prototype._proxyMethodToBreadCrumbControl = function (sFuncName, aArguments) {
		var oBreadCrumbs = this._getInternalAggregation("_breadCrumbs");
		return oBreadCrumbs[sFuncName].apply(oBreadCrumbs, aArguments);
	};

	ObjectPageHeader.prototype.setHeaderDesign = function (sHeaderDesign) {
		this.setProperty("headerDesign", sHeaderDesign);
		if (this.getParent()) {
			this.getParent().invalidate(); // Force rerendering of ObjectPageLayout if the design change
		}
		return this;
	};

	ObjectPageHeader.prototype._shiftHeaderTitle = function () {

		//set the correct width for the scrollBar to be visible
		var fRight = 0.0;

		if (Device.system.desktop) {
			fRight = jQuery.position.scrollbarWidth();
		}

		if (fRight > 0) {
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				this.$().parent().css("left", fRight + "px");
			} else {
				this.$().parent().css("right", fRight + "px");
			}
		}
	};

	/**
	 * get current title and if it is different from the new one rerender the HeaderContent
	 * @param {string} sTitle title string
	 * @return {*} this
	 */
	ObjectPageHeader.prototype.setObjectTitle = function (sTitle) {
		var oBreadcrumbs = this._getInternalAggregation("_breadCrumbs");
		if (oBreadcrumbs) {
			oBreadcrumbs.getCurrentLocation().setText(sTitle);
		}

		return this._applyActionProperty("objectTitle", Array.prototype.slice.call(arguments));
	};

	var aPropertiesToOverride = ["objectSubtitle", "showTitleSelector", "markLocked", "markFavorite", "markFlagged",
			"showMarkers", "showPlaceholder"],
		aObjectImageProperties = ["objectImageURI", "objectImageAlt", "objectImageDensityAware", "objectImageShape"];

	var fnGenerateSetter = function (sPropertyName) {
		var sConvertedSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

		ObjectPageHeader.prototype[sConvertedSetterName] = function () {
			var aArgumentsPassedToTheProperty = Array.prototype.slice.call(arguments);
			this._applyActionProperty.call(this, sPropertyName, aArgumentsPassedToTheProperty);
		};
	};

	var fnGenerateSetterForObjectImageProperties = function (sPropertyName) {
		var sConvertedSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

		ObjectPageHeader.prototype[sConvertedSetterName] = function () {
			var aArgumentsPassedToTheProperty = Array.prototype.slice.call(arguments);
			this._applyObjectImageProperty.call(this, sPropertyName, aArgumentsPassedToTheProperty);
		};
	};

	aPropertiesToOverride.forEach(fnGenerateSetter);
	aObjectImageProperties.forEach(fnGenerateSetterForObjectImageProperties);

	ObjectPageHeader.prototype.getBreadCrumbsLinks = function () {
		return this._getInternalAggregation("_breadCrumbs").getLinks();
	};

	ObjectPageHeader.prototype.addBreadCrumbLink = function () {
		return this._proxyMethodToBreadCrumbControl("addLink", arguments);
	};

	ObjectPageHeader.prototype.indexOfBreadCrumbLink = function () {
		return this._proxyMethodToBreadCrumbControl("indexOfLink", arguments);
	};

	ObjectPageHeader.prototype.insertBreadCrumbLink = function () {
		return this._proxyMethodToBreadCrumbControl("insertLink", arguments);
	};

	ObjectPageHeader.prototype.removeBreadCrumbLink = function () {
		return this._proxyMethodToBreadCrumbControl("removeLink", arguments);
	};

	ObjectPageHeader.prototype.removeAllBreadCrumbsLinks = function () {
		return this._proxyMethodToBreadCrumbControl("removeAllLinks", arguments);
	};

	ObjectPageHeader.prototype.destroyBreadCrumbsLinks = function () {
		return this._proxyMethodToBreadCrumbControl("destroyLinks", arguments);
	};

	ObjectPageHeader.prototype._destroyObjectImage = function () {
		var sObjectImage = "_objectImage",
			oObjectImage = this.getAggregation(sObjectImage);

		if (oObjectImage) {
			oObjectImage.destroy();
			this.setAggregation(sObjectImage, null);
		}
	};

	ObjectPageHeader.prototype.onBeforeRendering = function () {
		if (this.getShowPlaceholder()) {
			this._oPlaceholder = IconPool.createControlByURI({
				src: IconPool.getIconURI("picture"),
				visible: true
			});
		}

		var aActions = this.getActions() || [];
		this._oOverflowActionSheet.removeAllButtons();
		this._oActionSheetButtonMap = {};

		//display overflow if there are more than 1 item or only 1 item and it is showing its text
		if (aActions.length > 1 || this._hasOneButtonShowText(aActions)) {
			//create responsive equivalents of the provided controls
			jQuery.each(aActions, jQuery.proxy(function (iIndex, oAction) {
				// Force the design of the button to transparent
				if (oAction instanceof Button && oAction.getVisible()) {
					if (oAction instanceof Button && (oAction.getType() === "Default" || oAction.getType() === "Unstyled")) {
						oAction.setProperty("type", sap.m.ButtonType.Transparent, false);
					}

					var oActionSheetButton = this._createActionSheetButton(oAction);

					this._oActionSheetButtonMap[oAction.getId()] = oActionSheetButton; //store the originalId/reference for later use (adaptLayout)

					this._oOverflowActionSheet.addButton(oActionSheetButton);
				}
			}, this));
		}
		this._oTitleArrowIcon.setVisible(this.getShowTitleSelector());
		this._oFavIcon.setVisible(this.getMarkFavorite());
		this._oFlagIcon.setVisible(this.getMarkFlagged());

	};

	/**
	 * "clone" the button provided by the app developer in order to create an equivalent for the actionsheet (displayed in overflowing scenarios)
	 * @param {*} oButton the button to copy
	 * @returns {sap.m.Button} the copied button
	 * @private
	 */
	ObjectPageHeader.prototype._createActionSheetButton = function (oButton) {

		//copy binding if present
		var oCopy = new Button({
			press: jQuery.proxy(this._onSeeMoreContentSelect, this),
			customData: new CustomData({
				key: "originalId",
				value: oButton.getId()
			})
		});

		//carry property & binding on text
		var oTextBinding = oButton.getBindingInfo("text"),
			oIconBinding = oButton.getBindingInfo("icon"),
			sModelName;

		if (oTextBinding && oTextBinding.parts && oTextBinding.parts.length > 0) {
			sModelName = oTextBinding.parts[0].model;

			//copy binding information
			oCopy.bindProperty("text", {
				path: oTextBinding.parts[0].path,
				model: sModelName,
				formatter: oTextBinding.formatter
			});

			//handle relative binding scenarios
			oCopy.setBindingContext(oButton.getBindingContext(sModelName), sModelName);
			oCopy.setModel(oButton.getModel(sModelName), sModelName);
		} else {
			oCopy.setText(oButton.getText());
		}

		//carry property & binding on icon
		if (oIconBinding && oIconBinding.parts && oIconBinding.parts.length > 0) {
			sModelName = oIconBinding.parts[0].model;

			//copy binding information
			oCopy.bindProperty("icon", {
				path: oIconBinding.parts[0].path,
				model: sModelName,
				formatter: oIconBinding.formatter
			});

			//handle relative binding scenarios
			oCopy.setBindingContext(oButton.getBindingContext(sModelName), sModelName);
			oCopy.setModel(oButton.getModel(sModelName), sModelName);
		} else {
			oCopy.setIcon(oButton.getIcon());
		}

		return oCopy;
	};

	ObjectPageHeader.prototype.onAfterRendering = function () {

		this._adaptLayout();

		if (this.getShowPlaceholder()) {
			jQuery(".sapUxAPObjectPageHeaderObjectImage").off("error").error(function () {
				jQuery(this).hide();
				jQuery(".sapUxAPObjectPageHeaderPlaceholder").removeClass("sapUxAPHidePlaceholder");
			});
		} else {
			jQuery(".sapUxAPObjectPageHeaderObjectImage").off("error").error(function () {
				jQuery(this).addClass("sapMNoImg");
			});
		}

		if (!this._iResizeId) {
			this._iResizeId = ResizeHandler.register(this, this._adaptLayout.bind(this));
		}
		this._shiftHeaderTitle();
	};

	ObjectPageHeader.prototype._onSeeMoreContentSelect = function (oEvent) {
		var oPressedButton = oEvent.getSource(),
			oOriginalControl = sap.ui.getCore().byId(oPressedButton.data("originalId"));

		//forward press event
		if (oOriginalControl.firePress) {
			//provide parameters in case the handlers wants to know where was the event fired from
			oOriginalControl.firePress({
				overflowButtonId: this._oOverflowButton.getId()
			});
		}
		this._oOverflowActionSheet.close();
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
	ObjectPageHeader.prototype._adaptLayout = function () {
		var iIdentifierContWidth = this.$("identifierLine").width(),
			iActionsWidth = this._getActionsWidth(), // the width off all actions without hidden one
			iActionsContProportion = iActionsWidth / iIdentifierContWidth, // the percentage(proportion) that action buttons take from the available space
			iAvailableSpaceForActions = this._iAvailablePercentageForActions * iIdentifierContWidth;

		if (iActionsContProportion > this._iAvailablePercentageForActions) {
			this._adaptActions(iAvailableSpaceForActions);
		} else {
			this._oOverflowButton.$().hide();
		}

		this.$("actions").find(".sapMBtn").not(".sapUxAPObjectPageHeaderExpandButton").css("visibility", "visible");
		this._adaptObjectPageHeaderIndentifierLine();
	};

	/**
	 * Adapt title/subtitle container and action buttons
	 * @private
	 */
	ObjectPageHeader.prototype._adaptObjectPageHeaderIndentifierLine = function () {
		var iIdentifierContWidth = this.$("identifierLine").width(),
			$subtitle = this.$("subtitle"),
			iSubtitleBottom,
			iTitleBottom,
			iActionsAndImageWidth = this.$("actions").width() + this.$().find(".sapUxAPObjectPageHeaderObjectImageContainer").width(),
			iPixelTolerance = 3; // the tolerance of pixels from which we can tell that the title and subtitle are on the same row

		if ($subtitle.length) {
			if ($subtitle.hasClass("sapOPHSubtitleBlock")) {
				$subtitle.removeClass("sapOPHSubtitleBlock");
			}

			iSubtitleBottom = $subtitle.outerHeight() + $subtitle.position().top;
			iTitleBottom = this.$("innerTitle").outerHeight() + this.$("innerTitle").position().top;
			// check if subtitle is below the title and add it a display block class
			if (Math.abs(iSubtitleBottom - iTitleBottom) > iPixelTolerance) {
				$subtitle.addClass("sapOPHSubtitleBlock");
			}
		}

		this.$("identifierLineContainer").width((0.95 - (iActionsAndImageWidth / iIdentifierContWidth)) * 100 + "%");
	};

	/**
	 * Show or hide action buttons depending on how much space is available
	 * @private
	 */
	ObjectPageHeader.prototype._adaptActions = function (iAvailableSpaceForActions) {
		var bMobileScenario = jQuery("html").hasClass("sapUiMedia-Std-Phone") || Device.system.phone,
			iVisibleActionsWidth = this._oOverflowButton.$().show().width(),
			oActionSheetButton;

		this.getActions().forEach(function (oAction) {
			oActionSheetButton = this._oActionSheetButtonMap[oAction.getId()];

			//separators and non sap.m.Button or not visible buttons have no equivalent in the overflow
			if (oActionSheetButton) {
				iVisibleActionsWidth += oAction.$().width();

				if (iAvailableSpaceForActions > iVisibleActionsWidth && !bMobileScenario) {
					oActionSheetButton.setVisible(false);
				} else {
					this._setActionButtonVisibility(oAction, false);
				}
			}
		}, this);
	};

	/**
	 * Set visibility of action button and the button in action sheet
	 * @private
	 */
	ObjectPageHeader.prototype._setActionButtonVisibility = function (oAction, bVisible) {
		var oActionSheetButton = this._oActionSheetButtonMap[oAction.getId()];

		//separators and non sap.m.Button or not visible buttons have no equivalent in the overflow
		if (oActionSheetButton) {
			if (bVisible) {
				oAction.$().show();
			} else {
				oAction.$().hide();
			}
			oActionSheetButton.setVisible(!bVisible);
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
				oAction.$().css("visibility", "hidden");

				iWidthSum += oAction.$().outerWidth(true);
			}
		});

		return iWidthSum;
	};

	/*************************************************************************************/

	/**
	 * rerender the title in the ContentHeader if something in it is changed
	 * @private
	 */
	ObjectPageHeader.prototype._notifyParentOfChanges = function () {
		if (this.getParent() && typeof this.getParent()._headerTitleChangeHandler === "function") {
			this.getParent()._headerTitleChangeHandler();
		}
	};

	/**
	 * check if the ActionBar has padding on top, if not in case of rerendering of the control it has to be removed
	 * @returns {boolean}
	 * @private
	 */
	ObjectPageHeader.prototype._getActionsPaddingStatus = function () {
		return this.$("actions").hasClass("sapUxAPObjectPageHeaderIdentifierActionsNoPadding");
	};

	ObjectPageHeader.prototype._setActionsPaddingStatus = function (bShow) {
		return this.$("actions").toggleClass("sapUxAPObjectPageHeaderIdentifierActionsNoPadding", bShow);
	};

	ObjectPageHeader.prototype.exit = function () {
		jQuery(".sapUxAPObjectPageHeaderObjectImage").off("error");
		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
		}
	};

	return ObjectPageHeader;
});
