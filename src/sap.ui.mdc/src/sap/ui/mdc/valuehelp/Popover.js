/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Container',
	'sap/ui/mdc/util/loadModules',
	"sap/ui/dom/units/Rem",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library"
], function(
	Container,
	loadModules,
	Rem,
	jQuery,
	coreLibrary
) {
	"use strict";

	var MPopover, MLibrary, Toolbar, ToolbarSpacer, ValueStateHeader, InvisibleText;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>Popover</code> container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element showing a popover.
	 * @extends sap.ui.mdc.valuehelp.base.Container
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.Popover
	 */
	var Popover = Container.extend("sap.ui.mdc.valuehelp.Popover", /** @lends sap.ui.mdc.valuehelp.Popover.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContainer",
				"sap.ui.mdc.valuehelp.IDialogContainer",
				"sap.ui.core.PopupInterface"
			],
			properties: {
				/**
				 * Controls the possibility to open this popover container by clicking on a connected control, even if no content enforces it.
				 *
				 * <b>Note:</b> By default, a type-ahead is only shown to provide suggestions when users enter input in a connected control.
				 * This property enables scenarios where popovers need to be shown earlier (for example, recommendations or recently entered values).
				 * See also {@link sap.ui.mdc.ValueHelpDelegate.showTypeahead showTypeahead}
	 			 * @since 1.110.0
				 */
				opensOnClick: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Controls the possibility to open this popover container by focussing on a connected control.
				 *
				 * <b>Note:</b> By default, a type-ahead is only shown to provide suggestions when users enter input in a connected control.
				 * This property enables scenarios where popovers need to be shown earlier (for example, recommendations or recently entered values).
				 * See also {@link sap.ui.mdc.ValueHelpDelegate.showTypeahead showTypeahead}
	 			 * @since 1.112.0
				 */
				opensOnFocus: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregation: "content"
		}
	});

	Popover.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var oPopover = this.getAggregation("_container");
			var oContent = this._oCurrentContent;
			if (oPopover && oContent && oOrigin === oContent && !this.isDestroyStarted()) {
				// Content invalidated -> invalidate Popover to rerender content
				oPopover.invalidate(oOrigin);
			} else { // standard logic
				Container.prototype.invalidate.apply(this, arguments);
			}
		}

	};

	Popover.prototype.getUIAreaForContent = function() {
		// if List or Table needs to be rerendered because of a change the corresponding UIArea is the static-UIArea used in the Popover.
		var oPopover = this.getAggregation("_container");
		if (oPopover) {
			return oPopover.getUIArea();
		}

		return Container.prototype.getUIAreaForContent.apply(this, arguments);

	};

	Popover.prototype._getContent = function () {
		var oContent = this.getContent();
		return oContent && oContent[0];
	};

	Popover.prototype.getContainerControl = function () {
		var oPopover = this.getAggregation("_container");
		var fUpdateValueHelpHeader = function(oControl, oValueStateHeader) {
			if (oControl && oControl.getValueState && oControl.getValueState() !== ValueState.None) {
				oValueStateHeader.setText(oControl.getValueStateText());
				oValueStateHeader.setValueState(oControl.getValueState());
				oValueStateHeader.setVisible(true);
			} else {
				oValueStateHeader.setVisible(false);
			}
		};

		if (!oPopover) {
			return loadModules([
				"sap/m/Popover",
				"sap/m/library",
				"sap/m/Toolbar",
				"sap/m/ToolbarSpacer",
				"sap/m/ValueStateHeader",
				"sap/ui/core/InvisibleText"
			]).then(function (aLoaded) {
				MPopover = aLoaded[0];
				MLibrary = aLoaded[1];
				Toolbar = aLoaded[2];
				ToolbarSpacer = aLoaded[3];
				ValueStateHeader = aLoaded[4];
				InvisibleText = aLoaded[5];

				var oValueStateHeader = new ValueStateHeader();
				fUpdateValueHelpHeader(this.getControl(), oValueStateHeader);

				oPopover = new MPopover(this.getId() + "-pop", {
					contentHeight: "auto",
					placement: MLibrary.PlacementType.VerticalPreferredBottom,
					showHeader: false,
					showArrow: false,
					title: this.getTitle(),
					titleAlignment: MLibrary.TitleAlignment.Center,
					afterOpen: this.handleOpened.bind(this),
					afterClose: this.handleClosed.bind(this),
					customHeader: oValueStateHeader
				}).addStyleClass("sapMdcValueHelpPopover").addStyleClass("sapMComboBoxBasePicker").addStyleClass("sapMComboBoxBasePicker-CTX"); // to have a ComboBox popup

				this._oInvisibleText = new InvisibleText({text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("valuehelp.POPOVER_AVALIABLE_VALUES")}).toStatic();
				oPopover.addAriaLabelledBy(this._oInvisibleText);

				if (oValueStateHeader) {
					oValueStateHeader.setPopup(oPopover);
				}

				oPopover.isPopupAdaptationAllowed = function () {
					return false;
				};

				oPopover.addStyleClass(this.isSingleSelect() ? "sapMdcValueHelpSingleSelect" : "sapMdcValueHelpMultiSelect");

				oPopover.addDelegate({onsapshow: this.handleRequestSwitchToDialog.bind(this)});

				oPopover._getAllContent = function() {
					var oParent = this.getParent();
					var aContent = [];
					if (oParent) {
						if (this._oCurrentContent) {
							aContent.push(this._oCurrentContent);
						}
					}
					return aContent;
				}.bind(this);

				var oContent = this._getContent();
				var oContainerConfig = this.getContainerConfig(oContent);

				if (oContainerConfig) {
					oPopover.setShowArrow(!!oContainerConfig.showArrow);
					oPopover.setShowHeader(!!oContainerConfig.showHeader);
					oPopover.setResizable(!!oContainerConfig.resizable);

					if (oContainerConfig.getContentWidth) {
						oPopover.setContentWidth(oContainerConfig.getContentWidth());
					}
				}

				this.setAggregation("_container", oPopover, true);
				return oPopover;
			}.bind(this));
		}

		fUpdateValueHelpHeader(this.getControl(), oPopover.getCustomHeader());

		return oPopover;
	};

	var _setContainerHeight = function () {
		var oContainer = this.getAggregation("_container");
		var oContent = this._getContent();
		var oContainerConfig = oContent && this.getContainerConfig(oContent);
		if (oContainer && oContainerConfig && oContainerConfig.getContentHeight) {
			var iHeight = oContainerConfig.getContentHeight();
			var iContainerHeight = oContainer.$().find(".sapMPopoverCont").height();
			var bContainerHeightBelowLimit = iContainerHeight < Rem.toPx("30rem");
			oContainer.setContentHeight(!iHeight || bContainerHeightBelowLimit || iContainerHeight >= iHeight ? "auto" : "30rem");
			oContainer.invalidate(); // TODO: Better way? Popover does not always update correctly
		}
	};

	Popover.prototype.providesScrolling = function () {
		return true;
	};

	Popover.prototype.observeChanges = function (oChanges) {
		if (oChanges.name === "content") {
			var oContent = oChanges.child;
			if (oChanges.mutation === "remove") {
				oContent.detachEvent("contentUpdated", _setContainerHeight, this);
				oContent.detachNavigated(this.handleNavigated, this);
			} else {
				oContent.attachEvent("contentUpdated", _setContainerHeight, this); // TODO: put event in content interface ot check existance?
			}
		}
		Container.prototype.observeChanges.apply(this, arguments);
	};

	Popover.prototype.placeContent = function (oPopover) {

		var oContent = this._getContent();
		var oContentPromise = oContent && oContent.getContent();
		var oContainerConfig = this.getContainerConfig(oContent);
		var oFooterContentPromise = oContainerConfig && oContainerConfig.getFooter && oContainerConfig.getFooter();

		return Promise.all([oContentPromise, oFooterContentPromise]).then(function (aContents) {
			this._oCurrentContent = aContents[0];
			var oFooterContent = aContents[1];

			if (oFooterContent && oPopover.getFooter() != oFooterContent && oFooterContent.isA && oFooterContent.isA("sap.m.Toolbar")) {
				oPopover.setFooter(oFooterContent);
				return oPopover;
			}

			if (oFooterContent) {
				if (!oPopover.getFooter()) {
					var aToolbarContent = [new ToolbarSpacer(this.getId() + "-Spacer")].concat(oFooterContent);
					var oToolbar = new Toolbar(this.getId() + "-TB", {
						content: aToolbarContent
					}).setModel(this._oManagedObjectModel, "$help"); // TODO: ManagedObjectModel never created!!!
					oPopover.setFooter(oToolbar);
				} else {
					// TODO: update Toolbar?
				}
			} else if (oPopover.getFooter()) {
				oPopover.setFooter();
			}
			return oPopover;
		}.bind(this));
	};

	Popover.prototype.openContainer = function (oPopover, bTypeahead) {
		if (oPopover.isOpen()) {
			return;
		}

		Container.prototype.openContainer.apply(this, arguments);

		var oContent = this._getContent();
		Promise.resolve(oContent && oContent.onBeforeShow(true)).then(function () {// onBeforeShow should guarantee filtering is done, when we observe the table in showTypeahead
			var oDelegate = this.getValueHelpDelegate();
			var oValueHelp = this.getValueHelp();

			return Promise.resolve(bTypeahead ? oDelegate.showTypeahead(oValueHelp, oContent) : true).then(function (bShowTypeahead) {
				return bShowTypeahead ? Promise.resolve(bShowTypeahead) : Promise.reject(bShowTypeahead);
			});
		}.bind(this)).then(function () {
			var oControl = this.getControl();
			var oTarget = oControl && oControl.getFocusElementForValueHelp ? oControl.getFocusElementForValueHelp(this.isTypeahead()) : oControl;

			if (oTarget && oTarget.getDomRef()) {
				oPopover.setContentMinWidth(jQuery(oTarget.getDomRef()).outerWidth() + "px");
				if (!this.isFocusInHelp()) {
					oPopover.setInitialFocus(oTarget);
				}
				oPopover.openBy(oTarget);
			}
		}.bind(this)).catch(function (oError) {
			this._cancelPromise("open");

			if (oError && oError instanceof Error) { // Re-throw actual errors
				throw oError;
			}

		}.bind(this));
	};

	Popover.prototype.closeContainer = function () {

		Container.prototype.closeContainer.apply(this, arguments);
		var oPopover = this.getAggregation("_container");
		if (oPopover) {
			oPopover.close();
		}

	};

	Popover.prototype.handleOpened = function () {
		_setContainerHeight.call(this);

		Container.prototype.handleOpened.apply(this, arguments);

		var oContent = this._getContent();

		if (oContent) {
			oContent.onContainerOpen();
			oContent.onShow(true);
		}

	};

	Popover.prototype.handleConfirmed = function (oEvent) {
		this.fireConfirm({close: oEvent.getParameter("close") || this.isSingleSelect()});
	};

	Popover.prototype.handleClosed = function (oEvent) {

		var oContent = this._getContent();

		if (oContent) {
			oContent.onHide();
			oContent.onContainerClose();
		}

		var oPopover = this.getAggregation("_container");
		if (oPopover) {
			oPopover._oPreviousFocus = null; // TODO - find real solution
		}

		Container.prototype.handleClosed.apply(this, arguments);
	};

	Popover.prototype.removeFocus = function() {
		var oContent = this._getContent();
		if (oContent) {
			oContent.removeFocus();
		}
	};

	Popover.prototype.navigateInContent = function (iStep) {
		var oContent = this._getContent();
		if (oContent) {
			oContent.navigate(iStep);
		}
	};


	Popover.prototype.getItemForValue = function(oConfig) {
		var oContent = this._getContent();
		if (oContent) {
			return oContent.getItemForValue(oConfig);
		}
	};

	Popover.prototype.isValidationSupported = function(oConfig) {
		var oContent = this._getContent();
		if (oContent) {
			return oContent.isValidationSupported();
		}
	};

	Popover.prototype.getUseAsValueHelp = function() {

		var oContent = this._getContent();
		return oContent && oContent.getUseAsValueHelp && oContent.getUseAsValueHelp();

	};

	Popover.prototype.getValueHelpIcon = function() {

		// ask content for icon
		var oContent = this._getContent();
		return oContent && oContent.getValueHelpIcon();

	};

	Popover.prototype.getAriaAttributes = function(iMaxConditions) {

		var oContent = this._getContent();
		var oContentAttributes = oContent && oContent.getAriaAttributes(iMaxConditions);

		if (oContentAttributes) {
			return {
				contentId: oContentAttributes.contentId,
				ariaHasPopup: oContentAttributes.ariaHasPopup,
				role: this.isDialog() ? "combobox" : null, // Popover is a ComboBox, but only if used as valuehelp, only typeahead has no role (see sap.m.Input)
				roleDescription: oContentAttributes.roleDescription // for multiselect-mTable it needs to be set
			};
		}

		return Container.prototype.getAriaAttributes.apply(this, arguments);

	};

	Popover.prototype.shouldOpenOnFocus = function() {

		return this.getOpensOnFocus();

	};

	Popover.prototype.shouldOpenOnClick = function() {

		var oContent = this._getContent();
		return this.isPropertyInitial("opensOnClick") ? !!oContent && oContent.shouldOpenOnClick() : this.getOpensOnClick(); //If opensOnClick is not explicitly set,  the content's preference is used instead.

	};

	Popover.prototype.shouldOpenOnNavigate = function() {

		var oContent = this._getContent();
		this.bindContentToContainer(oContent); // Content might need config data to determine it's behaviour
		return !!oContent && oContent.shouldOpenOnNavigate();
		// TODO: do we need to unbind here? Re-binding on every navigation would reset selected condition on content what is not wanted
		// How to know when navigation ends?

	};

	Popover.prototype.isNavigationEnabled = function(iStep) {

		if (this.isOpen() || this.getUseAsValueHelp()) { //Typeahead already open or it is used for typing and as value help (ComboBox case)
			var oContent = this._getContent();
			return !!oContent && oContent.isNavigationEnabled(iStep);
		}

		return false;

	};

	Popover.prototype.isFocusInHelp = function() {

		var oContent = this._getContent();
		return !!oContent && oContent.isFocusInHelp();

	};

	Popover.prototype.isMultiSelect = function() {

		var oContent = this._getContent();
		return !!oContent && oContent.isMultiSelect();

	};

	Popover.prototype.isTypeaheadSupported = function () {

		var oContent = this._getContent();
		return oContent && oContent.isSearchSupported();

	};

	Popover.prototype.exit = function () {
		if (this._oCurrentContent) {
			if (!this._oCurrentContent.isDestroyed()) {
				this._oCurrentContent.destroy();
			}
			this._oCurrentContent = null;
		}

		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			delete this._oInvisibleText;
		}

		Container.prototype.exit.apply(this, arguments);
	};

	return Popover;

});
