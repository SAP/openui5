/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main"
], function (_Any, _Main) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(sComment, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true,
				/*bCheckAge*/true);
		}

		function scrollToRow(iRow, sComment) {
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		// basics: initial data
		checkTable("Initial state", `
- 0 Alpha 60
	- 1 Beta 55
		+ 1.1 Gamma 41
		+ 1.2 Zeta 42
	* 2 Kappa 56`);

		// Note: expand 1.1 (Gamma), synch., collapse 1.1 (Gamma) => Failed to drill-down...
		// (but we prefer to do this later, see the "Expand 1 (Beta)" through "Collapse 1 (Beta)"
		// block around synchronize("2nd time"))

		// basics: collapse (incl. all placeholders for children!)
		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After collapse 0 (Alpha)", `
+ 0 Alpha 60`);

		// basics: expand (restores previous state!)
		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", `
- 0 Alpha 60
	- 1 Beta 55
		+ 1.1 Gamma 41
		+ 1.2 Zeta 42
	* 2 Kappa 56`);

		// expand nodes "at the edge" of the top pyramid (loads children)
		toggleExpand("1.2", "Expand 1.2 (Zeta)");
		checkTable("After expand 1.2 (Zeta)", `
- 0 Alpha 60
	- 1 Beta 55
		+ 1.1 Gamma 41
		- 1.2 Zeta 42
			* 1.2.1 Eta 31`);

		toggleExpand("1.1", "Expand 1.1 (Gamma)");
		checkTable("After expand 1.1 (Gamma)", `
- 0 Alpha 60
	- 1 Beta 55
		- 1.1 Gamma 41
			* 1.1.1 Delta 38
			* 1.1.2 Epsilon 39`);

		// show more children of newly expanded node
		scrollToRow(5, "1.2 (Zeta) is at the top");
		checkTable("After scroll to 1.2 (Zeta)", `
		- 1.2 Zeta 42
			* 1.2.1 Eta 31
			* 1.2.2 Theta 32
			* 1.2.3 Iota 33
	* 2 Kappa 56`);

		// collapse incl. children outside of top pyramid
		scrollToRow(0, "Scroll to the top");
		checkTable("After scroll to 0 (Alpha)", `
- 0 Alpha 60
	- 1 Beta 55
		- 1.1 Gamma 41
			* 1.1.1 Delta 38
			* 1.1.2 Epsilon 39`);

		toggleExpand("1", "Collapse 1 (Beta)");
		checkTable("After collapse 1 (Beta)", `
- 0 Alpha 60
	+ 1 Beta 55
	* 2 Kappa 56
	* 3 Lambda 57
	- 4 Mu 58`);

		toggleExpand("4", "Collapse 4 (Mu)");
		checkTable("After collapse 4 (Mu)", `
- 0 Alpha 60
	+ 1 Beta 55
	* 2 Kappa 56
	* 3 Lambda 57
	+ 4 Mu 58`);

		// this skips 4.1 (Nu) which has not been shown so far!
		scrollToRow(2, "Scroll to the bottom");
		checkTable("After scroll to 2 (Kappa)", `
	* 2 Kappa 56
	* 3 Lambda 57
	+ 4 Mu 58
	- 5 Xi 59
		+ 5.1 Omicron 41`);

		// reveal a child from the top pyramid for the 1st time
		toggleExpand("4", "Expand 4 (Mu)");
		checkTable("After expand 4 (Mu)", `
	* 2 Kappa 56
	* 3 Lambda 57
	- 4 Mu 58
		* 4.1 Nu 41
	- 5 Xi 59`);

		// load children outside top pyramid, incl. paging
		scrollToRow(3, "Scroll to the bottom");
		checkTable("After scroll to 3 (Lambda)", `
	* 3 Lambda 57
	- 4 Mu 58
		* 4.1 Nu 41
	- 5 Xi 59
		+ 5.1 Omicron 41`);

		toggleExpand("5.1", "Expand 5.1 (Omicron)");
		checkTable("After expand 5.1 (Omicron)", `
	* 3 Lambda 57
	- 4 Mu 58
		* 4.1 Nu 41
	- 5 Xi 59
		- 5.1 Omicron 41`);

		scrollToRow(8, "Show first page of 5.1's children");
		checkTable("After scroll to 5.1.1 (Pi)", `
			* 5.1.1 Pi 21
			* 5.1.2 Rho 22
			* 5.1.3 Sigma 23
			* 5.1.4 Tau 24
			* 5.1.5 Upsilon 25`);

		scrollToRow(12, "Show second page of 5.1's children");
		checkTable("After scroll to 5.1.5 (Upsilon)", `
			* 5.1.5 Upsilon 25
			* 5.1.6 Phi 26
			* 5.1.7 Chi 27
			* 5.1.8 Psi 28
			* 5.1.9 Omega 29`);

		// collapse incl. children not counted via "Descendants" property
		scrollToRow(0, "Scroll to the top");
		checkTable("After scroll to 0 (Alpha)", `
- 0 Alpha 60
	+ 1 Beta 55
	* 2 Kappa 56
	* 3 Lambda 57
	- 4 Mu 58`);

		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After collapse 0 (Alpha)", `
+ 0 Alpha 60`);

		// side effect
		When.onTheMainPage.synchronize("1st time");
		checkTable("After request side effects)", `
+ 0 Alpha #1 160`);

		// tree state must be kept, even inside collapsed node, and update must happen there as well
		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", `
- 0 Alpha #1 160
	+ 1 Beta #1 155
	* 2 Kappa #1 156
	* 3 Lambda #1 157
	- 4 Mu #1 158`);

		toggleExpand("1", "Expand 1 (Beta)");
		checkTable("After expand 1 (Beta)", `
- 0 Alpha #1 160
	- 1 Beta #1 155
		- 1.1 Gamma #1 141
			* 1.1.1 Delta #1 138
			* 1.1.2 Epsilon #1 139`);

		toggleExpand("1.1", "Collapse 1.1 (Gamma)");
		checkTable("After collapse 1.1 (Gamma)", `
- 0 Alpha #1 160
	- 1 Beta #1 155
		+ 1.1 Gamma #1 141
		- 1.2 Zeta #1 142
			* 1.2.1 Eta #1 131`);

		toggleExpand("1.2", "Collapse 1.2 (Zeta)");
		checkTable("After collapse 1.2 (Zeta)", `
- 0 Alpha #1 160
	- 1 Beta #1 155
		+ 1.1 Gamma #1 141
		+ 1.2 Zeta #1 142
	* 2 Kappa #1 156`);

		toggleExpand("1.1", "Expand 1.1 (Gamma)");
		checkTable("After expand 1.1 (Gamma)", `
- 0 Alpha #1 160
	- 1 Beta #1 155
		- 1.1 Gamma #1 141
			* 1.1.1 Delta #1 138
			* 1.1.2 Epsilon #1 139`);

		When.onTheMainPage.synchronize("2nd time");
		checkTable("After request side effects", `
- 0 Alpha #2 260
	- 1 Beta #2 255
		- 1.1 Gamma #2 241
			* 1.1.1 Delta #2 238
			* 1.1.2 Epsilon #2 239`);

		toggleExpand("1.1", "Collapse 1.1 (Gamma)");
		checkTable("After collapse 1.1 (Gamma)", `
- 0 Alpha #2 260
	- 1 Beta #2 255
		+ 1.1 Gamma #2 241
		+ 1.2 Zeta #2 242
	* 2 Kappa #2 256`);

		toggleExpand("1", "Collapse 1 (Beta)");
		checkTable("After collapse 1 (Beta)", `
- 0 Alpha #2 260
	+ 1 Beta #2 255
	* 2 Kappa #2 256
	* 3 Lambda #2 257
	- 4 Mu #2 258`);

		// still functional
		toggleExpand("4", "Collapse 4 (Mu)");
		checkTable("After collapse 4 (Mu)", `
- 0 Alpha #2 260
	+ 1 Beta #2 255
	* 2 Kappa #2 256
	* 3 Lambda #2 257
	+ 4 Mu #2 258`);

		scrollToRow(1, "Scroll down one row"); // 5 (Xi) appears
		checkTable("After scroll to 1 (Beta)", `
	+ 1 Beta #2 255
	* 2 Kappa #2 256
	* 3 Lambda #2 257
	+ 4 Mu #2 258
	- 5 Xi #2 259`);

		toggleExpand("5", "Collapse 5 (Xi)");
		checkTable("After collapse 5 (Xi)", `
	+ 1 Beta #2 255
	* 2 Kappa #2 256
	* 3 Lambda #2 257
	+ 4 Mu #2 258
	+ 5 Xi #2 259`);

		scrollToRow(0, "Scroll to the top");
		checkTable("After scroll to 0 (Alpha)", `
- 0 Alpha #2 260
	+ 1 Beta #2 255
	* 2 Kappa #2 256
	* 3 Lambda #2 257
	+ 4 Mu #2 258`);

		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After collapse 0 (Alpha)", `
+ 0 Alpha #2 260`);

		When.onTheMainPage.synchronize("3rd time");
		checkTable("After request side effects", `
+ 0 Alpha #3 360`);

		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", `
- 0 Alpha #3 360
	+ 1 Beta #3 355
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358`);

		// tree state properly kept
		scrollToRow(1, "Scroll down one row");
		checkTable("After scroll to 1 (Beta)", `
	+ 1 Beta #3 355
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358
	+ 5 Xi #3 359`);

		// hidden node 5.1 (Omicron) still expanded and properly updated
		toggleExpand("5", "Expand 5 (Xi)");
		checkTable("After expand 5 (Xi)", `
	+ 1 Beta #3 355
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358
	- 5 Xi #3 359`);

		scrollToRow(2, "Scroll down one row");
		checkTable("After scroll to 2 (Kappa)", `
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358
	- 5 Xi #3 359
		- 5.1 Omicron #3 341`);

		scrollToRow(7, "PAGE DOWN");
		checkTable("After scroll to 5.1.1 (Pi)", `
			* 5.1.1 Pi #3 321
			* 5.1.2 Rho #3 322
			* 5.1.3 Sigma #3 323
			* 5.1.4 Tau #3 324
			* 5.1.5 Upsilon #3 325`);

		scrollToRow(11, "Scroll to the bottom");
		checkTable("After scroll to 5.1.5 (Upsilon)", `
			* 5.1.5 Upsilon #3 325
			* 5.1.6 Phi #3 326
			* 5.1.7 Chi #3 327
			* 5.1.8 Psi #3 328
			* 5.1.9 Omega #3 329`);

		scrollToRow(6, "Scroll To 5.1 (Omicron)");
		checkTable("After scroll to 5.1 (Omicron)", `
		- 5.1 Omicron #3 341
			* 5.1.1 Pi #3 321
			* 5.1.2 Rho #3 322
			* 5.1.3 Sigma #3 323
			* 5.1.4 Tau #3 324`);

		toggleExpand("5.1", "Collapse 5.1 (Omicron)");
		checkTable("After collapse 5.1 (Omicron)", `
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358
	- 5 Xi #3 359
		+ 5.1 Omicron #3 341`);

		// collapse incl. children not counted via "Descendants" property
		scrollToRow(0, "Scroll to the top");
		checkTable("After scroll to 0 (Alpha)", `
- 0 Alpha #3 360
	+ 1 Beta #3 355
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358`);

		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After collapse 0 (Alpha)", `
+ 0 Alpha #3 360`);

		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", `
- 0 Alpha #3 360
	+ 1 Beta #3 355
	* 2 Kappa #3 356
	* 3 Lambda #3 357
	+ 4 Mu #3 358`);

		When.onTheMainPage.synchronize("4th time");
		checkTable("After request side effects", `
- 0 Alpha #4 460
	+ 1 Beta #4 455
	* 2 Kappa #4 456
	* 3 Lambda #4 457
	+ 4 Mu #4 458`);

		scrollToRow(2, "Scroll to the bottom");
		checkTable("After scroll to 2 (Kappa)", `
	* 2 Kappa #4 456
	* 3 Lambda #4 457
	+ 4 Mu #4 458
	- 5 Xi #4 459
		+ 5.1 Omicron #4 441`);

		Then.onAnyPage.checkLog();
	};
});
