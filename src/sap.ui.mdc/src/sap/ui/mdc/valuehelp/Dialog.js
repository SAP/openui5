/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Container',
	'sap/ui/mdc/valuehelp/base/DialogTab',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/Device',
	'sap/m/VBox',
	'sap/m/FlexItemData',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/mdc/util/Common',
	'sap/ui/mdc/enum/SelectType',
	'sap/base/strings/formatMessage'
], function(
	Container,
	DialogTab,
	loadModules,
	Device,
	VBox,
	FlexItemData,
	ResourceModel,
	Common,
	SelectType,
	formatMessage
) {
	"use strict";

	var MDialog, MLibrary, Button, ManagedObjectModel, IconTabBar, IconTabFilter;
	var Panel, HBox, Tokenizer, Token, Filter;

	/**
	 * Constructor for a new <code>Dialog</code> container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element showing a dialog.
	 * @extends sap.ui.mdc.valuehelp.base.Container
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.Dialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Dialog = Container.extend("sap.ui.mdc.valuehelp.Dialog", /** @lends sap.ui.mdc.valuehelp.Dialog.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.IDialogContainer"
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
		var aContent = this.getContent();
		return aContent.filter(function (oContent) {
			return !!oContent.getVisible() && oContent.getGroup && oContent.getGroup() === sName;
		}).length > 1;
	}

	Dialog.prototype._handleContentSelectionChange = function (sNextId) {
		this.fireRequestDelegateContent({container: this.getId(), contentId: sNextId});
		this._getRetrieveDelegateContentPromise().then(function () {
			var sCurrentContentKey = this.getProperty("_selectedContentKey");
			var aContents = this.getContent();
			var oCurrentContent = sCurrentContentKey && aContents && aContents.find(function (oContent) {
				return oContent.getId() === sCurrentContentKey;
			});
			if (oCurrentContent) {
				if (oCurrentContent.setCollectiveSearchSelect) {
					oCurrentContent.setCollectiveSearchSelect(undefined); // remove collective search from Filterbar
				}
				oCurrentContent.onHide();
				this._unbindContent(oCurrentContent);
			}
			this._renderSelectedContent(sNextId);
		}.bind(this));
	};

	Dialog.prototype._onTabBarSelect = function (oEvent) {
		var oNextKey = oEvent && oEvent.getParameter("key");
		this._handleContentSelectionChange(oNextKey);
	};

	Dialog.prototype.invalidate = function(oOrigin) {

		if (oOrigin) {
			var aContent = this.getContent();
			var iIndex = aContent.indexOf(oOrigin);
			if (this._oIconTabBar && iIndex !== -1 && !this._bIsBeingDestroyed) {
				// Content invalidated -> invalidate corresponding IconTabFilter
				var aItems = this._oIconTabBar.getItems();
				if (aItems[iIndex]) {
					aItems[iIndex].invalidate(oOrigin);
				}
			} else { // standard logic
				Container.prototype.invalidate.apply(this, arguments);
			}
		}

	};

	Dialog.prototype._getUIAreaForContent = function() {
		var oDialog = this.getAggregation("_container");
		if (oDialog) {
			return oDialog.getUIArea();
		}
		return Container.prototype._getUIAreaForContent.apply(this, arguments);
	};

	Dialog.prototype._handleConfirmed = function (oEvent) {
		this.fireConfirm({close: true});
	};

	Dialog.prototype._handleClosed = function (oEvent) {

		var oContent = this.getSelectedContent();

		if (oContent) {
			oContent.onHide();
		}

		this.getContent().forEach(function (oContent) {
			oContent.onContainerClose();
		});

		// Reset selection to initial key for retrieveContent calls before it is opened again.
		this.setProperty("_selectedContentKey", this._sInitialContentKey);

		Container.prototype._handleClosed.apply(this, arguments);
	};

	Dialog.prototype._getContainer = function () {
		if (!this.getModel("$i18n")) {
			// if ResourceModel not provided from outside create own one
			this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
		}

		var oDialog = this.getAggregation("_container");

		if (!oDialog) {
			return this._retrievePromise("dialog", function (){
				return loadModules([
					"sap/m/Dialog",
					"sap/m/Button",
					"sap/ui/model/base/ManagedObjectModel",
					"sap/m/library"
				]).then(function (aModules) {

					MDialog = aModules[0];
					Button = aModules[1];
					ManagedObjectModel = aModules[2];
					MLibrary = aModules[3];

					var ButtonType = MLibrary.ButtonType;

					if (!this._oResourceBundle) {
						this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
					}

					this.oButtonOK = new Button(this.getId() + "-ok", {
						text: this._oResourceBundle.getText("valuehelp.OK"),
						enabled: "{$valueHelp>/_valid}",
						type: ButtonType.Emphasized,
						press: this._handleConfirmed.bind(this),
						visible: { parts: ['$valueHelp>/_config/maxConditions', '$help>/_quickSelectEnabled'], formatter: function(iMaxConditions, bQuickSelectEnabled) {
							return iMaxConditions !== 1 || !bQuickSelectEnabled;
						}}
					});

					this.oButtonCancel = new Button(this.getId() + "-cancel", {
						text: this._oResourceBundle.getText("valuehelp.CANCEL"),
						press: this._handleCanceled.bind(this)
					});

					this._oManagedObjectModel = new ManagedObjectModel(this);

					var oDialog = new MDialog(this.getId() + "-dialog", {
						contentHeight: _getContentHeight(),
						contentWidth: _getContentWidth(),
						horizontalScrolling: false,
						verticalScrolling: false,
						title: {parts: ['$help>/title', '$help>/_selectableContents'], formatter:
							function(sTitle, aContent) {
								if (aContent && aContent.length == 1) {
									var oContent = aContent[0];
									var sDlgTitle = oContent.getFormattedShortTitle() ? oContent.getFormattedShortTitle() : oContent.getTitle();
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
						afterOpen: this._handleOpened.bind(this),
						afterClose: this._handleClosed.bind(this),
						buttons: [this.oButtonOK, this.oButtonCancel]
					});

					oDialog.setModel(this._oManagedObjectModel, "$help");
					this.setAggregation("_container", oDialog, true);

					oDialog.isPopupAdaptationAllowed = function () {
						return false;
					};
					oDialog.addStyleClass("sapMdcValueHelp");
					oDialog.addStyleClass("sapMdcValueHelpTitle");
					oDialog.addStyleClass("sapMdcValueHelpTitleShadow");

					var oVBox = new VBox(this.getId() + "-Content", { fitContainer: true});
					oVBox.addStyleClass("sapMdcValueHelpPanel");
					oDialog.addContent(oVBox);

					var aPromises = [];
					aPromises.push(this._getIconTabBar(oDialog));

					if (_isTokenizerRequired(this.getMaxConditions(), this.getContent())) {
						aPromises.push(this._getTokenizerPanel());
					}
					return Promise.all(aPromises).then(function (aControls) {
						aControls.forEach(function (oControl) {
							oVBox.addItem(oControl);
						});
						return oDialog;
					});
				}.bind(this));
			}.bind(this));
		}

		return oDialog;
	};

	Dialog.prototype._handleSelect = function (oEvent) {
		Container.prototype._handleSelect.apply(this, arguments);

		if (this.getProperty("_quickSelectEnabled") && this._isSingleSelect()) {
			this.fireConfirm({close: true});
		}
	};

	Dialog.prototype._observeChanges = function (oChanges) {
		if (oChanges.name === "content") {
			var aContent = this.getContent();
			this.setProperty("_quickSelectEnabled", aContent && aContent.every(function (oContent) {
				return oContent.isQuickSelectSupported();
			}));

			this._updateInitialContentKey();

			if (oChanges.mutation === "insert" && !this.getProperty("_selectedContentKey")) {
				this.setProperty("_selectedContentKey", this._sInitialContentKey);
			}

			this.setProperty("_selectableContents", this._getSelectableContents());

			if (_isTokenizerRequired(this.getMaxConditions(), this.getContent())) {
				// check if Tokenizer needs to be created lately
				var oDialog = this.getAggregation("_container");
				if (oDialog && oDialog.getContent()[0].getItems().length === 1) { // container already created but no tokenizer
					Promise.all([this._getTokenizerPanel()]).then(function (aControls) {
						aControls.forEach(function (oControl) {
							oDialog.getContent()[0].addItem(oControl);
						});
					});
				}
			}
		}

		Container.prototype._observeChanges.apply(this, arguments);
	};

	Dialog.prototype._updateInitialContentKey = function () {
		var oFirstVisibleContent = this.getContent().find(function (oContent) {
			return !!oContent.getVisible();
		});
		this._sInitialContentKey = oFirstVisibleContent && oFirstVisibleContent.getId();
	};

	Dialog.prototype.getSelectedContent = function () {
		var sSelectedKey = this.getProperty("_selectedContentKey");
		return this.getContent().find(function (oContent) {
			return oContent.getId() === sSelectedKey;
		});
	};

	Dialog.prototype._getSelectableContents = function () {
		var oSelectedContent = this.getSelectedContent();
		var oSelectedContentGroup = oSelectedContent && oSelectedContent.getGroup && oSelectedContent.getGroup();
		var sSelectedGroup = oSelectedContent ? oSelectedContentGroup : "";
		var aVisibleGroups = [sSelectedGroup];
		return this.getContent().filter(function (oContent) {
			if (!oContent.getVisible()) {
				return false;
			}
			var sGroup = oContent.getGroup && oContent.getGroup();
			var bValidContentGroup = sGroup && _isValidContentGroup.call(this, sGroup);

			if (bValidContentGroup && (oContent !== oSelectedContent)) {
				if (aVisibleGroups.indexOf(sGroup) >= 0) {
					return false;
				} else {
					aVisibleGroups.push(sGroup);
				}
			}
			return true;
		}.bind(this));
	};

	Dialog.prototype._updateGroupSelectModel = function () {
		if (this._oGroupSelectModel) {
			var oSelectedContent = this.getSelectedContent();
			var oSelectedContentGroup = oSelectedContent && oSelectedContent.getGroup && oSelectedContent.getGroup();
			var aRelevantContents = oSelectedContentGroup ? this.getContent().filter(function (oContent) {
				return !!oContent.getVisible() && oContent.getGroup && oContent.getGroup() === oSelectedContentGroup;
			}) : [];
			this._oGroupSelectModel.setData(aRelevantContents.reduce(
				function (oResult, oControl) {
					oResult.entries.push({
						key: oControl.getId(),
						text: oControl.getFormattedTitle()
					});
					return oResult;
				},
				{ entries: [] }
			));
			if (this._oGroupSelect) {	// Update selected key, if current one cannot be found in relevant contents
				var sSelectedItemKey = this._oGroupSelect.getSelectedItemKey();
				var aRelevantKeys = aRelevantContents.map(function (oContent) {
					return oContent.getId();
				});

				var sSelectedKey = this.getProperty("_selectedContentKey");

				if (aRelevantKeys.indexOf(sSelectedItemKey) == -1 || (sSelectedItemKey !== sSelectedKey)) {
					this._oGroupSelect.setSelectedItemKey(aRelevantContents[0].getId());
				}
			}
		}
	};

	Dialog.prototype._retrieveGroupSelect = function () {
		return this._retrievePromise("collectiveSearchSelect", function (){
			return loadModules([
				"sap/ui/mdc/filterbar/vh/CollectiveSearchSelect",
				"sap/ui/core/Item",
				"sap/ui/model/json/JSONModel"
			]).then(
				function (aModules) {
					var CollectiveSearchSelect = aModules[0];
					var Item = aModules[1];
					var JSONModel = aModules[2];

					if (!this._oGroupSelectModel) {
						this._oGroupSelectModel = new JSONModel();
					}
					if (!this._oGroupSelect) {
						var oItemTemplate = new Item(
							this.getId() + "-collSearchItem",
							{
								key: "{$select>key}",
								text: "{$select>text}",
								enabled: true
								/*textDirection: "{$contenthelp>textDirection}" */
							}
						);
						this._oGroupSelect = new CollectiveSearchSelect(this.getId() + "--Select",
							{
								title:"{$i18n>COL_SEARCH_SEL_TITLE}",
								items: {
									path: "$select>/entries",
									template: oItemTemplate
								},
								select: function (oEvent) {
									this._handleContentSelectionChange(oEvent.getParameter("key"));
								}.bind(this),
								selectedItemKey: this.getSelectedContent().getId()
							}
						);
						this._oGroupSelect.setModel(this._oGroupSelectModel, "$select");
					}
					return this._oGroupSelect;
				}.bind(this)
			);
		}.bind(this));
	};

	Dialog.prototype._getIconTabBar = function (oDialog) {
		if (!this._oIconTabBar) {
			return loadModules([
				"sap/m/IconTabBar",
				"sap/m/IconTabFilter"]).then(function(aModules){
					IconTabBar = aModules[0];
					IconTabFilter = aModules[1];
					var IconTabHeaderMode = MLibrary.IconTabHeaderMode;

					this._oIconTabBar = new IconTabBar(this.getId() + "-ITB", {
						expandable: false,
						upperCase: false,
						stretchContentHeight: true,
						headerMode: IconTabHeaderMode.Inline,
						select: this._onTabBarSelect.bind(this),
						layoutData: new FlexItemData({growFactor: 1}),
						selectedKey: "{path: '$help>/_selectedContentKey', mode: 'OneWay'}",
						visible: {parts : ['$help>/_selectableContents'], formatter:
							function(aContent) {
								if (aContent && aContent.length == 1) {
									this.addStyleClass("sapMdcNoHeader"); // hide the IconTabBar header
									oDialog.removeStyleClass("sapMdcValueHelpTitleShadow"); // make the Header border visible
								} else {
									this.removeStyleClass("sapMdcNoHeader");
									oDialog.addStyleClass("sapMdcValueHelpTitleShadow"); // make the Header border invisible
								}
								return true;
							}
						}
					});
					// this._oIconTabBar.setModel(this._oManagedObjectModel, "$help");
					this._oIconTabBar.addStyleClass("sapUiNoContentPadding");

					var oITF = new IconTabFilter(this.getId() + "-ITF", {
						key: {path: "$help>id"},
						content: new DialogTab(this.getId() + "-DT", {content: {path: "$help>displayContent"}}),
						text: {parts: ['$help>', '$valueHelp>/conditions'], formatter:
							function(oContent, aConditions) {
								var sTitle = "none";
								if (oContent) {
									var sGroup = oContent.getGroup && oContent.getGroup();
									var iCount = oContent.getCount(aConditions, sGroup);
									sTitle = sGroup ? this._getFormattedContentGroupLabel(sGroup, iCount) : oContent.getFormattedTitle(iCount);
								}
								return sTitle;
							}.bind(this)
						}
					});

					this._oIconTabBar.bindAggregation("items", {path: "/_selectableContents", model: "$help", templateShareable: false, template: oITF});
					return this._oIconTabBar;
			}.bind(this));
		}
		return this._oIconTabBar;
	};


	Dialog.prototype._getFormattedContentGroupLabel = function(sGroup, iCount) {
		var oGroupConfig = this.getGroupConfig();
		var oGroupConfigSegment = oGroupConfig && oGroupConfig[sGroup];
		var sTitle = oGroupConfigSegment && (iCount ? oGroupConfigSegment.label : oGroupConfigSegment.nnLabel);
		sTitle = sTitle && formatMessage(sTitle, iCount ? iCount : "");
		sTitle = sTitle || this._oResourceBundle.getText(iCount ? "valuehelp.SELECTFROMLIST" : "valuehelp.SELECTFROMLISTNONUMBER", iCount);
		return sTitle;
	};

	Dialog.prototype._getTokenizerPanel = function (oDialog) {

		if (!this.oTokenizerPanel) {
			return loadModules([
				'sap/m/Panel',
				'sap/m/HBox',
				'sap/m/VBox',
				'sap/m/Tokenizer',
				'sap/m/Token',
				'sap/ui/model/Filter',
				'sap/ui/mdc/field/ConditionType'
			]).then(function (aModules) {

				Panel = aModules[0];
				HBox = aModules[1];
				VBox = aModules[2];
				Tokenizer = aModules[3];
				Token = aModules[4];
				Filter = aModules[5];
				var ConditionType = aModules[6];
				var BackgroundDesign = MLibrary.BackgroundDesign;
				var ButtonType = MLibrary.ButtonType;

				this.oTokenizerPanel = new Panel(this.getId() + "-TokenPanel", {
					backgroundDesign: BackgroundDesign.Transparent,
					expanded: true,
					visible: {parts: ['$valueHelp>/_config/maxConditions', '$help>/content'], formatter: _isTokenizerRequired},
					headerText: {parts: ['$valueHelp>/conditions', '$help>/_selectableContents'], formatter:
						function(aConditions, aContent) {
							var iCount = 0;
							for (var i = 0; i < aConditions.length; i++) {
								var oCondition = aConditions[i];
								if (oCondition.isEmpty !== true) {
									iCount++;
								}
							}
							var sTitle;
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

				var oHBox = new HBox(this.getId() + "-TokenBox", {fitContainer: true, width: "100%"});

				var oFormatOptions = _getConditionFormatOptions.call(this);
				this._oConditionType = new ConditionType(oFormatOptions);
				this._oConditionType._bVHTokenizer = true; // just help for debugging
				this.oTokenizer = new Tokenizer(this.getId() + "-Tokenizer", {
					width: "100%",
					tokenDelete: function(oEvent) {
						if (oEvent.getParameter("tokens")) {
							var aRemovedTokens = oEvent.getParameter("tokens");
							var aConditions = this.getModel("$valueHelp").getObject("/conditions");
							var aRemovedConditions = [];

							aRemovedTokens.forEach(function(oRemovedToken, i) {
								var sPath = oRemovedToken.getBindingContext("$valueHelp").sPath;
								var iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
								aRemovedConditions.push(aConditions[iIndex]);
							});

							this.fireSelect({type: SelectType.Remove, conditions: aRemovedConditions});
						}

					}.bind(this),
					layoutData: new FlexItemData({growFactor: 1, maxWidth: "calc(100% - 2rem)"})
				});
				this.oTokenizer.addAriaDescribedBy( this.oTokenizer.getTokensInfoId());
				this.oTokenizer.addStyleClass("sapMdcTokenizer");
				_bindTokenizer.call(this, true);

				this.oRemoveAllBtn = new Button(this.getId() + "-TokenRemoveAll", {
					press: function(oEvent) {
						this.fireSelect({type: SelectType.Set, conditions: []});

					}.bind(this),
					type: ButtonType.Transparent,
					icon: "sap-icon://decline",
					tooltip: "{$i18n>valuehelp.REMOVEALLTOKEN}",
					layoutData: new FlexItemData({growFactor: 0, baseSize: "2rem"})
				});
				this.oRemoveAllBtn.addStyleClass("sapUiTinyMarginBegin");

				oHBox.addItem(this.oTokenizer);
				oHBox.addItem(this.oRemoveAllBtn);
				this.oTokenizerPanel.addContent(oHBox);

				return this.oTokenizerPanel;
			}.bind(this));
		} else { // update ConditionType with current formatOptions
			var oFormatOptions = _getConditionFormatOptions.call(this);
			this._oConditionType.setFormatOptions(oFormatOptions);
		}
		return this.oTokenizerPanel;
	};

	function _isTokenizerRequired(iMaxConditions, aContent) {
		var bVisible = iMaxConditions !== 1;

		if (bVisible && aContent && aContent.every(function(oContent) {
			// make the tokenizer visible when at least one content request the tokenizer
			return !oContent.getRequiresTokenizer();
		})) {
			bVisible = false;
		}

		return bVisible;
	}

	function _getConditionFormatOptions() {

		var oValueHelpModel = this.getModel("$valueHelp");
		var oConfig = oValueHelpModel ? oValueHelpModel.getProperty("/_config") : {};
		var oParent = this.getParent();
		var oControl = this._getControl();
		return { // TODO: is more needed?
			maxConditions: -1, // as for tokens there should not be a limit on type side
			valueType: oConfig.dataType,
			operators: oConfig.operators,
			display: oConfig.display,
			fieldHelpID: oParent && oParent.getId(), // needed to get description for Token (if not provided)
			control: oControl,
			delegate: oControl && oControl.getControlDelegate && oControl.getControlDelegate(),
			delegateName: oControl && oControl.getDelegate && oControl.getDelegate() && oControl.getDelegate().name,
			payload: oControl && oControl.getPayload && oControl.getPayload(),
			convertWhitespaces: true
		};

	}

	function _bindTokenizer(bBind) {

		if (this.oTokenizer) {
			var oBindingInfo = this.oTokenizer.getBindingInfo("tokens");
			if (bBind) {
				if (!oBindingInfo) { // not bound -> create binding
					var oFilter = new Filter({path:'isEmpty', operator:'NE', value1:true});
					var oTokenTemplate = new Token(this.getId() + "-Token", {text: {path: '$valueHelp>', type: this._oConditionType}});
					this.oTokenizer.bindAggregation("tokens", {path: '/conditions', model: "$valueHelp", templateShareable: false, template: oTokenTemplate, filters: oFilter});
				}
			} else if (oBindingInfo) { // remove binding if dialog is closed to prevent updated on tokens if conditions are updated. (Suspend would not be enough, as every single binding on token would need to be suspended too.)
				this.oTokenizer.unbindAggregation("tokens");
			}
		}

	}

	Dialog.prototype._open = function (oDialog) {
		if (oDialog) {
			this._updateInitialContentKey(); // Update initial key as visibilities might change during content retrieval

			var fnRenderContent = function () {
				this._renderSelectedContent(this._sInitialContentKey, function () {
					oDialog.open();
					this.getContent().forEach(function (oContent) {
						oContent.onContainerOpen();
					});
				}.bind(this));
			}.bind(this);

			if (_isTokenizerRequired(this.getMaxConditions(), this.getContent()) && oDialog.getContent()[0].getItems().length === 1) {
				// Tokenizer needed but already no tokenizer
				Promise.all([this._getTokenizerPanel()]).then(function (aControls) {
					aControls.forEach(function (oControl) {
						oDialog.getContent()[0].addItem(oControl);
					});
					fnRenderContent();
				});
			} else {
				if (this.oTokenizer) { // restore tokenizer binding to enable updates if open
					_bindTokenizer.call(this, true);
				}
				fnRenderContent();
			}
		}
	};

	Dialog.prototype._renderSelectedContent = function (sNextContentId, fnBeforeShow) {
		var oNextContent = this.getContent().find(function (oContent) {
			return oContent.getId() === sNextContentId;
		});

		if (!oNextContent) {
			throw new Error("sap.ui.mdc.ValueHelp: No content found.");
		}

		var aNecessaryPromises = [oNextContent.getContent(), oNextContent.onBeforeShow()];
		var sSelectedContentGroup = oNextContent.getGroup && oNextContent.getGroup();
		var oGroupSelectPromise;
		if (sSelectedContentGroup && _isValidContentGroup.call(this, sSelectedContentGroup)) {
			oGroupSelectPromise = this._retrieveGroupSelect();
			aNecessaryPromises.push(oGroupSelectPromise);
		}
		return Promise.all(aNecessaryPromises).then(function (aPromiseResults) {

			this._bindContent(oNextContent);
			this.setProperty("_selectedContentKey", sNextContentId);
			this.setProperty("_selectableContents", this._getSelectableContents());
			this._oManagedObjectModel.checkUpdate(true, false, function (oBinding) { // force update as bindings to $help>displayContent are not updated automatically in some cases
				if (oBinding.getPath() === "displayContent") { // do not update other bindings as this might lead to rerendering of IconTabBar ot other unwanted updates.
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

			return this._retrievePromise("open").then(function () {
				oNextContent.onShow();
				return oNextContent;
			});
		}.bind(this));
	};

	Dialog.prototype._close = function () {
		var oContainer = this.getAggregation("_container");
		if (oContainer) {
			oContainer.close();

			if (this.oTokenizer) { // remove tokenizer binding to prevent updates if closed
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
			roleDescription: null // TODO: is it needed in multiselect case?
		};
	};

	Dialog.prototype.isMultiSelect = function() {

		return this.getMaxConditions() !== 1; // TODO: ask content?

	};

	Dialog.prototype.exit = function () {
		Common.cleanup(this, [
			"_oManagedObjectModel",
			"_oResourceBundle",
			"oButtonOK",
			"oButtonCancel",
			"oTokenizerPanel",
			"oTokenizer",
			"_oIconTabBar",
			"_oGroupSelect",
			"_oGroupSelectModel",
			"_sInitialContentKey"
		]);

		Container.prototype.exit.apply(this, arguments);
	};

	return Dialog;

});
