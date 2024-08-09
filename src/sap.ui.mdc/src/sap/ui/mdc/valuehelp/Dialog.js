/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	'sap/ui/mdc/valuehelp/base/Container',
	'sap/ui/mdc/valuehelp/base/DialogTab',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/Device',
	'sap/m/VBox',
	'sap/m/FlexItemData',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/mdc/util/Common',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/base/strings/formatMessage',
	'sap/base/i18n/Localization',
	'sap/ui/core/library',
	'sap/ui/core/InvisibleMessage'
], (
	Library,
	Container,
	DialogTab,
	loadModules,
	Device,
	VBox,
	FlexItemData,
	ResourceModel,
	Common,
	ValueHelpSelectionType,
	formatMessage,
	Localization,
	coreLibrary,
	InvisibleMessage
) => {
	"use strict";

	/**
	 * Object to label groups in the value help dialog.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.valuehelp.content.GroupLabel
	 * @property {string} label Label with counter. The placeholder for counter needs to be defined with <code>{0}</code>
	 * @property {string} nnLabel Label without counter
	 * @public
	 */

	// translation utils
	let oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	Localization.attachChange(() => {
		oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	});

	let MDialog, MLibrary, Button, ManagedObjectModel, IconTabBar, IconTabFilter;
	let Panel, HBox, MultiInput, Token, Filter;
	const { InvisibleMessageMode } = coreLibrary;

	/**
	 * Constructor for a new <code>Dialog</code> container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element showing a dialog.
	 * @extends sap.ui.mdc.valuehelp.base.Container
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.Dialog
	 */
	const Dialog = Container.extend("sap.ui.mdc.valuehelp.Dialog", /** @lends sap.ui.mdc.valuehelp.Dialog.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.IDialogContainer", "sap.ui.core.PopupInterface"
			],
			properties: {
				_selectedContentKey: {
					type: "string",
					visibility: "hidden"
				},
				_quickSelectEnabled: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false
				},
				_selectableContents: {
					type: "object[]",
					visibility: "hidden",
					defaultValue: []
				},
				/**
				 * Configuration for groups (collective search).
				 *
				 * The object needs to contain an entry for every possible group. The labels of every group need to have a structure of {@link sap.ui.mdc.valuehelp.content.GroupLabel}.
				 * If no configuration is provided a standard text "search and select" is used.
				 *
				 * <b>Sample:</b>
				 * <pre>
				 * {
				 * group1: {label: "Label 1", nnLabel: "Label 1 ({0})"},
				 * group2: {label: "Label 2", nnLabel: "Label 2 ({0})"}
				 * }
				 * </pre>
				 */
				groupConfig: {
					type: "object",
					defaultValue: {}
				}
			},
			defaultAggregation: "content"
		}
	});

	function _getContentHeight() {
		if (Device.system.desktop) {
			return "700px";
		}
		if (Device.system.tablet) {
			return Device.orientation.landscape ? "600px" : "600px";
		}
	}

	function _getContentWidth() {
		if (Device.system.desktop) {
			return "1080px";
		}
		if (Device.system.tablet) {
			return Device.orientation.landscape ? "920px" : "600px";
		}
	}

	function _isValidContentGroup(sName) {
		const aContent = this.getContent();
		return aContent.filter((oContent) => {
			return !!oContent.getVisible() && oContent.getGroup && oContent.getGroup() === sName;
		}).length > 1;
	}

	Dialog.prototype._handleContentSelectionChange = function(sNextId, bCollectiveSearchChange) {
		this.fireRequestDelegateContent({ container: this.getId(), contentId: sNextId });
		return this.getRetrieveDelegateContentPromise().then(() => {
			const sCurrentContentKey = this.getProperty("_selectedContentKey");
			const aContents = this.getContent();
			const oCurrentContent = sCurrentContentKey && aContents && aContents.find((oContent) => {
				return oContent.getId() === sCurrentContentKey;
			});
			if (oCurrentContent) {
				if (oCurrentContent.setCollectiveSearchSelect) {
					oCurrentContent.setCollectiveSearchSelect(undefined); // remove collective search from Filterbar
				}
				oCurrentContent.onHide();
				this.unbindContentFromContainer(oCurrentContent);
			}
			return this._renderSelectedContent(sNextId, undefined, bCollectiveSearchChange);
		});
	};

	Dialog.prototype._onTabBarSelect = function(oEvent) {
		const oNextKey = oEvent && oEvent.getParameter("key");
		this._handleContentSelectionChange(oNextKey);
	};

	Dialog.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			const aContent = this.getContent();
			const iIndex = aContent.indexOf(oOrigin);
			if (this._oIconTabBar && iIndex !== -1 && !this.isDestroyStarted()) {
				// Content invalidated -> invalidate corresponding IconTabFilter
				const aItems = this._oIconTabBar.getItems();
				if (aItems[iIndex]) {
					aItems[iIndex].invalidate(oOrigin);
				}
			} else { // standard logic
				Container.prototype.invalidate.apply(this, arguments);
			}
		}

	};

	Dialog.prototype.getUIAreaForContent = function() {
		const oDialog = this.getAggregation("_container");
		if (oDialog) {
			return oDialog.getUIArea();
		}
		return Container.prototype.getUIAreaForContent.apply(this, arguments);
	};

	Dialog.prototype.handleConfirmed = function(oEvent) {
		this.fireConfirm({ close: true });
	};

	Dialog.prototype.handleClosed = function(oEvent) {

		const oContent = this.getSelectedContent();

		if (oContent) {
			oContent.onHide();
		}

		this.getContent().forEach((oContent) => {
			oContent.onContainerClose();
		});

		// Reset selection to initial key for retrieveContent calls before it is opened again.
		this.setProperty("_selectedContentKey", this._sInitialContentKey);

		Container.prototype.handleClosed.apply(this, arguments);
	};

	Dialog.prototype.getContainerControl = function() {
		if (!this.getModel("$i18n")) {
			// if ResourceModel not provided from outside create own one
			this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
		}

		const oDialog = this.getAggregation("_container");

		if (!oDialog) {
			return this._retrievePromise("dialog", () => {
				return loadModules([
					"sap/m/Dialog",
					"sap/m/Button",
					"sap/ui/model/base/ManagedObjectModel",
					"sap/m/library"
				]).then((aModules) => {

					MDialog = aModules[0];
					Button = aModules[1];
					ManagedObjectModel = aModules[2];
					MLibrary = aModules[3];

					const { ButtonType } = MLibrary;

					if (!this._oResourceBundle) {
						this._oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
					}

					this.oButtonOK = new Button(this.getId() + "-ok", {
						text: this._oResourceBundle.getText("valuehelp.OK"),
						enabled: "{$valueHelp>/_valid}",
						type: ButtonType.Emphasized,
						press: this.handleConfirmed.bind(this),
						visible: {
							parts: ['$valueHelp>/_config/maxConditions', '$help>/_quickSelectEnabled'],
							formatter: function(iMaxConditions, bQuickSelectEnabled) {
								return iMaxConditions !== 1 || !bQuickSelectEnabled;
							}
						}
					});

					this.oButtonCancel = new Button(this.getId() + "-cancel", {
						text: this._oResourceBundle.getText("valuehelp.CANCEL"),
						press: this.handleCanceled.bind(this)
					});

					this._oManagedObjectModel = new ManagedObjectModel(this);

					const oDialog = new MDialog(this.getId() + "-dialog", {
						contentHeight: _getContentHeight(),
						contentWidth: _getContentWidth(),
						horizontalScrolling: false,
						verticalScrolling: false,
						title: {
							parts: ['$help>/title', '$help>/_selectableContents'],
							formatter: function(sTitle, aContent) {
								if (aContent && aContent.length == 1) {
									const oContent = aContent[0];
									const sDlgTitle = oContent.getFormattedShortTitle() ? oContent.getFormattedShortTitle() : oContent.getTitle();
									if (sDlgTitle) {
										sTitle = this._oResourceBundle.getText("valuehelp.DIALOGSHORTTITLECOLONTITLE", [sDlgTitle, sTitle]);
									}
								}

								return sTitle;
							}.bind(this)
						},
						stretch: Device.system.phone,
						resizable: true,
						draggable: true,
						afterOpen: this.handleOpened.bind(this),
						afterClose: this.handleClosed.bind(this),
						buttons: [this.oButtonOK, this.oButtonCancel]
					});

					oDialog.setModel(this._oManagedObjectModel, "$help");
					this.setAggregation("_container", oDialog, true);

					oDialog.isPopupAdaptationAllowed = function() {
						return false;
					};
					oDialog.addStyleClass("sapMdcValueHelp");
					oDialog.addStyleClass("sapMdcValueHelpTitle");

					const oContentArea = new VBox(this.getId() + "-Content", { fitContainer: true });
					oContentArea.addStyleClass("sapMdcValueHelpPanel");
					oDialog.addContent(oContentArea);

					return oDialog;

				});
			});
		}

		return oDialog;
	};

	Dialog.prototype.placeContent = function(oDialog) {

		const oContentArea = oDialog.getContent()[0];
		const aSelectableContents = this.getProperty("_selectableContents");

		if (!aSelectableContents.length) { // no content assigned to dialog
			return Promise.resolve(oDialog);
		}

		const bMultiContentMode = aSelectableContents.length > 1;

		const aContentPromises = [];
		if (bMultiContentMode) { // Multiple contents are displayed using an IconTabBar
			aContentPromises.push(this._getIconTabBar(oDialog));
		} else {
			if (!this._oStandaloneTab) {
				this._oStandaloneTab = new DialogTab(this.getId() + "-Standalone-DT", { content: { path: "/_selectableContents/0/displayContent", model: "$help" }, layoutData: new FlexItemData({ growFactor: 1, minHeight: "0" }) });
			}
			aContentPromises.push(this._oStandaloneTab);
		}

		if (_isTokenizerRequired(this.getMaxConditions(), this.getContent())) {
			aContentPromises.push(this._getTokenizerPanel());
		}

		return Promise.all(aContentPromises).then((aControls) => {
			oContentArea.removeAllItems();
			aControls.forEach((oControl) => {
				oContentArea.addItem(oControl);
			});

			if (bMultiContentMode) {
				oDialog.addStyleClass("sapMdcValueHelpTitleShadow"); // make the Header border invisible
			} else {
				oDialog.removeStyleClass("sapMdcValueHelpTitleShadow"); // make the Header border visible
			}

			return oDialog;
		});
	};

	Dialog.prototype.handleSelect = function(oEvent) {
		Container.prototype.handleSelect.apply(this, arguments);

		if (this.getProperty("_quickSelectEnabled") && this.isSingleSelect()) {
			const aEventConditions = oEvent.getParameter("conditions");
			const bPositiveType = [ValueHelpSelectionType.Set, ValueHelpSelectionType.Add].indexOf(oEvent.getParameter("type")) !== -1;
			const iLength = aEventConditions && aEventConditions.length;
			if (bPositiveType && iLength) {
				this.fireConfirm({ close: true });
			}
		}
	};

	Dialog.prototype.observeChanges = function(oChanges) {
		if (oChanges.name === "content") {
			const aContent = this.getContent();
			this.setProperty("_quickSelectEnabled", aContent && aContent.every((oContent) => {
				return oContent.isQuickSelectSupported();
			}));

			this._updateInitialContentKey();

			if (oChanges.mutation === "insert" && !this.getProperty("_selectedContentKey")) {
				this.setProperty("_selectedContentKey", this._sInitialContentKey);
			}

			this.setProperty("_selectableContents", this._getSelectableContents());

			if (_isTokenizerRequired(this.getMaxConditions(), this.getContent())) {
				// check if Tokenizer needs to be created lately
				const oDialog = this.getAggregation("_container");
				if (oDialog && oDialog.getContent()[0].getItems().length === 1) { // container already created but no tokenizer
					Promise.all([this._getTokenizerPanel()]).then((aControls) => {
						aControls.forEach((oControl) => {
							oDialog.getContent()[0].addItem(oControl);
						});
					});
				}
			}
		}

		Container.prototype.observeChanges.apply(this, arguments);
	};

	Dialog.prototype._updateInitialContentKey = function() {
		const oFirstVisibleContent = this.getContent().find((oContent) => {
			return !!oContent.getVisible();
		});
		this._sInitialContentKey = oFirstVisibleContent && oFirstVisibleContent.getId();
	};

	Dialog.prototype.getSelectedContent = function() {
		const sSelectedKey = this.getProperty("_selectedContentKey");
		return this.getContent().find((oContent) => {
			return oContent.getId() === sSelectedKey;
		});
	};

	Dialog.prototype._getSelectableContents = function() {
		const oSelectedContent = this.getSelectedContent();
		const oSelectedContentGroup = oSelectedContent && oSelectedContent.getGroup && oSelectedContent.getGroup();
		const sSelectedGroup = oSelectedContent ? oSelectedContentGroup : "";
		const aVisibleGroups = [sSelectedGroup];
		return this.getContent().filter((oContent) => {
			if (!oContent.getVisible()) {
				return false;
			}
			const sGroup = oContent.getGroup && oContent.getGroup();
			const bValidContentGroup = sGroup && _isValidContentGroup.call(this, sGroup);

			if (bValidContentGroup && (oContent !== oSelectedContent)) {
				if (aVisibleGroups.indexOf(sGroup) >= 0) {
					return false;
				} else {
					aVisibleGroups.push(sGroup);
				}
			}
			return true;
		});
	};

	Dialog.prototype._updateGroupSelectModel = function() {
		if (this._oGroupSelectModel) {
			const oSelectedContent = this.getSelectedContent();
			const oSelectedContentGroup = oSelectedContent && oSelectedContent.getGroup && oSelectedContent.getGroup();
			const aRelevantContents = oSelectedContentGroup ? this.getContent().filter((oContent) => {
				return !!oContent.getVisible() && oContent.getGroup && oContent.getGroup() === oSelectedContentGroup;
			}) : [];
			this._oGroupSelectModel.setData(aRelevantContents.reduce(
				(oResult, oControl) => {
					oResult.entries.push({
						key: oControl.getId(),
						text: oControl.getFormattedTitle()
					});
					return oResult;
				}, { entries: [] }
			));
			if (this._oGroupSelect) { // Update selected key, if current one cannot be found in relevant contents
				const sSelectedItemKey = this._oGroupSelect.getSelectedItemKey();
				const aRelevantKeys = aRelevantContents.map((oContent) => {
					return oContent.getId();
				});

				const sSelectedKey = this.getProperty("_selectedContentKey");

				if (aRelevantKeys.indexOf(sSelectedItemKey) == -1 || (sSelectedItemKey !== sSelectedKey)) {
					this._oGroupSelect.setSelectedItemKey(aRelevantContents[0].getId());
				}
			}
		}
	};

	Dialog.prototype._retrieveGroupSelect = function() {
		return this._retrievePromise("collectiveSearchSelect", () => {
			return loadModules([
				"sap/ui/mdc/valuehelp/CollectiveSearchSelect", "sap/m/VariantItem", "sap/ui/model/json/JSONModel"
			]).then(
				(aModules) => {
					const CollectiveSearchSelect = aModules[0];
					const Item = aModules[1];
					const JSONModel = aModules[2];

					if (!this._oGroupSelectModel) {
						this._oGroupSelectModel = new JSONModel();
					}
					if (!this._oGroupSelect) {
						const oItemTemplate = new Item(
							this.getId() + "-collSearchItem", {
								key: "{$select>key}",
								text: "{$select>text}"
							}
						);
						this._oGroupSelect = new CollectiveSearchSelect(this.getId() + "--Select", {
							title: "{$i18n>COL_SEARCH_SEL_TITLE}",
							items: {
								path: "$select>/entries",
								template: oItemTemplate
							},
							select: function(oEvent) {
								this._handleContentSelectionChange(oEvent.getParameter("key"), true);
							}.bind(this),
							selectedItemKey: this.getSelectedContent().getId(),
							maxWidth: Device.system.phone ? "5em" : "25rem"
						});
						this._oGroupSelect.setModel(this._oGroupSelectModel, "$select");
					}
					return this._oGroupSelect;
				}
			);
		});
	};

	Dialog.prototype._getIconTabBar = function() {
		if (!this._oIconTabBar) {
			return this._retrievePromise("IconTabBar", () => {
				return loadModules([
					"sap/m/IconTabBar", "sap/m/IconTabFilter"
				]).then((aModules) => {
					IconTabBar = aModules[0];
					IconTabFilter = aModules[1];
					const { IconTabHeaderMode } = MLibrary;

					this._oIconTabBar = new IconTabBar(this.getId() + "-ITB", {
						expandable: false,
						upperCase: false,
						stretchContentHeight: true,
						headerMode: IconTabHeaderMode.Inline,
						select: this._onTabBarSelect.bind(this),
						layoutData: new FlexItemData({ growFactor: 1 }),
						selectedKey: "{path: '$help>/_selectedContentKey', mode: 'OneWay'}"
					});
					// this._oIconTabBar.setModel(this._oManagedObjectModel, "$help");
					this._oIconTabBar.addStyleClass("sapUiNoContentPadding");
					const oITF = new IconTabFilter(this.getId() + "-ITF", {
						key: { path: "$help>id" },
						content: new DialogTab(this.getId() + "-DT", { content: { path: "$help>displayContent" } }),
						text: {
							parts: ['$help>', '$valueHelp>/conditions'],
							formatter: function(oContent, aConditions) {
								let sTitle = "none";
								if (oContent) {
									const sGroup = oContent.getGroup && oContent.getGroup();
									const iCount = oContent.getCount(aConditions, sGroup);
									sTitle = sGroup ? this._getFormattedContentGroupLabel(sGroup, iCount) : oContent.getFormattedTitle(iCount);
								}
								return sTitle;
							}.bind(this)
						}
					});

					this._oIconTabBar.bindAggregation("items", { path: "/_selectableContents", model: "$help", templateShareable: false, template: oITF });
					return this._oIconTabBar;
				});
			});
		}
		return this._oIconTabBar;
	};


	Dialog.prototype._getFormattedContentGroupLabel = function(sGroup, iCount) {
		const oGroupConfig = this.getGroupConfig();
		const oGroupConfigSegment = oGroupConfig && oGroupConfig[sGroup];
		let sTitle = oGroupConfigSegment && (iCount ? oGroupConfigSegment.label : oGroupConfigSegment.nnLabel);
		sTitle = sTitle && formatMessage(sTitle, iCount ? iCount : "");
		sTitle = sTitle || this._oResourceBundle.getText(iCount ? "valuehelp.SELECTFROMLIST" : "valuehelp.SELECTFROMLISTNONUMBER", [iCount]);
		return sTitle;
	};

	Dialog.prototype._getTokenizerPanel = function(oDialog) {

		if (!this.oTokenizerPanel) {
			return this._retrievePromise("TokenizerPanel", () => {
				return loadModules([
					'sap/m/Panel',
					'sap/m/HBox',
					'sap/m/VBox',
					'sap/ui/mdc/field/FieldMultiInput',
					'sap/m/Token',
					'sap/ui/model/Filter',
					'sap/ui/mdc/field/ConditionType'
				]).then((aModules) => {

					Panel = aModules[0];
					HBox = aModules[1];
					VBox = aModules[2];
					MultiInput = aModules[3];
					Token = aModules[4];
					Filter = aModules[5];
					const ConditionType = aModules[6];
					const { BackgroundDesign } = MLibrary;
					const { ButtonType } = MLibrary;

					this.oTokenizerPanel = new Panel(this.getId() + "-TokenPanel", {
						backgroundDesign: BackgroundDesign.Transparent,
						expanded: true,
						visible: { parts: ['$valueHelp>/_config/maxConditions', '$help>/content'], formatter: _isTokenizerRequired },
						headerText: {
							parts: ['$valueHelp>/conditions', '$help>/_selectableContents'],
							formatter: function(aConditions, aContent) {
								let iCount = 0;

								for (const oCondition of aConditions) {
									if (oCondition.isEmpty !== true) {
										iCount++;
									}
								}

								let sTitle;
								if (aContent && aContent.length == 1) { // in case of single content the title will be provided by the content
									sTitle = aContent[0].getFormattedTokenizerTitle(iCount);
									return sTitle;
								} else {
									// default title
									sTitle = this._oResourceBundle.getText("valuehelp.TOKENIZERTITLE");
									if (iCount === 0) {
										// in case of no items do not show a number
										sTitle = this._oResourceBundle.getText("valuehelp.TOKENIZERTITLENONUMBER");
									}
									return formatMessage(sTitle, iCount);
								}
							}.bind(this)
						}
					});
					this.oTokenizerPanel.addStyleClass("sapMdcTokenizerPanel");

					const oHBox = new HBox(this.getId() + "-TokenBox", { fitContainer: true, width: "100%" });

					const oFormatOptions = _getConditionFormatOptions.call(this);
					this._oConditionType = new ConditionType(oFormatOptions);
					this._oConditionType._bVHTokenizer = true; // just help for debugging
					this.oTokenMultiInput = new MultiInput(this.getId() + "-Tokenizer", {
						width: "100%",
						showValueHelp: false,
						editable: true,
						showSuggestion: false,
						ariaAttributes: { role: "listbox", aria: { readonly: true, roledescription: this._oResourceBundle.getText("valuehelp.TOKENIZER_ARIA_ROLE_DESCRIPTION") } },
						// ariaLabelledBy: this.oTokenizerPanel,
						tokenUpdate: function(oEvent) {
							if (oEvent.getParameter("removedTokens")) {
								const aRemovedTokens = oEvent.getParameter("removedTokens");
								const aConditions = this.getModel("$valueHelp").getObject("/conditions");
								const aRemovedConditions = [];

								aRemovedTokens.forEach((oRemovedToken, i) => {
									const { sPath } = oRemovedToken.getBindingContext("$valueHelp");
									const iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
									aRemovedConditions.push(aConditions[iIndex]);
								});

								this.fireSelect({ type: ValueHelpSelectionType.Remove, conditions: aRemovedConditions });
							}

						}.bind(this),
						layoutData: new FlexItemData({ growFactor: 1, maxWidth: "calc(100% - 2rem)" })
					});

					// Overwrite the setValueVisible to make the input part not visible (transparent).
					// Problem: you can still enter a value into the $input dom ref and this will be shown when you remove all tokens. this can be solved inside the afterRender handler.
					// ACC issue: the screenreader is still reading this control as input field and that the user can enter a value - which is not correct.
					this.oTokenMultiInput._setValueVisible = function(bVisible) {
						this.$("inner").css("opacity", "0");
					};

					const org = this.oTokenMultiInput.onAfterRendering;
					this.oTokenMultiInput.onAfterRendering = function() {
						org.apply(this.oTokenMultiInput, arguments);

						this.oTokenMultiInput._setValueVisible(); // make the input always invisible
						this.oTokenMultiInput.setValue(""); // set the value to empty string

						if (!this.bAddAriaLabelledOnlyOnce) {
							this.bAddAriaLabelledOnlyOnce = true;
							this.oTokenMultiInput.addAriaLabelledBy(this.oTokenizerPanel._getLabellingElementId());
						}
					}.bind(this);

					_bindTokenizer.call(this, true);

					this.oRemoveAllBtn = new Button(this.getId() + "-TokenRemoveAll", {
						press: function(oEvent) {
							this.fireSelect({ type: ValueHelpSelectionType.Set, conditions: [] });

							this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.REMOVEALLTOKEN_ANNOUNCE"), InvisibleMessageMode.Assertive);

							//sets the focus to the Tokenizer field, because the RemoveAllBtn will be disabled
							this.oTokenMultiInput.focus();
						}.bind(this),
						type: ButtonType.Transparent,
						icon: "sap-icon://decline",
						tooltip: "{$i18n>valuehelp.REMOVEALLTOKEN}",
						layoutData: new FlexItemData({ growFactor: 0, baseSize: "2rem" }),
						enabled: {
							path: "$valueHelp>/conditions",
							formatter: function(aConditions) {
								let iCount = 0;

								for (const oCondition of aConditions) {
									if (oCondition.isEmpty !== true) {
										iCount++;
									}
								}

								return iCount > 0;
							}
						}
					});
					this.oRemoveAllBtn.addStyleClass("sapUiTinyMarginBegin");

					oHBox.addItem(this.oTokenMultiInput);
					oHBox.addItem(this.oRemoveAllBtn);
					this.oTokenizerPanel.addContent(oHBox);

					return this.oTokenizerPanel;
				});
			});
		} else { // update ConditionType with current formatOptions
			const oFormatOptions = _getConditionFormatOptions.call(this);
			this._oConditionType.setFormatOptions(oFormatOptions);
		}
		return this.oTokenizerPanel;
	};

	function _isTokenizerRequired(iMaxConditions, aContent) {
		let bVisible = iMaxConditions !== 1;

		if (bVisible && aContent && aContent.every((oContent) => {
				// make the tokenizer visible when at least one content request the tokenizer
				return !oContent.getRequiresTokenizer();
			})) {
			bVisible = false;
		}

		return bVisible;
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
			valueHelpID: oParent && oParent.getId(), // needed to get description for Token (if not provided)
			control: oControl,
			delegate: oControl && oControl.getControlDelegate && oControl.getControlDelegate(),
			delegateName: oControl && oControl.getDelegate && oControl.getDelegate() && oControl.getDelegate().name,
			payload: oControl && oControl.getPayload && oControl.getPayload(),
			convertWhitespaces: true
		};

	}

	function _bindTokenizer(bBind) {

		if (this.oTokenMultiInput) {
			const oBindingInfo = this.oTokenMultiInput.getBindingInfo("tokens");
			if (bBind) {
				if (!oBindingInfo) { // not bound -> create binding
					const oFilter = new Filter({ path: 'isEmpty', operator: 'NE', value1: true });
					this._oConditionType.setFormatOptions(_getConditionFormatOptions.call(this)); // as config might be changed
					const oTokenTemplate = new Token(this.getId() + "-Token", { text: { path: '$valueHelp>', type: this._oConditionType } });
					this.oTokenMultiInput.bindAggregation("tokens", { path: '/conditions', model: "$valueHelp", templateShareable: false, template: oTokenTemplate, filters: oFilter, length: 50, startIndex: -50 });
				}
			} else if (oBindingInfo) { // remove binding if dialog is closed to prevent updated on tokens if conditions are updated. (Suspend would not be enough, as every single binding on token would need to be suspended too.)
				this.oTokenMultiInput.unbindAggregation("tokens");
			}
		}

	}

	Dialog.prototype.openContainer = function(oDialog) {

		this._mAlreadyShownContents = {};

		if (oDialog) {
			this._updateInitialContentKey(); // Update initial key as visibilities might change during content retrieval

			const fnRenderContent = function() {
				this._renderSelectedContent(this._sInitialContentKey, () => {

					const oCurrentContent = this.getContent().find((oContent) => {
						return oContent.getId() === this.getProperty("_selectedContentKey");
					});

					const oInitialFocusedControl = oCurrentContent.getInitialFocusedControl();
					if (oInitialFocusedControl) {
						oDialog.setInitialFocus(oInitialFocusedControl);
					}

					oDialog.open();
					this.getContent().forEach((oContent) => {
						oContent.onContainerOpen();
					});
				});
			}.bind(this);

			if (_isTokenizerRequired(this.getMaxConditions(), this.getContent()) && oDialog.getContent()[0].getItems().length === 1) {
				// Tokenizer needed but already no tokenizer
				Promise.all([this._getTokenizerPanel()]).then((aControls) => {
					aControls.forEach((oControl) => {
						oDialog.getContent()[0].addItem(oControl);
					});
					fnRenderContent();
				});
			} else {
				if (this.oTokenMultiInput) { // restore tokenizer binding to enable updates if open
					_bindTokenizer.call(this, true);
				}
				fnRenderContent();
			}
		}
	};

	Dialog.prototype._renderSelectedContent = function(sNextContentId, fnBeforeShow, bCollectiveSearchChange) {
		const oNextContent = this.getContent().find((oContent) => {
			return oContent.getId() === sNextContentId;
		});

		if (!oNextContent) {
			throw new Error("sap.ui.mdc.ValueHelp: No content found.");
		}

		const aNecessaryPromises = [oNextContent.getContent()]; // Content.getContent() initializes displayContent asynchonously
		const sSelectedContentGroup = oNextContent.getGroup && oNextContent.getGroup();
		let oGroupSelectPromise;
		if (sSelectedContentGroup && _isValidContentGroup.call(this, sSelectedContentGroup)) {
			oGroupSelectPromise = this._retrieveGroupSelect();
			aNecessaryPromises.push(oGroupSelectPromise);
		}
		const bInitial = !this._mAlreadyShownContents[sNextContentId];

		return Promise.all(aNecessaryPromises).then(() => {
			this.bindContentToContainer(oNextContent);
		}).then(() => {
			return Promise.resolve(oNextContent.onBeforeShow(bInitial));
		}).then(() => {
			this._mAlreadyShownContents[sNextContentId] = true;
			this.setProperty("_selectedContentKey", sNextContentId);
			this.setProperty("_selectableContents", this._getSelectableContents());
			this._oManagedObjectModel.checkUpdate(true, false, (oBinding) => { // force update as bindings to $help>displayContent are not updated automatically in some cases
				if (oBinding.getPath().indexOf("displayContent") >= 0) { // do not update other bindings as this might lead to rerendering of IconTabBar ot other unwanted updates.
					return true;
				}
			});

			if (oGroupSelectPromise) {
				this._updateGroupSelectModel();
			}
			if (oNextContent.setCollectiveSearchSelect) {
				oNextContent.setCollectiveSearchSelect(oGroupSelectPromise ? this._oGroupSelect : undefined);
			}

			if (fnBeforeShow) {
				fnBeforeShow();
			}

			return this._retrievePromise("open").then(() => {
				oNextContent.onShow(bInitial);

				if (bCollectiveSearchChange) {
					const oNextDisplayContent = oNextContent.getDisplayContent();
					const oEventDelegate = {
						onAfterRendering: () => {
							this._oGroupSelect.focus();
							oNextDisplayContent.removeEventDelegate(oEventDelegate);
						}
					};
					oNextDisplayContent?.addEventDelegate(oEventDelegate);
				}

				return oNextContent;
			});
		});
	};

	Dialog.prototype.closeContainer = function() {
		const oContainer = this.getAggregation("_container");
		if (oContainer) {
			oContainer.close();

			if (this.oTokenMultiInput) { // remove tokenizer binding to prevent updates if closed
				_bindTokenizer.call(this, false);
			}
		}
	};

	Dialog.prototype.getValueHelpIcon = function() {
		return "sap-icon://value-help";
	};

	Dialog.prototype.getAriaAttributes = function(iMaxConditions) {

		//		var aContent = this.getContent();
		//		var oContentAttributes = oContent && oContent.getAriaAttributes(iMaxConditions);
		//
		return {
			contentId: null, // as in Dialog case focus is not in field, it is not needed
			ariaHasPopup: "dialog",
			role: null, // TODO: use "combobox" role here? But Input and MultiInput don't set a role if valueHelp is available
			roleDescription: null, // TODO: is it needed in multiselect case?
			valueHelpEnabled: true,
			autocomplete: "none" // Dialog cannot have an autocomplete
		};
	};

	Dialog.prototype.isMultiSelect = function() {

		return this.getMaxConditions() !== 1; // TODO: ask content?

	};

	Dialog.prototype.init = function() {
		Container.prototype.init.apply(this, arguments);

		this.oInvisibleMessage = InvisibleMessage.getInstance();
	};

	Dialog.prototype.exit = function() {
		Common.cleanup(this, [
			"_oManagedObjectModel",
			"_oResourceBundle",
			"oButtonOK",
			"oButtonCancel",
			"oTokenizerPanel",
			"oTokenMultiInput",
			"_oIconTabBar",
			"_oGroupSelect",
			"_oGroupSelectModel",
			"_sInitialContentKey",
			"_mAlreadyShownContents",
			"oInvisibleMessage",
			"_oStandaloneTab"
		]);

		Container.prototype.exit.apply(this, arguments);
	};

	return Dialog;

});