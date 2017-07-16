/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/ui/external/ElementTree",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/ui/models/formatter"
], function ($, Controller, JSONModel, CommunicationBus, SharedModel, ElementTree, IssueManager, channelNames, formatter) {
	"use strict";

	var mIssueSettings = {
		severitytexts: {
			High: "High",
			Medium: "Medium",
			Low: "Low",
			All: "All Severities"
		},
		severitystates: {
			High: "Error",
			Medium: "Warning",
			Low: "None",
			All: "None"
		},
		severityicons: {
			High: "sap-icon://message-error",
			Medium: "sap-icon://message-warning",
			Low: "sap-icon://message-information",
			All: "sap-icon://multiselect-all"
		}
	};

	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Issues", {
		ISSUES_LIMIT : 1000,
		formatter: formatter,
		onInit: function () {

			this.model = SharedModel;
			this.setCommunicationSubscriptions();
			this.getView().setModel(this.model);
			this.clearFilters();
			this._initElementTree();
			this.treeTable = this.getView().byId("issuesList");
			this.issueTable = this.getView().byId("issueTable");
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
				this.model.setProperty("/selectedIssue", "");
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
			this.elementTree.setContainerId(this.getView().byId("elementTreeContainer").getId());
		},
		clearFilters: function () {
			this.model.setProperty("/severityFilter", "All");
			this.model.setProperty("/categoryFilter", "All");
			this.model.setProperty("/elementFilter", "All");
			this.model.setProperty("/audienceFilter", "All");

			if (this.data) {
				this.model.setProperty("/issues", this.data.issues);
				this.setToolbarHeight();
			}

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
				var selection = event.getParameter("rowContext").getObject();
				if (selection.type === "rule") {
					this._setSelectedRule(selection);
				} else {
					this.model.setProperty("/selectedIssue", "");
				}
				if (selection.issueCount < 4 ) {
					this._setPropertiesOfResponsiveDetailsAndTable("Fixed", "inherit");
					this.model.setProperty("/visibleRowCount", 4);

				} else {
					this._setPropertiesOfResponsiveDetailsAndTable("Auto", "5rem");
				}
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
				sevFilterApplied = issue.severity === sevFilter || sevFilter === 'All',
				catFilter = this.model.getProperty("/categoryFilter"),
				catFilterApplied = $.inArray( catFilter, issue.categories ) > -1 || catFilter === 'All',
				elementFilter = this.model.getProperty("/elementFilter"),
				elementFilterApplied =  elementFilter ===  issue.context.id || elementFilter === 'All',
				audFilter = this.model.getProperty("/audienceFilter"),
				audienseFilterApplied =  $.inArray( audFilter, issue.audiences ) > -1 || audFilter === 'All';

			return sevFilterApplied && catFilterApplied && elementFilterApplied && audienseFilterApplied;
		},
		filterSevirityIcon: function(sValue) {
			return mIssueSettings.severityicons[sValue];
		},
		filterSevirityState: function(sValue) {
			return mIssueSettings.severitystates[sValue];
		},
		filterSevirityText: function(sValue) {
			return mIssueSettings.severitytexts[sValue];
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
			} else {
			this.model.setProperty("/selectedIssue", "");
			}
		},
		_setPropertiesOfResponsiveDetailsAndTable: function(visibleRowCountMode, heightDetailsArea){
			this.model.setProperty("/visibleRowCountMode", visibleRowCountMode);
			this.model.setProperty("/heightDetailsArea", heightDetailsArea);
		}
	});
});
