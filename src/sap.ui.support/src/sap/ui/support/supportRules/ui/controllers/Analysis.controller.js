/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/ui/controllers/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/m/List",
	"sap/m/ListItemBase",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SelectionUtils",
	"sap/ui/support/supportRules/ui/controllers/PresetsController",
	"sap/ui/support/supportRules/ui/models/PresetsUtils",
	"sap/ui/support/supportRules/ui/models/CustomJSONListSelection"
], function (jQuery, BaseController, JSONModel, Panel, List, ListItemBase, StandardListItem, InputListItem, Button, Toolbar, ToolbarSpacer,
			 Label, MessageToast, CommunicationBus, channelNames, SharedModel, RuleSerializer, Constants, Storage,
			 SelectionUtils, PresetsController, PresetsUtils, CustomJSONListSelection) {
	"use strict";

	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Analysis", {

		onInit: function () {
			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			this.tempRulesLoaded = false;
			this.getView().setModel(this.model);
			this.treeTable = SelectionUtils.treeTable = this.byId("ruleList");
			this.ruleSetView = this.byId("ruleSetsView");
			this.rulesViewContainer = this.byId("rulesNavContainer");
			this.bAdditionalViewLoaded = false;
			this.bAdditionalRulesetsLoaded = false;
			this.oApplicationinfo = {};

			/* eslint-disable no-new */
			//attach adapter for custom selection
			new CustomJSONListSelection(this.treeTable, true, "id");
			/* eslint-enable no-new */

			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, function () {
				if (!this.bAdditionalViewLoaded) {
					CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: true });

					this.bAdditionalViewLoaded = true;
					this.loadAdditionalUI();
				}
			}, this);

			if (this.model.getProperty("/persistingSettings")) {
				var aColumnsIds = Storage.getVisibleColumns() || [];
				if (aColumnsIds.length) {
					this.setColumnVisibility(aColumnsIds, true);
				}
			}

			this.byId("presetVariant").addEventDelegate({
				onclick: this.onPresetVariantClick.bind(this)
			});

			this.treeTable.attachEvent("rowSelectionChange", function (oEvent) {
				if (oEvent.getParameter("userInteraction")) {
					PresetsUtils.syncCurrentSelectionPreset(SelectionUtils.getSelectedRules());
				}
			});
		},

		loadAdditionalUI: function () {
			this._ruleDetails = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.RuleDetails", this);
			this.byId("rulesDisplayPage").addContentArea(this._ruleDetails);

			this._ruleCreateUpdatePages = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.RuleUpdate", this);
			this._ruleCreateUpdatePages.forEach(function (rcuPage) {
				this.byId("rulesNavContainer").insertPage(rcuPage);
			}, this);
			this._updateRuleList();
		},

		onAfterRendering: function () {
			var fnThemeChangeHandler = function () {
				CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
				sap.ui.getCore().detachThemeChanged(fnThemeChangeHandler);
			};

			// If the theme is already applied themeChanged event won't be fired.
			// In IE11 the theme is already applied.
			if (sap.ui.getCore().isThemeApplied()) {
				CommunicationBus.publish(channelNames.ON_INIT_ANALYSIS_CTRL);
			} else {
				sap.ui.getCore().attachThemeChanged(fnThemeChangeHandler);
			}
		},

		onAsyncSwitch: function (oEvent) {
			var oSource = oEvent.getSource();

			if (oEvent.getParameter("selected")) {
				var bAsync = oSource.getCustomData()[0].getValue() === "true";
				var sRule = oSource.getProperty("groupName") === "asyncContext" ? "/newRule" : "/editRule";
				this.model.setProperty(sRule + "/async", bAsync);
				this._updateCheckFunction(sRule, bAsync);
			}
		},

		/**
		 * Add fnResolve to the check function when async is set to true otherwise removes it.
		 * @private
		 * @param {string} sRule the model path to edit or new rule
		 * @param {bAsync} bAsync the async property of the rule
		 */
		_updateCheckFunction: function (sRule, bAsync) {
			var sCheckFunction = this.model.getProperty(sRule + "/check");

			if (!sCheckFunction) {
				return;
			}

			// Check if a function is found
			var oMatch = sCheckFunction.match(/function[^(]*\(([^)]*)\)/);

			if (!oMatch) {
				return;
			}

			// Get the parameters of the function found and trim, then split by word.
			var aParams = oMatch[1].trim().split(/\W+/);
			// Add missing parameters to ensure the resolve function is passed on the correct position.
			aParams[0] = aParams[0] || "oIssueManager";
			aParams[1] = aParams[1] || "oCoreFacade";
			aParams[2] = aParams[2] || "oScope";

			// If async add a fnResolve to the template else remove it.
			if (bAsync) {
				aParams[3] = aParams[3] || "fnResolve";
			} else {
				aParams = aParams.slice(0, 3);
			}

			// Replace the current parameters with the new ones.
			var sNewCheckFunction = sCheckFunction.replace(/function[^(]*\(([^)]*)\)/, "function (" + aParams.join(", ") + ")");

			this.model.setProperty(sRule + "/check", sNewCheckFunction);
		},

		getTemporaryLib: function () {
			var libs = this.model.getProperty("/libraries");

			for (var i = 0; i < libs.length; i++) {
				if (libs[i].title == Constants.TEMP_RULESETS_NAME) {
					return libs[i];
				}
			}
		},

		setCommunicationSubscriptions: function () {
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, this.updatesupportRules, this);

			// Temporary rules are validated and ready to be loaded in view
			CommunicationBus.subscribe(channelNames.VERIFY_RULE_CREATE_RESULT, function (data) {
				var result = data.result,
					newRule = RuleSerializer.deserialize(data.newRule, true),
					tempLib = this.getTemporaryLib();

				if (result == "success") {
					tempLib.rules.push(newRule);

					if (!this.oJsonModel) {
						this.oJsonModel = new JSONModel();
						this.treeTable.setModel(this.oJsonModel, "treeModel");
					}

					//Sync Selection of temporary rules
					this._syncTreeTableVieModelTempRulesLib(tempLib, this.model.getProperty("/treeModel"));

					//Set selected rules count to UI and update preset selections
					PresetsUtils.syncCurrentSelectionPreset(SelectionUtils.getSelectedRules());

					if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
						SelectionUtils.persistSelection();
						Storage.setRules(tempLib.rules);

						if (this.showRuleCreatedToast) {
							MessageToast.show('Your temporary rule "' + newRule.id + '" was persisted in the local storage');
							this.showRuleCreatedToast = false;
						}
					}

					// set data to model
					this.oJsonModel.setData(this.model.getProperty("/treeModel"));

					//Clean the new rule object
					var emptyRule = this.model.getProperty("/newEmptyRule");
					this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
					this.goToRuleProperties();
					this.model.setProperty("/selectedRule", newRule);
					this._updateRuleList();
					tempLib = [];

					this.treeTable.updateSelectionFromModel();
				} else {
					MessageToast.show("Add rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.VERIFY_RULE_UPDATE_RESULT, function (data) {
				var result = data.result,
					updateRule = RuleSerializer.deserialize(data.updateRule, true),
					that = this;

				if (result === "success") {
					var ruleSource = this.model.getProperty("/editRuleSource"),
						treeTable = this.model.getProperty('/treeModel'),
						libraries = this.model.getProperty('/libraries');

					libraries.forEach(function (lib, libIndex) {
						if (lib.title === Constants.TEMP_RULESETS_NAME) {
							lib.rules.forEach(function (rule, ruleIndex) {
								if (rule.id === ruleSource.id) {
									lib.rules[ruleIndex] = updateRule;

									if (that.model.getProperty("/persistingSettings")) {
										Storage.setRules(lib.rules);
									}
								}
							});
							that._syncTreeTableVieModelTempRule(updateRule, treeTable);
						}
					});

					this.oJsonModel.setData(treeTable);
					this.model.checkUpdate(true);
					this.model.setProperty('/selectedRule', updateRule);

					//Set selected rules count to UI
					SelectionUtils.getSelectedRules();

					this.treeTable.updateSelectionFromModel();

					this.goToRuleProperties();
				} else {
					MessageToast.show("Update rule failed because: " + result);
				}
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_LIBRARIES, function (data) {
				this.bAdditionalRulesetsLoaded = true;
				this.model.setProperty("/availableLibrariesSet", data.libNames);
				this.rulesViewContainer.setBusy(false);
			}, this);

			CommunicationBus.subscribe(channelNames.POST_APPLICATION_INFORMATION, function (data) {
				this.oApplicationinfo = data;
			}, this);

			CommunicationBus.subscribe(channelNames.POST_AVAILABLE_COMPONENTS, function (data) {
				var executionScopeComponents = [],
					modelScopeComponents = this.model.getProperty("/executionScopeComponents"),
					savedComponents = Storage.getSelectedScopeComponents(),
					index;

				for (var componentIndex = 0; componentIndex < data.length; componentIndex += 1) {
					executionScopeComponents.push({ text: data[componentIndex] });
				}
				if (modelScopeComponents && modelScopeComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], modelScopeComponents);
					}
				} else if (savedComponents && savedComponents.length > 0) {
					for (index = 0; index < executionScopeComponents.length; index++) {
						executionScopeComponents[index].selected = this.checkIfComponentIsSelected(executionScopeComponents[index], savedComponents);
					}
				}

				this.model.setProperty("/executionScopeComponents", executionScopeComponents);
			}, this);

			CommunicationBus.subscribe(channelNames.GET_RULES_MODEL, function (oTreeViewModelRules) {
				this.oJsonModel = new JSONModel();
				this.treeTable.setModel(this.oJsonModel, "treeModel");
				this.oJsonModel.setData(oTreeViewModelRules);

				var bPersistSettings = Storage.readPersistenceCookie(Constants.COOKIE_NAME),
					bLoadingAdditionalRuleSets =  this.model.getProperty("/loadingAdditionalRuleSets");


				if (bLoadingAdditionalRuleSets) {
					//Keep selection when additional rulesets are loaded
					oTreeViewModelRules = SelectionUtils._syncSelectionAdditionalRuleSetsMainModel(oTreeViewModelRules, this.model.getProperty("/treeModel"));
					oTreeViewModelRules = SelectionUtils._deselectAdditionalRuleSets(oTreeViewModelRules, this.model.getProperty("/namesOfLoadedAdditionalRuleSets"));
				}
				//Keep selection when additional  ruleset are loaded
				if (bPersistSettings) {
					// Needed for temp rules init
					this.model.setProperty('/treeModel', oTreeViewModelRules);
					this.initializeTempRules();
					//Selection should be applied from local storage
					// Syncs selection for all libs except for temporary
					var oUpdatedRules = SelectionUtils.updateSelectedRulesFromLocalStorage(oTreeViewModelRules);
					// In case of deleted local storage item
					if (oUpdatedRules) {
						oTreeViewModelRules = oUpdatedRules;
					}

					PresetsUtils.loadCustomPresets();
				}

				if (bPersistSettings || bLoadingAdditionalRuleSets) {
					this.oJsonModel.setData(oTreeViewModelRules);
					this.treeTable.updateSelectionFromModel();
				} else {
					this.treeTable.selectAll();
				}
				this.model.setProperty('/treeModel', oTreeViewModelRules);
				this.model.setProperty("/selectedRulesCount", SelectionUtils.getSelectedRules().length);

				PresetsUtils.initializeSelectionPresets(SelectionUtils.getSelectedRules());


			}, this);

			CommunicationBus.subscribe(channelNames.POST_MESSAGE, function (data) {
				MessageToast.show(data.message);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_STARTED, function (data) {
				this.model.setProperty("/showProgressIndicator", true);
			}, this);
		},

		/**
		 * Checks if given execution scope component is selected comparing against an array of settings
		 * @param {Object} component The current component object to be checked
		 * @param {Array} savedComponents The local storage settings for the checked execution scope components
		 * @returns {boolean} If the component is checked or not
		 */
		checkIfComponentIsSelected: function (component, savedComponents) {
			for (var index = 0; index < savedComponents.length; index += 1) {
				if (savedComponents[index].text == component.text && savedComponents[index].selected) {
					return true;
				}
			}
			return false;
		},

		onAnalyze: function () {
			var currentPreset = this.model.getProperty("/selectionPresetsCurrent"),
				oExecutionContext = this._getExecutionContext();

			if (!currentPreset.selections.length > 0) {
				MessageToast.show("Select some rules to be analyzed.");
				return;
			}
			if (oExecutionContext.type === "components" && oExecutionContext.components.length === 0) {
				MessageToast.show("Please select some components to be analyzed.");
				return;
			}

			CommunicationBus.publish(channelNames.ON_ANALYZE_REQUEST, {
				rulePreset: currentPreset,
				executionContext: oExecutionContext
			});
		},

		_getExecutionContext: function () {
			var ctx = {
				type: this.model.getProperty("/analyzeContext/key")
			};

			// TODO: these "if"s can be consistently turned into switch with constants
			if (ctx.type === "subtree") {
				ctx.parentId = this.model.getProperty("/subtreeExecutionContextId");
			}

			if (ctx.type === "components") {
				var selectionContainer = sap.ui.getCore().byId("componentsSelectionContainer"),
					cbs = selectionContainer.getContent();

				ctx.components = [];
				cbs.forEach(function (checkBox) {
					if (checkBox.getSelected()) {
						ctx.components.push(checkBox.getText());
					}
				});
			}

			return ctx;
		},

		/**
		 * On selecting "Additional RuleSet" tab, start loading Additional RuleSets by brute search.
		 * @param {Event} oEvent TreeTable event
		 */
		onSelectedRuleSets: function (oEvent) {
			var bShowRuleProperties = true,
				oSelectedRule = this.model.getProperty("/selectedRule"),
				bAdditionalRulesetsTab = oEvent.getParameter("selectedKey") === "additionalRulesets";

			if (bAdditionalRulesetsTab || !oSelectedRule) {
				bShowRuleProperties = false;
			}

			// Ensure we don't make unnecessary requests. The requests will be made only
			// the first time the user clicks AdditionalRulesets tab.
			if (!this.bAdditionalRulesetsLoaded && bAdditionalRulesetsTab) {
				this.rulesViewContainer.setBusyIndicatorDelay(0);
				this.rulesViewContainer.setBusy(true);
				CommunicationBus.publish(channelNames.GET_NON_LOADED_RULE_SETS, {
					loadedRulesets: this._getLoadedRulesets()
				});
			}

			this.getView().getModel().setProperty("/showRuleProperties", bShowRuleProperties);
		},

		/**
		 * @private
		 * @returns {Array} All currently loaded rulesets.
		 */
		_getLoadedRulesets: function () {
			var oRulesets = this.treeTable.getModel("treeModel").getData(),
				aLoadedLibraries = [];

			Object.keys(oRulesets).forEach(function (sKey) {
				var sLibraryName = oRulesets[sKey].name;
				if (sLibraryName && sLibraryName !== "temporary") {
					aLoadedLibraries.push(sLibraryName);
				}
			});

			return aLoadedLibraries;
		},

		/**
		 * Keeps in sync the TreeViewModel for temporary library that we use for visualisation of sap.m.TreeTable and the model that we use in the Suppport Assistant
		 * @param {Object} tempLib  temporary library model from Support Assistant
		 * @param {Object} treeTable Model for sap.m.TreeTable visualization
		 * @returns {Object} The temp library
		 */
		_syncTreeTableVieModelTempRulesLib: function (tempLib, treeTable) {
			var library,
				rule,
				oTempLibCopy,
				bSelected,
				aRules,
				iIndex,
				fnFilter = function (oRule) {
					return oRule.id === rule.id;
				};

			for (var i in treeTable) {

				library = treeTable[i];
				oTempLibCopy =  treeTable[i].nodes;

				if (library.name !== Constants.TEMP_RULESETS_NAME) {
					continue;
				}
				//reset the model to add the temp rules
				treeTable[i].nodes = [];
				for (var ruleIndex in tempLib.rules) {

					rule = tempLib.rules[ruleIndex];
					bSelected = oTempLibCopy[ruleIndex] !== undefined ?  oTempLibCopy[ruleIndex].selected : true;

					// syncs selection of temporary rules from local storage
					if (this.tempRulesFromStorage) {
						aRules = this.tempRulesFromStorage.filter(fnFilter);

						if (aRules.length > 0) {
							bSelected = aRules[0].selected;
							iIndex = this.tempRulesFromStorage.indexOf(aRules[0]);
							this.tempRulesFromStorage.splice(iIndex, 1);

							if (bSelected === false) {
								library.selected = false;
							}
						}

						if (this.tempRulesFromStorage.length === 0) {
							this.tempRulesFromStorage.length = null;
						}
					}

					library.nodes.push({
						name: rule.title,
						description: rule.description,
						id: rule.id,
						audiences: rule.audiences.toString(),
						categories: rule.categories.toString(),
						minversion: rule.minversion,
						resolution: rule.resolution,
						title: rule.title,
						selected: bSelected,
						libName: library.name,
						check: rule.check
					});
				}

				this.model.setProperty("/treeModel", treeTable);
				return library;
			}
		},

		/**
		 * Keeps in sync the TreeViewModel for temporary rules that we use for visualisation of sap.m.TreeTable and the model that we use in the SuppportAssistant
		 * @param {Object} tempRule Temporary rule
		 * @param {Object} treeTable Model for sap.m.TreeTable visualization
		 */
		_syncTreeTableVieModelTempRule: function (tempRule, treeTable) {
			var ruleSource = this.model.getProperty("/editRuleSource");
			for (var i in treeTable) {
				if (treeTable[i].name === Constants.TEMP_RULESETS_NAME) {
					for (var innerIndex in treeTable[i].nodes) {
						if (treeTable[i].nodes[innerIndex].id === ruleSource.id) {
							treeTable[i].nodes[innerIndex] = {
								name: tempRule.title,
								description: tempRule.description,
								id: tempRule.id,
								audiences: tempRule.audiences,
								categories: tempRule.categories,
								minversion: tempRule.minversion,
								resolution: tempRule.resolution,
								selected: treeTable[i].nodes[innerIndex].selected,
								title: tempRule.title,
								libName: treeTable[i].name,
								check: tempRule.check
							};
						}
					}
				}
			}
		},

		_hasSelectedComponent: function () {
			var aAllComponentElements = sap.ui.getCore().byId("componentsSelectionContainer").getContent();
			function isSelected(oComponent) {
				return oComponent.getSelected();
			}

			return aAllComponentElements.some(isSelected);
		},

		onAnalyzeSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);

			if (!this._settingsPopover) {
				this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.AnalyzeSettings", this);
				this.getView().addDependent(this._settingsPopover);
			}

			this._settingsPopover.openBy(oEvent.getSource());
		},

		onContextSelect: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var source = oEvent.getSource(),
					radioKey = source.getCustomData()[0].getValue(),
					execScope = this.model.getProperty("/executionScopes")[radioKey];
				if (radioKey === "components" && !this._hasSelectedComponent()) {
					var aComponents = sap.ui.getCore().byId("componentsSelectionContainer").getContent();
					if (aComponents.length > 0) {
						aComponents[0].setSelected(true);
						this.onScopeComponentSelect(null);
					}
				}
				this.model.setProperty("/analyzeContext", execScope);
			}

			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onExecutionContextChange: function (event) {
			var value = event.getSource().getValue();

			if (value) {
				this.model.setProperty("/subtreeExecutionContextId", value);
			}

			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				this.persistExecutionScope();
			}
		},

		onScopeComponentSelect: function (event) {
			var scopeComponents = this.model.getProperty("/executionScopeComponents");
			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				Storage.setSelectedScopeComponents(scopeComponents);
			}
		},

		onBeforePopoverOpen: function () {
			if (this.model.getProperty("/executionScopeComponents").length === 0) {
				CommunicationBus.publish(channelNames.GET_AVAILABLE_COMPONENTS);
			}
		},

		createNewRulePress: function (oEvent) {
			var emptyRule = this.model.getProperty("/newEmptyRule");
			this.model.setProperty("/selectedSetPreviewKey", "availableRules");
			this.model.setProperty("/newRule", jQuery.extend(true, {}, emptyRule));
			this.model.setProperty("/tempLink", { href: "", text: "" });
			this.goToCreateRule();
		},

		goToRuleProperties: function () {
			var navCont = this.byId("rulesNavContainer");
			navCont.to(this.byId("rulesDisplayPage"), "show");
		},

		createRuleString: function (rule) {
			// FIXME
			// Need to return empty string when rule is undefined
			// it happens when tool is injected from outside
			if (!rule) {
				return '';
			}

			var str = "{\n",
				count = 0,
				keysLength = Object.keys(rule).length;

			for (var key in rule) {
				var value = rule[key];
				count++;
				str += "\t";
				str += key + ": ";
				if (key === "check") {
					str += value.split("\n").join("\n\t");
				} else {
					str += JSON.stringify(value);
				}

				//Don't add comma after last value
				if (count < keysLength) {
					str += ",";
				}

				str += "\n";
			}
			str += "}";
			return str;
		},

		updateRule: function () {
			var oldId = this.model.getProperty("/editRuleSource/id"),
				updateObj = this.model.getProperty("/editRule");

			if (this.checkFunctionString(updateObj.check)) {
				CommunicationBus.publish(channelNames.VERIFY_UPDATE_RULE, {
					oldId: oldId,
					updateObj: RuleSerializer.serialize(updateObj)
				});
			}
		},


		updatesupportRules: function (data) {
			data = RuleSerializer.deserialize(data.sRuleSet);

			CommunicationBus.publish(channelNames.REQUEST_RULES_MODEL, data);

			var libraries = [],
				that = this;

			for (var i in data) {
				var rules = [],
					ruleSets = data[i].ruleset._mRules;

				for (var j in ruleSets) {
					var rule = ruleSets[j];
					rule.libName = i;
					rule.selected = true;
					rules.push(rule);

				}

				libraries.push({
					title: i,
					type: "library",
					rules: rules,
					selected: true
				});

			}

			// Set first rule from first library if there is no temporary rules
			var firstSelectedRule;
			if (libraries[0].rules[0]) {
				firstSelectedRule = libraries[0].rules[0];
			} else {
				firstSelectedRule = libraries[1].rules[0];
			}

			that.placeTemporaryRulesetAtStart(libraries);
			that.model.setProperty("/selectedRuleStringify", "");
			that.model.setProperty("/selectedRule", firstSelectedRule);
			that.model.setProperty("/selectedRuleStringify", that.createRuleString(firstSelectedRule));
			that.model.setProperty("/libraries", libraries);

			var loadingFromAdditionalRuleSets = that.model.getProperty("/loadingAdditionalRuleSets");

			if (loadingFromAdditionalRuleSets) {
				MessageToast.show("Additional rule set(s) loaded!");
				this.ruleSetView.setSelectedKey("availableRules");
			}
		},

		/**
		 * Loads temporary rules from the local storage
		 */
		initializeTempRules: function () {
			var tempRules = Storage.getRules(),
				loadingFromAdditionalRuleSets = this.model.getProperty("/loadingAdditionalRuleSets");

			if (tempRules && !loadingFromAdditionalRuleSets && !this.tempRulesLoaded) {
				this.tempRulesFromStorage = tempRules;
				this.tempRulesLoaded = true;

				tempRules.forEach(function (tempRule) {
					CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(tempRule));
				});

				this.persistedTempRulesCount = tempRules.length;
			}
		},

		placeTemporaryRulesetAtStart: function (libraries) {
			for (var i = 0; i < libraries.length; i++) {
				var ruleSet = libraries[i];

				if (ruleSet.title === Constants.TEMP_RULESETS_NAME) {
					var temp = ruleSet;
					libraries.splice(i, 1);
					libraries.unshift(temp);
					return;
				}
			}
		},

		addLinkToRule: function (event) {
			var tempLink = this.model.getProperty("/tempLink"),
				copy = jQuery.extend(true, {}, tempLink),
				action = event.getSource().getProperty("text"),
				rule = action === 'Add' ? "/newRule" : "/editRule",
				urlProperty = this.model.getProperty(rule + "/resolutionurls");

			if (urlProperty) {
				urlProperty.push(copy);
			} else {
				this.model.setProperty(rule + "/resolutionurls", "");
				urlProperty.push(copy);
			}

			this.model.setProperty("/tempLink", { href: "", text: "" });

			this.model.checkUpdate(true, true);
		},

		goToCreateRule: function () {
			var navCont = this.byId("rulesNavContainer");
			navCont.to(sap.ui.getCore().byId("rulesCreatePage"), "show");
		},

		checkFunctionString: function (functionString) {
			try {
				/* eslint-disable no-eval */
				eval("var testAsignedVar = " + functionString);
				/* eslint-enable no-eval */
			} catch (err) {
				MessageToast.show("Your check function contains errors, and can't be evaluated:" + err);
				return false;
			}
			return true;
		},

		addNewRule: function () {
			var newRule = this.model.getProperty("/newRule");
			if (this.checkFunctionString(newRule.check)) {
				this.showRuleCreatedToast = true;

				CommunicationBus.publish(channelNames.VERIFY_CREATE_RULE, RuleSerializer.serialize(newRule));
			}
		},

		rulesToolbarITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/newRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/newRuleStringified", stringifiedJson);
			}
		},

		rulesToolbarEditITHSelect: function (oEvent) {
			if (oEvent.getParameter("key") === "jsonOutput") {
				var newRule = this.model.getProperty("/editRule"),
					stringifiedJson = this.createRuleString(newRule);
				this.model.setProperty("/updateRuleStringified", stringifiedJson);
			}
		},

		loadMarkedSupportLibraries: function () {
			var list = this.byId("availableLibrariesSet"),
				aLibNames = [],
				aAvailableRulesets = this.model.getProperty("/availableLibrariesSet");

			aLibNames = list.getSelectedItems().map(function (item) {
				return item.getTitle();
			});

			list.getItems().forEach(function (item) {
				item.setSelected(false);

			});

			if (aLibNames.length > 0) {
				aAvailableRulesets = aAvailableRulesets.filter(function (sLibName) {
					return aLibNames.indexOf(sLibName) < 0;
				});
				this.model.setProperty("/availableLibrariesSet", aAvailableRulesets);

				this.model.setProperty("/namesOfLoadedAdditionalRuleSets", aLibNames);
				CommunicationBus.publish(channelNames.LOAD_RULESETS, {
					aLibNames: { publicRules: aLibNames, internalRules: aLibNames }
				});
				this.model.setProperty("/loadingAdditionalRuleSets", true);
				this.model.setProperty("/showRuleProperties", true);
			} else {
				MessageToast.show("Select additional RuleSet to be loaded.");
			}
		},

		onCellClick: function (oEvent) {
			if (oEvent.getParameter("rowBindingContext")) {
				var oSelection = oEvent.getParameter("rowBindingContext").getObject(),
					oSelectedRule,
					sRule = "",
					bShowRuleProperties = false;

				if (oSelection.id && oSelection.type !== "lib") {
					oSelectedRule = this.getMainModelFromTreeViewModel(oSelection);
					sRule = this.createRuleString(oSelectedRule);
					bShowRuleProperties = true;
				}

				this.model.setProperty("/selectedRuleStringify", sRule);
				this.model.setProperty("/selectedRule", oSelectedRule);
				this.model.setProperty("/showRuleProperties", bShowRuleProperties);
			}
		},
		getMainModelFromTreeViewModel: function (selectedRule) {

			var structeredRulesModel = this.model.getProperty("/libraries"),
				mainModelRule = null;

			structeredRulesModel.forEach(function (lib, index) {
				structeredRulesModel[index].rules.forEach(function (element) {
					if (selectedRule.id === element.id) {
						mainModelRule = element;
					}
				});
			});

			return mainModelRule;
		},
		_generateRuleId: function (sRuleId) {
			var i = 0,
				oTempLib = this.getTemporaryLib(),
				aTempRuleset = oTempLib.rules,
				bExists,
				fnCheckId = function(oRule) {
					return oRule.id === sRuleId + i;
				};

			while (++i) {
				bExists = aTempRuleset.some(fnCheckId);

				if (!bExists) {
					return sRuleId + i;
				}
			}
		},

		duplicateRule: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("treeModel").getPath(),
				oSourceObject = this.treeTable.getBinding().getModel().getProperty(sPath),
				selectedRule = this.getMainModelFromTreeViewModel(oSourceObject),
				selectedRuleCopy = jQuery.extend(true, {}, selectedRule);

			selectedRuleCopy.id = this._generateRuleId(selectedRuleCopy.id);

			this.model.setProperty("/newRule", selectedRuleCopy);
			this.model.checkUpdate(true, false);
			this.goToCreateRule();
		},

		editRule: function (event) {
			var sPath = event.getSource().getBindingContext("treeModel").getPath(),
				oSourceObject = this.treeTable.getBinding().getModel().getProperty(sPath),
				selectedRule = this.getMainModelFromTreeViewModel(oSourceObject);

			this.model.setProperty("/editRuleSource", selectedRule);
			this.model.setProperty("/editRule", jQuery.extend(true, {}, selectedRule));
			this.model.checkUpdate(true, true);
			var navCont = this.byId("rulesNavContainer");
			navCont.to(sap.ui.getCore().byId("ruleUpdatePage"), "show");
		},
		deleteTemporaryRule: function (event) {
			var sourceObject = this.getObjectOnTreeRow(event),
				oTreeModel = this.treeTable.getBinding().getModel().getData(),
				aLibraries = this.model.getProperty("/libraries"),
				aRemainingRules;

			aLibraries.forEach(function (oLibrary) {
				if (oLibrary.title === Constants.TEMP_RULESETS_NAME) {
					aRemainingRules = oLibrary.rules.filter(function (oRule) {
						return oRule.id !== sourceObject.id;
					});
					oLibrary.rules = aRemainingRules;
				}
			});

			for (var oLibrary in oTreeModel) {
				if (oTreeModel[oLibrary].name === Constants.TEMP_RULESETS_NAME) {
					for (var iRuleIndex in oTreeModel[oLibrary].nodes) {
						if (oTreeModel[oLibrary].nodes[iRuleIndex].id === sourceObject.id) {
							oTreeModel[oLibrary].nodes.splice(iRuleIndex, 1);
						}
					}
				}
			}
			this.oJsonModel.setData(oTreeModel);

			CommunicationBus.publish(channelNames.DELETE_RULE, RuleSerializer.serialize(sourceObject));

			this._updateRuleList();

			//Set selected rules count to UI and update preset selections
			PresetsUtils.syncCurrentSelectionPreset(SelectionUtils.getSelectedRules());


			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				Storage.removeSelectedRules(aRemainingRules);
				SelectionUtils.persistSelection();
			}
		},

		/**
		* Gets rule from selected row
		* @param {Object} event Event
		* @returns {Object} ISelected rule from row
		***/
		getObjectOnTreeRow: function (event) {
			var sPath = event.getSource().getBindingContext("treeModel").getPath(),
				sourceObject = this.treeTable.getBinding().getModel().getProperty(sPath),
				libs = this.model.getProperty("/libraries");

			libs.forEach(function (lib, libIndex) {
				lib.rules.forEach(function (rule) {
					if (rule.id === sourceObject.id) {
						sourceObject.check = rule.check;
					}
				});
			});
			return sourceObject;
		},

		_updateRuleList: function() {
			var oRuleList = this.getView().byId("ruleList"),
				aTemplibs = this.getTemporaryLib()["rules"];
			if (!aTemplibs.length) {
				oRuleList.setRowActionCount(1);
			}  else {
				oRuleList.setRowActionCount(2);
			}
		},

		/**
		 * Sets visibility to columns.
		 * @param {Array} aColumnsIds Ids of columns
		 * @param {boolean} bVisibilityValue
		 **/
		setColumnVisibility: function (aColumnsIds, bVisibilityValue) {
			var aColumns = this.treeTable.getColumns();

			aColumns.forEach(function(oColumn) {
				oColumn.setVisible(!bVisibilityValue);
				aColumnsIds.forEach(function(sRuleId) {
					if (oColumn.sId.includes(sRuleId)) {
						oColumn.setVisible(bVisibilityValue);
					}
				});
			});
		},

		/**
		 * On column visibility change persist column visibility selection
		 * @param {object} oEvent event
		 **/
		onColumnVisibilityChange: function (oEvent) {
			var oColumn = oEvent.getParameter("column"),
				bNewVisibilityState = oEvent.getParameter("newVisible");
			if (!this.model.getProperty("/persistingSettings")) {
				return;
			}
			oColumn.setVisible(bNewVisibilityState);
			this.persistVisibleColumns();
		},

		/**
		 * Handles the selection presets variant selector click.
		 * Opens selection presets popover.
		 */
		onPresetVariantClick: function () {
			if (!this._PresetsController) {
				this._PresetsController = new PresetsController(this.model, this.getView());
			}
			this._PresetsController.openPresetVariant();
		}
	});
});