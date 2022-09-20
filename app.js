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
const convertdbMovieObjectToResponseObject = (DBObject) => {
  return {
    movieId: DBObject.movie_id,
    directorId: DBObject.director_id,
    movieName: DBObject.movie_name,
    leadActor: DBObject.lead_actor,
  };
};

const convertdbDirectorObjectToResponseObject = (DBObject) => {
  return {
    directorId: DBObject.director_id,
    directorName: DBObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * 
    FROM movie

    ORDER BY movie_id;`;
  const movieList = await db.all(getMoviesQuery);
  //console.log(movieList);
  response.send(
    movieList.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  //console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES 
    (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *  FROM movie
    WHERE 
    movie_id =${movieId};`;

  const movie = await db.get(getMovieQuery);
  //console.log(getMovieQuery);
  //console.log(`${movieId}`);
  //console.log(movie);
  response.send(convertdbMovieObjectToResponseObject(movie));
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;
  //console.log(movieDetails);
  const updateMovieQuery = `
  UPDATE movie 
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id =${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director
    ORDER BY 
    director_id;`;
  const director = await db.all(getDirectorQuery);
  response.send(
    director.map((eachMovie) =>
      convertdbDirectorObjectToResponseObject(eachMovie)
    )
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT * FROM
    movie 
    WHERE director_id = ${directorId};`;
  const directorMovie = await db.all(getDirectorQuery);
  response.send(
    directorMovie.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});
module.exports = app;
