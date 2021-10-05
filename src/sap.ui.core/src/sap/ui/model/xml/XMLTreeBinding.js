/*!
 * ${copyright}
 */

// Provides the XML model implementation of a list binding
sap.ui.define(['sap/ui/model/ClientTreeBinding', "sap/base/util/each"],
	function(ClientTreeBinding, each) {
	"use strict";


	/**
	 *
	 * @class
	 * Tree binding implementation for XML format
	 *
	 * @param {sap.ui.model.xml.XMLModel} [oModel]
	 * @param {string} Path pointing to the tree or array that should be bound
	 * @param {object} [oContext] Context object for this binding
	 * @param {array} [aFilters] Predefined filters contained in an array
	 * @param {object} [mParameters] Additional model-specific parameters
	 * @protected
	 * @alias sap.ui.model.xml.XMLTreeBinding
	 * @extends sap.ui.model.ClientTreeBinding
	 */
	var XMLTreeBinding = ClientTreeBinding.extend("sap.ui.model.xml.XMLTreeBinding");

	/**
	 * Return node contexts for the tree
	 * @param {sap.ui.model.Context} oContext to use for retrieving the node contexts
	 * @param {int} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {int} iLength determines how many contexts to retrieve beginning from the start index.
	 * @return {sap.ui.model.Context[]} the contexts array
	 * @protected
	 */
	XMLTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength) {
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
		}

		var sContextPath = oContext.getPath();

		if (!sContextPath.endsWith("/")) {
			sContextPath = sContextPath + "/";
		}
		if (!sContextPath.startsWith("/")) {
			sContextPath = "/" + sContextPath;
		}

		var aContexts = [],
			mNodeIndices = {},
			that = this,
			oNode = this.oModel._getObject(oContext.getPath()),
			sChildPath, oChildContext;

		each(oNode[0].childNodes, function(sName, oChild) {
			if (oChild.nodeType == 1) { // check if node is an element
				if (mNodeIndices[oChild.nodeName] == undefined) {
					mNodeIndices[oChild.nodeName] = 0;
				} else {
					mNodeIndices[oChild.nodeName]++;
				}
				sChildPath = sContextPath + oChild.nodeName + "/" + mNodeIndices[oChild.nodeName];
				oChildContext = that.oModel.getContext(sChildPath);
				// check if there is a filter on this level applied
				if (that.oCombinedFilter && !that.bIsFiltering) {
					if (that.filterInfo.aFilteredContexts
							&& that.filterInfo.aFilteredContexts.indexOf(oChildContext) != -1) {
						aContexts.push(oChildContext);
					}
				} else {
					aContexts.push(oChildContext);
				}
			}
		});

		this._applySorter(aContexts);
		this._setLengthCache(sContextPath, aContexts.length);

		return aContexts.slice(iStartIndex, iStartIndex + iLength);
	};

	return XMLTreeBinding;

});