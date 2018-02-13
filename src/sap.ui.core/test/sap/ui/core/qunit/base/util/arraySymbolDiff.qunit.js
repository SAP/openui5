/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/arraySymbolDiff'], function(arraySymbolDiff) {
	"use strict";

	QUnit.module("arraySymbolDiff");

	QUnit.test("simple arrays", function(assert) {
		var aData1 = [1,2,3,4,5];
		var aData2 = [1,4,5,6,7];
		var aData3 = [1,6,7,4,5];
		var aData4 = [1,6,7,2,3];
		var aData5 = [3,4,5,6,7];
		var aData6 = [4,5,7];
		var aData7 = [9,8,4,4,3,2,9];
		var aData8 = [1,4,5,2,3];
		var aData9 = [1,7,8,9,2,3,4,5];
		var aData10 = [5,4,3,2,1];
		var aData11 = [];
		var aData12 = [1,3,2,5,4];
		var aData13 = [1,2,3,3,3,4,5];
		var aData14 = [3,3,2,1,3,4,5];
		var aData15 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
		var aData16 = [3,18,29,30,31,32,33,34,35,36,37];
		var aData17 = [1,2,1,2,1];
		var aData18 = [2,1,2,1,2];
		var aData19 = [1,2,3,4,5,6];
		var aData20 = [1,2,3,4,2,6];
		var aData21 = [1,2,3,4,5,1];
		var aData22 = [8,1,3,1,7,2,6,3,6,9];
		var aData23 = [1,9,7,1,5,9,1,9,9,6];
		var aData24 = [1,2,3,4,2,6,2];
		var aDiff;

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 8, type: 'delete' },
					{ index: 8, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData8, aData9), aDiff, "diff between data 8 and 9");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData2), aDiff, "diff between data 1 and 2");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData3), aDiff, "diff between data 1 and 3");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData4), aDiff, "diff between data 1 and 4");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData2, aData3), aDiff, "diff between data 2 and 3");

		aDiff = [
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData2, aData4), aDiff, "diff between data 2 and 4");

		aDiff = [
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData3, aData4), aDiff, "diff between data 3 and 4");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData5), aDiff, "diff between data 1 and 5");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData5, aData1), aDiff, "diff between data 5 and 1");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData10), aDiff, "diff between data 1 and 10");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData11, aData1), aDiff, "diff between data 1 and 11");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData11), aDiff, "diff between data 11 and 1");

		aDiff = [
					{ index: 1, type: 'insert' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 5, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData12), aDiff, "diff between data 1 and 12");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData6, aData9), aDiff, "diff between data 6 and 9");

		aDiff = [
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'delete' }
				];
		assert.deepEqual(arraySymbolDiff(aData13, aData14), aDiff, "diff between data 13 and 14");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 1, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'delete' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' },
					{ index: 8, type: 'insert' },
					{ index: 9, type: 'insert' },
					{ index: 10, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData15, aData16), aDiff, "diff between data 15 and 16");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 2, type: 'insert' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData17, aData18), aDiff, "diff between data 17 and 18");

		aDiff = [
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData19, aData20), aDiff, "diff between data 19 and 20");

		aDiff = [
					{ index: 5, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData1, aData21), aDiff, "diff between data 1 and 21");

		aDiff = [
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'delete' },
					{ index: 0, type: 'insert' },
					{ index: 1, type: 'insert' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'delete' },
					{ index: 3, type: 'insert' },
					{ index: 4, type: 'insert' },
					{ index: 5, type: 'insert' },
					{ index: 6, type: 'insert' },
					{ index: 7, type: 'insert' },
					{ index: 8, type: 'insert' },
					{ index: 9, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData22, aData23), aDiff, "diff between data 22 and 23");

		aDiff = [
					{ index: 4, type: 'delete' },
					{ index: 4, type: 'insert' },
					{ index: 6, type: 'insert' }
				];
		assert.deepEqual(arraySymbolDiff(aData19, aData24), aDiff, "diff between data 19 and 24");
	});

	QUnit.test("random arrays", function(assert) {
		for (var t = 0; t < 100; t++) {
			var listA = [],
				listB = [],
				listACount = Math.floor(Math.random() * 101),
				listBCount = Math.floor(Math.random() * 101),
				aDiff;

			for (var a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (var b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}
			aDiff = arraySymbolDiff(listA, listB);
			for (var d = 0; d < aDiff.length; d++) {
				var oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, listB[oDiff.index]);
				} else {
					listA.splice(oDiff.index, 1);
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
		}
	});

	QUnit.test("arrays with undefined values", function(assert) {
		var a1 = [1, 2, 3, undefined],
			a2 = [1, undefined],
			aDiff = arraySymbolDiff(a1, a2),
			aResult = [
				{ index: 1, type: 'delete'},
				{ index: 1, type: 'delete'}
			];
		assert.deepEqual(aDiff, aResult, "arraySymbolDiff must work with undefined values");
	});

});