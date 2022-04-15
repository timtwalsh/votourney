const express = require("express");
const routes = express.Router();
const {v4: uuidv4} = require('uuid');
const lodash = require("lodash");
const dbo = require("../db/conn");


routes.route("/api/bracket/:bracketId").get(async (req, res) => {
    try {
        const bracketId = req.params.bracketId;
        let db_connect = dbo.getDb();
        const getData = await db_connect.collection("bracket_data").findOne({id: bracketId});
        if (getData)
            res.status(200).send([{bracket: getData.bracket, "admin": getData.admin}])
        else
            res.status(400).send("Bracket not found with id: " + bracketId)
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/api/bracket").get(async (req, res) => {
    try {
        res.status(400).send(`Error: GET supports specific id only: bracket/bracketId - eg. bracket/123xxxxxxxxxxxxxxxxxxx24`)
    } catch (e) {
        res.sendStatus(400)
    }
});

routes.route("/api/brackets").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const dbGetCursor = await db_connect.collection("bracket_data").find({}, {_id: 0});
        const results = await dbGetCursor.toArray({}, {_id: 0})
        if (results.length >= 1)
            res.status(201).send(results);
        else
            res.status(400).send("Sorry! Data not found...")
    } catch (e) {
        res.sendStatus(400)
    }
});

function nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log(n) / Math.log(2)));
}

function generateBracket(participantCount) {
    const defaultMatch = {
        top: {participant: {name: '', platforms: '', genres: '', year: ''}, voters: []},
        bottom: {participant: {name: '', platforms: '', genres: '', year: ''}, voters: []},
    };
    let firstRound = [...Array(nextPowerOfTwo(participantCount) / 2)].map(_ => ((lodash.cloneDeep(defaultMatch))));
    let allRounds = [firstRound];
    for (let i = 0; i < Math.log2(participantCount) - 1; i++)
        allRounds[i + 1] = lodash.cloneDeep(firstRound).slice(0, allRounds[i].length / 2);
    return allRounds;
}

function fillRound(round, bracket, participants) {
    const defaultParticipant = {name: '', platforms: '', genres: '', year: ''};
    const participantCount = participants.length;
    const requiredParticipants = nextPowerOfTwo(participantCount);

    let availableParticipants = lodash.cloneDeep(participants);
    // Add empty teams as bye-rounds.
    if (participantCount < requiredParticipants) {
        const extraParticipants = new Array(requiredParticipants - participantCount);
        extraParticipants.fill(lodash.cloneDeep(defaultParticipant));
        availableParticipants.push(...extraParticipants)
    }

    let newBracket = [...bracket];
    for (let currentMatch in newBracket[round]) {
        newBracket[round][currentMatch]['top']['participant'] = availableParticipants.shift();
        newBracket[round][currentMatch]['bottom']['participant'] = availableParticipants.pop();
    }
    return newBracket;
}

async function createVoteRecord(bracketId) {
    try {
        let dataObject = {id: bracketId, round: -1}
        // insert record
        let db_connect = dbo.getDb();
        const getData = await db_connect.collection("bracket_vote").findOne({id: bracketId});
        if (getData == null) {
            const dbInsert = await db_connect.collection("bracket_vote").insertOne(dataObject);
            if (dbInsert.result.n === 1) {
                return true;
            }
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }

}

routes.route("/api/bracket").post(async (req, res) => {
    try {
        if (req.body) {
            if (req.body.participants && req.body.userId) {
                const participantCount = req.body.participants.length;
                const participants = req.body.participants;
                const userId = req.body.userId;
                if (participantCount >= 2) {
                    // Create Bracket
                    let bracket = fillRound(0, generateBracket(participantCount), participants)
                    // make Database record
                    const bracketId = uuidv4();
                    let dataObject = {bracket: bracket, id: bracketId, admin: userId}
                    // insert record
                    let db_connect = dbo.getDb();
                    const dbInsert = await db_connect.collection("bracket_data").insertOne(dataObject);
                    if (dbInsert.result.n === 1) {
                        await createVoteRecord(bracketId)
                            .then(
                                res.status(201).send(bracketId)
                            )
                    } else {
                        res.status(400).send("Sorry! Data could not be recorded...")
                    }
                } else {
                    res.status(400).send("Not enough participants, must have at least 2 participants");
                }
            } else {
                console.log(req.body);
                res.status(400).send(`No participant data received: ${Object.keys(req.body)}`)
            }
        } else {
            res.status(400).send("No data received")
        }
    } catch (e) {
        res.sendStatus(400)
    }
});

module.exports = routes;