/*!
 * ${copyright}
 */

// Provides control sap.m.ActionSheet.
sap.ui.define([
	'./Dialog',
	'./Popover',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/InvisibleText',
	'sap/ui/base/ManagedObject',
	'sap/ui/Device',
	'./ActionSheetRenderer',
	'./Button',
	"sap/ui/thirdparty/jquery"
],
	function(
		Dialog,
		Popover,
		library,
		Control,
		ItemNavigation,
		InvisibleText,
		ManagedObject,
		Device,
		ActionSheetRenderer,
		Button,
		jQuery
	) {
	"use strict";



	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = library.DialogType;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;



	/**
	 * Constructor for a new ActionSheet.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The action sheet holds a list of options from which the user can select to complete an action.
	 * <h3>Overview</h3>
	 * The options of the action sheet are represented as {@link sap.m.Button buttons} with icons.
	 * Elements in the action sheet are left-aligned. Actions should be arranged in order of importance, from top to bottom.
	 * <h3>Guidelines</h3>
	 * <ul>
	 * <li>Always display text or text and icons for the actions. Do not use icons only.</li>
	 * <li>Always provide a Cancel button on mobile phones.</li>
	 * <li>Avoid scrolling on action sheets.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * On mobile phones the action sheet is displayed in a {@link sap.m.Dialog dialog}.
	 *
	 * On tablets and desktop the action sheet is displayed in a {@link sap.m.Popover popover}.
	 *
	 * When an action is triggered, the action sheet closes and you can display a confirmation as a {@link sap.m.MessageToast message toast}.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @alias sap.m.ActionSheet
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/action-sheet/ Action Sheet}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ActionSheet = Control.extend("sap.m.ActionSheet", /** @lends sap.m.ActionSheet.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The ActionSheet behaves as an sap.m.Popover in iPad and this property is the information about on which side will the popover be placed at. Possible values are sap.m.PlacementType.Left, sap.m.PlacementType.Right, sap.m.PlacementType.Top, sap.m.PlacementType.Bottom, sap.m.PlacementType.Horizontal, sap.m.PlacementType.HorizontalPreferedLeft, sap.m.PlacementType.HorizontalPreferedRight, sap.m.PlacementType.Vertical, sap.m.PlacementType.VerticalPreferedTop, sap.m.PlacementType.VerticalPreferedBottom. The default value is sap.m.PlacementType.Bottom.
			 */
			placement : {type : "sap.m.PlacementType", group : "Appearance", defaultValue : PlacementType.Bottom},

			/**
			 * If this is set to true, there will be a cancel button shown below the action buttons. There won't be any cancel button shown in iPad regardless of this property. The default value is set to true.
			 */
			showCancelButton : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * This is the text displayed in the cancelButton. Default value is "Cancel", and it's translated according to the current locale setting. This property will be ignored when running either in iPad or showCancelButton is set to false.
			 */
			cancelButtonText : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Title will be shown in the header area in iPhone and every Android devices. This property will be ignored in tablets and desktop browser.
			 */
			title : {type : "string", group : "Appearance", defaultValue : null}
		},
		aggregations : {

			/**
			 * These buttons are added to the content area in ActionSheet control. When button is tapped, the ActionSheet is closed before the tap event listener is called.
			 */
			buttons : {type : "sap.m.Button", multiple : true, singularName : "button"},

			/**
			 * The internally managed cancel button.
			 */
			_cancelButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

			/**
			* Hidden texts used for accesibility
			*/
			_invisibleAriaTexts: {type : "sap.ui.core.InvisibleText", multiple : true, visibility : "hidden"}
		},
		defaultAggregation : "buttons",
		events : {

			/**
			 * This event is fired when the cancelButton is tapped. For iPad, this event is also fired when showCancelButton is set to true, and Popover is closed by tapping outside.
			 * @deprecated Since version 1.20.0.
			 * This event is deprecated, use the cancelButtonPress event instead.
			 */
			cancelButtonTap : {deprecated: true},

			/**
			 * This event will be fired before the ActionSheet is opened.
			 */
			beforeOpen : {},

			/**
			 * This event will be fired after the ActionSheet is opened.
			 */
			afterOpen : {},

			/**
			 * This event will be fired before the ActionSheet is closed.
			 */
			beforeClose : {
				parameters: {
					/**
					 * This indicates the trigger of closing the dialog. If dialog is closed by either leftButton or rightButton, the button that closes the dialog is set to this parameter. Otherwise this parameter is set to null. This is valid only for Phone mode of the ActionSheet
					 *
					 */
					origin: {type: "sap.m.Button"}
				}
			},

			/**
			 * This event will be fired after the ActionSheet is closed.
			 */
			afterClose : {
				parameters: {
					/**
					 * This indicates the trigger of closing the control. If dialog is closed by either selection or closeButton (on mobile device), the button that closes the dialog is set to this parameter. Otherwise this parameter is set to null.
					 */
					origin: {type: "sap.m.Button"}
				}
			},

			/**
			 * This event is fired when the cancelButton is clicked.
			 *
			 * <b>Note: </b> For any device other than phones, this event would be fired always when the Popover closes. To prevent this behavior, the <code>showCancelButton</code> property needs to be set to <code>false</code>.
			 */
			cancelButtonPress : {}
		},
		designtime: "sap/m/designtime/ActionSheet.designtime"
	}});

	ActionSheet.prototype.init = function() {
		// this method is kept here empty in case some control inherits from it but forgets to check the existence of this function when chaining the call
		this._fnOrientationChange = this._orientationChange.bind(this);
		//initializing a variable to store information about the selected action when afterClose event has happened.
		this._actionSelected = null;
	};

	ActionSheet.prototype.exit = function() {
		Device.resize.detachHandler(this._fnOrientationChange);

		if (this._parent) {
			this._parent.destroy();
			this._parent = null;
		}
		if (this._oCancelButton) {
			this._oCancelButton.destroy();
			this._oCancelButton = null;
		}

		this._clearItemNavigation();
	};

	ActionSheet.prototype._clearItemNavigation = function() {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}
	};

	// keyboard navigation
	ActionSheet.prototype._setItemNavigation = function() {
		var aButtons = this._getAllButtons(),
			aDomRefs = [],
			oDomRef = this.getDomRef();

		if (oDomRef) {
			this._oItemNavigation.setRootDomRef(oDomRef);
			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i].getEnabled() && aButtons[i].getVisible()) {
					aDomRefs.push(aButtons[i].getFocusDomRef());
				}
			}
			if (this._oCancelButton) {
				aDomRefs.push(this._oCancelButton.getFocusDomRef());
			}
			this._oItemNavigation.setItemDomRefs(aDomRefs);
			this._oItemNavigation.setSelectedIndex(0);
			this._oItemNavigation.setPageSize(5);

			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt"],
				sapprevious: ["alt"]
			});

		}
	};

	ActionSheet.prototype.onmousedown = function (oEvent) {
		//We need this to provide information on how was the Popover dismissed for the afterClose event.
		if (oEvent.srcControl.isA("sap.m.Button") && this.getButtons().indexOf(oEvent.srcControl) !== -1) {
			this._actionSelected = oEvent.srcControl;
		}
	};

	ActionSheet.prototype.onBeforeRendering = function() {
		// The item navigation instance has to be destroyed and created again once the control is rerendered
		// because the intital tabindex setting is only done once inside the item navigation but we need it here
		// every time after the control is rerendered
		this._clearItemNavigation();

		var sTitle = this.getTitle();
		if (this._parent) {
			if (Device.system.phone) {
				this._parent.setTitle(sTitle);
				this._parent.toggleStyleClass("sapMDialog-NoHeader", !sTitle);
			} else {
				this._parent.setPlacement(this.getPlacement());
			}

			if (sTitle) {
				this._parent.addStyleClass("sapMActionSheetDialogWithTitle");
			} else {
				this._parent.removeStyleClass("sapMActionSheetDialogWithTitle");
			}
		}
	};

	ActionSheet.prototype.onAfterRendering = function() {
		// delegate the keyboard handling to ItemNavigation
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false);
		this.addDelegate(this._oItemNavigation);
		this._setItemNavigation();
	};

	ActionSheet.prototype.sapfocusleave = function() {
		this.close();
	};

	/**
	 * Calling this method will make the ActionSheet visible on the screen. The control parameter is the object to which the ActionSheet will be placed.
	 * It can be not only a UI5 control, but also an existing DOM reference. The side of the placement depends on the <code>placement</code> property set in the Popover (on tablet and desktop).
	 * On other platforms, ActionSheet behaves as a standard dialog and this parameter is ignored because dialog is aligned to the screen.
	 *
	 * @param {object} oControl The control to which the ActionSheet is opened
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ActionSheet.prototype.openBy = function(oControl){
		var that = this;

		if (!this._parent) {
			var oOldParent = this.getParent();

			// ActionSheet may already have a parent for dependent aggregation.
			// This parent must be cleared before adding it to the popup instance, otherwise ActionSheet closes immediately after opening for the first time.
			// TODO: after ManagedObject.prototype._removeChild function is fixed for removing control from dependents aggregation, remove this.
			if (oOldParent) {
				this.setParent(null);
			}

			if (!Device.system.phone) {
			//create a Popover instance for iPad
				this._parent = new Popover({
					placement: this.getPlacement(),
					showHeader: false,
					content: [this],
					beforeOpen: function() {
						that.fireBeforeOpen();
					},
					afterOpen: function() {
						that.focus();
						that.fireAfterOpen();
					},
					beforeClose: function() {
						that.fireBeforeClose();
					},
					afterClose: function() {
						if (that.getShowCancelButton()) {
							that.fireCancelButtonTap(); // (This event is deprecated, use the "cancelButtonPress" event instead)
							that.fireCancelButtonPress();
						}
						that._onAfterClose(that._actionSelected);
						that._actionSelected = null;
					},
					ariaLabelledBy: this.getPopupHiddenLabelId() || undefined
				}).addStyleClass("sapMActionSheetPopover");

				/* TODO remove after 1.62 version */
				if (Device.browser.internet_explorer) {
					this._parent._fnAdjustPositionAndArrow = jQuery.proxy(function() {
						Popover.prototype._adjustPositionAndArrow.apply(this);

						var $this = this.$(),
							fContentWidth = $this.children(".sapMPopoverCont")[0].getBoundingClientRect().width;
						jQuery.each($this.find(".sapMActionSheet > .sapMBtn"), function(index, oButtonDom){
							var $button = jQuery(oButtonDom),
								fButtonWidth;
							$button.css("width", "");
							fButtonWidth = oButtonDom.getBoundingClientRect().width;
							if (fButtonWidth <= fContentWidth) {
								$button.css("width", "100%");
							}
						});
					}, this._parent);
				}
			} else {
				//create a Dialog instance for the rest
				this._parent = new Dialog({
					title: this.getTitle(),
					type: DialogType.Standard,
					content: [this],
					beforeOpen: function() {
						that.fireBeforeOpen();
					},
					afterOpen: function() {
						that.focus();
						that.fireAfterOpen();
					},
					beforeClose: function(oEvent){
						that.fireBeforeClose({
							origin: oEvent.getParameter("origin")
						});
					},
					afterClose: function(oEvent){
						that._actionSelected = oEvent.getParameter("origin");
						that._onAfterClose(that._actionSelected);
						that._actionSelected = null;

						Device.resize.detachHandler(that._fnOrientationChange);
					}
				}).addStyleClass("sapMActionSheetDialog");

				if (this.getTitle()) {
					this._parent.addStyleClass("sapMActionSheetDialogWithTitle");
				} else {
					this._parent.addAriaLabelledBy(this.getPopupHiddenLabelId() || undefined);
				}

				if (!Device.system.phone) {
					this._parent.setBeginButton(this._getCancelButton());
				}

				//need to modify some internal methods of Dialog for phone, because
				//the actionsheet won't be sized full screen if the content is smaller than the whole screen.
				//Then the transform animation need to be set at runtime with some height calculation.
				if (Device.system.phone) {
					//remove the transparent property from blocklayer
					this._parent.oPopup.setModal(true);

					this._parent._setDimensions = function() {
						Dialog.prototype._setDimensions.apply(this);

						this.$("cont").css("max-height", "");
					};

					//also need to change the logic for adjusting scrollable area.
					this._parent._adjustScrollingPane = function() {
						var iHeight = this.$().height();

						this.$("cont").css("max-height", iHeight);

						if (this._oScroller) {
							this._oScroller.refresh();
						}
					};
				}
			}

			// Check if this control has already a parent. If yes, add the _parent control into the dependents aggregation
			// to enable model propagation and lifecycle management.
			if (oOldParent) {
				oOldParent.addDependent(this._parent);
			}
		}

		//open the ActionSheet
		if (!Device.system.phone) {
			this._parent.openBy(oControl);
		} else {
			this._parent.open();

			Device.resize.attachHandler(this._fnOrientationChange);
		}
	};

	/**
	 * Calling this method will make the ActionSheet disappear from the screen.
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ActionSheet.prototype.close = function(){
		if (this._parent) {
			this._parent.close();
		}
	};

	/**
	 * The method checks if the ActionSheet is open. It returns true when the ActionSheet is currently open (this includes opening and closing animations), otherwise it returns false.
	 *
	 * @returns {boolean} Whether the ActionSheet is open.
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ActionSheet.prototype.isOpen = function(){
		return !!this._parent && this._parent.isOpen();
	};

	ActionSheet.prototype._createCancelButton = function() {
		if (!this._oCancelButton) {
			var sCancelButtonText = (this.getCancelButtonText()) ? this.getCancelButtonText() : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACTIONSHEET_CANCELBUTTON_TEXT"),
				that = this;
	//			var sButtonStyle = (sap.ui.Device.os.ios) ? sap.m.ButtonType.Unstyled : sap.m.ButtonType.Default;
			this._oCancelButton = new Button(this.getId() + '-cancelBtn', {
				text: sCancelButtonText,
				type: ButtonType.Reject,
				press : function() {
					if (Device.system.phone && that._parent) {
						that._parent._oCloseTrigger = this;
					}
					that.close();
					that.fireCancelButtonTap(); // (This event is deprecated, use the "cancelButtonPress" event instead)
					that.fireCancelButtonPress();
				}
			}).addStyleClass("sapMActionSheetButton sapMActionSheetCancelButton sapMBtnTransparent sapMBtnInverted");

			if (Device.system.phone) {
				this.setAggregation("_cancelButton", this._oCancelButton, true);
			}
		}
		return this;
	};

	ActionSheet.prototype._getCancelButton = function() {
		if (Device.system.phone && this.getShowCancelButton()) {
			this._createCancelButton();
			return this._oCancelButton;
		}
		return null;
	};

	ActionSheet.prototype.setCancelButtonText = function(sText) {
		this.setProperty("cancelButtonText", sText, true);
		if (this._oCancelButton) {
			this._oCancelButton.setText(sText);
		}
		return this;
	};

	ActionSheet.prototype._preProcessActionButton = function(oButton) {
		var sType = oButton.getType();

		if (sType !== ButtonType.Accept && sType !== ButtonType.Reject) {
			oButton.setType(ButtonType.Transparent);
		}
		oButton.addStyleClass("sapMBtnInverted"); // dark background

		if (!oButton.getIcon()) {
			oButton.addStyleClass("sapMActionSheetButtonNoIcon");
		}
		oButton.addStyleClass("sapMActionSheetButton");

		this._parent && this._parent.invalidate();

		return this;
	};

	ActionSheet.prototype._buttonSelected = function() {
		if (Device.system.phone && this._parent) {
			this._parent._oCloseTrigger = this;
		}
		this.close();
	};

	ActionSheet.prototype._orientationChange = function () {
		this._parent._adjustScrollingPane();
	};

	ActionSheet.prototype._addAriaHiddenTexts = function(oButton) {
		var sButtonId = oButton.getId(),
			oInvisibleText;
		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			oInvisibleText = new InvisibleText(sButtonId + "-actionSheetHiddenText");

			this.addAggregation("_invisibleAriaTexts", oInvisibleText, false);
			oButton.addAriaLabelledBy(oInvisibleText.getId());
		}
	};

	ActionSheet.prototype._removeAriaHiddenTexts = function(oButton) {
		oButton.getAriaLabelledBy().forEach(function(sId) {
			var oControl = sap.ui.getCore().byId(sId);

			if (oControl instanceof InvisibleText && sId.indexOf("actionSheetHiddenText") > -1) {
				this.removeAggregation("_invisibleAriaTexts", oControl, false);
				oButton.removeAriaLabelledBy(oControl);
				oControl.destroy();
			}
		}, this);
	};

	/* Override API methods */
	ActionSheet.prototype.addButton = function(oButton) {
		this.addAggregation("buttons", oButton, false);
		this._addAriaHiddenTexts(oButton);
		this._preProcessActionButton(oButton);
		oButton.attachPress(this._buttonSelected, this);
		return this;
	};

	ActionSheet.prototype.insertButton = function(oButton, iIndex) {
		this.insertAggregation("buttons", oButton, iIndex, false);
		this._addAriaHiddenTexts(oButton);
		this._preProcessActionButton(oButton);
		oButton.attachPress(this._buttonSelected, this);
		return this;
	};

	ActionSheet.prototype.removeButton = function(oButton) {
		var result = this.removeAggregation("buttons",oButton, false);
		if (result) {
			result.detachPress(this._buttonSelected, this);
			this._removeAriaHiddenTexts(result);
		}
		return result;
	};

	ActionSheet.prototype.removeAllButtons = function() {
		var result = this.removeAllAggregation("buttons", false),
			that = this;
		jQuery.each(result, function(i, oButton) {
			oButton.detachPress(that._buttonSelected, that);
			that._removeAriaHiddenTexts(oButton);
		});
		return result;
	};

	ActionSheet.prototype.clone = function() {
		var aButtons = this.getButtons();
		for ( var i = 0; i < aButtons.length; i++) {
			aButtons[i].detachPress(this._buttonSelected, this);
		}

		var oClone = Control.prototype.clone.apply(this, arguments);

		for ( var j = 0; j < aButtons.length; j++) {
			aButtons[j].attachPress(this._buttonSelected, this);
		}

		return oClone;
	};

	/**
	 * A hook for controls that extend action sheet to determine how the buttons array is formed
	 * @returns {sap.m.Button[]} An array of all ActionSheet buttons
	 * @private
	 */
	ActionSheet.prototype._getAllButtons = function() {
		return this.getButtons();
	};

	/**
	 * Gets the ID of the hidden label
	 * @returns {string} ID of hidden text
	 * @protected
	 */
	ActionSheet.prototype.getPopupHiddenLabelId = function() {
		return InvisibleText.getStaticId("sap.m", "ACTIONSHEET_AVAILABLE_ACTIONS");
	};

	/**
	 * Popup controls should not propagate contextual width
	 * @private
	 */
	ActionSheet.prototype._applyContextualSettings = function () {
		ManagedObject.prototype._applyContextualSettings.call(this, ManagedObject._defaultContextualSettings);
	};

	/**
	 * Extends the afterClose event by providing context information.
	 * @param {sap.m.Button | null} Action selected on Popover close
	 * @private
	 */
	ActionSheet.prototype._onAfterClose = function (oAction) {
		this.fireAfterClose({
			origin: oAction
		});
	};

	return ActionSheet;

});