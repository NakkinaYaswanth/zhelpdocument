/*					--------------------------------------------------------------------------
                    * Controller Name : Home								                 *
                    * Title     	  : Help Document                    			         *
                    * Author    	  : Nakkina Yaswanth(NYASWANTH)		                     *
                    * Date          : 23/05/2023 (dd/mm/yyyy)                                *	                                           
                    *------------------------------------------------------------------------*
                    * Controller Purpose: This controller is associated with Help         *
                    *                      Document Application. It provides predefined   	     *
                    *                     lifecycle hooks implementation.					 *
                    *                     It also define additional methods that serve as    *
                    *                     event handlers									 *
                    -------------------------------------------------------------------------
                    * Modification History                                              	 *
                    *------------------------------------------------------------------------*
*/
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, MessageBox, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("com.ztcsap.helpdocument.zhelpdocument.controller.HelpDocument", {
            /**
             * Hook Method Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
            */
            onInit: function () {
                try {
                    this.uri = this.getOwnerComponent().getManifestEntry("/sap.app/dataSources/mainService/uri");
                    this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                    this.showBusyIndicator();
                    var oHelpDocumentModel = new JSONModel();
                    var oParameters = {
                        QueryTemplate: "GTMES/HelpDocuments/QueryTemplates/xqryGetHelpDocuments",
                        "Content-Type": "text/json",
                    };
                    this.getOwnerComponent().setModel(oHelpDocumentModel, "oHelpDocumentModel");
                    oHelpDocumentModel.setSizeLimit(1000);
                    oHelpDocumentModel.loadData(this.uri, oParameters, true, "GET", null, false, null).then(function () {
                        var oHelpDocumentData = this.getOwnerComponent().getModel("oHelpDocumentModel").getProperty("/Rowsets/Rowset/0/Row");
                        var oError = this.getView().getModel("oHelpDocumentModel").getProperty("/Rowsets/FatalError");
                        if (oError) {
                            this.hideBusyIndicator();
                            MessageBox.error(oError);
                            return;
                        }
                        if (!oHelpDocumentData) {
                            this.hideBusyIndicator();
                            MessageBox.error(this.oBundle.getText("NoHelpDocumentData"));
                            return;
                        }
                        this.hideBusyIndicator();
                    }.bind(this));
                } catch (e) {
                    MessageBox.error(e.name + " : " + e.message);
                }
            },

             /**
         * method call to when link is pressed
         */
            onClickLinks: function (oEvent) {
                var sPath = oEvent.getSource().mBindingInfos.text.binding.oContext.sPath;
                var selectedRow = this.getView().getModel("oHelpDocumentModel").getProperty(sPath);
                var selectedLink = selectedRow.FilePath;
                window.open(selectedLink);
            },
            /**
         * method call to show BusyDialog
         */
            showBusyIndicator: function () {
                this._busyIndicator = new sap.m.BusyDialog({ title: "Loading..." });
                this._busyIndicator.open();
            },
            /**
            * method call to hise BusyDialog
            */
            hideBusyIndicator: function () {
                if (this._busyIndicator) {
                    this._busyIndicator.close();
                    this._busyIndicator = null;
                }
            },
        });
    }
);
