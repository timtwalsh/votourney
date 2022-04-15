const express = require("express");
const routes = express.Router();

// voting/start/:bracketId
// voting/stop/:bracketId

// voting/vote/:bracketId/:matchId/top
// voting/vote/:bracketId/:matchId/bottom

const dbo = require("../db/conn");

routes.route("/api/voting/create/:bracketId").post(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let dataObject = {id: bracketId, round: -1}
        // insert record
        let db_connect = dbo.getDb();
        const getData = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        if (getData == null) {
            const dbInsert = await db_connect.collection("bracket_vote").insertOne(dataObject);
            if (dbInsert.result.n === 1) {
                res.status(201).send(JSON.stringify(dataObject.round));
            }
        } else {
            res.status(400).send(JSON.stringify(getData.round))
        }
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/api/voting/:bracketId").post(async (req, res) => {
    const bracketId = req.params.bracketId;
    try {
        const roundId = req.body.roundId;
        const matchId = req.body.matchId;
        const vote = req.body.vote;
        const userId = req.body.userId;
        let remove
        vote === "top" ? remove = "bottom" : remove = "top";
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


routes.route("/api/voting/round/:bracketId").get(async (req, res) => {
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

routes.route("/api/voting/round/:bracketId").post(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let newRound = req.body.round;
        await resolveRound(bracketId, newRound-1)
        let db_connect = dbo.getDb();

        let updateObject = {round: newRound}
        await db_connect.collection("bracket_vote").updateOne({id: bracketId},
            {
                $set: updateObject
            }
        );
        const {round} = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        res.status(200).send(String(round))
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/api/bracket/resolve/:bracketId").post(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let roundId = req.body.roundId;
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("bracket_data").findOne({id: bracketId});
        let newBracket = result.bracket;
        if (roundId >= -1) {
            const participants = await evaluateRound(bracketId, roundId, newBracket);
            roundId++;
            for (let currentMatch in newBracket[roundId]) {
                newBracket[roundId][currentMatch]['top']['participant'] = participants.shift();
                newBracket[roundId][currentMatch]['bottom']['participant'] = participants.shift();
            }
            let updateObject = {bracket: newBracket}
            const update = await db_connect.collection("bracket_data").updateOne({id: bracketId},
                {
                    $set: updateObject
                }
            );
            if (update.modifiedCount === 1)
                res.sendStatus(200)
        }
    } catch (e) {
        res.sendStatus(400)
    }
});

async function resolveRound(bracketId, roundId) {
    try {
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("bracket_data").findOne({id: bracketId});
        let newBracket = result.bracket;
        if (roundId >= -1 && roundId < result.bracket.length) {
            const participants = await evaluateRound(bracketId, roundId, newBracket);
            roundId++;
            for (let currentMatch in newBracket[roundId]) {
                newBracket[roundId][currentMatch]['top']['participant'] = participants.shift();
                newBracket[roundId][currentMatch]['bottom']['participant'] = participants.shift();
            }
            let updateObject = {bracket: newBracket}
            const update = await db_connect.collection("bracket_data").updateOne({id: bracketId},
                {
                    $set: updateObject
                }
            );
            if (update.modifiedCount === 1)
                return 200;
        }
    } catch (e) {
        return 400;
    }
}

async function evaluateRound(bracketId, round, bracket) {
    let winners = [];
    bracket[round].map((match) => {
        let winner;
        match.top.voters.length > match.bottom.voters.length ? winner = match.top.participant : winner = match.bottom.participant;
        winners = [...winners, winner]
    });
    return winners;
}

module.exports = routes;