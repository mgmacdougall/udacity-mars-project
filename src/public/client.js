let store = Immutable.Map({
  user: { name: "Mike" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  roverData: [],
  roverPhotos: [],
  activeRover: "",
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  let newStore = store.merge(newState);
  Object.assign(store, newStore);
  render(root, store);
};

const updateRoverDataStore = (store, newState) => {
  let newStore = store.set("roverData", newState);
  updateStore(store, newStore);
};

const updateImageStore = (store, newState) => {
  let newImage = store.set("apod", newState);
  updateStore(store, newImage);
};

const updateRoverPhotos = (store, newState, rName) => {
  let imgs = store.get("roverPhotos");
  imgs.push(newState);
  let newImage = store.set(imgs);
  let newUpdate = newImage.set("activeRover", rName);
  updateStore(store, newUpdate);
};

const updateActiveRover = (store, roverName) => {
  let _temp = store.set("activeRover", roverName);
  let _roverPhotos = _temp.set("roverPhotos", []);
  updateStore(store, _roverPhotos);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
  initListeners(state);
  applyChangedState(state);
};

/** Helper function to convert arrays to string values */
const convertArrayToString = (arr) => arr.join("");

/**
 * Apply changeStateStyles if required on re-render.
 * @param {*} currentState
 */
const applyChangedState = (currentState) => {
  const cards = document.querySelectorAll(".card");
  let activeRover = currentState.get("activeRover");
  if (activeRover === "") {
    return;
  }

  cards.forEach((card) => {
    if (card.id && activeRover != card.id) {
      card.classList.add("hidden");
    }
  });
};

// get the photo information
const getPhotos = (state, roverName) => {
  let _rPhotos = state.get("roverPhotos");
  if (_rPhotos.length === 0) {
    let _roverData = state.get("roverData");

    const result = _roverData.filter(
      (e) => e.photo_manifest.name === roverName
    );
    const test = result[0].photo_manifest.photos;
    const lastPhotoDate = test[test.length - 1].earth_date;

    const photoQuery = { name: roverName, date: lastPhotoDate };

    getLatestImageByRoverName(state, photoQuery);
  } else {
    displayPhotos(state);
  }
};

// displays the photos
const displayPhotos = (data) => {
  const roversContainer = document.getElementById("main-container");
  const _data = data.get("roverPhotos");
  let currentRover = data.get("activeRover");
  let dataArray = _data[0].photos.photos;
  let roverName = currentRover;
  const grid = renderImageGrid(dataArray, roverName);
  roversContainer.innerHTML = grid;
};

/**
 * Creates the UL for the rendered images.
 * @param {*} img_data
 * @returns
 */
const renderImageGrid = (img_data, name) => {
  return `
    <div>
      <h2>Images for ${name}:</h2>
    <ul class="img-grid">
      ${convertArrayToString(img_data.map((image) => createListItem(image)))}
    </ul>
    </div>
  `;
};

/**
 * Creates the list item container for the images.
 * @param {*} image_details
 * @returns
 */
const createListItem = (image_details) => {
  return `
    <li class="image-item">
      <img src=${image_details.img_src}>
    </li>
  `;
};

/**
 * Initializes UI Event Listeners on a render/re-render.
 */
const initListeners = (inState) => {
  const cards = document.querySelectorAll(".card");
  // Navigation work
  const curosityNavigationBtn = document.getElementById("nav-Curiosity");
  const curiosityBtn = document.getElementById("Curiosity");

  const opportunityNavigationBtn = document.getElementById("nav-Opportunity");
  const opportunityBtn = document.getElementById("Opportunity");

  const spiritBtn = document.getElementById("Spirit");
  const spiritNavigationBtn = document.getElementById("nav-Spirit");

  const homeBtn = document.getElementById("home");
  const dailyImgSection = document.getElementById("daily-img");

  // Disable the menus if one item selected.
  let anyPhotos = inState.get('roverPhotos');
  if(anyPhotos.length>0){
    let buttons = document.querySelectorAll('li');
    for(let button of buttons){
      if(button.innerText.toUpperCase() !== "REFRESH"){
        button.classList.add('hide-nav-item')
      }
    }
  }

  homeBtn.addEventListener("click", (e) => {
    dailyImgSection.scrollIntoView();
  });

  curosityNavigationBtn.addEventListener("click", (e) => {
    curiosityBtn.scrollIntoView();
    for (let card of cards) {
      if (card.id === e.target.id) {
        setActiveRover(inState, e.target.id);
        getPhotos(inState, e.target.id);
      }
    }
  });

  opportunityNavigationBtn.addEventListener("click", (e) => {
    opportunityBtn.scrollIntoView();
    for (let card of cards) {
      if (card.id === e.target.id) {
        setActiveRover(inState, e.target.id);
        getPhotos(inState, e.target.id);
      }
    }
  });

  spiritNavigationBtn.addEventListener("click", (e) => {
    spiritBtn.scrollIntoView();
    for (let card of cards) {
      if (card.id === e.target.id) {
        setActiveRover(inState, e.target.id);
        getPhotos(inState, e.target.id);
      }
    }
  });

  homeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let currentRover = inState.get("activeRover");
    // If there is a current rover in the store, then run the reload
    if (currentRover) {
      location.reload();
      return false;
    }
  });

  cards.forEach((item) =>
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      const cardId = event.currentTarget.id;
      event.currentTarget.className = "active";
      getPhotos(inState, cardId);
    })
  );
};

