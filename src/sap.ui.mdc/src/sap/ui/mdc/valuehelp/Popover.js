/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Container',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/thirdparty/jquery',
	'sap/ui/core/library',
	'sap/ui/Device'
], (
	Container,
	OperatorName,
	ValueHelpSelectionType,
	loadModules,
	jQuery,
	coreLibrary,
	Device
) => {
	"use strict";

	let Toolbar, ToolbarSpacer, FormatException;

	// shortcut for sap.ui.core.ValueState
	const { ValueState, TitleLevel } = coreLibrary;

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
	const Popover = Container.extend("sap.ui.mdc.valuehelp.Popover", /** @lends sap.ui.mdc.valuehelp.Popover.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContainer", "sap.ui.mdc.valuehelp.IDialogContainer", "sap.ui.core.PopupInterface"
			],
			properties: {
				/**
				 * Controls the possibility to open this popover container by clicking on a connected control, even if no content enforces it.
				 *
				 * <b>Note:</b> By default, a type-ahead is only shown to provide suggestions when users enter input in a connected control.
				 * This property enables scenarios where popovers need to be shown earlier (for example, recommendations or recently entered values).
				 * See also {@link module:sap/ui/mdc/ValueHelpDelegate.showTypeahead showTypeahead}
				 * @since 1.110.0
				 * @deprecated As of version 1.121.0, replaced by {@link module:sap/ui/mdc/ValueHelpDelegate.shouldOpenOnClick shouldOpenOnClick}
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
				 * See also {@link module:sap/ui/mdc/ValueHelpDelegate.showTypeahead showTypeahead}
				 * @since 1.112.0
				 * @deprecated As of version 1.121.0, replaced by {@link module:sap/ui/mdc/ValueHelpDelegate.shouldOpenOnFocus shouldOpenOnFocus}
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

	Popover.prototype._getContent = function() {
		const oContent = this.getContent();
		return oContent && oContent[0];
	};

	Popover.prototype.getContainerControl = function() {
		const oPopover = this.getAggregation("_container");

		if (!oPopover) {
			if (Device.system.phone) {
				return _getContainerControlPhone.call(this);
			} else {
				return _getContainerControlDesktop.call(this);
			}
		}

		let oValueHelpHeader;
		let oInput;
		if (Device.system.phone) {
			[oValueHelpHeader] = oPopover.getContent();
			[oInput] = oPopover.getSubHeader().getContent();
			const oFormatOptions = _getConditionFormatOptions.call(this);
			this._oInputConditionType.setFormatOptions(oFormatOptions); // as config might be changed
			_updateValueHelpHeaderPhone.call(this, this.getControl(), oValueHelpHeader, undefined, undefined, oInput);
		} else {
			oValueHelpHeader = oPopover.getCustomHeader();
			_updateValueHelpHeader.call(this, this.getControl(), oValueHelpHeader);
		}

		return oPopover;
	};

	function _updateValueHelpHeader(oControl, oValueStateHeader, sValueState, sValueStateText) {
		sValueState = sValueState || oControl && oControl.getValueState && oControl.getValueState();
		sValueStateText = sValueStateText || oControl && oControl.getValueStateText && oControl.getValueStateText();

		if (sValueState && sValueState !== ValueState.None) {
			oValueStateHeader.setText(sValueStateText);
			oValueStateHeader.setValueState(sValueState);
			oValueStateHeader.setVisible(true);
		} else {
			oValueStateHeader.setText();
			oValueStateHeader.setValueState(ValueState.None);
			oValueStateHeader.setVisible(false);
		}
	}

	function _updateValueHelpHeaderPhone(oControl, oValueStateHeader, sValueState, sValueStateText, oInput) {
		_updateValueHelpHeader.call(this, oControl, oValueStateHeader, sValueState, sValueStateText);

		if (oValueStateHeader.getVisible()) {
			oInput.setValueState(oValueStateHeader.getValueState());
			oInput.setValueStateText(oValueStateHeader.getText());
		} else {
			oInput.setValueState(ValueState.None);
			oInput.setValueStateText();
		}

		if (oControl && oControl.getPlaceholder) {
			oInput.setPlaceholder(oControl.getPlaceholder());
		}
		const aConditions = this.getModel("$valueHelp").getObject("/conditions");
		if (this.isSingleSelect()) {
			if (aConditions.length === 1) {
				const sValue = this._oInputConditionType.formatValue(aConditions[0], "string");
				Promise.all([sValue]).then(([sValue]) => { // as formatValue could return a Promise or a condition
					oInput.setValue(sValue);
				}).catch((oException) => {
					if (!(oException instanceof FormatException)) { // TODO: handle FormatException?
						throw oException;
					}
				});
			}
		} else if (this._toggleShowConditions) {
			this._toggleShowConditions(aConditions.length > 0);
		}
	}

	function _getContainerControlDesktop() {
		return loadModules([
			"sap/m/Popover",
			"sap/m/library",
			"sap/m/Toolbar",
			"sap/m/ToolbarSpacer",
			"sap/m/ValueStateHeader",
			"sap/ui/core/InvisibleText",
			"sap/ui/core/Lib"
		]).then((aLoaded) => {
			let MPopover, MLibrary, ValueStateHeader, InvisibleText, Library;
			[MPopover, MLibrary, Toolbar, ToolbarSpacer, ValueStateHeader, InvisibleText, Library] = aLoaded;

			const oValueStateHeader = new ValueStateHeader(this.getId() + "-pop-ValueState");
			_updateValueHelpHeader.call(this, this.getControl(), oValueStateHeader);

			const oPopover = new MPopover(this.getId() + "-pop", {
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
			oPopover._getAnimationDuration = () => 0; // tho prevent delay as no animation happens in current version.

			this._oInvisibleText = new InvisibleText({ text: Library.getResourceBundleFor("sap.ui.mdc").getText("valuehelp.POPOVER_AVALIABLE_VALUES") }).toStatic();
			oPopover.addAriaLabelledBy(this._oInvisibleText);

			if (oValueStateHeader) {
				oValueStateHeader.setPopup(oPopover);
			}

			oPopover.isPopupAdaptationAllowed = function() {
				return false;
			};

			oPopover.addStyleClass(this.isSingleSelect() ? "sapMdcValueHelpSingleSelect" : "sapMdcValueHelpMultiSelect");

			oPopover.addDelegate({ onsapshow: this.handleRequestSwitchToDialog.bind(this) });

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
		});
	}

	function _getContainerControlPhone() {
		return loadModules([
			"sap/m/Dialog",
			"sap/m/Input",
			"sap/m/Button",
			"sap/m/ToggleButton",
			"sap/m/Bar",
			"sap/m/ScrollContainer",
			"sap/m/Title",
			"sap/m/Toolbar",
			"sap/m/ToolbarSpacer",
			"sap/m/ValueStateHeader",
			"sap/m/List",
			"sap/m/StandardListItem",
			"sap/m/library",
			"sap/ui/core/IconPool",
			"sap/ui/core/InvisibleText",
			"sap/ui/core/Lib",
			"sap/ui/model/BindingMode",
			"sap/ui/model/FormatException",
			"sap/ui/model/ParseException",
			"sap/ui/mdc/field/ConditionType"
		]).then((aLoaded) => {
			let Dialog, Input, Button, ToggleButton, Bar, ScrollContainer, Title, ValueStateHeader, List, StandardListItem, MLibrary, IconPool, InvisibleText, Library, BindingMode, ParseException, ConditionType;
			[Dialog, Input, Button, ToggleButton, Bar, ScrollContainer, Title, Toolbar, ToolbarSpacer, ValueStateHeader, List, StandardListItem, MLibrary, IconPool, InvisibleText, Library, BindingMode, FormatException, ParseException, ConditionType] = aLoaded;
			const {TitleAlignment, ListMode, ListType} = MLibrary;
			const oResourceBundleM = Library.getResourceBundleFor("sap.m");
			const bSingleSelect = this.isSingleSelect();
			const oValueStateHeader = new ValueStateHeader(this.getId() + "-pop-ValueState");

			const oFormatOptions = _getConditionFormatOptions.call(this);
			this._oInputConditionType = new ConditionType(oFormatOptions);
			this._oInputConditionType._bVHInput = true; // just help for debugging

			const oInput = new Input(this.getId() + "-pop-input", {
				value: { path: "/filterValue", model: "$valueHelp", mode: BindingMode.OneWay }, // to get initial typed value
				width: "100%",
				showValueStateMessage: false,
				showValueHelp: this.hasDialog(),
				liveChange: (oEvent) => {
					const sValue = oEvent.getParameter("value");
					const oValueHelp = this.getValueHelp();
					if (oValueHelp) {
						oValueHelp.setFilterValue(sValue);
						// TODO: remove conditions while filtering? (in single-value case)
					}
					if (!bSingleSelect) { // if on conditions list, switch back to typeahead list
						this._toggleShowConditions(false);
					}
				},
				submit: async (oEvent) => {
					const sValue = oEvent.getParameter("value");
					if (sValue) { // TODO: support empty key?
						const oFormatOptions = _getConditionFormatOptions.call(this);
						this._oInputConditionType.setFormatOptions(oFormatOptions); // as config might be changed

						try {
							const oCondition = await this._oInputConditionType.parseValue(sValue, "string");
							// TODO: validate condition (if not found in ValueHelp)?
							_updateValueHelpHeaderPhone.call(this, this.getControl(), oValueStateHeader, undefined, undefined, oInput);
							this.fireSelect({type: bSingleSelect ? ValueHelpSelectionType.Set : ValueHelpSelectionType.Add, conditions: [oCondition]});
							this.fireConfirm({close: true});
						} catch (oException) {
							if ((oException instanceof ParseException)) {
								_updateValueHelpHeaderPhone.call(this, this.getControl(), oValueStateHeader, ValueState.Error, oException.message, oInput);
							} else {
								throw oException;
							}
						}
				} else {
						if (bSingleSelect) { // clear value
							this.fireSelect({type: ValueHelpSelectionType.Set, conditions: []});
						}
						this.fireConfirm({close: true});
					}
				},
				valueHelpRequest: (oEvent) => {
					this.handleRequestSwitchToDialog();
				}
			});

			const oSubHeaderTollbar = new Toolbar(this.getId() + "-pop-subheader", {
				content: [oInput]
			});

			const oScrollContainer = new ScrollContainer(this.getId() + "-pop--SC", {
				height: "100%",
				width: "100%",
				vertical: true
			});

			oScrollContainer._oWrapper = this;
			oScrollContainer.getContent = function() {
				const aContent = [];

				if (this._oWrapper._bShowConditions) {
					const [oTokenizerList] = this.getDependents();
					aContent.push(oTokenizerList);
				} else if (this._oWrapper._oCurrentContent) {
					aContent.push(this._oWrapper._oCurrentContent);
				}

				return aContent;
			};

			let oShowConditionsButton;
			const oCloseButton = new Button(this.getId() + "-pop-closeButton", {
				text: oResourceBundleM.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
				press: (oEvent) => {
					oInput.fireSubmit({value: oInput.getValue()}); // to select first matching item
					// switch to typeahead
					if (!bSingleSelect) { // if on conditions list, switch back to typeahead list
						this._toggleShowConditions(false);
					}
				}
			});

			if (!bSingleSelect) { // for multiValue add button to switch to conditions
				const oTokenList = new List(this.getId() + "-pop-tokenList", {
					width: "auto",
					mode: ListMode.Delete,
					"delete": (oEvent) => {
						const oListItem = oEvent.getParameter("listItem");
						const aConditions = this.getModel("$valueHelp").getObject("/conditions");
						const {sPath} = oListItem.getBindingContext("$valueHelp");
						const iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
						const aRemovedConditions = [aConditions[iIndex]];

						this.fireSelect({ type: ValueHelpSelectionType.Remove, conditions: aRemovedConditions });
					}
				});
				oScrollContainer.addDependent(oTokenList);

				this._toggleShowConditions = (bShowConditions) => {
					if (this._bShowConditions !== bShowConditions) {
						this._bShowConditions = bShowConditions;
						if (this._bShowConditions) {
							const oFormatOptions = _getConditionFormatOptions.call(this);
							this._oTokenConditionType = this._oTokenConditionType || new ConditionType(oFormatOptions);
							this._oTokenConditionType._bVHTokenizer = true; // just help for debugging
							this._oTokenConditionType.setFormatOptions(oFormatOptions); // as config might be changed

							const oListItem = new StandardListItem(this.getId() + "-Token", {
								title: { path: '$valueHelp>', type: this._oTokenConditionType },
								selected: true,
								wrapping: true,
								type: ListType.Active,
								wrapCharLimit: 10000
							});

							oTokenList.bindAggregation("items", { path: '/conditions', model: "$valueHelp", templateShareable: false, template: oListItem });
						} else {
							oTokenList.unbindAggregation("items");
						}
						oShowConditionsButton.setPressed(bShowConditions);

						oScrollContainer.invalidate();
					}
				};

				oShowConditionsButton = new ToggleButton(this.getId() + "-pop-subheader-toggle", {
					icon: IconPool.getIconURI("multiselect-all"),
					tooltip: oResourceBundleM.getText("SHOW_SELECTED_BUTTON"),
					press: (oEvent) => {
						this._toggleShowConditions(oEvent.getParameter("pressed"));
					}
				});
				oSubHeaderTollbar.addContent(oShowConditionsButton);
			}

			const oCustomHeaderBar = new Bar(this.getId() + "-pop-header", {
				titleAlignment: TitleAlignment.Auto,
				contentMiddle: new Title(this.getId() + "-pop-header-title", {
					text: this.getTitle(),
					level: TitleLevel.H1
				}),
				contentRight: new Button(this.getId() + "-pop-cancelButton", {
					icon: IconPool.getIconURI("decline"),
					press: (oEvent) => {
						this.fireCancel();
						// switch to typeahead
						if (!bSingleSelect) { // if on conditions list, switch back to typeahead list
							this._toggleShowConditions(false);
						}
					}
				})
			});

			const oDialog = new Dialog(this.getId() + "-pop", {
				beginButton: oCloseButton,
				stretch: true,
				titleAlignment: TitleAlignment.Auto,
				customHeader: oCustomHeaderBar,
				subHeader: oSubHeaderTollbar,
				content: [oValueStateHeader, oScrollContainer],
				horizontalScrolling: false,
				initialFocus: oInput,
				afterOpen: this.handleOpened.bind(this),
				afterClose: this.handleClosed.bind(this)
			});

			this._oInvisibleText = new InvisibleText({ text: Library.getResourceBundleFor("sap.ui.mdc").getText("valuehelp.POPOVER_AVALIABLE_VALUES") }).toStatic();
			oDialog.addAriaLabelledBy(this._oInvisibleText);

			if (oValueStateHeader) {
				_updateValueHelpHeaderPhone.call(this, this.getControl(), oValueStateHeader, undefined, undefined, oInput);
				oValueStateHeader.setPopup(oDialog);
			}

			oDialog.addStyleClass(bSingleSelect ? "sapMdcValueHelpSingleSelect" : "sapMdcValueHelpMultiSelect");
			oDialog.addDelegate({ onsapshow: this.handleRequestSwitchToDialog.bind(this) });

			this.setAggregation("_container", oDialog, true);
			return oDialog;
		});
	}

	function _getConditionFormatOptions() {

		const oValueHelpModel = this.getModel("$valueHelp");
		const oConfig = oValueHelpModel ? oValueHelpModel.getProperty("/_config") : {};
		const oParent = this.getParent();
		const oControl = this.getControl();
		return { // TODO: is more needed?
			maxConditions: -1, // as for tokens there should not be a limit on type side
			valueType: oConfig.dataType,
			additionalValueType: oConfig.additionalDataType,
			operators: oConfig.operators,
			display: oConfig.display,
			hideOperator: oConfig.operators && oConfig.operators.length === 1,
			valueHelpID: oParent && oParent.getId(), // needed to get description for Token (if not provided)
			control: oControl,
			delegate: oControl && oControl.getControlDelegate && oControl.getControlDelegate(),
			delegateName: oControl && oControl.getDelegate && oControl.getDelegate() && oControl.getDelegate().name,
			payload: oControl && oControl.getPayload && oControl.getPayload(),
			convertWhitespaces: true
		};

	}

	Popover.prototype.getScrollDelegate = function(iMaxConditions) {

		if (Device.system.phone) {
			const oDialog = this.getAggregation("_container");
			return oDialog && oDialog.getContent()[1].getScrollDelegate();
		} else {
			return Container.prototype.getScrollDelegate.apply(this, arguments);
		}

	};

	Popover.prototype.providesScrolling = function() {
		return true;
	};

	Popover.prototype.observeChanges = function(oChanges) {
		if (oChanges.name === "content") {
			const oContent = oChanges.child;
			if (oChanges.mutation === "remove") {
				oContent.detachNavigated(this.handleNavigated, this);
			}
		}
		Container.prototype.observeChanges.apply(this, arguments);
	};

	Popover.prototype.placeContent = function(oPopover) {

		const oContent = this._getContent();
		const oContentPromise = oContent && oContent.getContent();
		const oContainerConfig = this.getContainerConfig(oContent);
		const oFooterContentPromise = oContainerConfig && oContainerConfig.getFooter && oContainerConfig.getFooter();

		return Promise.all([oContentPromise, oFooterContentPromise]).then((aContents) => {
			this._oCurrentContent = aContents[0];
			const oFooterContent = aContents[1];

			if (oFooterContent && oPopover.getFooter() != oFooterContent && oFooterContent.isA && oFooterContent.isA("sap.m.Toolbar")) {
				if (Device.system.phone && oPopover.getBeginButton) {
					const oButton = oPopover.getBeginButton();
					oFooterContent.addContent(oButton);
				}
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
		});
	};

	Popover.prototype.openContainer = function(oPopover, bTypeahead) {
		if (oPopover.isOpen()) {
			return;
		}

		Container.prototype.openContainer.apply(this, arguments);

		const oContent = this._getContent();
		const oOpenPromise = this._retrievePromise("open");
		Promise.resolve(oContent && oContent.onBeforeShow(true)).then(() => { // onBeforeShow should guarantee filtering is done, when we observe the table in showTypeahead
			const oDelegate = this.getValueHelpDelegate();
			const oValueHelp = this.getValueHelp();

			return Promise.resolve(bTypeahead ? oDelegate.showTypeahead(oValueHelp, oContent) : true).then((bShowTypeahead) => {
				// Only continue the opening process, if delegate confirms "showTypeahead" and open promise is not canceled (might happen due to focus loss in target control).
				return bShowTypeahead && !oOpenPromise.isCanceled() ? true : Promise.reject();
			});
		}).then(() => {
			if (Device.system.phone) {
				oPopover.open();
			} else {
				this._openContainerByTarget(oPopover);
			}
		}).catch((oError) => {
			this._cancelPromise(oOpenPromise);
			if (oError && oError instanceof Error) { // Re-throw actual errors
				throw oError;
			}
		});
	};

	Popover.prototype._openContainerByTarget = function(oPopover) {
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

	Popover.prototype.closeContainer = function() {

		Container.prototype.closeContainer.apply(this, arguments);
		const oPopover = this.getAggregation("_container");
		if (oPopover) {
			oPopover.close();
		}

	};

	Popover.prototype.handleOpened = function(oEvent) {

		this._resolvePromise("open");

		const oContent = this._getContent();
		let sItemId;

		if (oContent) {
			oContent.onContainerOpen();
			sItemId = oContent.onShow(true);
		}

		this.fireOpened({ itemId: sItemId });

	};

	Popover.prototype.handleConfirmed = function(oEvent) {
		const bSingleSelect = this.isSingleSelect();
		const bClose = oEvent.getParameter("close");
		if (!Device.system.phone || bSingleSelect || bClose) {
			if (!bClose) {
				this._disableFollowOfTemporarily();
			}
			this.fireConfirm({ close: bClose || bSingleSelect });
		}
	};

	// Workaround to prevent the popup from closing unexpectedly should formatting lead to field size adjustments
	Popover.prototype._disableFollowOfTemporarily = function () {
		if (Device.system.phone) { // in phone mode dialog is used
			return;
		}

		if (this._followOfTimer) {
			clearTimeout(this._followOfTimer);
		}
		const oPopover = this.getAggregation("_container");
		oPopover.setFollowOf(false);
		this._followOfTimer = setTimeout(() => {
			oPopover.setFollowOf(true);
		}, 300);
	};

	Popover.prototype.handleCanceled = function(oEvent) {
		if (!Device.system.phone) { // on phone don't cancel if filterValue cleared
			Container.prototype.handleCanceled.apply(this, arguments);
		}
	};

	Popover.prototype.handleClosed = function(oEvent) {

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

	Popover.prototype.removeVisualFocus = function() {
		const oContent = this._getContent();
		oContent?.removeVisualFocus();
	};

	Popover.prototype.setVisualFocus = function() {
		const oContent = this._getContent();
		oContent?.setVisualFocus();
	};

	Popover.prototype.navigateInContent = function(iStep) {
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
				valueHelpEnabled: oContentAttributes.valueHelpEnabled,
				autocomplete: oContentAttributes.autocomplete
			};
		}

		return Container.prototype.getAriaAttributes.apply(this, arguments);

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

	Popover.prototype.isTypeaheadSupported = function() {

		if (Device.system.phone && (this.isSingleSelect() || this.isDialog())) {
			// on phones ComboBox like use casse has no typeahead. MultiInput use case has typeahead.
			return false;
		}

		const oContent = this._getContent();
		return oContent && oContent.isSearchSupported();

	};

	Popover.prototype.setHighlightId = function(sHighlightId) {
		return this._getContent()?.setHighlightId?.(sHighlightId);
	};

	Popover.prototype.exit = function() {
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

		if (this._oInputConditionType) {
			this._oInputConditionType.destroy();
			this._oInputConditionType = undefined;
		}
		if (this._oTokenConditionType) {
			this._oTokenConditionType.destroy();
			this._oTokenConditionType = undefined;
		}

		if (this._followOfTimer) {
			clearTimeout(this._followOfTimer);
			this._followOfTimer = null;
		}

		Container.prototype.exit.apply(this, arguments);
	};

	return Popover;

});