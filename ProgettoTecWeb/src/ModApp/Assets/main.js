"use strict";
import * as userTemplates from "./userTemplate.mjs";
import * as squealTemplates from "./squealTemplate.mjs";
import * as channelTemplates from "./channelTemplate.mjs";

const user = {
  local_user: JSON.parse(window.localStorage.getItem("user") || window.sessionStorage.getItem("user")) || undefined,
  auth: window.localStorage.getItem("Authorization") || window.sessionStorage.getItem("Authorization") || undefined,
  object: undefined,
};

const options = (auth, type, body) => ({
  method: type || "GET", // *GET, PATCH, DELETE
  headers: {
    "Content-Type": "application/json",
    Authorization: auth,
  },
  body: body ? JSON.stringify(body) : undefined,
  referrerPolicy: "no-referrer",
});

const DOMelements = {
  usernameInput: undefined,
  channelInput: undefined,

  userForm: undefined,
  channelForm: undefined,

  userCard: undefined,
  channelCard: undefined,

  requestTab: undefined,
  reportsLoadMoreButton: undefined,

  reportedSquealsTab: undefined,
  requestsLoadMoreButton: undefined,

  squealCardsDiv: undefined,

  iframe: undefined,

  reportedSquealsForm: undefined,
  reportedSquealsSelectSortType: undefined,
  reportedSquealsSelectSortBy: undefined,

  logoutButton: undefined,
};

const last_of_arrays = {
  last_reported_squeal: undefined,
  last_user_request: [],
};

document.addEventListener("DOMContentLoaded", async function () {
  var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (screenWidth <= 1200) {
    this.body.innerHTML = "<div class='text-white center-screen'><h1>This page is not available on mobile</h1><p>Squealer - Mod Dashboard</p></div>";
    return;
  }
  if (!user.local_user) {
    this.body.innerHTML = "<div class='text-white center-screen'><h1>No user found in local/session storage</h1><p>Squealer - Mod Dashboard</p></div>";
    return;
  }
  await getUser(user.local_user.username)
    .then((result) => {
      user.object = result;
    })
    .catch((error) => alert(error));
  if (user.object.account_type != "moderator") {
    this.body.innerHTML =
      "<div class='text-white center-screen'><h1>You don't have permission to view this page as you are not a moderator</h1><p>Squealer - Mod Dashboard</p></div>";
    return;
  }

  //DOM ELEMENTS ----------------------------------------------------------------------------------------

  DOMelements.usernameInput = document.getElementById("usernameInput");
  DOMelements.channelInput = document.getElementById("channelInput");

  DOMelements.userForm = document.getElementById("userForm");
  DOMelements.channelForm = document.getElementById("channelForm");

  DOMelements.userCard = document.getElementById("userCard");
  DOMelements.channelCard = document.getElementById("channelCard");

  DOMelements.requestTab = document.getElementById("nav-requests-tab");
  DOMelements.reportedSquealsTab = document.getElementById("nav-squeals-tab");

  DOMelements.iframe = document.getElementById("iframe");

  DOMelements.reportsLoadMoreButton = document.getElementById("reportsLoadMoreButton");
  DOMelements.requestsLoadMoreButton = document.getElementById("requestsLoadMoreButton");

  DOMelements.squealCardsDiv = document.getElementById("squealCards");

  DOMelements.reportedSquealsForm = document.getElementById("reportedSquealsForm");
  DOMelements.reportedSquealsSelectSortType = document.getElementById("reportedSquealsSelectSortType");
  DOMelements.reportedSquealsSelectSortBy = document.getElementById("reportedSquealsSelectSortBy");

  DOMelements.logoutButton = document.getElementById("logout-button");

  //EVENT LISTENERS -------------------------------------------------------------------------------------
  DOMelements.userForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await reloadUser().catch((error) => (DOMelements.userCard.innerHTML = "<div class='text-center text-danger h5 pt-3'>User not found</div>"));
  });

  DOMelements.channelForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await reloadChannel().catch((error) => (DOMelements.channelCard.innerHTML = "<div class='text-center text-danger h5 pt-3'>Channel not found</div>"));
  });

  DOMelements.requestTab.addEventListener("click", async function (e) {
    await loadRequests().catch((error) => alert(error));
  });

  DOMelements.reportedSquealsTab.addEventListener("click", async function (e) {
    await loadReportedSqueals().catch((error) => alert(error));
  });

  DOMelements.reportsLoadMoreButton.addEventListener("click", async function (e) {
    await loadReportedSqueals(true).catch((error) => alert(error));
  });

  DOMelements.requestsLoadMoreButton.addEventListener("click", async function (e) {
    await loadRequests(true).catch((error) => alert(error));
  });

  DOMelements.reportedSquealsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    DOMelements.reportsLoadMoreButton.style.display = "block";
    await loadReportedSqueals().catch((error) => alert(error));
  });

  DOMelements.logoutButton.addEventListener("click", async function (e) {
    window.localStorage.removeItem("Authorization");
    window.localStorage.removeItem("user");
    window.sessionStorage.removeItem("Authorization");
    window.sessionStorage.removeItem("user");
    window.location.href = "/login";
  });

  //-------------------------------FIRST PAGE FUNCTION-----------------------------------------------------------------
  await loadReportedSqueals().catch((error) => alert(error));
});

