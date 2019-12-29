var express = require("express");
var router = express.Router();
const request = require("request-promise");
const crypto = require("crypto");
const constants = require("constants");
require("dotenv").config();

router.get("/", async function(req, res, next) {
  let options = {
    method: "GET",
    uri: "https://demo-api.ig.com/gateway/deal/session/encryptionKey",
    headers: {
      "X-IG-API-KEY": process.env.IG_DEMO_API_KEY
    },
    json: true
  };

  try {
    const response = await request(options);
    const { encryptionKey, timeStamp } = response;
    console.log(encryptionKey);
    const header = "-----BEGIN PUBLIC KEY-----";
    const footer = "-----END PUBLIC KEY-----";
    const encryptedPassword = crypto
      .publicEncrypt(
        {
          key: `${header}\n${encryptionKey}\n${footer}`,
          padding: constants.RSA_PKCS1_OAEP_PADDING
        },
        Buffer.from(`${process.env.IG_DEMO_ACCOUNT_PASSWORD}|${timeStamp}`)
      )
      .toString("base64");

    options = {
      method: "POST",
      uri: "https://demo-api.ig.com/gateway/deal/session/",
      headers: {
        Accept: "application/json; charset=UTF-8",
        "Content-Type": "application/json; charset=UTF-8",
        "X-IG-API-KEY": process.env.IG_DEMO_API_KEY,
        Version: 2
      },
      body: {
        identifier: process.env.IG_DEMO_ACCOUNT_USERNAME,
        password: encryptedPassword,
        encryptedPassword: true
      },
      json: true
    };

    response = await request(options);
    json = await response.json();
    res.send(json);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
