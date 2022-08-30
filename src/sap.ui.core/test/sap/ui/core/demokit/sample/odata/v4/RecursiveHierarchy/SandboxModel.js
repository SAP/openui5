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

	// IDEAS:
	// - AGE determines sibling order (ascending), parents are older than their children
	// - ID is hierarchical (but we omit the "0." prefix)
	// - Name follows Greek alphabet in preorder
	// Αα  Alpha
	// Ββ  Beta
	// Γγ  Gamma
	// Δδ  Delta
	// Εε  Epsilon
	// Ζζ  Zeta
	// Ηη  Eta
	// Θθ  Theta
	// Ιι  Iota
	// Κκ  Kappa
	// Λλ  Lambda
	// Μμ  Mu
	// Νν  Nu
	// Ξξ  Xi
	// Οο  Omicron
	// Ππ  Pi
	// Ρρ  Rho
	// Σσς Sigma
	// Ττ  Tau
	// Υυ  Upsilon
	// Φφ  Phi
	// Χχ  Chi
	// Ψψ  Psi
	// Ωω  Omega
	//
	// Note:
	// - The URLs shown here are purely accidental and just "good enough" to dinstinguish different
	//   requests; in no way do they represent what really needs to be sent!
	// - Sometimes, you can derive the DrillState from DescendantCount and DistanceFromRoot, but at
	//   the "edge of expansion" you cannot be certain.
	// - When expanding, DescendantCount, DistanceFromRoot, MANAGER_ID are of no use
	var a11Children = [{
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
		sFilterBase = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		oMockData = {
			sFilterBase : sFilterBase,
			mFixture : {
			},
			aRegExps : [],
			sSourceBase : "sap/ui/core/sample/odata/v4/RecursiveHierarchy/data"
		},
		SandboxModel;

	function buildResponse(aRows, aMatches, oResponse) {
		var bCount = !!aMatches[1],
			oMessage = {},
			iSkip = parseInt(aMatches[2]),
			iTop = parseInt(aMatches[3]);

		if (bCount) {
			oMessage["@odata.count"] = "" + aRows.length;
		}
		oMessage.value = aRows.slice(iSkip, iSkip + iTop);
		oResponse.message = JSON.stringify(oMessage);
	}

	function countSkipTop(sRelativeUrlPrefix, aRows) {
		oMockData.aRegExps.push({
			regExp : new RegExp("^"
				+ escapeRegExp("GET " + sFilterBase + sRelativeUrlPrefix)
				+ "(&\\$count=true)?&\\$skip=(\\d+)&\\$top=(\\d+)$"),
			response : {
				buildResponse : buildResponse.bind(null, aRows)
			}
		});
	}

	function descendants(sNode, aChildren) {
		countSkipTop("EMPLOYEES?$apply=descendants($root/EMPLOYEES,OrgChart,ID,filter(ID%20eq%20'"
			+ sNode + "'),1)/orderby(AGE)&$select=AGE,DrillState,ID,MANAGER_ID,Name",
			aChildren);
	}

	countSkipTop("EMPLOYEES?$apply=orderby(AGE)/com.sap.vocabularies.Hierarchy.v1.TopLevels("
		+ "HierarchyNodes=$root/EMPLOYEES,HierarchyQualifier='OrgChart',NodeProperty='ID',Levels=3)"
		+ "&$select=AGE,DescendantCount,DistanceFromRoot,DrillState,ID,MANAGER_ID,Name", aNodes);
	descendants("1.1", a11Children);
	descendants("1.2", a12Children);
	descendants("5.1", a51Children);

	SandboxModel = ODataModel.extend(
		"sap.ui.core.sample.odata.v4.RecursiveHierarchy.SandboxModel", {
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

	return SandboxModel;
});
