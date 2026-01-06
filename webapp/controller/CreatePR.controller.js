sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
  "use strict";

  return Controller.extend("ui5.procurementhub.controller.CreatePR", {
    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("dashboard", {}, true);
      }
    },

    onSubmit: function () {
      MessageToast.show("Purchase Request submitted (demo).");
      this.getOwnerComponent().getRouter().navTo("dashboard");
    }
  });
});
