/*!
 * ${copyright}
 */
/*global opaSkip*/
sap.ui.define(['sap/ui/test/opaQunit', 'test-resources/sap/ui/mdc/qunit/util/V4ServerHelper'
], async function (opaTest, V4ServerHelper) {
	"use strict";

	const bServerAvailable = await V4ServerHelper.checkWhetherServerExists();
	return bServerAvailable ? opaTest : opaSkip;
});