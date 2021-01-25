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
	"sap/m/ToggleButton",
	"sap/m/ValueStateHeader"
], function (library, Core, IconPool, Dialog, Button, Bar, Title, Toolbar, ToggleButton, ValueStateHeader) {
	"use strict";

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = library.TitleAlignment;

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
		 * Gets Show More button from <code>SuggestionsPopover</code>'s Dialog.
		 *
		 * @return {sap.m.Button} Show more button.
		 * @public
		 */
		this.getShowMoreButton = function() {
			return this.getPopover().getEndButton();
		};

		/**
		 * Sets Show More button to <code>SuggestionsPopover</code>'s Dialog.
		 *
	 	 * @param {sap.m.Button} oShowMoreButton The "Show More" button for the Dialog's <code>endButton</code> aggregation
		 * @public
		 */
		this.setShowMoreButton = function(oShowMoreButton) {
			this.getPopover().setEndButton(oShowMoreButton);
			return this;
		};

		/**
		 * Destroys Show More button from <code>SuggestionsPopover<code>'s Dialog.
		 *
		 * @public
		 */
		this.removeShowMoreButton = function() {
			this.getPopover().destroyAggregation("endButton");
			return this;
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
		 * @param mOptions
		 * @returns {sap.m.Dialog}
		 */
		this.createPopover = function (oInput, mOptions) {
			var oMessageBundle = Core.getLibraryResourceBundle("sap.m"),
				that = this,
				oPopupInput = new sap.m.Input(oInput.getId() + "-popup-input", {
					width: "100%",
					showValueStateMessage: false
				});

			return new Dialog(oInput.getId() + "-popup", {
				beginButton: new Button(oInput.getId() + "-popup-closeButton", {
					text: oMessageBundle.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON")
				}),
				stretch: true,
				titleAlignment: TitleAlignment.Auto,
				customHeader: new Bar(oInput.getId() + "-popup-header", {
					titleAlignment: TitleAlignment.Auto,
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

		this.getInput = function () {
			var oPopover = this.getPopover(),
				aSubHeader = oPopover && oPopover.getSubHeader(),
				aSubHeaderContent = aSubHeader && aSubHeader.getContent();

			return aSubHeaderContent && aSubHeaderContent.filter(function (oControl) {
				return oControl.isA("sap.m.InputBase");
			})[0];
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

		/**
		 * Gets the Value State Header instance.
		 *
		 * @private
		 */
		this._getValueStateHeader = function () {
			var oPopover = this.getPopover();

			if (!oPopover.getContent().length
				|| (oPopover.getContent().length && !oPopover.getContent()[0].isA("sap.m.ValueStateHeader"))) {
				this._createValueStateHeader();
			}

			return oPopover.getContent()[0];
		};

		/**
		 * Creates the Value State Header instance.
		 *
		 * @private
		 */
		this._createValueStateHeader = function () {
			var oValueStateHeader = new ValueStateHeader();
			var	oPopover = this.getPopover();

			// on mobile the content is used and sticky position is set on the header
			oPopover.insertContent(oValueStateHeader, 0);
			oValueStateHeader.setPopup(oPopover);
		};
	};
});