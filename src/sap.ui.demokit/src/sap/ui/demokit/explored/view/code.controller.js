/*!
 * @copyright@
 */

/*global JSZip *///declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demokit.explored.view.code", {

		_aMockFiles : ["products.json", "supplier.json", "img.json"],

		onInit : function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this._viewData = sap.ui.getCore().byId("app").getViewData();
			this._viewData.component.codeCache = {};
		},

		onRouteMatched : function (oEvt) {

			// get params
			if (oEvt.getParameter("name") !== "code" && oEvt.getParameter("name") !== "code_file") {
				return;
			}

			this._sId = oEvt.getParameter("arguments").id;
			var sFileName = decodeURIComponent(oEvt.getParameter("arguments").fileName);

			// retrieve sample object
			var oSample = sap.ui.demokit.explored.data.samples[this._sId];
			if (!oSample) {
				this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound", "XML", false, { path: this._sId });
				return;
			}

			// cache the data to be reused
			if (!this._oData || oSample.id !== this._oData.id) {

				// get component and data when sample is changed or nothing exists so far
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
				this._oData = {
					id : oSample.id,
					title : "Code: " + oSample.name,
					name : oSample.name,
					stretch : oConfig.sample ? oConfig.sample.stretch : false,
					files : [],
					iframe : oConfig.sample.iframe,
					fileName: sFileName,
					includeInDownload: oConfig.sample.additionalDownloadFiles
				};

				// retrieve files
				// (via the 'Orcish maneuver': Use XHR to retrieve and cache code)
				if (oConfig && oConfig.sample && oConfig.sample.files) {
					var sRef = jQuery.sap.getModulePath(oSample.id);
					for (var i = 0 ; i < oConfig.sample.files.length ; i++) {
						var sFile = oConfig.sample.files[i];
						var sContent = this.fetchSourceFile(sRef, sFile);

						this._oData.files.push({
							name : sFile,
							raw : sContent,
							code : this._convertCodeToHtml(sContent)
						});
					}
				}
			} else {
				this._oData.fileName = sFileName;
			}
			// set model
			this.getView().setModel(new sap.ui.model.json.JSONModel(this._oData));

			// scroll to top of page
			var page = this.getView().byId("page");
			page.scrollTo(0);
		},

		fetchSourceFile : function (sRef, sFile) {
			var that = this;
			var sUrl = sRef + "/" + sFile;

			var fnSuccess = function (result) {
				that._viewData.component.codeCache[sUrl] = result;
			};
			var fnError = function (result) {
				that._viewData.component.codeCache[sUrl] = "not found: '" + sUrl + "'";
			};

			if (!(sUrl in this._viewData.component.codeCache)) {
				this._viewData.component.codeCache[sUrl] = "";
				jQuery.ajax(sUrl, {
					async: false,
					dataType: "text",
					success: fnSuccess,
					error: fnError
				});
			}

			return that._viewData.component.codeCache[sUrl];
		},

		onDownload : function (evt) {

			jQuery.sap.require("sap.ui.thirdparty.jszip");
			var oZipFile = new JSZip();

			// zip files
			var oData = this.getView().getModel().getData();
			for (var i = 0 ; i < oData.files.length ; i++) {
				var oFile = oData.files[i],
					sRawFileContent = oFile.raw;

				if (oFile.name === oData.iframe) {
					sRawFileContent = this._changeIframeBootstrapToCloud(sRawFileContent);
				}

				oZipFile.file(oFile.name, sRawFileContent);

				// mock files
				for (var j = 0; j < this._aMockFiles.length; j++) {
					var sMockFile = this._aMockFiles[j];
					if (oFile.raw.indexOf(sMockFile) > -1){
						oZipFile.file("mockdata/" + sMockFile, this.downloadMockFile(sMockFile));
					}
				}
			}

			var sRef = jQuery.sap.getModulePath(this._sId),
				aExtraFiles = oData.includeInDownload || [],
				that = this;
			oZipFile.file("Component.js", this.fetchSourceFile(sRef, "Component.js"));

			if (!oData.iframe) {
				oZipFile.file("index.html", this.createIndexFile(oData));
			}

			// add extra download files
			aExtraFiles.forEach(function(sFileName, index) {
				oZipFile.file(sFileName, that.fetchSourceFile(sRef, sFileName));
			});

			var oContent = oZipFile.generate({type:"blob"});

			this._openGeneratedFile(oContent);
		},

		_openGeneratedFile : function (oContent) {
			jQuery.sap.require("sap.ui.core.util.File");
			sap.ui.core.util.File.save(oContent, this._sId, "zip", "application/zip");
		},

		createIndexFile : function(oData) {

			var sHeight,
				bScrolling;

			var sRef = jQuery.sap.getModulePath("sap.ui.demokit.explored.tmpl");
			var sIndexFile = this.fetchSourceFile(sRef, "index.html.tmpl");

			sIndexFile = sIndexFile.replace(/{{TITLE}}/g, oData.name);
			sIndexFile = sIndexFile.replace(/{{SAMPLE_ID}}/g, oData.id);

			sHeight = oData.stretch ? 'height : "100%", ' : "";
			sIndexFile = sIndexFile.replace(/{{HEIGHT}}/g, sHeight);

			bScrolling = !oData.stretch;
			sIndexFile = sIndexFile.replace(/{{SCROLLING}}/g, bScrolling);

			return sIndexFile;
		},

		downloadMockFile : function(sFile) {

			var sRef = jQuery.sap.getModulePath("sap.ui.demo.mock");
			var sWrongPath = "test-resources/sap/ui/demokit/explored/img/";
			var sCorrectPath = "https://openui5.hana.ondemand.com/test-resources/sap/ui/demokit/explored/img/";
			var oRegExp = new RegExp(sWrongPath,"g");
			var sMockData = this.fetchSourceFile(sRef, sFile);

			if (sMockData) {
				sMockData = sMockData.replace(oRegExp, sCorrectPath);
			}

			return sMockData;
		},

		onNavBack : function () {
			this.router.navTo("sample", { id : this._sId }, true);
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

			return code;
		},

		_changeIframeBootstrapToCloud : function (sRawIndexFileHtml) {
			var rReplaceIndex = /src=["|']([^"|^']*sap-ui-core\.js)["|']/;
			return sRawIndexFileHtml.replace(rReplaceIndex, 'src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"');
		},

		handleTabSelectEvent: function(oEvent) {
			var sFileName = oEvent.getParameter("selectedKey");
			this.router.navTo("code_file", {
				id : this._sId,
				fileName: encodeURIComponent(sFileName)
			}, false);
		}


	});

}, /* export= */true);
