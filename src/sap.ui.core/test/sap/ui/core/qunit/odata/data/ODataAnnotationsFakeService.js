sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	/* global sinon */
	var xhr = sinon.useFakeXMLHttpRequest(),
		maxResponseDelay = 250,
		bRandomizeResponseDelay = false,
		_setTimeout = window.setTimeout;

	xhr.useFilters = true;
	xhr.addFilter(function(method, url) {
		return url.indexOf("fakeService://") != 0;
	});
	xhr.onCreate = function(request) {
		request.onSend = function() {
			var mMetaDataHeaders = {
				"Content-Type": "application/xml;charset=utf-8",
				"DataServiceVersion": "1.0;"
			};
			var mXMLHeaders = 	{
				"Content-Type": "application/atom+xml;charset=utf-8",
				"DataServiceVersion": "2.0;"
			};

			// Default request answer values:
			var iStatus = 200;
			var mHeaders = mXMLHeaders;
			var sAnswer = "This should never be received as an answer!";
			var bLastModified = true;
			var bETag = true;

			switch (request.url) {

				case "fakeService://replay-headers":
					sAnswer = createHeaderAnnotations(request);
					break;

				case "fakeService://testdata/odata/northwind/":
				case "fakeService://testdata/odata/northwind-annotated/":
					mHeaders = mMetaDataHeaders;
					sAnswer = sNorthwindData;
					break;

				case "fakeService://testdata/odata/northwind/$metadata":
					mHeaders = mMetaDataHeaders;
					sAnswer = sNorthwindMetadata;
					break;

				case "fakeService://testdata/odata/northwind-annotated/$metadata":
					mHeaders = mMetaDataHeaders;
					sAnswer = sNorthwindMetadataAnnotated;
					break;

				case "fakeService://testdata/odata/NOT_EXISTENT/$metadata":
					iStatus = 404;
					mHeaders = mMetaDataHeaders;
					sAnswer = "Sorry, not found...";
					break;

				case "fakeService://testdata/odata/NOT_EXISTENT":
					iStatus = 404;
					sAnswer = "Sorry, not found...";
					break;


				case "fakeService://testdata/odata/sapdata01/":
					mHeaders = mMetaDataHeaders;
					sAnswer = sNorthwindData;
					break;

				case "fakeService://testdata/odata/sapdata01/$metadata":
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataWithEntityContainers;
					break;

				case "fakeService://testdata/odata/sapdata02/":
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataWithEntityContainers;
					break;

				case "fakeService://testdata/odata/sapdata02/$metadata":
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataWithEntityContainers;
					bLastModified = false;
					bETag = false;
					break;

				case "fakeService://testdata/odata/northwind-annotations-normal.xml":
					sAnswer = sNorthwindAnnotations;
					break;

				case "fakeService://testdata/odata/northwind-annotations-malformed.xml":
					sAnswer = sNorthwindAnnotationsMalformed;
					break;

				case "fakeService://testdata/odata/epm-annotations-complex.xml":
					sAnswer = sEPMAnnotationsComplex;
					break;

				case "fakeService://testdata/odata/apply-function-test.xml":
					sAnswer = sTestApplyFunctionAnnotations;
					break;

				case "fakeService://testdata/odata/multiple-property-annotations.xml":
					sAnswer = sMultiplePropertyAnnotations;
					break;

				case "fakeService://testdata/odata/property-annotation-qualifiers.xml":
					sAnswer = sPropertyAnnotationQualifiers;
					break;

				case "fakeService://testdata/odata/other-property-values.xml":
					sAnswer = sOtherPropertyValues;
					break;

				case "fakeService://testdata/odata/namespaces-aliases.xml":
					sAnswer = sNamespaceAliases;
					break;

				case "fakeService://testdata/odata/other-property-value-aliases.xml":
					sAnswer = sOtherPropertyValueAliases;
					break;

				case "fakeService://testdata/odata/other-property-textproperties.xml":
					sAnswer = sOtherPropertyTextNodes;
					break;

				case "fakeService://testdata/odata/simple-values.xml":
					sAnswer = sSimpleValues;
					break;

				// Test multiple annotations loaded after each other...
				case "fakeService://testdata/odata/multiple-annotations-01.xml":
					sAnswer = sMultipleTest01;
					break;
				case "fakeService://testdata/odata/multiple-annotations-02.xml":
					sAnswer = sMultipleTest02;
					break;
				case "fakeService://testdata/odata/multiple-annotations-03.xml":
					sAnswer = sMultipleTest03;
					break;

				case "fakeService://testdata/odata/collection-with-namespace.xml":
					sAnswer = sCollectionWithNamespace;
					break;

				case "fakeService://testdata/odata/UrlRef.xml":
					sAnswer = sUrlRefTest;
					break;

				case "fakeService://testdata/odata/Aliases.xml":
					sAnswer = sAliasesTest;
					break;

				case "fakeService://testdata/odata/DynamicExpressions.xml":
					sAnswer = sDynamicExpressionsTest;
					break;

				case "fakeService://testdata/odata/DynamicExpressions2.xml":
					sAnswer = sDynamicExpressionsTest2;
					break;

				case "fakeService://testdata/odata/collections-with-simple-values.xml":
					sAnswer = sCollectionsWithSimpleValuesTest;
					break;

				case "fakeService://testdata/odata/simple-values-2.xml":
					sAnswer = sSimpleValuesTest2;
					break;

				case "fakeService://testdata/odata/if-in-apply.xml":
					sAnswer = sIfInApply;
					break;

				case "fakeService://testdata/odata/labeledelement-other-values.xml":
					sAnswer = sLabeledElementOtherValues;
					break;

				case "fakeService://testdata/odata/apply-in-if.xml":
					sAnswer = sApplyInIf;
					break;

				case "fakeService://testdata/odata/empty-collection.xml":
					sAnswer = sEmptyCollection;
					break;

				case "fakeService://testdata/odata/multiple-enums.xml":
					sAnswer = sMultipleEnums;
					break;

				case "fakeService://testdata/odata/valuelists/":
					mHeaders = mMetaDataHeaders;
					sAnswer = sNorthwindData;
					break;

				case "fakeService://testdata/odata/valuelists/$metadata":
					var sMetadataString = sNorthwindMetadataWithValueListPlaceholder.replace("{{ValueLists}}", "");
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataString;
					break;

				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test":
					sMetadataString = sNorthwindMetadataWithValueListPlaceholder.replace("{{ValueLists}}", "");
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataString;
					break;

				case "fakeService://testdata/odata/valuelists/$metadata?sap-value-list=none":
				case "fakeService://testdata/odata/valuelists/$metadata?sap-value-list=all":
				case "fakeService://testdata/odata/valuelists/$metadata?sap-value-list=1":
				case "fakeService://testdata/odata/valuelists/$metadata?sap-value-list=2":
				case "fakeService://testdata/odata/valuelists/$metadata?sap-value-list=3":
				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test&sap-value-list=none":
				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test&sap-value-list=all":
				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test&sap-value-list=1":
				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test&sap-value-list=2":
				case "fakeService://testdata/odata/valuelists/$metadata?testToken=test&sap-value-list=3":
					var sValueList = request.url.replace(/^.*?sap-value-list=(.*)$/, "$1");
					var sAnnotations = "";
					switch (sValueList) {
						case "all":
							sAnnotations = aValueListStrings.join("\n");
							break;
						case "1":
							sAnnotations = aValueListStrings[0];
							break;
						case "2":
							sAnnotations = aValueListStrings[1];
							break;
						case "3":
							sAnnotations = aValueListStrings[2];
							break;

						case "none":
						default:
							sAnnotations = "";
							break;
					}
					sMetadataString = sNorthwindMetadataWithValueListPlaceholder.replace("{{ValueLists}}", sAnnotations);
					mHeaders = mMetaDataHeaders;
					sAnswer = sMetadataString;
					break;

				case "fakeService://testdata/odata/overwrite-on-term-level-1":
					sAnswer = aOverwriteOnTermLevel[0];
					break;

				case "fakeService://testdata/odata/overwrite-on-term-level-2":
					sAnswer = aOverwriteOnTermLevel[1];
					break;

				case "fakeService://testdata/odata/edmtype-for-navigationproperties":
					sAnswer = sEdmtypeForNavigationproperties;
					break;

				case "fakeService://testdata/odata/nested-annotations":
					sAnswer = sNestedAnnotations;
					break;

				default:
					// You used the wrong URL, dummy!
					break;
			}

			if (bLastModified) {
				mHeaders["last-Modified"] = "Wed, 15 Nov 1995 04:58:08 GMT";
			}

			if (bETag) {
				mHeaders["eTag"] = "Wed, 15 Nov 1995 04:58:08 GMT";
			}

			if (request.async === true) {
				_setTimeout(function() {
					Log.info("[FakeService] Responding to: " + request.url);
					request.respond(iStatus, mHeaders, sAnswer);
				}, bRandomizeResponseDelay ? Math.round(Math.random() * maxResponseDelay) : 50);
			} else {
				request.respond(iStatus, mHeaders, sAnswer);
			}

		};
	};

	function createHeaderAnnotations(request) {
		var sAnnotations = '<?xml version="1.0" encoding="utf-8"?>\
		<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
			<edmx:DataServices>\
				<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="Test">\
					<Annotations Target="Replay.Headers">';

		Object.keys(request.requestHeaders).forEach(function(sHeader) {
			sAnnotations += '\
						<Annotation Term="' + sHeader + '" String="' + request.requestHeaders[sHeader] + '" />';
		});


		sAnnotations += '\
					</Annotations>\
				</Schema>\
			</edmx:DataServices>\
		</edmx:Edmx>';

		return sAnnotations;
	}

	var sNorthwindAnnotations = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
		</edmx:Reference>\
		<edmx:Reference Uri="/coco/vocabularies/Communication.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="vCard" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml" >\
			<edmx:Include Namespace="Org.OData.Measures.V1" Alias="CQP" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
			<edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" />\
		</edmx:Reference>	\
		<edmx:DataServices>\
			<!-- Entity Data Model Conceptual Schemas, as specified in [MC-CSDL]	and annotated as specified in [MS-ODATA] -->\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
				<Annotations Target="NorthwindModel.Product/UnitPrice">\
					<Annotation Term="CQP.ISOCurrency" String="USD" />\
				</Annotations>\
				<Annotations Target="NorthwindModel.Order_Detail/UnitPrice">\
					<Annotation Term="CQP.ISOCurrency" String="USD" />\
				</Annotations>\
				<Annotations Target="NorthwindModel.Product">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Product" />\
							<PropertyValue Property="TypeNamePlural" String="Products" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Product" />\
									<PropertyValue Property="Value" Path="ProductName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category" />\
								<PropertyValue Property="Value" Path="Category/CategoryName" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="Supplier/CompanyName" />\
								<PropertyValue Property="Target" Path="Supplier" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product" />\
								<PropertyValue Property="Value" Path="ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Units In Stock" />\
								<PropertyValue Property="Value" Path="UnitsInStock" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.CollectionFacet">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Facets">			\
									<Collection>		\
										<Record Type="UI.ReferenceFacet">\
											<PropertyValue Property="Label" String="Contact Data" />\
											<PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
										</Record>\
										<Record Type="UI.ReferenceFacet">\
											<Annotation Term="UI.Map"/>\
											<PropertyValue Property="Label" String="Supplier Address on Map" />\
											<PropertyValue Property="Target" AnnotationPath="Supplier/@vCard.Address" />\
										</Record>\
									</Collection>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Category">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Category" />\
							<PropertyValue Property="TypeNamePlural" String="Categories" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/example_32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Category Name" />\
									<PropertyValue Property="Value" Path="CategoryName" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" Path="Description" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category ID" />\
								<PropertyValue Property="Value" Path="CategoryID" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/example_32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>					\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category ID" />\
								<PropertyValue Property="Value" Path="CategoryID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category Name" />\
								<PropertyValue Property="Value" Path="CategoryName" />\
							</Record>\
							<Record>\
								<PropertyValue Property="Label" String="Description" />\
								<PropertyValue Property="Value" Path="Description" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Products" />\
								<PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Supplier">		\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Supplier" />\
							<PropertyValue Property="TypeNamePlural" String="Suppliers" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="CompanyName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier ID" />\
								<PropertyValue Property="Value" Path="SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Contact Name" />\
								<PropertyValue Property="Value">\
									<Apply Function="odata.concat">\
										<Path>ContactTitle</Path>\
										<String>&#160;-&#160;</String>\
										<Path>ContactName</Path>\
									</Apply>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataFieldForAnnotation">\
								<PropertyValue Property="Label" String="Supplier Adress" />\
								<PropertyValue Property="Target" AnnotationPath="@vCard.Address" />\
							</Record>\
							<Record Type="UI.DataFieldWithUrl">\
								<PropertyValue Property="Label" String="Homepage" />\
								<PropertyValue Property="Value" Path="HomePage" />\
								<PropertyValue Property="Url" Path="HomePage" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/supplier_48.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier ID" />\
								<PropertyValue Property="Value" Path="SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="CompanyName" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="vCard.Address">\
						<Record>\
							<PropertyValue Property="street" Path="Address" />\
							<PropertyValue Property="locality" Path="City" />\
							<PropertyValue Property="postalCode" Path="PostalCode" />\
							<PropertyValue Property="country" Path="Country" />\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Products" />\
								<PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Order">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Order" />\
							<PropertyValue Property="TypeNamePlural" String="Orders" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/cart_32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Order ID" />\
									<PropertyValue Property="Value" Path="OrderID" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="No description available" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Number" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Customer" />\
								<PropertyValue Property="Value" Path="Customer/CompanyName" />\
								<PropertyValue Property="Target" Path="Customer" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Required Date" />\
								<PropertyValue Property="Value" Path="RequiredDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Shipped Date" />\
								<PropertyValue Property="Value" Path="ShippedDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Via" />\
								<PropertyValue Property="Value" Path="ShipVia" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Name" />\
								<PropertyValue Property="Value" Path="ShipName" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.FieldGroup" Qualifier="Overview">\
						<Record>\
							<PropertyValue Property="Label" String="Overview"/>\
							<PropertyValue Property="Data">\
								<Collection>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Employee" />\
										<PropertyValue Property="Value">\
											<Apply Function="odata.concat">\
												<Path>Employee/FirstName</Path>\
												<String>&#160;</String>\
												<Path>Employee/LastName</Path>\
											</Apply>\
										</PropertyValue>\
									</Record>\
									<Record Type="UI.DataFieldWithNavigation">\
										<PropertyValue Property="Label" String="Customer" />\
										<PropertyValue Property="Value" Path="Customer/CompanyName" />\
										<PropertyValue Property="Target" Path="Customer" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Order Date" />\
										<PropertyValue Property="Value" Path="OrderDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Required Date" />\
										<PropertyValue Property="Value" Path="RequiredDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Shipped Date" />\
										<PropertyValue Property="Value" Path="ShippedDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Ship Via" />\
										<PropertyValue Property="Value" Path="ShipVia" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Ship Name" />\
										<PropertyValue Property="Value" Path="ShipName" />\
									</Record>\
								</Collection>						\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Number" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Customer" />\
								<PropertyValue Property="Value" Path="Customer/CompanyName" />\
								<PropertyValue Property="Target" Path="Customer" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Date" />\
								<PropertyValue Property="Value" Path="OrderDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Required Date" />\
								<PropertyValue Property="Value" Path="RequiredDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Shipped Date" />\
								<PropertyValue Property="Value" Path="ShippedDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Via" />\
								<PropertyValue Property="Value" Path="ShipVia" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Name" />\
								<PropertyValue Property="Value" Path="ShipName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/cart_48.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>										\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Overview" />\
								<PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#Overview" />\
							</Record>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Order Items" />\
								<PropertyValue Property="Target" AnnotationPath="Order_Details/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Customer">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Customer" />\
							<PropertyValue Property="TypeNamePlural" String="Customers" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Customer" />\
									<PropertyValue Property="Value" Path="CustomerID" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="CompanyName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Customer ID" />\
								<PropertyValue Property="Value" Path="CustomerID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Company" />\
								<PropertyValue Property="Value" Path="CompanyName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Contact Name" />\
								<PropertyValue Property="Value">\
									<Apply Function="odata.concat">\
										<Path>ContactTitle</Path>\
										<String>&#160;-&#160;</String>\
										<Path>ContactName</Path>\
									</Apply>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Order_Detail">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="OrderItem" />\
							<PropertyValue Property="TypeNamePlural" String="OrderItems" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Product Name" />\
									<PropertyValue Property="Value" Path="Product/ProductName" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="No description available" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Item" />\
									<PropertyValue Property="Value" Path="Product/ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity" />\
								<PropertyValue Property="Value" Path="Quantity" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Discount" />\
								<PropertyValue Property="Value" Path="Discount" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Name" />\
								<PropertyValue Property="Value" Path="Product/ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="Product/ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity" />\
								<PropertyValue Property="Value" Path="Quantity" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Discount" />\
								<PropertyValue Property="Value" Path="Discount" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Details" />\
								<PropertyValue Property="Target" AnnotationPath="Product/@UI.Identification" />\
							</Record>\
						</Collection>\
					</Annotation>\
				<Annotation Term="Test.FromAnnotations">\
						<Collection>\
							<Record Type="Test.DataField">\
								<PropertyValue Property="Label" String="From" />\
								<PropertyValue Property="Value" Path="Annotations" />\
							</Record>\
						</Collection>\
				</Annotation>\
				</Annotations>\
				<Annotations Target="UnitTest">\
				<Annotation Term="Test.FromAnnotations">\
						<Collection>\
							<Record Type="Test.DataField">\
								<PropertyValue Property="Label" String="From" />\
								<PropertyValue Property="Value" Path="Annotations" />\
							</Record>\
						</Collection>\
				</Annotation>\
				<Annotation Term="Test.Merged">\
						<Collection>\
							<Record Type="Test.DataField">\
								<PropertyValue Property="Label" String="From" />\
								<PropertyValue Property="Value" Path="Annotations" />\
							</Record>\
						</Collection>\
				</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Category/CategoryID">\
					<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="LabelString" />\
					<Annotation Term="annotationSource" String="Annotations" />\
				</Annotations>\
				<Annotations Target="Test.AnnotationInRecord">\
					<Annotation Term="Test.AnnotationInRecord.Case1">\
						<Record Type="Test.AnnotationInRecord.Case1.Record">\
							<Annotation Term="Test.AnnotationInRecord.Case1.Record.SubAnnotation1" String="SubAnnotation1" />\
							<PropertyValue Property="Label" String="Label1" />\
							<Annotation Term="Label" String="Annotation" />\
							<Annotation Term="Test.AnnotationInRecord.Case1.Record.SubAnnotation2">\
								<If>\
									<Eq>\
										<Path>Condition</Path>\
										<Bool>false</Bool>\
									</Eq>\
									<String>ConditionalValue</String>\
								</If>\
							</Annotation>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.AnnotationInRecord.Case2">\
						<Record Type="Test.AnnotationInRecord.Case2.Record">\
							<Annotation Term="Test.AnnotationInRecord.Case2.Record.SubAnnotation1" String="SubAnnotation1" />\
							<Annotation Term="Label" String="Annotation" />\
							<Annotation Term="Test.AnnotationInRecord.Case2.Record.SubAnnotation2">\
								<If>\
									<Eq>\
										<Path>Condition</Path>\
										<Bool>false</Bool>\
									</Eq>\
									<String>ConditionalValue</String>\
								</If>\
							</Annotation>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.AnnotationInRecord.Case3">\
						<Record Type="Test.AnnotationInRecord.Case3.Record">\
							<Null />\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';


	var sNorthwindAnnotationsMalformed = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
		</edmx:Reference>\
			<edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="vCard" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml" >\
			<edmx:Include Namespace="Org.OData.Measures.V1" Alias="CQP" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
			<edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" />\
	\
		<edmx:DataServices>\
			<!-- Entity Data Model Conceptual Schemas, as specified in [MC-CSDL]	and annotated as specified in [MS-ODATA] -->\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
				<Annotations Target="NorthwindModel.Product/UnitPrice">\
					<Annotation Term="CQP.ISOCurrency" String="USD" />\
				</Annotations>\
					<Annotation Term="CQP.ISOCurrency" String="USD" />\
				</Annotations>\
				<Annotations Target="NorthwindModel.Product">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Product" />\
							<PropertyValue Property="TypeNamePlural" String="Products" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
							<PropertyValue Property="Title">\
									<PropertyValue Property="Label" String="Product" />\
									<PropertyValue Property="Value" Path="ProductName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category" />\
								<PropertyValue Property="Value" Path="Category/CategoryName" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="Supplier/CompanyName" />\
								<PropertyValue Property="Target" Path="Supplier" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product" />\
								<PropertyValue Property="Value" Path="ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Units In Stock" />\
								<PropertyValue Property="Value" Path="UnitsInStock" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.CollectionFacet">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Facets">			\
									<Collection>		\
										<Record Type="UI.ReferenceFacet">\
											<PropertyValue Property="Label" String="Contact Data" />\
											<PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
										</Record>\
										<Record Type="UI.ReferenceFacet">\
											<Annotation Term="UI.Map"/>\
											<PropertyValue Property="Label" String="Supplier Address on Map" />\
											<PropertyValue Property="Target" AnnotationPath="Supplier/@vCard.Address" />\
										</Record>\
									</Collection>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Category">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Category" />\
							<PropertyValue Property="TypeNamePlural" String="Categories" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/example_32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Category Name" />\
									<PropertyValue Property="Value" Path="CategoryName" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" Path="Description" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category ID" />\
								<PropertyValue Property="Value" Path="CategoryID" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/example_32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>					\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category ID" />\
								<PropertyValue Property="Value" Path="CategoryID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category Name" />\
								<PropertyValue Property="Value" Path="CategoryName" />\
							</Record>\
							<Record>\
								<PropertyValue Property="Label" String="Description" />\
								<PropertyValue Property="Value" Path="Description" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Products" />\
								<PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Supplier">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Supplier" />\
							<PropertyValue Property="TypeNamePlural" String="Suppliers" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="CompanyName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier ID" />\
								<PropertyValue Property="Value" Path="SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Contact Name" />\
								<PropertyValue Property="Value">\
									<Apply Function="odata.concat">\
										<Path>ContactTitle</Path>\
										<String>&#160;-&#160;</String>\
										<Path>ContactName</Path>\
									</Apply>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataFieldForAnnotation">\
								<PropertyValue Property="Label" String="Supplier Adress" />\
								<PropertyValue Property="Target" AnnotationPath="@vCard.Address" />\
							</Record>\
							<Record Type="UI.DataFieldWithUrl">\
								<PropertyValue Property="Label" String="Homepage" />\
								<PropertyValue Property="Value" Path="HomePage" />\
								<PropertyValue Property="Url" Path="HomePage" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/supplier_48.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier ID" />\
								<PropertyValue Property="Value" Path="SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="CompanyName" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="vCard.Address">\
						<Record>\
							<PropertyValue Property="street" Path="Address" />\
							<PropertyValue Property="locality" Path="City" />\
							<PropertyValue Property="postalCode" Path="PostalCode" />\
							<PropertyValue Property="country" Path="Country" />\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Products" />\
								<PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Order">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Order" />\
							<PropertyValue Property="TypeNamePlural" String="Orders" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/cart_32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Order ID" />\
									<PropertyValue Property="Value" Path="OrderID" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="No description available" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Number" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Customer" />\
								<PropertyValue Property="Value" Path="Customer/CompanyName" />\
								<PropertyValue Property="Target" Path="Customer" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Required Date" />\
								<PropertyValue Property="Value" Path="RequiredDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Shipped Date" />\
								<PropertyValue Property="Value" Path="ShippedDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Via" />\
								<PropertyValue Property="Value" Path="ShipVia" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Name" />\
								<PropertyValue Property="Value" Path="ShipName" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.FieldGroup" Qualifier="Overview">\
						<Record>\
							<PropertyValue Property="Label" String="Overview"/>\
							<PropertyValue Property="Data">\
								<Collection>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Employee" />\
										<PropertyValue Property="Value">\
											<Apply Function="odata.concat">\
												<Path>Employee/FirstName</Path>\
												<String>&#160;</String>\
												<Path>Employee/LastName</Path>\
											</Apply>\
										</PropertyValue>\
									</Record>\
									<Record Type="UI.DataFieldWithNavigation">\
										<PropertyValue Property="Label" String="Customer" />\
										<PropertyValue Property="Value" Path="Customer/CompanyName" />\
										<PropertyValue Property="Target" Path="Customer" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Order Date" />\
										<PropertyValue Property="Value" Path="OrderDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Required Date" />\
										<PropertyValue Property="Value" Path="RequiredDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Shipped Date" />\
										<PropertyValue Property="Value" Path="ShippedDate" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Ship Via" />\
										<PropertyValue Property="Value" Path="ShipVia" />\
									</Record>\
									<Record Type="UI.DataField">\
										<PropertyValue Property="Label" String="Ship Name" />\
										<PropertyValue Property="Value" Path="ShipName" />\
									</Record>\
								</Collection>						\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Number" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Customer" />\
								<PropertyValue Property="Value" Path="Customer/CompanyName" />\
								<PropertyValue Property="Target" Path="Customer" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order Date" />\
								<PropertyValue Property="Value" Path="OrderDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Required Date" />\
								<PropertyValue Property="Value" Path="RequiredDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Shipped Date" />\
								<PropertyValue Property="Value" Path="ShippedDate" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Via" />\
								<PropertyValue Property="Value" Path="ShipVia" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Ship Name" />\
								<PropertyValue Property="Value" Path="ShipName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/cart_48.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Overview" />\
								<PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#Overview" />\
							</Record>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Order Items" />\
								<PropertyValue Property="Target" AnnotationPath="Order_Details/@UI.LineItem" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Customer">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="Customer" />\
							<PropertyValue Property="TypeNamePlural" String="Customers" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Customer" />\
									<PropertyValue Property="Value" Path="CustomerID" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="CompanyName" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Customer ID" />\
								<PropertyValue Property="Value" Path="CustomerID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Company" />\
								<PropertyValue Property="Value" Path="CompanyName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Contact Name" />\
								<PropertyValue Property="Value">\
									<Apply Function="odata.concat">\
										<Path>ContactTitle</Path>\
										<String>&#160;-&#160;</String>\
										<Path>ContactName</Path>\
									</Apply>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Order_Detail">\
					<Annotation Term="UI.HeaderInfo">\
						<Record>\
							<PropertyValue Property="TypeName" String="OrderItem" />\
							<PropertyValue Property="TypeNamePlural" String="OrderItems" />\
							<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
							<PropertyValue Property="Title">\
								<Record>\
									<PropertyValue Property="Label" String="Product Name" />\
									<PropertyValue Property="Value" Path="Product/ProductName" />\
								</Record>\
							</PropertyValue>\
							<PropertyValue Property="Description">\
								<Record>\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="No description available" />\
								</Record>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="UI.Identification">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Order" />\
								<PropertyValue Property="Value" Path="OrderID" />\
							</Record>\
							<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Item" />\
									<PropertyValue Property="Value" Path="Product/ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity" />\
								<PropertyValue Property="Value" Path="Quantity" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Discount" />\
								<PropertyValue Property="Value" Path="Discount" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
									<Annotation Term="UI.IsImageURL"/>\
								</PropertyValue>\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Name" />\
								<PropertyValue Property="Value" Path="Product/ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="Product/ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity" />\
								<PropertyValue Property="Value" Path="Quantity" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Discount" />\
								<PropertyValue Property="Value" Path="Discount" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.ReferenceFacet">\
								<PropertyValue Property="Label" String="Details" />\
								<PropertyValue Property="Target" AnnotationPath="Product/@UI.Identification" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sNorthwindData = '\<?xml version="1.0" encoding="utf-8"?>\
	<service xml:base="http://services.odata.org/V3/Northwind/Northwind.svc/" xmlns="http://www.w3.org/2007/app"\
		xmlns:atom="http://www.w3.org/2005/Atom">\
		<workspace>\
			<atom:title>Default</atom:title>\
			<collection href="Categories">\
				<atom:title>Categories</atom:title>\
			</collection>\
			<collection href="CustomerDemographics">\
				<atom:title>CustomerDemographics</atom:title>\
			</collection>\
			<collection href="Customers">\
				<atom:title>Customers</atom:title>\
			</collection>\
			<collection href="Employees">\
				<atom:title>Employees</atom:title>\
			</collection>\
			<collection href="Order_Details">\
				<atom:title>Order_Details</atom:title>\
			</collection>\
			<collection href="Orders">\
				<atom:title>Orders</atom:title>\
			</collection>\
			<collection href="Products">\
				<atom:title>Products</atom:title>\
			</collection>\
			<collection href="Regions">\
				<atom:title>Regions</atom:title>\
			</collection>\
			<collection href="Shippers">\
				<atom:title>Shippers</atom:title>\
			</collection>\
			<collection href="Suppliers">\
				<atom:title>Suppliers</atom:title>\
			</collection>\
			<collection href="Territories">\
				<atom:title>Territories</atom:title>\
			</collection>\
			<collection href="Alphabetical_list_of_products">\
				<atom:title>Alphabetical_list_of_products</atom:title>\
			</collection>\
			<collection href="Category_Sales_for_1997">\
				<atom:title>Category_Sales_for_1997</atom:title>\
			</collection>\
			<collection href="Current_Product_Lists">\
				<atom:title>Current_Product_Lists</atom:title>\
			</collection>\
			<collection href="Customer_and_Suppliers_by_Cities">\
				<atom:title>Customer_and_Suppliers_by_Cities</atom:title>\
			</collection>\
			<collection href="Invoices">\
				<atom:title>Invoices</atom:title>\
			</collection>\
			<collection href="Order_Details_Extendeds">\
				<atom:title>Order_Details_Extendeds</atom:title>\
			</collection>\
			<collection href="Order_Subtotals">\
				<atom:title>Order_Subtotals</atom:title>\
			</collection>\
			<collection href="Orders_Qries">\
				<atom:title>Orders_Qries</atom:title>\
			</collection>\
			<collection href="Product_Sales_for_1997">\
				<atom:title>Product_Sales_for_1997</atom:title>\
			</collection>\
			<collection href="Products_Above_Average_Prices">\
				<atom:title>Products_Above_Average_Prices</atom:title>\
			</collection>\
			<collection href="Products_by_Categories">\
				<atom:title>Products_by_Categories</atom:title>\
			</collection>\
			<collection href="Sales_by_Categories">\
				<atom:title>Sales_by_Categories</atom:title>\
			</collection>\
			<collection href="Sales_Totals_by_Amounts">\
				<atom:title>Sales_Totals_by_Amounts</atom:title>\
			</collection>\
			<collection href="Summary_of_Sales_by_Quarters">\
				<atom:title>Summary_of_Sales_by_Quarters</atom:title>\
			</collection>\
			<collection href="Summary_of_Sales_by_Years">\
				<atom:title>Summary_of_Sales_by_Years</atom:title>\
			</collection>\
		</workspace>\
	</service>';

	var sNorthwindMetadata = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
		<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
			xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
			<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityType Name="Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
						FromRole="Categories" />\
				</EntityType>\
				<EntityType Name="CustomerDemographic">\
					<Key>\
						<PropertyRef Name="CustomerTypeID" />\
					</Key>\
					<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
						Unicode="true" />\
					<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
						FromRole="CustomerDemographics" />\
				</EntityType>\
				<EntityType Name="Customer">\
					<Key>\
						<PropertyRef Name="CustomerID" />\
					</Key>\
					<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
						FromRole="Customers" />\
					<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
						ToRole="CustomerDemographics" FromRole="Customers" />\
				</EntityType>\
				<EntityType Name="Employee">\
					<Key>\
						<PropertyRef Name="EmployeeID" />\
					</Key>\
					<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
					<Property Name="BirthDate" Type="Edm.DateTime" />\
					<Property Name="HireDate" Type="Edm.DateTime" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
					<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="ReportsTo" Type="Edm.Int32" />\
					<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
						ToRole="Employees1" FromRole="Employees" />\
					<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
						FromRole="Employees1" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
						FromRole="Employees" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
						FromRole="Employees" />\
				</EntityType>\
				<EntityType Name="Order_Detail">\
					<Key>\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
						FromRole="Order_Details" />\
					<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Products" FromRole="Order_Details" />\
				</EntityType>\
				<EntityType Name="Order">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
						FromRole="Orders" />\
					<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
						FromRole="Orders" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
						ToRole="Order_Details" FromRole="Orders" />\
					<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
						FromRole="Orders" />\
				</EntityType>\
				<EntityType Name="Product">\
					<Key>\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
						FromRole="Products" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Order_Details" FromRole="Products" />\
					<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
						FromRole="Products" />\
				</EntityType>\
				<EntityType Name="Region">\
					<Key>\
						<PropertyRef Name="RegionID" />\
					</Key>\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
						ToRole="Territories" FromRole="Region" />\
				</EntityType>\
				<EntityType Name="Shipper">\
					<Key>\
						<PropertyRef Name="ShipperID" />\
					</Key>\
					<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
						FromRole="Shippers" />\
				</EntityType>\
				<EntityType Name="Supplier">\
					<Key>\
						<PropertyRef Name="SupplierID" />\
					</Key>\
					<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
						FromRole="Suppliers" />\
				</EntityType>\
				<EntityType Name="Territory">\
					<Key>\
						<PropertyRef Name="TerritoryID" />\
					</Key>\
					<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
					FromRole="Territories" />\
					<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
						FromRole="Territories" />\
				</EntityType>\
				<EntityType Name="Alphabetical_list_of_product">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
				</EntityType>\
				<EntityType Name="Category_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Current_Product_List">\
					<Key>\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Customer_and_Suppliers_by_City">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="Relationship" />\
					</Key>\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
				</EntityType>\
				<EntityType Name="Invoice">\
					<Key>\
						<PropertyRef Name="CustomerName" />\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="Salesperson" />\
						<PropertyRef Name="ShipperName" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Details_Extended">\
					<Key>\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Subtotal">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Orders_Qry">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Product_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_Above_Average_Price">\
					<Key>\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				</EntityType>\
				<EntityType Name="Sales_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Sales_Totals_by_Amount">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Quarter">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Year">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<Association Name="FK_Products_Categories">\
					<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Categories">\
							<PropertyRef Name="CategoryID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="CategoryID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="CustomerCustomerDemo">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
					<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Orders_Customers">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Customers">\
							<PropertyRef Name="CustomerID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="CustomerID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Employees_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Employees1">\
							<PropertyRef Name="ReportsTo" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="EmployeeID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="EmployeeTerritories">\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Order_Details_Orders">\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Orders">\
							<PropertyRef Name="OrderID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="OrderID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Order_Details_Products">\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Products">\
							<PropertyRef Name="ProductID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="ProductID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Shippers">\
					<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Shippers">\
							<PropertyRef Name="ShipperID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="ShipVia" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Products_Suppliers">\
					<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Suppliers">\
							<PropertyRef Name="SupplierID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="SupplierID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Territories_Region">\
					<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Region">\
							<PropertyRef Name="RegionID" />\
						</Principal>\
						<Dependent Role="Territories">\
							<PropertyRef Name="RegionID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
			</Schema>\
			<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
					<EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
					<EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
					<EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
					<EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
					<EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
					<EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
					<EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
					<EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
					<EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
					<EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
					<EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
					<EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
					<EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
					<EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
					<EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
					<EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
					<EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
					<EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
					<EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
					<EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
					<EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
					<EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
					<EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
					<EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
					<EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
					<EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
					<AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
						<End Role="Categories" EntitySet="Categories" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
						<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
						<End Role="Customers" EntitySet="Customers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
						<End Role="Customers" EntitySet="Customers" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Employees1" EntitySet="Employees" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
						<End Role="Orders" EntitySet="Orders" />\
						<End Role="Shippers" EntitySet="Shippers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
						<End Role="Products" EntitySet="Products" />\
						<End Role="Suppliers" EntitySet="Suppliers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
						<End Role="Region" EntitySet="Regions" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
				</EntityContainer>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sNorthwindMetadataAnnotated = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
		<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
			xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
			<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityType Name="Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
						FromRole="Categories" />\
				</EntityType>\
				<EntityType Name="CustomerDemographic">\
					<Key>\
						<PropertyRef Name="CustomerTypeID" />\
					</Key>\
					<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
						Unicode="true" />\
					<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
						FromRole="CustomerDemographics" />\
				</EntityType>\
				<EntityType Name="Customer">\
					<Key>\
						<PropertyRef Name="CustomerID" />\
					</Key>\
					<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
						FromRole="Customers" />\
					<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
						ToRole="CustomerDemographics" FromRole="Customers" />\
				</EntityType>\
				<EntityType Name="Employee">\
					<Key>\
						<PropertyRef Name="EmployeeID" />\
					</Key>\
					<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
					<Property Name="BirthDate" Type="Edm.DateTime" />\
					<Property Name="HireDate" Type="Edm.DateTime" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
					<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="ReportsTo" Type="Edm.Int32" />\
					<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
						ToRole="Employees1" FromRole="Employees" />\
					<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
						FromRole="Employees1" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
						FromRole="Employees" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
						FromRole="Employees" />\
				</EntityType>\
				<EntityType Name="Order_Detail">\
					<Key>\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
						FromRole="Order_Details" />\
					<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Products" FromRole="Order_Details" />\
				</EntityType>\
				<EntityType Name="Order">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
						FromRole="Orders" />\
					<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
						FromRole="Orders" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
						ToRole="Order_Details" FromRole="Orders" />\
					<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
						FromRole="Orders" />\
				</EntityType>\
				<EntityType Name="Product">\
					<Key>\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
						FromRole="Products" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Order_Details" FromRole="Products" />\
					<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
						FromRole="Products" />\
				</EntityType>\
				<EntityType Name="Region">\
					<Key>\
						<PropertyRef Name="RegionID" />\
					</Key>\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
						ToRole="Territories" FromRole="Region" />\
				</EntityType>\
				<EntityType Name="Shipper">\
					<Key>\
						<PropertyRef Name="ShipperID" />\
					</Key>\
					<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
						FromRole="Shippers" />\
				</EntityType>\
				<EntityType Name="Supplier">\
					<Key>\
						<PropertyRef Name="SupplierID" />\
					</Key>\
					<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
						FromRole="Suppliers" />\
				</EntityType>\
				<EntityType Name="Territory">\
					<Key>\
						<PropertyRef Name="TerritoryID" />\
					</Key>\
					<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
					FromRole="Territories" />\
					<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
						FromRole="Territories" />\
				</EntityType>\
				<EntityType Name="Alphabetical_list_of_product">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
				</EntityType>\
				<EntityType Name="Category_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Current_Product_List">\
					<Key>\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Customer_and_Suppliers_by_City">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="Relationship" />\
					</Key>\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
				</EntityType>\
				<EntityType Name="Invoice">\
					<Key>\
						<PropertyRef Name="CustomerName" />\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="Salesperson" />\
						<PropertyRef Name="ShipperName" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Details_Extended">\
					<Key>\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Subtotal">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Orders_Qry">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Product_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_Above_Average_Price">\
					<Key>\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				</EntityType>\
				<EntityType Name="Sales_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Sales_Totals_by_Amount">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Quarter">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Year">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<Association Name="FK_Products_Categories">\
					<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Categories">\
							<PropertyRef Name="CategoryID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="CategoryID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="CustomerCustomerDemo">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
					<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Orders_Customers">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Customers">\
							<PropertyRef Name="CustomerID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="CustomerID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Employees_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Employees1">\
							<PropertyRef Name="ReportsTo" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="EmployeeID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="EmployeeTerritories">\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Order_Details_Orders">\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Orders">\
							<PropertyRef Name="OrderID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="OrderID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Order_Details_Products">\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Products">\
							<PropertyRef Name="ProductID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="ProductID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Shippers">\
					<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Shippers">\
							<PropertyRef Name="ShipperID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="ShipVia" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Products_Suppliers">\
					<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Suppliers">\
							<PropertyRef Name="SupplierID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="SupplierID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Territories_Region">\
					<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Region">\
							<PropertyRef Name="RegionID" />\
						</Principal>\
						<Dependent Role="Territories">\
							<PropertyRef Name="RegionID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
			</Schema>\
			<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
					<EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
					<EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
					<EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
					<EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
					<EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
					<EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
					<EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
					<EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
					<EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
					<EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
					<EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
					<EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
					<EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
					<EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
					<EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
					<EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
					<EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
					<EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
					<EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
					<EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
					<EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
					<EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
					<EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
					<EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
					<EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
					<EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
					<AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
						<End Role="Categories" EntitySet="Categories" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
						<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
						<End Role="Customers" EntitySet="Customers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
						<End Role="Customers" EntitySet="Customers" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Employees1" EntitySet="Employees" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
						<End Role="Orders" EntitySet="Orders" />\
						<End Role="Shippers" EntitySet="Shippers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
						<End Role="Products" EntitySet="Products" />\
						<End Role="Suppliers" EntitySet="Suppliers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
						<End Role="Region" EntitySet="Regions" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
				</EntityContainer>\
			</Schema>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
				<Annotations Target="UnitTest">\
					<Annotation Term="Test.FromMetadata">\
							<Collection>\
								<Record Type="Test.DataField">\
									<PropertyValue Property="Label" String="From" />\
									<PropertyValue Property="Value" Path="Metadata" />\
								</Record>\
							</Collection>\
					</Annotation>\
					<Annotation Term="Test.Merged">\
							<Collection>\
								<Record Type="Test.DataField">\
									<PropertyValue Property="Label" String="From" />\
									<PropertyValue Property="Value" Path="Metadata" />\
								</Record>\
							</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Category/CategoryID">\
					<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="LabelString" />\
					<Annotation Term="annotationSource" String="Metadata" />\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sEPMAnnotationsComplex = '\<?xml version="1.0" encoding="UTF-8"?>\
		<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
			<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
				<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/coco/vocabularies/Communication.xml">\
				<edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="vCard" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/coco/vocabularies/Common.xml">\
				<edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common" />\
			</edmx:Reference>\
			<edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml" >\
				<edmx:Include Namespace="Org.OData.Measures.V1" Alias="CQP" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/epm_http/purchase/$metadata" >\
				<edmx:Include Namespace="EPMDemo" Alias="EPMModel" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/ODATA/IWFND/RMTSAMPLEFLIGHT/$metadata" >\
				<edmx:Include Namespace="RMTSAMPLEFLIGHT" Alias="RMTSAMPLEFLIGHT" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/sap/hba/apps/wcm/odata/wcm.xsodata/$metadata" >\
				<edmx:Include Namespace="sap.hba.apps.wcm.odata.wcm" Alias="WCM" />\
			</edmx:Reference>\
			<edmx:Reference Uri="/sap/hba/r/ecc/odata/mm/pur/PurchaseContractQueries.xsodata;o=hanasys/$metadata" >\
				<edmx:Include Namespace="sap.hba.r.ecc.odata.mm.pur.PurchaseContractQueries" Alias="PurchaseContract" />\
			</edmx:Reference>\
			<edmx:DataServices>\
				<!-- Entity Data Model Conceptual Schemas, as specified in [MC-CSDL] and annotated as specified in [MS-ODATA] -->\
				<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="com.sap.tip.pa.EPMDemoAnnotation" Alias="EPMDemoAnnotation">\
					<Term Name="PurchaseOrders" Type="Collection(EPMModel.PurchaseOrder)"/>\
					<Term Name="Product" Type="EPMModel.Product" />\
					<Term Name="Supplier" Type="EPMModel.Supplier" />\
					<Term Name="FlightCosts" Type="RMTSAMPLEFLIGHT.Flight"/>\
					<Term Name="DaysSalesOutstanding" Type="Collection(WCM.WCMDaysSalesOutstandingQueryResultsType)"/>\
					<Annotations Target="EPMModel.Product/Price/Amount">\
						<Annotation Term="CQP.ISOCurrency" Path="Price/CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrder/GrossAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrder/NetAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrder/TaxAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrderItem/GrossAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrderItem/NetAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrderItem/TaxAmount">\
						<Annotation Term="CQP.ISOCurrency" Path="CurrencyCode" />\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrderItem/Quantity">\
						<Annotation Term="CQP.Unit" Path="QuantityUnit" />\
					</Annotations>\
					<Annotations Target="EPMModel.Product/SupplierName">\
						<Annotation Term="Common.ValueList">\
							<Record>\
								<PropertyValue Property="CollectionPath" String="SupplierCollection" />\
								<PropertyValue Property="Parameters">\
									<Collection>\
										<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
											<PropertyValue Property="LocalDataProperty" PropertyPath="SupplierName" />\
											<PropertyValue Property="ValueListProperty" String="Name" />\
										</Record>\
									</Collection>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
					</Annotations>\
					<Annotations Target="EPMModel.Product">\
						<Annotation Term="UI.HeaderInfo">\
							<Record>\
								<PropertyValue Property="TypeName" String="Product" />\
								<PropertyValue Property="TypeNamePlural" String="Products" />\
								<PropertyValue Property="TypeImageUrl" String="/coco/apps/main/img/Icons/product_48.png" />\
								<PropertyValue Property="ImageUrl" Path="ImageUrl" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Product" />\
										<PropertyValue Property="Value" Path="Name" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="Description">\
									<Record>\
										<PropertyValue Property="Label" String="Description" />\
										<PropertyValue Property="Value" Path="Description" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Identification">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Product ID" />\
									<PropertyValue Property="Value" Path="ProductID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Price" />\
									<PropertyValue Property="Value" Path="Price/Amount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Category" />\
									<PropertyValue Property="Value" Path="Category" />\
								</Record>\
								<Record Type="UI.DataFieldWithNavigation">\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="SupplierName" />\
									<PropertyValue Property="Target" Path="Supplier" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.Badge">\
							<Record>\
								<PropertyValue Property="HeadLine" String="Product" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Product" />\
										<PropertyValue Property="Value" Path="Name" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="ImageUrl" Path="ImageUrl" />\
								<PropertyValue Property="TypeImageUrl" String="/coco/apps/main/img/Icons/product_48.png" />\
								<PropertyValue Property="MainInfo">\
									<Record>\
										<PropertyValue Property="Label" String="Description" />\
										<PropertyValue Property="Value" Path="Description" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.LineItem">\
							<Collection>\
								<Record Type="UI.DataField">\
									<Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High" />\
									<PropertyValue Property="Value" Path="ImageUrl">\
										<Annotation Term="UI.IsImageURL"/>\
									</PropertyValue>\
								</Record>\
								<Record Type="UI.DataField">\
									<Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High" />\
									<PropertyValue Property="Label" String="Product ID" />\
									<PropertyValue Property="Value" Path="ProductID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High" />\
									<PropertyValue Property="Label" String="Product" />\
									<PropertyValue Property="Value" Path="Name" />\
								</Record>\
								<Record Type="UI.DataField">\
									<Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High" />\
									<PropertyValue Property="Label" String="Price" />\
									<PropertyValue Property="Value" Path="Price/Amount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" Path="Description" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Category" />\
									<PropertyValue Property="Value" Path="Category" />\
								</Record>\
								<Record Type="UI.DataFieldWithNavigation">\
									<Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High" />\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="SupplierName" />\
									<PropertyValue Property="Target" Path="Supplier" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.Facets">\
							<Collection>\
								<Record Type="UI.ReferenceFacet">\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
								</Record>\
							</Collection>\
						</Annotation>\
					</Annotations>\
					<Annotations Target="EPMModel.Supplier">\
						<Annotation Term="EPMDemoAnnotation.PurchaseOrders">\
							<UrlRef>\
								<Apply Function="odata.fillUriTemplate">\
									<String>/epm_http/purchase/PurchaseOrderCollection?$filter=SupplierName eq \'{P0}\'</String>\
									<LabeledElement Name="P0">\
										<Apply Function="odata.UriEncode">\
											<Path>Name</Path>\
										</Apply>\
									</LabeledElement>\
								</Apply>\
							</UrlRef>\
						</Annotation>\
						<Annotation Term="UI.HeaderInfo">\
							<Record>\
								<PropertyValue Property="TypeName" String="Supplier" />\
								<PropertyValue Property="TypeNamePlural" String="Suppliers" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Supplier" />\
										<PropertyValue Property="Value" Path="Name" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="Description">\
									<Record>\
										<PropertyValue Property="Label" String="Description" />\
										<PropertyValue Property="Value" String="Missing in Model - This is a constant description" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Identification">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Supplier ID" />\
									<PropertyValue Property="Value" Path="SupplierID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Supplier Name" />\
									<PropertyValue Property="Value" Path="Name" />\
								</Record>\
								<Record Type="UI.DataFieldForAnnotation">\
									<PropertyValue Property="Label" String="Address" />\
									<PropertyValue Property="Target" AnnotationPath="@vCard.Address" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.Badge">\
							<Record>\
								<PropertyValue Property="HeadLine" String="Supplier" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Supplier" />\
										<PropertyValue Property="Value" Path="SupplierID" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="MainInfo">\
									<Record>\
										<PropertyValue Property="Label" String="Supplier" />\
										<PropertyValue Property="Value" Path="Name" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.LineItem">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Supplier ID" />\
									<PropertyValue Property="Value" Path="SupplierID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="Name" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Description" />\
									<PropertyValue Property="Value" String="Missing in Model - This is a constant description" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="vCard.Address">\
							<Record>\
								<PropertyValue Property="street" Path="Address/Street" />\
								<PropertyValue Property="locality" Path="Address/City" />\
								<PropertyValue Property="postalCode" Path="Address/Zip" />\
								<PropertyValue Property="country" Path="Address/Country" />\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Facets">\
							<Collection>\
								<Record Type="UI.ReferenceFacet">\
									<PropertyValue Property="Label" String="Products" />\
									<PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
								</Record>\
								<Record Type="UI.ReferenceFacet">\
									<PropertyValue Property="Label" String="Purchase Orders" />\
									<PropertyValue Property="Target" AnnotationPath="@EPMDemoAnnotation.PurchaseOrders/@UI.LineItem" />\
								</Record>\
							</Collection>\
						</Annotation>\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrder">\
						<Annotation Term="EPMDemoAnnotation.FlightCosts">\
								<UrlRef>\
										<String>/giq-100/ODATA/IWFND/RMTSAMPLEFLIGHT/FlightCollection(carrid=\'AA\',connid=\'0017\',fldate=datetime\'2011-07-20T00%3A00%3A00\')</String>\
										<!-- String>#Flight-displayKPITile?Carrier=\'AA\'&Connection=\'0017\'</String>	-->\
								</UrlRef>\
						</Annotation>\
						<Annotation Term="EPMDemoAnnotation.Supplier">\
							<UrlRef>\
								<Apply Function="odata.fillUriTemplate">\
									<String>/epm_http/purchase/SupplierCollection({supplierID})</String>\
									<LabeledElement Name="supplierID">\
										<Apply Function="odata.UriEncode">\
											<Path>SupplierID</Path>\
										</Apply>\
									</LabeledElement>\
								</Apply>\
							</UrlRef>\
						</Annotation>\
						<Annotation Term="EPMDemoAnnotation.DaysSalesOutstanding">\
								<UrlRef>\
									<String>/vs6/sap/hba/apps/wcm/odata/wcm.xsodata/WCMDaysSalesOutstandingQuery(P_AgingGridMeasureInDays=10)/Results?$select=DaysSalesOutstanding,CompanyCodeCurrency&amp;$filter=((CompanyCode%20eq%20\'1000\'))%20and%20((SAPClient%20eq%20\'777\'))%20and%20((Year%20eq%20\'2011\'))</String>\
								</UrlRef>\
							<!-- /Apply>	-->\
						</Annotation>\
						<!-- Test\
						Annotation Term="UI.GeoLocations" Qualifier="AllAddresses">\
							<Collection>\
								<Record>\
									<PropertyValue Property="Address">\
										<Record>\
											<PropertyValue Property="street" Path="Supplier/Street" />\
											<PropertyValue Property="code" Path="Supplier/ZipCode" />\
											<PropertyValue Property="locality" Path="Supplier/City" />\
											<PropertyValue Property="country" Path="Supplier/Country" />\
										</Record>\
									</PropertyValue>\
								</Record>\
								<Record>\
									<PropertyValue Property="Address">\
										<Record>\
											<PropertyValue Property="street" Path="Purchaser/Street" />\
											<PropertyValue Property="code" Path="Purchaser/ZipCode" />\
											<PropertyValue Property="locality" Path="Purchaser/City" />\
											<PropertyValue Property="country" Path="Purchaser/Country" />\
										</Record>\
									</PropertyValue>\
								</Record>\
							</Collection>\
						</Annotation>\
						Test	-->\
						<Annotation Term="UI.HeaderInfo">\
							<Record>\
								<PropertyValue Property="TypeName" String="PurchaseOrder" />\
								<PropertyValue Property="TypeNamePlural" String="PurchaseOrders" />\
								<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/ShoppingCart.gif" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Purchase Order ID" />\
										<PropertyValue Property="Value" Path="PurchaseOrderID" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="Description">\
									<Record>\
										<PropertyValue Property="Label" String="Description" />\
										<PropertyValue Property="Value">\
											<Apply Function="odata.concat">\
												<String>Order&#160;</String>\
												<Path>PurchaseOrderID</Path>\
												<String>&#160;for Supplier </String>\
												<Path>SupplierName</Path>\
											</Apply>\
										</PropertyValue>\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Identification">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Order Number" />\
									<PropertyValue Property="Value" Path="PurchaseOrderID" />\
								</Record>\
								<Record Type="UI.DataField">\
								<!--Record Type="UI.DataFieldWithNavigation">	 -->\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="SupplierName" />\
									<!-- PropertyValue Property="Target" Path="@EPMDemoAnnotation.Supplier" />	-->\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Status" />\
									<PropertyValue Property="Value" Path="OrderingStatusDesc" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Gross Amount" />\
									<PropertyValue Property="Value" Path="GrossAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Net Amount" />\
									<PropertyValue Property="Value" Path="NetAmount" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.Badge">\
							<Record>\
								<PropertyValue Property="HeadLine" String="Purchase Order" />\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Purchase Order ID" />\
										<PropertyValue Property="Value" Path="PurchaseOrderID" />\
									</Record>\
								</PropertyValue>\
								<PropertyValue Property="ImageUrl" String="/coco/apps/main/img/ShoppingCart.gif" />\
								<PropertyValue Property="MainInfo">\
									<Record>\
										<PropertyValue Property="Label" String="Description" />\
										<PropertyValue Property="Value">\
											<Apply Function="odata.concat">\
												<String>Order&#160;</String>\
												<Path>PurchaseOrderID</Path>\
												<String>&#160;for Supplier </String>\
												<Path>SupplierName</Path>\
											</Apply>\
										</PropertyValue>\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.StatusInfo">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Approval Status" />\
									<PropertyValue Property="Value" Path="ApprovalDataDesc" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Confirmation Status" />\
									<PropertyValue Property="Value" Path="ConfirmationStatusDesc" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Ordering Status" />\
									<PropertyValue Property="Value" Path="OrderingStatusDesc" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Lifecycle Status" />\
									<PropertyValue Property="Value" Path="LifecycleStatusDesc" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.LineItem">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Order Number" />\
									<PropertyValue Property="Value" Path="PurchaseOrderID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Supplier" />\
									<PropertyValue Property="Value" Path="SupplierName" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Status" />\
									<PropertyValue Property="Value" Path="OrderingStatusDesc" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Gross" />\
									<PropertyValue Property="Value" Path="GrossAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Net" />\
									<PropertyValue Property="Value" Path="NetAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Tax" />\
									<PropertyValue Property="Value" Path="TaxAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<!-- PropertyValue Property="Label" String="Purchase Order" /> -->\
									<PropertyValue Property="Value" String="/coco/apps/main/img/ShoppingCart.gif">\
										<Annotation Term="UI.IsImageURL"/>\
									</PropertyValue>\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.DataPoint" Qualifier="GrossAmount">\
							<Record>\
								<PropertyValue Property="Title" String="Gross Amount"/>\
								<PropertyValue Property="Value" Path="GrossAmount"/>\
								<PropertyValue Property="ValueFormat">\
									<Record Type="UI.NumberFormat">\
										<PropertyValue Property="ScaleFactor" Decimal="1000"/>\
										<PropertyValue Property="NumberOfFractionalDigits" Int="1" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.DataPoint" Qualifier="FlightCosts">\
							<Record>\
								<PropertyValue Property="Title" String="Cost of Flight"/>\
								<PropertyValue Property="Description" String="Flight AA-017"/>\
								<PropertyValue Property="Value" Path="@EPMDemoAnnotation.FlightCosts/PRICE">\
									<Annotation Term="CQP.ISOCurrency" String="USD" />\
									<!-- Annotation Term="CQP.ISOCurrency" Path="@EPMDemoAnnotation.FlightCosts/Currency" />	-->\
								</PropertyValue>\
								<PropertyValue Property="ValueFormat">\
									<Record Type="UI.NumberFormat">\
										<PropertyValue Property="ScaleFactor" Decimal="1"/>\
										<PropertyValue Property="NumberOfFractionalDigits" Int="2" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.DataPoint" Qualifier="ActualCosts">\
							<Record>\
								<PropertyValue Property="Title" String="Cost Center Actual Costs"/>\
								<PropertyValue Property="Value" Path="@EPMDemoAnnotation.ActualCosts/ZCOSTACTUAL0020">\
									<Annotation Term="CQP.ISOCurrency" String="EUR" />\
								</PropertyValue>\
								<PropertyValue Property="ValueFormat">\
									<Record Type="UI.NumberFormat">\
										<PropertyValue Property="ScaleFactor" Decimal="1000000"/>\
										<PropertyValue Property="NumberOfFractionalDigits" Int="2" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.DataPoint" Qualifier="DaysSalesOutstanding">\
							<Record>\
								<PropertyValue Property="Title" String="Days Sales Outstanding"/>\
								<PropertyValue Property="Value" Path="@EPMDemoAnnotation.DaysSalesOutstanding/DaysSalesOutstanding">\
									<Annotation Term="CQP.ISOCurrency" Path="@EPMDemoAnnotation.DaysSalesOutstanding/CompanyCodeCurrency" />\
								</PropertyValue>\
								<PropertyValue Property="ValueFormat">\
									<Record Type="UI.NumberFormat">\
										<PropertyValue Property="ScaleFactor" Decimal="1"/>\
										<PropertyValue Property="NumberOfFractionalDigits" Int="2" />\
									</Record>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.FieldGroup" Qualifier="Detail">\
							<Record>\
								<PropertyValue Property="Label" String="Detail" />\
								<PropertyValue Property="Data">\
									<Collection>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Lifecycle Status" />\
											<PropertyValue Property="Value" Path="LifecycleStatus" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Gross" />\
											<PropertyValue Property="Value" Path="GrossAmount" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Net" />\
											<PropertyValue Property="Value" Path="NetAmount" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Tax" />\
											<PropertyValue Property="Value" Path="TaxAmount" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Created" />\
											<PropertyValue Property="Value" Path="CreatedAt" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Creator" />\
											<PropertyValue Property="Value" Path="CreatedByName" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Changed" />\
											<PropertyValue Property="Value" Path="ChangedAt" />\
										</Record>\
										<Record Type="UI.DataField">\
											<PropertyValue Property="Label" String="Changed by" />\
											<PropertyValue Property="Value" Path="ChangedByName" />\
										</Record>\
										<Record Type="UI.DataField">\
										<!-- Record Type="UI.DataFieldWithNavigation">	-->\
											<PropertyValue Property="Label" String="Supplier" />\
											<PropertyValue Property="Value" Path="SupplierName" />\
											<!-- PropertyValue Property="Target" Path="@EPMDemoAnnotation.Supplier" />	-->\
										</Record>\
									</Collection>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Facets">\
							<Collection>\
								<Record Type="UI.CollectionFacet">\
									<PropertyValue Property="Label" String="Overview" />\
									<PropertyValue Property="Facets">\
										<Collection>\
											<Record Type="UI.ReferenceFacet">\
												<!-- PropertyValue Property="Label" String="Detail Information" />	-->\
												<PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#Detail" />\
											</Record>\
											<Record Type="UI.ReferenceFacet">\
												<PropertyValue Property="Label" String="Status" />\
												<PropertyValue Property="Target" AnnotationPath="@UI.StatusInfo" />\
											</Record>\
											<Record Type="UI.ReferenceFacet">\
												<PropertyValue Property="Label" String="Gross Amount" />\
												<PropertyValue Property="Target" AnnotationPath="@UI.DataPoint#GrossAmount" />\
											</Record>\
											<!-- <Record Type="UI.ReferenceFacet">\
												<PropertyValue Property="Label" String="Price per Flight" />\
												<PropertyValue Property="Target" AnnotationPath="@UI.DataPoint#FlightCosts" />\
											</Record> -->\
											<!-- Record Type="UI.ReferenceFacet">\
												<PropertyValue Property="Label" String="WCM - Days Sales Outstanding" />\
												<PropertyValue Property="Target" AnnotationPath="@UI.DataPoint#DaysSalesOutstanding" />\
											</Record>	-->\
											<!-- Test\
											Record Type="UI.ReferenceFacet">\
												<Annotation Term="UI.Map"/>\
												<PropertyValue Property="Label" String="Map with more than one address" />\
												<PropertyValue Property="Target" AnnotationPath="@UI.GeoLocations#AllAddresses" />\
											</Record>\
											Test -->\
										</Collection>\
									</PropertyValue>\
								</Record>\
								<Record Type="UI.ReferenceFacet">\
									<PropertyValue Property="Label" String="Order Items" />\
									<PropertyValue Property="Target" AnnotationPath="PurchaseOrder_Items/@UI.LineItem" />\
								</Record>\
							</Collection>\
						</Annotation>\
					</Annotations>\
					<Annotations Target="EPMModel.PurchaseOrderItem">\
						<Annotation Term="UI.HeaderInfo">\
							<Record>\
								<PropertyValue Property="TypeName" String="PurchaseOrderItem" />\
								<PropertyValue Property="TypeNamePlural" String="PurchaseOrderItems" />\
								<!-- PropertyValue Property="ImageUrl" Path="Product/ImageUrl" />	-->\
								<PropertyValue Property="Title">\
									<Record>\
										<PropertyValue Property="Label" String="Product Name" />\
										<PropertyValue Property="Value" Path="ProductName" />\
									</Record>\
								</PropertyValue>\
								<!--	PropertyValue Property="Description">\
									<Record>\
										<PropertyValue Property="Label" String="Product Description" />\
										<PropertyValue Property="Value" Path="Product/Description" />\
									</Record>\
								</PropertyValue> -->\
							</Record>\
						</Annotation>\
						<Annotation Term="UI.Identification">\
							<Collection>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Purchase Order" />\
									<PropertyValue Property="Value" Path="PurchaseOrderID" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Position" />\
									<PropertyValue Property="Value" Path="ItemPos" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Item" />\
									<PropertyValue Property="Value" Path="ProductName" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Quantity" />\
									<PropertyValue Property="Value" Path="Quantity" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Unit" />\
									<PropertyValue Property="Value" Path="QuantityUnit" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Delivery" />\
									<PropertyValue Property="Value" Path="DeliveryDate" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Gross" />\
									<PropertyValue Property="Value" Path="GrossAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Net" />\
									<PropertyValue Property="Value" Path="NetAmount" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.LineItem">\
							<Collection>\
		<!--				<Record Type="UI.DataField">\
									<PropertyValue Property="Value" Path="Product/ImageUrl" >\
										<Annotation Term="UI.IsImageURL"/>\
									</PropertyValue>\
								</Record>		 -->\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Position" />\
									<PropertyValue Property="Value" Path="ItemPos" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Product Name" />\
									<PropertyValue Property="Value" Path="ProductName" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Quantity" />\
									<PropertyValue Property="Value" Path="Quantity" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Delivery" />\
									<PropertyValue Property="Value" Path="DeliveryDate" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Gross" />\
									<PropertyValue Property="Value" Path="GrossAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Net" />\
									<PropertyValue Property="Value" Path="NetAmount" />\
								</Record>\
								<Record Type="UI.DataField">\
									<PropertyValue Property="Label" String="Tax" />\
									<PropertyValue Property="Value" Path="TaxAmount" />\
								</Record>\
							</Collection>\
						</Annotation>\
						<Annotation Term="UI.Facets">\
							<Collection>\
								<Record Type="UI.ReferenceFacet">\
									<PropertyValue Property="Label" String="Details" />\
									<PropertyValue Property="Target" AnnotationPath="Product/@UI.Identification" />\
								</Record>\
							</Collection>\
						</Annotation>\
					</Annotations>\
				</Schema>\
			</edmx:DataServices>\
		</edmx:Edmx>';

	var sTestApplyFunctionAnnotations = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/Communication.xml">\
			<edmx:Include Alias="vCard" Namespace="com.sap.vocabularies.Communication.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml">\
			<edmx:Include Alias="CQP" Namespace="Org.OData.Measures.V1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/Common.xml">\
			<edmx:Include Alias="Common" Namespace="com.sap.vocabularies.Common.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/opu/odata/sap/FTGEN_HB_TE/$metadata">\
			<edmx:Include Alias="FTGEN_HB_TE" Namespace="FTGEN_HB_TE"/>\
		</edmx:Reference>\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
		<Annotations Target="Test.2014-12-08">\
			<Annotation Term="UI.Identification">\
				<Collection>\
					<Record Type=\'UI.DataField\'>\
						<Annotation Term=\'UI.Importance\' EnumMember=\'UI.Priority/High\'/>\
						<PropertyValue Property=\'Value\'>\
							<Apply Function=\'odata.concat\'>\
								<Path>CompanyCodeTESet/ContactPerson</Path>\
								<String> (</String>\
								<Path>CompanyCode</Path>\
								<String>)</String>\
							</Apply>\
						</PropertyValue>\
					</Record>\
				</Collection>\
			</Annotation>\
		</Annotations>\
		</Schema>\
	</edmx:DataServices>\
	</edmx:Edmx>';

	var sMultiplePropertyAnnotations = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="MultiplePropertyAnnotations.Product/Price/Amount">\
					<Annotation Term="CQP.ISOCurrency" Path="Price/CurrencyCode"/>\
				</Annotations>\
				<Annotations Target="MultiplePropertyAnnotations.Product/Price/Amount">\
					<Annotation Term="Common.Label" String="Price"/>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sPropertyAnnotationQualifiers = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="PropertyAnnotationQualifiers.Product/Price/Amount">\
					<Annotation Term="CQP.ISOCurrency" Path="Price/CurrencyCode" Qualifier="Amount1"/>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';


	var sOtherPropertyValues = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="OtherPropertyValues.Product/Price/Amount">\
					<Annotation Term="CQP.ISOCurrency" Qualifier="Amount2">\
						<String>EUR</String>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';



	var sNamespaceAliases = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/coco/vocabularies/Common.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common" />\
		</edmx:Reference>\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="NamespaceAliases.PurchaseOrder/GrossAmount">\
					<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Gross Amount" />\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';


	var sOtherPropertyValueAliases = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/Communication.xml">\
			<edmx:Include Alias="vCard" Namespace="com.sap.vocabularies.Communication.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml">\
			<edmx:Include Alias="CQP" Namespace="Org.OData.Measures.V1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/Common.xml">\
			<edmx:Include Alias="Common" Namespace="com.sap.vocabularies.Common.v1"/>\
		</edmx:Reference>\
		<edmx:Reference Uri="/sap/opu/odata/sap/FTGEN_HB_TE/$metadata">\
			<edmx:Include Alias="FTGEN_HB_TE" Namespace="FTGEN_HB_TE"/>\
		</edmx:Reference>\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="OtherPropertyValueAliases.Test/Value">\
					<Annotation Term="UI.Name">\
						<EnumMember>UI.Value</EnumMember>\
					</Annotation>\
					<Annotation Term="vCard.Name">\
						<EnumMember>vCard.Value</EnumMember>\
					</Annotation>\
					<Annotation Term="CQP.Name">\
						<EnumMember>CQP.Value</EnumMember>\
					</Annotation>\
					<Annotation Term="Common.Name">\
						<EnumMember>Common.Value</EnumMember>\
					</Annotation>\
					<Annotation Term="FTGEN_HB_TE.Name">\
						<EnumMember>FTGEN_HB_TE.Value</EnumMember>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sOtherPropertyTextNodes = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edmx:Reference>\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="OtherPropertyValueAliases.Test/Value">\
					<Annotation Term="UI.Name1">\
						<EnumMember>       \
							UI.Value            \
						</EnumMember>\
					</Annotation>\
					<Annotation Term="UI.Name2">\
						<String>   test test   </String>\
					</Annotation>\
					<Annotation Term="UI.Name3">\
						<Invalid>UI.Value</Invalid>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';


	var sMetadataWithEntityContainers = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">\
		<edmx:Reference Uri="https://https:/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"/>\
		<edmx:DataServices m:DataServiceVersion="2.0">\
			<Schema Namespace="AIVS_NEW_BO_SRV" sap:schema-version="1" xml:lang="en" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityType Name="SalesOrderType" sap:content-version="1">\
					<Key>\
						<PropertyRef Name="DraftKeySalesOrder"/>\
						<PropertyRef Name="KeySalesOrder"/>\
					</Key>\
					<Property Name="DraftKeySalesOrder" Nullable="false" Type="Edm.Guid" sap:creatable="false" sap:label="Draft Key (tech.)" sap:updatable="false"/>\
					<Property MaxLength="10" Name="KeySalesOrder" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Active Key (tech.)" sap:updatable="false"/>\
					<Property MaxLength="10" Name="SalesOrderID" Type="Edm.String" sap:creatable="false" sap:label="Sales Order ID" sap:updatable="false"/>\
					<Property MaxLength="10" Name="BusinessPartnerID" Type="Edm.String" sap:label="Business Partner ID"/>\
					<Property MaxLength="5" Name="CurrencyCode" Type="Edm.String" sap:label="Currency Code" sap:semantics="currency-code"/>\
					<Property Name="GrossAmount" Precision="15" Scale="2" Type="Edm.Decimal" sap:label="Gross Amount" sap:unit="CurrencyCode"/>\
					<Property Name="NetAmount" Precision="15" Scale="2" Type="Edm.Decimal" sap:label="Net Amount" sap:unit="CurrencyCode"/>\
					<Property Name="TaxAmount" Precision="15" Scale="2" Type="Edm.Decimal" sap:label="Tax Amount" sap:unit="CurrencyCode"/>\
					<Property MaxLength="1" Name="LifecycleStatus" Type="Edm.String" sap:creatable="false" sap:label="Lifecycle Status" sap:updatable="false"/>\
					<Property MaxLength="1" Name="BillingStatus" Type="Edm.String" sap:creatable="false" sap:label="Confirmation Status" sap:updatable="false"/>\
					<Property MaxLength="1" Name="DeliveryStatus" Type="Edm.String" sap:creatable="false" sap:label="Ordering Status" sap:updatable="false"/>\
					<Property MaxLength="35" Name="OpportunityID" Type="Edm.String" sap:label="Opportunity ID"/>\
					<Property Name="CreationDateTime" Precision="7" Type="Edm.DateTime" sap:creatable="false" sap:label="Created at" sap:updatable="false"/>\
					<Property MaxLength="12" Name="CreationUserName" Type="Edm.String" sap:creatable="false" sap:label="Created by" sap:updatable="false"/>\
					<Property Name="LastChangedDateTime" Precision="7" Type="Edm.DateTime" sap:creatable="false" sap:label="Changed at" sap:updatable="false"/>\
					<Property MaxLength="12" Name="LastChangedUserName" Type="Edm.String" sap:creatable="false" sap:label="Changed by" sap:updatable="false"/>\
					<Property Name="EditState" Type="Edm.Byte" sap:creatable="false" sap:label="Edit State (tech.)" sap:updatable="false"/>\
					<Property MaxLength="3" Name="BusinessPartnerRole" Type="Edm.String" sap:creatable="false" sap:label="Role" sap:updatable="false"/>\
					<Property MaxLength="255" Name="MailAddress" Type="Edm.String" sap:creatable="false" sap:label="E-Mail" sap:updatable="false"/>\
					<Property MaxLength="30" Name="PhoneNumber" Type="Edm.String" sap:creatable="false" sap:label="Phone No." sap:updatable="false"/>\
					<Property MaxLength="30" Name="FaxNumber" Type="Edm.String" sap:creatable="false" sap:label="Fax No." sap:updatable="false"/>\
					<Property MaxLength="80" Name="CompanyName" Type="Edm.String" sap:creatable="false" sap:label="Company" sap:updatable="false"/>\
					<Property MaxLength="10" Name="LegalForm" Type="Edm.String" sap:creatable="false" sap:label="Legal Form" sap:updatable="false"/>\
					<NavigationProperty FromRole="FromRole_toItem" Name="Item" Relationship="AIVS_NEW_BO_SRV.toItem" ToRole="ToRole_toItem"/>\
					<NavigationProperty FromRole="FromRole_toTwinEntity" Name="TwinEntity" Relationship="AIVS_NEW_BO_SRV.toTwinEntity" ToRole="ToRole_toTwinEntity"/>\
					<NavigationProperty FromRole="FromRole_toDraftAdministrativeData" Name="DraftAdministrativeData" Relationship="AIVS_NEW_BO_SRV.toDraftAdministrativeData" ToRole="ToRole_toDraftAdministrativeData"/>\
				</EntityType>\
				<EntityType Name="SalesOrderItemType" sap:content-version="1">\
					<Key>\
						<PropertyRef Name="DraftKeySalesOrderItem"/>\
						<PropertyRef Name="KeySalesOrder"/>\
						<PropertyRef Name="KeySalesOrderItem"/>\
					</Key>\
					<Property Name="DraftKeySalesOrderItem" Nullable="false" Type="Edm.Guid" sap:creatable="false" sap:label="Draft Key (tech.)" sap:updatable="false"/>\
					<Property MaxLength="10" Name="SalesOrderID" Type="Edm.String" sap:creatable="false" sap:label="Sales Order ID" sap:updatable="false"/>\
					<Property MaxLength="10" Name="KeySalesOrder" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Active Key (tech.)" sap:updatable="false"/>\
					<Property MaxLength="10" Name="SalesOrderItemID" Type="Edm.String" sap:label="Item ID"/>\
					<Property MaxLength="10" Name="KeySalesOrderItem" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Active Key (tech.)" sap:updatable="false"/>\
					<Property MaxLength="10" Name="ProductID" Type="Edm.String" sap:label="Product ID"/>\
					<Property Name="Quantity" Precision="13" Scale="3" Type="Edm.Decimal" sap:label="Quantity" sap:unit="QuantityUnitCode"/>\
					<Property MaxLength="3" Name="QuantityUnitCode" Type="Edm.String" sap:label="Unit of Measure" sap:semantics="unit-of-measure"/>\
					<Property Name="DeliveryDate" Precision="7" Type="Edm.DateTime" sap:label="Delivery Date"/>\
					<Property MaxLength="5" Name="CurrencyCode" Type="Edm.String" sap:label="Currency Code" sap:semantics="currency-code"/>\
					<Property Name="GrossAmount" Precision="16" Scale="3" Type="Edm.Decimal" sap:label="Gross Amount" sap:unit="CurrencyCode"/>\
					<Property Name="NetAmount" Precision="16" Scale="3" Type="Edm.Decimal" sap:label="Net Amount" sap:unit="CurrencyCode"/>\
					<Property Name="TaxAmount" Precision="16" Scale="3" Type="Edm.Decimal" sap:label="Tax Amount" sap:unit="CurrencyCode"/>\
					<Property MaxLength="1" Name="AvailableToPromiseStatus" Type="Edm.String" sap:creatable="false" sap:label="ATP Status" sap:updatable="false"/>\
					<Property MaxLength="10" Name="OpportunityItemID" Type="Edm.String" sap:label="Opportunity Item ID"/>\
					<Property Name="EditState" Type="Edm.Byte" sap:creatable="false" sap:label="Edit State (tech.)" sap:updatable="false"/>\
					<Property MaxLength="2" Name="TypeCode" Type="Edm.String" sap:creatable="false" sap:label="Type Code" sap:updatable="false"/>\
					<Property MaxLength="40" Name="Category" Type="Edm.String" sap:creatable="false" sap:label="Category" sap:updatable="false"/>\
					<Property Name="TaxTarifCode" Type="Edm.Byte" sap:creatable="false" sap:label="Tax Tarif Code" sap:updatable="false"/>\
					<Property MaxLength="3" Name="MeasureUnit" Type="Edm.String" sap:creatable="false" sap:label="Unit of Measure" sap:semantics="unit-of-measure" sap:updatable="false"/>\
					<Property Name="WeightMeasure" Precision="13" Scale="3" Type="Edm.Decimal" sap:creatable="false" sap:label="Weight" sap:unit="MeasureUnit" sap:updatable="false"/>\
					<Property MaxLength="3" Name="WeightUnit" Type="Edm.String" sap:creatable="false" sap:label="Unit of Measure" sap:semantics="unit-of-measure" sap:updatable="false"/>\
					<Property MaxLength="255" Name="PictureURL" Type="Edm.String" sap:creatable="false" sap:label="Image" sap:semantics="photo" sap:updatable="false"/>\
					<Property Name="Width" Precision="13" Scale="3" Type="Edm.Decimal" sap:creatable="false" sap:label="Width" sap:unit="DimensionUnit" sap:updatable="false"/>\
					<Property Name="Depth" Precision="13" Scale="3" Type="Edm.Decimal" sap:creatable="false" sap:label="Depth" sap:unit="DimensionUnit" sap:updatable="false"/>\
					<Property Name="Height" Precision="13" Scale="3" Type="Edm.Decimal" sap:creatable="false" sap:label="Height" sap:unit="DimensionUnit" sap:updatable="false"/>\
					<Property MaxLength="3" Name="DimensionUnit" Type="Edm.String" sap:creatable="false" sap:label="Dimension Unit" sap:semantics="unit-of-measure" sap:updatable="false"/>\
					<Property MaxLength="255" Name="Description" Type="Edm.String" sap:creatable="false" sap:label="Description" sap:updatable="false"/>\
					<NavigationProperty FromRole="FromRole_toItemTwinEntity" Name="TwinEntity" Relationship="AIVS_NEW_BO_SRV.toItemTwinEntity" ToRole="ToRole_toItemTwinEntity"/>\
					<NavigationProperty FromRole="FromRole_toItemDraftAdministrativeData" Name="DraftAdministrativeData" Relationship="AIVS_NEW_BO_SRV.toItemDraftAdministrativeData" ToRole="ToRole_toItemDraftAdministrativeData"/>\
				</EntityType>\
				<EntityType Name="DraftAdministrativeDataType" sap:content-version="1">\
					<Key>\
						<PropertyRef Name="DraftID"/>\
					</Key>\
					<Property Name="DraftID" Nullable="false" Type="Edm.Binary" sap:creatable="false" sap:label="Draft ID" sap:updatable="false"/>\
					<Property Name="CreationDateTime" Precision="7" Type="Edm.DateTime" sap:creatable="false" sap:label="Created at" sap:updatable="false"/>\
					<Property MaxLength="12" Name="CreationUserName" Type="Edm.String" sap:creatable="false" sap:label="Created by" sap:updatable="false"/>\
					<Property Name="LastChangedDateTime" Precision="7" Type="Edm.DateTime" sap:creatable="false" sap:label="Last changed at" sap:updatable="false"/>\
					<Property MaxLength="12" Name="LastChangedUserName" Type="Edm.String" sap:creatable="false" sap:label="Last changed by" sap:updatable="false"/>\
					<Property Name="ProcessedSinceDateTime" Precision="7" Type="Edm.DateTime" sap:creatable="false" sap:label="Processed since" sap:updatable="false"/>\
					<Property MaxLength="12" Name="ProcessorUserName" Type="Edm.String" sap:creatable="false" sap:label="Processed by" sap:updatable="false"/>\
				</EntityType>\
				<ComplexType Name="ValidationResult">\
					<Property Name="IsValid" Nullable="false" Type="Edm.Boolean" sap:creatable="false" sap:filterable="false" sap:label="Indicator" sap:sortable="false" sap:updatable="false"/>\
				</ComplexType>\
				<Association Name="toItem" sap:content-version="1">\
					<End Multiplicity="1" Role="FromRole_toItem" Type="AIVS_NEW_BO_SRV.SalesOrderType"/>\
					<End Multiplicity="*" Role="ToRole_toItem" Type="AIVS_NEW_BO_SRV.SalesOrderItemType"/>\
				</Association>\
				<Association Name="toTwinEntity" sap:content-version="1">\
					<End Multiplicity="0..1" Role="FromRole_toTwinEntity" Type="AIVS_NEW_BO_SRV.SalesOrderType"/>\
					<End Multiplicity="0..1" Role="ToRole_toTwinEntity" Type="AIVS_NEW_BO_SRV.SalesOrderType"/>\
				</Association>\
				<Association Name="toDraftAdministrativeData" sap:content-version="1">\
					<End Multiplicity="1" Role="FromRole_toDraftAdministrativeData" Type="AIVS_NEW_BO_SRV.SalesOrderType"/>\
					<End Multiplicity="0..1" Role="ToRole_toDraftAdministrativeData" Type="AIVS_NEW_BO_SRV.DraftAdministrativeDataType"/>\
				</Association>\
				<Association Name="toItemTwinEntity" sap:content-version="1">\
					<End Multiplicity="0..1" Role="FromRole_toItemTwinEntity" Type="AIVS_NEW_BO_SRV.SalesOrderItemType"/>\
					<End Multiplicity="0..1" Role="ToRole_toItemTwinEntity" Type="AIVS_NEW_BO_SRV.SalesOrderItemType"/>\
				</Association>\
				<Association Name="toItemDraftAdministrativeData" sap:content-version="1">\
					<End Multiplicity="1" Role="FromRole_toItemDraftAdministrativeData" Type="AIVS_NEW_BO_SRV.SalesOrderItemType"/>\
					<End Multiplicity="0..1" Role="ToRole_toItemDraftAdministrativeData" Type="AIVS_NEW_BO_SRV.DraftAdministrativeDataType"/>\
				</Association>\
				<EntityContainer Name="AIVS_NEW_BO_SRV_Entities" m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">\
					<EntitySet EntityType="AIVS_NEW_BO_SRV.SalesOrderItemType" Name="SalesOrderItem" sap:content-version="1" sap:searchable="true"/>\
					<EntitySet EntityType="AIVS_NEW_BO_SRV.DraftAdministrativeDataType" Name="DraftAdministrativeData" sap:addressable="false" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:pageable="false" sap:updatable="false"/>\
					<EntitySet EntityType="AIVS_NEW_BO_SRV.SalesOrderType" Name="SalesOrder" sap:content-version="1" sap:searchable="true"/>\
					<AssociationSet Association="AIVS_NEW_BO_SRV.toItem" Name="toItem" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
						<End EntitySet="SalesOrder" Role="FromRole_toItem"/>\
						<End EntitySet="SalesOrderItem" Role="ToRole_toItem"/>\
					</AssociationSet>\
					<AssociationSet Association="AIVS_NEW_BO_SRV.toItemDraftAdministrativeData" Name="toItemDraftAdministrativeData" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
						<End EntitySet="SalesOrderItem" Role="FromRole_toItemDraftAdministrativeData"/>\
						<End EntitySet="DraftAdministrativeData" Role="ToRole_toItemDraftAdministrativeData"/>\
					</AssociationSet>\
					<AssociationSet Association="AIVS_NEW_BO_SRV.toItemTwinEntity" Name="toItemTwinEntity" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
						<End EntitySet="SalesOrderItem" Role="FromRole_toItemTwinEntity"/>\
						<End EntitySet="SalesOrderItem" Role="ToRole_toItemTwinEntity"/>\
					</AssociationSet>\
					<AssociationSet Association="AIVS_NEW_BO_SRV.toTwinEntity" Name="toTwinEntity" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
						<End EntitySet="SalesOrder" Role="FromRole_toTwinEntity"/>\
						<End EntitySet="SalesOrder" Role="ToRole_toTwinEntity"/>\
					</AssociationSet>\
					<AssociationSet Association="AIVS_NEW_BO_SRV.toDraftAdministrativeData" Name="toDraftAdministrativeData" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
						<End EntitySet="SalesOrder" Role="FromRole_toDraftAdministrativeData"/>\
						<End EntitySet="DraftAdministrativeData" Role="ToRole_toDraftAdministrativeData"/>\
					</AssociationSet>\
					<FunctionImport EntitySet="SalesOrder" Name="Edit" ReturnType="AIVS_NEW_BO_SRV.SalesOrderType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType">\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
					</FunctionImport>\
					<FunctionImport Name="Validate" ReturnType="AIVS_NEW_BO_SRV.ValidationResult" m:HttpMethod="GET" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType">\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrder" Name="Prepare" ReturnType="AIVS_NEW_BO_SRV.SalesOrderType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType">\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrder" Name="Activate" ReturnType="AIVS_NEW_BO_SRV.SalesOrderType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType">\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrderItem" Name="PrepareItem" ReturnType="AIVS_NEW_BO_SRV.SalesOrderItemType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderItemType">\
						<Parameter Mode="In" Name="DraftKeySalesOrderItem" Type="Edm.Guid"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrderItem" Type="Edm.String"/>\
					</FunctionImport>\
					<FunctionImport Name="ValidateItem" ReturnType="AIVS_NEW_BO_SRV.ValidationResult" m:HttpMethod="GET" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderItemType">\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrderItem" Type="Edm.String"/>\
						<Parameter Mode="In" Name="DraftKeySalesOrderItem" Type="Edm.Guid"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrder" Name="CalculateGrossAmount" ReturnType="AIVS_NEW_BO_SRV.SalesOrderType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType" sap:label="Calculate Gross Amount">\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrder" Name="Copy" ReturnType="AIVS_NEW_BO_SRV.SalesOrderType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderType" sap:label="Copy">\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
						<Parameter Mode="In" Name="DraftKeySalesOrder" Type="Edm.Guid"/>\
					</FunctionImport>\
					<FunctionImport EntitySet="SalesOrderItem" Name="CopyItem" ReturnType="AIVS_NEW_BO_SRV.SalesOrderItemType" m:HttpMethod="POST" sap:action-for="AIVS_NEW_BO_SRV.SalesOrderItemType" sap:label="Copy Item">\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrderItem" Type="Edm.String"/>\
						<Parameter MaxLength="10" Mode="In" Name="KeySalesOrder" Type="Edm.String"/>\
						<Parameter Mode="In" Name="DraftKeySalesOrderItem" Type="Edm.Guid"/>\
					</FunctionImport>\
				</EntityContainer>\
				<Annotations Target="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/SalesOrder" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
					<Annotation Term="com.sap.vocabularies.Common.v1.DraftRoot">\
						<Record>\
							<PropertyValue Property="ActivationAction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Activate"/>\
							<PropertyValue Property="EditAction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Edit"/>\
							<PropertyValue Property="ValidationFunction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Validate"/>\
							<PropertyValue Property="PreparationAction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Prepare"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/SalesOrderItem" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
					<Annotation Term="com.sap.vocabularies.Common.v1.DraftNode">\
						<Record>\
							<PropertyValue Property="ValidationFunction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/ValidateSOI"/>\
							<PropertyValue Property="PreparationAction" String="AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/PrepareSOI"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="com.sap.vocabularies.Common.v1.DraftActivationVia">\
						<Collection>\
							<String>AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/SalesOrder</String>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="AIVS_NEW_BO_SRV.SalesOrderType" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
					<Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey">\
						<Collection>\
							<PropertyPath>SalesOrderID</PropertyPath>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="AIVS_NEW_BO_SRV.SalesOrderItemType" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
					<Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey">\
						<Collection>\
							<PropertyPath>SalesOrderID</PropertyPath>\
							<PropertyPath>SalesOrderItemID</PropertyPath>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<atom:link href="https://https:/sap/opu/odata/sap/AIVS_UNION_SRV/$metadata" rel="self" xmlns:atom="http://www.w3.org/2005/Atom"/>\
				<atom:link href="https://https:/sap/opu/odata/sap/AIVS_UNION_SRV/$metadata" rel="latest-version" xmlns:atom="http://www.w3.org/2005/Atom"/>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';


	var sSimpleValues = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edmx:Reference>\
		<edmx:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="SimpleValues.Test">\
					<Annotation Term="UI.Name1">\
						<PropertyValue Property="Url">\
							<Apply Function="odata.fillUriTemplate">\
								<String><![CDATA[#Supplier-displayFactSheet?Supplier={ID1}]]></String>\
								<LabeledElement Name="ID1">\
									<Path>Supplier</Path>\
								</LabeledElement>\
							</Apply>\
						</PropertyValue>\
					</Annotation>\
			\
					<Annotation Term="UI.Name2">\
						<PropertyValue Property="Url">\
							<Apply Function="odata.fillUriTemplate">\
								<String><![CDATA[#Supplier-displayFactSheet?Supplier={ID1}]]></String>\
								<LabeledElement Name="ID1" Path="Supplier" />\
							</Apply>\
						</PropertyValue>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var sCollectionWithNamespace = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" Version="4.0">\
		<edm:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edm:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edm:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="CollectionWithNamespace.Test/Value">\
					<Annotation Term="UI.TestNoNS">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category" />\
								<PropertyValue Property="Value" Path="Category/CategoryName" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="Supplier/CompanyName" />\
								<PropertyValue Property="Target" Path="Supplier" />\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="UI.TestNS">\
						<edm:Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Quantity / Unit" />\
								<PropertyValue Property="Value" Path="QuantityPerUnit" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Unit Price" />\
								<PropertyValue Property="Value" Path="UnitPrice" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Category" />\
								<PropertyValue Property="Value" Path="Category/CategoryName" />\
							</Record>\
							<Record Type="UI.DataFieldWithNavigation">\
								<PropertyValue Property="Label" String="Supplier" />\
								<PropertyValue Property="Value" Path="Supplier/CompanyName" />\
								<PropertyValue Property="Target" Path="Supplier" />\
							</Record>\
						</edm:Collection>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sUrlRefTest = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" Version="4.0">\
		<edm:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edm:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edm:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="UrlTest">\
					<Annotation Term="com.sap.vocabularies.UI.v1.Identification">\
						<Collection>\
							<Record Type="com.sap.vocabularies.UI.v1.DataField">\
								<PropertyValue Property="Label" String="ID"/>\
								<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
							</Record>\
							<Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation">\
								<PropertyValue Property="Label" String="Address"/>\
								<PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.Communication.v1.Address"/>\
							</Record>\
							<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
								<PropertyValue Property="Label" String="Link to"/>\
								<PropertyValue Property="Value" String="Google Maps"/>\
								<PropertyValue Property="Url">\
									<UrlRef>\
										<Apply Function="odata.fillUriTemplate">\
											<String>https://www.google.de/maps/place/{street},{city}</String>\
											<LabeledElement Name="street">\
												<Apply Function="odata.uriEncode">\
													<Path>Address/Street</Path>\
												</Apply>\
											</LabeledElement>\
											<LabeledElement Name="city">\
												<Apply Function="odata.uriEncode">\
													<Path>Address/City</Path>\
												</Apply>\
											</LabeledElement>\
										</Apply>\
									</UrlRef>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
		</edm:DataServices>\
	</edm:Edm>';


	var sUrlRefTest = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" Version="4.0">\
		<edm:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edm:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edm:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="UrlTest">\
					<Annotation Term="com.sap.vocabularies.UI.v1.Identification">\
						<Collection>\
							<Record Type="com.sap.vocabularies.UI.v1.DataField">\
								<PropertyValue Property="Label" String="ID"/>\
								<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
							</Record>\
							<Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation">\
								<PropertyValue Property="Label" String="Address"/>\
								<PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.Communication.v1.Address"/>\
							</Record>\
							<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
								<PropertyValue Property="Label" String="Link to"/>\
								<PropertyValue Property="Value" String="Google Maps"/>\
								<PropertyValue Property="Url">\
									<UrlRef>\
										<Apply Function="odata.fillUriTemplate">\
											<String>https://www.google.de/maps/place/{street},{city}</String>\
											<LabeledElement Name="street">\
												<Apply Function="odata.uriEncode">\
													<Path>Address/Street</Path>\
												</Apply>\
											</LabeledElement>\
											<LabeledElement Name="city">\
												<Apply Function="odata.uriEncode">\
													<Path>Address/City</Path>\
												</Apply>\
											</LabeledElement>\
										</Apply>\
									</UrlRef>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sMultipleTest01 = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" xmlns:xml="http://www.w3.org/XML/1998/namespace" Version="4.0">\
		<edmx:Reference Uri="/some/path/Test.xml">\
			<edmx:Include Alias="Test" Namespace="internal.ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.MultipleAnnotations">\
					<Annotation Term="Test.FromAll">\
						<String>First</String>\
					</Annotation>\
					<Annotation Term="Test.FromFirst">\
						<String>First</String>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sMultipleTest02 = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"  Version="4.0">\
		<edmx:Reference Uri="/some/path/Test.xml">\
			<edmx:Include Alias="Test" Namespace="internal.ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.MultipleAnnotations">\
					<Annotation Term="Test.FromAll">\
						<String>Second</String>\
					</Annotation>\
					<Annotation Term="Test.FromSecond">\
						<String>Second</String>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sMultipleTest03 = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"  Version="4.0">\
		<edmx:Reference Uri="/some/path/Test.xml">\
			<edmx:Include Alias="Test" Namespace="internal.ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
			<Annotations Target="Test.MultipleAnnotations">\
				<Annotation Term="Test.FromAll">\
					<String>Third</String>\
				</Annotation>\
				<Annotation Term="Test.FromThird">\
					<String>Third</String>\
				</Annotation>\
			</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';



	var sAliasesTest = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"  Version="4.0">\
		<edmx:Reference Uri="/some/path/Test.xml">\
			<edmx:Include Alias="TEST" Namespace="internal.ui5.test"/>\
			<edmx:Include Alias="SUFFIX_TEST" Namespace="internal.ui5.test"/>\
			<edmx:Include Alias="TEST_PREFIX" Namespace="internal.ui5.test"/>\
			<edmx:Include Alias="IN_TEST_FIX" Namespace="internal.ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.AliasReplacement">\
					<Annotation Term="TestAnnotation">\
					<Record>\
						<PropertyValue Property="NotReplaced">\
						<Collection>\
							<AnnotationPath>@TEST.Value</AnnotationPath>\
							<AnnotationPath>@IN_TEST_FIX.Value1</AnnotationPath>\
							<AnnotationPath>@TEST_PREFIX.Value2</AnnotationPath>\
						</Collection>\
						</PropertyValue>\
						<PropertyValue Property="Replaced" AnnotationPath="@SUFFIX_TEST.Value"/>\
					</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';



	var sDynamicExpressionsTest = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edm:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edm:Include Alias="UI" Namespace="com.sap.vocabularies.UI.v1"/>\
		</edm:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="DynamicExpressions">\
					<Annotation Term="org.example.person.Gender">\
					<If>\
						<Path>IsFemale</Path>\
						<String>Female</String>\
						<String>Male</String>\
					</If>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sDynamicExpressionsTest2 = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="com.sap.vocabularies.Test.v1"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="DynamicExpressions2">\
					<Annotation Term="Test.Data">\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<And>\
									<Or>\
										<Eq>\
											<Lt>\
												<Not>\
													<Path>p1</Path>\
												</Not>\
												<Path>p2</Path>\
											</Lt>\
											<Path>p3</Path>\
										</Eq>\
										<Gt>\
											<Path>p4</Path>\
											<Path>p5</Path>\
										</Gt>\
									</Or>\
									<Ne>\
										<Ge>\
											<Path>p6</Path>\
											<Path>p7</Path>\
										</Ge>\
										<Le>\
											<Path>p8</Path>\
											<Path>p9</Path>\
										</Le>\
									</Ne>\
								</And>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sCollectionsWithSimpleValuesTest = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="com.sap.vocabularies.Test.v1"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="CollectionsWithSimpleValues">\
					<Annotation Term="Test.Data">\
						<Collection>\
							<String>String01</String>\
							<String>String02</String>\
							<String>String03</String>\
						</Collection>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sSimpleValuesTest2 = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="com.sap.vocabularies.Test.v1"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="SimpleValues">\
					<Annotation Term="Test.Data">\
						<String>String01</String>\
						<String>String02</String>\
						<String>String03</String>\
						<Path>Path01</Path>\
						<Path>Path02</Path>\
						<Int>1</Int>\
						<Int>2</Int>\
						<Int>3</Int>\
						<Int>4</Int>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sIfInApply = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="com.sap.vocabularies.Test.v1"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="IfInApply">\
					<Annotation Term="Test.Data">\
						<Record>\
							<PropertyValue Property="Value">\
								<Apply Function="odata.concat">\
									<If>\
										<Eq>\
											<Path>Sex</Path>\
											<String>M</String>\
										</Eq>\
										<String>Mr. </String>\
										<If>\
											<Eq>\
												<Path>Sex</Path>\
												<String>F</String>\
											</Eq>\
											<String>Mrs. </String>\
											<String></String>\
										</If>\
									</If>\
									<Path>FirstName</Path>\
									<String/>\
									<Path>LastName</Path>\
								</Apply>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sLabeledElementOtherValues = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="com.sap.vocabularies.Test.v1"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="LabeledElement">\
					<Annotation Term="Test.Data">\
						<Record Type="Test.Data.DataFieldWithUrl">\
							<PropertyValue Property="Url">\
								<UrlRef>\
									<Apply Function="odata.fillUriTemplate">\
										<String><![CDATA[#{Bool}/{Date}/{DateTimeOffset}/{Decimal}/{Float}/{Guid}/{Int}/{Path}/{String}/{TimeOfDay}]]></String>\
										<LabeledElement Name="Bool">\
											<Bool>true</Bool>\
										</LabeledElement>\
										<LabeledElement Name="Date">\
											<Date>2015-03-24</Date>\
										</LabeledElement>\
										<LabeledElement Name="DateTimeOffset">\
											<DateTimeOffset>2015-03-24T14:03:27Z</DateTimeOffset>\
										</LabeledElement>\
										<LabeledElement Name="Decimal">\
											<Decimal>-123456789012345678901234567890.1234567890</Decimal>\
										</LabeledElement>\
										<LabeledElement Name="Float">\
											<Float>-7.4503e-36</Float>\
										</LabeledElement>\
										<LabeledElement Name="Guid">\
											<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid>\
										</LabeledElement>\
										<LabeledElement Name="Int">\
											<Int>9007199254740992</Int>\
										</LabeledElement>\
										<LabeledElement Name="Path">\
											<Path>BusinessPartnerID</Path>\
										</LabeledElement>\
										<LabeledElement Name="String">\
											<String>hello, world</String>\
										</LabeledElement>\
										<LabeledElement Name="TimeOfDay">\
											<TimeOfDay>13:57:06</TimeOfDay>\
										</LabeledElement>\
									</Apply>\
								</UrlRef>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sApplyInIf = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="ApplyInIf">\
					<Annotation Term="Test.1">\
						<Record Type="Value">\
							<PropertyValue Property="Value">\
								<If>\
									<Ne>\
										<Path>EmailAddress</Path>\
										<Null/>\
									</Ne>\
									<Apply Function="odata.concat">\
										<String>mailto:</String>\
										<Path>EmailAddress</Path>\
									</Apply>\
									<Null/>\
								</If>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.2">\
						<Record Type="WithUrlRef">\
							<PropertyValue Property="Url">\
								<UrlRef>\
									<If>\
										<Ne>\
											<Path>EmailAddress</Path>\
											<Null/>\
										</Ne>\
										<Apply Function="odata.concat">\
											<String>mailto:</String>\
											<Path>EmailAddress</Path>\
										</Apply>\
										<Null/>\
									</If>\
								</UrlRef>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sEmptyCollection = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.FilledCollection">\
						<Collection>\
							<String>THIS</String>\
							<String>IS</String>\
							<String>ODATA!</String>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.EmptyCollection">\
						<Collection />\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';


	var sMultipleEnums = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.SimpleEnum">\
						<Record>\
							<PropertyValue Property="Test" EnumMember="Test.Value"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.MultipleEnums">\
						<Record>\
							<PropertyValue Property="Test" EnumMember="Test.Value1 Test.Value2"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';



	var aValueListStrings = [ '\<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.SimpleAnnotation-1">\
						<String>From Metadata</String>\
					</Annotation>\
				</Annotations>\
				<Annotations xmlns="http://docs.oasis-open.org/odata/ns/edm"\
					Target="ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/BooleanParameter">\
					<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
						<Record>\
							<PropertyValue Property="Label" String="boolean true/false" />\
							<PropertyValue Property="CollectionPath" String="VL_FV_FARP_BOOLEAN" />\
							<PropertyValue Property="Parameters">\
								<Collection>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="BooleanParameter" />\
										<PropertyValue Property="ValueListProperty"\
											String="Code" />\
									</Record>\
									<Record\
										Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly">\
										<PropertyValue Property="ValueListProperty"\
											String="Text" />\
									</Record>\
								</Collection>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>', '\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.SimpleAnnotation-2">\
						<String>From Metadata</String>\
					</Annotation>\
				</Annotations>\
				<Annotations xmlns="http://docs.oasis-open.org/odata/ns/edm"\
					Target="ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/Industry">\
					<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
						<Record>\
							<PropertyValue Property="Label" String="&quot;Industry Texts&quot;" />\
							<PropertyValue Property="CollectionPath" String="VL_SH_H_T016" />\
							<PropertyValue Property="SearchSupported" Bool="true" />\
							<PropertyValue Property="Parameters">\
								<Collection>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="Industry" />\
										<PropertyValue Property="ValueListProperty"\
											String="BRSCH" />\
									</Record>\
									<Record\
										Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly">\
										<PropertyValue Property="ValueListProperty"\
											String="BRTXT" />\
									</Record>\
								</Collection>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>', '\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.SimpleAnnotation-3">\
						<String>From Metadata</String>\
					</Annotation>\
				</Annotations>\
				<Annotations xmlns="http://docs.oasis-open.org/odata/ns/edm"\
					Target="ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/PostingKey">\
					<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
						<Record>\
							<PropertyValue Property="Label" String="Help_View for TBSL" />\
							<PropertyValue Property="CollectionPath" String="VL_SH_H_TBSL" />\
							<PropertyValue Property="SearchSupported" Bool="true" />\
							<PropertyValue Property="Parameters">\
								<Collection>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="PostingKey" />\
										<PropertyValue Property="ValueListProperty"\
											String="BSCHL" />\
									</Record>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="FinancialAccountType" />\
										<PropertyValue Property="ValueListProperty"\
											String="KOART" />\
									</Record>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="DebitCreditCode" />\
										<PropertyValue Property="ValueListProperty"\
											String="SHKZG" />\
									</Record>\
									<Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut">\
										<PropertyValue Property="LocalDataProperty"\
											PropertyPath="IndustryName" />\
										<PropertyValue Property="ValueListProperty"\
											String="LTEXT" />\
									</Record>\
								</Collection>\
							</PropertyValue>\
						</Record>\
					</Annotation>\
				</Annotations>'
	];



	var sNorthwindMetadataWithValueListPlaceholder = '\<?xml version="1.0" encoding="utf-8"?>\
	<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" >\
		<Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml" xmlns="http://docs.oasis-open.org/odata/ns/edmx">\
			<Include Alias="Test" Namespace="ui5.test"/>\
		</Reference>\
		<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
			xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.SimpleAnnotation">\
						<String>From Metadata</String>\
					</Annotation>\
				</Annotations>\
				{{ValueLists}}\
			</Schema>\
			<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityType Name="Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
						FromRole="Categories" />\
				</EntityType>\
				<EntityType Name="CustomerDemographic">\
					<Key>\
						<PropertyRef Name="CustomerTypeID" />\
					</Key>\
					<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
						Unicode="true" />\
					<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
						FromRole="CustomerDemographics" />\
				</EntityType>\
				<EntityType Name="Customer">\
					<Key>\
						<PropertyRef Name="CustomerID" />\
					</Key>\
					<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
						FromRole="Customers" />\
					<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
						ToRole="CustomerDemographics" FromRole="Customers" />\
				</EntityType>\
				<EntityType Name="Employee">\
					<Key>\
						<PropertyRef Name="EmployeeID" />\
					</Key>\
					<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
					<Property Name="BirthDate" Type="Edm.DateTime" />\
					<Property Name="HireDate" Type="Edm.DateTime" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
					<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
					<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<Property Name="ReportsTo" Type="Edm.Int32" />\
					<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
						ToRole="Employees1" FromRole="Employees" />\
					<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
						FromRole="Employees1" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
						FromRole="Employees" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
						FromRole="Employees" />\
				</EntityType>\
				<EntityType Name="Order_Detail">\
					<Key>\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
						FromRole="Order_Details" />\
					<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Products" FromRole="Order_Details" />\
				</EntityType>\
				<EntityType Name="Order">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
						FromRole="Orders" />\
					<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
						FromRole="Orders" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
						ToRole="Order_Details" FromRole="Orders" />\
					<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
						FromRole="Orders" />\
				</EntityType>\
				<EntityType Name="Product">\
					<Key>\
						<PropertyRef Name="ProductID" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
						FromRole="Products" />\
					<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
						ToRole="Order_Details" FromRole="Products" />\
					<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
						FromRole="Products" />\
				</EntityType>\
				<EntityType Name="Region">\
					<Key>\
						<PropertyRef Name="RegionID" />\
					</Key>\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
						ToRole="Territories" FromRole="Region" />\
				</EntityType>\
				<EntityType Name="Shipper">\
					<Key>\
						<PropertyRef Name="ShipperID" />\
					</Key>\
					<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
						FromRole="Shippers" />\
				</EntityType>\
				<EntityType Name="Supplier">\
					<Key>\
						<PropertyRef Name="SupplierID" />\
					</Key>\
					<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
					<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
					<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
						FromRole="Suppliers" />\
				</EntityType>\
				<EntityType Name="Territory">\
					<Key>\
						<PropertyRef Name="TerritoryID" />\
					</Key>\
					<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
						Unicode="true" />\
					<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
					NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
					FromRole="Territories" />\
					<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
						FromRole="Territories" />\
				</EntityType>\
				<EntityType Name="Alphabetical_list_of_product">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="SupplierID" Type="Edm.Int32" />\
					<Property Name="CategoryID" Type="Edm.Int32" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
					<Property Name="ReorderLevel" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
				</EntityType>\
				<EntityType Name="Category_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Current_Product_List">\
					<Key>\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
						xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Customer_and_Suppliers_by_City">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="Relationship" />\
					</Key>\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
					<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
				</EntityType>\
				<EntityType Name="Invoice">\
					<Key>\
						<PropertyRef Name="CustomerName" />\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="Salesperson" />\
						<PropertyRef Name="ShipperName" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
						Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Details_Extended">\
					<Key>\
						<PropertyRef Name="Discount" />\
						<PropertyRef Name="OrderID" />\
						<PropertyRef Name="ProductID" />\
						<PropertyRef Name="ProductName" />\
						<PropertyRef Name="Quantity" />\
						<PropertyRef Name="UnitPrice" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
					<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
					<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
					<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Order_Subtotal">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Orders_Qry">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
					<Property Name="EmployeeID" Type="Edm.Int32" />\
					<Property Name="OrderDate" Type="Edm.DateTime" />\
					<Property Name="RequiredDate" Type="Edm.DateTime" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="ShipVia" Type="Edm.Int32" />\
					<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
					<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
					<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
					<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				</EntityType>\
				<EntityType Name="Product_Sales_for_1997">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_Above_Average_Price">\
					<Key>\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Products_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="Discontinued" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
					<Property Name="UnitsInStock" Type="Edm.Int16" />\
					<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				</EntityType>\
				<EntityType Name="Sales_by_Category">\
					<Key>\
						<PropertyRef Name="CategoryID" />\
						<PropertyRef Name="CategoryName" />\
						<PropertyRef Name="ProductName" />\
					</Key>\
					<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
						Unicode="true" />\
					<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Sales_Totals_by_Amount">\
					<Key>\
						<PropertyRef Name="CompanyName" />\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Quarter">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<EntityType Name="Summary_of_Sales_by_Year">\
					<Key>\
						<PropertyRef Name="OrderID" />\
					</Key>\
					<Property Name="ShippedDate" Type="Edm.DateTime" />\
					<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
					<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
				</EntityType>\
				<Association Name="FK_Products_Categories">\
					<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Categories">\
							<PropertyRef Name="CategoryID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="CategoryID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="CustomerCustomerDemo">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
					<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Orders_Customers">\
					<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Customers">\
							<PropertyRef Name="CustomerID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="CustomerID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Employees_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Employees1">\
							<PropertyRef Name="ReportsTo" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Employees">\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Employees">\
							<PropertyRef Name="EmployeeID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="EmployeeID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="EmployeeTerritories">\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
				</Association>\
				<Association Name="FK_Order_Details_Orders">\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Orders">\
							<PropertyRef Name="OrderID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="OrderID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Order_Details_Products">\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
					<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Products">\
							<PropertyRef Name="ProductID" />\
						</Principal>\
						<Dependent Role="Order_Details">\
							<PropertyRef Name="ProductID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Orders_Shippers">\
					<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Shippers">\
							<PropertyRef Name="ShipperID" />\
						</Principal>\
						<Dependent Role="Orders">\
							<PropertyRef Name="ShipVia" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Products_Suppliers">\
					<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
					<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Suppliers">\
							<PropertyRef Name="SupplierID" />\
						</Principal>\
						<Dependent Role="Products">\
							<PropertyRef Name="SupplierID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
				<Association Name="FK_Territories_Region">\
					<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
					<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
					<ReferentialConstraint>\
						<Principal Role="Region">\
							<PropertyRef Name="RegionID" />\
						</Principal>\
						<Dependent Role="Territories">\
							<PropertyRef Name="RegionID" />\
						</Dependent>\
					</ReferentialConstraint>\
				</Association>\
			</Schema>\
			<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
				<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
					<EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
					<EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
					<EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
					<EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
					<EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
					<EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
					<EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
					<EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
					<EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
					<EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
					<EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
					<EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
					<EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
					<EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
					<EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
					<EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
					<EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
					<EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
					<EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
					<EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
					<EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
					<EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
					<EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
					<EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
					<EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
					<EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
					<AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
						<End Role="Categories" EntitySet="Categories" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
						<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
						<End Role="Customers" EntitySet="Customers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
						<End Role="Customers" EntitySet="Customers" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Employees1" EntitySet="Employees" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
						<End Role="Employees" EntitySet="Employees" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Orders" EntitySet="Orders" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
						<End Role="Order_Details" EntitySet="Order_Details" />\
						<End Role="Products" EntitySet="Products" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
						<End Role="Orders" EntitySet="Orders" />\
						<End Role="Shippers" EntitySet="Shippers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
						<End Role="Products" EntitySet="Products" />\
						<End Role="Suppliers" EntitySet="Suppliers" />\
					</AssociationSet>\
					<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
						<End Role="Region" EntitySet="Regions" />\
						<End Role="Territories" EntitySet="Territories" />\
					</AssociationSet>\
				</EntityContainer>\
			</Schema>\
		</edmx:DataServices>\
	</edmx:Edmx>';

	var aOverwriteOnTermLevel = ['\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.NorthwindEntities/X">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
							<PropertyValue Property="Deleted" String="1"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe1">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="Test/NorthwindEntities">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
							<PropertyValue Property="Deleted" String="1"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe1">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
							<PropertyValue Property="Deleted" String="1"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe1">\
						<Record>\
							<PropertyValue Property="From" String="1"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>', '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/components/factsheet/vocabularies/UI.xml">\
			<edmx:Include Alias="Test" Namespace="ui5.test"/>\
		</edmx:Reference>\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="Test.NorthwindEntities/X">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe2">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="Test/NorthwindEntities">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe2">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="Test.Annotation">\
					<Annotation Term="Test.OverwriteMe">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
					<Annotation Term="Test.DontOverwriteMe2">\
						<Record>\
							<PropertyValue Property="From" String="2"/>\
						</Record>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>'];


	var sEdmtypeForNavigationproperties = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
			<edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" />\
		</edmx:Reference>	\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="NorthwindModel.Product">\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product ID" />\
								<PropertyValue Property="Value" Path="ProductID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Name" />\
								<PropertyValue Property="Value" Path="ProductName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier ID" />\
								<PropertyValue Property="Value" Path="Supplier/SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier Name" />\
								<PropertyValue Property="Value" Path="Supplier/CompanyName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier ID" />\
								<PropertyValue Property="Value" Path="Category/CategoryName" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Supplier">\
					<Annotation Term="UI.LineItem">\
						<Collection>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier ID" />\
								<PropertyValue Property="Value" Path="SupplierID" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier Name" />\
								<PropertyValue Property="Value" Path="CompanyName" />\
							</Record>\
							<Record Type="UI.DataField">\
								<PropertyValue Property="Label" String="Product Supplier ID" />\
								<PropertyValue Property="Value" Path="Products/ProductID" />\
							</Record>\
						</Collection>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	var sNestedAnnotations = '\<?xml version="1.0" encoding="utf-8"?>\
	<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
		<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
			<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
		</edmx:Reference>\
		<edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
			<edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" />\
		</edmx:Reference>	\
		<edm:DataServices>\
			<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotations Target="NorthwindModel.Product">\
					<Annotation Term="com.sap.vocabularies.UI.v1.LineItem">\
						<Collection>\
							<Record Type="com.sap.vocabularies.UI.v1.DataField">\
								<PropertyValue Property="Label" String="Business Partner"/>\
								<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
								<Annotation Term="com.sap.vocabularies.UI.v1.Importance"\
									EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/>\
							</Record>\
						</Collection>\
						<Annotation Term="UI.Criticality" Path="Criticality"/>\
					</Annotation>\
					<Annotation Term="com.sap.vocabularies.UI.v1.LineItem" Qualifier="foo">\
						<Collection>\
							<Record Type="com.sap.vocabularies.UI.v1.DataField">\
								<PropertyValue Property="Label" String="Business Partner"/>\
								<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
								<Annotation Term="com.sap.vocabularies.UI.v1.Importance"\
									EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/Medium"/>\
							</Record>\
						</Collection>\
						<Annotation Term="UI.Criticality" Path="Criticality"/>\
						<Annotation Term="UI.Criticality" Qualifier="bar" Path="Criticality/bar"/>\
					</Annotation>\
					<Annotation Term="UI.Facets">\
						<Collection>\
							<Record Type="UI.CollectionFacet">\
								<PropertyValue Property="Facets">\
									<Collection>\
										<Record Type="UI.ReferenceFacet">\
											<PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
										</Record>\
									</Collection>\
									<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Supplier Identification"/>\
								</PropertyValue>\
							</Record>\
						</Collection>\
					</Annotation>\
					<Annotation Term="com.sap.vocabularies.Common.v1.Text" Path="CategoryName">\
						<!-- We are keeping this (invalid) example in to document the behavior of the parser in cases that are not allowed in actual annotation sources -->\
						<Term Name="TextArrangement" Type="UI.TextArrangementType" AppliesTo="Annotation EntityType">\
							<Annotation Term="Core.Description1" String="Describes the arrangement of the property values and its text"/>\
							<Annotation Term="Core.Description2" String="If used for a single property the Common.Text annotation is annotated"/>\
						</Term>\
					</Annotation>\
					<Annotation Term="com.sap.vocabularies.Common.v1.Text#2" Path="CategoryName">\
						<Annotation Term="com.sap.vocabularies.UI.v1.TextArrangement" EnumMember="com.sap.vocabularies.UI.v1.TextArrangementType/TextLast" />\
					</Annotation>\
					<Annotation Term="unittest.ui5.parentAnnotation">\
						<Annotation Term="unittest.ui5.constantExpressions">\
							<String>Rosinenbroetchen</String>\
							<Binary>1100101</Binary>\
							<Bool>almost true</Bool>\
							<Date>2016-04-14</Date>\
							<DateTimeOffset>2016-04-14T16:19:00.000-02:00</DateTimeOffset>\
							<Decimal>3.14159</Decimal>\
							<Duration>P11D23H59M59.999999999999S</Duration>\
							<EnumMember>unittest.ui5.enum/test1</EnumMember>\
							<Float>6.28318</Float>\
							<Guid>21EC2020-3AEA-1069-A2DD-08002B30309D</Guid>\
							<Int>23</Int>\
							<TimeOfDay>23:42:58</TimeOfDay>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression1">\
							<Apply Function="odata.concat">\
								<String>***</String>\
								<String>, </String>\
								<String>Drugs </String>\
								<String> and </String>\
								<String>Rock \'n Roll</String>\
							</Apply>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression2">\
							<Collection>\
								<String>One</String>\
								<String>Two</String>\
								<String>Five</String>\
							</Collection>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression3">\
							<If>\
								<Path>IsFemale</Path>\
								<String>Iron Man</String>\
								<String>Someone else</String>\
								<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Who am I?"/>\
							</If>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression4">\
							<Null/>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression5">\
							<Record>\
								<PropertyValue Property="GivenName" Path="FirstName" />\
								<PropertyValue Property="Surname" Path="LastName" />\
								<PropertyValue Property="Manager" Path="DirectSupervisor" />\
								<PropertyValue Property="CostCenter">\
									<UrlRef>\
										<Apply Function="odata.fillUriTemplate">\
											<String>http://host/anotherservice/CostCenters(\'{ccid}\')</String>\
											<LabeledElement Name="ccid" Path="CostCenterID" />\
										</Apply>\
									</UrlRef>\
								</PropertyValue>\
							</Record>\
						</Annotation>\
						<Annotation Term="unittest.ui5.dynamicExpression6">\
							<Apply Function="odata.concat">\
								<If>\
									<Path>IsFemale</Path>\
									<String>Iron Man</String>\
									<String>Someone else</String>\
									<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Who am I?"/>\
								</If>\
							</Apply>\
						</Annotation>\
					</Annotation>\
				</Annotations>\
				<Annotations Target="NorthwindModel.Product" Qualifier="inherited">\
					<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Inheritance">\
						<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="No Inheritance"/>\
					</Annotation>\
					<Annotation Term="com.sap.vocabularies.UI.v1.LineItem">\
						<Collection/>\
						<Annotation Term="UI.Criticality" Path="Criticality"/>\
					</Annotation>\
				</Annotations>\
			</Schema>\
		</edm:DataServices>\
	</edm:Edm>';

	return {
		getAnnotationFromFakeUrl : function (sUrl) {
			switch (sUrl) {
				case "fakeService://testdata/odata/multiple-annotations-01.xml" :
					return sMultipleTest01;
				case "fakeService://testdata/odata/multiple-annotations-02.xml" :
					return sMultipleTest02;
				case "fakeService://testdata/odata/multiple-annotations-03.xml" :
					return sMultipleTest03;

				default:
					return undefined;
			}
		}
	};
});
