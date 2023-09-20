/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/base/strings/escapeRegExp",
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (escapeRegExp, SandboxModelHelper, ODataModel) {
	"use strict";


	const a11Children = [{
			AGE : 38,
			DrillState : "leaf",
			ID : "1.1.1",
			MANAGER_ID : "1.1",
			Name : "Delta"
		}, {
			AGE : 39,
			DrillState : "leaf",
			ID : "1.1.2",
			MANAGER_ID : "1.1",
			Name : "Epsilon"
		}],
		a12Children = [{
			AGE : 31,
			DrillState : "leaf",
			ID : "1.2.1",
			MANAGER_ID : "1.2",
			Name : "Eta"
		}, {
			AGE : 32,
			DrillState : "leaf",
			ID : "1.2.2",
			MANAGER_ID : "1.2",
			Name : "Theta"
		}, {
			AGE : 33,
			DrillState : "leaf",
			ID : "1.2.3",
			MANAGER_ID : "1.2",
			Name : "Iota"
		}],
		a51Children = [{
			AGE : 21,
			DrillState : "leaf",
			ID : "5.1.1",
			MANAGER_ID : "5.1",
			Name : "Pi"
		}, {
			AGE : 22,
			DrillState : "leaf",
			ID : "5.1.2",
			MANAGER_ID : "5.1",
			Name : "Rho"
		}, {
			AGE : 23,
			DrillState : "leaf",
			ID : "5.1.3",
			MANAGER_ID : "5.1",
			Name : "Sigma"
		}, {
			AGE : 24,
			DrillState : "leaf",
			ID : "5.1.4",
			MANAGER_ID : "5.1",
			Name : "Tau"
		}, {
			AGE : 25,
			DrillState : "leaf",
			ID : "5.1.5",
			MANAGER_ID : "5.1",
			Name : "Upsilon"
		}, {
			AGE : 26,
			DrillState : "leaf",
			ID : "5.1.6",
			MANAGER_ID : "5.1",
			Name : "Phi"
		}, {
			AGE : 27,
			DrillState : "leaf",
			ID : "5.1.7",
			MANAGER_ID : "5.1",
			Name : "Chi"
		}, {
			AGE : 28,
			DrillState : "leaf",
			ID : "5.1.8",
			MANAGER_ID : "5.1",
			Name : "Psi"
		}, {
			AGE : 29,
			DrillState : "leaf",
			ID : "5.1.9",
			MANAGER_ID : "5.1",
			Name : "Omega"
		}],
		aNodes = [{
			AGE : 60,
			DescendantCount : 9,
			DistanceFromRoot : 0,
			DrillState : "expanded",
			ID : "0",
			MANAGER_ID : null,
			Name : "Alpha"
		}, {
			AGE : 55,
			DescendantCount : 2,
			DistanceFromRoot : 1,
			DrillState : "expanded",
			ID : "1",
			MANAGER_ID : "0",
			Name : "Beta"
		}, {
			AGE : 41,
			DescendantCount : 0, // --> collapsed?
			DistanceFromRoot : 2,
			DrillState : "collapsed",
			ID : "1.1",
			MANAGER_ID : "1",
			Name : "Gamma" // Delta, Epsilon
		}, {
			AGE : 42,
			DescendantCount : 0, // --> collapsed?
			DistanceFromRoot : 2,
			DrillState : "collapsed",
			ID : "1.2",
			MANAGER_ID : "1",
			Name : "Zeta" // Eta, Theta, Iota
		}, {
			AGE : 56,
			DescendantCount : 0, // --> leaf
			DistanceFromRoot : 1,
			DrillState : "leaf",
			ID : "2",
			MANAGER_ID : "0",
			Name : "Kappa"
		}, {
			AGE : 57,
			DescendantCount : 0, // --> leaf
			DistanceFromRoot : 1,
			DrillState : "leaf",
			ID : "3",
			MANAGER_ID : "0",
			Name : "Lambda"
		}, {
			AGE : 58,
			DescendantCount : 1,
			DistanceFromRoot : 1,
			DrillState : "expanded",
			ID : "4",
			MANAGER_ID : "0",
			Name : "Mu"
		}, {
			AGE : 41,
			DescendantCount : 0, // --> collapsed? leaf!
			DistanceFromRoot : 2,
			DrillState : "leaf",
			ID : "4.1",
			MANAGER_ID : "4",
			Name : "Nu"
		}, {
			AGE : 59,
			DescendantCount : 1,
			DistanceFromRoot : 1,
			DrillState : "expanded",
			ID : "5",
			MANAGER_ID : "0",
			Name : "Xi"
		}, {
			AGE : 41,
			DescendantCount : 0, // collapsed
			DistanceFromRoot : 2,
			DrillState : "collapsed",
			ID : "5.1",
			MANAGER_ID : "5",
			Name : "Omicron" // Pi, Rho, Sigma, Tau, Upsilon, Phi, Chi, Psi, Omega
		}],
		mNodeById = {},
		oMockData = {
			sFilterBase : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			mFixture : {
			},
			aRegExps : [{
				regExp : /^GET [\w\/.]+\$metadata[\w?&\-=]+sap-language=..$/,
				response : {source : "metadata.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/RecursiveHierarchy/data"
		},
		mRevisionOfAgeById = {};

	let iRevision = 0;

	function countSkipTop(sRelativeUrlPrefix, aRows) {
		oMockData.aRegExps.push({
			regExp : new RegExp("^"
				+ escapeRegExp("GET " + oMockData.sFilterBase + sRelativeUrlPrefix)
				+ "(&\\$count=true)?&\\$skip=(\\d+)&\\$top=(\\d+)$"),
			response : {
				buildResponse : function (aMatches, oResponse) {
					const bCount = !!aMatches[1],
						oMessage = {},
						iSkip = parseInt(aMatches[2]),
						iTop = parseInt(aMatches[3]);

					if (bCount) {
						oMessage["@odata.count"] = "" + aRows.length;
					}
					oMessage.value = SandboxModel.update(aRows.slice(iSkip, iSkip + iTop));
					oResponse.message = JSON.stringify(oMessage);
				}
			}
		});
	}

	function descendants(sNode, aChildren) {
		countSkipTop("EMPLOYEES?$apply=descendants($root/EMPLOYEES,OrgChart,ID,filter(ID%20eq%20'"
			+ sNode + "'),1)/orderby(AGE)&$select=AGE,DrillState,ID,MANAGER_ID,Name",
			aChildren);
	}

	countSkipTop("EMPLOYEES?$apply=orderby(AGE)/com.sap.vocabularies.Hierarchy.v1.TopLevels("
		+ "HierarchyNodes=$root/EMPLOYEES,HierarchyQualifier='OrgChart',NodeProperty='ID',Levels=999)"
		+ "&$select=AGE,DescendantCount,DistanceFromRoot,DrillState,ID,MANAGER_ID,Name", aNodes);

	countSkipTop("EMPLOYEES?$apply=orderby(AGE)/com.sap.vocabularies.Hierarchy.v1.TopLevels("
		+ "HierarchyNodes=$root/EMPLOYEES,HierarchyQualifier='OrgChart',NodeProperty='ID',Levels=1)"
		+ "&$select=AGE,DrillState,ID,MANAGER_ID,Name", [Object.assign(aNodes[0], {DrillState : "collapsed"})]);

	descendants("1.1", a11Children);
	descendants("1.2", a12Children);
	descendants("5.1", a51Children);

	// for side effects, allow filtering the complete collection by ID
	aNodes.concat(a11Children, a12Children, a51Children).forEach(function (oNode) {
		mNodeById[oNode.ID] = oNode;
		mRevisionOfAgeById[oNode.ID] = 0;
	});
	oMockData.aRegExps.push({
		regExp : new RegExp("^"
			+ escapeRegExp("GET " + oMockData.sFilterBase
				+ "EMPLOYEES?$select=AGE,ID,MANAGER_ID,Name&$filter=")
			+ "([^&]+)(?:&\\$top=(\\d+))?$"), // Note: just ignore $top
		response : {
			buildResponse : function (aMatches, oResponse) {
				const aResult = [],
					// ID%20eq%20'0'%20or%20ID%20eq%20'1'%20or%20ID%20eq%20'1.1'
					sKeyFilterList = aMatches[1];

				sKeyFilterList.split("%20or%20").forEach(function (sKeyFilter) {
					const sId = sKeyFilter.split("%20eq%20")[1].slice(1, -1),
						oNode = mNodeById[sId];

					aResult.push({ // poor man's $select ;-)
						AGE : oNode.AGE,
						ID : oNode.ID,
						MANAGER_ID : oNode.MANAGER_ID,
						Name : oNode.Name
					});
				});

				iRevision += 1;
				oResponse.message = JSON.stringify({
					value : SandboxModel.update(aResult)
				});
			}
		}
	});
	oMockData.aRegExps.push({
		regExp : new RegExp("^"
			+ escapeRegExp("GET " + oMockData.sFilterBase
				+ "EMPLOYEES?$select=AGE,ID,Name&$filter=ID%20eq%20")
			+ "'([0-9.]+)'$"),
		response : {
			buildResponse : function (aMatches, oResponse) {
				let oNode = mNodeById[aMatches[1]];

				oNode = { // poor man's $select ;-)
					AGE : oNode.AGE,
					ID : oNode.ID,
					Name : oNode.Name
				};

				mRevisionOfAgeById[oNode.ID] += 1;
				oResponse.message = JSON.stringify({
					value : SandboxModel.update([oNode])
				});
			}
		}
	});

	const SandboxModel = ODataModel.extend(
		"sap.ui.mdc.tableOpaTests.appMDCTreeTableV4.SandboxModel", {
			constructor : function (mParameters) {
				return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters,
					oMockData);
			}
		});

	SandboxModel.getChildrenOf1_1 = function () {
		return a11Children.slice();
	};

	SandboxModel.getChildrenOf1_2 = function () {
		return a12Children.slice();
	};

	SandboxModel.getChildrenOf5_1 = function (iSkip, iTop) {
		return a51Children.slice(iSkip, iSkip + iTop);
	};

	SandboxModel.getNodes = function (iSkip, iTop) {
		return aNodes.slice(iSkip, iSkip + iTop);
	};

	/**
	 * Returns a copy of the given nodes, updated to the current revision.
	 *
	 * @param {object[]} aNodes
	 *  A list of (original or updated) nodes, might include <code>null</code> values
	 * @returns {object[]}
	 *   An updated copy
	 */
	SandboxModel.update = function (aNodes) {
		return aNodes.map(function (oNode) {
			if (oNode && (iRevision || mRevisionOfAgeById[oNode.ID])) {
				oNode = Object.assign({}, oNode);
				if ("Name" in oNode) {
					oNode.Name = oNode.Name.split(" ")[0] + " #" + iRevision;
					if (mRevisionOfAgeById[oNode.ID]) {
						oNode.Name += "+" + mRevisionOfAgeById[oNode.ID];
					}
				}
				if ("AGE" in oNode) {
					oNode.AGE
						= (oNode.AGE % 100) + 100 * (iRevision + mRevisionOfAgeById[oNode.ID]);
				}
			}

			return oNode;
		});
	};

	return SandboxModel;
});
