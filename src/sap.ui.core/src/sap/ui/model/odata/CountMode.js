/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides enumeration sap.ui.model.CountMode
sap.ui.define(function() {
	"use strict";


	/**
	 * Different modes for retrieving the count of collections.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.odata.CountMode
	 * @see sap.ui.model.ODataModel#bindList
	 * @see sap.ui.model.ODataModel#constructor
	 * @see sap.ui.model.v2.ODataModel#bindList
	 * @see sap.ui.model.v2.ODataModel#constructor
	 */
	var CountMode = {
	 /**
	  * Count is retrieved by sending a separate <code>$count</code> request before requesting data.
	  *
	  * It depends on the concrete model implementation whether and how the <code>$count</code> request
	  * and the data request are synchronized.
	  * @public
	  */
	 Request: "Request",

	 /**
	  * Count is retrieved by adding <code>$inlinecount=allpages</code> to data requests
	  * as long as no count has been determined yet.
	  * @public
	  */
	 Inline: "Inline",

	 /**
	  * Count is retrieved by adding <code>$inlinecount=allpages</code> to every data request.
	  * @public
	  */
	 InlineRepeat: "InlineRepeat",

	 /**
	  * Count is not requested from the server.
	  * @public
	  */
	 None: "None"
	};

	return CountMode;

}, /* bExport= */ true);
