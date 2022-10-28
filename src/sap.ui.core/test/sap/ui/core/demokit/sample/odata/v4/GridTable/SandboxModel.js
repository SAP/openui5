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

	var a51Children = [{
			AGE : 21,
			ID : "5.1.1",
			MANAGER_ID : "5.1",
			Name : "Pi"
		}, {
			AGE : 22,
			ID : "5.1.2",
			MANAGER_ID : "5.1",
			Name : "Rho"
		}, {
			AGE : 23,
			ID : "5.1.3",
			MANAGER_ID : "5.1",
			Name : "Sigma"
		}, {
			AGE : 24,
			ID : "5.1.4",
			MANAGER_ID : "5.1",
			Name : "Tau"
		}, {
			AGE : 25,
			ID : "5.1.5",
			MANAGER_ID : "5.1",
			Name : "Upsilon"
		}, {
			AGE : 26,
			ID : "5.1.6",
			MANAGER_ID : "5.1",
			Name : "Phi"
		}, {
			AGE : 27,
			ID : "5.1.7",
			MANAGER_ID : "5.1",
			Name : "Chi"
		}, {
			AGE : 28,
			ID : "5.1.8",
			MANAGER_ID : "5.1",
			Name : "Psi"
		}, {
			AGE : 29,
			ID : "5.1.9",
			MANAGER_ID : "5.1",
			Name : "Omega"
		}],
		aNodes = [{
			AGE : 60,
			ID : "0",
			MANAGER_ID : null,
			Name : "Alpha"
		}, {
			AGE : 55,
			ID : "1",
			MANAGER_ID : "0",
			Name : "Beta"
		}, {
			AGE : 41,
			ID : "1.1",
			MANAGER_ID : "1",
			Name : "Gamma" // Delta, Epsilon
		}, {
			AGE : 42,
			ID : "1.2",
			MANAGER_ID : "1",
			Name : "Zeta" // Eta, Theta, Iota
		}, {
			AGE : 56,
			ID : "2",
			MANAGER_ID : "0",
			Name : "Kappa"
		}, {
			AGE : 57,
			ID : "3",
			MANAGER_ID : "0",
			Name : "Lambda"
		}, {
			AGE : 58,
			ID : "4",
			MANAGER_ID : "0",
			Name : "Mu"
		}, {
			AGE : 41,
			ID : "4.1",
			MANAGER_ID : "4",
			Name : "Nu"
		}, {
			AGE : 59,
			ID : "5",
			MANAGER_ID : "0",
			Name : "Xi"
		}, {
			AGE : 41,
			ID : "5.1",
			MANAGER_ID : "5",
			Name : "Omicron" // Pi, Rho, Sigma, Tau, Upsilon, Phi, Chi, Psi, Omega
		}].concat(a51Children),
		mNodeById = {},
		oMockData = {
			sFilterBase : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			mFixture : {
			},
			aRegExps : [{
				regExp : /^GET [\w\/.]+\$metadata[\w?&\-=]+sap-language=..$/,
				response : {source : "metadata.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/GridTable/data"
		},
		iRevision = 0,
		mRevisionOfAgeById = {},
		SandboxModel;

	function countSkipTop(sRelativeUrlPrefix, aRows) {
		oMockData.aRegExps.push({
			regExp : new RegExp("^"
				+ escapeRegExp("GET " + oMockData.sFilterBase + sRelativeUrlPrefix)
				+ "(&\\$count=true)?&\\$skip=(\\d+)&\\$top=(\\d+)$"),
			response : {
				buildResponse : function (aMatches, oResponse) {
					var bCount = !!aMatches[1],
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

	countSkipTop("EMPLOYEES?$orderby=AGE&$select=AGE,ID,MANAGER_ID,Name", aNodes);

	// for side effects, allow filtering the complete collection by ID
	aNodes.forEach(function (oNode) {
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
				var aNodes = [],
					// ID%20eq%20'0'%20or%20ID%20eq%20'1'%20or%20ID%20eq%20'1.1'
					sKeyFilterList = aMatches[1];

				sKeyFilterList.split("%20or%20").forEach(function (sKeyFilter) {
					var sId = sKeyFilter.split("%20eq%20")[1].slice(1, -1),
						oNode = mNodeById[sId];

					aNodes.push(oNode);
				});

				iRevision += 1;
				oResponse.message = JSON.stringify({
					value : SandboxModel.update(aNodes)
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
				var oNode = mNodeById[aMatches[1]];

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

	SandboxModel = ODataModel.extend(
		"sap.ui.core.sample.odata.v4.GridTable.SandboxModel", {
			constructor : function (mParameters) {
				return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters,
					oMockData);
			}
		});

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