//CHANNELS
async function loadChannels(channel) {
  await getChannel(channel).then(async (channel) => {
    if (!channel) throw new Error("Channel not found");
    const channel_owner = await getUsername(channel.owner);
    const editors_usernames = await Promise.all(channel.editors.map(async (editor) => getUsername(editor)));
    let editor_list_html = "";
    editors_usernames.forEach((editor) => {
      editor_list_html += channelTemplates.channel_card_editor(editor);
    });
    DOMelements.channelCard.innerHTML = channelTemplates.channel_card(channel, channel_owner, editor_list_html);
    const banButton = document.getElementById("banChannelButton-" + channel._id);
    if (banButton) {
      banButton.addEventListener("click", async function () {
        await banChannel(channel._id, true).then(async () => {
          await reloadChannel();
        });
      });
    }
    const unbanButton = document.getElementById("unbanChannelButton-" + channel._id);
    if (unbanButton) {
      unbanButton.addEventListener("click", async function () {
        await banChannel(channel._id, false).then(async () => {
          await reloadChannel();
        });
      });
    }
    const deleteButton = document.getElementById("deleteChannelButton-" + channel._id);
    if (deleteButton) {
      deleteButton.addEventListener("click", async function () {
        await deleteChannel(channel._id).then(() => {
          DOMelements.channelCard.innerHTML = "";
        });
      });
    }
  });
  return channel;
}

async function reloadChannel() {
  await loadChannels(DOMelements.channelInput.value).then((channel) => {
    const banButton = document.getElementById("banChannelButton-" + channel._id) || undefined;
    const unbanButton = document.getElementById("unbanChannelButton-" + channel._id) || undefined;
    const deleteButton = document.getElementById("deleteChannelButton-" + channel._id) || undefined;
    if (banButton) {
      banButton.addEventListener("click", async function () {
        await banChannel(channel._id, true).then(async () => {
          await reloadChannel();
        });
      });
    }
    if (unbanButton) {
      unbanButton.addEventListener("click", async function () {
        await banChannel(channel._id, false).then(async () => {
          await reloadChannel();
        });
      });
    }
    if (deleteButton) {
      deleteButton.addEventListener("click", async function () {
        await deleteChannel(channel._id).then(async () => {
          await reloadChannel();
        });
      });
    }
  });
}

