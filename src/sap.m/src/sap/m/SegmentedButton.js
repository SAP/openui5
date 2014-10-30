/*!
 * ${copyright}
 */

// Provides control sap.m.SegmentedButton.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/delegate/ItemNavigation'],
	function(jQuery, library, Control, EnabledPropagator, ItemNavigation) {
	"use strict";


	
	/**
	 * Constructor for a new SegmentedButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A SegmentedButton Control is a horizontal control made of multiple buttons which can display a title or an image. It automatically resizes the buttons to fit proportionally within the control. When no width is set, the control uses the available width.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.SegmentedButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SegmentedButton = Control.extend("sap.m.SegmentedButton", /** @lends sap.m.SegmentedButton.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Set the width of the SegmentedButton control. If not set, it uses the minimum required width to make all buttons inside of the same size (based on the biggest button).
			 * 
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},
	
			/**
			 * boolean property to make the control visible or invisible
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * If disabled all buttons look grey, you cannot focus on them, you can not even click on them.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		defaultAggregation : "buttons",
		aggregations : {
	
			/**
			 * The buttons of the SegmentedButton control. The items set in this aggregation are used as an interface for the buttons displayed by the control. Only the properties "id", "icon", "text", and "enabled" of the Button control are evaluated. Setting other properties of the button will have no effect. Alternatively, you can use the "createButton" method to add buttons.
			 */
			buttons : {type : "sap.m.Button", multiple : true, singularName : "button"}
		},
		associations : {
	
			/**
			 * A reference to the currently selected button control. By default or if the association is set to a falsy value (null, undefined, "", false), the first button will be selected.
			 * If the association is set to an invalid value (e.g. an ID of a button that does not exist) the selection on the SegmentedButton will be removed.
			 */
			selectedButton : {type : "sap.m.Button", multiple : false}
		},
		events : {
	
			/**
			 * Event is fired when the user selects a button, which returns the id and button object
			 */
			select : {
				parameters : {
	
					/**
					 * Reference to the button that has just been selected
					 */
					button : {type : "sap.m.Button"}, 
	
					/**
					 * Id of the button which has just been selected
					 */
					id : {type : "string"}
				}
			}
		}
	}});
	
	
	/**
	 * Convenient method to add a button with a text as title OR an URI for an icon. Using both is not supported.
	 *
	 * @name sap.m.SegmentedButton#createButton
	 * @function
	 * @param {string} sText
	 *         Set the text of a SegmentedButton button.
	 * @param {sap.ui.core.URI} sIcon
	 *         Icon to be displayed as graphical element within the button.
	 * 
	 *         Density related image will be loaded if image with density awareness name in format [imageName]@[densityValue].[extension] is provided.
	 * @param {boolean} bEnabled
	 *         Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	EnabledPropagator.call(SegmentedButton.prototype);
	
	SegmentedButton.prototype.init = function () {
		if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version <= 10) {
			this._isMie = true;
		}
		this._aButtonWidth = [];
		this._oGhostButton;
		
		//create the ghost button which is used to get the actual width of each button
		this._createGhostButton();
		
		// Delegate keyboard processing to ItemNavigation, see commons.SegmentedButton
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false);
		this.addDelegate(this._oItemNavigation);
		
		//Make sure when a button gets removed to reset the selected button
		this.removeButton = function (sButton) {
			SegmentedButton.prototype.removeButton.call(this, sButton);
			this.setSelectedButton(this.getButtons()[0]);
		};
	};
	
	SegmentedButton.prototype._createGhostButton = function (oButton) {
		if (jQuery("#segMtBtn_calc").length == 0) {
			this._oGhostButton = document.createElement("Button");
			var span = document.createElement("span");
			jQuery(span).addClass("sapMBtnContent");
			this._oGhostButton.appendChild(span);
			this._oGhostButton.setAttribute("id", "segMtBtn_calc");
			jQuery(this._oGhostButton).addClass("sapMBtn sapMBtnDefault sapMBtnPaddingLeft sapMSegBBtn");
			this._oGhostButton = jQuery(this._oGhostButton);
		} else {
			this._oGhostButton = jQuery("#segMtBtn_calc");
		}
	};
	
	SegmentedButton.prototype._setGhostButtonText = function (oButton) {
		var sText = oButton.getText(),
			ghostButton = jQuery("#segMtBtn_calc"); //refresh the dom pointer
	
		if (oButton.getIcon().length == 0 && oButton.getWidth().length == 0) {
			ghostButton.find("span").text(sText);
			this._aButtonWidth.push(ghostButton.width());
		} else {
			this._aButtonWidth.push(0);
		}
	};
	
	SegmentedButton.prototype._getButtonWidths = function () {
		var aButtons = this.getButtons(),
			i = 0;
	
		if (this._oGhostButton.length == 0) {
			return;
		} else {
			for (; i < aButtons.length; i++) {
				this._setGhostButtonText(aButtons[i]);
			}
		}
	};
	
	SegmentedButton.prototype.onBeforeRendering = function () {
		var oStaticAreaDom = sap.ui.getCore().getStaticAreaRef();
	
		this._aButtonWidth = [];
	
		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	
		if (jQuery("#segMtBtn_calc").length == 0) {
			oStaticAreaDom.appendChild(this._oGhostButton[0]);
		}
	
		if (!this.getSelectedButton()) {
			this._selectDefaultButton();
		}
	};
	
	SegmentedButton.prototype.onAfterRendering = function () {
		//register resize listener on parent
		if (!this._sResizeListenerId) {
			var oParent = this.getParent(),
				oParentDom = null;
	
			if (oParent instanceof Control) {
				oParentDom = oParent.getDomRef();
			} else if (oParent instanceof sap.ui.core.UIArea) {
				oParentDom = oParent.getRootNode();
			}
			if (oParentDom) {
				this._sResizeListenerId = sap.ui.core.ResizeHandler.register(oParentDom,  jQuery.proxy(this._fHandleResize, this));
			}
		}
		//get the size of each button
		this._getButtonWidths();
		
	
		//Flag if control is inside a popup
		this._bInsidePopup = (this.$().closest(".sapMPopup-CTX").length > 0);
	
		//Flag if control is inside the bar. If inside bar the buttons always use the width they need.
		this._bInsideBar = (this.$().closest('.sapMIBar').length > 0) ? true : false;
	
		var aButtons = this.getButtons();
		var bAllIcons = true;
		var that = this;
		for (var i = 0; i < aButtons.length; i++) {
			if (aButtons[i].getIcon() === "") {
				bAllIcons = false;
			}
		}
		if (bAllIcons) {
			this.$().toggleClass("sapMSegBIcons", true);
		}
		if (this._isMie) {
			setTimeout(function () {
				that._fCalcBtnWidth();
			},0);
		} else {
			that._fCalcBtnWidth();
		}
		this.$().removeClass("sapMSegBHide");
		// Keyboard
		this._setItemNavigation();
	};
	
	/**
	 * Called after the theme has been switched, required for new width calc
	 * @private
	 */
	SegmentedButton.prototype.onThemeChanged = function (oEvent){
		//this._fCalcBtnWidth();
	};
	/**
	 * This function is called to manually set the width of each segmentedbutton button 
	 * on the basis of the widest item after they have been rendered or an orientation change/theme change
	 * took place. 
	 * @private
	 */
	SegmentedButton.prototype._fCalcBtnWidth = function () {
		var iItm = this.getButtons().length;
		if (iItm === 0 || !this.$().is(":visible"))  {
			return;
		}
		var iMaxWidth = 5,
			$this = this.$(),
			iParentWidth = 0,
			iCntOutWidth = $this.outerWidth(true) - $this.width(),
			iBarContainerPadding = $this.closest('.sapMBarContainer').outerWidth() - $this.closest('.sapMBarContainer').width(),
            iBarContainerPaddingFix = 2,//Temporary solution to fix the segmentedButton with 100% width in dialog issue.
			iInnerWidth = $this.children('#' + this.getButtons()[0].getId()).outerWidth(true) - $this.children('#' + this.getButtons()[0].getId()).width();
			// If parent width is bigger than actual screen width set parent width to screen width => android 2.3
			iParentWidth;
	
		if (jQuery(window).width() < $this.parent().outerWidth()) {
			iParentWidth = jQuery(window).width();
		} else if (this._bInsideBar) {
			iParentWidth = $this.closest('.sapMBar').width();
		} else {
			iParentWidth = $this.parent().width();
		}
	
		// fix: in 1.22 a padding was added to the bar container, we have to take this into account for the size calculations here
		if (this._bInsideBar && iBarContainerPadding > 0) {
			iParentWidth -= iBarContainerPadding + iBarContainerPaddingFix;
        }
	
		if (this.getWidth() && this.getWidth().indexOf("%") === -1) {
			iMaxWidth = parseInt(this.getWidth(), 10);
			var iCustomBtnWidths = iItm;
			for (var i = 0; i < iItm; i++) {
				var sWidth = this.getButtons()[i].getWidth();
				if (sWidth.length > 0 && sWidth.indexOf("%") === -1) {
					iMaxWidth = iMaxWidth - parseInt(sWidth, 10);
					iCustomBtnWidths--;
				}
			}
			iMaxWidth = iMaxWidth / iCustomBtnWidths;
			iMaxWidth = iMaxWidth - iInnerWidth;
		} else {
			iMaxWidth = Math.max.apply(null, this._aButtonWidth);
			// If buttons' total width is still less than the available space and
			// buttons shouldn't occupy the whole space (not set with 100%)
			if (!(((iParentWidth - iCntOutWidth) > iMaxWidth * iItm) && this.getWidth().indexOf("%") === -1)) {
				// otherwise each button gets the same size available
				iMaxWidth = (iParentWidth - iCntOutWidth) / iItm;
				iMaxWidth = iMaxWidth - iInnerWidth;
			}
		}
	
		for (var i = 0; i < iItm; i++) {
			if (!isNaN(iMaxWidth) && iMaxWidth > 0) {
				// Bug: +2px for IE9(10)
				// When segmentedButton is in popup, its size can't be increased because otherwise it triggers resize of the dialog again.
				iMaxWidth = this._isMie && !this._bInsidePopup ? iMaxWidth + 2 : iMaxWidth;
				// Use the given width of the button (when present)
				if (this.getButtons()[i].getWidth().length > 0) {
					var sBtnWidth = this.getButtons()[i].getWidth();
					var iWidth = sBtnWidth.indexOf("%") == -1 ? ( parseInt(sBtnWidth, 10) - iInnerWidth ) : sBtnWidth;
					$this.children('#' + this.getButtons()[i].getId()).width(iWidth);
				} else {
					$this.children('#' + this.getButtons()[i].getId()).width(iMaxWidth);
				}
			}
		}
	};
	/**
	 * The orientationchange event listener
	*/
	SegmentedButton.prototype._fHandleResize = function () {
		this._fCalcBtnWidth();
	};
	
	SegmentedButton.prototype.exit = function () {
		if (this._sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
		if (this._oGhostButton) {
			jQuery("#segMtBtn_calc").remove();
			this._oGhostButton = null;
		}
	
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}
	};
	
	SegmentedButton.prototype._setItemNavigation = function () {
		var aButtons,
			oDomRef = this.getDomRef();
	
		if (oDomRef) {
			this._oItemNavigation.setRootDomRef(oDomRef);
			aButtons = this.$().find(".sapMSegBBtn:not(.sapMSegBBtnDis)");
			this._oItemNavigation.setItemDomRefs(aButtons);
			this._focusSelectedButton();
		}
	};
	
	/**
	 * Convenient method to add a button with a text as title or an uri for an icon. 
	 * Only one is allowed.
	 *
	 * @param {string}
	 *         sText defines the title text of the newly created button
	 * @param {sap.ui.core.URI}
	 *        sURI defines the icon uri of the button
	 * @param {boolean}
	 *        [bEnabled] sets the enabled status of the button
	 * @return {sap.m.Button} the created button
	 * @public
	 */
	SegmentedButton.prototype.createButton = function (sText, sURI, bEnabled) {
		var oButton = new sap.m.Button();
		
		if (sURI === null && sText !== null) {
			oButton.setText(sText);
		}
		if (sURI !== null && sText === null) {
			oButton.setIcon(sURI);
		}
		if (bEnabled || bEnabled === undefined) {
			oButton.setEnabled(true);
		} else {
			oButton.setEnabled(false);
		}
		this.addButton(oButton);
	
		return oButton;
	};
	
	(function (){
		SegmentedButton.prototype.addButton = function (oButton) {
			if (oButton) {
				processButton(oButton, this);
				
				this.addAggregation('buttons', oButton);
				return this;
			}
			
		};
	
		SegmentedButton.prototype.insertButton = function (oButton, iIndex) {
			if (oButton) {
				processButton(oButton, this);
				this.insertAggregation('buttons', oButton, iIndex);
				return this;
			}
	
		};
	
		function processButton(oButton, oParent){
			oButton.attachPress(function (oEvent) {
				oParent._buttonPressed(oEvent);
			});
	
			var fnOriginalSetEnabled = sap.m.Button.prototype.setEnabled;
			oButton.setEnabled = function (bEnabled) {
				oButton.$().toggleClass("sapMSegBBtnDis", !bEnabled)
						   .toggleClass("sapMFocusable", bEnabled);
	
				fnOriginalSetEnabled.apply(oButton, arguments);
			};
		}
		
	})();
	
	SegmentedButton.prototype.removeButton = function (oButton) {
		if (oButton) {
			delete oButton.setEnabled;
			this.removeAggregation("buttons", oButton);
		}
		
	};
	
	SegmentedButton.prototype.removeAllButtons = function () {
		var aButtons = this.getButtons();
		if (aButtons) {
			for ( var i = 0; i < aButtons.length; i++) {
				var oButton = aButtons[i];
				if (oButton) {
					delete oButton.setEnabled;
					this.removeAggregation("buttons", oButton);
				}
				
			}
		}
		
	};
	
	/** event handler for the internal button press events
	 * @private
	 */
	SegmentedButton.prototype._buttonPressed = function (oEvent) {
		var oButtonPressed = oEvent.getSource();
	
		if (this.getSelectedButton() !== oButtonPressed.getId()) {
			// CSN# 0001429454/2014: remove class for all other items
			this.getButtons().forEach(function (oButton) {
				oButton.$().removeClass("sapMSegBBtnSel");
			});
			oButtonPressed.$().addClass("sapMSegBBtnSel");
	
			this.setAssociation('selectedButton', oButtonPressed, true);
			this.fireSelect({
				button: oButtonPressed,
				id: oButtonPressed.getId()
			});
		}
	};
	
	/**
	 * Internal helper function that sets the association <code>selectedButton</code> to the first button.
	 * @private
	 */
	SegmentedButton.prototype._selectDefaultButton = function () {
		var aButtons = this.getButtons();
	
		// CSN# 0001429454/2014: when the id evaluates to false (null, undefined, "") the first button should be selected
		if (aButtons.length > 0) {
			this.setAssociation('selectedButton', aButtons[0], true);
		}
	};
	
	/**
	 * Setter for association <code>selectedButton</code>.
	 *
	 * @param {string | sap.m.Button | null | undefined} vButton new value for association <code>setSelectedButton</code>
	 *    An sap.m.Button instance which becomes the new target of this <code>selectedButton</code> association.
	 *    Alternatively, the id of an sap.m.Button instance may be given as a string.
	 *    If the value of null, undefined, or an empty string is provided the first item will be selected.
	 * @returns {sap.m.SegmentedButton} <code>this</code> this pointer for chaining
	 * @public
	 */
	SegmentedButton.prototype.setSelectedButton = function (vButton) {
		var sSelectedButtonBefore = this.getSelectedButton(),
			oSelectedButton;
	
		// set the new value
		this.setAssociation("selectedButton", vButton, true);
	
		// CSN# 1143859/2014: update selection state in DOM when calling API method to change the selection
		if (sSelectedButtonBefore !== this.getSelectedButton()) {
			// CSN# 0001429454/2014: only update DOM when control is already rendered (otherwise it will be done in onBeforeRendering)
			if (this.$().length) {
				if (!this.getSelectedButton()) {
					this._selectDefaultButton();
				}
				oSelectedButton = sap.ui.getCore().byId(this.getSelectedButton());
				this.getButtons().forEach(function (oButton) {
					oButton.$().removeClass("sapMSegBBtnSel");
				});
				if (oSelectedButton) {
					oSelectedButton.$().addClass("sapMSegBBtnSel");
				}
				this._focusSelectedButton();
			}
		}
	};
	
	SegmentedButton.prototype._focusSelectedButton = function () {
		var aButtons = this.getButtons(),
			selectedButtonId = this.getSelectedButton(),
			i = 0;
	
		for (; i < aButtons.length; i++) {
			if (aButtons[i] && aButtons[i].getId() === selectedButtonId) {
				this._oItemNavigation.setFocusedIndex(i);
				break;
			}
		}
	};
	
	SegmentedButton.prototype.onsappagedown = function(oEvent) {
		this._oItemNavigation.onsapend(oEvent);
	};
	
	SegmentedButton.prototype.onsappageup = function(oEvent) {
		this._oItemNavigation.onsaphome(oEvent);
	};

	return SegmentedButton;

}, /* bExport= */ true);
