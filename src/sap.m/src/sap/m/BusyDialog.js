/*!
 * ${copyright}
 */

// Provides control sap.m.BusyDialog.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Dialog', 'sap/m/BusyIndicator', 'sap/m/Label', 'sap/m/Button'],
	function (jQuery, library, Control, Dialog, BusyIndicator, Label, Button, Popup, Parameters) {
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
		 * <li> If you do not show a title or text, use the {@link sap.ui.core.InvisibleText invisible text} control to provide the reason for users with assertive technologies.</li>
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
		 * @constructor
		 * @public
		 * @alias sap.m.BusyDialog
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
					 * Fires when the busy dialog is closed.
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
				}
			},

			// requires a dummy render function to avoid loading of separate
			// renderer file and in case of usage in control tree a render
			// function has to be available to not crash the rendering
			renderer: function(oRm, oControl) { /* just do nothing */ }

		});

		BusyDialog.prototype.init = function () {
			this._busyIndicator = new BusyIndicator(this.getId() + '-busyInd', {
				visible: true
			});

			function onOpen() {
				if (sap.ui.getCore().getConfiguration().getAccessibility()) {
					this._$content.attr('role', 'application');
				}
			}

			//create the dialog
			this._oDialog = new Dialog(this.getId() + '-Dialog', {
				content: this._busyIndicator,
				showHeader: false,
				afterOpen: onOpen,
				initialFocus: this._busyIndicator
			}).addStyleClass('sapMBusyDialog');

			// override the close method, so the BusyDialog won't get
			// closed by the InstanceManager.closeAllDialogs method
			this._oDialog.close = function () {

			};

			this._oDialog.addEventDelegate({
				onBeforeRendering: function () {
					var text = this.getText();
					var title = this.getTitle();
					var showCancelButton = this.getShowCancelButton() || this.getCancelButtonText();

					if (!text && !title && !showCancelButton) {
						this._oDialog.addStyleClass('sapMBusyDialog-Light');
					} else {
						this._oDialog.removeStyleClass('sapMBusyDialog-Light');
					}
				}
			}, this);

			//keyboard handling
			this._oDialog.oPopup.onsapescape = function (e) {
				this.close(true);
			}.bind(this);
		};

		/**
		 * Destroys the BusyDialog.
		 * @private
		 */
		BusyDialog.prototype.exit = function () {
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
		 * @type sap.m.BusyDialog
		 * @public
		 */
		BusyDialog.prototype.open = function () {
			jQuery.sap.log.debug("sap.m.BusyDialog.open called at " + new Date().getTime());

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
		 * @type sap.m.BusyDialog
		 * @public
		 */
		BusyDialog.prototype.close = function (isClosedFromUserInteraction) {
			//fire the close event with 'cancelPressed' = true/false depending on how the busyDialog is closed
			this.fireClose({cancelPressed: isClosedFromUserInteraction || false});

			// the instance "close" method is overridden,
			// so call the prototype close method
			Dialog.prototype.close.call(this._oDialog);

			return this;
		};

		BusyDialog.prototype.setTitle = function (title) {
			//the text can be changed only before opening
			this.setProperty('title', title, true);
			this._oDialog.setTitle(title).setShowHeader(!!title);

			return this;
		};

		BusyDialog.prototype.setTooltip = function (tooltip) {
			this._oDialog.setTooltip(tooltip);

			return this;
		};

		BusyDialog.prototype.getTooltip = function () {
			this._oDialog.getTooltip();

			return this;
		};

		BusyDialog.prototype.setText = function (text) {
			//the text can be changed only before opening
			this.setProperty('text', text, true);

			if (!this._oLabel) {
				if (text) {
					this._oLabel = new Label(this.getId() + '-TextLabel', {text: text}).addStyleClass('sapMBusyDialogLabel');
					this._oDialog.insertAggregation('content', this._oLabel, 0);
					this._oDialog.addAriaLabelledBy(this._oLabel.getId());
				}
			} else {
				if (text) {
					this._oLabel.setText(text).setVisible(true);
				} else {
					this._oLabel.setVisible(false);
				}
			}

			return this;
		};

		BusyDialog.prototype.setCustomIcon = function (icon) {
			this.setProperty("customIcon", icon, true);
			this._busyIndicator.setCustomIcon(icon);
			return this;
		};

		BusyDialog.prototype.setCustomIconRotationSpeed = function (speed) {
			this.setProperty("customIconRotationSpeed", speed, true);
			this._busyIndicator.setCustomIconRotationSpeed(speed);
			return this;
		};

		BusyDialog.prototype.setCustomIconDensityAware = function (isDensityAware) {
			this.setProperty("customIconDensityAware", isDensityAware, true);
			this._busyIndicator.setCustomIconDensityAware(isDensityAware);
			return this;
		};

		BusyDialog.prototype.setCustomIconWidth = function (width) {
			this.setProperty("customIconWidth", width, true);
			this._busyIndicator.setCustomIconWidth(width);
			return this;
		};

		BusyDialog.prototype.setCustomIconHeight = function (height) {
			this.setProperty("customIconHeight", height, true);
			this._busyIndicator.setCustomIconHeight(height);
			return this;
		};

		BusyDialog.prototype.setShowCancelButton = function (isCancelButtonShown) {
			this.setProperty("showCancelButton", isCancelButtonShown, false);

			if (isCancelButtonShown) {
				this._oDialog.setEndButton(this._getCancelButton());
			} else {
				this._destroyTheCancelButton();
			}

			return this;
		};

		BusyDialog.prototype.setCancelButtonText = function (text) {
			this.setProperty("cancelButtonText", text, false);

			if (text) {
				this._getCancelButton().setText(text);
				this._oDialog.setEndButton(this._getCancelButton());
			} else {
				this._destroyTheCancelButton();
			}

			return this;
		};

		BusyDialog.prototype.getDomRef = function () {
			return this._oDialog && this._oDialog.getDomRef();
		};

		//private functions

		BusyDialog.prototype._destroyTheCancelButton = function () {
			this._oDialog.destroyEndButton();
			this._cancelButton = null;
		};

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

	}, /* bExport= */ true
);
