/*!
 * ${copyright}
 */

sap.ui.define([],
function() {
	"use strict";

	var HighlighterUtil = {};

	/**
	 * STATIC MEMBERS for HighlighterUtil object
	 */

	HighlighterUtil.CURRENTLY_HIGHLIGHTED_DOM_REFS = [];  //DOM Reference
	HighlighterUtil.MUTATION_OBSERVER = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver; //Available MutationObserver

	var Highlighter = function Highlighter (oDomRef, oConfig) {
		// If we try to instantiate Highlighter instance for DOM ref, for which we already
		// have an instance - we throw an error
		if (HighlighterUtil.CURRENTLY_HIGHLIGHTED_DOM_REFS.indexOf(oDomRef) === -1) {
			HighlighterUtil.CURRENTLY_HIGHLIGHTED_DOM_REFS.forEach(function (oDom) {
				if (this._bIsDomNodeDescendant(oDomRef, oDom)) {
					throw new Error("Desired DOM Ref is parent of DOM Ref which is being highlighted.");
				} else if (this._bIsDomNodeDescendant(oDom, oDomRef)) {
					throw new Error("Desired DOM Ref is child of DOM Ref which is being highlighted.");
				}
			}, this);
			HighlighterUtil.CURRENTLY_HIGHLIGHTED_DOM_REFS.push(oDomRef);
		} else {
			throw new Error("Highlighter instance is already created for this DOM Reference");
		}

		// TODO Consider Chrome configuration where the highlight treats multiple queries as a single string
		this._bIsCaseSensitive = !!oConfig.isCaseSensitive; // default is false
		this._aPreviouslyHighlightedNodes = [];
		this._aPreviouslyOriginalNodes = [];
		this._aOldTerms = [];
		this._aRegExTerms = [];
		this._bUseExternalStyles = !!oConfig.useExternalStyles; // default is false
		this._oDomRef = oDomRef;
		this._oObserver = null;

		if (oConfig.shouldBeObserved) {
			this._addMutationObserver();
		}
	};

	Highlighter.prototype.highlight = function (sTerms) {
		var aTerms;

		if (!sTerms) {
			this._restorePreviouslyHighlightedNodes();
			this._aRegExTerms = [];
			return;
		}

		aTerms = this._formatTerms(sTerms);
		if (!aTerms || !aTerms.length || this._isNewTermsSameAsOld(aTerms)) {
			return;
		}

		this._aOldTerms = aTerms;
		this._cacheRegExTerms();

		if (this._aPreviouslyHighlightedNodes && this._aPreviouslyHighlightedNodes.length > 0) {
			this._restorePreviouslyHighlightedNodes();
		}

		this._toggleMutationObserver(false);
		this._highlightSubTree(this._oDomRef);
		this._toggleMutationObserver(true);
	};

	Highlighter.prototype._cacheRegExTerms = function () {
		var oRegEx;
		this._aRegExTerms = [];

		this._aOldTerms.forEach(function(sTerm) {
			// We escape any special RegExp character with '\' in front of it.
			sTerm = this._escapeRegExp(sTerm);

			oRegEx = this._bIsCaseSensitive ? new RegExp(sTerm, "g") : new RegExp(sTerm, "gi");
			this._aRegExTerms.push(oRegEx);
		}, this);
	};

	Highlighter.prototype._escapeRegExp = function (sText) {
		return sText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	};

	Highlighter.prototype._isNewTermsSameAsOld = function (aTerms) {
		var iOldQueryLength = this._aOldTerms.length, i;

		if (iOldQueryLength !== aTerms.length) {
			return false;
		}

		for (i = 0; i < iOldQueryLength; i++) {
			if (this._aOldTerms[i] !== aTerms[i]) {
				return false;
			}
		}

		return true;
	};

	Highlighter.prototype._highlightSubTree = function (oRootNode) {
		var oNode,
			i;

		for (i = 0; i < oRootNode.childNodes.length; i++) {
			oNode = oRootNode.childNodes[i];
			this._processNode(oNode);
		}
	};

	Highlighter.prototype._processNode = function (oNode) {
		var sText, oRegEx, i, j, oMatches, sCurrentMatch,
			oCurrentMatch, aBlockedIndices, iCurrMatchIndex;

		if (oNode.nodeName === "IFRAME") {
			this._highlightSubTree(oNode.contentDocument.body);
			return;
		}

		if (oNode.nodeType === document.ELEMENT_NODE) {
			this._highlightSubTree(oNode);

		} else if (oNode.nodeType === document.TEXT_NODE) {
			sText = oNode.data;
			oMatches = Object.create(null); // Object containing matched queries and their indices.
			aBlockedIndices = []; // Array which serves for preservation of the already matched indices.

			for (i = 0; i < this._aRegExTerms.length; i++) {
				oRegEx = this._aRegExTerms[i];

				while ((oCurrentMatch = oRegEx.exec(sText)) !== null) {
					iCurrMatchIndex = oCurrentMatch["index"];

					// We check if the iCurrMatchIndex isn't part of the blocked indices.
					// If it isn't, we process the matched query and its indices. If it is, we don't.
					if (aBlockedIndices.indexOf(iCurrMatchIndex) === -1) {
						sCurrentMatch = oCurrentMatch["0"];
						oMatches[iCurrMatchIndex] = sCurrentMatch;

						// We populate the aBlockedIndices array with the iCurrMatchIndex and
						// the following indices which belong to the characters of the matched query (sCurrentMatch).
						for (j = iCurrMatchIndex; j < iCurrMatchIndex + sCurrentMatch.length; j++) {
							aBlockedIndices.push(j);
						}
					}
				}
			}

			if (Object.keys(oMatches).length !== 0) {
				sText = this._highlightTerms(oMatches, sText);
				this._replaceNode(oNode, sText);
			}
		}
	};

	Highlighter.prototype._formatTerms = function (sTerms) {
		// we remove white spaces in the beginning and the end, then
		// we split the initial terms string by white space symbol into aTerms array
		var aTerms = sTerms && sTerms.trim().split(" "),
			aUniqueTerms;

		// we push the unique strings of aTerms in the aUniqueTerms array
		aUniqueTerms = aTerms.reduce(function (accumulator, currentValue) {
			if (accumulator.indexOf(currentValue) === -1) {
				accumulator.push(currentValue);
			}
			return accumulator;
		}, []);

		// we return only the unique terms sorted in descending order by their length
		return aUniqueTerms.sort(function(a, b) {
			  return b.length - a.length;
		});
	};

	Highlighter.prototype._replaceNode = function (oNode, sHtml) {
		var oWrapper;

		if (oNode.parentNode) {
			oWrapper = document.createElement('span');
			oWrapper.innerHTML = sHtml;

			oNode.parentNode.replaceChild(oWrapper, oNode);

			// we cache which nodes are replaced with such as highlighted spans
			this._aPreviouslyHighlightedNodes.push(oWrapper); // Highlighted Node with span
			this._aPreviouslyOriginalNodes.push(oNode); // Original Node
		}
	};

	Highlighter.prototype._restorePreviouslyHighlightedNodes = function () {
		var oModifiedDomNode,
			oOriginalDomNode;

		this._toggleMutationObserver(false);

		for (var i = 0; i < this._aPreviouslyHighlightedNodes.length; i++) {
			oModifiedDomNode = this._aPreviouslyHighlightedNodes[i];
			oOriginalDomNode = this._aPreviouslyOriginalNodes[i];

			if (oModifiedDomNode.parentNode) {
				oModifiedDomNode.parentNode.replaceChild(oOriginalDomNode, oModifiedDomNode);
			}
		}

		this._aPreviouslyHighlightedNodes = [];
		this._aPreviouslyOriginalNodes = [];
		this._toggleMutationObserver(true);
	};

	Highlighter.prototype._highlightTerms = function (oMatches, sText) {
		var sOpeningTag = this._bUseExternalStyles ? '<span class="highlightedText">'
			: '<span class="defaultHighlightedText">',
			sClosingTag = '</span>',
			sCurrMatch,
			iUpdatedIndex,
			iCounter = 0,
			iIndex;

		for (iIndex in oMatches) {
			iUpdatedIndex = +iIndex + (iCounter * (sOpeningTag.length + sClosingTag.length));

			sCurrMatch = oMatches[iIndex];
			sText = sText.substring(0, iUpdatedIndex)
					+ sOpeningTag + sCurrMatch + sClosingTag
					+ sText.substring(iUpdatedIndex + sCurrMatch.length);

			iCounter++;
		}

		return sText;
	};

	Highlighter.prototype._addMutationObserver = function () {
		this._instantiateMutationObserver();
		this._toggleMutationObserver(true);

	};

	Highlighter.prototype._removeMutationObserver = function () {
		this._toggleMutationObserver(false);
		this._oObserver = null;
		this._oDomRef = null;
	};

	Highlighter.prototype._toggleMutationObserver = function (bConnect) {
		if (bConnect) {
			this._oObserver.observe(this._oDomRef, this.oObserverConfig);
		} else {
			this._oObserver.disconnect();
		}
	};

	Highlighter.prototype._bIsDomNodeDescendant = function (oParent, oChild) {
		return oParent.contains(oChild);
	};

	Highlighter.prototype._instantiateMutationObserver = function() {
		this.oObserverConfig = {
			attributes: false,
			childList: true,
			characterData: true,
			subtree: true
		};

		// instance
		this._oObserver = new HighlighterUtil.MUTATION_OBSERVER(
						this._onMutationDetectionCallback.bind(this));
	};

	Highlighter.prototype._onMutationDetectionCallback = function(aMutations) {
		var addedNodes,
			oNode;

		this._toggleMutationObserver(false);

		aMutations.forEach(function(oMutation) {
			if (oMutation.type === 'childList') {
				addedNodes = oMutation.addedNodes;
				for (var i = 0; i < addedNodes.length; i++) {
					oNode = addedNodes[i];
					this._processNode(oNode);
				}
			} else if (oMutation.type === 'characterData') {
				this._processNode(oMutation.target);
			}
		}, this);

		this._toggleMutationObserver(true);
	};

	Highlighter.prototype.destroy = function () {
		this._removeMutationObserver();
	};

	return Highlighter;

});