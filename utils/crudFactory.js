const checkInput = function (req, res, next) {
  const details = req.body;
  const isEmpty = Object.keys(details).length === 0;
  if (isEmpty) {
    res.status(400).json({
      message: "error",
      data: "Input fields cannot be empty"
    });
  } else {
    next();
  }
};

function getAllFactory(elementModel) {
  return async function (req, res) {
    const { modelName } = elementModel;
    //   let msg = "";
    //   if (userData?.length === 0) {
    //     msg = "No Data found!";
    //   } else {
    //     msg = "Data found!";
    //   }
    //   res.json({
    //     status: 200,
    //     data: userData,
    //     message: msg
    //   });

    try {
      let msg = "";

      const data = await elementModel.find();
      if (data?.length === 0) {
        throw new Error("No data found!");
      } else {
        res.json({
          status: 200,
          data,
          message: "Data found!!"
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}

function createFactory(elementModel) {
  return async function (req, res) {
    try {
      /**
       * input validation
       */
      const input = req.body;

      // const isEmpty = Object.keys(userInput).length === 0;
      // if we want to check for all request we can use
      /**
       *
       * app.use((req,res)=>{
       *  isEmpty check logic here
       * })
       */
      // if (isEmpty) {
      //   return res.status(400).json({
      //     status: 400,
      //     message: "Empty Input! No data found"
      //   });
      // } else {
      const details = await elementModel.create(input);
      // const _id = short.generate();
      // const userDetails = userInput;
      // userDetails["id"] = _id;
      // //   console.log("request body::", req.body, _id);
      // usersData.push(userDetails);

      // //writing file
      // fs.writeFileSync(
      //   path.join(__dirname, "data.json"),
      //   JSON.stringify(usersData),
      //   (err) => {
      //     if (err) {
      //       console.error(err);
      //     }
      //   }
      // );

      res.json({
        status: 200,
        data: details,
        message: `User created with userID ${details._id}`
      });
      // }
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}

function getElementByIdFactory(elementModel) {
  return async function (req, res) {
    try {
      //all params value will
      const { id } = req.params;
      // console.log("id::", id);

      const data = await elementModel.findById(id);

      // const _userData = User.find((user) => user.id == id);

      // console.log(_userData);
      if (data) {
        res.json({
          status: 200,
          data,
          message: "Data found for dynamic Route"
        });
      } else {
        throw new Error(`${id} data not found!`);
      }
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}
function updateElementByIdFactory(elementModel) {
  return async function (req, res) {
    try {
      const { id } = req.params;
      const details = req.body;

      const updateData = await elementModel.findByIdAndUpdate(
        id,
        { $set: details, $inc: { __v: 1 } },
        {
          new: true
        }
      );

      if (!updateData) {
        throw new Error("No data found");
      } else {
        res.status(200).json({
          message: `${id} data updated`,
          data: updateData
        });
      }

      // const { id } = req.params;
      // // console.log("update User::", id);
      // const patchUserData = req.body;

      // const userIndex = usersData.findIndex((user) => user.id == id);
      // if (userIndex > -1) {
      //   const _userData = usersData[userIndex];
      //   const newUserData = { ..._userData, ...patchUserData };
      //   usersData[userIndex] = newUserData;

      //   fs.writeFileSync(
      //     path.join(__dirname, "data.json"),
      //     JSON.stringify(usersData),
      //     (err) => {
      //       console.error(err);
      //     }
      //   );

      //   res.json({
      //     status: 200,
      //     message: `${id} user data updated`,
      //     data: newUserData
      //   });
      // } else {
      //   throw new Error(`${id} user data not found!`);
      // }
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}
function deleteElementByIdFactory(elementModel) {
  return async function (req, res) {
    try {
      const { id } = req.params;

      const deletedData = await elementModel.findByIdAndDelete(id);
      if (deletedData) {
        res.json({
          status: 200,
          message: `${id} user data deleted`,
          data: deletedData
        });
      } else {
        throw new Error(`${id} data not found!`);
      }

      // const userIndex = usersData.findIndex((user) => user.id == id);
      // if (userIndex > -1) {
      //   const deletedUser = usersData.splice(userIndex, 1);
      //   fs.writeFileSync(
      //     path.join(__dirname, "data.json"),
      //     JSON.stringify(usersData),
      //     (err) => {
      //       console.error(err);
      //     }
      //   );

      //   res.json({
      //     status: 200,
      //     message: `${id} user data deleted`,
      //     data: deletedUser
      //   });
      // } else {
      //   throw new Error(`${id} user data not found!`);
      // }
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}

module.exports = {
  getAllFactory,
  createFactory,
  getElementByIdFactory,
  updateElementByIdFactory,
  deleteElementByIdFactory,
  checkInput
};
