const authPage = (permission) =>{
  return (req, res, next) => {
      const userRole= req.body.role;
      if (permission.include(userRole)){
          next();
      }else{
          return res.status(401).json("You dont have permission");
      }
  }
}

const authUser =(req,res,next) =>{
      const meter_number =  req.params.meter_number;
      if (req.body.user1.meter_number.include(meter_number)){
          next();
      }else{
        return res.status(401).json("You dont have permission to this channel");
      }
}

exports.model = {authPage, authUser}

