/*************************
 * CONFIGURACIÓN
 *************************/
const API_KEY = "AIzaSyA57kxLT6R8rY8GRs0-MD7byYTgb3uGOX0";


// PUEDES AGREGAR MÁS CARPETAS AQUÍ

const ROOT_FOLDERS = [
      { id: "1Sh52AXtwicmQAA6eydV1Wd6-7ScX3Ald", name: "Todos los gustos" },
      { id: "1ZPC9XNSKRmJy05vyOJ8M0EPd6mxTyJmt", name: "Diciembre" },
      { id: "1W0V97gKVlYGUYYWJyOrNqgzAIHW99Vv5", name: "MusicaDJsBMP" },
      { id: "1WpoqPYDp1Et2KiU4yQ7fFtqy77MpA4GM", name: "BMP" },
      { id: "12KeZLwGmsUC0hiy6_Y5ldHsX4lLyIxrt", name: "Remix" },
      { id: "1gKlzBAYoWmI_IkOkGnoAx3UQFgB_84Tu", name: "Remix2" },
      { id: "1tjm_CdRMehl3Mao2u_seGLrKpVM03TTt", name: "+Music" },
      { id: "1fz78n-9OPm4uuslBfDXpR7NvkoVtn20B", name: "Series" }

      
];

/*************************
 * ELEMENTOS DOM
 *************************/
const list = document.getElementById("list");
const audio = document.getElementById("audio");
const now = document.getElementById("now");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

/*************************
 * ESTADO
 *************************/
let songs = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = "off"; // off | one | all
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/*************************
 * INICIO
 *************************/
function home() {
  list.innerHTML = "<h2>Bienvenido a ENRAZ Music</h2>";
}

/*************************
 * CARPETAS
 *************************/
function loadFolders() {
  list.innerHTML = "<h2>Bibliotecas</h2>";

  // Favoritas
  const fav = document.createElement("div");
  fav.textContent = "⭐ Favoritas";
  fav.onclick = showFavorites;
  list.appendChild(fav);

  ROOT_FOLDERS.forEach(root => {
    const div = document.createElement("div");
    div.textContent = "📂 " + root.name;
    div.onclick = () => loadSubFolders(root.id);
    list.appendChild(div);
  });
}

function loadSubFolders(rootId) {
  fetch(`https://www.googleapis.com/drive/v3/files?q='${rootId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      list.innerHTML = "<h2>Playlists</h2>";

      if (!data.files || data.files.length === 0) {
        list.innerHTML += "<p>No hay carpetas</p>";
        return;
      }

      data.files.forEach(folder => {
        const div = document.createElement("div");
        div.textContent = "📁 " + folder.name;
        div.onclick = () => loadSongs(folder.id, folder.name);
        list.appendChild(div);
      });
    });
}

/*************************
 * CANCIONES
 *************************/
function loadSongs(folderId, folderName) {
  fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType contains 'audio'&key=${API_KEY}`)
    .then(r => r.json())
    .then(data => {
      songs = data.files || [];
      currentIndex = 0;

      list.innerHTML = `<h2>${folderName}</h2>`;

      if (songs.length === 0) {
        list.innerHTML += "<p>No hay canciones</p>";
        return;
      }

      songs.forEach((song, i) => {
        const div = document.createElement("div");
        div.textContent = "🎵 " + song.name;
        div.onclick = () => playSong(i);
        list.appendChild(div);
      });
    });
}

/*************************
 * REPRODUCCIÓN
 *************************/
function playSong(index) {
  if (!songs[index]) return;

  currentIndex = index;
  const song = songs[index];

  audio.src = `https://www.googleapis.com/drive/v3/files/${song.id}?alt=media&key=${API_KEY}`;
  audio.play();

  isPlaying = true;
  now.textContent = song.name;
}

/*************************
 * PLAY / PAUSA
 *************************/
function togglePlay() {
  if (!audio.src) return;

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
}

/*************************
 * SIGUIENTE / ANTERIOR
 *************************/
function next() {
  if (songs.length === 0) return;

  if (isShuffle) {
    let rand;
    do {
      rand = Math.floor(Math.random() * songs.length);
    } while (rand === currentIndex);
    playSong(rand);
    return;
  }

  if (currentIndex < songs.length - 1) {
    playSong(currentIndex + 1);
  } else if (repeatMode === "all") {
    playSong(0);
  }
}

function prev() {
  if (currentIndex > 0) {
    playSong(currentIndex - 1);
  }
}

/*************************
 * TIEMPO Y PROGRESO
 *************************/
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
  
    const current = formatTime(audio.currentTime);
    const remaining = formatTime(audio.duration - audio.currentTime);
  
    now.textContent = `${current} / -${remaining}`;
  });
  
  progress.addEventListener("input", () => {
    audio.currentTime = (progress.value / 100) * audio.duration;
  });
  
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

/*************************
 * FIN DE CANCIÓN
 *************************/
audio.addEventListener("ended", () => {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
  } else {
    next();
  }
});

/*************************
 * ALEATORIO
 *************************/
function shuffle() {
  isShuffle = !isShuffle;
  alert(isShuffle ? "Aleatorio activado" : "Aleatorio desactivado");
}

/*************************
 * REPETIR
 *************************/
function repeat() {
  if (repeatMode === "off") repeatMode = "one";
  else if (repeatMode === "one") repeatMode = "all";
  else repeatMode = "off";

  alert("Repetir: " + repeatMode);
}

/*************************
 * FAVORITOS
 *************************/
function fav() {
  const song = songs[currentIndex];
  if (!song) return;

  if (!favorites.find(s => s.id === song.id)) {
    favorites.push(song);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Añadido a favoritos ❤️");
  }
}

function showFavorites() {
  songs = favorites;
  currentIndex = 0;

  list.innerHTML = "<h2>⭐ Favoritas</h2>";

  if (songs.length === 0) {
    list.innerHTML += "<p>No hay favoritas</p>";
    return;
  }

  songs.forEach((song, i) => {
    const div = document.createElement("div");
    div.textContent = "❤️ " + song.name;
    div.onclick = () => playSong(i);
    list.appendChild(div);
  });
}

/*************************
 * VOLUMEN
 *************************/
volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

/*************************
 * ARRANQUE
 *************************/
home();
