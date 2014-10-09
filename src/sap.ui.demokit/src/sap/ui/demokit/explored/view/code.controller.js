/*!
 * @copyright@
 */

/*global JSZip *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.controller("sap.ui.demokit.explored.view.code", {

	onInit : function () {
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
		this.router.attachRoutePatternMatched(this.onRouteMatched, this);
		this._viewData = sap.ui.getCore().byId("app").getViewData();
		this._viewData.component.codeCache = {};
	},

	onRouteMatched : function (oEvt) {

		// get params
		if (oEvt.getParameter("name") !== "code") {
			return;
		}

		this._sId = oEvt.getParameter("arguments").id;

		// retrieve sample object
		var oSample = sap.ui.demokit.explored.data.samples[this._sId];
		if (!oSample) {
			this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound", "XML", false, { path: this._sId });
			return;
		}

		// get component
		var sCompId = 'sampleComp-' + this._sId;
		var sCompName = this._sId;
		var oComp = sap.ui.component(sCompId);
		if (!oComp) {
			oComp = sap.ui.getCore().createComponent({
				id : sCompId,
				name : sCompName
			});
		}
		
		// create data object
		var oMetadata = oComp.getMetadata();
		var oConfig = (oMetadata) ? oMetadata.getConfig() : null;
		var oData = {
			title : "Code: " + oSample.name,
			files : []
		};
		
		// retrieve files
		// (via the 'Orcish maneuver': Use XHR to retrieve and cache code)
		var that = this;
		var fnSuccess = function (result) {
			that._viewData.component.codeCache[sUrl] = result;
		};
		var fnError = function (result) {
			that._viewData.component.codeCache[sUrl] = "not found: '" + sUrl + "'";
		};
		if (oConfig && oConfig.sample && oConfig.sample.files) {
			var sRef = jQuery.sap.getModulePath(oSample.id);
			for (var i = 0 ; i < oConfig.sample.files.length ; i++) {
				var sFile = oConfig.sample.files[i];
				var sUrl = sRef + "/" + sFile;
				if (! (sUrl in this._viewData.component.codeCache)) {
					this._viewData.component.codeCache[sUrl] = "";
					jQuery.ajax(sUrl, {
						async: false,
						dataType: "text",
						success: fnSuccess,
						error: fnError
					});
				}
				oData.files.push({
					name : sFile,
					raw : that._viewData.component.codeCache[sUrl],
					code : this._convertCodeToHtml(that._viewData.component.codeCache[sUrl])
				});
			}
		}
		
		// set model
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData));
		
		// scroll to top of page
		var page = this.getView().byId("page");
		page.scrollTo(0);
	},
	
	onDownload : function (evt) {
		
		jQuery.sap.require("sap.ui.thirdparty.jszip");
		var ozipFile = new JSZip();
		
		// zip files
		var data = this.getView().getModel().getData();
		for (var i = 0 ; i < data.files.length ; i++) {
			var oFile = data.files[i];
			ozipFile.file(oFile.name, oFile.raw);
		}
		var oContent = ozipFile.generate();

		location.href = "data:application/zip;base64," + oContent;
	},

	onNavBack : function () {
		this.router.myNavBack("sample", { id : this._sId }, true);
	},

	/**
	 * 
	 */
	_convertCodeToHtml : function (code) {

		jQuery.sap.require("jquery.sap.encoder");

		code = code.toString();

		// Get rid of function around code
		code = code.replace(/^function.+{/, "");

		//code = code.replace(/return \[[\s\S]*/, "");
		code = code.replace(/}[!}]*$/, "");

		// Get rid of unwanted code if CODESNIP tags are used
		code = code.replace(/^[\n\s\S]*\/\/\s*CODESNIP_START\n/, "");
		code = code.replace(/\/\/\s*CODESNIP_END[\n\s\S]*$/, "");

		// Improve indentation for display
		code = code.replace(/\t/g, "  ");

		return '<pre><code>' + jQuery.sap.encodeHTML(code) + '</code></pre>';
	}
});