//USERS
async function loadUser(username) {
  return await getUser(username).then(async (user) => {
    const vipsExist = user.managed_accounts.length > 0;
    const channelsExist = user.owned_channels.length > 0;
    const editorsExist = user.editor_channels.length > 0;

    DOMelements.userCard.innerHTML = userTemplates.user_card(user);
    let channelListDiv = "";
    let VIPlistDiv = "";
    let editorListDiv = "";

    //VIPs get
    if (vipsExist) {
      if (user.managed_accounts.length == 0) {
        VIPlistDiv = "No VIPs managed by this user";
      }

      const VIPusers = [];
      user.managed_accounts.forEach(async (vip) => {
        VIPusers.push(getUser(vip));
      });
      await Promise.all(VIPusers).then((vips) => {
        vips.forEach((vip) => {
          VIPlistDiv += userTemplates.VIPDiv(vip);
        });
      });
      document.getElementById("VIPUserCard").innerHTML = VIPlistDiv;
    } else {
      VIPlistDiv = "No VIPs managed by this user";
    }

    //channels get
    if (channelsExist) {
      const channelList = [];
      user.owned_channels.forEach(async (channel) => {
        channelList.push(getChannel(channel));
      });
      await Promise.all(channelList).then((channels) => {
        channels.forEach((channel) => {
          channelListDiv += userTemplates.channelDiv(channel);
        });
      });
      document.getElementById("channelUserCard").innerHTML = channelListDiv;
    } else {
      channelListDiv = "No channels managed by this user";
    }
    //editors get
    if (editorsExist) {
      if (user.editor_channels.length == 0) {
        editorListDiv = "No channels edited by this user";
      } else {
        const editorList = [];
        user.editor_channels.forEach(async (channel) => {
          editorList.push(getChannel(channel));
        });
        await Promise.all(editorList).then((channels) => {
          channels.forEach((channel) => {
            editorListDiv += userTemplates.editorDiv(channel);
          });
        });
        document.getElementById("editorUserCard").innerHTML = editorListDiv;
      }
    } else {
      editorListDiv = "No channels edited by this user";
    }
    return user;
  });
}

async function reloadUser() {
  await loadUser(DOMelements.usernameInput.value).then((user) => {
    const banButton = document.getElementById("banButton-" + user._id) || undefined;
    const unbanButton = document.getElementById("unbanButton-" + user._id) || undefined;
    const confirmChangesButton = document.getElementById("confirmChangesButton-" + user._id) || undefined;
    if (banButton) {
      banButton.addEventListener("click", async function () {
        await banUser(user.username, true)
          .then(async () => {
            await reloadUser();
          })
          .catch((error) => {
            document.getElementById("userErrorMessage").innerHTML = error;
          });
      });
    }
    if (unbanButton) {
      unbanButton.addEventListener("click", async function () {
        await banUser(user.username, false)
          .then(async () => {
            await reloadUser();
          })
          .catch((error) => {
            document.getElementById("userErrorMessage").innerHTML = error;
          });
      });
    }
    if (confirmChangesButton) {
      confirmChangesButton.addEventListener("click", async function () {
        const accountType = document.getElementById("accountType-" + user._id).value;
        const professionalType = document.getElementById("professionalType-" + user._id).value;
        await confirmChanges(user, accountType, professionalType)
          .then(async () => {
            await reloadUser();
          })
          .catch((error) => {
            document.getElementById("userErrorMessage").innerHTML = error;
          });
      });
    }
  });
}

//REPORTED SQUEALS
async function loadReportedSqueals(load_more = false) {
  let squeals;
  if (!load_more) {
    DOMelements.squealCardsDiv.innerHTML = "";
    squeals = await getReports(false);
  } else {
    squeals = await getReports(true);
  }
  if (!squeals || squeals.length <= 0) {
    const noSquealsMessage = document.createElement("div");
    noSquealsMessage.className = "text-white text-center";
    noSquealsMessage.innerHTML = "No squeals reported";
    DOMelements.squealCardsDiv.appendChild(noSquealsMessage);
    DOMelements.reportsLoadMoreButton.style.display = "none";
  } else {
    last_of_arrays.last_reported_squeal = squeals[squeals.length - 1]._id;
    squeals.forEach(async (squeal) => {
      DOMelements.squealCardsDiv.appendChild(squealTemplates.squeal_card(squeal));
    });
    squeals.forEach(async (squeal) => {
      document.getElementById("squealSafeButton-" + squeal._id).addEventListener("click", async function () {
        await markAsSafe(squeal._id).then(() => {
          document.getElementById("squeal-" + squeal._id).remove();
        });
      });
      document.getElementById("deleteSquealButton-" + squeal._id).addEventListener("click", async function () {
        await deleteSqueal(squeal._id).then(() => {
          document.getElementById("squeal-" + squeal._id).remove();
        });
      });
      document.getElementById("banButton-" + squeal._id).addEventListener("click", async function () {
        await banUser(squeal.username, true).then(() => {
          document.getElementById("squeal-" + squeal._id).remove();
        });
      });
    });
  }
}

