/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarHelpers._OverflowToolbarAssociativeActionSheet.
sap.ui.define(['jquery.sap.global', './Dialog', './Popover', './library', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation', 'sap/m/ActionSheet', 'sap/m/ActionSheetRenderer'],
	function(jQuery, Dialog, Popover, library, Control, ItemNavigation, ActionSheet, ActionSheetRenderer) {
	"use strict";



	/**
	 * Constructor for a new OverflowToolbarAssociativeActionSheet.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * OverflowToolbarAssociativeActionSheet is a version of ActionSheet that uses an association in addition to the aggregation
	 * @extends sap.ui.core.ActionSheet
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.28
	 * @alias sap.m.OverflowToolbarHelpers._OverflowToolbarAssociativeActionSheet
	 */
	var OverflowToolbarAssociativeActionSheet = ActionSheet.extend("sap.m._overflowToolbarHelpers.OverflowToolbarAssociativeActionSheet", /** @lends sap.m._overflowToolbarHelpers.OverflowToolbarAssociativeActionSheet.prototype */ {
		metadata : {
			associations : {
				/**
				 * The same as buttons, but provided in the form of an association
				 */
				associatedButtons: {type: "sap.m.Button", multiple: true, singularName: "associatedButton"}
			}
		},
		renderer: ActionSheetRenderer.render
	});

	OverflowToolbarAssociativeActionSheet.prototype.init = function() {
		ActionSheet.prototype.init.apply(this, arguments);

		this._mButtonStateMap = {};
	};


	/* Override API methods */
	OverflowToolbarAssociativeActionSheet.prototype.addAssociatedButton = function(oButton) {
		this.addAssociation("associatedButtons",oButton, true);
		this._preProcessActionButton(oButton);
		oButton.attachPress(this._buttonSelected, this);
		return this;
	};

	OverflowToolbarAssociativeActionSheet.prototype.removeAssociatedButton = function(oButton) {
		var sResult = this.removeAssociation("associatedButtons",oButton, true),
			oButtonObject;

		if (sResult) {
			oButtonObject = sap.ui.getCore().byId(sResult);
			oButtonObject.detachPress(this._buttonSelected, this);
			this._postProcessActionButton(oButtonObject);
		}
		return sResult;
	};

	OverflowToolbarAssociativeActionSheet.prototype.removeAllAssociatedButtons = function() {
		var aResult = this.removeAllAssociation("associatedButtons", true),
			oButtonObject;

		aResult.forEach(function(oButton) {
			oButtonObject = sap.ui.getCore().byId(oButton);
			oButtonObject.detachPress(this._buttonSelected, this);
			this._postProcessActionButton(oButtonObject);
		}, this);
		return aResult;
	};

	/**
	 * Returns the buttons from the aggregation and association combined
	 * @returns {Array.<T>|string|*|!Array}
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet.prototype._getAllButtons = function () {
		var aAssociatedButtons = this.getAssociatedButtons().map(function(sId) {
			return sap.ui.getCore().byId(sId);
		});

		if (this.getPlacement() === sap.m.PlacementType.Top) {
			aAssociatedButtons.reverse();
		}

		return this.getButtons().concat(aAssociatedButtons);
	};

	/**
	 * Creates a hash of the ids of the controls in the buttons association, f.e. "__button1.__button2.__button3"
	 * Useful to check if the same controls are in the action sheet in the same order compared to a point in the past
	 * @returns {*|string|!Array.<T>}
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet.prototype._getButtonsIdsHash = function () {
		return this.getAssociatedButtons().join(".");
	};

	/**
	 * Cache the button type and inverted state of all buttons that enter the ActionSheet
	 * @param oButton
	 * @returns {*}
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet.prototype._preProcessActionButton = function(oButton){
		var sType = oButton.getType();

		this._mButtonStateMap[oButton.getId()] = {
			isInverted: oButton.hasStyleClass("sapMBtnInverted"),
			isTransparent: oButton.hasStyleClass("sapMBtnTransparent"),
			buttonType: sType
		};

		if (sType !== sap.m.ButtonType.Accept && sType !== sap.m.ButtonType.Reject) {
			oButton.setProperty("type", sap.m.ButtonType.Transparent, true); // Do not invalidate
		}
		oButton.addStyleClass("sapMBtnInverted"); // dark background
		return this;
	};

	/**
	 * Restore the button type and inverted state of all buttons that leave the ActionSheet
	 * @param oButton
	 * @returns {*}
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet.prototype._postProcessActionButton = function(oButton) {
		var previousButtonState = this._mButtonStateMap[oButton.getId()];

		if (previousButtonState) {
			if (!previousButtonState.isInverted) {
				oButton.removeStyleClass("sapMBtnInverted");
			}
			if (!previousButtonState.isTransparent) {
				oButton.removeStyleClass("sapMBtnTransparent");
			}
			if (oButton.getType() !== previousButtonState.buttonType) {
				oButton.setProperty("type", previousButtonState.buttonType, true); // Do not invalidate
			}
		}

		oButton.removeStyleClass("sapMActionSheetButton");
		oButton.removeStyleClass("sapMActionSheetButtonNoIcon");
		oButton.removeStyleClass("sapMActionSheetCancelButton");

		// Remove the button from the DOM, because the toolbar will try to create another one with the same ID
		oButton.$().remove();

		return this;
	};

	/**
	 * Makes the action sheet close immediately, without showing an animation
	 * This is necessary when f.e. a button needs to remove itself from the popover upon being clicked to prevent flickering
	 * Currently the only way to force the no-animation mode for popover is to tell it that the client is IE9
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet.prototype._closeWithoutAnimation = function() {
		var bOriginalState = Popover._bIE9;
		Popover._bIE9 = true; // Tell the Popover the client is IE9 to skip the animation, see comment above
		this.close();
		Popover._bIE9 = bOriginalState;
	};

	/**
	 * Checks if the given control can be displayed in the action sheet
	 * @param oControl
	 * @returns {boolean}
	 * @private
	 */
	OverflowToolbarAssociativeActionSheet._acceptsControl = function(oControl) {
		var sControlName = oControl.getMetadata().getName();

		return sControlName === "sap.m.Button";
	};

	return OverflowToolbarAssociativeActionSheet;

}, /* bExport= */ false);
