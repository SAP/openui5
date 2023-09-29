/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";
	const SandboxModel = ODataModel.extend(
		"sap.ui.core.sample.odata.v4.RecursiveHierarchy.SandboxModel", {
			constructor : function (mParameters) {
				return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, {
					sFilterBase : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
					mFixture : {},
					aRegExps : [{
						regExp : /^GET [\w\/.]+\$metadata[\w?&\-=]+sap-language=..$/,
						response : {source : "metadata.xml"}
					}, {
						regExp : /^GET \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES\?(.*)$/,
						response : {buildResponse : buildGetResponse}
					}, {
						regExp : /^PATCH \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES\('([^']*)'\)$/,
						response : {buildResponse : buildPatchResponse, code : 204}
					}, {
						regExp : /^POST \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES$/,
						response : {buildResponse : buildPostResponse}
					}],
					sSourceBase : "sap/ui/core/sample/odata/v4/RecursiveHierarchy/data"
				});
			}
		});

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
	const aOriginalData = [{
		AGE : 60,
		ID : "0",
		Name : "Alpha"
	}, {
		AGE : 55,
		ID : "1",
		Name : "Beta"
	}, {
		AGE : 41,
		ID : "1.1",
		Name : "Gamma"
	}, {
		AGE : 38,
		ID : "1.1.1",
		Name : "Delta"
	}, {
		AGE : 39,
		ID : "1.1.2",
		Name : "Epsilon"
	}, {
		AGE : 42,
		ID : "1.2",
		Name : "Zeta"
	}, {
		AGE : 31,
		ID : "1.2.1",
		Name : "Eta"
	}, {
		AGE : 32,
		ID : "1.2.2",
		Name : "Theta"
	}, {
		AGE : 33,
		ID : "1.2.3",
		Name : "Iota"
	}, {
		AGE : 56,
		ID : "2",
		Name : "Kappa"
	}, {
		AGE : 57,
		ID : "3",
		Name : "Lambda"
	}, {
		AGE : 58,
		ID : "4",
		Name : "Mu"
	}, {
		AGE : 41,
		ID : "4.1",
		Name : "Nu"
	}, {
		AGE : 59,
		ID : "5",
		Name : "Xi"
	}, {
		AGE : 41,
		ID : "5.1",
		Name : "Omicron"
	}, {
		AGE : 21,
		ID : "5.1.1",
		Name : "Pi"
	}, {
		AGE : 22,
		ID : "5.1.2",
		Name : "Rho"
	}, {
		AGE : 23,
		ID : "5.1.3",
		Name : "Sigma"
	}, {
		AGE : 24,
		ID : "5.1.4",
		Name : "Tau"
	}, {
		AGE : 25,
		ID : "5.1.5",
		Name : "Upsilon"
	}, {
		AGE : 26,
		ID : "5.1.6",
		Name : "Phi"
	}, {
		AGE : 27,
		ID : "5.1.7",
		Name : "Chi"
	}, {
		AGE : 28,
		ID : "5.1.8",
		Name : "Psi"
	}, {
		AGE : 29,
		ID : "5.1.9",
		Name : "Omega"
	}];

	let aAllNodes; // in preorder
	let mChildrenByParentId; // no entry for leaves!
	let mNodeById;
	let iRevision;
	let mRevisionOfAgeById;

	function reset() {
		aAllNodes = aOriginalData.map((oNode) => ({...oNode}));
		mChildrenByParentId = {};
		mNodeById = {};
		iRevision = 0;
		mRevisionOfAgeById = {};

		aAllNodes.forEach((oNode) => {
			// oNode.DescendantCount = 0; // @see computeDescendantCount
			oNode.DistanceFromRoot = oNode.ID === "0"
				? 0
				: oNode.ID.split(".").length; // Note: ID is hierarchical
			oNode.DrillState = "collapsed";
			if (oNode.ID === "0") {
				oNode.MANAGER_ID = null;
			} else {
				oNode.MANAGER_ID = oNode.ID.includes(".")
					? oNode.ID.slice(0, oNode.ID.lastIndexOf("."))
					: "0";
			}

			if (oNode.MANAGER_ID) {
				(mChildrenByParentId[oNode.MANAGER_ID] ??= []).push(oNode);
			}
			mNodeById[oNode.ID] = oNode;
			mRevisionOfAgeById[oNode.ID] = 0;
		});

		// mark all leaves; others are by default collapsed (and expanded only via TopLevels)
		aAllNodes.filter((oNode) => !(oNode.ID in mChildrenByParentId))
			.forEach((oNode) => { oNode.DrillState = "leaf"; });

		// compute DescendantCount of unlimited hierarchy
		(function computeDescendantCount(sId) {
			const aChildren = mChildrenByParentId[sId] || [];
			mNodeById[sId].DescendantCount = aChildren.reduce((iCount, oChild) => {
				computeDescendantCount(oChild.ID);
				return iCount + oChild.DescendantCount;
			}, aChildren.length);
		})("0");
	}

	reset();

	/**
	 * Builds a response for any GET query on the "EMPLOYEES" collection.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetResponse(aMatches, oResponse) {
		const mQueryOptions = {};
		for (const sName_Value of aMatches[1].split("&")) {
			const [sName, ...aValues] = sName_Value.split("=");
			mQueryOptions[sName] = aValues.join("=");
		}

		if ("$apply" in mQueryOptions) {
			if (mQueryOptions.$apply.includes("TopLevels")) {
				// "EMPLOYEES?$apply=orderby(AGE)"
				// + "/com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/EMPLOYEES"
				// + ",HierarchyQualifier='OrgChart',NodeProperty='ID',Levels=" + iLevels + ")"
				const iLevels = parseInt(mQueryOptions.$apply.match(/,Levels=(\d+)/)[1]);
				selectCountSkipTop(topLevels(iLevels - 1), mQueryOptions, oResponse);
				return;
			}
			// "EMPLOYEES?$apply=descendants($root/EMPLOYEES,OrgChart,ID"
			// + ",filter(ID%20eq%20'" + sParentId + "'),1)/orderby(AGE)"
			const sParentId = mQueryOptions.$apply.match(/,filter\(ID%20eq%20'([^']*)'\)/)[1];
			let aChildren = mChildrenByParentId[sParentId];
			if ("$filter" in mQueryOptions) {
				// not%20(ID%20eq%20'5.1.10'%20or%20ID%20eq%20'5.1.11')
				const aIDs = mQueryOptions.$filter
					.slice("not%20(".length, -")".length)
					.split("%20or%20")
					.map((sID_Predicate) => sID_Predicate.split("%20eq%20")[1].slice(1, -1));
				aChildren = aChildren.filter((oChild) => !aIDs.includes(oChild.ID));
			}
			selectCountSkipTop(aChildren, mQueryOptions, oResponse);
			return;
		}

		if ("$filter" in mQueryOptions) {
			// ID%20eq%20'0'%20or%20ID%20eq%20'1'%20or%20ID%20eq%20'1.1'
			const aIDs = mQueryOptions.$filter.split("%20or%20")
				.map((sID_Predicate) => sID_Predicate.split("%20eq%20")[1].slice(1, -1));
			if (mQueryOptions.$select.includes("MANAGER_ID")) {
				iRevision += 1;
			} else {
				if (aIDs.length !== 1) {
					throw new Error("Unexpected ID filter length");
				}
				mRevisionOfAgeById[aIDs[0]] += 1;
			}
			const aRows = aIDs.map((sID) => mNodeById[sID]);
			selectCountSkipTop(aRows, mQueryOptions, oResponse);
			return;
		}

		selectCountSkipTop(aAllNodes, mQueryOptions, oResponse);
	}

	/**
	 * Builds a response for any PATCH request on a specific "EMPLOYEE" instance.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} _oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get PATCH body from
	 */
	function buildPatchResponse(aMatches, _oResponse, oRequest) {
		/**
		 * Adjust the DescendantCount of the node with given ID (and all of its ancestors) by the
		 * given difference.
		 *
		 * @param {string} sId - A node ID
		 * @param {number} iDiff - Some difference
		 */
		function adjustDescendantCount(sId, iDiff) {
			mNodeById[sId].DescendantCount += iDiff;
			sId = mNodeById[sId].MANAGER_ID;
			if (sId) {
				adjustDescendantCount(sId, iDiff);
			}
		}

		/**
		 * Adjust the DistanceFromRoot of the given node (and all of its descendants) by the given
		 * difference.
		 *
		 * @param {object} oNode - A node
		 * @param {number} iDiff - Some difference
		 */
		function adjustDistanceFromRoot(oNode, iDiff) {
			oNode.DistanceFromRoot += iDiff;
			(mChildrenByParentId[oNode.ID] || [])
				.forEach((oChild) => adjustDistanceFromRoot(oChild, iDiff));
		}

		if (oRequest.requestHeaders.Prefer !== "return=minimal") {
			throw new Error("Unsupported Prefer header: " + oRequest.requestHeaders.Prefer);
		}
		// {"Name" : "<new name>"}
		// "EMPLOYEE_2_MANAGER@odata.bind" : "EMPLOYEES('1')"
		const oBody = JSON.parse(oRequest.requestBody);
		switch (Object.keys(oBody).length === 1 && Object.keys(oBody)[0]) {
			case "EMPLOYEE_2_MANAGER@odata.bind": {
				const oChild = mNodeById[aMatches[1]];
				if (oChild.Name.includes("ERROR")) {
					throw new Error("This request intentionally failed!");
				}

				const sParentId = oBody["EMPLOYEE_2_MANAGER@odata.bind"]
					.slice("EMPLOYEES('".length, -"')".length);
				for (let sId = sParentId; sId; sId = mNodeById[sId].MANAGER_ID) {
					if (sId === oChild.ID) { // cycle detected
						throw new Error("Parent must not be a descendant of moved node");
					}
				}

				if (oChild.MANAGER_ID) {
					const aChildren = mChildrenByParentId[oChild.MANAGER_ID];
					aChildren.splice(aChildren.indexOf(oChild), 1);
					if (!aChildren.length) { // last child has gone
						delete mChildrenByParentId[oChild.MANAGER_ID];
						mNodeById[oChild.MANAGER_ID].DrillState = "leaf";
					}
					adjustDescendantCount(oChild.MANAGER_ID, -(oChild.DescendantCount + 1));
				} // else: cannot really happen w/ a single root and no cycles!

				if (!(sParentId in mChildrenByParentId)) { // new parent not a leaf anymore
					mNodeById[sParentId].DrillState = "collapsed"; // @see #reset
				}
				//TODO Note: "AGE determines sibling order (ascending)"
				(mChildrenByParentId[sParentId] ??= []).push(oChild);
				oChild.MANAGER_ID = sParentId;
				adjustDescendantCount(sParentId, oChild.DescendantCount + 1);
				adjustDistanceFromRoot(oChild,
					mNodeById[sParentId].DistanceFromRoot + 1 - oChild.DistanceFromRoot);
				const aSpliced
					= aAllNodes.splice(aAllNodes.indexOf(oChild), oChild.DescendantCount + 1);
				aAllNodes.splice(aAllNodes.indexOf(mNodeById[sParentId]) + 1, 0, ...aSpliced);
				break;
			}

			case "Name":
				// ignore suffixes added by SandboxModel.update
				mNodeById[aMatches[1]].Name = oBody.Name.split(" #")[0];
				break;

			default:
				throw new Error("Unsupported PATCH body: " + oRequest.requestBody);
		}
		// no response required
	}

	/**
	 * Builds a response for any POST request on the "EMPLOYEES" collection.
	 *
	 * @param {string[]} _aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get POST body from
	 */
	function buildPostResponse(_aMatches, oResponse, oRequest) {
		// {"EMPLOYEE_2_MANAGER@odata.bind" : "EMPLOYEES('0')"}
		const oBody = JSON.parse(oRequest.requestBody);
		const sParentId = oBody["EMPLOYEE_2_MANAGER@odata.bind"]
			.slice("EMPLOYEES('".length, -"')".length);
		const oParent = mNodeById[sParentId];
		const oNewChild = { // same order of keys than for "old" nodes ;-)
			AGE : 0, // see below
			ID : "", // see below
			Name : "", // Q: Derive default from parent's Name? A: No, it's editable!
			DistanceFromRoot : oParent.DistanceFromRoot + 1,
			DrillState : "leaf",
			MANAGER_ID : sParentId,
			DescendantCount : 0
		};

		if (sParentId in mChildrenByParentId) {
			// Note: "AGE determines sibling order (ascending)"
			oNewChild.AGE = mChildrenByParentId[sParentId][0].AGE - 1;
			//TODO use "largest" child ID which is hierarchical to parent? cf. move!
			// .../c/openui5/+/5940246/6/src/sap.ui.core/test/sap/ui/core/demokit/sample/odata/v4/RecursiveHierarchy/SandboxModel.js#b302
			const sLastChildID = mChildrenByParentId[sParentId].at(-1).ID;
			if (sLastChildID.includes(".")) {
				oNewChild.ID = sParentId + "."
					+ (parseInt(sLastChildID.slice(sLastChildID.lastIndexOf(".") + 1)) + 1);
			} else { // sParentId === "0"
				oNewChild.ID = "" + (parseInt(sLastChildID) + 1);
			}
		} else { // parent not a leaf anymore
			oParent.DrillState = "collapsed"; // @see #reset
			mChildrenByParentId[sParentId] = [];
			oNewChild.AGE = oParent.AGE - 1;
			oNewChild.ID = sParentId + ".1";
		}

		if (oNewChild.ID in mNodeById) {
			throw new Error("Illegal state: duplicate node ID " + oNewChild.ID);
		}
		aAllNodes.push(oNewChild); //TODO not good enough once we need "refresh"
		mNodeById[oNewChild.ID] = oNewChild;
		mRevisionOfAgeById[oNewChild.ID] = 0;
		// Note: server's insert position must not affect UI (until refresh!)
		mChildrenByParentId[sParentId].push(oNewChild);

		oResponse.message = JSON.stringify(SandboxModel.update([oNewChild])[0]);
	}

	/**
	 * Fills the given response object from the given list of rows, taking $select, $count, $skip,
	 * and $top into account.
	 *
	 * @param {object[]} aRows - List of row objects to build the response from
	 * @param {Object<string>} mQueryOptions - Map of (system) query options (names to values)
	 * @param {object} oResponse - Response object to fill
	 */
	function selectCountSkipTop(aRows, mQueryOptions, oResponse) {
		const aSelect = mQueryOptions.$select.split(",");

		function select(oNode) {
			const oResult = {};
			for (const sSelect of aSelect) {
				oResult[sSelect] = oNode[sSelect];
			}
			return oResult;
		}

		const oMessage = {};
		if ("$count" in mQueryOptions) {
			oMessage["@odata.count"] = "" + aRows.length;
		}
		const iSkip = "$skip" in mQueryOptions ? parseInt(mQueryOptions.$skip) : 0;
		const iTop = "$top" in mQueryOptions ? parseInt(mQueryOptions.$top) : Infinity;
		oMessage.value = SandboxModel.update(aRows.slice(iSkip, iSkip + iTop).map(select), true);
		oResponse.message = JSON.stringify(oMessage);
	}

	/**
	 * Returns the hierarchy's top levels in preorder.
	 *
	 * @param {number} iMaxDistanceFromRoot - Maximum distance from root to include
	 * @returns {object[]} - List of node objects in preorder
	 */
	function topLevels(iMaxDistanceFromRoot) {
		function limitedDescendantCount(oNode) {
			const aChildren = oNode.DistanceFromRoot < iMaxDistanceFromRoot
				? mChildrenByParentId[oNode.ID] || [] // "expanded"
				: [];

			return aChildren.reduce((iCount, oChild) => {
				return iCount + limitedDescendantCount(oChild);
			}, aChildren.length);
		}

		return aAllNodes
			.filter((oNode) => oNode.DistanceFromRoot <= iMaxDistanceFromRoot)
			.map((oNode) => {
				oNode = {...oNode, DescendantCount : limitedDescendantCount(oNode)};
				if (oNode.DrillState === "collapsed"
						&& oNode.DistanceFromRoot < iMaxDistanceFromRoot) {
					oNode.DrillState = "expanded";
				}
				return oNode;
			});
	}

	SandboxModel.getChildren = function (sParentId, iSkip = 0, iTop = Infinity) {
		return mChildrenByParentId[sParentId].slice(iSkip, iSkip + iTop)
			.map((oNode) => ({...oNode})); // return clones only!
	};
	SandboxModel.getTopLevels = function (iLevels, iSkip = 0, iTop = Infinity) {
		return topLevels(iLevels - 1).slice(iSkip, iSkip + iTop);
	};
	SandboxModel.reset = reset;

	/**
	 * Returns a copy of the given nodes, updated to the current revision.
	 *
	 * @param {object[]} aNodes
	 *   A list of (original or updated) nodes, might include <code>null</code> values
	 * @param {boolean} [bSkipCopy]
	 *   Whether "copy on write" may safely be skipped
	 * @returns {object[]}
	 *   An updated copy
	 */
	SandboxModel.update = function (aNodes, bSkipCopy = false) {
		return aNodes.map((oNode) => {
			if (oNode && (iRevision || mRevisionOfAgeById[oNode.ID])) {
				if (!bSkipCopy) {
					oNode = {...oNode};
				}
				if ("Name" in oNode) {
					oNode.Name = oNode.Name.split(" #")[0] + " #" + iRevision;
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
