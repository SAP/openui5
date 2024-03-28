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
						regExp : /^DELETE \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES\('([^']*)'\)$/,
						response : {buildResponse : buildDeleteResponse, code : 204}
					}, {
						regExp : /^GET [\w\/.]+\$metadata([\w?&\-=]+sap-language=..|)$/,
						response : {source : "metadata.xml"}
					}, {
						regExp : /^GET \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES\?(.*)$/,
						response : {buildResponse : buildGetCollectionResponse}
					}, {
						regExp : /^GET \/sap\/opu\/odata4\/IWBEP\/TEA\/default\/IWBEP\/TEA_BUSI\/0001\/EMPLOYEES\('([^']*)'\)\?(.*)$/,
						response : {buildResponse : buildGetSingleResponse}
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

	function findLastIndex(aArray, fnPredicate) {
		return aArray.reduce((iLast, oItem, i) => (fnPredicate(oItem) ? i : iLast), -1);
	}

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
	 * Builds a response for any DELETE request on a specific "EMPLOYEE" instance.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} _oResponse - Response object to fill
	 */
	function buildDeleteResponse(aMatches, _oResponse) {
		/**
		 * Recursively visits all of the given node's descendants, deleting them in post order.
		 *
		 * @param {object} oNode - A node
		 */
		function visit(oNode) {
			const sId = oNode.ID;
			mChildrenByParentId[sId]?.forEach(visit);
			delete mChildrenByParentId[sId];
			delete mNodeById[sId];
			delete mRevisionOfAgeById[sId];
			aAllNodes.splice(aAllNodes.indexOf(oNode), 1);
		}

		const oNode = mNodeById[aMatches[1]];
		visit(oNode);
		if (oNode.MANAGER_ID) {
			const aChildren = mChildrenByParentId[oNode.MANAGER_ID];
			aChildren.splice(aChildren.indexOf(oNode), 1);
			adjustDescendantCount(oNode.MANAGER_ID, -(oNode.DescendantCount + 1));
		}
	}

	/**
	 * Builds a response for any GET query on the "EMPLOYEES" collection.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetCollectionResponse(aMatches, oResponse) {
		const mQueryOptions = getQueryOptions(aMatches[1]);
		function getExpandLevels() {
			if (mQueryOptions.$apply.includes("ExpandLevels")) {
				let sExpandLevels = mQueryOptions.$apply.match(/,ExpandLevels=(.+)\)/)[1];
				sExpandLevels = decodeURIComponent(sExpandLevels);
				return new Map(JSON.parse(sExpandLevels).map((o) => [o.NodeID, o.Levels]));
			}
		}

		if ("$apply" in mQueryOptions) {
			if (mQueryOptions.$apply.includes("TopLevels")) {
				// "EMPLOYEES?$apply=orderby(AGE)"
				// + "/com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/EMPLOYEES"
				// + ",HierarchyQualifier='OrgChart',NodeProperty='ID',Levels=" + iLevels + ")"
				// Note: "Levels" is optional!
				const iLevels = mQueryOptions.$apply.includes(",Levels=")
					? parseInt(mQueryOptions.$apply.match(/,Levels=(\d+)/)[1])
					: Infinity;
				let aRows = topLevels(iLevels - 1, getExpandLevels()); // Note: already cloned
				if ("$filter" in mQueryOptions) {
					// ID%20eq%20'1'
					const aIDs = mQueryOptions.$filter.split("%20or%20")
						.map((sID_Predicate) => sID_Predicate.split("%20eq%20")[1].slice(1, -1));
					if (aIDs.length !== 1) {
						throw new Error("Unexpected ID filter length");
					}
					aRows = aRows.filter((oNode, i) => {
						if (oNode.ID === aIDs[0]) {
							oNode.LimitedRank = "" + i; // Edm.Int64
							return true;
						}
						return false;
					});
				}
				selectCountSkipTop(aRows, mQueryOptions, oResponse);
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
			if (mQueryOptions.$select.includes("MANAGER_ID")) { // side effect for all rows
				iRevision += 1;
			} else { // side effect for single row (after PATCH of Name)
				if (aIDs.length !== 1) {
					throw new Error("Unexpected ID filter length");
				}
				mRevisionOfAgeById[aIDs[0]] += 1;
			}
			const aRows = aIDs.map((sId) => mNodeById[sId]);
			selectCountSkipTop(aRows, mQueryOptions, oResponse);
			return;
		}

		selectCountSkipTop(aAllNodes, mQueryOptions, oResponse);
	}

	/**
	 * Builds a response for any GET request on a specific "EMPLOYEE" instance.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildGetSingleResponse(aMatches, oResponse) {
		// EMPLOYEES('B')?$select=AGE,DescendantCount,DistanceFromRoot,DrillState,ID,MANAGER_ID,Name
		const aSelect = getQueryOptions(aMatches[2]).$select.split(",");
		const select = (oNode) => { //TODO share w/ selectCountSkipTop?
			const oResult = {};
			for (const sSelect of aSelect) {
				oResult[sSelect] = oNode[sSelect];
			}
			return oResult;
		};
		const oNode = select(mNodeById[aMatches[1]]);
		// RAP would not respond w/ DescendantCount,DistanceFromRoot,DrillState!
		delete oNode.DescendantCount;
		delete oNode.DistanceFromRoot;
		delete oNode.DrillState;
		// Note: bSkipCopy due to select
		oResponse.message = JSON.stringify(SandboxModel.update([oNode], true)[0]);
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
		 * Adjust the DistanceFromRoot of the given node (and all of its descendants) by the given
		 * difference.
		 *
		 * @param {object} oNode - A node
		 * @param {number} iDiff - Some difference
		 */
		function adjustDistanceFromRoot(oNode, iDiff) {
			oNode.DistanceFromRoot += iDiff;
			(mChildrenByParentId[oNode.ID] || [])
				.forEach((oChild) => { adjustDistanceFromRoot(oChild, iDiff); });
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
					?.slice("EMPLOYEES('".length, -"')".length);
				if (sParentId) {
					for (let sId = sParentId; sId; sId = mNodeById[sId].MANAGER_ID) {
						if (sId === oChild.ID) { // cycle detected
							throw new Error("Parent must not be a descendant of moved node");
						}
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
				}

				const aSpliced
					= aAllNodes.splice(aAllNodes.indexOf(oChild), oChild.DescendantCount + 1);
				let iNewIndex; // Note: "AGE determines sibling order (ascending)"
				if (sParentId) {
					if (!(sParentId in mChildrenByParentId)) {
						// new parent not a leaf anymore
						mNodeById[sParentId].DrillState = "collapsed"; // @see #reset
						mChildrenByParentId[sParentId] = [];
					}
					adjustDescendantCount(sParentId, oChild.DescendantCount + 1);
					const iLastYounger = findLastIndex(mChildrenByParentId[sParentId],
						(oSibling) => oSibling.AGE < oChild.AGE); // Note: might be -1
					mChildrenByParentId[sParentId].splice(iLastYounger + 1, 0, oChild);
					if (iLastYounger < 0) { // right after parent
						iNewIndex = aAllNodes.indexOf(mNodeById[sParentId]) + 1;
					} else { // just after last younger sibling's descendants!
						const oLastYounger = mChildrenByParentId[sParentId][iLastYounger];
						iNewIndex
							= aAllNodes.indexOf(oLastYounger) + oLastYounger.DescendantCount + 1;
					}
				} else { // find last younger root
					const iLastYounger = findLastIndex(aAllNodes,
						(oNode) => !oNode.MANAGER_ID && oNode.AGE < oChild.AGE); // might be -1
					iNewIndex = iLastYounger < 0
						? 0
						: iLastYounger + aAllNodes[iLastYounger].DescendantCount + 1;
				}
				aAllNodes.splice(iNewIndex, 0, ...aSpliced);

				oChild.MANAGER_ID = sParentId;
				const iParentDistanceFromRoot = sParentId
					? mNodeById[sParentId].DistanceFromRoot
					: 0;
				adjustDistanceFromRoot(oChild,
					iParentDistanceFromRoot + 1 - oChild.DistanceFromRoot);
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
		function parseLastSegment(sId) {
			if (sId.includes(".")) {
				sId = sId.slice(sId.lastIndexOf(".") + 1);
			}

			return parseInt(sId);
		}

		// compares two hierarchical IDs according to the last(!) segment (numerically, ascending)
		function compareByID(oNodeA, oNodeB) {
			return parseLastSegment(oNodeA.ID) - parseLastSegment(oNodeB.ID);
		}

		function isChildID(sChildID, sParentId) {
			return sChildID !== sParentId
				&& (sParentId === "0"
					? !sChildID.includes(".")
					: sChildID.startsWith(sParentId)
						&& !sChildID.slice(sParentId.length + 1).includes("."));
		}

		// {"EMPLOYEE_2_MANAGER@odata.bind" : "EMPLOYEES('0')"}
		const oBody = JSON.parse(oRequest.requestBody);
		const sParentId = oBody["EMPLOYEE_2_MANAGER@odata.bind"]
			?.slice("EMPLOYEES('".length, -"')".length);
		const oParent = mNodeById[sParentId];
		if (sParentId && !oParent) {
			throw new Error("Invalid parent ID: " + sParentId);
		}

		const oNewChild = { // same order of keys than for "old" nodes ;-)
			AGE : 0, // see below
			ID : "", // see below
			Name : "", // Q: Derive default from parent's Name? A: No, it's editable!
			DistanceFromRoot : oParent ? oParent.DistanceFromRoot + 1 : 0,
			DrillState : "leaf",
			MANAGER_ID : sParentId ?? null,
			DescendantCount : 0
		};

		if (sParentId) {
			if (sParentId in mChildrenByParentId) {
				// Note: "AGE determines sibling order (ascending)"
				oNewChild.AGE = mChildrenByParentId[sParentId][0].AGE - 1;
			} else { // parent not a leaf anymore
				oParent.DrillState = "collapsed"; // @see #reset
				mChildrenByParentId[sParentId] = [];
				oNewChild.AGE = oParent.AGE - 1;
			}

			// use "largest" child ID which is hierarchical to parent
			const sLastChildID = aAllNodes
				.filter((oChild) => isChildID(oChild.ID, sParentId))
				.sort(compareByID)
				.at(-1)?.ID;
			if (sLastChildID === undefined) {
				oNewChild.ID = sParentId + ".1";
			} else if (sParentId === "0") {
				oNewChild.ID = "" + (parseLastSegment(sLastChildID) + 1);
			} else {
				oNewChild.ID = sParentId + "." + (parseLastSegment(sLastChildID) + 1);
			}
		} else { // new root
			const iRootCount = aAllNodes.filter((oNode) => oNode.MANAGER_ID === null).length;
			oNewChild.AGE = 60 + iRootCount;
			oNewChild.ID = "0ABCDEFGHIJKLMNOPQRSTUVWXYZ"[iRootCount];
		}

		if (oNewChild.ID in mNodeById) {
			throw new Error("Illegal state: duplicate node ID " + oNewChild.ID);
		}
		aAllNodes.push(oNewChild); //TODO not good enough once we need "refresh"
		mNodeById[oNewChild.ID] = oNewChild;
		mRevisionOfAgeById[oNewChild.ID] = 0;
		if (sParentId) {
			// Note: server's insert position must not affect UI (until refresh!)
			mChildrenByParentId[sParentId].push(oNewChild);
			adjustDescendantCount(sParentId, +1);
		}

		oResponse.message = JSON.stringify(SandboxModel.update([oNewChild])[0]);
	}

	/**
	 * Gets the query options as a map from the given URL query part.
	 *
	 * @param {string} sQuery - Query part of a URL
	 * @returns {Object<string,string>} Map of query options
	 */
	function getQueryOptions(sQuery) {
		const mQueryOptions = {};
		for (const sName_Value of sQuery.split("&")) {
			const [sName, ...aValues] = sName_Value.split("=");
			mQueryOptions[sName] = aValues.join("=");
		}

		return mQueryOptions;
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
		// Note: bSkipCopy due to select
		oMessage.value = SandboxModel.update(aRows.slice(iSkip, iSkip + iTop).map(select), true);
		oResponse.message = JSON.stringify(oMessage);
	}

	/**
	 * Returns the hierarchy's top levels in preorder.
	 *
	 * @param {number} iMaxDistanceFromRoot - Maximum distance from root to include
	 * @param {Map} [oExpandLevels] - Mapping of NodeID to Levels to be expanded
	 * @returns {object[]} - List of node objects in preorder
	 */
	function topLevels(iMaxDistanceFromRoot, oExpandLevels = new Map()) {
		function isAncestorCollapsed(oNode) {
			const oParent = mNodeById[oNode.MANAGER_ID];
			if (!oParent) {
				return false;
			}
			return !isExpanded(oParent) || isAncestorCollapsed(oParent);
		}

		function isExpanded(oNode) {
			if (oExpandLevels.has(oNode.ID)) {
				return oExpandLevels.get(oNode.ID) > 0;
			}
			return oNode.DistanceFromRoot < iMaxDistanceFromRoot;
		}

		function limitedDescendantCount(oNode) {
			const aChildren = isExpanded(oNode)
				? mChildrenByParentId[oNode.ID] || [] // "expanded"
				: [];

			return aChildren.reduce((iCount, oChild) => {
				return iCount + limitedDescendantCount(oChild);
			}, aChildren.length);
		}

		return aAllNodes
			.filter((oNode) => {
				if (isAncestorCollapsed(oNode)) {
					return false; // node is not part of hierarchy if an ancestor is collapsed
				}
				if (oExpandLevels.get(oNode.MANAGER_ID) === 1) {
					return true; // node is part of hierarchy if parent is expanded
				}
				return oNode.DistanceFromRoot <= iMaxDistanceFromRoot;
			})
			.map((oNode) => {
				oNode = {...oNode, DescendantCount : limitedDescendantCount(oNode)};
				const bIsExpanded = isExpanded(oNode);
				if (oNode.DrillState === "collapsed" && bIsExpanded) {
					oNode.DrillState = "expanded";
				} else if (oNode.DrillState === "expanded" && !bIsExpanded) {
					oNode.DrillState = "collapsed";
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
