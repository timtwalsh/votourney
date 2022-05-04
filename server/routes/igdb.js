const igdb = require('igdb-api-node').default;
const express = require("express");
const routes = express.Router();
const axios = require("axios");

const twitchBearerUrl = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;


routes.route("/api/game/search/:lookup").get(async (req, res) => {
    const {data} = await axios.post(twitchBearerUrl);
    const response = await igdb(process.env.TWITCH_CLIENT_ID, data.access_token)
        .fields('name, first_release_date, cover.image_id, summary, url')
        .limit(10)
        .search(`${req.params.lookup}`)
        .request('/games')
    res.json(response.data);
});

module.exports = routes;
