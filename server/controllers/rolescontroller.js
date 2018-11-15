const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
const winlogger = require("../log");
exports.allroles = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "LoadAllRoles")
        .input("ClientId", req.body.ClientId)
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {

        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error Load Roles' })
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.DDlRole = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "DDLRoles")
        .input("ClientId", req.body.ClientId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error ddl Roles' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.Roleadd = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "AddRole")
        .input("RoleName", req.body.RoleName)
        .input("RoleGroupId", req.body.RoleGroupId)
        .input("ClientId", req.body.ClientId)
        .input("Description", req.body.Description)
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      //const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        // res.status(200).json({"data":result.recordsets})
        res.status(200).json({ "data": result.recordsets[0][0] })
      }
      else {
        res.status(500).send({ "message": 'Error Role Load' })
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};
exports.GetScreenForRoles = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "EditLoadScreen")
        .input("RoleId", req.body.Id)
        .input("UserId", req.body.UserId)
        .input("ClientId", req.body.ClientId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error Screen Load For Roles' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      // winlogger.log('error',message);
      sql.close();
    });
};
exports.DeleteRoles = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      let Temp = 0;
      for (var i = 0, len = req.body.SelectedRoles.length; i < len; i++) {
        Temp = Temp + 1;

        if (req.body.SelectedRoles.length > Temp) {
          pool
            .request()
            .input("Action", "DeleteRole")
            .input("RoleId", req.body.SelectedRoles[i].Id)
            .input("UserId", req.body.UserId)
            .execute("SS_Sp_RolesRights");
        }
        else if (req.body.SelectedRoles.length == Temp) {
          return pool
            .request()
            .input("Action", "DeleteRole")
            .input("RoleId", req.body.SelectedRoles[i].Id)
            .input("UserId", req.body.UserId)
            .execute("SS_Sp_RolesRights");
        }
      }
    })
    .then(result => {

      if (result.recordsets.length > 0) {
        // res.status(200).json({"data":result.recordsets})
        res.status(200).json({ "message": 'Role Deleted Successfully' })
      }
      else {
        res.status(500).send({ "message": 'Error While Deleting' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};
exports.ScreenAddRights = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "AddScreenForRole")
        .input("ScreenId", req.body.ScreenId)
        .input("ScreenName", req.body.ScreenName)
        .input("ModuleName", req.body.ModuleName)
        .input("ModuleId", req.body.ModuleId)
        .input("SubModuleName", req.body.SubModuleName)
        .input("StateName", req.body.StateName)
        .input("RoleId", req.body.RoleId)
        .input("ClientId", req.body.ClientId)        
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).send({ "message": 'Screen Added Successfully' })
        sql.close();
      }
      else {
        res.status(500).send({ "message": 'Error While Adding' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });
};
exports.ScreenRemoveRights = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "RemoveScreenForRole")
        .input("ScreenName", req.body.ScreenName)
        .input("ModuleName", req.body.ModuleName)
        .input("ModuleId", req.body.ModuleId)
        .input("SubModuleName", req.body.SubModuleName)
        .input("StateName", req.body.StateName)
        .input("ScreenId", req.body.ScreenId)
        .input("RoleId", req.body.RoleId)
        .input("ClientId", req.body.ClientId)
        .input("UserId", req.body.UserId)

        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).send({ "message": 'Screen Removed Successfully' })
        sql.close();
      }
      else {
        res.status(500).send({ "message": 'Error While Removing' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });
}
exports.DeleteEnable = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "DeleteButtonEnable")
        .input("ScreenId", req.body.ScreenId)
        .input("ScreenName", req.body.ScreenName)
        .input("ModuleName", req.body.ModuleName)
        .input("ModuleId", req.body.ModuleId)
        .input("SubModuleName", req.body.SubModuleName)
        .input("StateName", req.body.StateName)
        .input("RoleId", req.body.RoleId)
        .input("ClientId", req.body.ClientId)        
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).send({ "message": 'Delete Button Enabled Successfully' })
        sql.close();
      }
      else {
        res.status(500).send({ "message": 'Error While Adding' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });
};
exports.DeleteDisable = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "DeleteButtonDisable")
        .input("ScreenId", req.body.ScreenId)
        .input("ScreenName", req.body.ScreenName)
        .input("ModuleName", req.body.ModuleName)
        .input("ModuleId", req.body.ModuleId)
        .input("SubModuleName", req.body.SubModuleName)
        .input("StateName", req.body.StateName)
        .input("RoleId", req.body.RoleId)
        .input("ClientId", req.body.ClientId)        
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).send({ "message": 'Delete Button Disabled Successfully' })
        sql.close();
      }
      else {
        res.status(500).send({ "message": 'Error While Adding' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });
};



