/*!
 * ${copyright}
 */

// Provides control sap.m.BusyDialog.
sap.ui.define(['./library', 'sap/ui/core/Control', 'sap/m/Dialog', 'sap/m/BusyIndicator', 'sap/m/Label', 'sap/m/Button', "sap/base/Log"],
	function (library, Control, Dialog, BusyIndicator, Label, Button, Log) {
		"use strict";

		/**
		 * Constructor for a new BusyDialog.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * BusyDialog is used to indicate that the system is busy.
		 * <h3>Overview</h3>
		 * When the busy dialog is displayed, the whole application is blocked.
		 * <h3>Structure</h3>
		 * The busy dialog can hold several elements, most of which are optional.
		 * <ul>
		 * <li><code>title</code> - A title for the dialog. By default, there is no title.</li>
		 * <li><code>text</code> - A text displayed above the busy animation.</li>
		 * <li><code>showCancelButton</code> - An optional Cancel button to stop the execution.</li>
		 * <li><code>customIcon</code> - An optional alternative icon to use as a busy animation.</li>
		 * </ul>
		 * <h3>Usage</h3>
		 * <h4>When to use</h4>
		 * <ul>
		 * <li>The operation lasts more than one second.</li>
		 * <li>You want to indicate loading in a page-to-page navigation (lightweight version).</li>
		 * <li>Offer a Cancel button if you expect the process to run more than 10 seconds.</li>
		 * <li> If you do not show a title or text, use the {@link sap.ui.core.InvisibleText invisible text} control to provide the reason for users with assistive technologies.</li>
		 * </ul>
		 * <h4>When not to use</h4>
		 * <ul>
		 * <li>The screen is not supposed to be blocked. Use a {@link sap.m.BusyIndicator} for the specific application part.</li>
		 * <li>Do not use the title of the busy dialog. Provide a precise text describing the operation in <code>text</code>.</li>
		 * </ul>
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @alias sap.m.BusyDialog
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/busydialog Busy Dialog}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BusyDialog = Control.extend("sap.m.BusyDialog", /** @lends sap.m.BusyDialog.prototype */ {

			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Optional text displayed inside the dialog.
					 */
					text: {type: "string", group: "Appearance", defaultValue: ''},

					/**
					 * Sets the title of the BusyDialog. The default value is an empty string.
					 */
					title: {type: "string", group: "Appearance", defaultValue: ''},

					/**
					 * Icon, used from the BusyIndicator. This icon is invisible in iOS platform and it is density aware. You can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screens.
					 */
					customIcon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ''},

					/**
					 * Defines the rotation speed of the given image. If GIF file is used, the speed has to be set to 0. The value is in milliseconds.
					 */
					customIconRotationSpeed: {type: "int", group: "Appearance", defaultValue: 1000},

					/**
					 * If this is set to <code>false</code>, the source image will be loaded directly without attempting to fetch the density perfect image for high density devices.
					 * By default, this is set to <code>true</code> but then one or more requests are sent trying to get the density perfect version of the image.
					 *
					 * If bandwidth is the key for the application, set this value to <code>false</code>.
					 */
					customIconDensityAware: {type: "boolean", defaultValue: true},

					/**
					 * Width of the provided icon with default value "44px".
					 */
					customIconWidth: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "44px"},

					/**
					 * Height of the provided icon with default value "44px".
					 */
					customIconHeight: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "44px"},

					/**
					 * The text of the cancel button. The default text is "Cancel" (translated to the respective language).
					 */
					cancelButtonText: {type: "string", group: "Misc", defaultValue: ''},

					/**
					 * Indicates if the cancel button will be rendered inside the busy dialog. The default value is set to <code>false</code>.
					 */
					showCancelButton: {type: "boolean", group: "Appearance", defaultValue: false}
				},
				associations: {
					/**
					* Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
					*/
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
				},
				events: {
					/**
					 * Fires when the busy dialog is closed. Note: the BusyDialog will not be closed by the InstanceManager.closeAllDialogs method
					 */
					close: {
						parameters: {
							/**
							 * Indicates if the close events are triggered by a user, pressing a cancel button or because the operation was terminated.
							 * This parameter is set to true if the close event is fired by user interaction.
							 */
							cancelPressed: {type: "boolean"}
						}
					}
				},
				designtime: "sap/m/designtime/BusyDialog.designtime"
			},

			// requires a dummy render function to avoid loading of separate
			// renderer file and in case of usage in control tree a render
			// function has to be available to not crash the rendering
			renderer: function(oRm, oControl) { /* just do nothing */ }

		});

		/**
		 * Initiates the BusyDialog.
		 * @private
		 */
		BusyDialog.prototype.init = function () {
			/**
			 * Creates a busyIndicator for the dialog.
			 * @private
			 */
			this._busyIndicator = new BusyIndicator(this.getId() + '-busyInd', {
				visible: true
			});

			function onOpen() {
				if (sap.ui.getCore().getConfiguration().getAccessibility()) {
					this._$content.attr('role', 'application');
				}
			}

			/**
			 * Creates the dialog with its class.
			 * @private
			 */
			this._oDialog = new Dialog(this.getId() + '-Dialog', {
				content: this._busyIndicator,
				showHeader: false,
				afterOpen: onOpen,
				afterClose: this._fnCloseHandler.bind(this),
				initialFocus: this._busyIndicator.getId() + '-busyIndicator'
			}).addStyleClass('sapMBusyDialog');


			/**
			 * Overrides the close method, so the BusyDialog won't get closed by the InstanceManager.closeAllDialogs method.
			 * @method
			 * @private
			 */
			this._oDialog.close = function () {

			};

			/**
			 * Adds onBeforeRendering to the dialog.
			 */
			this._oDialog.addEventDelegate({
				onBeforeRendering: function () {
					var text = this.getText(),
						title = this.getTitle(),
						showCancelButton = this.getShowCancelButton() || this.getCancelButtonText();

					if (!text && !title && !showCancelButton) {
						this._oDialog.addStyleClass('sapMBusyDialog-Light');
					} else {
						this._oDialog.removeStyleClass('sapMBusyDialog-Light');
					}
				}
			}, this);

			/**
			 * Adds keyboard handling for the popup in the dialog. it's used for closing the popup.
			 * @method
			 * @public
			 * @param {Event} e Expected keyboard event.
			 */
			this._oDialog.oPopup.onsapescape = function (e) {
				this.close(true);
			}.bind(this);
		};

		/**
		 * Destroys the BusyDialog.
		 * @private
		 */
		BusyDialog.prototype.exit = function () {
			/**
			 * Destroys the busyIndicator and nullifies it.
			 */
			this._busyIndicator.destroy();
			this._busyIndicator = null;

			if (this._cancelButton) {
				this._cancelButton.destroy();
				this._cancelButton = null;
			}

			if (this._oLabel) {
				this._oLabel.destroy();
				this._oLabel = null;
			}

			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
		};

		/**
		 * Opens the BusyDialog.
		 *
		 * @public
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.open = function () {
			Log.debug("sap.m.BusyDialog.open called at " + new Date().getTime());

			if (this.getAriaLabelledBy() && !this._oDialog._$dialog) {
				var that = this;
				this.getAriaLabelledBy().forEach(function(item){
					that._oDialog.addAriaLabelledBy(item);
				});
			}

			//if the code is not ready yet (new sap.m.BusyDialog().open()) wait 50ms and then try ot open it.
			if (!document.body || !sap.ui.getCore().isInitialized()) {
				setTimeout(function() {
					this.open();
				}.bind(this), 50);
			} else {
				this._oDialog.open();
			}

			return this;
		};

		/**
		 * Closes the BusyDialog.
		 *
		 * @public
		 * @param {boolean} isClosedFromUserInteraction Indicates if the BusyDialog is closed from a user interaction.
		 * @returns {sap.m.BusyDialog} The modified BusyDialog.
		 */
		BusyDialog.prototype.close = function (isClosedFromUserInteraction) {
			this._isClosedFromUserInteraction = isClosedFromUserInteraction;

			// the instance "close" method is overridden,
			// so call the prototype close method
			Dialog.prototype.close.call(this._oDialog);

			return this;
		};

		/**
		 * Fire close of the BusyDialog only after the Dialog close is fired.
		 *
		 * @private
		 */
		BusyDialog.prototype._fnCloseHandler = function () {
			//fire the close event with 'cancelPressed' = true/false depending on how the busyDialog is closed
			this.fireClose({cancelPressed: this._isClosedFromUserInteraction || false});
		};

		/**
		 * Sets the title for the BusyDialog.
		 *
		 * @public
		 * @param {string} sTitle The title for the BusyDialog.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setTitle = function (sTitle) {
			//the text can be changed only before opening
			this.setProperty('title', sTitle, true);
			this._oDialog.setTitle(sTitle).setShowHeader(!!sTitle);

			return this;
		};

		/**
		 * Sets the tooltip for the BusyDialog.
		 *
		 * @public
		 * @param {string} sTooltip The tooltip for the BusyDialog.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setTooltip = function (sTooltip) {
			this._oDialog.setTooltip(sTooltip);

			return this;
		};

		/**
		 * Gets the tooltip of the internal dialog.
		 * @override
		 */
		BusyDialog.prototype.getTooltip = function () {
			return this._oDialog.getTooltip();
		};

		/**
		 * Sets the text for the BusyDialog.
		 *
		 * @public
		 * @param {string} sText The text for the BusyDialog.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setText = function (sText) {
			//the text can be changed only before opening
			this.setProperty('text', sText, true);

			if (!this._oLabel) {
				if (sText) {
					this._oLabel = new Label(this.getId() + '-TextLabel', {text: sText}).addStyleClass('sapMBusyDialogLabel');
					this._oDialog.insertAggregation('content', this._oLabel, 0);
					this._oDialog.addAriaLabelledBy(this._oLabel.getId());
				}
			} else {
				if (sText) {
					this._oLabel.setText(sText).setVisible(true);
				} else {
					this._oLabel.setVisible(false);
				}
			}

			return this;
		};

		/**
		 * Sets custom icon.
		 *
		 * @public
		 * @param {string} sIcon Icon to use as a busy animation.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setCustomIcon = function (sIcon) {
			this.setProperty("customIcon", sIcon, true);
			this._busyIndicator.setCustomIcon(sIcon);
			return this;
		};

		/**
		 * Sets the rotation speed of the custom icon.
		 *
		 * @public
		 * @param {int} iSpeed Defines the rotation speed of the given image.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setCustomIconRotationSpeed = function (iSpeed) {
			this.setProperty("customIconRotationSpeed", iSpeed, true);
			this._busyIndicator.setCustomIconRotationSpeed(iSpeed);
			return this;
		};

		/**
		 * Sets the density of the custom icon.
		 *
		 * @public
		 * @param {boolean} bIsDensityAware Determines if the source image will be loaded directly without attempting to fetch the density for high density devices.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setCustomIconDensityAware = function (bIsDensityAware) {
			this.setProperty("customIconDensityAware", bIsDensityAware, true);
			this._busyIndicator.setCustomIconDensityAware(bIsDensityAware);
			return this;
		};

		/**
		 * Sets the width of the custom icon.
		 *
		 * @public
		 * @param {string} sWidth Width of the provided icon in CSSSize.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setCustomIconWidth = function (sWidth) {
			this.setProperty("customIconWidth", sWidth, true);
			this._busyIndicator.setCustomIconWidth(sWidth);
			return this;
		};

		/**
		 * Sets the height of the custom icon.
		 *
		 * @public
		 * @param {string} sHeight Height of the provided icon in CSSSize.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setCustomIconHeight = function (sHeight) {
			this.setProperty("customIconHeight", sHeight, true);
			this._busyIndicator.setCustomIconHeight(sHeight);
			return this;
		};

		/**
		 * Shows the cancel button.
		 *
		 * @public
		 * @param {boolean} bIsCancelButtonShown Determines if the Cancel button is shown.
		 * @returns {sap.m.BusyDialog} BusyDialog reference for chaining.
		 */
		BusyDialog.prototype.setShowCancelButton = function (bIsCancelButtonShown) {
			this.setProperty("showCancelButton", bIsCancelButtonShown, false);

			if (bIsCancelButtonShown) {
				this._oDialog.setEndButton(this._getCancelButton());
			} else {
				this._destroyTheCancelButton();
			}

			return this;
		};

		/**
		 * Shows the text for the cancel button.
		 *
		 * @public
		 * @param {string} sText Text for the cancel button.
		 * @returns {sap.m.BusyDialog} The modified BusyDialog.
		 */
		BusyDialog.prototype.setCancelButtonText = function (sText) {
			this.setProperty("cancelButtonText", sText, false);

			if (sText) {
				this._getCancelButton().setText(sText);
				this._oDialog.setEndButton(this._getCancelButton());
			} else {
				this._destroyTheCancelButton();
			}

			return this;
		};

		/**
		 * Gets the DOM reference for the BusyDialog.
		 *
		 * @public
		 * @returns {sap.m.BusyDialog} Dom reference.
		 */
		BusyDialog.prototype.getDomRef = function () {
			return this._oDialog && this._oDialog.getDomRef();
		};

		//Forward methods to the inner dialog: addStyleClass, removeStyleClass, hasStyleClass, toggleStyleClass
		["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass"].forEach(function (sActionName) {
			BusyDialog.prototype[sActionName] = function () {
				if (this._oDialog && this._oDialog[sActionName]) {
					this._oDialog[sActionName].apply(this._oDialog, arguments);

					return this;
				}
			};
		});

		//private functions

		/**
		 * Destroys the cancel button.
		 *
		 * @private
		 */
		BusyDialog.prototype._destroyTheCancelButton = function () {
			this._oDialog.destroyEndButton();
			this._cancelButton = null;
		};

		/**
		 * Gets the cancel button.
		 *
		 * @private
		 * @returns {sap.m.Button} The cancel button in the BusyDialog.
		 */
		BusyDialog.prototype._getCancelButton = function () {
			var cancelButtonText = this.getCancelButtonText();
			cancelButtonText = cancelButtonText ? cancelButtonText : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("BUSYDIALOG_CANCELBUTTON_TEXT");

			return this._cancelButton ? this._cancelButton : this._cancelButton = new Button(this.getId() + 'busyCancelBtn', {
				text: cancelButtonText,
				press: function () {
					this.close(true);
				}.bind(this)
			});
		};

		return BusyDialog;

	}
);