if (localStorage.getItem('actorsStorage') === null)
  localStorage.setItem('actorsStorage', [])

if (localStorage.getItem('actor')) {
  setActor(JSON.parse(localStorage.getItem('actor')))
  if (localStorage.getItem('movie'))
  setMovie(JSON.parse(localStorage.getItem('movie')))
}
updateWinPercentage()

let incrementLocalStorageVar = (varName, incrementValue) => {
  let localVar = localStorage.getItem(varName)
  if (localVar === null)
    localStorage.setItem(varName, incrementValue)
  else
    localStorage.setItem(varName, Number(localVar) + incrementValue)
}

document.querySelector('#actor').addEventListener('click', getActorID)
document.querySelector('#movie-guess').addEventListener('click', guessMovie)


function getActorID(){
  if (localStorage.getItem('actor')) {

    let actorsStorage = JSON.parse(localStorage.getItem('actorsStorage') || '[]')
    let newActor = JSON.parse(localStorage.getItem('actor'))
    console.log(actorsStorage, newActor)
    localStorage.setItem('actorsStorage', JSON.stringify( actorsStorage.concat(newActor) ))
  }


  const actor = encodeURIComponent(document.querySelector('#actor-input').value)
  const url = `https://imdb-api.com/en/API/SearchName/k_c7gkqf7r/${actor}`
  //let more = are gonna = be k_7qwl86a3 kro  k_c7gkqf7r sudo ok cool that's all
  console.log(url)

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        let actorID = data.results[0].id
        console.log("got data for the actor", data)
        getActorMovies(actorID)
      })
      .catch(err => {
          console.log(`error ${err}`)
      })
}

function getActorMovies(id) {
  fetch(`https://imdb-api.com/en/API/Name/k_c7gkqf7r/${id}`)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log("got the actor's list of movies")
        localStorage.setItem('actor', JSON.stringify(data))
        setActor(JSON.parse(localStorage.getItem('actor')))
      })
      .catch(err => {
          console.log(`error ${err}`)
      })
}

function getPlotSynopsis(movieID) {
  fetch(`https://imdb-api.com/en/API/Title/k_c7gkqf7r/${movieID}`)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        movieData = data
      })
      .catch(err => {
          console.log(`error ${err}`)
      })
}

function guessMovie() {
  const movieGuess = document.querySelector("#movie-input").value.toLowerCase().replace(/ /g, "")
  document.querySelector("#movie-input").value = ""
  if (movieGuess === JSON.parse(localStorage.getItem('movie')).title.toLowerCase().replace(/ /g, ''))
    win()
  else
    lose()
  updateWinPercentage()
  if (clearMovie())
    pickRandomMovie()
}

function win() {
  incrementLocalStorageVar('wins', 1)
  alert('yay you won')
}

function lose() {
  incrementLocalStorageVar('losses', 1)
  let movie = JSON.parse(localStorage.getItem('movie')).title
  alert(`wow you lost, the movie was ${movie}`)
}

function updateWinPercentage() {
  let wins = Number(localStorage.getItem('wins')) || 0
  let losses = Number(localStorage.getItem('losses')) || 0
  document.querySelector('h2 span').innerText = `${Math.round(wins / (wins+losses) * 1000)/10}%`
  if (wins > losses)
  document.querySelector('h2 span').style.color = "green"
  else
  document.querySelector('h2 span').style.color = "red"
}

function setActor(actor) {
  document.querySelector('img').src = actor.image
  document.querySelector('section h2').innerText = actor.name
  pickRandomMovie()
}

function setMovie(movie) {
  let role = movie.role
  if (movie.title.toLowerCase().includes(role.toLowerCase())) {
    role = censorTitle(role)
  }
  document.querySelector('section h3').innerText = `${movie.year}\nrole: ${role}`
  // document.querySelector('h3').innerText = movie.plot.replaceAll(movie.title, '[movie title]')
        // document.querySelector('h3').innerText = bigMovie.title
}

function pickRandomMovie() {
  let actor = JSON.parse(localStorage.getItem('actor'))
  let remainingMovieCount = actor.knownFor.length
  
  let randomMovieIndex = Math.floor(Math.random() * remainingMovieCount)
  let bigMovie = actor.knownFor[randomMovieIndex]
  localStorage.setItem('movie', JSON.stringify(bigMovie))
  setMovie(bigMovie)
  // getPlotSynopsis(bigMovie.id)
}

function clearMovie() {
  //clears away the current movie from this actor's list.
  let actor = JSON.parse(localStorage.getItem('actor'))
  let movie = JSON.parse(localStorage.getItem('movie'))
  actor.knownFor = actor.knownFor.filter(movieKnownFor => JSON.stringify(movieKnownFor, null, 0) !== JSON.stringify(movie, null, 0))
  localStorage.setItem('actor', JSON.stringify(actor))
  localStorage.removeItem('movie')
  let remainingMovieCount = actor.knownFor.length
  if (remainingMovieCount === 0) {
    localStorage.removeItem('actor')
    document.querySelector('section h2').innerText = "choose an actor"
  document.querySelector('section h3').innerText = ""
  document.querySelector('img').src = ""
    alert('you went through all their biggest movies')
  }
  return remainingMovieCount
}

function censorTitle(strng) {
  strng = strng.split(' ')
  strng = strng.map(word => word[0] + "*".repeat(word.slice(1).length)).join(' ')
  return `${strng}\n[censored because this character's name is in the movie's title]`
}