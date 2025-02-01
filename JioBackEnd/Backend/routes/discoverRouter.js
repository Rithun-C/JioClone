const express = require("express");
const {
    getUpcoming,
    getTopRated,
    getTrending,
    getNowPlaying,
} = require("../controller/discoverController.js");

const DiscoverRouter = express.Router();
DiscoverRouter.get("/now-playing", getNowPlaying);
DiscoverRouter.get("/trending", getTrending);
DiscoverRouter.get("/upcoming", getUpcoming);
DiscoverRouter.get("/top-rated", getTopRated);

module.exports = DiscoverRouter;