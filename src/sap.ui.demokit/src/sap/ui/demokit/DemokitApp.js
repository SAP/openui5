/*!
 * ${copyright}
 */

// Main class for Demokit-like applications
sap.ui.define(['jquery.sap.global', 'sap/ui/Device',
	'sap/ui/core/CustomData', 'sap/ui/core/HTML', 'sap/ui/core/library', 'sap/ui/core/ListItem', 'sap/ui/core/Title', 'sap/ui/core/mvc/View', 'sap/ui/core/search/OpenSearchProvider', 'sap/ui/core/util/LibraryInfo',
	'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/model/json/JSONModel',
	'sap/ui/layout/form/Form', 'sap/ui/layout/form/FormContainer', 'sap/ui/layout/form/FormElement', 'sap/ui/layout/form/GridLayout', 'sap/ui/layout/form/GridElementData', 'sap/ui/layout/VerticalLayout',
	'sap/ui/commons/Button', 'sap/ui/commons/Dialog', 'sap/ui/commons/DropdownBox', 'sap/ui/commons/FormattedTextView', 'sap/ui/commons/Image', 'sap/ui/commons/Label', 'sap/ui/commons/library',
	'sap/ui/commons/Link', 'sap/ui/commons/TextView', 'sap/ui/commons/SearchField', 'sap/ui/commons/Splitter', 'sap/ui/commons/Tree', 'sap/ui/commons/TreeNode', 'sap/ui/commons/layout/AbsoluteLayout',
	'sap/ui/ux3/DataSet', 'sap/ui/ux3/DataSetItem', 'sap/ui/ux3/DataSetSimpleView', 'sap/ui/ux3/NavigationItem', 'sap/ui/ux3/Shell', 'sap/ui/ux3/ToolPopup',
	'./FeedbackClient', './library', './Tag', './TagCloud',
	'jquery.sap.script'
	],
	function (jQuery, Device,
	CustomData, HTML, coreLibrary, ListItem, Title, View, OpenSearchProvider, LibraryInfo,
	Filter, FilterOperator, JSONModel,
	Form, FormContainer, FormElement, GridLayout, GridElementData, VerticalLayout,
	Button, Dialog, DropdownBox, FormattedTextView, Image, Label, commonsLibrary,
	Link, TextView, SearchField, Splitter, Tree, TreeNode, AbsoluteLayout,
	DataSet, DataSetItem, DataSetSimpleView, NavigationItem, Shell, ToolPopup,
	FeedbackClient, library, Tag, TagCloud) {

	"use strict";

		var TextViewColor = commonsLibrary.TextViewColor,
			TextViewDesign = commonsLibrary.TextViewDesign,
			ViewType = coreLibrary.mvc.ViewType;

		var DemokitApp = function (sTitle, sVersion, aThemes) {

			var that = this;

			function basename(sPath) {
				return sPath.split('/').slice(0, -1).join('/') + '/';
			}

			// Calculate Application Base HRef and Pathname
			var sBaseUrl = window.location.href;
			if (sBaseUrl.indexOf('#') >= 0) {
				// remove the hash from the URL (otherwise the URL + hash is used as base URL)
				sBaseUrl = sBaseUrl.slice(0, sBaseUrl.indexOf('#'));
			}
			this.sBaseUrl = basename(sBaseUrl);
			this.sBasePathname = basename(window.location.pathname);
			this._iPendingCalls = 0;
			this._mBestMatchingPage = {};
			this._aTopLevelNavItems = [];
			this._aThemes = aThemes || ["sap_fiori_3", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_belize", "sap_belize_plus", "sap_belize_hcb", "sap_belize_hcw", "sap_bluecrystal", "sap_hcb"];
			this._sTheme = this._aThemes[0]; // 'aThemes' must contain at least one theme
			this._sCurrentContent = null;
			this._mAliases = {};
			this._bIgnoreIFrameOnLoad = false;

			// view state
			this._sTitleStr = sTitle;
			this._sVersionStr = sVersion;
			this._sSelectedWorkSetItem = null;

			// make this instance available statically
			DemokitApp.getInstance = jQuery.sap.getter(this);

			jQuery(window).bind('hashchange', function () {
				var sHash = window.location.hash;
				jQuery.sap.log.debug("hashchange occured, current='" + that._sCurrentContent + "', new='" + sHash + "'");
				if (sHash && sHash != "#" + that._sCurrentContent) {
					jQuery.sap.log.info("navigate to " + sHash);
					that.navigateTo(sHash, true);
				}
			});

		};

		DemokitApp.getInstance = function () {
			var oTopDemokit = jQuery.sap.getObject("top.sap.ui.demokit.DemokitApp");
			if (oTopDemokit && oTopDemokit != DemokitApp) {
				return oTopDemokit.getInstance();
			}
		};

		/**
		 * Checks whether the given URL references a page within the demokit app.
		 * If so, only the internal part of the path is returned, otherwise null.
		 */
		DemokitApp.prototype.calcRelativeUrl = function (sUrl) {
			return sUrl.indexOf(this.sBaseUrl) == 0 ? sUrl.substring(this.sBaseUrl.length) : null;
		};

		DemokitApp.prototype.registerPageForType = function (sUrl, aControls) {
			this._mBestMatchingPage[aControls[0]] = sUrl;
		};

		DemokitApp.prototype.findPageForType = function (sType) {
			return this._mBestMatchingPage[sType] || "docs/api/symbols/" + sType + ".html";
		};

		DemokitApp.prototype._addPendingCall = function () {
			this._iPendingCalls++;
		};

		DemokitApp.prototype._removePendingCall = function () {
			this._iPendingCalls--;
		};

		DemokitApp.prototype.addIndex = function (sId, oSettings) {
			oSettings = oSettings || {};

			var that = this;

			var oTLNItem = {
				id: "mi-" + sId,
				text: oSettings.caption || sId,
				newWindow: oSettings.newWindow,
				visible: (typeof oSettings.visible === "boolean") ? oSettings.visible : true,
				themable: oSettings.themable || false
			};
			this._aTopLevelNavItems.push(oTLNItem);
			this._createWorksetItem(oTLNItem);
			if (oSettings.index) {
				if (oSettings.extend) {
					oSettings.extend(oSettings.index, function (oData) {
						that._setIndexData(sId, oData);
					});
				} else {
					that._setIndexData(sId, oSettings.index);
				}
			} else if (oSettings.url) {
				this._loadIndexFromUrl(sId, oSettings.url, oSettings.transformer, oSettings.extend);
			}
		};

		DemokitApp.prototype._loadIndexFromUrl = function (sId, sUrl, fnTransformer, fnExtend) {
			var that = this;

			jQuery.ajax({
				url: sUrl,
				dataType: sUrl.slice(-4) == ".xml" ? "xml" : "json",
				error: function (xhr, status, e) {
					that._removePendingCall();
					jQuery.sap.log.error("failed to load index '" + sId + "' from '" + sUrl + "': " + status + ", " + e);
					var oTopLevelNavItem = that._findIndexById(sId);
					if (oTopLevelNavItem) {
						// TODO find better way to handle errors... NavigationItem unfortunately has no 'enabled'
						oTopLevelNavItem.navItem.setVisible(false);
					}
				},
				success: function (oData, sStatus, oXHR) {
					var oIndex = fnTransformer ? fnTransformer.call(this, oData) : oData;
					if (fnExtend) {
						fnExtend(oIndex, function (oData) {
							that._removePendingCall();
							that._setIndexData(sId, oData);
						});
					} else {
						that._removePendingCall();
						that._setIndexData(sId, oIndex);
					}
				}
			});
			this._addPendingCall();
		};

		DemokitApp.prototype._setIndexData = function (sId, oIndex) {
			var that = this,
			oTopLevelNavItem, iNodes;

			function processNode(oNode) {
				var i;

				iNodes++;
				if (oNode.ref && oNode.controls) {
					var aControls = jQuery.isArray(oNode.controls) ? oNode.controls : oNode.controls.split(/,/);
					that.registerPageForType(oNode.ref, aControls);
				}
				if (oNode.alias && oNode.ref) {
					var aAliases = oNode.alias.split(",");
					for (i = 0; i < aAliases.length; i++) {
						that._mAliases[aAliases[i]] = oNode.ref;
					}
				}
				if (oNode.links) {
					for (i = 0; i < oNode.links.length; i++) {
						processNode(oNode.links[i]);
					}
				}
			}

			oTopLevelNavItem = this._findIndexById(sId);
			if (oTopLevelNavItem) {
				oTopLevelNavItem.ref = oIndex.ref;
				oTopLevelNavItem.links = oIndex;

				iNodes = 0;

				processNode(oIndex);
				oTopLevelNavItem._iTreeSize = iNodes;
				this._createNavigationTree(oTopLevelNavItem);
				oTopLevelNavItem.navItem.setEnabled(!!oTopLevelNavItem._oTree);
				oTopLevelNavItem.navItem.setHref(oIndex.ref);
			}
		};

		DemokitApp.prototype._findIndexById = function (sId) {
			for (var i = 0; i < this._aTopLevelNavItems.length; i++) {
				var oTopLevelNavItem = this._aTopLevelNavItems[i];
				if (oTopLevelNavItem.id === "mi-" + sId) {
					return oTopLevelNavItem;
				}
			}
		};

		DemokitApp.prototype.getInitialPage = function (sDefaultPage, bSupportModuleSets) {

			var sInitialPage = sDefaultPage,
				sHash = window.location.hash,
				sModuleSet = jQuery.sap.getUriParameters().get("optimized-module-set");

			/**
			 * Checks whether the given URL is a valid relative URL within the current app
			 */
			function isRelativeUrl(sUrl) {
				return /^([a-zA-Z0-9-_]+\/)*[a-zA-Z0-9-_.]+\.(?:html|txt)(#.*)?$/.test(sUrl);
			}

			if (sHash) {
				sHash = sHash.indexOf("#") === 0 ? sHash.substring(1) : sHash;
				if (isRelativeUrl(sHash)) {
					sInitialPage = sHash;
				}
			}

			if (bSupportModuleSets && sModuleSet) {
				sInitialPage = "customize.html?data=" + sModuleSet;
			}

			return sInitialPage;
		};

		DemokitApp.prototype.getPagesForCategory = function (sCategory) {
			var oTopLevelNavItem = this._findIndexById("controls"); // TODO get rid of hard coded index id
			if (!oTopLevelNavItem || !oTopLevelNavItem.links) {
				return DemokitApp.RETRY_LATER;
			}
			var aPaths = sCategory.split('/');
			var o = oTopLevelNavItem.links;
			for (var i = 0; i < aPaths.length; i++) {
				var sPath = aPaths[i],
					j;
				for (j = 0; j < o.links.length; j++) {
					if (sPath == o.links[j].text) {
						break;
					}
				}
				if (j == o.links.length) {
					return [];
				}
				o = o.links[j];
			}
			return o.links || [];
		};

		DemokitApp.RETRY_LATER = -2;

		DemokitApp.prototype.findIndexForPage = function (sUrl) {

			function findURL(oNode, sUrl) {
				if (sUrl && oNode.ref && sUrl.indexOf(oNode.ref) === 0) {
					return true;
				}
				if (oNode.links) {
					for (var j = 0; j < oNode.links.length; j++) {
						if (findURL(oNode.links[j], sUrl)) {
							return true;
						}
					}
				}
				return false;
			}

			for (var i = 0; i < this._aTopLevelNavItems.length; i++) {
				if (this._aTopLevelNavItems[i].links && findURL(this._aTopLevelNavItems[i].links, sUrl)) {
					return i;
				}
			}

			if (this._aTopLevelNavItems.length === 0 || this._iPendingCalls > 0) {
				// either no indexes have been added yet or some of them are still pending
				return DemokitApp.RETRY_LATER;
			} else {
				jQuery.sap.log.error("could not find " + sUrl + " in nav tree");
				return -1;
			}
		};

		DemokitApp.DEFAULT_TLN_ITEM = 0;

		// ---- View ------------------------------------------------------

		DemokitApp.prototype._createNavigationTree = function (oTopLevelNavItem) {

			var that = this;
			var iNodes = 0;

			function selected(oEvent) {
				var aCustomData = oEvent.getSource().getCustomData();
				for (var i in aCustomData) {
					if (aCustomData[i].getKey() == "_ref_") {
						that.navigateTo(aCustomData[i].getValue());
					}
				}
			}

			function initTreeNodes(oTarget, aLinks, iLevel, parentName) {
				for (var i = 0; i < aLinks.length; i++) {
					var oCurrentTreeNode = {
						text: aLinks[i].text,
						tooltip: aLinks[i].tooltip,
						expanded: iLevel < 1,
						selectable: !!aLinks[i].ref,
						selected: selected
					};
					oCurrentTreeNode._ref_ = aLinks[i].ref;
					oCurrentTreeNode.parentName = (iLevel < 1) ? aLinks[i].text : parentName + "." + aLinks[i].text;

					oTarget.push(oCurrentTreeNode);
					iNodes++;

					if (aLinks[i].links && aLinks[i].links.length > 0) {
						oCurrentTreeNode.nodes = [];
						initTreeNodes(oCurrentTreeNode.nodes, aLinks[i].links, iLevel + 1, oCurrentTreeNode.parentName);
					}
				}
			}

			function collapseDevGuideTree(sTopLevelNavItemId, oTree) {
				if (sTopLevelNavItemId === "mi-devguidekm") {
					oTree.collapseAll();
					var aTreeNodes = oTree.getNodes();
					for (var i = 0; i < aTreeNodes.length; i++) {
						var aNodeCustomData = aTreeNodes[i].getCustomData();
						for (var p = 0; p < aNodeCustomData.length; p++) {
							// "95d113be50ae40d5b0b562b84d715227" is the guide id of "SAPUI5: UI Development Toolkit for HTML5" root node which should be expanded.
							if (aNodeCustomData[p].getKey() === "_ref_" && aNodeCustomData[p].getValue() && aNodeCustomData[p].getValue().indexOf("95d113be50ae40d5b0b562b84d715227") !== -1) {
								aTreeNodes[i].expand();
							}
						}
					}
				}
			}

			if (oTopLevelNavItem._oTree) {
				return;
			}

			var oTree = new Tree(oTopLevelNavItem.id + "-index", {
				showHeader: false,
				width: "100%",
				height: "100%",
				showHorizontalScrollbar: true,
				selectionMode: "Single"
			});
			oTree.addStyleClass("sapUiTreeWithHeader");
			var oTreeNode = new TreeNode({
				text: "{text}",
				tooltip: "{tooltip}",
				expanded: "{expanded}",
				selectable: "{selectable}",
				selected: selected
			});
			var oTreeNodeCustomDataRef = new CustomData({
				key: "_ref_",
				value: "{_ref_}"
			});
			oTreeNode.addCustomData(oTreeNodeCustomDataRef);

			var oTreeNodeCustomDataParent = new CustomData({
				key: "parentName",
				value: "{parentName}"
			});
			oTreeNode.addCustomData(oTreeNodeCustomDataParent);

			var aTreeData = [];
			initTreeNodes(aTreeData, oTopLevelNavItem.links.links, 0, "");

			var oJSONModel = new JSONModel();
			oJSONModel.setSizeLimit(iNodes);
			oTree.setModel(oJSONModel);
			oJSONModel.setData(aTreeData);
			oTree.bindNodes("/", oTreeNode);

			collapseDevGuideTree(oTopLevelNavItem.id, oTree);

			if (aTreeData.length > 25) {
				oTree.collapseAll();
			}

			oTopLevelNavItem._oTree = oTree;
			oTopLevelNavItem._iTreeSize = iNodes;
			oTopLevelNavItem._oEmptyTreeLabel = new Label({
				text: "No matching entry found.",
				visible: false,
				width: "100%",
				textAlign: "Center"
			});
		};

		DemokitApp.prototype._createWorksetItem = function (oTLNItem) {
			var oNavItem = oTLNItem.navItem = new NavigationItem({
				key: oTLNItem.id,
				text: oTLNItem.text,
				href: "#" + oTLNItem.ref,
				visible: oTLNItem.visible,
				enabled: false
			});
			oNavItem._itemData_ = oTLNItem;
			if (this._oShell) {
				this._oShell.addWorksetItem(oNavItem);
			}
		};

		DemokitApp.prototype.createUI = function (bSearchSupported, sInitialPage) {
			var bShowScrollBars;
			var that = this;
			var sIconPrefix = "theme/img/themeswitch_";
			var THEMES = DemokitApp.THEMES;

			this._oThemeSwitch = new DropdownBox({
				change: [this._handleThemeChanged, this],
				items: jQuery.map(this._aThemes, function (sThemeId) {
					return new ListItem({text: THEMES[sThemeId], key: sThemeId});
				}),
				value: THEMES[this._sTheme]
			});

			this._oThemeSwitchPopup = new ToolPopup({
				title: "Select a theme",
				icon: sIconPrefix + "regular.png", //TODO find a proper icon
				iconHover: sIconPrefix + "hover.png", //TODO find a proper icon
				iconSelected: sIconPrefix + "selected.png", //TODO find a proper icon
				content: [this._oThemeSwitch],
				initialFocus: this._oThemeSwitch
			});

			var oContent = new HTML("content", {
				content: "<iframe id=\"content\" name=\"content\" src=\"about:blank\" frameborder=\"0\" onload=\"sap.ui.demokit.DemokitApp.getInstance().onContentLoaded();\"></iframe>"
			});

			var oSidePanelLayout = this._oSidePanelLayout = new AbsoluteLayout();

			// TODO oSidePanelLayout.addContent(oDemokit._aTopLevelNavItems[0]._oTree, {top:"0", bottom:"0", left:"0", right:"0"});
			Device.os.name == Device.os.OS.IOS ? bShowScrollBars = true : bShowScrollBars = false;

			// Display a warning in the demokit header in case we have a dev version (either with "SNAPSHOT" in the version string or an odd minor version number)
			var oDevWarning;
			if (!this._sVersionStr
				|| (this._sVersionStr.indexOf("SNAPSHOT") > -1)
				|| (this._sVersionStr.split(".").length > 1 && parseInt(this._sVersionStr.split(".")[1]) % 2 === 1)) {
				oDevWarning = new TextView({
					text: "Development version! Work in Progress!",
					semanticColor: TextViewColor.Negative,
					design: TextViewDesign.Bold
				});
			}

			var oVersionInfoMainPage = new TextView({
			  text: this._sVersionStr,
			  tooltip: "Used SAPUI5 Version is " + this._sVersionStr
			});

			var oVersionInfoDialog = new TextView({
				text: this._sVersionStr,
				tooltip: "SAPUI5 Version"
			  });

			var fnCreateAboutDialogContent = function() {
				 var oDialog;
				 var renderedDialog = sap.ui.getCore().byId('aboutDlg');
				 var oLayout;

				 if (renderedDialog instanceof Dialog) {
					 oDialog = renderedDialog;
					 oDialog.open();
					 return;
				 }

				var oBtnBack = new Button({
					text : "Back",
					visible : false,
					press : function() {
						fnShowMainContent();
					}
				});

				var oBtnCancel = new Button({
					text : "Close",
					press : function() {
						oDialog.close();
					}
				});

				var fnShowMainContent = function () {
					oDialog.removeAllContent();
					oDialog.addContent(oLayout);
					oBtnBack.setVisible(false);
				};

				var oSAPUI5Logo = new Image();
				var sAboutDialogContentHtml;

				//check if it is internal or external version of Demokit and set the dialog content according to it
				var oVersionInfo = sap.ui.getVersionInfo();
				if (oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav) ) {
					oSAPUI5Logo.setSrc("resources/sap/ui/demokit/themes/base/images/OpenUI5_new_small_size.png");
					oSAPUI5Logo.setTooltip("OpenUI5 logo blue");
					oSAPUI5Logo.setWidth("446px");
					oSAPUI5Logo.addStyleClass("extraLeftPadding");

					sAboutDialogContentHtml  = '<h2>OpenUI5 - Demo Kit</h2>';
					sAboutDialogContentHtml += '<span>&copy; 2009-2019 SAP SE or an SAP affiliate company.</span><br>';
					sAboutDialogContentHtml += '<span>Licensed under the Apache License, Version 2.0 – <embed data-index="3"><br><br><br></span>';
					sAboutDialogContentHtml += '<span>OpenUI5 Version <embed data-index="0"></span><br>';
				} else {
					oSAPUI5Logo.setSrc("resources/sap/ui/demokit/themes/base/images/logo-SAPUI5-blue-446x140.png");
					oSAPUI5Logo.setTooltip("SAPUI5 logo blue");
					oSAPUI5Logo.addStyleClass("extraLeftPadding");

					sAboutDialogContentHtml  = '<h2>SAP UI Development Toolkit for HTML5 (SAPUI5) - Demo Kit</h2>';
					sAboutDialogContentHtml += '<span>&copy; Copyright 2009-2019 SAP SE. All rights reserved.</span><br><br><br>';
					sAboutDialogContentHtml += '<span>SAPUI5 Version <embed data-index="0"></span><br>';
				}

				sAboutDialogContentHtml += '<span>This software includes the following library versions</span><br>';
				sAboutDialogContentHtml += '<span>(a full change log for all libraries can be found <embed data-index="1">).</span><br>';
				sAboutDialogContentHtml += '<embed data-index="2"><br><br><br>';

				var sAboutDialogContentHtmlOnlyForUI5 = '<span>This software includes third-party open source software.</span><br>';
				sAboutDialogContentHtmlOnlyForUI5 += '<embed data-index="0"><br>';

				var oLinkToVersionChangeLog = new Link({
					text : "here",
					tooltip: "Go to Version Change Log",
					press: function() {
						oDialog.close();
					},
					href: "releasenotes.html",
					target: "content"
				});

				var oLinkToVersionInfo = new Link({
					text : "Version Details",
					tooltip: "Go to Version Details",
					press: function() {
						oDialog.removeAllContent();
						oDialog.addContent(fnParseLibInformationVersionInfo());

						oBtnBack.setVisible(true);
					}
				});

				var oLinkToCredits = new Link({
					text : "Included Third-Party Software",
					tooltip: "Go to Included Third-Party Software list",
					press: function() {
						oDialog.removeAllContent();
						oDialog.addContent(fnParseLibInformationCredits());

						oBtnBack.setVisible(true);
					}
				});

				var oLinkToLicenseTxt = new Link({
					text : "see LICENSE.txt",
					tooltip: "Go to LICENSE.txt",
					press: function() {
						oDialog.close();
					},
					href: "LICENSE.txt",
					target: "content"
				});

				var oDialogInitialPageContent = new FormattedTextView();
				oDialogInitialPageContent.setContent(sAboutDialogContentHtml, [oVersionInfoDialog, oLinkToVersionChangeLog, oLinkToVersionInfo, oLinkToLicenseTxt]);
				oDialogInitialPageContent.addStyleClass("extraLeftPadding");

				var oDialogInitialPageContentOnlyForUI5 = new FormattedTextView();
				oDialogInitialPageContentOnlyForUI5.setContent(sAboutDialogContentHtmlOnlyForUI5, [oLinkToCredits]);
				oDialogInitialPageContentOnlyForUI5.addStyleClass("extraLeftPadding");

				//check if it is internal or external version of Demokit and set the dialog content according to it
				if ( oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav) ) {
					oLayout = new VerticalLayout({
						content : [oSAPUI5Logo, oDialogInitialPageContent]
					});
				} else {
					oLayout = new VerticalLayout({
						content : [oSAPUI5Logo, oDialogInitialPageContent, oDialogInitialPageContentOnlyForUI5]
					});
				}

				oDialog = new Dialog('aboutDlg', {
					title: "About",
					modal: true,
					buttons : [oBtnBack, oBtnCancel],
					content: [oLayout],
					showCloseButton: false,
					width: "550px",
					height: "800px",
					maxHeight: "100%"
				});

				oDialog.attachClosed(fnShowMainContent);

				oDialog.open();
			};

			var fnParseLibInformationVersionInfo = function() {
				jQuery.sap.registerModulePath("versioninfo", "./versioninfo/");
				var oModelVersionInfo = new JSONModel();

				library._loadAllLibInfo("", "_getLibraryInfo","", function(aLibs, oLibInfos){
					var data = {};
					var oLibInfo = new LibraryInfo();

					for (var i = 0, l = aLibs.length; i < l; i++) {
						aLibs[i] = oLibInfos[aLibs[i]];
						aLibs[i].libDefaultComponent = oLibInfo._getDefaultComponent(aLibs[i]);
					}
					data.libs = aLibs;
					oModelVersionInfo.setData(data);
				});

				var fnOpenReleaseDialog = function openReleaseDialog() {

					var oNotesModel;
					var oText;
					var oNotesView = sap.ui.getCore().byId("notesView");
					var oNotesDialog = sap.ui.getCore().byId("notesDialog");
					if (!oNotesDialog) {
						oText = new TextView({text: "No changes for this library!", id: "noRelNote"});
						oNotesView = sap.ui.view({id:"notesView", viewName:"versioninfo.notes", type:ViewType.Template});
						oNotesModel = new JSONModel();
						oNotesView.setModel(oNotesModel);
						oNotesDialog = new Dialog("notesDialog");
						oNotesDialog.addButton(new Button({
							text: "OK",
							press: function(){
								oNotesDialog.close();
							}
						}));
						oNotesDialog.setModal(true);
						oNotesDialog.setHeight("40%");
						oNotesDialog.setWidth("40%");
						oNotesView.addStyleClass("myReleaseNotes");
						oNotesDialog.setResizable(true);
					}

					var oLibInfo = new LibraryInfo();
					oNotesDialog.setTitle("Change log for: " + this.getBindingContext().getProperty("library"));

					var oVersion = jQuery.sap.Version(this.getBindingContext().getProperty("version"));
					var sVersion = oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch() + oVersion.getSuffix();

					oLibInfo._getReleaseNotes(this.getBindingContext().getProperty("library"), sVersion, function(oRelNotes, sVersion) {
						oNotesDialog.removeAllContent();

						if (oRelNotes && oRelNotes[sVersion] && oRelNotes[sVersion].notes && oRelNotes[sVersion].notes.length > 0) {
							oNotesDialog.addContent(oNotesView);
							oNotesView.getModel().setData(oRelNotes);
							oNotesView.bindObject("/" + sVersion);
							oNotesDialog.open();
						} else {

						if (oText) {
							oNotesDialog.addContent(oText);
						} else {
							oNotesDialog.addContent(sap.ui.getCore().byId("noRelNote"));
						}
							oNotesDialog.open();
						}

					});
				};

				var oDataSetVersionInfo = new DataSet({
					items : {
						path : "/libs",
						template : new DataSetItem({
							title : "{library}"
						})
					},
					views : [ new DataSetSimpleView({
						floating : false,
						template : new Form({
							title : new Title({text : "{library}"}),
							width : "100%",
							layout : new GridLayout(),
							formContainers : [ new FormContainer({
								formElements : [
									new FormElement({
										label : new Label({text : "Version:", layoutData : new GridElementData({hCells : "3"})}),
										fields : [ new TextView({text : "{version}"})]
									}),
									/*new FormElement({
										label : new Label({text : "Vendor:", layoutData : new GridElementData({hCells : "3"})}),
										fields : [ new sap.ui.commons.TextView({text : "{vendor}"})]
									}),*/
									new FormElement({
										label : new Label({text : "Description:", layoutData : new GridElementData({hCells : "3"})}),
										fields : [ new TextView({text : "{documentation}"})]
									}),
									new FormElement({
										label : new Label({text : "Change Log:", layoutData : new GridElementData({hCells : "3"})}),
										fields : [ new Link({text : "Open Change Log", press : fnOpenReleaseDialog})],
										visible : {
											path: "releasenotes",
											formatter: function(oValue) {
												return !!oValue;
											}
										}
									}),
									new FormElement({
										label : new Label({text : "Component:", layoutData : new GridElementData({hCells : "3"})}),
										fields : [ new TextView({text : "{libDefaultComponent}"})],
										visible : {
											path: "libDefaultComponent",
											formatter: function(oValue) {
												return !!oValue;
											}
										}
									})
								]
							})]
						})
					})],
					showToolbar: false,
					selectionChanged: function(){
						oDataSetVersionInfo.setLeadSelection(-1);
					}
				});

				oDataSetVersionInfo.setModel(oModelVersionInfo);

				var oLayoutVersionInfo = new VerticalLayout({
					content : [oDataSetVersionInfo]
				});

				return oLayoutVersionInfo;
			};

			var fnParseLibInformationCredits = function() {
				var oModelCredits = new JSONModel();

				library._loadAllLibInfo("", "_getThirdPartyInfo", function(aLibs, oLibInfos){
					if (!aLibs){
						return;
					}
					var data = {};
					data.thirdparty = [];
					for (var j = 0; j < aLibs.length; j++) {
						var oData = oLibInfos[aLibs[j]];
						for (var i = 0; i < oData.libs.length; i++) {
							var oOpenSourceLib = oData.libs[i];
							oOpenSourceLib._lib = aLibs[j];
							data.thirdparty.push(oOpenSourceLib);
						}
					}

					data.thirdparty.sort(function(a,b){
						var aName = (a.displayName || "").toUpperCase();
						var bName = (b.displayName || "").toUpperCase();

						if (aName > bName){
							return 1;
						} else if (aName < bName){
							return -1;
						} else {
							return 0;
						}
					});

					oModelCredits.setData(data);
				});

				var oDataSetCredits = new DataSet({
					items : {
						path : "/thirdparty",
						template : new DataSetItem({
							title : "{displayName}"
						})
					},
					views : [ new DataSetSimpleView({
						floating : false,
						template : new Form({
							title : new Title({text : "{displayName}"}),
							width : "100%",
							layout : new GridLayout(),
							formContainers : [ new FormContainer({
								formElements : [
									new FormElement({
										fields : [
											new Link({text : "Web Site", target : "_blank", href : "{homepage}",layoutData: new GridElementData({hCells: "auto"})}),
											new Link({text : "License Conditions", target : "_blank", href : "{license/url}",layoutData: new GridElementData({hCells: "5"})})
										]
									}),

									new FormElement({
										fields : [
											new Link({text : "Licensed by SAP under '{license/type}'", target : "_blank", href : "{license/file}"})
										]
									})
								]
							})]
						})
					})],
					//end old
					showToolbar: false,
					selectionChanged: function(){
						oModelCredits.setLeadSelection(-1);
					}
				});

				var sDebug = jQuery.sap.getUriParameters().get("sap-ui-debug");
				if (sDebug === "x" || sDebug === "X" || sDebug === "true"){
					oModelCredits.getViews()[0].getTemplate().getFormContainers()[0].addFormElement(new FormElement({
						label : new Label({text : "Requested by UI Library:", layoutData : new GridElementData({hCells : "3"})}),
						fields : [ new TextView({text : "{_lib}"})]
					}));
				}

				oDataSetCredits.setModel(oModelCredits);

				var oLayoutCredits = new VerticalLayout({
					content : [oDataSetCredits]
				});

				return oLayoutCredits;
			};

			var oAboutDialogLink = new Link({
				text : "About",
				tooltip: "About",
				press : function() {
					 fnCreateAboutDialogContent();
				}
			});

			this._oFeedbackClient = new FeedbackClient();
			this._oFeedbackPopup = this._oFeedbackClient.createFeedbackPopup();

			var oShell = this._oShell = new Shell({
				appTitle: this._sTitleStr,
				showLogoutButton: false,
				showFeederTool: false,
				applyContentPadding: false,
				showSearchTool: bSearchSupported,
				fullHeightContent: true,
				toolPopups: [this._oFeedbackPopup, this._oThemeSwitchPopup],
				search: function (oEvent) {
					that.navigateTo("search.html?q=" + encodeURIComponent(oEvent.getParameter("text")));
					that._oShell._getSearchTool().close();
				},
				worksetItemSelected: function (oEvent) {
					var oNavItem = oEvent.getParameter("item");
					if (oNavItem.getEnabled()) {
						var oItem = oNavItem._itemData_;
						// skip update of shell for new windows
						if (oItem.newWindow) {
							oEvent.preventDefault();
						}
						// navigate to the default reference
						that.navigateTo(oItem.ref, null, null, oItem.newWindow);
					} else {
						oEvent.preventDefault();
					}
				},
				content: [
					new Splitter("demokitSplitter", {
						width: "100%",
						height: "100%",
						splitterPosition: "0%",
						splitterBarVisible: false,
						firstPaneContent: [oSidePanelLayout],
						secondPaneContent: [oContent],
						showScrollBars: bShowScrollBars
					})
				],
				headerItems: oDevWarning ? [oAboutDialogLink, oDevWarning, oVersionInfoMainPage] : [oAboutDialogLink, oVersionInfoMainPage]
			});

			this._oShell.addStyleClass("sapDkShell");

			function addTagCloud(aKeywords) {

				var oTagCloud = new TagCloud({
					minFontSize: 15,
					maxFontSize: 30,
					press: function (oEvent) {
						var term = sap.ui.getCore().byId(oEvent.getParameter("tagId")).getText();
						oShell.fireSearch({text: term});
					}
				}).addStyleClass("grTagCloud");
				for (var i = 0; i < aKeywords.length; i++) {
					oTagCloud.addTag(new Tag({text: aKeywords[i].tag, weight: aKeywords[i].score}));
				}

				// enhance the original search tool
				oShell._getSearchTool && oShell._getSearchTool().addContent(oTagCloud);
			}

			if (bSearchSupported) {

				var oSearchField = oShell.getSearchField();
				oSearchField.setEnableListSuggest(true);
				oSearchField.setShowListExpander(false);
				oSearchField.setVisibleItemCount(5);
				oSearchField.setSearchProvider(new OpenSearchProvider({
					suggestType: "json",
					suggestUrl: "suggest?q={searchTerms}"
				}));

				// request top keywords
				jQuery.ajax({
					url: "keywords?kind=tags&max=50",
					dataType: "json",
					success: function (data, status, xhr) {
						if (data && data[0] && data[0].success && data[0].keywords && data[0].keywords.length) {
							addTagCloud(data[0].keywords);
							oSearchField.setWidth("80%");
						}
					}
				});

			}

			jQuery.each(this._aTopLevelNavItems, function (i, oTLNItem) {
				oShell.addWorksetItem(oTLNItem.navItem);
			});

			this.navigateTo(sInitialPage);

			sap.ui.getCore().addPrerenderingTask(function () {
				jQuery("body").append("<div id=\"logo\"><img id=\"logoico\"><img id=\"logotxt\"></div>");
			  //check if it is internal or external version of Demokit and set the dialog content according to it
				var oVersionInfo = sap.ui.getVersionInfo();
				if (oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav) ) {
					jQuery("#logoico").attr("src", "resources/sap/ui/demokit/themes/base/images/OpenUI5_new_small_size.png").addClass("sapUiImg");
				} else {
					jQuery("#logoico").attr("src", "resources/sap/ui/core/mimes/logo/icotxt_white_220x72_blue.png").addClass("sapUiImg");
				}
				//jQuery("#logotxt").attr("src", "resources/sap/ui/core/mimes/logo/txtonly_32x32.png").addClass("sapUiImg");
			});
		};

		DemokitApp.prototype.placeAt = function (sId) {
			this._oShell.placeAt(sId);
		};

		// ---- controller ----------------------------------------------------

		// Listen to IFrame load
		DemokitApp.prototype.onContentLoaded = function (e) {

			var that = this;
			var oContentWindow = jQuery("#content")[0].contentWindow;
			var sIFrameContent = this.calcRelativeUrl(oContentWindow.location.href);
			if (sIFrameContent && !this._bIgnoreIFrameOnLoad) {
				this.navigateTo(sIFrameContent, true, true);
				window.location.replace("#" + sIFrameContent);
			}
			this._applyTheme();
			this._bIgnoreIFrameOnLoad = false;

			jQuery(oContentWindow).bind("hashchange", function () {
				var sIFrameContent = that.calcRelativeUrl(oContentWindow.location.href);
				if (sIFrameContent && !that._bIgnoreIFrameOnLoad) {
					that.navigateTo(sIFrameContent, true, true);
					window.location.hash = sIFrameContent;
				}
				that._bIgnoreIFrameOnLoad = false;
			});

		};


		DemokitApp.prototype.navigateTo = function (sName, bSkipSetHash, bSkipSwitchLocation, bNewWindow) {
			var that = this;
			var TREE_ABSOLUTE_LOCATION_LEFT = "0px";
			// TREE_ABSOLUTE_LOCATION_TOP should be keeped in sync with .sapUiTreeWithHeader > div:first-child bottom property
			var TREE_ABSOLUTE_LOCATION_TOP = "32px";
			var TREE_EXPAND_BUTTON_LOCATION_RIGHT = "30px";
			var TREE_COLLAPSE_BUTTON_LOCATION_RIGHT = "0px";
			var TREE_BUTTONS_LOCATION_TOP = "0px";

			// normalize page name (from hash)
			var sPageName = sName.indexOf("#") === 0 ? sName.substring(1) : sName;
			// resolve aliases
			var sResolvedPageName = this._mAliases[sPageName];
			if (sResolvedPageName && sPageName != sResolvedPageName) {
				bSkipSwitchLocation = false;
				sPageName = sResolvedPageName;
			}

			if (this._sCurrentContent == sPageName) {
				return;
			}

			var oContent = jQuery("#content")[0];
			var oContentWindow = oContent && oContent.contentWindow;
			var topNavIdx = this.findIndexForPage(sPageName);

			// open in new window and do nothing else
			if (bNewWindow) {
				window.open(sPageName, "_blank");
				return;
			}

			// postpone navigation if either rendering did not happen yet or indexes are not yet loaded
			if (!oContentWindow || topNavIdx === DemokitApp.RETRY_LATER) {
				setTimeout(function () {
					that.navigateTo(sPageName, bSkipSetHash, bSkipSwitchLocation);
				}, 200);
				return;
			}

			var oNewTLNItem = this._aTopLevelNavItems[topNavIdx >= 0 ? topNavIdx : 0];
			var oShell = this._oShell;
			var oSplitter = sap.ui.getCore().byId("demokitSplitter");
			var sOldPos;
			if (oNewTLNItem && oNewTLNItem._iTreeSize <= 1) {
				if (oSplitter.getSplitterBarVisible()) {
					sOldPos = oSplitter.getSplitterPosition();
					if (sOldPos !== "0%") {
						oSplitter._oldPos = sOldPos;
						oSplitter.setSplitterPosition("0%");
					}
					oSplitter.setSplitterBarVisible(false);
				}
			} else if (!oSplitter.getSplitterBarVisible()) {
				sOldPos = oSplitter._oldPos || "20%";
				oSplitter.setSplitterPosition(sOldPos);
				oSplitter.setSplitterBarVisible(true);
			}

			this._sCurrentContent = sPageName;

			function findAndSelectTreeNode(sPageName, oParent, bClearSelection) {
				if (oParent) {
					if (bClearSelection && oParent.getSelectedNode && oParent.getSelectedNode()) {
						oParent.getSelectedNode().setIsSelected(false);
					}
					var aNodes = oParent.getNodes();
					for (var i = 0; i < aNodes.length; i++) {
						var aCustomData = aNodes[i].getCustomData();
						var bTreeNodeFound = false;
						for (var j in aCustomData) {
							if (aCustomData[j].getKey() == "_ref_" && aCustomData[j].getValue() && aCustomData[j].getValue().indexOf(sPageName) >= 0) {
								bTreeNodeFound = true;
								break;
							}
						}

						if (bTreeNodeFound) {
							var par = oParent;
							while (par instanceof TreeNode) {
								par.expand();
								par = par.getParent();
							}
							aNodes[i].setIsSelected(true);
							return aNodes[i];
						} else {
							var node = findAndSelectTreeNode(sPageName, aNodes[i], false);
							if (node) {
								return node;
							}
						}
					}
				}
				return null;
			}

			function createTreeFilter(oTree, oEmptyLabel) {
				var updateTree = function (oTree, sFilter, oEmptyLabel) {
					var filters = [];
					var nameFilter = new Filter("parentName", FilterOperator.Contains, sFilter);
					filters.push(nameFilter);
					var binding = oTree.getBinding("nodes");
					binding.filter(filters);
					if (sFilter !== "") {
						oTree.expandAll();
					}
					var bNoNodes = (oTree.getNodes().length === 0);
					oTree.setVisible(!bNoNodes);
					oEmptyLabel.setVisible(bNoNodes);

				};

				var oSearch = new SearchField({
					enableListSuggest: false,
					enableClear: true,
					enableFilterMode: true,
					startSuggestion: 0,
					suggest: function (oEvent) {
						updateTree(oTree, oEvent.getParameter("value"), oEmptyLabel);
					}
				});

				oSearch.addEventDelegate({
					onAfterRendering: function () {
						oSearch._ctrl.$("searchico").addClass('sapUiIcon sapUiSearchFieldFilterIcon');
						oSearch._ctrl.$("searchico").attr('style', 'font-family: SAP-icons; cursor: default;');
						oSearch._ctrl.$("searchico").attr('data-sap-ui-icon-content', '');
					}
				});

				oSearch._ctrl.setPlaceholder("Filter");

				oSearch.addStyleClass("sapUiDemokitAbsLayoutFirtsRow sapUiDemokitSearchField");
				return oSearch;
			}

			function createTreeButtons(oTree, fTreeAction, sIcon, sTooltip, sStyle) {
				var oButton = new Button({
					lite: true,
					icon : sIcon,
					press : fTreeAction.bind(oTree)
				});
				oButton.addStyleClass("sapUiDemokitExpandCollapseButtons sapUiDemokitAbsLayoutFirtsRow");
				if (sStyle) {
					oButton.addStyleClass(sStyle);
				}
				oButton.setTooltip(sTooltip);

				oButton.addEventDelegate({
					onAfterRendering: function () {
						oButton.$("icon").attr("title", sTooltip);
						oButton.$("icon").attr("aria-label", sTooltip);
					}
				});

				return oButton;
			}

			function createCollapseButton(oTree) {
				return createTreeButtons(oTree, oTree.collapseAll, "sap-icon://collapse-group", "Collapse All", "sapUiDemokitCollapseButton");
			}

			function createExpandButton(oTree) {
				return createTreeButtons(oTree, oTree.expandAll, "sap-icon://expand-group", "Expand All");
			}

			//Update Top Level Navigation and Navigation Tree
			var oSelectedNavEntry = null;
			var oNewNavItem = oNewTLNItem && oNewTLNItem.navItem;
			if (oNewNavItem && this._sSelectedWorkSetItem != oNewNavItem.getId()) {
				oNewNavItem.setVisible(true);
				oShell.setSelectedWorksetItem(oNewNavItem);
				this._oSidePanelLayout.removeAllContent();
				if (oNewTLNItem._oTree) {
					this._oSidePanelLayout.addContent(createTreeFilter(oNewTLNItem._oTree, oNewTLNItem._oEmptyTreeLabel));
					this._oSidePanelLayout.addContent(createCollapseButton(oNewTLNItem._oTree), {
						right: TREE_COLLAPSE_BUTTON_LOCATION_RIGHT,
						top: TREE_BUTTONS_LOCATION_TOP
					});
					this._oSidePanelLayout.addContent(createExpandButton(oNewTLNItem._oTree), {
						right: TREE_EXPAND_BUTTON_LOCATION_RIGHT,
						top: TREE_BUTTONS_LOCATION_TOP
					});
					this._oSidePanelLayout.addContent(oNewTLNItem._oTree, {
						left: TREE_ABSOLUTE_LOCATION_LEFT,
						top: TREE_ABSOLUTE_LOCATION_TOP
					});
					this._oSidePanelLayout.addContent(oNewTLNItem._oEmptyTreeLabel, {
						left: TREE_ABSOLUTE_LOCATION_LEFT,
						top: TREE_ABSOLUTE_LOCATION_TOP
					});
				}

				oSelectedNavEntry = findAndSelectTreeNode(sPageName, oNewTLNItem._oTree, true);

				if (oNewTLNItem.themable && oShell.indexOfToolPopup(this._oThemeSwitchPopup) == -1 ) {
					oShell.addToolPopup(this._oThemeSwitchPopup);
				} else if ((!oNewTLNItem.themable) && oShell.indexOfToolPopup(this._oThemeSwitchPopup) != -1) {
					oShell.removeToolPopup(this._oThemeSwitchPopup);
				}

			} else {
				var aSidePanelContent = this._oSidePanelLayout.getContent();
				var oTree;
				for (var i in aSidePanelContent) {
					if (aSidePanelContent[i].getId().indexOf("index") > -1) {
						oTree = aSidePanelContent[i];
					}
				}
				oSelectedNavEntry = findAndSelectTreeNode(sPageName, oTree, true);
				//If no entry is found, try again without hash
				if (!oSelectedNavEntry && sPageName.indexOf("#") > 0) {
					var sShortName = sPageName.substr(0, sPageName.indexOf("#") - 1);
					oSelectedNavEntry = findAndSelectTreeNode(sShortName, oTree);
				}
			}

			sap.ui.getCore().applyChanges();
			this._sSelectedWorkSetItem = oShell.getSelectedWorksetItem();

			// Update IFrame content and URL hash
			if (!bSkipSetHash) {
				window.location.hash = sPageName;
			}

			if (!bSkipSwitchLocation) {

				this._bIgnoreIFrameOnLoad = true;

				oContentWindow.location.replace((sPageName.indexOf("/") == 0 ? "" : this.sBasePathname) + sPageName);
			}

			this._oFeedbackClient.updateFeedbackContextText();
		};

		DemokitApp.THEMES = {
			"sap_fiori_3": "Quartz Light",
			"sap_fiori_3_hcb": "Quartz High Contrast Black",
			"sap_fiori_3_hcw": "Quartz High Contrast White",
			"sap_belize": "Belize",
			"sap_belize_plus": "Belize Plus",
			"sap_belize_hcb": "Belize High Contrast Black",
			"sap_belize_hcw": "Belize High Contrast White",
			"sap_bluecrystal": "Blue Crystal",
			"sap_hcb": "High Contrast Black"
		};

		DemokitApp.prototype._handleThemeChanged = function (oEvent) {
			var newTheme = oEvent.getParameter("newValue");
			for (var x in DemokitApp.THEMES) {
				if (DemokitApp.THEMES[x] == newTheme) {
					this._sTheme = x;
					this._applyTheme();
					oEvent.getSource().getParent().close();
					break;
				}
			}
		};

		DemokitApp.prototype._applyTheme = function () {
			var oContentWindow = jQuery("#content")[0].contentWindow;
			var sIFrameContent = this.calcRelativeUrl(oContentWindow.location.href);
			var topNavIdx = sIFrameContent ? this.findIndexForPage(sIFrameContent) : -1;

			if (sIFrameContent
				&& topNavIdx >= 0 && this._aTopLevelNavItems[topNavIdx].themable
				&& oContentWindow
				&& oContentWindow.sap
				&& oContentWindow.sap.ui
				&& oContentWindow.sap.ui.getCore) {

				//Find supported themes
				var isMobilePage = sIFrameContent.match(/\/sap\/me?\//);
				var aMySupportedThemes = isMobilePage ? ["sap_fiori_3", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_belize", "sap_belize_plus", "sap_belize_hcb", "sap_belize_hcw", "sap_bluecrystal"] : this._aThemes;
				var aSupportedThemes = oContentWindow.sap.ui.demokit && oContentWindow.sap.ui.demokit._supportedThemes ? oContentWindow.sap.ui.demokit._supportedThemes : aMySupportedThemes;

				//Update theme switch
				var aItems = this._oThemeSwitch.getItems();
				for (var i = 0; i < aItems.length; i++) {
					aItems[i].setEnabled(jQuery.inArray(aItems[i].getKey(), aSupportedThemes) >= 0);
				}

				//Current theme is not supported -> Use a different one
				if (jQuery.inArray(this._sTheme, aSupportedThemes) < 0) {
					this._sTheme = aSupportedThemes[0];
					this._oThemeSwitch.setValue(DemokitApp.THEMES[this._sTheme]);
				}

				oContentWindow.sap.ui.getCore().applyTheme(this._sTheme);
			}
		};

		(function () {

			function resolve(oLink, sLibUrl) {
				if (oLink.ref && oLink.resolve === "lib") {
					oLink.ref = sLibUrl + oLink.ref;
				}
				if (oLink.links) {
					for (var i = 0; i < oLink.links.length; i++) {
						resolve(oLink.links[i], sLibUrl);
					}
				}
			}

			function merge(oNode1, oNode2) {
				if (oNode1.key != oNode2.key || !oNode2.links || oNode2.links.length == 0) {
					return;
				}
				if (!oNode1.links) {
					oNode1.links = oNode2.links;
					return;
				}

				function findNodeWithKey(oNode, key) {
					for (var j = 0; j < oNode.links.length; j++) {
						if (oNode.links[j].key === key) {
							return oNode.links[j];
						}
					}
					return null;
				}

				var oSubNode;

				for (var i = 0; i < oNode2.links.length; i++) {
					oSubNode = oNode2.links[i];
					if (!oSubNode.key) {
						oNode1.links.push(oSubNode);
					} else {
						var oNode = findNodeWithKey(oNode1, oSubNode.key);
						if (oNode) {
							merge(oNode, oSubNode);
						} else {
							oNode1.links.push(oSubNode);
						}
					}
				}
			}

			function finalize(oIndexData, fnCallback, aLibs, oDocIndices) {
				for (var j = 0; j < aLibs.length; j++) {
					var oData = oDocIndices[aLibs[j]];
					if (oData && oData.docu) {
						resolve(oData.docu, oData.libraryUrl);
						merge(oIndexData, oData.docu);
					}
				}

				fnCallback(oIndexData);
			}

			DemokitApp.addReleaseNotesToDevGuide = function (oIndexData, sUrl, sTitle, iLevel) {
				if (!sUrl) {
					sUrl = "releasenotes.html";
				}
				if (!sTitle) {
					sTitle = "Release Notes";
				}
				if (!iLevel) {
					iLevel = 1;
				}

				function firstChild(node) {
					if (node && node.links && node.links.length > 0) {
						return node.links[0];
					}
					return null;
				}

				var oIndex = oIndexData;
				for (var i = 0; i < iLevel; i++) {
					oIndex = firstChild(oIndex);
				}

				if (oIndex) {
					oIndex.links = oIndex.links || [];
					oIndex.links.push({ref: sUrl, text: sTitle, alias: "releasenotes.html"});
				}

				return oIndexData;
			};

			DemokitApp.extendDevGuide = function (oIndexData, fnCallback) {
				var libInfo = new LibraryInfo();
				var sUrl = "discovery/all_libs";

				jQuery.ajax({
					url: sUrl,
					dataType: "json",
					error: function (xhr, status, e) {
						jQuery.sap.log.error("failed to load library list from '" + sUrl + "': " + status + ", " + e);
						fnCallback(oIndexData);
					},
					success: function (oData, sStatus, oXHR) {
						var libs = oData["all_libs"];
						if (!libs) {
							jQuery.sap.log.error("failed to load library list from '" + sUrl + "': " + sStatus + ", Data: " + libs);
							fnCallback(oIndexData);
							return;
						}

						var count = 0,
							len = libs.length,
							oDocIndices = {},
							aLibs = [],
							libName;
						for (var i = 0; i < len; i++) {
							libName = libs[i].entry.replace(/\//g, ".");
							aLibs.push(libName);
							/*eslint-disable no-loop-func */
							libInfo._getDocuIndex(libName, function (oExtensionData) {
								oDocIndices[oExtensionData.library] = oExtensionData;
								count++;
								if (count == len) {
									finalize(oIndexData, fnCallback, aLibs, oDocIndices);
								}
							});
							/*eslint-enable no-loop-func */
						}
					}
				});
			};

		})();


		return DemokitApp;

}, /* bExport= */ true);
