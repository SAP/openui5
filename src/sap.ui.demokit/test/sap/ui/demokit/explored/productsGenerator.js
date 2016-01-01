jQuery.sap.declare("sap.ui.demokit.explored.resource.DataGenerator");

sap.ui.demokit.explored.resource.DataGenerator = {};

sap.ui.demokit.explored.resource.DataGenerator.gen = function (oData) {

	// calculate counts
	oData.ProductCollectionStats = {
		"Counts": {
			"Total": oData.ProductCollection.length,
			"Weight": {
				"Ok": 0,
				"Heavy": 0,
				"Overweight": 0
			}
		},
		"Groups": {
			"Category": {},
			"SupplierName": {}
		},
		"Filters": []
	};

	// Work out the counts
	for (var i = 0, j = oData.ProductCollection.length; i < j; i++) {
		var product = oData.ProductCollection[i];

		// Weight-based
		var weightCategory = "Ok";
		if ( product.WeightMeasure > 2000 ) {
			weightCategory = "Overweight";
		} else if ( product.WeightMeasure > 1000 ) {
			weightCategory = "Heavy";
		}
		oData.ProductCollectionStats.Counts.Weight[weightCategory]++;

		// Group-based
		['Category', 'SupplierName'].map(function (sGroup) {
			var groupValue = product[sGroup];
			var currentCount = oData.ProductCollectionStats.Groups[sGroup][groupValue];
			oData.ProductCollectionStats.Groups[sGroup][groupValue] = currentCount ? currentCount + 1 : 1;
		});
	}

	// Marshall the group data ready for filters
	jQuery.each(oData.ProductCollectionStats.Groups, function (group, groupData) {
		var filterObject = { type: group, values: [] };
		jQuery.each(groupData, function (filter, filterData) {
			filterObject.values.push({ text: filter, data: filterData});
		});
		oData.ProductCollectionStats.Filters.push(filterObject);
	});

	// Build Supplier -> Category -> Product hierarchy
	oData.ProductHierarchy = { Suppliers: [] };
	var indexData = {};

	jQuery.sap.each(oData.ProductCollection, function (iProductIndex, mProduct) {

		// Supplier
		var iSupplierIndex;
		if (indexData[mProduct.SupplierName]) {
			iSupplierIndex = indexData[mProduct.SupplierName].SupplierIndex;
		} else {
			iSupplierIndex = oData.ProductHierarchy.Suppliers.push({
				Name: mProduct.SupplierName,
				Price: 0,
				Categories: []
			}) - 1;
			indexData[mProduct.SupplierName] = {
				SupplierIndex: iSupplierIndex,
				Categories: {}
			};
		}

		// Category
		var iCategoryIndex;
		if (indexData[mProduct.SupplierName].Categories[mProduct.Category]) {
			iCategoryIndex = indexData[mProduct.SupplierName].Categories[mProduct.Category].CategoryIndex;
		} else {
			var mCategory = {
				Name: mProduct.Category,
				Price: 0,
				Products: []
			};
			var iSupplierIndex = indexData[mProduct.SupplierName].SupplierIndex;
			iCategoryIndex = oData.ProductHierarchy.Suppliers[iSupplierIndex].Categories.push(mCategory) - 1;
			indexData[mProduct.SupplierName].Categories[mProduct.Category] = { CategoryIndex: iCategoryIndex };
		}

		// Place product leaf
		oData.ProductHierarchy.Suppliers[iSupplierIndex].Categories[iCategoryIndex].Products.push(mProduct);

		// Aggregate price at supplier level
		oData.ProductHierarchy.Suppliers[iSupplierIndex].Price += mProduct.Price;
		oData.ProductHierarchy.Suppliers[iSupplierIndex].CurrencyCode = mProduct.CurrencyCode;

		// Aggregate price at category level
		oData.ProductHierarchy.Suppliers[iSupplierIndex].Categories[iCategoryIndex].Price += mProduct.Price;
		oData.ProductHierarchy.Suppliers[iSupplierIndex].Categories[iCategoryIndex].CurrencyCode = mProduct.CurrencyCode;

		// print to console
		var sString = JSON.stringify(oData, null, "\t");
		jQuery.sap.log.error(sString);

	});
};

(function () {

	// Data is fetched here
	jQuery.ajax("products.json", {
		dataType: "json",
		success: function (data) {
			sap.ui.demokit.explored.resource.DataGenerator.gen(data);
		},
		error: function () {
			jQuery.sap.log.error("failed to load json");
		}
	});

})();