//ACCOUNT CHANGE REQUESTS
async function loadRequests(loadMore = false) {
  const requests = await getRequests(loadMore);
  if (requests && requests.length > 0) {
    const outputElement = document.getElementById("requests");
    last_of_arrays.last_user_request = requests[requests.length - 1]._id;

    if (!loadMore) outputElement.innerHTML = "";
    requests.forEach((request) => {
      outputElement.appendChild(userTemplates.request_card(request));
    });
    requests.forEach((request) => {
      document.getElementById("acceptRequestButton-" + request._id).addEventListener("click", async function () {
        await resolveUserRequest(request._id, "accept").then(() => {
          document.getElementById("request-" + request._id).remove();
        });
      });
      document.getElementById("declineRequestButton-" + request._id).addEventListener("click", async function () {
        await resolveUserRequest(request._id, "decline").then(() => {
          document.getElementById("request-" + request._id).remove();
        });
      });
      document.getElementById("request-body-" + request._id).addEventListener("click", async function () {
        DOMelements.iframe.src = "profile/" + request.username;
      });
    });
  }
}

//---------------------------------API REQUESTS----------------------------------------------------
//--------------------- GET --------------------//
async function getUsername(user_id) {
  const apiUrl = "users/username/?identifier=" + user_id;
  let result;
  // Make a GET request
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data.username;
    });

  return result;
}

async function getUser(username) {
  if (!username || username == "") return {};
  const apiUrl = "users/" + username;

  let result;
  // Make a GET request
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function getChannel(channel) {
  if (!channel || channel == "") return undefined;
  const apiUrl = "channels/" + channel;
  let result;
  // Make a GET request
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function getReports(load_more = false, checked = false) {
  let apiUrl = "squeals/reported?checked=" + checked;
  if (load_more) apiUrl += "&last_loaded=" + last_of_arrays.last_reported_squeal;
  if (DOMelements.reportedSquealsSelectSortBy.value != "none") apiUrl += "&sort_by=" + DOMelements.reportedSquealsSelectSortBy.value;
  if (DOMelements.reportedSquealsSelectSortType.value != "none") apiUrl += "&sort_order=" + DOMelements.reportedSquealsSelectSortType.value;
  let result;
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        if ((DOMelements.reportedSquealsSelectSortBy.value != "none") ^ (DOMelements.reportedSquealsSelectSortType.value != "none")) {
          throw new Error("You must select both sort by and sort type");
        } else {
          throw new Error("Network response was not ok");
        }
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
      if (result.length > 0) last_of_arrays.last_reported_squeal = result[result.length - 1]._id;
    });
  return result;
}

async function getRequests(loadMore = false) {
  let apiUrl = "/users/mod-request-list";
  if (loadMore) apiUrl += "?last_loaded=" + last_of_arrays.last_user_request;
  let result;
  // Make a GET request
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
      if (result.length <= 0) DOMelements.requestsLoadMoreButton.style.display = "none";
    });
  return result;
}

//-------------------- PATCH --------------------//
async function resolveUserRequest(requestId, accepted) {
  const apiUrl = `users/request/${requestId}/${accepted}`;
  let result;
  // Make a PATCH request
  await fetch(apiUrl, options(user.auth, "PATCH"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function markAsSafe(squealId) {
  const apiUrl = `squeals/checked/${squealId}`;
  let result;
  // Make a PATCH request
  await fetch(apiUrl, options(user.auth, "PATCH"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function banUser(username, setBan) {
  const apiUrl = `users/${username}/ban-status?value=${setBan}`;
  let result;
  await fetch(apiUrl, options(user.auth, "PATCH"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function banChannel(channelId, setBan) {
  const apiUrl = `channels/${channelId}/blocked-status?value=${setBan}`;
  let result;
  await fetch(apiUrl, options(user.auth, "PATCH"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })

    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

async function confirmChanges(userToUpdate, accountType, professionalType) {
  const apiUrl = `users/${userToUpdate.username}/type`;
  const body = {};
  accountType ? (body.account_type = accountType) : null;
  professionalType ? (body.professional_type = professionalType) : null;

  let result;
  await fetch(apiUrl, options(user.auth, "PATCH", body))
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Network response was not ok");
      }
      return response;
    })

    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
}

//-------------------- DELETE --------------------//
async function deleteSqueal(squealId) {
  const apiUrl = `squeals/${squealId}`;
  let result;
  await fetch(apiUrl, options(user.auth, "DELETE"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
}

async function deleteChannel(channelId) {
  const apiUrl = `channels/${channelId}`;
  let result;
  await fetch(apiUrl, options(user.auth, "DELETE"))
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
}
