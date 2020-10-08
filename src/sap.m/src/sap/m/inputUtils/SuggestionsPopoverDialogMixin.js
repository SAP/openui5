/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToggleButton"
], function (library, Core, IconPool, Dialog, Button, Bar, Title, Toolbar, ToggleButton) {
	"use strict";

	return function () {
		/**
		 * Returns a reference to the title inside the dialog.
		 *
		 * @override
		 * @return {sap.m.Title} The title
		 * @public
		 */
		this.getPickerTitle = function () {
			return this.getPopover().getCustomHeader().getContentMiddle()[0];
		};

		/**
		 * Returns a reference to the OK button inside the dialog.
		 *
		 * @override
		 * @return {sap.m.Button|null} The OK button
		 * @public
		 */
		this.getOkButton = function () {
			var oPopover = this.getPopover(),
				oButton = oPopover && oPopover.getBeginButton();

			return oButton || null;
		};

		/**
		 * Returns a reference to the Cancel button inside the dialog.
		 *
		 * @override
		 * @return {sap.m.Button|null} The cancel button
		 * @public
		 */
		this.getCancelButton = function () {
			var oPopover = this.getPopover(),
				oButton = oPopover
					&& oPopover.getCustomHeader()
					&& oPopover.getCustomHeader().getContentRight
					&& oPopover.getCustomHeader().getContentRight()[0];

			return oButton || null;
		};

		/**
		 * Returns a reference to the button inside the dialog, associated with filtering actions in multi selection scenarios.
		 *
		 * @override
		 * @return {sap.m.Button|null} The button
		 * @public
		 */
		this.getFilterSelectedButton = function () {
			var oPopover = this.getPopover(),
				oButton = oPopover
					&& oPopover.getSubHeader()
					&& oPopover.getSubHeader().getContent()[1];

			return oButton || null;
		};

		/**
		 * @override
		 * @param fnHandler
		 * @returns {sap.m.Button|null}
		 */
		this.setOkPressHandler = function (fnHandler) {
			var oOkButton = this.getOkButton();
			oOkButton && oOkButton.attachPress(fnHandler);

			return oOkButton;
		};

		/**
		 * @override
		 * @param fnHandler
		 * @returns {sap.m.Button|null}
		 */
		this.setCancelPressHandler = function (fnHandler) {
			var oCancelButton = this.getCancelButton();
			oCancelButton && oCancelButton.attachPress(fnHandler);

			return oCancelButton;
		};

		/**
		 * @override
		 * @param fnHandler
		 * @returns {sap.m.ToggleButton|sap.m.Button|null}
		 */
		this.setShowSelectedPressHandler = function (fnHandler) {
			var oFilterSelectedButton = this.getFilterSelectedButton();
			oFilterSelectedButton && oFilterSelectedButton.attachPress(fnHandler);

			return oFilterSelectedButton;
		};

		/**
		 * Instantiates the dialog.
		 *
		 * @override
		 * @param oInput
		 * @param oPopupInput
		 * @param mOptions
		 * @returns {sap.m.Dialog}
		 */
		this.createPopover = function (oInput, oPopupInput, mOptions) {
			var oMessageBundle = Core.getLibraryResourceBundle("sap.m"),
				that = this;

			return new Dialog(oInput.getId() + "-popup", {
				beginButton: new Button(oInput.getId() + "-popup-closeButton", {
					text: oMessageBundle.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON")
				}),
				stretch: true,
				customHeader: new Bar(oInput.getId() + "-popup-header", {
					contentMiddle: new Title(),
					contentRight: new Button({
						icon: IconPool.getIconURI("decline")
					})
				}),
				subHeader: _createSubHeaderContent(mOptions, oPopupInput),
				horizontalScrolling: false,
				initialFocus: oPopupInput,
				beforeOpen: function () {
					that._updatePickerHeaderTitle();
				},
				afterClose: function () {
					oInput.focus();
					library.closeKeyboard();
				}
			});
		};

		/**
		 * Updates the dialog title based on the labels of the parent input.
		 *
		 * @return {sap.m.Title} The title control
		 * @private
		 */
		this._updatePickerHeaderTitle = function () {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.m"),
				oPickerTitle = this.getPickerTitle(),
				oLabel, aLabels;

			if (!oPickerTitle) {
				return;
			}

			aLabels = this._getInputLabels();

			if (aLabels.length) {
				oLabel = aLabels[0];

				if (oLabel && (typeof oLabel.getText === "function")) {
					oPickerTitle.setText(oLabel.getText());
				}
			} else {
				oPickerTitle.setText(oResourceBundle.getText("COMBOBOX_PICKER_TITLE"));
			}

			return oPickerTitle;
		};

		/**
		 * Gets the labels associated with the parent input.
		 *
		 * @return {Array} Array of labels
		 * @private
		 */
		this._getInputLabels = function () {
			return this._fnInputLabels();
		};

		/**
		 * Dialog's header content
		 *
		 * @param mOptions
		 * @param oPopupInput
		 * @return {sap.m.Toolbar} The toolbar
		 * @private
		 */
		function _createSubHeaderContent(mOptions, oPopupInput) {
			var aContent = [oPopupInput];

			if (mOptions.showSelectedButton) {
				aContent.push(_createFilterSelectedButton());
			}
			return new Toolbar({
				content: aContent
			});
		}

		/**
		 * Returns a reference to the button inside the dialog, associated with filtering actions in multi selection scenarios.
		 *
		 * @return {sap.m.Button} The button
		 * @private
		 */
		function _createFilterSelectedButton() {
			var sIconURI = IconPool.getIconURI("multiselect-all");

			return new ToggleButton({
				icon: sIconURI
			});
		}
	};
});