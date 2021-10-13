let store = Immutable.Map({
  user: {name:"Student!"},
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  let newStore = store.set("apod", newState);
  render(root, newStore);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
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
            ${renderComponent(renderSection(apod))}
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS
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
const renderPageGreeting = (data) => `<h1>Welcome, ${data.name}!</h1>`

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
const renderSection = (data) => {
  return `
    <section>
        <h3>Put things on the page!</h3>
        <p>Here is an example section.</p>
        <p>
            One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
            the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
            This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
            applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
            explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
            but generally help with discoverability of relevant imagery.
        </p>
        </section> 
        ${renderComponent(renderImageSection(data))}
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
  <label for="rovers-select">Choose a Rover To View:</label>
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

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state;
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, apod));
};
