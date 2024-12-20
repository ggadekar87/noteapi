//https://www.mongodb.com/docs/drivers/node/current/
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
var app = express();
const PORT = 8080;
app.use(cors());
import pkg from "body-parser";
const { json, urlencoded } = pkg;
var jsonParser = json();
var jsonParser = json();
//app.use(express.bodyParser({limit: '50mb'}));
//Below two line added to save image large size
app.use(
  urlencoded({
    limit: "50mb",
    extended: false,
  })
);
app.use(json({ limit: "50mb" }));
var url = "mongodb://localhost:27017/notebook";
import { MongoClient } from "mongodb";
import mongodb from "mongodb";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(
  "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"
);

const { ObjectId } = mongodb;
import {
  ServiceErrorResponse,
  ServiceResponse,
  ServiceResponseOK,
} from "./Common.js";

import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

app.get("/", async function (req, res) {
  const query = { email: "aa@gmail.com" };
  const options = {
    sort: { usersId: -1 },
  };
  const User = await Users.findOne(query, options);
  res.send(User);
});
const generateToken = (payload) => {
  const sKey = "yourKey"; // Replace with your own secret key
  const options = {
    expiresIn: "1h", // Token expiration time
  };

  const token = jwt.sign(payload, sKey, options);
  return token;
};

// const validateToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (authHeader) {
//     const token = authHeader.split(" ")[1]; // Bearer <token>
//     jwt.verify(token, "yourKey", (err, payload) => {
//       if (err) {
//         return res.status(403).json({
//           success: false,
//           message: "Invalid token",
//         });
//       } else {
//         // req.user = payload;
//         next();
//       }
//     });
//   } else {
//     res.status(401).json({
//       success: false,
//       message: "Token is not provided",
//     });
//   }
// };

app.post("/login", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Users = database.collection("Users");
    var { username, password } = req.body;
    const query = { email: username, password: password };
    const options = {
      sort: { userId: -1 },
    };
    const User = await Users.findOne(query, options);
    if (User == null) {
      res.status(401).send(ServiceErrorResponse("Unatherized user"));
    } else {
      let token = generateToken(User);
      res.send(ServiceResponseOK({ User: User, token: token }));
    }
  } finally {
    await client.close();
  }
});

app.post("/signup", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Users = database.collection("Users");
    var { username, password } = req.body;
    const request = {
      userId: username,
      image: "",
      name: "",
      email: username,
      password: password,
      Mobile: "",
      profession: "",
      active: false,
    };
    const query = { email: username };
    const options = {
      sort: { userId: -1 },
    };
    const User = await Users.findOne(query, options);
    if (User != null) {
      res.send(ServiceErrorResponse("User already exist"));
    } else {
      const result = await Users.insertOne(request);
      if (result == null) {
        res.send(ServiceErrorResponse("Unable to save"));
      } else {
        res.send(result);
      }
    }
  } finally {
    await client.close();
  }
});

app.post("/create/otp", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Otp = database.collection("Otp");
    var { username, password, otp } = req.body;
    const request = {
      username: username,
      otp: otp,
      email: username,
      password: password,
      createDate: new Date(),
    };
    const result = await Otp.insertOne(request);
    if (result == null) {
      res.send(ServiceErrorResponse("Unable to save"));
    } else {
      res.send(result);
      // transport
      //   .sendMail({
      //     to: username,
      //     from: "ggadekar7@gmail.com",
      //     subject: "Note api sign up otp validation",
      //     html: "<h1> Your OT is </h1>" + otp,
      //   })
      //   .then((res) => {
      //     res.send(result);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     res.send(err);
      //   });
      // sgMail
      //   .send({secure: false,
      //     to: username,
      //     from: "ggadekar7@gmail.com",
      //     subject: "Note api sign up otp validation",
      //     html: "<h1> Your OT is </h1>" + otp,
      //   })
      //   .then((error) => {
      //     console.error(error);
      //     res.send(err);
      //   });
    }
  } finally {
    await client.close();
  }
});

app.post("/validate/otp", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Otp = database.collection("Otp");
    var { username, password, otp } = req.body;
    const request = {
      username: username,
      otp: otp,
      email: username,
      password: password,
      createDate: new Date(),
    };
    const query = { email: username, password: password, otp: otp };
    const options = {
      sort: { userId: -1 },
    };
    const result = await Otp.findOne(query, options);
    if (result == null) {
      res.send(ServiceErrorResponse("otp not found"));
    } else {
      var diff = Math.abs(new Date() - result.createDate);
      var minutes = Math.floor(diff / 1000 / 60);
      console.log(minutes);
      if (minutes > 10) {
        res.send(ServiceResponse("Otp expired"));
        console.log("Otp expired");
      } else {
        res.send(ServiceResponse("Valid Otp"));
        console.log("Valid Otp");
      }
    }
  } finally {
    await client.close();
  }
});

