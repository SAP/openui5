/*!
 * ${copyright}
 */

// Provides control sap.m.ResponsivePopover.
sap.ui.define(['jquery.sap.global', './Dialog', './Popover', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, Dialog, Popover, library, Control, IconPool) {
	"use strict";



	/**
	 * Constructor for a new ResponsivePopover.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control acts responsively to the type of device. It acts as a sap.m.Popover on desktop and tablet while acts as a sap.m.Dialog with stretch set to true on phone.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.15.1
	 * @alias sap.m.ResponsivePopover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsivePopover = Control.extend("sap.m.ResponsivePopover", /** @lends sap.m.ResponsivePopover.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * This property only takes effect when runs on desktop or tablet. Please see the documentation {@linkcode sap.m.Popover#placement here}.
			 */
			placement : {type : "sap.m.PlacementType", group : "Misc", defaultValue : sap.m.PlacementType.Right},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#showHeader sap.m.Popover} and {@linkcode sap.m.Dialog#showHeader sap.m.Dialog}
			 */
			showHeader : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#title sap.m.Popover} and {@linkcode sap.m.Dialog#title sap.m.Dialog}
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This property only takes effect when runs on phone. Please see the documentation {@linkcode sap.m.Dialog#icon here}.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * This property only takes effect when runs on desktop or tablet. Please see the documentation {@linkcode sap.m.Popover#modal here}.
			 */
			modal : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * This property only takes effect when runs on desktop or tablet. Please see the documentation {@linkcode sap.m.Popover#offsetX here}.
			 */
			offsetX : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * This property only takes effect when runs on desktop or tablet. Please see the documentation {@linkcode sap.m.Popover#offsetY here}.
			 */
			offsetY : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#contentWidth sap.m.Popover} and {@linkcode sap.m.Dialog#contentWidth sap.m.Dialog}
			 */
			contentWidth : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#contentHeight sap.m.Popover} and {@linkcode sap.m.Dialog#contentHeight sap.m.Dialog}
			 */
			contentHeight : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#horizontalScrolling sap.m.Popover} and {@linkcode sap.m.Dialog#horizontalScrolling sap.m.Dialog}
			 */
			horizontalScrolling : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * This property is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#verticalScrolling sap.m.Popover} and {@linkcode sap.m.Dialog#verticalScrolling sap.m.Dialog}
			 */
			verticalScrolling : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Whether a close button should be inserted to the dialog's header dynamically to close the dialog. This property only takes effect when runs on the phone.
			 */
			showCloseButton : {type : "boolean", group : "Misc", defaultValue : true}
		},
		aggregations : {

			/**
			 * Content is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#content sap.m.Popover} and {@linkcode sap.m.Dialog#content sap.m.Dialog}
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * CustomHeader is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#customHeader sap.m.Popover} and {@linkcode sap.m.Dialog#customHeader sap.m.Dialog}
			 */
			customHeader : {type : "sap.m.IBar", multiple : false},

			/**
			 * SubHeader is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#subHeader sap.m.Popover} and {@linkcode sap.m.Dialog#subHeader sap.m.Dialog}
			 */
			subHeader : {type : "sap.m.IBar", multiple : false},

			/**
			 * BeginButton is supported by both variants. It is always show in the left part (right part in RTL mode) of the footer which is located at the bottom of the ResponsivePopover. If buttons need to be displayed in header, please use customHeader instead.
			 */
			beginButton : {type : "sap.m.Button", multiple : false},

			/**
			 * EndButton is supported by both variants. It is always show in the right part (left part in RTL mode) of the footer which is located at the bottom of the ResponsivePopover. If buttons need to be displayed in header, please use customHeader instead.
			 */
			endButton : {type : "sap.m.Button", multiple : false},

			/**
			 * The internal popup instance which is either a dialog on phone or a popover on the rest of platforms
			 */
			_popup : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		associations : {

			/**
			 * InitialFocus is supported by both variants. Please see the documentation on {@linkcode sap.m.Popover#initialFocus sap.m.Popover} and {@linkcode sap.m.Dialog#initialFocus sap.m.Dialog}
			 */
			initialFocus : {type : "sap.ui.core.Control", multiple : false}
		},
		events : {

			/**
			 * Event is fired before popover or dialog is open.
			 */
			beforeOpen : {
				parameters : {

					/**
					 *
					 * This parameter contains the control which is passed as the parameter when calling openBy method. When runs on the phone, this parameter is undefined.
					 */
					openBy : {type : "sap.ui.core.Control"}
				}
			},

			/**
			 * Event is fired after popover or dialog is open.
			 */
			afterOpen : {
				parameters : {

					/**
					 *
					 * This parameter contains the control which is passed as the parameter when calling openBy method. When runs on the phone, this parameter is undefined.
					 */
					openBy : {type : "sap.ui.core.Control"}
				}
			},

			/**
			 * Event is fired before popover or dialog is closed.
			 */
			beforeClose : {
				parameters : {

					/**
					 *
					 * This parameter contains the control which is passed as the parameter when calling openBy method. When runs on the phone, this parameter is undefined.
					 */
					openBy : {type : "sap.ui.core.Control"},

					/**
					 *
					 * This parameter contains the control which triggers the close of the ResponsivePopover. This parameter is undefined when runs on desktop or tablet.
					 */
					origin : {type : "sap.m.Button"}
				}
			},

			/**
			 * Event is fired after popover or dialog is closed.
			 */
			afterClose : {
				parameters : {

					/**
					 *
					 * This parameter contains the control which is passed as the parameter when calling openBy method. When runs on the phone, this parameter is undefined.
					 */
					openBy : {type : "sap.ui.core.Control"},

					/**
					 *
					 * This parameter contains the control which triggers the close of the ResponsivePopover. This parameter is undefined when runs on desktop or tablet.
					 */
					origin : {type : "sap.m.Button"}
				}
			}
		}
	}});


	/**
	 * Closes the ResponsivePopover.
	 *
	 * @name sap.m.ResponsivePopover#close
	 * @function
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Checks whether the ResponsivePopover is currently open.
	 *
	 * @name sap.m.ResponsivePopover#isOpen
	 * @function
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	ResponsivePopover.prototype.init = function(){
		var that = this;

		this._bAppendedToUIArea = false;

		var settings = {
			beforeOpen: function(oEvent){
				that.fireBeforeOpen({openBy: oEvent.getParameter('openBy')});
			},
			afterOpen: function(oEvent){
				that.fireAfterOpen({openBy: oEvent.getParameter('openBy')});
			},
			beforeClose: function(oEvent){
				that.fireBeforeClose({openBy: oEvent.getParameter('openBy')});
			},
			afterClose: function(oEvent){
				that.fireAfterClose({openBy: oEvent.getParameter('openBy')});
			}
		};
		if (sap.ui.Device.system.phone) {
			this._aNotSupportedProperties = ["placement", "modal", "offsetX", "offsetY", "showCloseButton"];
			settings.stretch = true;
			settings.type = sap.m.DialogType.Standard;
			this._oControl = new Dialog(this.getId() + "-dialog", settings);
		} else {
			this._aNotSupportedProperties = ["icon", "showCloseButton"];
			this._oControl = new Popover(this.getId() + "-popover", settings);
		}

		this.setAggregation("_popup", this._oControl);

		this._oControl.addStyleClass("sapMResponsivePopover");

		this._oDelegate = {
			onBeforeRendering: function(){
				var bShowCloseButton = this.getShowCloseButton(),
					oNavContent, oHeader, oPage, oRealPage;

				if (!bShowCloseButton ||  !sap.ui.Device.system.phone || !this._bContentChanged) {
					return;
				}

				this._bContentChanged = false;

				oHeader = this._oControl._getAnyHeader();
				if (oHeader) {
					this._insertCloseButton(oHeader);
				} else {
					oNavContent = this._getSingleNavContent();
					if (!oNavContent) {
						return;
					}
					//insert the close button to current page's header
					oPage = oNavContent.getCurrentPage();
					oRealPage = this._getRealPage(oPage);
					if (oRealPage && (oHeader = oRealPage._getAnyHeader())) {
						this._insertCloseButton(oHeader);
					}

					//register to the navigation inside navcontainer to insert the closebutton to the page which is being navigated to
					oNavContent.attachEvent("navigate", this._fnOnNavigate , this);
				}
			}
		};

		this._oPageDelegate = {
			onAfterShow: function(){
				var oRealPage = that._getRealPage(this),
					oHeader;
				if (oRealPage && (oHeader = oRealPage._getAnyHeader())) {
					that._insertCloseButton(oHeader);
				}
			}
		};

		this._fnOnNavigate = function(oEvent){
			var oPage = oEvent.getParameter("to");
			if (oPage) {
				oPage.addEventDelegate(this._oPageDelegate, oPage);
			}
		};

		this._oControl.addEventDelegate(this._oDelegate, this);

		//overwrite the _removeChild to detach event listener and remove delegate when the navcontainer is removed from this responsive popover
		this._oControl._removeChild = function(oChild, sAggregationName, bSuppressInvalidate){
			var aPages, i;
			if ((sAggregationName === "content") && (oChild instanceof sap.m.NavContainer)) {
				aPages = oChild.getPages();
				for (i = 0 ; i < aPages.length ; i++) {
					aPages[i].removeEventDelegate(that._oPageDelegate);
				}
				oChild.detachEvent("navigate", that._fnOnNavigate, that);
			}
			Control.prototype._removeChild.apply(this, arguments);
		};
	};


	/**
	 * Opens the ResponsivePopover. The ResponsivePopover is positioned relatively to the control parameter when runs on tablet or desktop and is full screen when runs on phone. Therefore the control parameter only has its usage when runs on tablet or desktop and is ignored when runs on phone.
	 *
	 * @param {object} oControl
	 *
	 *         When this control runs on tablet or desktop, the ResponsivePopover is positioned relatively to this control.
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ResponsivePopover.prototype.openBy = function(oParent){
		if (!this._bAppendedToUIArea && !this.getParent()) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.addContent(this, true);
			this._bAppendedToUIArea = true;
		}

		if (sap.ui.Device.system.phone) {
			return this._oControl.open();
		} else {
			return this._oControl.openBy(oParent);
		}
	};

	ResponsivePopover.prototype.exit = function(){
		if (this._oCloseButton) {
			this._oCloseButton.destroy();
			this._oCloseButton = null;
		}

		if (this._oControl) {
			this._oControl.removeEventDelegate(this._oDelegate);
			this._oControl.destroy();
			this._oControl = null;
		}
	};

	ResponsivePopover.prototype._getCloseButton = function(){
		if (!this._oCloseButton) {
			var that = this;
			this._oCloseButton = new sap.m.Button(this.getId() + "-closeButton", {
				icon: IconPool.getIconURI("decline"),
				press: function(){
					that._oControl._oCloseTrigger = this;
					that.close();
				}
			});
		}
		return this._oCloseButton;
	};

	ResponsivePopover.prototype.addContent = function(oContent){
		this._bContentChanged = true;
		this.addAggregation("content", oContent);
	};

	ResponsivePopover.prototype._getSingleNavContent = Popover.prototype._getSingleNavContent;

	ResponsivePopover.prototype._getRealPage = function(oPage){
		var oReturn = oPage, aContent;

		while (oReturn) {
			if (oReturn instanceof sap.m.Page) {
				return oReturn;
			}
			if (oReturn instanceof sap.ui.core.mvc.View) {
				aContent = oReturn.getContent();
				if (aContent.length === 1) {
					oReturn = aContent[0];
					continue;
				}
			}
			oReturn = null;
		}
		return oReturn;
	};

	ResponsivePopover.prototype._insertCloseButton = function(oHeader){
		var oCloseButton = this._getCloseButton(),
			iIndex;
		if (oHeader) {
			iIndex = oHeader.getAggregation("contentRight", []).length;
			oHeader.insertAggregation("contentRight", oCloseButton, iIndex);
		}
	};

	ResponsivePopover.prototype._firstLetterUpperCase = function(sValue){
		return sValue.charAt(0).toUpperCase() + sValue.slice(1);
	};

	ResponsivePopover.prototype._lastIndexOfUpperCaseLetter = function(sValue){
		var i, sChar;
		for (i = sValue.length - 1 ; i >= 0; i--) {
			sChar = sValue.charAt(i);
			if (sChar === sChar.toUpperCase()) {
				return i;
			}
		}
		return -1;
	};

	ResponsivePopover.prototype._oldSetProperty = ResponsivePopover.prototype.setProperty;
	ResponsivePopover.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate){
		this._oldSetProperty(sPropertyName, oValue, true);
		if (jQuery.inArray(sPropertyName, this._aNotSupportedProperties) === -1) {
			this._oControl["set" + this._firstLetterUpperCase(sPropertyName)](oValue);
		}
		return this;
	};

	ResponsivePopover.prototype._oldSetModel = ResponsivePopover.prototype.setModel;
	ResponsivePopover.prototype.setModel = function(oModel, sName){
		this._oControl.setModel(oModel, sName);
		return this._oldSetModel(oModel, sName);
	};

	ResponsivePopover.prototype._createButtonFooter = function(){
		if (this._oFooter) {
			return this._oFooter;
		}

		this._oFooter = new sap.m.Toolbar(this.getId() + "-footer", {
			content: [new sap.m.ToolbarSpacer()]
		});

		return this._oFooter;
	};

	ResponsivePopover.prototype._setButton = function(sPos, oButton){
		if (this._oControl instanceof Popover) {
			var sGetterName = "get" + this._firstLetterUpperCase(sPos) + "Button",
				oOldButton = this[sGetterName](),
				oFooter = this._createButtonFooter(),
				sPrivateName = "_o" + this._firstLetterUpperCase(sPos) + "Button",
				iIndex = (sPos.toLowerCase() === "begin" ? 0 : 1),
				sOtherGetterName = (sPos.toLowerCase() === "begin" ? "getEndButton" : "getBeginButton");

			if (oOldButton) {
				oFooter.removeContent(oOldButton);
			}
			if (oButton) {
				if (!oFooter.getParent()) {
					this._oControl.setFooter(oFooter);
				}
				oFooter.insertContent(oButton, iIndex + 1);
			} else {
				var oOtherButton = this[sOtherGetterName]();
				if (!oOtherButton) {
					oFooter.destroy();
					this._oFooter = null;
				}
			}

			this[sPrivateName] = oButton;
			return this;
		} else {
			var sAggregationName = sPos.toLowerCase() + "Button";
			return this.setAggregation(sAggregationName, oButton);
		}
	};

	ResponsivePopover.prototype._getButton = function(sPos){
		if (this._oControl instanceof Popover) {
			var sPrivateName = "_o" + this._firstLetterUpperCase(sPos) + "Button";
			return this[sPrivateName];
		} else {
			var sGetterName = "get" + this._firstLetterUpperCase(sPos) + "Button";
			return this[sGetterName]();
		}
	};

	ResponsivePopover.prototype.setBeginButton = function(oButton){
		return this._setButton("begin", oButton);
	};

	ResponsivePopover.prototype.setEndButton = function(oButton){
		return this._setButton("end", oButton);
	};

	ResponsivePopover.prototype.getBeginButton = function(){
		return this._getButton("begin");
	};

	ResponsivePopover.prototype.getEndButton = function(){
		return this._getButton("end");
	};

	// forward all aggregation methods to the inner instance, either the popover or the dialog.
	["bindAggregation", "validateAggregation", "setAggregation", "getAggregation", "indexOfAggregation", "insertAggregation",
		"addAggregation", "removeAggregation", "removeAllAggregation", "destroyAggregation", "setAssociation", "getAssociation",
		"addAssociation", "removeAssociation", "removeAllAssociation"].forEach(function(sName){
			ResponsivePopover.prototype[sName] = function(){
				var iLastUpperCase = this._lastIndexOfUpperCaseLetter(sName),
					sMethodName, res;
				if (jQuery.type(arguments[0]) === "string") {
					if (iLastUpperCase !== -1) {
						sMethodName = sName.substring(0, iLastUpperCase) + this._firstLetterUpperCase(arguments[0]);
						//_oControl can be already destroyed in exit method
						if (this._oControl && this._oControl[sMethodName]) {
							res = this._oControl[sMethodName].apply(this._oControl, Array.prototype.slice.call(arguments, 1));
							return res === this._oControl ? this : res;
						} else {
							return Control.prototype[sName].apply(this, arguments);
						}
					}
				}
				res = this._oControl[sName].apply(this._oControl, arguments);
				return res === this._oControl ? this : res;
			};
	});

	// forward the other necessary methods to the inner instance, but do not check the existence of generated methods like (addItem)
	["invalidate", "close", "isOpen", "addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass",
		"setBindingContext", "getBindingContext", "getBinding", "getBindingInfo", "getBindingPath", "getDomRef"].forEach(function(sName){
			ResponsivePopover.prototype[sName] = function() {
				if (this._oControl && this._oControl[sName]) {
					var res = this._oControl[sName].apply(this._oControl ,arguments);
					return res === this._oControl ? this : res;
				}
			};
	});

	return ResponsivePopover;

}, /* bExport= */ true);
