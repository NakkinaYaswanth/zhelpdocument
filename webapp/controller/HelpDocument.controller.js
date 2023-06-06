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
        "sap/m/MessageBox",
        "sap/ui/model/json/JSONModel"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, JSONModel) {
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
                    var aPlantId = this.getParamatersfromURL();
                    if(aPlantId == "" || aPlantId == undefined){
                        this.getPlantId();
                    }else{
                        this.getHelpDocuments(aPlantId);
                    }
                    
                } catch (e) {
                    MessageBox.error(e.name + " : " + e.message);
                }
            },

            /**
             * Function to get the help documents.
             * @function
             * @name getHelpDocuments
             * @public
             */
            getHelpDocuments:function(aPlantId){
                var oHelpDocumentModel = new JSONModel();
                var oParameters = {
                    QueryTemplate: "GTMES/HelpDocuments/QueryTemplates/xqryGetHelpDocuments",
                    "Content-Type": "text/json",
                    "Param.1":aPlantId
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
            },

             /**
             * Function to read the Plant Id.
             * @function
             * @name getPlantId
             * @public
             */
            getPlantId:function(){
                try{
                    //Plant Data
                    var oPlantModel = new JSONModel();
                    var oParameters = {
                        QueryTemplate: "GTMES/DataLoads/QueryTemplates/qryGetPlantData",
                        "Content-Type": "text/json",
                    };
                    this.getOwnerComponent().setModel(oPlantModel, "oPlantModel");
                    oPlantModel.setSizeLimit(1000);
                    oPlantModel.loadData(this.uri, oParameters, true, "GET", null, false, null).then(function () {
                        var oPlantData = this.getOwnerComponent().getModel("oPlantModel").getProperty("/Rowsets/Rowset/0/Row");
                        var oError = this.getView().getModel("oPlantModel").getProperty("/Rowsets/FatalError");
                        if (oError) {
                            this.hideBusyIndicator();
                            MessageBox.error(oError);
                            return;
                        }
                        if (!oPlantData) {
                            this.hideBusyIndicator();
                            MessageBox.error(this.oBundle.getText("NoPlantData"));
                            return;
                        }

                        this.getHelpDocuments(oPlantData[0].PLANTID);
                        this.hideBusyIndicator();
                    }.bind(this));
                }catch(e){
                    MessageBox.error(e.name + " : " + e.message);
                }
            },

             /**
             * Function to read the paramaters from Cross App Navigation.
             * @function
             * @name getParamatersfromURL
             * @public
             */
             getParamatersfromURL: function () {
                var oParamaters = this.getOwnerComponent().getComponentData().startupParameters,
                    sURLParamaters ="?",
                    aParamaters = window.location.hash.split("?");                    
                if(Object.keys(oParamaters).length){                    
                   return oParamaters.PlantID[0];
                }else if(aParamaters.length > 1){
                    for(var i=1; i<aParamaters.length; i++){
                        sURLParamaters = sURLParamaters+aParamaters[i];
                    }
                    if(UriParameters.fromQuery(sURLParamaters).has("PlantID")){
                        return UriParameters.fromQuery(sURLParamaters).get("PlantID");                     
                    }
                }
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
