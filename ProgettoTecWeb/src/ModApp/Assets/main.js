"use strict";
//const user = await getModerator();
//const squeals = await getReports();
const usernameInput = document.getElementById("userInput");
const channelInput = document.getElementById("channelInput");
const squealInput = document.getElementById("squealInput");

//-------------------- GET --------------------//
document.addEventListener("DOMContentLoaded", async function () {
  const mod = await getModerator();
  if (!mod.account_type == "moderator") {
    console.error("You don't have permission to view this page.");
    return;
  }
});

async function loadRequests() {
  const requests = await getRequests();
  const outputElement = document.getElementById("requests");
  requests.forEach((request) => {
    outputElement.innerHTML = `<div class="row mt-5">
  <div class="col-3"></div>
  <div class="card mb-3 mt-4 datacard col">
      <div class="row g-0">
          <div class="col-md-4 align-items-center d-flex">
              <img src="./../media/img/${request.profile_picture}" class="img-fluid rounded-start propic "
                  alt="./Assets/logo.png">
          </div>
          <div class="col-md-8">
              <div class="card-body">
                  <h6 class="card-title">${request.username}</h6>
                  <h5 class="card-body">Wants to become a <b>${request.type}</b> account </h5>
              </div>
          </div>
          <div class="card-footer">
              <div class="row">
                  <div class="col-6">
                      <button class="btn btn-success">ACCEPT</button>
                  </div>
                  <div class="col-6">
                      <button class="btn btn-danger">DECLINE</button>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <div class="col-3"></div>
</div>;`;
  });
}

document.getElementById("userInput").addEventListener("submit", function (e) {
  e.preventDefault();

  let formData = new FormData(form);
  console.log(formData);
  // output as an object
  console.log(Object.fromEntries(formData));

  // ...or iterate through the name-value pairs
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }
});

// Define the API URL
async function getModerator() {
  const identifier = JSON.parse(window.localStorage.getItem("user") || window.sessionStorage.getItem("user")) || undefined;
  if (!identifier) {
    console.error("No user identifier found");
    return;
  }
  const apiUrl = "user/" + identifier;

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getReports() {
  const apiUrl = "squeals";
  const outputElement = document.getElementById("reports");

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getUser() {
  const apiUrl = "user/" + usernameInput.value;
  const outputElement = document.getElementById("user");

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getChannel() {
  const apiUrl = "channels/" + channelInput.value;
  const outputElement = document.getElementById("channel");

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getSqueal() {
  const apiUrl = "squeals/" + squealInput.value;
  const outputElement = document.getElementById("squeal");

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getRequests() {
  const apiUrl = "mod-request-list";
  const outputElement = document.getElementById("requests");

  // Make a GET request
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((data) => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
//-------------------- POST --------------------//
