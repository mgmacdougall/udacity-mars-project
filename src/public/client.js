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
  let newImage = store.set("roverPhotos", newState);
  let newUpdate = newImage.set("activeRover", rName);
  updateStore(store, newUpdate);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
  initListeners();
  applyChangedState(state);
};

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

/**
 * Initializes UI Event Listeners on a render/re-render.
 */
const initListeners = () => {
  const cards = document.querySelectorAll(".card");
  const roverSelection = document.getElementById("rovers");

  roverSelection.addEventListener("change", (e) => {
    const selection = e.target.options[rovers.selectedIndex];
    const selectedItem = selection.value;
    document.getElementById(selectedItem).scrollIntoView();
  });

  // get the photo information
  const getPhotos = (state, roverName) => {
    let _rPhotos = state.get('roverPhotos')
    if(_rPhotos.length === 0){
      let _roverData = state.get('roverData')
      
      const result = _roverData.filter((e)=> e.photo_manifest.name===roverName);
      const test = result[0].photo_manifest.photos;
      const lastPhotoDate = test[test.length-1].earth_date;
      
      const photoQuery = {name: roverName, date: lastPhotoDate}
      
      getLatestImageByRoverName(state, photoQuery);
    }else{
      displayPhotos(state);}
    }

  // displays the photos
  const displayPhotos = (data) => {
    const v = data.get('roverPhotos')
    let dataArray = v.photos.photos
    dataArray.forEach((c)=> console.log(c.img_src))
  };

  cards.forEach((item) =>
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      const cardId = event.currentTarget.id;
      event.currentTarget.className = "active"; // maybe
      getPhotos(store, cardId);
    })
  );
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
  <article class="card" id=${name}>
    <div class="container" >
        <h4><b>${name}</b></h4>
        <p>Click the card twice to view the latest images.</p>
        <img class="rover-img" src="./images/${name}-base.jpg" alt="Sample photo">
        <p>Launch date: ${launchDate} </p>
        <p>Landing date: ${landingDate} </p>
        <p>Most Recent photos: ${recentPhoto} </p>
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

  const roverData = state.get('roverData');
  if(roverData.length===0){
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
  const {name, date} = data;
  fetch(`http://localhost:3000/rover?name=${name}&date=${date}`)
    .then((res) => res.json())
    .then((roverPhotos) => updateRoverPhotos(state, roverPhotos, name));
};
