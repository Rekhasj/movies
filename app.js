const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

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
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertdbObjectToResponseObject = (DBObject) => {
  return {
    movieId: DBObject.movie_id,
    directorId: DBObject.director_id,
    movieName: DBObject.movie_name,
    leadActor: DBObject.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * 
    FROM movie

    ORDER BY movie_id;`;
  const movieList = await db.all(getMoviesQuery);

  response.send(
    movieList.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES 
    (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successhully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *  FROM movie
    WHERE 
    movie_id =${movieId};`;

  const movie = await db.get(getMovieQuery);
  console.log(getMovieQuery);
  //console.log(`${movieId}`);
  console.log(movie);
  //console.log(convertdbObjectToResponseObject(movie));
});

// API 4
app.put("movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie 
  SET director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor='${leadActor}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

module.exports = app;
