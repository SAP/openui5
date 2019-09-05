/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/ui/controllers/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/ui/external/ElementTree",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/ui/models/formatter",
	"sap/ui/support/supportRules/Constants",
	"sap/m/OverflowToolbarAssociativePopoverControls"
], function ($, BaseController, JSONModel, CommunicationBus, SharedModel, ElementTree, IssueManager, channelNames, formatter, constants, OverflowToolbarAssociativePopoverControls) {
	"use strict";

	var mIssueSettings = {
		severityIcons: {
			High: "sap-icon://message-error",
			Medium: "sap-icon://message-warning",
			Low: "sap-icon://message-information",
			All: "sap-icon://multiselect-all"
		}
	};

	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Issues", {
		ISSUES_LIMIT : 1000,
		formatter: formatter,
		onInit: function () {

			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			this.getView().setModel(this.model);
			this.clearFilters();
			this._initElementTree();
			this.treeTable = this.byId("issuesList");
			this.issueTable = this.byId("issueTable");
			this.toolHeader = this.byId('toolHeader');
			this.toolHeader.removeStyleClass('sapTntToolHeader sapContrast sapContrastPlus');
			this.model.setProperty("/bEnabledFilterButton", false);

			var toolHeaderPopover = this.toolHeader._getPopover();
			toolHeaderPopover.removeStyleClass('sapTntToolHeaderPopover sapContrast sapContrastPlus');

			// add VerticalLayout to the controls, which can overflow
			OverflowToolbarAssociativePopoverControls._mSupportedControls["sap.ui.layout.VerticalLayout"] = {
				canOverflow: true,
				listenForEvents: [],
				noInvalidationProps: []
			};
		},
		setCommunicationSubscriptions: function () {

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_FINISH, function (data) {
				var that = this;

				var problematicControlsIds = {};

				// Contains a list of all issues found during analisys.
				// The list is used later when filters are modified.
				that.data = data;

				data.issues.forEach(function (issue) {
					if (!issue.context || !issue.context.id) {
						return;
					}

					if (!problematicControlsIds[issue.context.id]) {
						problematicControlsIds[issue.context.id] = [issue.name];
					} else {
						problematicControlsIds[issue.context.id].push(issue.name);
					}

				});
				this.model.setSizeLimit(this.ISSUES_LIMIT);
				this.model.setProperty("/issues", data.issues);
				this.model.setProperty('/analyzePressed', true);
				this.model.setProperty("/issuesCount", this.data.issues.length);
				this.model.setProperty("/selectedIssue", null);
				this.elementTree.setData({
					controls: data.elementTree,
					issuesIds: problematicControlsIds
				});

				this.clearFilters();
			}, this);
			CommunicationBus.subscribe(channelNames.GET_ISSUES, function (data) {
				this.structuredIssuesModel = data.groupedIssues;
				this.model.setProperty("/issues", data.issuesModel);
				if (data.issuesModel[0]) {
					this._setSelectedRule(data.issuesModel[0][0]);
					this.treeTable.setSelectedIndex(1);
					this.issueTable.setSelectedIndex(0);
				}
			}, this);
		},
		_initElementTree: function () {
			var that = this;

			this.elementTree = new ElementTree(null, {
				onIssueCountClicked: function (selectedElementId) {
					that.clearFilters();
					that.model.setProperty("/elementFilter", selectedElementId);
					that.updateIssuesVisibility();
				},
				onHoverChanged: function (hoveredElementId) {
					CommunicationBus.publish(channelNames.TREE_ELEMENT_MOUSE_ENTER, hoveredElementId);
				},
				onMouseOut: function () {
					CommunicationBus.publish(channelNames.TREE_ELEMENT_MOUSE_OUT);
				}
			});
		},
		onAfterRendering: function () {
			this.elementTree.setContainerId(this.byId("elementTreeContainer").getId());
		},
		clearFilters: function () {
			this.model.setProperty("/severityFilter", constants.FILTER_VALUE_ALL);
			this.model.setProperty("/categoryFilter", constants.FILTER_VALUE_ALL);
			this.model.setProperty("/elementFilter", constants.FILTER_VALUE_ALL);
			this.model.setProperty("/audienceFilter", constants.FILTER_VALUE_ALL);

			if (this.data) {
				this.model.setProperty("/issues", this.data.issues);
				this.setToolbarHeight();
			}

			this.model.setProperty("/bEnabledFilterButton", false);
			this.updateIssuesVisibility();
		},
		clearFiltersAndElementSelection: function () {
			this.clearFilters();
			this.elementTree.clearSelection();
		},
		onIssuePressed: function (event) {
			var selectedIssue = this.model.getProperty("/selectedIssue");
			this.elementTree.setSelectedElement(selectedIssue.context.id, false);
		},
		onRowSelectionChanged: function (event) {
			if (event.getParameter("rowContext")) {
				var selection = event.getParameter("rowContext").getObject(),
					visibleRowCount = constants.MAX_VISIBLE_ISSUES_FOR_RULE;

				if (selection.type === "rule") {
					this._setSelectedRule(selection);
				} else {
					this.model.setProperty("/selectedIssue", null);
				}

				if (selection.issueCount < visibleRowCount) {
					visibleRowCount = selection.issueCount;
				}

				this.model.setProperty("/visibleRowCount", visibleRowCount);
			}

		},
		openDocumentation: function (oEvent) {
			var link = sap.ui.getCore().byId(oEvent.mParameters.id),
				url = link.getBindingContext().getProperty("href");
			CommunicationBus.publish(channelNames.OPEN_URL, url);
		},
		updateIssuesVisibility: function () {
			if (this.data) {
				var filteredIssues = this.data.issues.filter(this.filterIssueListItems, this);
				CommunicationBus.publish(channelNames.REQUEST_ISSUES, filteredIssues);
				this.model.setProperty("/visibleIssuesCount", filteredIssues.length);
			}

			this.setToolbarHeight();
		},
		filterIssueListItems: function (issue) {
			var sevFilter = this.model.getProperty("/severityFilter"),
				sevFilterApplied = issue.severity === sevFilter || sevFilter === constants.FILTER_VALUE_ALL,
				catFilter = this.model.getProperty("/categoryFilter"),
				catFilterApplied = $.inArray( catFilter, issue.categories ) > -1 || catFilter === constants.FILTER_VALUE_ALL,
				elementFilter = this.model.getProperty("/elementFilter"),
				elementFilterApplied =  elementFilter ===  issue.context.id || elementFilter === constants.FILTER_VALUE_ALL,
				audFilter = this.model.getProperty("/audienceFilter"),
				audienceFilterApplied =  $.inArray( audFilter, issue.audiences ) > -1 || audFilter === constants.FILTER_VALUE_ALL,
				bEnabledFilterButton = sevFilter === constants.FILTER_VALUE_ALL && catFilter === constants.FILTER_VALUE_ALL && audFilter === constants.FILTER_VALUE_ALL && elementFilter === constants.FILTER_VALUE_ALL;

			this.model.setProperty("/bEnabledFilterButton", !bEnabledFilterButton);

			return sevFilterApplied && catFilterApplied && elementFilterApplied && audienceFilterApplied;
		},
		setToolbarHeight: function() {
				this.model.setProperty("/filterBarHeight", "4rem");
		},
		onReportPress: function(oEvent) {
				var oItem = oEvent.getParameter("item"),
					actionToTake = oItem.getText(),
					data = this._getReportData();
				if (actionToTake === 'View') {
					CommunicationBus.publish(channelNames.ON_SHOW_REPORT_REQUEST, data);
				} else {
					CommunicationBus.publish(channelNames.ON_DOWNLOAD_REPORT_REQUEST, data);
				}
		},
		_getReportData: function () {
			return {
				executionScopes: this.model.getProperty("/executionScopes"),
				executionScopeTitle: this.model.getProperty("/executionScopeTitle"),
				analysisDurationTitle: this.model.getProperty("/analysisDurationTitle")
			};
		},
		onRowSelection: function(event) {
			if (event.getParameter("rowContext")) {
				var selection = event.getParameter("rowContext").getObject();
				this.elementTree.setSelectedElement(selection.context.id, false);
				this.model.setProperty("/selectedIssue/details", selection.details);
			}
		},
		_setSelectedRule: function(selection){
			var selectedIssues,
				selectionCopy;
			if (this.model.getProperty("/visibleIssuesCount") > 0) {
				selectedIssues = this.structuredIssuesModel[selection.ruleLibName][selection.ruleId];
				selectionCopy = jQuery.extend(true, {}, selection); // clone the model so that the TreeTable will not be affected
				selectionCopy.issues = selectedIssues;
				selectionCopy.resolutionUrls = selectedIssues[0].resolutionUrls;
				this.issueTable.setSelectedIndex(0);
				this.model.setProperty("/selectedIssue/details", selectionCopy.details);
				this.model.setProperty("/selectedIssue", selectionCopy);
				this._setIconAndColorToIssue(selectionCopy.issues);
			} else {
				this.model.setProperty("/selectedIssue", null);
			}
		},

		/**
		 * Set to model icon and color depending on severity.
		 * @private
		 * @param {array} aIssues
		 * @returns {void}
		 */
		_setIconAndColorToIssue: function(aIssues) {
			aIssues.forEach(function(element){
				switch (element.severity) {
					case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_LOW:
						element.severityIcon = mIssueSettings.severityIcons.Low;
						element.severityColor = constants.SUPPORT_ASSISTANT_SEVERITY_LOW_COLOR;
						break;
					case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_MEDIUM:
						element.severityIcon = mIssueSettings.severityIcons.Medium;
						element.severityColor = constants.SUPPORT_ASSISTANT_SEVERITY_MEDIUM_COLOR;
						break;
					case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_HIGH:
						element.severityIcon = mIssueSettings.severityIcons.High;
						element.severityColor = constants.SUPPORT_ASSISTANT_SEVERITY_HIGH_COLOR;
						break;
				}
			});
		}
	});
});
