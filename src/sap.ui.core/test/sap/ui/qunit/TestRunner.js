(function(window, undefined) {

	/*
	 * Simulate the JSUnit Testsuite to collect the available
	 * test pages per Suite
	 */
	window.jsUnitTestSuite = function() {};
	window.jsUnitTestSuite.prototype.getTestPages = function() {
		return this.aPages;
	};
	window.jsUnitTestSuite.prototype.addTestPage = function(sTestPage) {
		this.aPages = this.aPages || [];
		// in case of running in the root context the testsuites right now
		// generate an invalid URL because it assumes that test-resources is 
		// the context path - this section makes sure to remove the duplicate
		// test-resources segments in the path
		if (sTestPage.indexOf("/test-resources/test-resources") === 0) {
			sTestPage = sTestPage.substr("/test-resources".length);
		}
		this.aPages.push(sTestPage);
	};
	
	/*
	 * Template for test results
	 */
	var sResultsTemplate = "{{#tests}}" +
							"<div class=\"testResult {{outcome}}\">" +
								"<p>{{header}}</p>" +
									"<ol style=\"display: none\">" +
									"{{#results}}" +
										"<li class=\"{{result.sLiClass}} test\">" +
											"<p style=\"display: inline\">{{result.TestName}} ({{result.Failed}} ,{{result.Passed}} ,{{result.All}}) </p>" +
											"<a href=\"{{result.rerunlink}}\"> Rerun</a>"+
											"<ol>"+
											"{{#result.testmessages}}"+
												"<li class=\"{{classname}} check\">{{message}}" +
												"<br>{{expected}}"+
												"<br>{{actual}}"+
												"<br>{{diff}}"+
												"<br>{{source}}"+
												"</li>"+
											"{{/result.testmessages}}"+
											"</ol>"+
										"</li>" +
									"{{/results}}" +
									"</ol>" +
							"</div>" +
						"{{/tests}}";
	
	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage - also it returns the coverage
	 * results.
	 */
	window.sap = window.sap || {};
	window.sap.ui = window.sap.ui || {};
	window.sap.ui.qunit = window.sap.ui.qunit || {};
	window.sap.ui.qunit.TestRunner = {
		
		checkTestPage: function(sTestPage) {
			
			var oDeferred = jQuery.Deferred();
			
			if (typeof sTestPage !== "string") {
				window.console.log("QUnit: invalid test page specified");
				return;
			}
			
			if (window.console && typeof window.console.log === "function") {
				window.console.log("QUnit: checking test page: " + sTestPage);
			}
			
			// check for an existing test page and check for test suite or page
			var that = this;
			jQuery.get(sTestPage).done(function(sData) {
				if (/(window\.suite\s*=|function\s*suite\s*\(\s*\)\s*{)/g.test(sData)) {
					var $frame = jQuery("<iframe>");
					$frame.css("display", "none");
					$frame.one("load", function() {
						that.findTestPages(this).done(function(aTestPages) {
							oDeferred.resolve(aTestPages);
						});
						jQuery(this).remove();
					});
					$frame.attr("src", sTestPage);
					$frame.appendTo(document.body);
				} else {
					oDeferred.resolve([sTestPage]);
				}
			}).fail(function(xhr,status,msg) {
				var text = (xhr ? xhr.status + " " : "") + (msg || status || 'unspecified error');
				if (window.console && typeof window.console.error === "function") {
					window.console.error("QUnit: failed to load page '" + sTestPage + "': " + text);
				}
				oDeferred.resolve([]);
			});
			
			return oDeferred.promise();
			
		},
		
		findTestPages: function(oIFrame) {
			
			var oDeferred = jQuery.Deferred();
			try {
				
				var oSuite = oIFrame.contentWindow.suite();
				var aPages = oSuite.getTestPages() || [];
				
				var aTestPagePromises = [];
				for (var i = 0, l = aPages.length; i < l; i++) {
					var sTestPage = aPages[i];
					aTestPagePromises.push(this.checkTestPage(sTestPage));
				}
				
				if (aTestPagePromises.length > 0) {
					jQuery.when.apply(jQuery, aTestPagePromises).then(function() {
						var aTestPages = [];
						var aArgs = Array.prototype.slice.apply(arguments);
						for (var i = 0, l = aArgs.length; i < l; i++) {
							aTestPages = aTestPages.concat(aArgs[i]);
						}
						oDeferred.resolve(aTestPages);
					});
				} else {
					oDeferred.resolve([]);
				}
				
			} catch (ex) {
				if (window.console && typeof window.console.error === "function") {
					window.console.error("QUnit: error while analyzing test page '" + oIFrame.src + "':\n" + ex);
					if ( ex.stack ) {
						window.console.error(ex.stack);
					}
				}
				oDeferred.resolve([]);
			}
			return oDeferred.promise();
			
		},
		
		runTests: function(aTestPages, nBarStep, bInternal) {
			
			if (!bInternal) {
				this._bStopped = false;
			}
			
			// TODO: stop testing
			
			var sTestPage = aTestPages[0];
			
			aTestPages = aTestPages.slice(1);
			
			var oDeferred = jQuery.Deferred();
			
			var that = this;
			if (sTestPage) {
				this.runTest(sTestPage, true, that).then(function(oResult) {
					var nBarwidth = parseFloat(jQuery("div#innerBar")[0].style.width, 10);
					var sNewwidth = nBarwidth + nBarStep + "%";
					jQuery("div#innerBar").width(sNewwidth);
					if (parseInt(jQuery("div#reportingHeader span.failed").text()) > 0) {
						jQuery("div#innerBar")[0].style.backgroundColor = '#ed866f';
					}
					jQuery("#selectedTests").find("option").each(function() {
						if (jQuery(this).text() === sTestPage) {
							jQuery(this).remove();
						}
					});
					return that.runTests(aTestPages, nBarStep, true);
				}).then(function() {
					oDeferred.resolve();
				});
			} else {
				oDeferred.resolve();
			}
			
			return oDeferred.promise();
			
		},
		
		runTest: function(sTestPage, bInternal, oInst) {


			if (!bInternal) {
				this._bStopped = false;
			}
			
			var oDeferred = jQuery.Deferred();
			
			if (this._bStopped) {
				
				oDeferred.reject(); 
				
			} else {
				
				// we could make this configurable
				var $frame = jQuery("<iframe>").css({
					height: "1024px",
					width: "1280px"
				});
				
				$frame.attr("src", sTestPage);
				var $framediv = jQuery("<div>").css({
					height: "400px",
					width: "100%",
					overflow: "scroll"
				});
				$frame.appendTo($framediv);
				$framediv.appendTo("div.test-execution");
				
				var tBegin = new Date();
				var fnCheckSuccess = function() {
					var doc = $frame[0].contentWindow.document;
					var oResult =doc.getElementById("qunit-testresult");
					if (oResult && jQuery(oResult).text().indexOf("completed") >= 0) {
						// extract the QUnit result
						var $testName = jQuery(doc).find("h1#qunit-header").text();
						if ($testName == " ") {
							$testName = "QUnit page for " + oResult.baseURI.substring(oResult.baseURI.indexOf("test-resources") +15,oResult.baseURI.length);
						}

						var $results = jQuery(doc).find("ol#qunit-tests > li");
						var oContext = oInst.fnGetTestResults($testName, $results);
						var oCoverage = $frame[0].contentWindow._$blanket;
						
						// in case of coverage either merge it or set it on the _$blanket object
						if (oCoverage) {
							window._$blanket = window._$blanket || {};
							jQuery.each(oCoverage, function(sModule, aCoverageInfo) {
								if (!window._$blanket[sModule]) {
									window._$blanket[sModule] = aCoverageInfo;
								} else {
									jQuery.each(aCoverageInfo, function(iIndex, iCount) {
										window._$blanket[sModule][iIndex] += iCount;
									});
								}
							});
						}

						$frame[0].src = "about:blank";
						$framediv.remove();

						var fnTemplate = Handlebars.compile(sResultsTemplate);
						var sHTML = fnTemplate(oContext);
						$testResult = jQuery(sHTML);
						jQuery($testResult[0].children[0]).click(function() {
							jQuery(this.nextSibling).toggle();
						});
						jQuery($testResult[0].children[1]).find("li.test > p").click(function() {
							jQuery(this.parentElement.children[2]).toggle();
						});
						$testResult.appendTo("div.test-reporting");
						
						oDeferred.resolve();
						return;
					}
					
					if (new Date() - tBegin < 300000) {
						setTimeout(fnCheckSuccess, 100);
					} else {
						$frame[0].src = "about:blank";
						$framediv.remove();
						// TODO: set Test overview visible
						oDeferred.resolve();
						// TODO: error handling
					}
				};
				
				fnCheckSuccess();
				
			}
			
			return oDeferred.promise();
			
		},
		
		stopTests: function() {
			this._bStopped = true;
		},
		
		hasCoverage: function() {
			return !!this.getCoverage();
		},
		
		getCoverage: function() {
			return window._$blanket;
		},
		
		getTestPageUrl: function() {
			var sTestPageUrl = this.getUrlParameter("testpage");
			var sOrigin = window.location.origin ? window.location.origin : (window.location.protocol + "//" + window.location.host);
			var sContextPath = window.location.href.substr(sOrigin.length);
			sContextPath = sContextPath.substring(0, sContextPath.indexOf("/test-resources/sap/ui/qunit/testrunner.html"));
			return sTestPageUrl || sContextPath + "/test-resources/qunit/testsuite.qunit.html";
		},
		
		getAutoStart: function() {
			var sAutoStart = this.getUrlParameter("autostart");
			return sAutoStart == "true";
		},
		
		getUrlParameter: function(sName) {
			var sTestPageUrlParam = window.location.search.substring(1),
				aUrlParameters = sTestPageUrlParam.split("&"),
				aParameter;
			for (var i = 0; i < aUrlParameters.length; i++) {
				aParameter = aUrlParameters[i].split("=");
				if (aParameter[0] == sName) {
					return decodeURIComponent(aParameter[1]);
				}
			}
		},
		
		fnGetTestResults: function(sTestName, aTestResults) {
			
			// build the context
			var oContext = {
				tests: [{
					header: sTestName,
					outcome: "pass",
					results:[]
				}]
			};
			
			for (var i= 0; i < aTestResults.length; i++) {
				
				var $checkItems = jQuery(aTestResults[i]).find("ol > li");
				var aTestMessages = [];
				
				for (var y = 0; y < $checkItems.length; y++) {
					
					var oTestMessage = {message: "", expected: "", actual: "", diff: "", source: "", classname: $checkItems[y].className};
					
					if($checkItems[y].className === "pass") {
					oTestMessage.message = jQuery($checkItems[y]).text();
					} else {
						var $messageSpan = jQuery($checkItems[y]).find("span.test-message");
						oTestMessage.message = jQuery($messageSpan[0]).text();
						
						var $testExpected = jQuery($checkItems[y]).find("tr.test-expected");
						console.log($testExpected);
						if( $testExpected.length > 0) {
							oTestMessage.expected = jQuery($testExpected[0]).text();
						}
						
						var $testActual = jQuery($checkItems[y]).find("tr.test-actual");
						if( $testActual.length > 0) {
							oTestMessage.actual = jQuery($testActual[0]).text();
						}
						
						var $testDiff = jQuery($checkItems[y]).find("tr.test-diff");
						if( $testDiff.length > 0) {
							oTestMessage.diff = jQuery($testDiff[0]).text();
						}
						
						var $testSource = jQuery($checkItems[y]).find("tr.test-source");
						if( $testSource.length > 0) {
							oTestMessage.source = jQuery($testSource[0]).text();
						}
					}
					
					aTestMessages.push(oTestMessage);
				}

				var $test = jQuery(aTestResults[i]);
				var sTestSummary = $test.find("strong").text();
				
				var m = sTestSummary.match(/^(.*)\((\d+)(?:,\s*(\d+),\s*(\d+))?\)\s*$/);
				var sTestName = m[1];
				if ( m[3] || m[4] ) { 
					var sNumFailed = m[2];
					var sNumPassed = m[3];
					var sNumAll = m[4];
				} else {
					var sNumPassed = sNumAll = m[2];
					var sNumFailed = "0";
				}
				
				var sRerunLink = $test.find("A").attr("href");
				
				var sLineItemClass = sNumFailed === "0" ? "pass" : "fail";
				if(sLineItemClass === "fail") {
					oContext.tests[0].outcome = sLineItemClass;
				}
				
				oContext.tests[0].results.push({result:{TestName: sTestName[0], Failed: sNumFailed, Passed: sNumPassed, All: sNumAll, rerunlink: sRerunLink, sLiClass: sLineItemClass, testmessages: aTestMessages }});
				
				var ntotalTests = parseInt(jQuery("div#reportingHeader span.total").text());
				ntotalTests = ntotalTests + parseInt(sNumAll);
				jQuery("div#reportingHeader span.total").text(ntotalTests);
				
				var nPassedTests = parseInt(jQuery("div#reportingHeader span.passed").text());
				nPassedTests = nPassedTests + parseInt(sNumPassed);
				jQuery("div#reportingHeader span.passed").text(nPassedTests);
				
				var nFailedTests = parseInt(jQuery("div#reportingHeader span.failed").text());
				nFailedTests = nFailedTests + parseInt(sNumFailed);
				jQuery("div#reportingHeader span.failed").text(nFailedTests);
			}

			return oContext;
			
		}
		
	};

})(window);
