const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message} `);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_Id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jerseyNumber,
    role: dbObject.role,
  };
};

//get all players

app.get("/players/", async (request, response) => {
  const getPlayer = `
    SELECT *
    FROM  cricket_team;`;
  const playerArray = await db.all(getPlayer);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id=${playerId};`;
  const player = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

//add player api

app.post("/players/", async (request, response) => {
  const AddPlayer = request.body;
  const { playerName, jerseyNumber, role } = AddPlayer;

  const addNewPlayer = `
    INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES
    (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'

    );`;

  const player = await db.run(addNewPlayer);
  response.send("Player Added to Team");
});

//put response

app.put("/players/:playerId/", async (request, response) => {
  const AddPlayer = request.body;
  const { playerName, jerseyNumber, role } = AddPlayer;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE
    cricket_team
    SET
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    WHERE
    player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete request

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE
    FROM
    cricket_team
    WHERE
    player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
