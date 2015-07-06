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
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Busy Dialog is used to indicate that the system is busy with some task and the user has to wait. During this time the UI is blocked.
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
			 * Optional text shown inside the popup.
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * Sets a title to the busy dialog. Default is no title.
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * Icon that is displayed in the dialog header. This icon is invisible in iOS platform and it's density aware that you can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screen.
			 */
			customIcon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
	
			/**
			 * Defines the rotation speed of the given image. If a gif is used, the speed has to be set to 0. The unit is in ms.
			 */
			customIconRotationSpeed : {type : "int", group : "Appearance", defaultValue : 1000},
	
			/**
			 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
			 * 
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			customIconDensityAware : {type : "boolean", defaultValue : true},
	
			/**
			 * Width of the provided icon. By default 44px are used.
			 */
			customIconWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "30px"},
	
			/**
			 * Height of the provided icon. By default 44px are used.
			 */
			customIconHeight : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},
	
			/**
			 * The text of the cancel button. The default text is "Cancel" (translated to the respective language).
			 */
			cancelButtonText : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * A cancel button will be rendered inside the busy dialog if this property is set to true.
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
			 * This event will be fired when the busy dialog is closed.
			 */
			close : {
				parameters : {
	
					/**
					 * this parameter is for an app to differ for a "close" event if it was fired because user pressed cancel button or because the operation was terminated.
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
		//keyboard support for desktop environments
		if (sap.ui.Device.system.desktop) {
			var fnOnEscape = jQuery.proxy(function(oEvent) {
					this.close(true);
					//event should not trigger any further actions
					oEvent.stopPropagation();
			}, this);
			//use pseudo event 'onsapescape' to implement keyboard-trigger for closing this dialog
			this._oPopup.onsapescape = fnOnEscape;
		}
	};
	
	BusyDialog.prototype.openAnimation = function($Ref, iRealDuration, fnOpened) {
		fnOpened();
	};
	
	BusyDialog.prototype.closeAnimation = function($Ref, iRealDuration, fnClose) {
		fnClose();
	};
	
	/**
	 * Destroys the dialog control
	 * @private
	 */
	BusyDialog.prototype.exit = function(){
		this._oPopup.close();
		this._oPopup.destroy();
		this._oPopup = null;
		
		this._$window.unbind("resize", this._fOrientationChange);
	};
	
	/**
	 * Opens the busy popup.
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
	 * Close the busy popup.
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
	
	BusyDialog.prototype._handleOpened = function(){
		this._oPopup.detachOpened(this._handleOpened, this);
		// start busy indicator
		this._busyIndicator.setVisible(true);
		// bind to window resize
		// In android, the orientationchange fires before the size of the window changes
		//  that's why the resize event is used here.
		this._$window.bind("resize", this._fOrientationChange);
	};
	
	BusyDialog.prototype._handleClosed = function(){
		this._oPopup.detachClosed(this._handleClosed, this);
		this._$window.unbind("resize", this._fOrientationChange);
	};
	
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
