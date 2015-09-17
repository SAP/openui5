/*!
 * ${copyright}
 */

// Main class for Demokit-like applications
sap.ui.define(['jquery.sap.global', 'sap/ui/commons/DropdownBox', 'sap/ui/commons/Label', 'sap/ui/commons/Splitter', 'sap/ui/commons/layout/AbsoluteLayout', 'sap/ui/core/ListItem', 'sap/ui/core/search/OpenSearchProvider', './Tag', './TagCloud', './library', 'sap/ui/ux3/NavigationItem', 'sap/ui/ux3/Shell'],
	function(jQuery, DropdownBox, Label, Splitter, AbsoluteLayout, ListItem, OpenSearchProvider, Tag, TagCloud, library, NavigationItem, Shell) {
	"use strict";


	var DemokitApp = function(sTitle, sVersion, aThemes) {
		
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
		this._aThemes = aThemes || ["sap_bluecrystal", "sap_goldreflection", "sap_hcb"];
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
		
		jQuery(window).bind('hashchange', function() {
			var sHash = window.location.hash;
			jQuery.sap.log.debug("hashchange occured, current='" + that._sCurrentContent + "', new='" + sHash + "'");
			if ( sHash  &&  sHash != "#" + that._sCurrentContent ) {
				jQuery.sap.log.info("navigate to " + sHash);
				that.navigateTo(sHash, true);
			}
		});
	
	};
	
	DemokitApp.getInstance = function() {
		var oTopDemokit = jQuery.sap.getObject("top.sap.ui.demokit.DemokitApp");
		if ( oTopDemokit && oTopDemokit != DemokitApp ) {
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
	
	DemokitApp.prototype.registerPageForType = function(sUrl, aControls) {
		this._mBestMatchingPage[aControls[0]] = sUrl;
	};
	
	DemokitApp.prototype.findPageForType = function(sType) {
		return this._mBestMatchingPage[sType] || "docs/api/symbols/" + sType + ".html";
	};
	
	DemokitApp.prototype._addPendingCall = function() {
		this._iPendingCalls++;
	};
	
	DemokitApp.prototype._removePendingCall = function() {
		this._iPendingCalls--;
	};
	
	DemokitApp.prototype.addIndex = function(sId, oSettings) {
		oSettings = oSettings || {};
		
		var that = this;
		
		var oTLNItem = {
			id : "mi-" + sId,
			text : oSettings.caption || sId,
			newWindow : oSettings.newWindow,
			visible : (typeof oSettings.visible === "boolean") ? oSettings.visible : true,
			themable : oSettings.themable || false
		};
		this._aTopLevelNavItems.push(oTLNItem);
		this._createWorksetItem(oTLNItem);
		if ( oSettings.index ) {
			if ( oSettings.extend ) {
				oSettings.extend(oSettings.index, function(oData){
					that._setIndexData(sId, oData);
				});
			} else {
				that._setIndexData(sId, oSettings.index);
			}
		} else if ( oSettings.url ) {
			this._loadIndexFromUrl(sId, oSettings.url, oSettings.transformer, oSettings.extend);
		}
	};
	
	DemokitApp.prototype._loadIndexFromUrl = function(sId, sUrl, fnTransformer, fnExtend) {
		var that = this;
	
		jQuery.ajax({
			url : sUrl,
			dataType : sUrl.slice(-4) == ".xml" ? "xml" : "json",
			error : function(xhr, status, e) {
				that._removePendingCall();
				jQuery.sap.log.error("failed to load index '" + sId + "' from '" + sUrl + "': " + status + ", " + e);
				var oTopLevelNavItem = that._findIndexById(sId);
				if ( oTopLevelNavItem ) {
					// TODO find better way to handle errors... NavigationItem unfortunately has no 'enabled' 
					oTopLevelNavItem.navItem.setVisible(false);
				}
			},
			success : function(oData, sStatus, oXHR) {
				var oIndex = fnTransformer ? fnTransformer.call(this, oData) : oData;
				if ( fnExtend ) {
					fnExtend(oIndex, function(oData){
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
	
	DemokitApp.prototype._setIndexData = function(sId, oIndex) {
		var that = this;
		
		function processNode(oNode) {
			iNodes++;
			if ( oNode.ref && oNode.controls ) {
				var aControls = jQuery.isArray(oNode.controls) ? oNode.controls : oNode.controls.split(/,/);
				that.registerPageForType(oNode.ref, aControls);
			}
			if ( oNode.alias && oNode.ref ) {
				var aAliases = oNode.alias.split(",");
				for (var i = 0; i < aAliases.length; i++) {
					that._mAliases[aAliases[i]] = oNode.ref;
				}
			}
			if ( oNode.links ) {
				for (var i = 0; i < oNode.links.length; i++) {
					processNode(oNode.links[i]);
				}
			}
		}

		var oTopLevelNavItem = this._findIndexById(sId);
		if ( oTopLevelNavItem ) {
			oTopLevelNavItem.ref = oIndex.ref;
			oTopLevelNavItem.links = oIndex;
			
			var iNodes = 0;
				
			processNode(oIndex);
			oTopLevelNavItem._iTreeSize = iNodes;
			this._createNavigationTree(oTopLevelNavItem);
			oTopLevelNavItem.navItem.setEnabled(!!oTopLevelNavItem._oTree);
			oTopLevelNavItem.navItem.setHref(oIndex.ref);
		}
	};
	
	DemokitApp.prototype._findIndexById = function(sId) {
		for (var i = 0; i < this._aTopLevelNavItems.length; i++) {
			var oTopLevelNavItem = this._aTopLevelNavItems[i];
			if ( oTopLevelNavItem.id === "mi-" + sId ) {
				return oTopLevelNavItem;
			}
		}
	};
	
	DemokitApp.prototype.getInitialPage = function(sDefaultPage, bSupportModuleSets) {
	
		var sInitialPage = sDefaultPage,
			sHash = window.location.hash,
			sModuleSet = jQuery.sap.getUriParameters().get("optimized-module-set");
	
		/**
		 * Checks whether the given URL is a valid relative URL within the current app
		 */
		function isRelativeUrl(sUrl) {
			return /^([a-zA-Z0-9-_]+\/)*[a-zA-Z0-9-_.]+\.html(#.*)?$/.test(sUrl);
		}
		
		if ( sHash ) {
			sHash = sHash.indexOf("#") === 0 ? sHash.substring(1) : sHash;
			if (isRelativeUrl(sHash)) {
				sInitialPage = sHash;
			}
		}
	
		if ( bSupportModuleSets && sModuleSet ) {
			sInitialPage = "customize.html?data=" + sModuleSet;
		}
	
		return sInitialPage;
	};
	
	DemokitApp.prototype.getPagesForCategory = function(sCategory) {
		var oTopLevelNavItem = this._findIndexById("controls"); // TODO get rid of hard coded index id
		if ( !oTopLevelNavItem || !oTopLevelNavItem.links ) {
			return DemokitApp.RETRY_LATER;
		}
		var aPaths = sCategory.split('/');
		var o = oTopLevelNavItem.links;
		for (var i = 0; i < aPaths.length; i++) {
			var sPath = aPaths[i];
			for (var j = 0; j < o.links.length; j++) {
				if ( sPath == o.links[j].text ) {
					break;
				}
			}
			if ( j == o.links.length ) {
				return [];
			}
			o = o.links[j];
		}
		return o.links || [];
	};
	
	DemokitApp.RETRY_LATER = -2;
	
	DemokitApp.prototype.findIndexForPage = function(sUrl) {
		
		function findURL(oNode, sUrl) {
			if ( sUrl && oNode.ref && sUrl.indexOf(oNode.ref) === 0 ) {
				return true;
			}
			if ( oNode.links ) {
				for (var j = 0; j < oNode.links.length; j++) {
					if ( findURL(oNode.links[j], sUrl) ) {
						return true;
					}
				}
			}
			return false;
		}
		
		for (var i = 0; i < this._aTopLevelNavItems.length; i++) {
			if ( this._aTopLevelNavItems[i].links && findURL(this._aTopLevelNavItems[i].links, sUrl) ) {
				return i;
			}
		}
	
		if ( this._aTopLevelNavItems.length === 0 || this._iPendingCalls > 0 ) {
			// either no indexes have been added yet or some of them are still pending
			return DemokitApp.RETRY_LATER;
		} else {
			jQuery.sap.log.error("could not find " + sUrl + " in nav tree");
			return -1;
		}
	};
	
	DemokitApp.DEFAULT_TLN_ITEM = 0;
	
	// ---- View ------------------------------------------------------
	
	DemokitApp.prototype._createNavigationTree = function(oTopLevelNavItem) {
		
		var that = this;
		var iNodes = 0;
		
		function selected(oEvent) {
			that.navigateTo(oEvent.getSource()._ref_);
		}
		
		function initLinks(oTarget, aLinks, iLevel) {
			for (var i = 0; i < aLinks.length; i++) {
				var oNode = new sap.ui.commons.TreeNode({
					text: aLinks[i].text,
					tooltip: aLinks[i].tooltip,
					expanded: iLevel < 1,
					selectable: !!aLinks[i].ref,
					icon: aLinks[i].ico || null,
					selected: selected
				});
				oNode._ref_ = aLinks[i].ref;
				oTarget.addNode(oNode);
				iNodes++;
				if (aLinks[i].links && aLinks[i].links.length > 0) {
					initLinks(oNode, aLinks[i].links, iLevel + 1);
				}
			}
		}
	
		if (oTopLevelNavItem._oTree) {
			return;
		}
		
		var oTree = new sap.ui.commons.Tree(oTopLevelNavItem.id + "-index", {
			showHeader: true,
			width: "100%",
			height: "100%",
			showHorizontalScrollbar: true
		});
		oTree.addStyleClass("sapUiTreeWithHeader");
		initLinks(oTree, oTopLevelNavItem.links.links, 0);
		oTopLevelNavItem._oTree = oTree;
		oTopLevelNavItem._iTreeSize = iNodes;
	};
	
	DemokitApp.prototype._createWorksetItem = function(oTLNItem) {
		var oNavItem = oTLNItem.navItem = new NavigationItem({
			key: oTLNItem.id,
			text: oTLNItem.text,
			href: "#" + oTLNItem.ref,
			visible : oTLNItem.visible,
			enabled: false
		});
		oNavItem._itemData_ = oTLNItem;
		if ( this._oShell ) {
			this._oShell.addWorksetItem(oNavItem);
		}
	};
	
	DemokitApp.prototype.createUI = function(bSearchSupported, sInitialPage) {
		var bShowScrollBars;
		var that = this;
		var sIconPrefix = "theme/img/themeswitch_";
		var THEMES = DemokitApp.THEMES;
		
		this._oThemeSwitch = new DropdownBox({
			change: [this._handleThemeChanged, this],
			items: jQuery.map(this._aThemes, function(sThemeId) {
				return new ListItem({text: THEMES[sThemeId], key: sThemeId});
			}),
			value: THEMES[this._sTheme]
		});
	
		this._oThemeSwitchPopup = new sap.ui.ux3.ToolPopup({
			title:"Select a theme",
			icon:sIconPrefix + "regular.png", //TODO find a proper icon
			iconHover:sIconPrefix + "hover.png", //TODO find a proper icon
			iconSelected:sIconPrefix + "selected.png", //TODO find a proper icon
			content:[ this._oThemeSwitch ],
			initialFocus: this._oThemeSwitch
		});
		
		var oContent = new sap.ui.core.HTML("content", {
			content: "<iframe id=\"content\" name=\"content\" src=\"about:blank\" frameborder=\"0\" onload=\"sap.ui.demokit.DemokitApp.getInstance().onContentLoaded();\"></iframe>"
		});
	
		var oSidePanelLayout = this._oSidePanelLayout = new AbsoluteLayout();
	
		// TODO oSidePanelLayout.addContent(oDemokit._aTopLevelNavItems[0]._oTree, {top:"0", bottom:"0", left:"0", right:"0"});
		sap.ui.Device.os.name == sap.ui.Device.os.OS.IOS ? bShowScrollBars = true : bShowScrollBars = false;
	
		var oVersionInfo = new sap.ui.commons.Link({
			text: this._sVersionStr,
			tooltip: "Open Version Info",
			press: function() {
				that.navigateTo("versioninfo.html");
			}
		});
		
		var oShell = this._oShell = new Shell({
			appTitle: this._sTitleStr,
			showLogoutButton: false,
			showFeederTool: false,
			applyContentPadding: false,
			showSearchTool: bSearchSupported,
			fullHeightContent: true,
			toolPopups: [ this._oThemeSwitchPopup ],
			search: function(oEvent){
				that.navigateTo("search.html?q=" + encodeURIComponent(oEvent.getParameter("text")));
				that._oShell._getSearchTool().close();
			},
			worksetItemSelected: function(oEvent){
				var oNavItem = oEvent.getParameter("item");
				if ( oNavItem.getEnabled() ) {
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
			content:[
				new Splitter("demokitSplitter", {
					width:"100%",
					height:"100%",
					splitterPosition:"0%",
					splitterBarVisible:false,
					firstPaneContent:[oSidePanelLayout],
					secondPaneContent:[oContent],
					showScrollBars:bShowScrollBars
				})
			],
			headerItems:[oVersionInfo]
		});
	
		this._oShell.addStyleClass("sapDkShell");
		
		function addTagCloud(aKeywords) {
			
			var oTagCloud = new TagCloud({
				minFontSize:15,
				maxFontSize:30,
				press : function (oEvent) {
					var term = sap.ui.getCore().byId(oEvent.getParameter("tagId")).getText();
					oShell.fireSearch({text : term});
				}
			}).addStyleClass("grTagCloud");
			for (var i = 0; i < aKeywords.length; i++) {
				oTagCloud.addTag(new Tag({ text : aKeywords[i].tag, weight : aKeywords[i].score }));
			}
			
			// enhance the original search tool
			oShell._getSearchTool && oShell._getSearchTool().addContent(oTagCloud);
		}
		
		if ( bSearchSupported ) {
			
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
				url : "keywords?kind=tags&max=50",
				dataType : "json",
				success : function(data, status, xhr) {
					if ( data && data[0] && data[0].success && data[0].keywords && data[0].keywords.length ) {
						addTagCloud(data[0].keywords);
						oSearchField.setWidth("80%");
					}
				}
			});
				
		}
	
		jQuery.each(this._aTopLevelNavItems, function(i, oTLNItem) {
			oShell.addWorksetItem(oTLNItem.navItem);
		});
	
		this.navigateTo(sInitialPage);
		
		jQuery(function(){
			jQuery("body").append("<div id=\"logo\"><img id=\"logoico\"><img id=\"logotxt\"></div>");
			jQuery("#logoico").attr("src", "resources/sap/ui/core/mimes/logo/icotxt_white_220x72_blue.png").addClass("sapUiImg");
			//jQuery("#logotxt").attr("src", "resources/sap/ui/core/mimes/logo/txtonly_32x32.png").addClass("sapUiImg");
		});
	};
	
	DemokitApp.prototype.placeAt = function(sId) {
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
	
		jQuery(oContentWindow).bind("hashchange", function() {
			var sIFrameContent = that.calcRelativeUrl(oContentWindow.location.href);
			if (sIFrameContent && !that._bIgnoreIFrameOnLoad) {
				that.navigateTo(sIFrameContent, true, true);
				window.location.hash = sIFrameContent;
			}
			that._bIgnoreIFrameOnLoad = false;
		});
		
	};
	
	
	DemokitApp.prototype.navigateTo = function(sName, bSkipSetHash, bSkipSwitchLocation, bNewWindow) {
		
		var that = this;
		
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
		if ( !oContentWindow || topNavIdx === DemokitApp.RETRY_LATER ) {
			setTimeout(function() {
				that.navigateTo(sPageName, bSkipSetHash, bSkipSwitchLocation);
			}, 200);
			return;
		}
			
		var oNewTLNItem = topNavIdx >= 0 ? this._aTopLevelNavItems[topNavIdx] : null;
		var oShell = this._oShell;
		var oSplitter = sap.ui.getCore().byId("demokitSplitter");
		if ( oNewTLNItem && oNewTLNItem._iTreeSize <= 1 ) {
			if (oSplitter.getSplitterBarVisible()) {
				var sOldPos = oSplitter.getSplitterPosition();
				if (sOldPos !== "0%") {
					oSplitter._oldPos = sOldPos;
					oSplitter.setSplitterPosition("0%");
				}
				oSplitter.setSplitterBarVisible(false);
			}
		} else {
			if (!oSplitter.getSplitterBarVisible()) {
				var sOldPos = oSplitter._oldPos || "20%";
				oSplitter.setSplitterPosition(sOldPos);
				oSplitter.setSplitterBarVisible(true);
			}
		}
		
		this._sCurrentContent = sPageName;
	
		function findAndSelectTreeNode(sPageName, oParent, bClearSelection) {
			if ( oParent ) {
				if (bClearSelection && oParent.getSelectedNode && oParent.getSelectedNode()) {
					oParent.getSelectedNode().setIsSelected(false);
				}
				var aNodes = oParent.getNodes();
				for (var i = 0; i < aNodes.length; i++) {
					if (aNodes[i]._ref_ && aNodes[i]._ref_.indexOf(sPageName) >= 0) {
						aNodes[i].setIsSelected(true);
						var par = oParent;
						while (par instanceof sap.ui.commons.TreeNode) {
							par.expand();
							par = par.getParent();
						}
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
	
		//Update Top Level Navigation and Navigation Tree
		var oSelectedNavEntry = null;
		var oNewNavItem = oNewTLNItem && oNewTLNItem.navItem;
		if ( oNewNavItem && this._sSelectedWorkSetItem != oNewNavItem.getId() ) {
			oNewNavItem.setVisible(true);
			oShell.setSelectedWorksetItem(oNewNavItem);
			this._oSidePanelLayout.removeAllContent();
			if ( oNewTLNItem._oTree ) {
				this._oSidePanelLayout.addContent(oNewTLNItem._oTree);
			}
			oSelectedNavEntry = findAndSelectTreeNode(sPageName, oNewTLNItem._oTree, true);
	
			//Hide/Show Theme Switch
			if ( oNewTLNItem.themable ) {
				if (oShell.getToolPopups().length == 0) {
					oShell.addToolPopup(this._oThemeSwitchPopup );
				}
			} else {
				oShell.removeAllToolPopups();
			}
		} else {
			oSelectedNavEntry = findAndSelectTreeNode(sPageName, this._oSidePanelLayout.getContent()[0], true);
			//If no entry is found, try again without hash
			if (!oSelectedNavEntry && sPageName.indexOf("#") > 0) {
				var sShortName = sPageName.substr(0, sPageName.indexOf("#") - 1);
				oSelectedNavEntry = findAndSelectTreeNode(sShortName, this._oSidePanelLayout.getContent()[0]);
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
			
			// set fakeOS for mobile test pages (BUT not for mobile demo apps)
			var isMobilePage = sPageName && sPageName.match(/\/sap\/me?\//);
			var isMobileDemoApp = sPageName && sPageName.indexOf("sap/m/demokit") !== -1;
			var sFakeOS = (isMobilePage && !isMobileDemoApp) ? "?sap-ui-xx-fakeOS=ios" : "";
			
			oContentWindow.location.replace((sPageName.indexOf("/") == 0 ? "" : this.sBasePathname) + sPageName + sFakeOS);
		}
	
	};
	
	DemokitApp.THEMES = {
		"sap_bluecrystal" : "Blue Crystal",
		"sap_goldreflection" : "Gold Reflection",
		"sap_hcb" : "High Contrast Black"
	};
	
	DemokitApp.prototype._handleThemeChanged = function(oEvent) {
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
	
	DemokitApp.prototype._applyTheme = function() {
		var oContentWindow = jQuery("#content")[0].contentWindow;
		var sIFrameContent = this.calcRelativeUrl(oContentWindow.location.href);
		var topNavIdx = sIFrameContent ? this.findIndexForPage(sIFrameContent) : -1;
	
		if (sIFrameContent
				&& topNavIdx >= 0 && this._aTopLevelNavItems[topNavIdx].themable
				&& oContentWindow
				&& oContentWindow.sap
				&& oContentWindow.sap.ui
				&& oContentWindow.sap.ui.getCore ) {
			
			//Find supported themes
			var isMobilePage = sIFrameContent.match(/\/sap\/me?\//);
			var aMySupportedThemes = isMobilePage ? ["sap_bluecrystal"] : this._aThemes;
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
	
	
	(function() {
		
		function resolve(oLink, sLibUrl){
			if (oLink.ref && oLink.resolve === "lib") {
				oLink.ref = sLibUrl + oLink.ref;
			}
			if (oLink.links) {
				for (var i = 0; i < oLink.links.length; i++) {
					resolve(oLink.links[i], sLibUrl);
				}
			}
		}
		
		function merge(oNode1, oNode2){
			if (oNode1.key != oNode2.key || !oNode2.links || oNode2.links.length == 0) {
				return;
			}
			if (!oNode1.links) {
				oNode1.links = oNode2.links;
				return;
			}
			
			function findNodeWithKey(oNode, key){
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
		
		function finalize(oIndexData, fnCallback, aLibs, oDocIndices){
			for (var j = 0; j < aLibs.length; j++) {
				var oData = oDocIndices[aLibs[j]];
				if (oData && oData.docu) {
					resolve(oData.docu, oData.libraryUrl);
					merge(oIndexData, oData.docu);
				}
			}
			
			fnCallback(oIndexData);
		}
		
		DemokitApp.addReleaseNotesToDevGuide = function(oIndexData, sUrl, sTitle, iLevel) {
			if (!sUrl) {
				sUrl = "releasenotes.html";
			}
			if (!sTitle) {
				sTitle = "Release Notes";
			}
			if (!iLevel) {
				iLevel = 1;
			}
			
			function firstChild(node){
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
		
		DemokitApp.extendDevGuide = function(oIndexData, fnCallback) {
			jQuery.sap.require("sap.ui.core.util.LibraryInfo");
			var libInfo = new sap.ui.core.util.LibraryInfo();
			var sUrl = "discovery/all_libs";
			
			jQuery.ajax({
				url : sUrl,
				dataType : "json",
				error : function(xhr, status, e) {
					jQuery.sap.log.error("failed to load library list from '" + sUrl + "': " + status + ", " + e);
					fnCallback(oIndexData);
				},
				success : function(oData, sStatus, oXHR) {
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
						libInfo._getDocuIndex(libName, function(oExtensionData){
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
