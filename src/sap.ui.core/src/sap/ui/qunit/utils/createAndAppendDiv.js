/*!
 * ${copyright}
 */
sap.ui.define(function(){
	"use strict";

	/**
	 * Creates and appends div element to document body.
	 *
	 * @param {string|Array} vId Node ID or IDs of the HTML element(s) added to the DOM.
	 * @param {Element} [oRootNode=document.body] node used as parent to add nodes
	 * @example
	 * <body>
	 *   <div id="test1">
	 *     <div id="test2"></div>
	 *   </div>
	 * </body>
	 * createAndAppendDiv("test2", createAndAppendDiv("test1"));
	 *
	 * <body>
	 *   <div id="test1"></div>
	 *   <div id="test2"></div>
	 * </body>
	 * createAndAppendDiv(["test1", "test2"])
	 *
	 * @returns {Element|Array} Created DOM node(s).
	 */
	var createAndAppendDiv = function(vId, oRootNode){
		if (!Array.isArray(vId)) {
			return createAndAppendDiv([vId], oRootNode)[0];
		}

		oRootNode = oRootNode || document.body;

		return vId.map(function(sId) {
			var elem = document.createElement("div");
			elem.id = sId;
			return oRootNode.appendChild(elem);
		});
	};

	return createAndAppendDiv;
});


