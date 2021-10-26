/*
 * ! ${copyright}
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
	'sap/ui/mdc/enum/SelectType'
], function(
	Container,
	DialogTab,
	loadModules,
	Device,
	VBox,
	FlexItemData,
	ResourceModel,
	Common,
	SelectType
) {
	"use strict";

	var MDialog, MLibrary, Button, ManagedObjectModel, IconTabBar, IconTabFilter;
	var Panel, HBox, Tokenizer, Token, formatMessage;

	/**
	 * Constructor for a new <code>Dialog</code> container.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the <code>sap.ui.mdc.ValueHelp</code> element showing a dialog.
	 * @extends sap.ui.mdc.valuehelp.base.Container
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
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

		var aContents = this.getContent();
		var oContent = this._sSelectedKey && aContents && aContents.find(function (oContent) {
			return oContent.getId() === this._sSelectedKey;
		}.bind(this));

		if (oContent) {
			oContent.onHide();
		}

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
						title: {parts: ['$help>/title', '$help>/content'], formatter:
							function(sTitle, aContent) {
								if (aContent.length == 1) {
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

					var oVBox = new VBox({ fitContainer: true});
					oVBox.addStyleClass("sapMdcValueHelpPanel");
					oDialog.addContent(oVBox);

					var oIconTabBar = this._getIconTabBar(oDialog);
					var oTokenizer = this._getTokenizerPanel();

					return Promise.all([oIconTabBar, oTokenizer]).then(function (aControls) {
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
				return oContent.isQuickSelectSupported && oContent.isQuickSelectSupported();
			}));
		}
		Container.prototype._observeChanges.apply(this, arguments);
	};

	Dialog.prototype._onTabBarSelect = function (oEvent) {
		var aContents = this.getContent();
		var oNextKey = oEvent && oEvent.getParameter("key");
		var oPreviouslyShownContent = this._sSelectedKey && aContents && aContents.find(function (oContent) {
			return oContent.getId() === this._sSelectedKey;
		}.bind(this));
		if (oPreviouslyShownContent) {
			oPreviouslyShownContent.onHide();
		}
		this._sSelectedKey = oNextKey || this._oIconTabBar && this._oIconTabBar.getSelectedKey();
		if (!this._sSelectedKey) {
			// in the initial usecase the selectedKey is undefined
			var oFirstItem = this._oIconTabBar.getItems()[0];
			this._sSelectedKey = oFirstItem && oFirstItem.getKey();
			if (this._sSelectedKey) {
				this.setProperty("_selectedContentKey", this._sSelectedKey);
			}
		}
		var oShownContent = this._sSelectedKey ? aContents && aContents.find(function (oContent) {
			return oContent.getId() === this._sSelectedKey;
		}.bind(this)) : aContents[0];
		if (oShownContent) {
			Promise.all([this._retrievePromise("open"), oShownContent.getContent()]).then(function () {
				oShownContent.onShow();
			});
		}
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
						selectedKey: "{$help>/_selectedContentKey}",
						visible: {parts : ['$help>/content'], formatter:
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
								return oContent ? oContent.getFormattedTitle(oContent.getCount(aConditions)) : "none";
							}
						}
					});

					this._oIconTabBar.bindAggregation("items", {path: "/content", model: "$help", templateShareable: false, template: oITF});
					return this._oIconTabBar;
			}.bind(this));
		}
		return this._oIconTabBar;
	};

	Dialog.prototype._getTokenizerPanel = function (oDialog) {
		if (!this.oTokenizerPanel) {
			return loadModules([
				'sap/m/Panel',
				'sap/m/HBox',
				'sap/m/VBox',
				'sap/m/Tokenizer',
				'sap/m/Token',
				'sap/base/strings/formatMessage',
				'sap/ui/model/Filter',
				'sap/ui/mdc/field/ConditionType'
			]).then(function (aModules) {

				Panel = aModules[0];
				HBox = aModules[1];
				VBox = aModules[2];
				Tokenizer = aModules[3];
				Token = aModules[4];
				formatMessage = aModules[5];
				var Filter = aModules[6];
				var ConditionType = aModules[7];
				var BackgroundDesign = MLibrary.BackgroundDesign;
				var ButtonType = MLibrary.ButtonType;

				this.oTokenizerPanel = new Panel( {
					backgroundDesign: BackgroundDesign.Transparent,
					expanded: true,
					visible: { parts: ['$valueHelp>/_config/maxConditions', '$help>/content'], formatter:
					function(iMaxConditions, aContent) {
						var bVisible = false;

						if (aContent && aContent.some(function(oContent) {
							// make the tokenizer visible when at least one content request the tokenizer
							return oContent.getRequiresTokenizer();
						})) {
							bVisible = true;
						}

						return bVisible && iMaxConditions === -1;
					}},
					headerText: {parts: ['$i18n>valuehelp.TOKENIZERTITLE', '$valueHelp>/conditions'], formatter:
						function(sText, aConditions) {
							var iCount = 0;
							for (var i = 0; i < aConditions.length; i++) {
								var oCondition = aConditions[i];
								if (oCondition.isEmpty !== true) {
									iCount++;
								}
							}
							if (iCount === 0) {
								// in case of no items do not show a number
								sText = this._oResourceBundle.getText("valuehelp.TOKENIZERTITLENONUMBER");
							}
							return formatMessage(sText, iCount);
						}.bind(this)
					}
				});
				this.oTokenizerPanel.addStyleClass("sapMdcTokenizerPanel");

				var oHBox = new HBox({fitContainer: true, width: "100%"});

				var oFilter = new Filter({path:'isEmpty', operator:'NE', value1:true});

				var oValueHelpModel = this.getModel("$valueHelp");
				var oConfig = oValueHelpModel ? oValueHelpModel.getProperty("/_config") : {};
				var oFormatOptions = { // TODO: is more needed?
							maxConditions: -1, // as for tokens there should not be a limit on type side
							valueType: oConfig.dataType,
							operators: oConfig.operators,
							display: oConfig.display
						};
				var oTokenTemplate = new Token({text: {path: '$valueHelp>', type: new ConditionType(oFormatOptions)}});
				this.oTokenizer = new Tokenizer({
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
					tokens: {path: '/conditions', model: "$valueHelp", templateShareable: false, template: oTokenTemplate, filters: oFilter},
					layoutData: new FlexItemData({growFactor: 1, maxWidth: "calc(100% - 2rem)"})
				});
				this.oTokenizer.addAriaDescribedBy( this.oTokenizer.getTokensInfoId());
				this.oTokenizer.addStyleClass("sapMdcTokenizer");

				this.oRemoveAllBtn = new Button({
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
		}
		return this.oTokenizerPanel;
	};

	Dialog.prototype._open = function (oContainer) {
		this._onTabBarSelect();
		if (oContainer) {
			oContainer.open();
		}
	};

	Dialog.prototype._close = function () {
		var oContainer = this.getAggregation("_container");
		if (oContainer) {
			oContainer.close();
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
			"_oIconTabBar"
		]);
	};

	return Dialog;

});