// create content
const App = (state) => {
  let apod = state.get("apod");
  let user = state.get("user");
  let rovers = state.get("rovers");
  return `
  <header>
      ${renderComponent(renderRoverList(rovers))}</header>
        <main>
            ${renderComponent(renderGreeting(user))}
            ${renderComponent(renderMainSection(apod))}
            ${renderComponent(renderRoverDataSection(state))}
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  getAllRoversData(store); // called to populate the rovers immediately
});

/**
 * Component render.  Job is to render the given component.
 * This is a controller function that acts as an interface between the root, and the child components
 * @param {*} sec the component to render
 * @returns the renderder component
 */
const renderComponent = (sec) => sec;

/**
 * Renders the Greeting component for the user
 * @param {*} data incoming data that is used by the Greeting component.
 * @returns the greeting to be rendered.
 */
const renderPageGreeting = (data) => `<h1>Welcome, ${data.name}!</h1>`;

/**
 *
 * @returns Default greeting.
 */
const renderGreeting = (data) => {
  if (data.name === undefined) {
    data.name = "User";
    return renderPageGreeting(data);
  }
  return renderPageGreeting(data);
};

const renderInstruction = () => {
  return `<span>Click Again to see recent Mission photos</span>`;
};
/**
 * Renders the main section of the introduction
 * @param {*} data to build other components
 * @returns
 */
const renderMainSection = (data) => {
  return `
    <section id="daily-img">
            ${renderComponent(renderImageSection(data))}
        </section> 
        `;
};

/**
 * Renders the Image Section for the APOD
 * @param {*} data
 * @returns
 */
const renderImageSection = (data) => {
  return `<section>
        ${renderComponent(renderImageOfTheDay(data))}
  </section>`;
};

/**
 * Renders the Rover list for the end user.
 * @param {*} data
 */
const renderRoverList = (data) => {
  return `
  <nav class="menu">
    <div class="main-details">Mars Rovers</div>
    <ul id="rovers" class="nav-bar-main">
      <li id="home" class="nav-item">Refresh</li>
        ${convertArrayToString(data.map((e) => renderOptionItem(e)))}
    </ul>
  </nav>
  `;
};

/**
 * Renders the HTML Button items for the user to select
 * @param {*} item to populate the option itme
 * @returns an individual option item with 'value' and 'item' set to the item
 */
const renderOptionItem = (item) => `<li id=nav-${item} class="nav-item">${item}</li>`;

// For rendering the main content.
const renderRoverDataSection = (state) => {
  let _roverData = state.get("roverData");
  return `
      <div>${renderRoverSection(_roverData)}</div>
  `;
};

/**
 * Rovers rendering section.
 * @returns Rendering component for rovers.
 */
const renderRoverSection = (data) => {
  return `
    <section class="rovers-container" id="main-container">
    <h2>Rovers</h2>
    <div class="card-container">
      ${convertArrayToString(data.map((rover) => renderCardWithImage(rover)))}
      </div>
    </section>
    `;
};

/**
 * Uppercase string
 * @param {*} str 
 * @returns 
 */
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);
/**
 * Renders a card with the given information.
 * @param {} data the data to render in the card.
 * @returns a card with the information filled out.
 */
const renderCardWithImage = (data) => {
  const name = data.photo_manifest.name;
  const launchDate = data.photo_manifest.launch_date;
  const landingDate = data.photo_manifest.landing_date;
  const recentPhoto = data.photo_manifest.max_date;
  const status = data.photo_manifest.status;
  return `
  <article class="card" id=${name}>
    <div class="container" >
        <h4><b>${name}</b></h4>
        <p id="instructions">Click once to filter rover, click again to view photos.</p>
        <img class="rover-img" src="./images/${name}-base.jpg" alt="Sample photo">
        <p>Launch date: ${launchDate} </p>
        <p>Landing date: ${landingDate} </p>
        <p>Most Recent photos: ${recentPhoto} </p>
        <p>Status: ${capitalize(status)} </p>
      </div>
  </article>
  `;
};

/**
 * Helper function to get the current date
 * @returns the current date
 */
const getCurrentDate = () => new Date();

/**
 *
 * @returns The today's date
 */
const getTodaysDate = () => getCurrentDate().getDate();
/**
 * Helper function to create a new date with a given date
 * @param {*} _date date to create.
 * @returns The new date
 */
const createDate = (_date) => new Date(_date);

/**
 * This is the image of the day component
 * @param {*} data from the apod.
 * @returns the image of the date
 */
const renderImageOfTheDay = (data) => {
  // If image does not already exist, or it is not from today -- request it again

  if (!data.image || data.date === getTodaysDate()) {
    getImageOfTheDay(store);
  }

  if (data === "" || data.image === "undefined") {
    return `<h1>Welcome to the MARS Lander home page</h1>`;
  }

  // check if the photo of the day is actually type video!
  if (data.image && data.image.media_type === "video") {
    return `
            <p>See today's featured video here <div><iframe src="${data.image.url}" width="100%" height="350px" frameborder="0" ></iframe></div></p>
            <p>${data.image.title}</p>
            <p>${data.image.explanation}</p>
        `;
  } else {
    return `
            <img src="${data.image.url}" height="350px" width="100%" />
            <p>${data.image.explanation}</p>
        `;
  }
};

/**
 * Fetch call to back end for image of the day.
 * @param {*} state
 */
const getImageOfTheDay = (state) => {
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateImageStore(store, apod));
};

/**
 * Fetch all the data for the rovers.
 */
const getAllRoversData = (state) => {
  const roverData = state.get("roverData");
  if (roverData.length === 0) {
    const rovers = state.get("rovers");

    const rover1 = rovers[0];
    const rover2 = rovers[1];
    const rover3 = rovers[2];
    fetch(
      `http://localhost:3000/rovers?name1=${rover1}&name2=${rover2}&name3=${rover3}`
    )
      .then((res) => res.json())
      .then((roverData) => updateRoverDataStore(store, roverData));
  }
};

const getLatestImageByRoverName = (state, data) => {
  const { name, date } = data;
  fetch(`http://localhost:3000/rover?name=${name.toLowerCase()}&date=${date}`)
    .then((res) => res.json())
    .then((roverPhotos) => updateRoverPhotos(state, roverPhotos, name));
};

const setActiveRover = (state, rName) => {
  updateActiveRover(state, rName);
};
