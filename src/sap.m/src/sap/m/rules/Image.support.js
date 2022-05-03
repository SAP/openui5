/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Image control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application


	//**********************************************************
	// Utils
	//**********************************************************
	var HIGH_DENSITIES = [1.5, 2], // these are the densities mostly expected to be supported by the app (3x and 4x will be skipped to avoid too many requests that prolong the check)
		REQUEST_TIMEOUT = 3000; //ms

	function downloadHighDensityImage(oImage, iDensity) {

		return new Promise(function(resolve, reject) {

			var sSrc = oImage.getSrc(),
				sDensityAwareSrc = oImage._generateSrcByDensity(sSrc, iDensity),
				oDomElement = document.createElement("IMG"),
				bDone = false;

			// check src availability using src property of a dummy dom element
			// to avoid making AJAX request (may be forbidden if conflicts with CORS)
			oDomElement.setAttribute("src", sDensityAwareSrc);
			oDomElement.style.position = "absolute";
			oDomElement.style.left = "-10000px";
			oDomElement.style.top = "-10000px";

			function onLoad() {
				cleanup();
				resolve(true);
			}

			function onError() {
				cleanup();
				resolve(false);
			}

			function cleanup() {
				if (oDomElement && oDomElement.parentNode !== null) { // allow this element and its attached listeners be picked up by the GC
					oDomElement.parentNode.removeChild(oDomElement);
				}
				bDone = true;
			}

			oDomElement.addEventListener("load", onLoad);
			oDomElement.addEventListener("error", onError);
			document.body.appendChild(oDomElement);

			// ensure check is completed even if none of the events are called
			// (e.g. iOS may not fire load for an already loaded and cached image)
			setTimeout(function() {
				if (!bDone) {
					reject(); // densityAwareSrc availability is not confirmed
				}
			}, REQUEST_TIMEOUT);

		});
	}

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Checks if the <code>densityAware</code> property of <code>sap.m.Image</code> is enabled when density-perfect image version exists
	 */
	var oImageRule = {
		id : "densityAwareImage",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		async: true,
		minversion: "1.60",
		title: "Image: Density awareness disabled",
		description: "We checked that your application provides high-density version(s) of the listed image(s). "
					+ "However, the high-density version(s) will be ignored, because the \"densityAware\" property of this image is disabled. "
					+ "Since UI5 1.60, the \"densityAware\" property is no longer enabled by default. You need to enable it explicitly.",
		resolution: "Enable the \"densityAware\" property of this image control",
		resolutionurls: [{
			text: "API Refrence for sap.m.Image",
			href: "https://openui5.hana.ondemand.com/api/sap.m.Image"
		}],
		check: function (oIssueManager, oCoreFacade, oScope, fnResolve) {

			var aAsyncTasks = [],
				aIssuedImageIds = [],
				oTask,
				sImageId,
				sImageName;

			oScope.getElementsByClassName("sap.m.Image")
				.forEach(function(oImage) {
					if (!oImage.getDensityAware()) {

						HIGH_DENSITIES.forEach(function(iDensity) {

							oTask = downloadHighDensityImage(oImage, iDensity);

							aAsyncTasks.push(oTask);

							oTask.then(function(bSuccess) {
								if (!bSuccess) {
									return;
								}

								sImageId = oImage.getId();

								if (aIssuedImageIds.indexOf(sImageId) > -1) {
									return; // already issued warning for this image
								}

								aIssuedImageIds.push(sImageId);

								sImageName = oImage.getMetadata().getElementName();

								oIssueManager.addIssue({
									severity: Severity.Low,
									details: "Image '" + sImageName + "' (" + sImageId + ") has 'densityAware' disabled even though high-density version is also available",
									context: {
										id: sImageId
									}
								});
							})
							.catch(function() {
								// ignore as only the cases of successful executions are of interest to this rule
							});
						});
					}
				});

			Promise.all(aAsyncTasks).then(fnResolve);
		}
	};

	return [oImageRule];

}, true);
