/*!
 * ${copyright}
 */

// Provides control sap.m.BusyDialog.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/Popup', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Control, Popup, Parameters) {
	"use strict";



	/**
	 * Constructor for a new BusyDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 *
	 * @class
	 * BusyDialog is used to indicate that the system is busy and the user has to wait.
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
	var BusyDialog = Control.extend("sap.m.BusyDialog", /** @lends sap.m.BusyDialog.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Optional text displayed inside the popup.
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Sets the title of the BusyDialog. The default value is an empty string.
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Icon displayed in the dialog header. This icon is invisible in iOS platform and it is density aware. You can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screens.
			 */
			customIcon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * Defines the rotation speed of the given image. If GIF file is used, the speed has to be set to 0. The value is in milliseconds.
			 */
			customIconRotationSpeed : {type : "int", group : "Appearance", defaultValue : 1000},

			/**
			 * If this is set to <code>false</code>, the source image will be loaded directly without attempting to fetch the density perfect image for high density devices.
			 * By default, this is set to <code>true</code> but then one or more requests are sent trying to get the density perfect version of the image.
			 *
			 * If bandwidth is the key for the application, set this value to <code>false</code>.
			 */
			customIconDensityAware : {type : "boolean", defaultValue : true},

			/**
			 * Width of the provided icon with default value "44px".
			 */
			customIconWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "30px"},

			/**
			 * Height of the provided icon with default value "44px".
			 */
			customIconHeight : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},

			/**
			 * The text of the cancel button. The default text is "Cancel" (translated to the respective language).
			 */
			cancelButtonText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Indicates if the cancel button will be rendered inside the busy dialog. The default value is set to <code>false</code>.
			 */
			showCancelButton : {type : "boolean", group : "Appearance", defaultValue : false}
		},
		aggregations : {

			/**
			 * The hidden aggregation for internal maintained label.
			 */
			_busyLabel : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * The hidden aggregation for internal maintained busyIndicator.
			 */
			_busyIndicator : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * The hidden aggregation for internal maintained toolbar which contains the cancel button.
			 */
			_toolbar : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * The hidden aggregation for internal maintained button.
			 */
			_cancelButton : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when the busy dialog is closed.
			 */
			close : {
				parameters : {

					/**
					 * Indicates if the close events are triggered by a user, pressing a cancel button or because the operation was terminated.
					 * This parameter is set to true if the close event is fired by user interaction.
					 */
					cancelPressed : {type : "boolean"}
				}
			}
		}
	}});


	BusyDialog.prototype.init = function(){
		var that = this;
		this._$window = jQuery(window);

		this._busyIndicator = new sap.m.BusyIndicator(this.getId() + '-busyInd', {visible: false}).addStyleClass('sapMBsyInd');
		this.setAggregation("_busyIndicator", this._busyIndicator, true);

		this.iOldWinHeight = 0;
		this._oPopup = new Popup();
		this._oPopup.setShadow(false);
		this._oPopup.setModal(true, 'sapMDialogBLyInit');
		this._oPopup.setAnimations(this.openAnimation, this.closeAnimation);

		//the orientationchange event listener
		this._fOrientationChange = jQuery.proxy(this._reposition, this);

		this._oPopup._applyPosition = function(oPosition){
			that._setDimensions();
			Popup.prototype._applyPosition.call(this, oPosition);
		};
		this._oPopup._showBlockLayer = function(){
			Popup.prototype._showBlockLayer.call(this);
			var $BlockRef = jQuery("#sap-ui-blocklayer-popup");
			$BlockRef.toggleClass("sapMDialogBLyInit", true);
		};
		this._oPopup._hideBlockLayer = function(){
			var $BlockRef = jQuery("#sap-ui-blocklayer-popup");
			var $BlockBarRef = jQuery("#sap-ui-blocklayer-popup-bar");//$BlockRef.next('div');
			/*$BlockRef.one("webkitTransitionEnd", function(){*/
				$BlockBarRef.css({'visibility': '', 'display': 'none'});
				$BlockRef.toggleClass('sapMDialogBLyInit', false);
				$BlockRef.css("top", "");
				Popup.prototype._hideBlockLayer.call(this);
			/*});*/
			/*$BlockRef.toggleClass('sapMDialogBLyShown', false);*/

		};

		//keyboard support
		var fnOnEscape = jQuery.proxy(function(oEvent) {
				this.close(true);
				//event should not trigger any further actions
				oEvent.stopPropagation();
		}, this);
		//use pseudo event 'onsapescape' to implement keyboard-trigger for closing this dialog
		this._oPopup.onsapescape = fnOnEscape;
	};

	/**
	 *
	 * @param {Object} $Ref
	 * @param {number} iRealDuration
	 * @param fnOpened
	 */
	BusyDialog.prototype.openAnimation = function($Ref, iRealDuration, fnOpened) {
		fnOpened();
	};

	/**
	 *
	 * @param {Object} $Ref
	 * @param {number} iRealDuration
	 * @param fnClose
	 */
	BusyDialog.prototype.closeAnimation = function($Ref, iRealDuration, fnClose) {
		fnClose();
	};

	/**
	 * Destroys the BusyDialog.
	 * @private
	 */
	BusyDialog.prototype.exit = function(){
		this._oPopup.close();
		this._oPopup.destroy();
		this._oPopup = null;

		this._$window.unbind("resize", this._fOrientationChange);
	};

	/**
	 * Opens the BusyDialog.
	 *
	 * @type sap.m.BusyDialog
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BusyDialog.prototype.open = function(){
		jQuery.sap.log.debug("sap.m.BusyDialog.open called at " + new Date().getTime());

		var oPopup = this._oPopup;

		if (!oPopup) {
			jQuery.sap.log.warning("Method 'open' is called after sap.m.BusyDialog with id '" + this.getId() + "' is destroyed");
			return this;
		}

		if (oPopup.isOpen()) {
			return this;
		}
		// Open popup
		oPopup.setContent(this);
		oPopup.attachOpened(this._handleOpened, this);
		oPopup.setPosition("center center", "center center", document, "0 0", "fit");
		oPopup.setInitialFocusId(this.getShowCancelButton() ? this._oButton.getId() : this.getId());

		this._bOpenRequested = true;
		this._openNowIfPossibleAndRequested();

		return this;
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._openNowIfPossibleAndRequested = function(){
		if (!this._bOpenRequested) {
			return;
		}

		// If body/Core are not available yet, give them some more time and open later if still required
		if (!document.body || !sap.ui.getCore().isInitialized()) {
			jQuery.sap.delayedCall(50, this, "_openNowIfPossibleAndRequested");
			return;
		}

		this._bOpenRequested = false; // opening request is handled
		this._oPopup.open();
	};

	/**
	 * Closes the BusyDialog.
	 *
	 * @type sap.m.BusyDialog
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	BusyDialog.prototype.close = function(bFromCancelButton){
		this._bOpenRequested = false;
		var oPopup = this._oPopup;

		if (!oPopup) {
			jQuery.sap.log.warning("Method 'close' is called after sap.m.BusyDialog with id '" + this.getId() + "' is destroyed");
			return this;
		}

		var eOpenState = this._oPopup.getOpenState();
		if (!(eOpenState === sap.ui.core.OpenState.CLOSED || eOpenState === sap.ui.core.OpenState.CLOSING)) {
			oPopup.attachClosed(this._handleClosed, this);
			jQuery.sap.log.debug("sap.m.BusyDialog.close called at " + new Date().getTime());
			oPopup.close();
			// stop busy indicator
			this._busyIndicator.setVisible(false);

			this.fireClose({
				cancelPressed: !!bFromCancelButton
			});
		}
		return this;
	};

	BusyDialog.prototype.setText = function(sText){
		this.setProperty("text", sText, true);
		if (!this._oLabel) {
			this._oLabel = new sap.m.Label(this.getId() + "-busyLabel", {}).addStyleClass("sapMBusyDialogLabel");
			this.setAggregation("_busyLabel", this._oLabel, true);
		}
		this._oLabel.setText(sText);
		return this;
	};

	BusyDialog.prototype.setCustomIcon = function(oIcon){
		this.setProperty("customIcon", oIcon, true);
		this._busyIndicator.setCustomIcon(oIcon);
		return this;
	};

	BusyDialog.prototype.setCustomIconRotationSpeed = function(iSpeed){
		this.setProperty("customIconRotationSpeed", iSpeed, true);
		this._busyIndicator.setCustomIconRotationSpeed(iSpeed);
		return this;
	};

	BusyDialog.prototype.setCustomIconDensityAware = function(bAware){
		this.setProperty("customIconDensityAware", bAware, true);
		this._busyIndicator.setCustomIconDensityAware(bAware);
		return this;
	};

	BusyDialog.prototype.setCustomIconWidth = function(sWidth){
		this.setProperty("customIconWidth", sWidth, true);
		this._busyIndicator.setCustomIconWidth(sWidth);
		return this;
	};

	BusyDialog.prototype.setCustomIconHeight = function(sHeight){
		this.setProperty("customIconHeight", sHeight, true);
		this._busyIndicator.setCustomIconHeight(sHeight);
		return this;
	};

	BusyDialog.prototype.setShowCancelButton = function(bShow){
		this.setProperty("showCancelButton", bShow, false);
		if (bShow) {
			this._createCancelButton();
		}
		return this;
	};

	BusyDialog.prototype.setCancelButtonText = function(sText){
		this.setProperty("cancelButtonText", sText, true);
		this._createCancelButton();
		this._oButton.setText(sText);
		return this;
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._createCancelButton = function(){
		if (!this._oButton) {
			var that = this;
			var sButtonText = (this.getCancelButtonText()) ? this.getCancelButtonText() : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("BUSYDIALOG_CANCELBUTTON_TEXT");

			this._oButton = new sap.m.Button(this.getId() + 'busyCancelBtn', {
					text: sButtonText,
					type: sap.m.ButtonType.Transparent,
					press : function() {
						that.close(true);
					}
			}).addStyleClass("sapMDialogBtn");

			if (sap.ui.Device.system.phone) {
				this._oButton.addStyleClass("sapMDialogBtnPhone");
				this.setAggregation("_cancelButton", this._oButton, true);
			} else {
				this._oButtonToolBar = new sap.m.Toolbar(this.getId() + "-toolbar", {
					content: [
						new sap.m.ToolbarSpacer(this.getId() + "-toolbarspacer"),
						this._oButton
					]
				}).addStyleClass("sapMTBNoBorders").addStyleClass("sapMBusyDialogFooter").applyTagAndContextClassFor("footer");
				this.setAggregation("_toolbar", this._oButtonToolBar, true);
			}
		}
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._reposition = function() {
		if (!this._oPopup) {
			return;
		}
		var ePopupState = this._oPopup.getOpenState();
		if (!(ePopupState === sap.ui.core.OpenState.OPEN)) {
			return;
		}
		this._oPopup._applyPosition(this._oPopup._oLastPosition);
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._handleOpened = function(){
		this._oPopup.detachOpened(this._handleOpened, this);
		// start busy indicator
		this._busyIndicator.setVisible(true);
		// bind to window resize
		// In android, the orientationchange fires before the size of the window changes
		//  that's why the resize event is used here.
		this._$window.bind("resize", this._fOrientationChange);
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._handleClosed = function(){
		this._oPopup.detachClosed(this._handleClosed, this);
		this._$window.unbind("resize", this._fOrientationChange);
	};

	/**
	 *
	 * @private
	 */
	BusyDialog.prototype._setDimensions = function() {
		// Derive width and height from viewport
		var iWindowHeight =  this._$window.height();
		var $this = this.$();
		//reset
		$this.css({
			"left": "0px",
			"top": "0px",
			"max-height": this._$window.height() + "px"
		});
		if (iWindowHeight <= this.iOldWinHeight) {
			if (!this.$().hasClass("sapMBsyDSmall")) {
				this._checkSize(iWindowHeight);
			}
		}
		if (iWindowHeight > this.iOldWinHeight) {
			if ((this.$().hasClass("sapMBsyDSmall"))) {
				this._checkSize(iWindowHeight);
			}
		}
		if (this.iOldWinHeight == 0) {
			this._checkSize(iWindowHeight);
		}
		this.iOldWinHeight = this._$window.height();
	};

	/**
	 *
	 * @param {number} iWindowHeight
	 * @private
	 */
	BusyDialog.prototype._checkSize = function(iWindowHeight) {
		if (iWindowHeight < this.$()[0].scrollHeight) {
			this.$().toggleClass("sapMBsyDSmall", true);
		} else {
			this.$().toggleClass("sapMBsyDSmall", false);
			this.$().css("width", "18.75em");
		}
	};


	return BusyDialog;

}, /* bExport= */ true);
