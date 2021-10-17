let store = Immutable.Map({
  user: { name: "Mike" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  roverData: [],
  roverPhotos: [],
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

const updateRoverPhotos = (store, newState) => {
  let newImage = store.set("roverPhotos", newState);
  updateStore(store, newImage);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
  await initListeners();
};

///// Attached event listerners takes place after the App root rendered complete
const initListeners = async () => {
  document
    .getElementById("Spirit")
    .addEventListener("click", (e) => console.log(e.target));
};

// create content
const App = (state) => {
  let apod = state.get("apod");
  let user = state.get("user");
  let rovers = state.get("rovers");
  return `
  <header>${renderComponent(renderRoverList(rovers))}</header>
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

/**
 * Renders the main section of the introduction
 * @param {*} data to build other components
 * @returns
 */
const renderMainSection = (data) => {
  return `
    <section>
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

/** Helper function to convert arrays to string values */
const convertArrayToString = (arr) => arr.join("");

/**
 * Renders the Rover list for the end user.
 * @param {*} data
 */
const renderRoverList = (data) => {
  return `
  <label for="rovers-select">Choose a Rover To More Details:</label>
  <select name="rovers" id="rovers" placeholder="Select a rover">
    ${convertArrayToString(data.map((e) => renderOptionItem(e)))}
  </select>
  `;
};

/**
 * Renders the HTML Option items for the user to select
 * @param {*} item to populate the option itme
 * @returns an individual option item with 'value' and 'item' set to the item
 */
const renderOptionItem = (item) => `<option value="${item}">${item}</option>`;

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
    <section class="rovers-container">
    <h2>Here are the rovers</h2>
    <div class="card-container">
      ${convertArrayToString(data.map((rover) => renderCardWithImage(rover)))}
      </div>
    </section>
    `;
};

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

  return `
  <article class="card"  id=${name}>
    <div class="container">
        <h4><b>${name}</b></h4>
        <img class="rover-img" src="./images/${name}-base.jpg" alt="Sample photo">
        <p>Launch date: ${launchDate} </p>
        <p>Landing date: ${landingDate} </p>
        <p>Most Recent photos: ${recentPhoto} </p>
        <p>Most Recent photos date: recentPhoto </p>
        <button>View photos</button>
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
 * @param {*} data fro the apod.
 * @returns the image of the date
 */
const renderImageOfTheDay = (data) => {
  // If image does not already exist, or it is not from today -- request it again

  if (!data.image || data.date === getTodaysDate()) {
    // getImageOfTheDay(store);
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
  fetch(`http://localhost:3000/rovers`)
    .then((res) => res.json())
    .then((roverData) => updateRoverDataStore(store, roverData));
};

const getLatestImageByRoverName = (state, rover) => {
  console.log(state, rover);
  fetch(`http://localhost:3000/rover?name=${rover}`)
    .then((res) => res.json())
    .then((roverData) => updateRoverPhotos(store, roverData));
};
