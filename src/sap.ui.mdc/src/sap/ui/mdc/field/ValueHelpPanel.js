/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/strings/formatMessage',
	'sap/ui/model/resource/ResourceModel',
	'sap/m/Tokenizer',
	'sap/ui/mdc/enum/ConditionValidated'
	], function(
			XMLComposite,
			JSONModel,
			Filter,
			ManagedObjectObserver,
			formatMessage,
			ResourceModel,
			Tokenizer,
			ConditionValidated
		) {
	"use strict";

	/**
	 * Constructor for a new <code>ValueHelpPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>ValueHelpPanel</code> control is used inside the <code>FieldValueHelp</code> element to show a complex dialog
	 * for entering multiple kinds of conditions.
	 *
	 * @extends sap.ui.core.XMLComposite
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.field.ValueHelpPanel
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	var ValueHelpPanel = XMLComposite.extend("sap.ui.mdc.field.ValueHelpPanel", {
		metadata: {
			properties: {
				/**
				 * If set to <code>true</code>, a tokenizer is shown.
				 */
				showTokenizer: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},
				/**
				 * If set to <code>true</code>, the <code>FilterBar</code> area is shown.
				 * The <code>FilterBar</code> must be assigned using <code>setFilterBar</code>.
				 */
				showFilterbar: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},

				/**
				 * Sets the conditions that represent the selected values of the help.
				 *
				 * @since 1.62.0
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Sets the conditions for the <code>SearchField</code> control.
				 *
				 * @since 1.62.0
				 */
				filterConditions: {
					type: "object[]",
					group: "Data",
					defaultValue: []
				},

				/**
				 * If set, a <code>SearchField</code> control is shown.
				 *
				 * @since 1.74.0
				 */
				searchEnabled: {
					type: "boolean",
					group: "Data",
					defaultValue: true
				},

				/**
				 * The <code>formatOptions</code> for the <code>ConditionType</code> used to format tokens.
				 *
				 * @since 1.62.0
				 */
				formatOptions: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Internal property to bind corresponding controls to the visibility of the <code>FilterBar</code> section
				 */
				_filterBarVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event is fired when a search is triggered by the <code>SearchField</code> control.
				 *
				 * @since 1.72.0
				 */
				search: {
				}
			}

		},
		fragment: "sap.ui.mdc.field.ValueHelpPanel",

		init: function() {
			var oManagedObjectModel = this._getManagedObjectModel();
			oManagedObjectModel.setSizeLimit(1000000); // TOTO: better solution to allow more than 100 Tokens

			if (!this._oTokenizer) {
				this._oTokenizer = this.byId("VHPTokenizer");
				this._oTokenizer.updateTokens = function() {
					Tokenizer.prototype.updateTokens.apply(this, arguments);
					this.invalidate(); // as VHP could be supressed but Tokenizer needs to be updated
				};
				this._oTokenizer._oScroller.setHorizontal(true);
			}
			this._oTokenizerPanel = this.byId("VHPTokenizerPanel");

			// TODO: better logic to get FieldPath or decide when to render a SearchField in FieldBase
			var oSearchField = this.byId("SearchField");
			oSearchField.getFieldPath = _getSearchFieldPath.bind(this);

			this._oAdvButton = this.byId("AdvancedFilter");

			this._oFilterVBox = this.byId("filterbarVBox");
			this._oFilterVBox._oValueHelpPanel = this;
			this._oFilterVBox.getItemsOriginal = this._oFilterVBox.getItems;
			this._oFilterVBox.getItems = function() {
				var aItems = this.getItemsOriginal();
				if (this._oValueHelpPanel._oFilterbar && this._oValueHelpPanel.getProperty("_filterBarVisible")) {
					aItems.push(this._oValueHelpPanel._oFilterbar);
				}
				return aItems;
			};

			this._oTablePanel = this.byId("tablePanel");
			this._oTablePanel._oValueHelpPanel = this;
			this._oTablePanel.getContentOriginal = this._oTablePanel.getContent;
			this._oTablePanel.getContent = function () {
				var aContent = this.getContentOriginal();
				if (this._oValueHelpPanel._oTable) {
					aContent.push(this._oValueHelpPanel._oTable);
				}
				return aContent;
			};

			this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

			this._oObserver.observe(this, {
				properties: ["formatOptions", "showFilterbar", "showTokenizer", "_filterBarVisible"]
			});

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		},

		exit: function() {
			// if tokenizer is not part of the VHP content
			if (!this.getShowTokenizer()) {
				this._oTokenizerPanel.destroy();
			}

			if (this._oDefineConditionPanel && !this._oDefineConditionPanel.getParent()) {
				//DefineConditionPanel never displayed -> destroy it now
				this._oDefineConditionPanel.destroy();
			}

			this._oObserver.disconnect();
			this._oObserver = undefined;

			this._oTablePanel = null;
			this._oFilterVBox = null;
			this._oAdvButton = null;
			this._oResourceBundle = null;
		},

		onBeforeRendering: function() {

			if (!this.getModel("$i18n")) {
				// if ResourceModel not provided from outside create own one
				this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
			}

		},

		/**
		 * Adds a <code>FilterBar</code> control to the <code>ValueHelpPanel</code> control.
		 *
		 * The <code>showFilterbar</code> property must be set to show the <code>FilterBar</code> control.
		 *
		 * @param {sap.ui.mdc.FilterBar} oFilterbar <code>FilterBar</code> control
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		setFilterbar: function(oFilterbar) {

			var bShowFilterBar = this.getShowFilterbar();

			if (this._oFilterbar) {
				this._oFilterbar.removeStyleClass("sapMdcValueHelpPanelFilterbar");
				if (this._bFilterbarParentSet) {
					this._oFilterbar.setParent();
					delete this._bFilterbarParentSet;
				}
			}
			this._oFilterbar = oFilterbar;

			if (oFilterbar) {
				oFilterbar.addStyleClass("sapMdcValueHelpPanelFilterbar");

				if (!oFilterbar.getParent()) {
					// if not in control tree set as child
					oFilterbar.setParent(this);
					this._bFilterbarParentSet = true;
				}

				// TODO: hack for FlexBoxStylingHelper.writeStyle in IE11
				oFilterbar.getParent().getDirection = this._oFilterVBox.getDirection.bind(this._oFilterVBox);

				if (oFilterbar.getLiveMode && !oFilterbar.getLiveMode()) {
					oFilterbar.setShowGoButton(false);
				}

			}


			//update the IconTabbar header visibility
			var oITBar = this.byId("iconTabBar");
			oITBar.getItems()[0].setVisible(oITBar.getItems()[0].getContent().length > 0);
			oITBar.setSelectedKey("selectFromList");
			this._updateITBHeaderVisiblity();

			this.setProperty("_filterBarVisible", bShowFilterBar && !!this._oFilterbar, true);

		},

		/**
		 * Adds a content control (for example, <code>sap.m.Table</code>) to the <code>ValueHelpPanel</code> control.
		 *
		 * @param {sap.ui.core.Control} oTable Content control
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		setTable: function(oTable) {
			if (this._oTable) {
				if (this._bTableParentSet && this._oTable.getParent()) {
					this._oTable.setParent();
				}
				delete this._bTableParentSet;
			}
			this._oTable = oTable;

			if (oTable) { //If a new table exist, set the parent to this

				if (!oTable.getParent()) {
					// if not in control tree set as child
					oTable.setParent(this);
					this._bTableParentSet = true;
				}
			}
			this._oTablePanel.invalidate();

			//update the IconTabbar header visibility
			var oITBar = this.byId("iconTabBar");
			oITBar.getItems()[0].setVisible(oITBar.getItems()[0].getContent().length > 0);
			oITBar.setSelectedKey("selectFromList");
			this._updateITBHeaderVisiblity();
		},

		/**
		 * Returns the content control (for example, <code>sap.m.Table</code>) of the <code>ValueHelpPanel</code> control.
		 *
		 * @returns {sap.ui.core.Control} Content control
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		getTable: function() {
			if (this._oTable) {
				return this._oTable;
			} else {
				return undefined;
			}
		},

		/**
		 * Adds a <code>DefineConditionPanel</code> control to the <code>ValueHelpPanel</code> control.
		 *
		 * @param {sap.ui.mdc.field.DefineConditionPanel} oDefineConditionPanel <code>DefineConditionPanel</code> control
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		setDefineConditions: function(oDefineConditionPanel) {
			var oITBar = this.byId("iconTabBar");
			var oPanel = this.byId("defineConditionPanel");

			if (this._oDefineConditionPanel) {
				oPanel.removeContent(this._oDefineConditionPanel);
				this._oDefineConditionPanel.destroy();
			}
			this._oDefineConditionPanel = oDefineConditionPanel;

			//update the IconTabbar header visibility
			oITBar.getItems()[1].setVisible(!!this._oDefineConditionPanel);
			this._updateITBHeaderVisiblity();
		},

		_updateITBHeaderVisiblity: function() {
			var oITBar = this.byId("iconTabBar");
			if (oITBar.getItems()[0].getVisible() && oITBar.getItems()[1].getVisible()) {
				oITBar.removeStyleClass("sapMdcNoHeader");
			} else {
				oITBar.addStyleClass("sapMdcNoHeader");
			}

			if (oITBar.getItems()[1].getVisible() && oITBar.getSelectedKey() !== "selectFromList") {
				_bindDefineConditionPanel.call(this);
			}

		},

		_handleTokenUpdate: function(oEvent) {

			if (oEvent.getParameter("type") === "removed") {
				var aRemovedTokens = oEvent.getParameter("removedTokens");
				var aConditions = this.getConditions();
				var i;

				for (i = 0; i < aRemovedTokens.length; i++) {
					var oRemovedToken = aRemovedTokens[i];
					var sPath = oRemovedToken.getBindingContext("$this").sPath;
					var iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
					aConditions[iIndex].delete = true;
				}

				for (i = aConditions.length - 1; i >= 0; i--) {
					if (aConditions[i].delete) {
						aConditions.splice(i, 1);
					}
				}

				this.setProperty("conditions", aConditions, true); // do not invalidate whole panel
			}

		},

		_onToggleAdvancedFilter: function(oEvent) {
			this.setProperty("_filterBarVisible", !this.getProperty("_filterBarVisible"), true);
		},

		_onGo: function(oEvent) {
			// this._oFilterbar.fireSearch();
			this._oFilterbar.triggerSearch();
		},

		_onRemoveAllConditions: function(oEvent) {
			this.setProperty("conditions", [], true);
		},

		iconTabSelect: function(oEvent) {

			var sKey = oEvent.getParameter("key");
			if (sKey === "defineCondition") {
				_bindDefineConditionPanel.call(this);
			}

		},

		_formatListTabTitle: function(sText, aConditions) {

			var iCount = 0;

			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.Validated) {
					iCount++;
				}
			}

			if (iCount === 0) {
				// in case of no items do not show a number
				sText = this._oResourceBundle.getText("valuehelp.SELECTFROMLISTNONUMBER");
			}

			return formatMessage(sText, iCount);

		},

		_formatDefineTabTitle: function(sText, aConditions) {

			var iCount = 0;

			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.isEmpty !== true && oCondition.validated !== ConditionValidated.Validated) {
					iCount++;
				}
			}

			if (iCount === 0) {
				// in case of no items do not show a number
				sText = this._oResourceBundle.getText("valuehelp.DEFINECONDITIONSNONUMBER");
			}

			return formatMessage(sText, iCount);

		},

		_formatDefineConditionTitle: function() {

			//TODO Workaround to get the dialog Title as header for the defineConditionPanel
			var sText = this.getParent().getTitle && this.getParent().getTitle();
			return sText;

		},

		_formatTableTitle: function(sText) {

			var iItems = 0;
			//TODO fetch the count of the table binding
			// if (this._oTable) {
			// 	var oTable = this._oTable.getContent()[0];
			// 	if (oTable && oTable.getBinding("items") && oTable.getBinding("items").bLengthFinal) {
			// 		iItems = 123;
			// 	}

			// 	if (iItems === 0) {
			// 		// in case of no items do not show a number
			// 		sText = this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER");
			// 	}
			// }

			sText = this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER");
			return formatMessage(sText, iItems);

		},

		_formatTokenizerTitle: function(sText, aConditions) {

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

		},

		_handleSearch: function(oEvent) {

			this.fireSearch();

		}

	});

	function _observeChanges(oChanges) {

		if (oChanges.name === "formatOptions") {
			var oBindingInfo = this._oTokenizer.getBindingInfo("tokens");
			if (oBindingInfo && oBindingInfo.template) {
				oBindingInfo = oBindingInfo.template.getBindingInfo("text");
				if (oBindingInfo && oBindingInfo.type) {
					oBindingInfo.type.setFormatOptions(oChanges.current);
				}
			}
		}

		if (oChanges.name === "showTokenizer") {
			var oVBox = this.byId("rootVBox");
			var oListBinding = this._oTokenizer.getBinding("tokens");
			if (oChanges.current) {
				oListBinding.resume();
				oVBox.insertItem(this._oTokenizerPanel, 1);
			} else {
				oListBinding.suspend(); // don't create Tokens
				oVBox.removeItem(this._oTokenizerPanel);
			}
		}

		if (oChanges.name === "showFilterbar") {
			this.setProperty("_filterBarVisible", oChanges.current && !!this._oFilterbar, true);
		}

		if (oChanges.name === "_filterBarVisible") {
			this._oTablePanel.invalidate();
			this._oAdvButton.setText(this._oResourceBundle.getText("valuehelp." + (this.getProperty("_filterBarVisible") ? "HIDE" : "SHOW") + "ADVSEARCH"));
		}

	}

	function _getSearchFieldPath() {

		var sBindingPath = this.getBindingPath("filterConditions");
		if (sBindingPath && sBindingPath.startsWith("/conditions/")) {
			return sBindingPath.slice(12);
		} else {
			return "";
		}

	}

	function _bindDefineConditionPanel() {

		if (this._oDefineConditionPanel) {
			if (!this._oDefineConditionPanel.getModel("$VHP")) {
				var oManagedObjectModel = this._getManagedObjectModel();
				this._oDefineConditionPanel.setModel(oManagedObjectModel, "$VHP");
				var oMetadata = this._oDefineConditionPanel.getMetadata();
				if (oMetadata.hasProperty("formatOptions") && !this._oDefineConditionPanel.getBindingPath("formatOptions") && this._oDefineConditionPanel.isPropertyInitial("formatOptions")) {
					this._oDefineConditionPanel.bindProperty("formatOptions", {path: "$VHP>/formatOptions"});
				}
				if (oMetadata.hasProperty("conditions") && !this._oDefineConditionPanel.getBindingPath("conditions") && this._oDefineConditionPanel.isPropertyInitial("conditions")) {
					this._oDefineConditionPanel.bindProperty("conditions", {path: "$VHP>/conditions"});
				}
			}
			// add content only after binding, otherwise onBeforeRendering type is missing
			var oPanel = this.byId("defineConditionPanel");
			oPanel.addContent(this._oDefineConditionPanel);
		}

	}

	return ValueHelpPanel;

});
