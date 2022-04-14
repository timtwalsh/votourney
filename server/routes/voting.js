const express = require("express");
const routes = express.Router();

// voting/start/:bracketId
// voting/stop/:bracketId

// voting/vote/:bracketId/:matchId/top
// voting/vote/:bracketId/:matchId/bottom

const dbo = require("../db/conn");

routes.route("/voting/create/:bracketId").post(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let dataObject = {id: bracketId, round: -1}
        // insert record
        let db_connect = dbo.getDb();
        const getData = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        if (getData == null) {
            const dbInsert = await db_connect.collection("bracket_vote").insertOne(dataObject);
            if (dbInsert.result.n == 1) {
                res.status(201).send(JSON.stringify(dataObject.round));
            }
        } else {
            res.status(400).send(JSON.stringify(getData.round))
        }
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/voting/:bracketId").post(async (req, res) => {
    const bracketId = req.params.bracketId;
    try {
        const roundId = req.body.roundId;
        const matchId = req.body.matchId;
        const vote = req.body.vote;
        const userId = req.body.userId;
        let remove
        vote == "top" ? remove = "bottom" : remove = "top";
        let insertObject = {[`bracket.${roundId}.${matchId}.${vote}.voters`]: userId}
        let removeObject = {[`bracket.${roundId}.${matchId}.${remove}.voters`]: userId}
        let db_connect = dbo.getDb();
        await db_connect.collection("bracket_data").update({id: bracketId},
            {
                $addToSet: insertObject,
                $pull: removeObject,
            }
        );
        const getData = await db_connect.collection("bracket_data").findOne({id: bracketId});
        res.status(200).send(getData.bracket)
    } catch (e) {
        res.sendStatus(400)
    }
});


routes.route("/voting/round/:bracketId").get(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let db_connect = dbo.getDb();
        // let insertObject = {[`bracket.${roundId}.${matchId}.${vote}.voters`]: userId}
        const {round} = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        res.status(200).send(String(round))
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/voting/round/:bracketId").post(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let newRound = req.body.round;
        let db_connect = dbo.getDb();
        let updateObject = {round: newRound}
        await db_connect.collection("bracket_vote").updateOne({id: bracketId},
            {
                $set: updateObject
            }
        );
        const {round} = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        // res.sendStatus(200);
        res.status(200).send(String(round))
    } catch (e) {
        res.sendStatus(400)
    }
});

module.exports = routes;