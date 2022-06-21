sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/thirdparty/jquery",
	"sap/ui/VersionInfo"
], function(Log, isEmptyObject, jQuery, VersionInfo) {
	"use strict";

	function byId(sId) {
		return document.getElementById(sId);
	}

	function appendOption(sTargetId, sValue, sCaption) {
		var oOption = document.createElement("option");
		oOption.setAttribute("value", sValue);
		oOption.textContent = sCaption || sValue;
		byId(sTargetId).appendChild(oOption);
	}

	function checkFilter(sFilterValue, sLib, sControl, sComp) {
		sFilterValue = sFilterValue.trim().toLowerCase();

		return (
			!sFilterValue
			|| sLib && sLib.toLowerCase().includes(sFilterValue)
			|| sControl && sControl.toLowerCase().includes(sFilterValue)
			|| sComp && sComp.toLowerCase().includes(sFilterValue)
		);
	}

	function buildURL(sRoot, sRelativeUrl, mParams) {
		var oUrl = new URL(sRelativeUrl, sRoot);
		for (var sParam in mParams) {
			oUrl.searchParams.append(sParam, mParams[sParam]);
		}
		return oUrl.href;
	}

	function renderTests(aBuffer, oLibInfo, mParams, bAllLibs, sFilterValue) {
		for (var i = 0; i < oLibInfo.tests.length; i++) {
			if (checkFilter(sFilterValue, oLibInfo.name, oLibInfo.tests[i].control, oLibInfo.tests[i].appComponent)) {
				aBuffer.push("<tr>");
				if (bAllLibs) {
					aBuffer.push("<td>", oLibInfo.name,"</td>");
				}
				aBuffer.push("<td>", oLibInfo.tests[i].control,"</td>");
				aBuffer.push("<td><a href='", buildURL(oLibInfo.root, oLibInfo.tests[i].url, mParams), "' target='_blank' rel='noopener noreferrer'>", oLibInfo.tests[i].name || "Testpage" ,"</a></td>");
				aBuffer.push("<td>", oLibInfo.tests[i].appComponent || "", "</td>");
				aBuffer.push("<td>", oLibInfo.tests[i].desc || "", "</td></tr>");
			}
		}
	}

	function onChange() {
		var sLib = byId("lib").value;
		var bAllLibs = sLib == "ALL";

		byId("title").textContent = document.title =
			sOriginalTitle + (sLib ? (" - " + (bAllLibs ? "All Libraries" : sLib)) : "");

		var sFilter = byId("filter").value || "";
		var sTheme = byId("theme").value;
		var bRTL = byId("rtl").checked;

		var mParams = {
			"sap-ui-language": "en",
			"sap-ui-theme": sTheme,
			"sap-ui-rtl": "" + bRTL
		};

		var aBuffer = [];

		aBuffer.push("<table id='tests' cellspacing='0'><thead><tr>");
		if (bAllLibs) {
			aBuffer.push("<th>Library</th>");
		}
		aBuffer.push("<th>Control</th><th>Link</th><th>Application Component</th><th>Further Information</th></tr></thead><tbody>");

		if (bAllLibs) {
			for (var lib in oData) {
				renderTests(aBuffer, oData[lib], mParams, true, sFilter);
			}
		} else {
			renderTests(aBuffer, oData[sLib], mParams, false, sFilter);
		}

		aBuffer.push("</tbody></table>");

		byId("content").innerHTML = aBuffer.join("");
	}

	function collectTestInfo(){
		return VersionInfo.load()
			.then(function(oVersionInfo) {
				// convert version info to a unique array of library names
				return oVersionInfo.libraries.reduce(function(aResult, oLib) {
					var sLib = oLib.name;
					if (!aResult.includes(sLib)) {
						aResult.push(sLib);
					}
					return aResult;
				}, []);
			})
			.then(function(aLibs) {
				// fetch test info for each library
				return aLibs.map(function(sLib) {
					var sPath = sap.ui.require.toUrl(sLib.replace(/\./g, "/"));
					sPath = sPath.replace("resources", "test-resources");

					return Promise.resolve(
						jQuery.ajax(sPath + "/acc/index.json", { dataType: "json" })
					).then(function(oResponse) {
						oData[sLib] = {
							name : sLib,
							root : new URL(sPath + "/acc/", document.baseURI).href,
							tests : oResponse && oResponse.tests || []
						};
					}, function(jqXHR) {
						if ( jqXHR.status !== 404 ) {
							Log.warning("Problem while loading acc test info for lib '" + sLib + "': "
								+ jqXHR.status + " - " + jqXHR.statusText);
						}
					});
				});
			})
			.then(function(aPromises) {
				return Promise.all(aPromises);
			});
	}

	function renderUI() {
		if ( isEmptyObject(oData) ) {
			byId("message").classList.add("Error");
			byId("message").textContent = "No libraries found!";
			return;
		}

		appendOption("lib", "ALL");
		for (var lib in oData) {
			appendOption("lib", lib);
		}

		Object.keys(mThemes).forEach(function (sKey) {
			appendOption("theme", sKey, mThemes[sKey]);
		});

		byId("lib").addEventListener("change", onChange);
		byId("theme").addEventListener("change", onChange);
		byId("rtl").addEventListener("change", onChange);
		byId("filter").addEventListener("change", onChange);

		onChange();
		byId("message").style.display = "none";
		byId("bar").classList.remove("hidden");
		byId("content").classList.remove("hidden");
	}

	var oData = Object.create(null);
	var mThemes = {
		"sap_horizon": "Morning Horizon (Light)",
		"sap_horizon_dark": "Evening Horizon (Dark)",
		"sap_horizon_hcb": "Horizon High Contrast Black",
		"sap_horizon_hcw": "Horizon High Contrast White",
		"sap_fiori_3": "Quartz Light",
		"sap_fiori_3_dark": "Quartz Dark",
		"sap_fiori_3_hcb": "Quartz High Contrast Black",
		"sap_fiori_3_hcw": "Quartz High Contrast White",
		"sap_belize": "Belize",
		"sap_belize_plus": "Belize Deep",
		"sap_belize_hcb": "Belize High Contrast Black",
		"sap_belize_hcw": "Belize High Contrast White",
		"sap_bluecrystal": "SAP BlueCrystal",
		"sap_hcb": "SAP HCB"
	};

	var sOriginalTitle = document.title = byId("title").textContent;

	collectTestInfo().then(renderUI);
});