app.get("/getuserinfo", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Users = database.collection("Users");
    var { email } = req.query;
    var query = { email: email };
    const options = {
      sort: { userId: -1 },
    };
    const result = await Users.findOne(query, options);
    if (result == null) {
      res.send(ServiceErrorResponse("User not found"));
    } else {
      res.send(ServiceResponseOK(result));
    }
  } finally {
    await client.close();
  }
});

app.get("/get/mainmenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const mainMenu = database.collection("mainMenu");
    var { userId } = req.query;
    var query = { userId: userId };
    const options = {
      sort: {},
      projection: { _id: 1, userId: 1, name: 1 },
    };
    var items = await mainMenu.find(query, options);
    var response = [];
    for await (const item of items) {
      response.push(item);
    }
    if (response.length == 0) {
      res.send(ServiceErrorResponse("Menu not found"));
    } else {
      res.send(ServiceResponseOK(response));
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.get("/get/subMenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const SubMenu = database.collection("SubMenu");
    var { mid } = req.query;
    var query = { mid: mid };
    const options = {
      sort: {},
      //projection: { _id: 1, userId: 1, name: 1 },
    };
    var items = await SubMenu.find(query, options);
    var response = [];
    for await (const item of items) {
      response.push(item);
    }
    if (response.length == 0) {
      res.send(ServiceErrorResponse("Sub Menu not found"));
    } else {
      res.send(response);
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.get("/get/content", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Content = database.collection("Content");
    var { smid } = req.query;
    var query = { smid: smid };
    const options = {
      sort: {},
      //projection: { _id: 1, userId: 1, name: 1 },
    };
    var items = await Content.find(query, options);
    var response = [];
    for await (const item of items) {
      response.push(item);
    }
    if (response.length == 0) {
      res.send(ServiceErrorResponse("Content not found"));
    } else {
      res.send(ServiceResponseOK(response));
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.put("/update/userinfo/:id", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Users = database.collection("Users");
    var { userId, image, name, email, password, Mobile, profession } = req.body;
    var { id } = req.params;

    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      const updateDocument = {
        $set: {
          image: image,
          name: name,
          Mobile: Mobile,
          profession: profession,
        },
      };
      const options = {
        sort: {},
        //projection: { _id: 1, userId: 1, name: 1 },
      };
      var result = await Users.findOne(query, options);
      console.log(result);
      if (result == null) {
        res.send(ServiceErrorResponse("Users not found"));
      } else {
        var items = await Users.updateOne(query, updateDocument);
        res.send(ServiceResponseOK(items));
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

app.put("/update/password/:id", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Users = database.collection("Users");
    var { email, password } = req.body;
    var { id } = req.params;

    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      const updateDocument = {
        $set: {
          email: email,
          password: password,
        },
      };
      const options = {
        sort: {},
        //projection: { _id: 1, userId: 1, name: 1 },
      };
      var result = await Users.findOne(query, options);
      console.log(result);
      if (result == null) {
        res.send(ServiceErrorResponse("Users not found"));
      } else {
        var items = await Users.updateOne(query, updateDocument);
        res.send(items);
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.put("/update/mainmenu/:id", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const mainMenu = database.collection("mainMenu");
    var { name, userId } = req.body;
    var { id } = req.params;
    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      const updateDocument = {
        $set: {
          name: name,
        },
      };
      const options = {
        sort: {},
        // projection: { _id: 1, userId: 1, name: 1 },
      };
      var result = await mainMenu.findOne(query, options);
      if (result == null) {
        res.send(ServiceErrorResponse("MainMenu not found"));
      } else {
        var items = await mainMenu.updateOne(query, updateDocument);
        if (items?.acknowledged) {
          const resPonse = ServiceResponseOK({
            _id: id,
            userId: userId,
            name: name,
          });
          res.send(resPonse);
        } else {
          res.send(ServiceErrorResponse("Error in update"));
        }
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("Err" + err);
  } finally {
    await client.close();
  }
});

app.put("/update/submenu/:id", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const SubMenu = database.collection("SubMenu");
    var { name, mid } = req.body;
    var { id } = req.params;

    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      const updateDocument = {
        $set: {
          name: name,
        },
      };
      const options = {
        sort: {},
        //projection: { _id: 1, userId: 1, name: 1 },
      };
      var result = await SubMenu.findOne(query, options);
      console.log(result);
      if (result == null) {
        res.send(ServiceErrorResponse("SubMenu not found"));
      } else {
        var items = await SubMenu.updateOne(query, updateDocument);
        if (items?.acknowledged) {
          const resPonse = ServiceResponseOK({
            _id: id,
            mid: mid,
            name: name,
          });
          res.send(resPonse);
        } else {
          res.send(ServiceErrorResponse("Error in update"));
        }
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.put("/update/content/:id", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Content = database.collection("Content");
    var { name, value, smid } = req.body;
    var { id } = req.params;

    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      const updateDocument = {
        $set: {
          name: name,
          value: value,
        },
      };
      const options = {
        sort: {},
        //projection: { _id: 1, userId: 1, name: 1 },
      };
      var result = await Content.findOne(query, options);
      console.log(result);
      if (result == null) {
        res.send(ServiceErrorResponse("Content not found"));
      } else {
        var items = await Content.updateOne(query, updateDocument);
        const response = ServiceResponseOK({
          _id: id,
          smid: smid,
          name: name,
          value: value,
        });
        res.send(response);
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("Catttttttt" + err);
  } finally {
    await client.close();
  }
});

app.post("/create/mainmenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const mainMenu = database.collection("mainMenu");
    var { userId, name } = req.body;
    const menu = { userId: userId, name: name };
    var result = await mainMenu.insertOne(menu);
    if (result == null) {
      res.send(ServiceErrorResponse("Menu not cretaed"));
    } else {
      res.send(
        ServiceResponseOK({
          _id: result.insertedId,
          userId: userId,
          name: name,
        })
      );
    }
  } catch (err) {
    console.log("Error" + err);
  } finally {
    await client.close();
  }
});

app.post("/create/submenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const SubMenu = database.collection("SubMenu");
    var { mid, name } = req.body;
    const menu = { mid: mid, name: name };
    var result = await SubMenu.insertOne(menu);
    if (result == null) {
      res.send(ServiceErrorResponse("SubMenu not cretaed"));
    } else {
      res.send(
        ServiceResponseOK({
          _id: result.insertedId,
          mid: mid,
          name: name,
        })
      );
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

app.post("/create/content", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Content = database.collection("Content");
    var { smid, name, value } = req.body;
    const menu = { smid: smid, name: name, value: value };
    var result = await Content.insertOne(menu);
    if (result == null) {
      res.send(ServiceErrorResponse("Content not cretaed"));
    } else {
      res.send(
        ServiceResponseOK({
          _id: result.insertedId,
          smid: smid,
          name: name,
          value: value,
        })
      );
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

app.delete("/delete/mainmenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const mainMenu = database.collection("mainMenu");
    var { id } = req.query;
    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      var result = await mainMenu.deleteOne(query);
      if (result == null) {
        res.send(ServiceErrorResponse("mainmenu not found"));
      } else {
        if (result?.acknowledged) {
          res.send(ServiceResponseOK(objectId));
        } else {
          res.send(ServiceErrorResponse("mainmenu not found"));
        }
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

app.delete("/delete/submenu", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const SubMenu = database.collection("SubMenu");
    var { id } = req.query;
    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      var result = await SubMenu.deleteOne(query);
      if (result == null) {
        res.send(ServiceErrorResponse("SubMenu not found"));
      } else {
        if (result?.acknowledged) {
          res.send(ServiceResponseOK(objectId));
        } else {
          res.send(ServiceErrorResponse("mainmenu not found"));
        }
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

app.delete("/delete/content", jsonParser, async function (req, res) {
  const client = new MongoClient(url);
  try {
    const database = client.db("notebook");
    const Content = database.collection("Content");
    var { id } = req.query;
    if (ObjectId.isValid(id)) {
      var objectId = new ObjectId(id);
      var query = { _id: objectId };
      var result = await Content.deleteOne(query);
      if (result == null) {
        res.send(ServiceErrorResponse("Content not found"));
      } else {
        if (result?.acknowledged) {
          res.send(ServiceResponseOK(objectId));
        } else {
          res.send(ServiceErrorResponse("content not found"));
        }
      }
    } else {
      res.send(ServiceErrorResponse("Invalid id"));
    }
  } catch (err) {
    console.log("err" + err);
  } finally {
    await client.close();
  }
});

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
