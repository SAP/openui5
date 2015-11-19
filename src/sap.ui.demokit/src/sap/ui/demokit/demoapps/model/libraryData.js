/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";

		// function to append custom icon font
		var fnAppendCustomFont = function(sFamilyName, sFontFile){
			var sFontFace = "@font-face {" +
				"font-family: '" + sFamilyName + "';" +
				"src: url('" + sFontFile + ".eot');" +
				"src: url('" + sFontFile + ".eot?#iefix') format('embedded-opentype'), url('" + sFontFile + ".ttf') format('truetype');" +
				"font-weight: normal;" +
				"font-style: normal;" +
				"}";
			jQuery('head').append('<style type="text/css">' + sFontFace + '</style>');
		};

		// function to load and register custom icons
		var fnLoadAndRegisterIcons = function(oDemo) {
			if (!oDemo.customIcons) {
				return;
			}
			fnAppendCustomFont("brandico", oDemo.customIcons.file);
			jQuery.sap.require("sap.ui.core.IconPool");
			for (var i = 0; i < oDemo.customIcons.icons.length; i++){
				var icon = oDemo.customIcons.icons[i];
				sap.ui.core.IconPool.addIcon(icon.name, oDemo.customIcons.namespace, "brandico", icon.id, true);
			}
		};

		// function to compute the app objects for a demo object
		var sBaseUrl = "";
		var fnGetApps = function (oDemo, sBaseUrl, sLibUrl) {
			var aApps = [];
			if (oDemo.links && oDemo.links.length > 0) {
				for (var i = 0; i < oDemo.links.length; i++) {
					var oApp = {
						lib : oDemo.text,
						name : oDemo.links[i].text,
						icon : oDemo.links[i].icon,
						desc : oDemo.links[i].desc,
						config : oDemo.links[i].config,
						ref : sBaseUrl + (oDemo.links[i].resolve === "lib" ? sLibUrl : "") + oDemo.links[i].ref
					};
					aApps.push(oApp);
				}
			}
			return aApps;
		};

		function createModelData (aLibs, oDocIndicies) {
			var oData = {
				allApps: []
			};

			for (var i = 0; i < aLibs.length; i++) {
				var oDemo = oDocIndicies[aLibs[i]].demo;
				if (!oDemo) {
					continue;
				}

				if (!jQuery.isArray(oDemo)) {
					oDemo = [oDemo];
				}
				for (var j = 0; j < oDemo.length; j++) {
					fnLoadAndRegisterIcons(oDemo[j]);
					var aApps = fnGetApps(oDemo[j], sBaseUrl, oDocIndicies[aLibs[i]].libraryUrl);
					oData.allApps = oData.allApps.concat(aApps);
				}
			}

			oData.allApps.push({
				lib : "",
				name : "Downloads",
				icon : "download",
				desc : "Download our demoapps",
				ref : "DOWNLOAD"
			});
			return oData;
		}

		return {
			fillJSONModel: function (oModel) {
				function fnHandleLibInfoLoaded  (aLibs, oDocIndicies) {
					if (!aLibs) {
						return;
					}

					// set model
					var oModelData = oModel.getData();
					oModel.setData(jQuery.extend(oModelData, createModelData(aLibs, oDocIndicies)));
				}

				// load and process all lib info
				sap.ui.demokit._loadAllLibInfo(sBaseUrl, "_getDocuIndex", fnHandleLibInfoLoaded);
			}
		};


	}
);
