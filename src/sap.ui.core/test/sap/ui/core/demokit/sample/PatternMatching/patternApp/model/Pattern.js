jQuery.sap.declare("patternApp.model.Pattern");

sap.ui.model.json.JSONModel.extend("patternApp.model.Pattern", {

	constructor: function (oRouter) {
		var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();

		this._oPatternData = {
			sampleRoutes: [
				{
					pattern: "Product/5/Detail/3",
					description: "Supplies the two mandatory parameters"
				},
				{
					pattern: "Product",
					description: "Matches the optional routes"
				},
				{
					pattern: "Product/5",
					description: "Matches the optional routes too"
				},
				{
					pattern: "Product?price=desc&category=notebook",
					description: "Prodvides key value pairs"
				},
				{
					pattern: "anything",
					description: "will match the all variable"
				}
			]
		};
		this._aPatterns = [];
		this._oPatternData.patterns = this._aPatterns;
		this._oRouter = oRouter;

		sap.ui.model.json.JSONModel.call(this, this._oPatternData);

		// create samples with all kind of patterns
		this.addPattern("product/{MandatoryProductId}/detail/{DetailId}");
		this.addPattern("product/:OptionalProductId:");
		this.addPattern("product:?OptionalQueryString:");
		this.addPattern(":*all:");

		this._oPatternData.currentHash = oHashChanger.getHash();
		oHashChanger.attachEvent("hashChanged", this._onHashChanged, this);
	},

	/**
	 * Adds a pattern to the router and to the model's pattern array.
	 * @public
	 * @function
	 * @param {string} sPattern the pattern of the route
	 */
	addPattern: function (sPattern) {
		var iPosition = this._aPatterns.length,
			sName = jQuery.sap.uid();

		this._aPatterns.push({pattern : sPattern, matched : false, parameters: "Did not match!"});

		this._oRouter.addRoute({
			pattern: sPattern,
			name : sName,
			greedy: true
		});

		this._oRouter.getRoute(sName).attachMatched(function(oEvent) {
			this._aPatterns[iPosition].matched = true;
			this._aPatterns[iPosition].parameters = window.JSON.stringify(oEvent.getParameter("arguments"));
			this.setData(this._oPatternData);
		}, this);

		this.setData(this._oPatternData);
	},

	/**
	 * Sets all patterns to not matched and also resets the parameters text
	 * @public
	 * @function
	 */
	resetMatched: function () {
		this._aPatterns.forEach(function (oEntry) {
			oEntry.matched = false;
			oEntry.parameters = "Did not match!";
		});
	},

	_onHashChanged : function (oEvent) {
		this._oPatternData.currentHash = oEvent.getParameter("newHash");
		this.setData(this._oPatternData);
	}

});