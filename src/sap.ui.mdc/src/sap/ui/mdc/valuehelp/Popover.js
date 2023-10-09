/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Container',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/thirdparty/jquery',
	'sap/ui/core/library'
], function(
	Container,
	loadModules,
	jQuery,
	coreLibrary
) {
	"use strict";

	let MPopover, MLibrary, Toolbar, ToolbarSpacer, ValueStateHeader, InvisibleText;

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>Popover</code> container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element showing a popover.
	 * @extends sap.ui.mdc.valuehelp.base.Container
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.Popover
	 */
	const Popover = Container.extend("sap.ui.mdc.valuehelp.Popover", /** @lends sap.ui.mdc.valuehelp.Popover.prototype */
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
			const oPopover = this.getAggregation("_container");
			const oContent = this._oCurrentContent;
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
		const oPopover = this.getAggregation("_container");
		if (oPopover) {
			return oPopover.getUIArea();
		}

		return Container.prototype.getUIAreaForContent.apply(this, arguments);

	};

	Popover.prototype._getContent = function () {
		const oContent = this.getContent();
		return oContent && oContent[0];
	};

	Popover.prototype.getContainerControl = function () {
		let oPopover = this.getAggregation("_container");
		const fUpdateValueHelpHeader = function(oControl, oValueStateHeader) {
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

				const oValueStateHeader = new ValueStateHeader();
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
					const oParent = this.getParent();
					const aContent = [];
					if (oParent) {
						if (this._oCurrentContent) {
							aContent.push(this._oCurrentContent);
						}
					}
					return aContent;
				}.bind(this);

				const oContent = this._getContent();
				const oContainerConfig = this.getContainerConfig(oContent);

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

	Popover.prototype.providesScrolling = function () {
		return true;
	};

	Popover.prototype.observeChanges = function (oChanges) {
		if (oChanges.name === "content") {
			const oContent = oChanges.child;
			if (oChanges.mutation === "remove") {
				oContent.detachNavigated(this.handleNavigated, this);
			}
		}
		Container.prototype.observeChanges.apply(this, arguments);
	};

	Popover.prototype.placeContent = function (oPopover) {

		const oContent = this._getContent();
		const oContentPromise = oContent && oContent.getContent();
		const oContainerConfig = this.getContainerConfig(oContent);
		const oFooterContentPromise = oContainerConfig && oContainerConfig.getFooter && oContainerConfig.getFooter();

		return Promise.all([oContentPromise, oFooterContentPromise]).then(function (aContents) {
			this._oCurrentContent = aContents[0];
			const oFooterContent = aContents[1];

			if (oFooterContent && oPopover.getFooter() != oFooterContent && oFooterContent.isA && oFooterContent.isA("sap.m.Toolbar")) {
				oPopover.setFooter(oFooterContent);
				return oPopover;
			}

			if (oFooterContent) {
				if (!oPopover.getFooter()) {
					const aToolbarContent = [new ToolbarSpacer(this.getId() + "-Spacer")].concat(oFooterContent);
					const oToolbar = new Toolbar(this.getId() + "-TB", {
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

		const oContent = this._getContent();
		const oOpenPromise = this._retrievePromise("open");
		Promise.resolve(oContent && oContent.onBeforeShow(true)).then(function () {// onBeforeShow should guarantee filtering is done, when we observe the table in showTypeahead
			const oDelegate = this.getValueHelpDelegate();
			const oValueHelp = this.getValueHelp();

			return Promise.resolve(bTypeahead ? oDelegate.showTypeahead(oValueHelp, oContent) : true).then(function (bShowTypeahead) {
				// Only continue the opening process, if delegate confirms "showTypeahead" and open promise is not canceled (might happen due to focus loss in target control).
				return bShowTypeahead && !oOpenPromise.isCanceled() ? true : Promise.reject();
			});
		}.bind(this)).then(function () {
			this._openContainerByTarget(oPopover);
		}.bind(this)).catch(function (oError) {
			this._cancelPromise(oOpenPromise);
			if (oError && oError instanceof Error) { // Re-throw actual errors
				throw oError;
			}
		}.bind(this));
	};

	Popover.prototype._openContainerByTarget = function (oPopover) {
		const oControl = this.getControl();
		const oTarget = oControl && oControl.getFocusElementForValueHelp ? oControl.getFocusElementForValueHelp(this.isTypeahead()) : oControl;
		if (oTarget && oTarget.getDomRef()) {
			oPopover.setContentMinWidth(jQuery(oTarget.getDomRef()).outerWidth() + "px");
			if (!this.isFocusInHelp()) {
				oPopover.setInitialFocus(oTarget);
			}
			oPopover.openBy(oTarget);
		}
	};

	Popover.prototype.closeContainer = function () {

		Container.prototype.closeContainer.apply(this, arguments);
		const oPopover = this.getAggregation("_container");
		if (oPopover) {
			oPopover.close();
		}

	};

	Popover.prototype.handleOpened = function () {
		Container.prototype.handleOpened.apply(this, arguments);

		const oContent = this._getContent();

		if (oContent) {
			oContent.onContainerOpen();
			oContent.onShow(true);
		}

	};

	Popover.prototype.handleConfirmed = function (oEvent) {
		this.fireConfirm({close: oEvent.getParameter("close") || this.isSingleSelect()});
	};

	Popover.prototype.handleClosed = function (oEvent) {

		const oContent = this._getContent();

		if (oContent) {
			oContent.onHide();
			oContent.onContainerClose();
		}

		const oPopover = this.getAggregation("_container");
		if (oPopover) {
			oPopover._oPreviousFocus = null; // TODO - find real solution
		}

		Container.prototype.handleClosed.apply(this, arguments);
	};

	Popover.prototype.removeFocus = function() {
		const oContent = this._getContent();
		if (oContent) {
			oContent.removeFocus();
		}
	};

	Popover.prototype.navigateInContent = function (iStep) {
		const oContent = this._getContent();
		if (oContent) {
			oContent.navigate(iStep);
		}
	};


	Popover.prototype.getItemForValue = function(oConfig) {
		const oContent = this._getContent();
		if (oContent) {
			return oContent.getItemForValue(oConfig);
		}
	};

	Popover.prototype.isValidationSupported = function(oConfig) {
		const oContent = this._getContent();
		if (oContent) {
			return oContent.isValidationSupported();
		}
	};

	Popover.prototype.getUseAsValueHelp = function() {

		const oContent = this._getContent();
		return oContent && oContent.getUseAsValueHelp && oContent.getUseAsValueHelp();

	};

	Popover.prototype.getValueHelpIcon = function() {

		// ask content for icon
		const oContent = this._getContent();
		return oContent && oContent.getValueHelpIcon();

	};

	Popover.prototype.getAriaAttributes = function(iMaxConditions) {

		const oContent = this._getContent();
		const oContentAttributes = oContent && oContent.getAriaAttributes(iMaxConditions);

		if (oContentAttributes) {
			return {
				contentId: oContentAttributes.contentId,
				ariaHasPopup: oContentAttributes.ariaHasPopup,
				role: this.isDialog() ? "combobox" : null, // Popover is a ComboBox, but only if used as valuehelp, only typeahead has no role (see sap.m.Input)
				roleDescription: oContentAttributes.roleDescription, // for multiselect-mTable it needs to be set
				valueHelpEnabled: oContentAttributes.valueHelpEnabled
			};
		}

		return Container.prototype.getAriaAttributes.apply(this, arguments);

	};

	Popover.prototype.shouldOpenOnFocus = function() {

		return this.getOpensOnFocus();

	};

	Popover.prototype.shouldOpenOnClick = function() {

		const oContent = this._getContent();
		return this.isPropertyInitial("opensOnClick") ? !!oContent && oContent.shouldOpenOnClick() : this.getOpensOnClick(); //If opensOnClick is not explicitly set,  the content's preference is used instead.

	};

	Popover.prototype.shouldOpenOnNavigate = function() {

		const oContent = this._getContent();
		this.bindContentToContainer(oContent); // Content might need config data to determine it's behaviour
		return !!oContent && oContent.shouldOpenOnNavigate();
		// TODO: do we need to unbind here? Re-binding on every navigation would reset selected condition on content what is not wanted
		// How to know when navigation ends?

	};

	Popover.prototype.isNavigationEnabled = function(iStep) {

		if (this.isOpen() || this.getUseAsValueHelp()) { //Typeahead already open or it is used for typing and as value help (ComboBox case)
			const oContent = this._getContent();
			return !!oContent && oContent.isNavigationEnabled(iStep);
		}

		return false;

	};

	Popover.prototype.isFocusInHelp = function() {

		const oContent = this._getContent();
		return !!oContent && oContent.isFocusInHelp();

	};

	Popover.prototype.isMultiSelect = function() {

		const oContent = this._getContent();
		return !!oContent && oContent.isMultiSelect();

	};

	Popover.prototype.isTypeaheadSupported = function () {

		const oContent = this._getContent();
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
