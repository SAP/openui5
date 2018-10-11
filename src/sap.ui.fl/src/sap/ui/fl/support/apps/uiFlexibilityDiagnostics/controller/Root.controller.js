/*!
 * ${copyright}
 */

/* global FileReader */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(Controller, JSONModel, jQuery) {
	"use strict";
	return Controller.extend("sap.ui.fl.support.apps.uiFlexibilityDiagnostics.controller.Root", {
		onInit: function() {
			this._oView = this.getView();
			this._oDataSelectedModel = new JSONModel();
			this._oDataSelectedModel.setSizeLimit(10000);
			this._oView.setModel(this._oDataSelectedModel, "selectedData");
		},

		formatStatus: function (sKey, aAppliedChanges, aFailedChanges, aNotApplicableChanges) {
			if (!sKey || !aAppliedChanges || !aFailedChanges) {
				return;
			}

			aNotApplicableChanges = aNotApplicableChanges || [];
			var bSuccessful = aAppliedChanges.indexOf(sKey) !== -1;
			var bFailed = aFailedChanges.indexOf(sKey) !== -1;
			var bNotApplicable = aNotApplicableChanges.indexOf(sKey) !== -1;

			if (bSuccessful) {
				if (!bFailed) {
					return "Success";
				} else {
					return "Warning";
				}
			}
			if (bNotApplicable) {
				if (!bFailed) {
					return "CustomNotApplicable";
				} else {
					return "Warning";
				}
			}
			if (bFailed) {
				return "Error";
			}
		},

		loadFile: function(oEvent){
			var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
			if (file && window.FileReader){
				var oReader = new FileReader();
				oReader.onload = function(evn) {
					var sFileContent = evn.target.result;
					var oFlexData = JSON.parse(sFileContent);
					var oGraphData = this._createGraphData(oFlexData);
					this._oDataSelectedModel.setData(oGraphData);
				}.bind(this);
				oReader.readAsText(file);
			}
		},

		 _generateAttributes: function(oDefinition) {
			 function _extractSelectorAttribute (sKey, oSelector) {
				 return {
					 label: "dependency (" + sKey + ")",
					 value: oSelector.id ? oSelector.id : oSelector
				 };
			 }
			var aAttributes = [{
				label: "Filename",
				value: oDefinition.fileName
			},{
				label: "Layer",
				value: oDefinition.layer
			},{
				label: "created at",
				value: oDefinition.creation
			},{
				label: "created with app version",
				value: oDefinition.validAppVersions ? oDefinition.validAppVersions.creation : "N/A"
			},{
				label: "created by",
				value: oDefinition.support.user
			},{
				label: "Variant Reference",
				value: oDefinition.variantReference
			},{
				label: "selector",
				value: oDefinition.selector.id ? oDefinition.selector.id : oDefinition.selector
			}];

			if (oDefinition.dependentSelector) {
				jQuery.each(oDefinition.dependentSelector, function (sDependencyType, oSelector) {
					if (Array.isArray(oSelector)) {
						aAttributes = aAttributes.concat(oSelector.map(_extractSelectorAttribute.bind(this, sDependencyType)));
					} else {
						aAttributes.push(_extractSelectorAttribute(sDependencyType, oSelector));
					}
				});
			}
			if (oDefinition.oDataInformation && oDefinition.oDataInformation.propertyName){
				aAttributes = aAttributes.concat([{
					label: "OData Property",
					value: oDefinition.oDataInformation.propertyName
				},{
					label: "OData EntityType",
					value: oDefinition.oDataInformation.entityType
				},{
					label: "OData URI",
					value: oDefinition.oDataInformation.oDataServiceUri
				}]);
			}
			aAttributes = aAttributes.concat([{
				label: "Change content",
				value: "{= '" + JSON.stringify(oDefinition.content) + "'}" //prevent being interpreted as binding
			}]);

			return aAttributes;
		},

		 _defineIcon: function(sChangeType) {
			if (sChangeType.indexOf("move") !== -1){
				return "sap-icon://move";
			} else if (sChangeType.indexOf("add") !== -1){
				return "sap-icon://add";
			} else if (sChangeType.indexOf("unhide") !== -1){
				return "sap-icon://show";
			} else if (sChangeType.indexOf("hide") !== -1){
				return "sap-icon://hide";
			} else if (sChangeType.indexOf("unstash") !== -1){
				return "sap-icon://show";
			} else if (sChangeType.indexOf("stash") !== -1){
				return "sap-icon://hide";
			} else if (sChangeType.indexOf("split") !== -1){
				return "sap-icon://split";
			} else if (sChangeType.indexOf("combine") !== -1){
				return "sap-icon://combine";
			} else if (sChangeType.indexOf("rename") !== -1){
				return "sap-icon://text";
			}

			return "sap-icon://verify-api";
		},

		 _generateDependencies: function(mFlexData, mGraphData) {
			var mChangesEntries = mFlexData.mChangesEntries;

			jQuery.each(mChangesEntries, function (sChangeId, mChangeEntry) {
				mChangeEntry.aDependencies.forEach(function (sDependentChangeId) {
					mGraphData.lines.push({from: sDependentChangeId, to: sChangeId});
				});
			});

			// identify lines already covered via indirect dependencies
			mGraphData.lines.forEach(function (mLineUnderEvaluation) {
				var sFrom = mLineUnderEvaluation.from;
				var sTo = mLineUnderEvaluation.to;

				// loop over all lines and detect lines with the same start
				var aLinesWithSameStart = mGraphData.lines.filter(function (mLine) {
					return mLine.from == sFrom && mLine.to != sTo;
				});

				var aFromIdsOfLinesWithSameEnd = [];

				mGraphData.lines.filter(function (mLine) {
					if (mLine.from != sFrom && mLine.to == sTo) {
						aFromIdsOfLinesWithSameEnd.push(mLine.from);
					}
				});

				// search for any of these lines which have the endpoint of the line under evaluation
				mLineUnderEvaluation.obsolete = aLinesWithSameStart.some(function (mLine) {
					return aFromIdsOfLinesWithSameEnd.indexOf(mLine.to) != -1;
				});
			});

			// remove all obsolete lines
			mGraphData.lines = mGraphData.lines.filter(function (mLine) {
				return !mLine.obsolete;
			});
		},

		_createGraphData: function (mFlexData) {
			if (!mFlexData.bIsInvestigationExport) {
				throw Error("Flex server response not supported yet!");
			}

			var mGraphData = {
				nodes: [],
				groups: [],
				lines: [],
				nodeBoxWidth: 100,
				appliedChanges: mFlexData.aAppliedChanges,
				failedChanges: mFlexData.aFailedChanges,
				notApplicableChanges: mFlexData.aNotApplicableChanges
			};

			var mChanges = mFlexData.mChangesEntries;
			jQuery.each(mChanges, function (sChangeId, oChange) {
				var oDefinition = oChange.mDefinition;
				var sChangeType = oDefinition.changeType;

				var mNode = {
					title: sChangeType,
					key: oDefinition.fileName,
					icon: this._defineIcon(sChangeType),
					group: oDefinition.layer,
					descriptionLineSize: 0,
					variantIcon: oDefinition.variantReference ? "sap-icon://tree" : undefined,
					attributes: this._generateAttributes(oDefinition)
				};

				var bGroupPresent = mGraphData.groups.some(function (oGroup) {
					return oGroup.key === mNode.group;
				});

				if (!bGroupPresent) {
					mGraphData.groups.push({key: mNode.group, title: mNode.group});
				}

				mGraphData.nodes.push(mNode);
			}.bind(this));

			this._generateDependencies(mFlexData, mGraphData);

			return mGraphData;
		}
	});
});