"use strict";
//const user = await getModerator();
//const squeals = await getReports();
const usernameInput = Document.getElementById('userInput');
const channelInput = document.getElementById('channelInput');
const squealInput = document.getElementById('squealInput');



document.addEventListener("DOMContentLoaded", function () {
});

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
  const identifier = window.localStorage.getItem('user') || window.sessionStorage.getItem('user');
  if(!identifier) {
    ;
  }
  const apiUrl = 'user/' + identifier;

  // Make a GET request
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function getReports() {
  const apiUrl = 'squeals';
  const outputElement = document.getElementById('reports');

  // Make a GET request
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function getUser() {
  const apiUrl = 'user/' + usernameInput.value;
  const outputElement = document.getElementById('user');

  // Make a GET request
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function getChannel() {
  const apiUrl = 'channels/' + channelInput.value;
  const outputElement = document.getElementById('channel');

  // Make a GET request
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function getSqueal() {
  const apiUrl = 'squeals/' + squealInput.value;
  const outputElement = document.getElementById('squeal');

  // Make a GET request
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      outputElement.innerHTML = data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}