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
  dailyResetButton: undefined,
  weeklyResetButton: undefined,
  monthlyResetButton: undefined,
  rewardResetButton: undefined,

  usersForm: undefined,
  usernameInput: undefined,
  usersSearchError: undefined,
  userCard: undefined,
  usersList: undefined,
  usersSelectSortType: undefined,
  usersSelectSortBy: undefined,
  usersVipRadio: undefined,
  usersSmmRadio: undefined,
  usersVerifiedRadio: undefined,
  usersStandardRadio: undefined,
  usersLoadMoreButton: undefined,
  daily_input: undefined,
  weekly_input: undefined,
  monthly_input: undefined,
  popularity_score_input: undefined,

  channelsForm: undefined,
  channelInput: undefined,
  channelsSearchError: undefined,
  channelCard: undefined,
  channelsList: undefined,
  channelsSelectSortType: undefined,
  channelsSelectSortBy: undefined,
  channelsOfficialRadio: undefined,
  channelsUnofficialRadio: undefined,
  channelOwnerInput: undefined,
  channelOwnerInputCheckbox: undefined,
  channelsLoadMoreButton: undefined,
  minSubsInput: undefined,
  minSubsCheckbox: undefined,
  minPostsInput: undefined,
  minPostsCheckbox: undefined,

  squealsForm: undefined,
  squealInput: undefined,
  squealsSearchError: undefined,
  squealSenderInput: undefined,
  squealRecipientInput: undefined,
  squealHexInput: undefined,
  squealHexInputCheckbox: undefined,
  squealCard: undefined,
  squealsList: undefined,
  squealsSelectSortType: undefined,
  squealsSelectSortBy: undefined,
  squealsOfficialRadio: undefined,
  squealsUnofficialRadio: undefined,
  squealsAllRadio: undefined,
  squealsLoadMoreButton: undefined,
  createdBeforeInput: undefined,
  createdBeforeCheckbox: undefined,
  createdAfterInput: undefined,
  createdAfterCheckbox: undefined,

  requestTab: undefined,
  reportsSearchError: undefined,
  reportsLoadMoreButton: undefined,
  reportedSquealsTab: undefined,
  requestsLoadMoreButton: undefined,

  reportedSquealCards: undefined,

  reportedSquealsForm: undefined,
  reportedSquealsSelectSortType: undefined,
  reportedSquealsSelectSortBy: undefined,

  iframe: undefined,
  logoutButton: undefined,
};

const last_of_arrays = {
  last_reported_squeal: undefined,
  last_user_request: undefined,
  last_user_list: undefined,
};

const recipients = {
  users: [],
  channels: [],
  keywords: [],
};

const selected = {
  user: undefined,
  channel: undefined,
  squeal: undefined,
};

document.addEventListener("DOMContentLoaded", async function () {
  var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (screenWidth <= 1200) {
    this.body.innerHTML = "<div class='text-white center-screen'><h1>This page is not available on mobile</h1><p>Squealer - Mod Dashboard</p></div>";
    return;
  }
  if (!user.local_user) {
    this.body.innerHTML = `<div class='text-white center-screen'>
        <h1>
          <a href='/login' class='nopage'>Log in</a> as a Squealer Moderator to access this page
        </h1>
        <p>Squealer - Mod Dashboard</p>
      </div> `;
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

  DOMelements.dailyResetButton = document.getElementById("daily-reset-button");
  DOMelements.weeklyResetButton = document.getElementById("weekly-reset-button");
  DOMelements.monthlyResetButton = document.getElementById("monthly-reset-button");
  DOMelements.rewardResetButton = document.getElementById("reward-reset-button");

  DOMelements.reportsLoadMoreButton = document.getElementById("reportsLoadMoreButton");
  DOMelements.reportedSquealsTab = document.getElementById("nav-reports-tab");
  DOMelements.reportsSearchError = document.getElementById("reports-search-error");
  DOMelements.reportedSquealCards = document.getElementById("reportedSquealCards");
  DOMelements.reportedSquealsForm = document.getElementById("reportedSquealsForm");
  DOMelements.reportedSquealsSelectSortType = document.getElementById("reportedSquealsSelectSortType");
  DOMelements.reportedSquealsSelectSortBy = document.getElementById("reportedSquealsSelectSortBy");

  DOMelements.usersForm = document.getElementById("usersForm");
  DOMelements.usernameInput = document.getElementById("usernameInput");
  DOMelements.userCard = document.getElementById("userCard");
  DOMelements.usersList = document.getElementById("usersList");
  DOMelements.usersSearchError = document.getElementById("users-search-error");
  DOMelements.usersSelectSortType = document.getElementById("usersSelectSortType");
  DOMelements.usersSelectSortBy = document.getElementById("usersSelectSortBy");
  DOMelements.usersVipRadio = document.getElementById("vip-radio");
  DOMelements.usersSmmRadio = document.getElementById("smm-radio");
  DOMelements.usersVerifiedRadio = document.getElementById("verified-radio");
  DOMelements.usersStandardRadio = document.getElementById("standard-radio");
  DOMelements.usersLoadMoreButton = document.getElementById("usersLoadMoreButton");

  DOMelements.channelsForm = document.getElementById("channelsForm");
  DOMelements.channelInput = document.getElementById("channelInput");
  DOMelements.channelsSearchError = document.getElementById("channels-search-error");
  DOMelements.channelCard = document.getElementById("channelCard");
  DOMelements.channelsList = document.getElementById("channelsList");
  DOMelements.channelsSelectSortType = document.getElementById("channelsSelectSortType");
  DOMelements.channelsSelectSortBy = document.getElementById("channelsSelectSortBy");
  DOMelements.channelsOfficialRadio = document.getElementById("channels-official-radio");
  DOMelements.channelsUnofficialRadio = document.getElementById("channels-unofficial-radio");
  DOMelements.channelsLoadMoreButton = document.getElementById("channelsLoadMoreButton");
  DOMelements.channelOwnerInput = document.getElementById("channelOwnerInput");
  DOMelements.channelOwnerInputCheckbox = document.getElementById("channelOwnerInputCheckbox");
  DOMelements.minSubsInput = document.getElementById("subscribersNumberInput");
  DOMelements.minSubsCheckbox = document.getElementById("channelSubscribersInputCheckbox");
  DOMelements.minPostsInput = document.getElementById("postsNumberInput");
  DOMelements.minPostsCheckbox = document.getElementById("channelPostsInputCheckbox");

  DOMelements.squealsForm = document.getElementById("squealsForm");
  DOMelements.squealInput = document.getElementById("squealInput");
  DOMelements.squealsSearchError = document.getElementById("squeals-search-error");
  DOMelements.squealCard = document.getElementById("squealCard");
  DOMelements.squealsList = document.getElementById("squealsList");
  DOMelements.squealSenderInput = document.getElementById("squealSenderInput");
  DOMelements.squealRecipientInput = document.getElementById("squealRecipientInput");
  DOMelements.squealHexInput = document.getElementById("squealHexInput");
  DOMelements.squealHexInputCheckbox = document.getElementById("squealHexInputCheckbox");
  DOMelements.squealsSelectSortType = document.getElementById("squealsSelectSortType");
  DOMelements.squealsSelectSortBy = document.getElementById("squealsSelectSortBy");
  DOMelements.squealsOfficialRadio = document.getElementById("squeals-official-radio");
  DOMelements.squealsUnofficialRadio = document.getElementById("squeals-unofficial-radio");
  DOMelements.squealsAllRadio = document.getElementById("squeals-all-radio");
  DOMelements.squealsLoadMoreButton = document.getElementById("squealsLoadMoreButton");
  DOMelements.createdBeforeInput = document.getElementById("dateBeforeInput");
  DOMelements.createdAfterInput = document.getElementById("dateAfterInput");
  DOMelements.createdBeforeCheckbox = document.getElementById("beforeDateCheckbox");
  DOMelements.createdAfterCheckbox = document.getElementById("afterDateCheckbox");

  DOMelements.requestTab = document.getElementById("nav-requests-tab");
  DOMelements.requestsLoadMoreButton = document.getElementById("requestsLoadMoreButton");
  DOMelements.iframe = document.getElementById("iframe");

  DOMelements.logoutButton = document.getElementById("logout-button");

  //EVENT LISTENERS -------------------------------------------------------------------------------------

  DOMelements.dailyResetButton.addEventListener("click", async function (e) {
    await resetCharacter("daily").catch((error) => console.log(error));
  });

  DOMelements.weeklyResetButton.addEventListener("click", async function (e) {
    await resetCharacter("weekly").catch((error) => console.log(error));
  });

  DOMelements.monthlyResetButton.addEventListener("click", async function (e) {
    await resetCharacter("monthly").catch((error) => console.log(error));
  });

  DOMelements.rewardResetButton.addEventListener("click", async function (e) {
    await resetCharacter("reward").catch((error) => console.log(error));
  });

  DOMelements.usersForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await loadUsers();
  });

  DOMelements.channelsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await loadChannels();
  });

  DOMelements.squealsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    await loadSqueals();
  });

  DOMelements.squealHexInputCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.squealHexInputCheckbox.checked) {
      DOMelements.squealHexInput.disabled = false;

      DOMelements.squealInput.value = "";
      DOMelements.squealInput.disabled = true;

      DOMelements.squealRecipientInput.value = "";
      DOMelements.squealRecipientInput.disabled = true;

      DOMelements.squealsSelectSortBy.value = "none";
      DOMelements.squealsSelectSortBy.disabled = true;

      DOMelements.squealsSelectSortType.value = "none";
      DOMelements.squealsSelectSortType.disabled = true;

      DOMelements.squealsOfficialRadio.checked = false;
      DOMelements.squealsOfficialRadio.disabled = true;

      DOMelements.squealsUnofficialRadio.checked = false;
      DOMelements.squealsUnofficialRadio.disabled = true;

      DOMelements.squealsAllRadio.checked = true;
      DOMelements.squealsAllRadio.disabled = true;

      DOMelements.createdAfterCheckbox.checked = false;
      DOMelements.createdAfterCheckbox.disabled = true;
      DOMelements.createdAfterInput.disabled = true;
      DOMelements.createdAfterInput.value = "";

      DOMelements.createdBeforeCheckbox.checked = false;
      DOMelements.createdBeforeCheckbox.disabled = true;
      DOMelements.createdBeforeInput.disabled = true;
      DOMelements.createdBeforeInput.value = "";
    } else {
      DOMelements.squealHexInput.value = "";
      DOMelements.squealHexInput.disabled = true;
      DOMelements.squealInput.disabled = false;
      DOMelements.squealRecipientInput.disabled = false;
      DOMelements.squealsSelectSortBy.disabled = false;
      DOMelements.squealsSelectSortType.disabled = false;
      DOMelements.squealsOfficialRadio.disabled = false;
      DOMelements.squealsUnofficialRadio.disabled = false;
      DOMelements.squealsAllRadio.disabled = false;
      DOMelements.createdAfterCheckbox.disabled = false;
      DOMelements.createdBeforeCheckbox.disabled = false;
      DOMelements.createdAfterInput.disabled = false;
      DOMelements.createdBeforeInput.disabled = false;
    }
  });

  DOMelements.channelOwnerInputCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.channelOwnerInputCheckbox.checked) {
      DOMelements.channelOwnerInput.disabled = false;
    } else {
      DOMelements.channelOwnerInput.value = "";
      DOMelements.channelOwnerInput.disabled = true;
    }
  });

  DOMelements.minSubsCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.minSubsCheckbox.checked) {
      DOMelements.minSubsInput.disabled = false;
    } else {
      DOMelements.minSubsInput.value = "";
      DOMelements.minSubsInput.disabled = true;
    }
  });

  DOMelements.minPostsCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.minPostsCheckbox.checked) {
      DOMelements.minPostsInput.disabled = false;
    } else {
      DOMelements.minPostsInput.value = "";
      DOMelements.minPostsInput.disabled = true;
    }
  });

  DOMelements.createdBeforeCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.createdBeforeCheckbox.checked) {
      DOMelements.createdBeforeInput.disabled = false;
    } else {
      DOMelements.createdBeforeInput.value = "";
      DOMelements.createdBeforeInput.disabled = true;
    }
  });

  DOMelements.createdAfterCheckbox.addEventListener("change", async function (e) {
    if (DOMelements.createdAfterCheckbox.checked) {
      DOMelements.createdAfterInput.disabled = false;
    } else {
      DOMelements.createdAfterInput.value = "";
      DOMelements.createdAfterInput.disabled = true;
    }
  });

  DOMelements.requestTab.addEventListener("click", async function (e) {
    await loadRequests().catch((error) => console.log(error));
  });

  DOMelements.reportedSquealsTab.addEventListener("click", async function (e) {
    await loadReportedSqueals().catch((error) => console.log(error));
  });

  DOMelements.reportsLoadMoreButton.addEventListener("click", async function (e) {
    await loadReportedSqueals(true).catch((error) => console.log(error));
  });

  DOMelements.requestsLoadMoreButton.addEventListener("click", async function (e) {
    await loadRequests(true).catch((error) => console.log(error));
  });

  DOMelements.usersLoadMoreButton.addEventListener("click", async function (e) {
    await loadUsers(true).catch((error) => console.log(error));
  });

  DOMelements.channelsLoadMoreButton.addEventListener("click", async function (e) {
    await loadChannels(true).catch((error) => console.log(error));
  });

  DOMelements.squealsLoadMoreButton.addEventListener("click", async function (e) {
    await loadSqueals(true).catch((error) => console.log(error));
  });

  DOMelements.reportedSquealsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    DOMelements.reportsLoadMoreButton.style.display = "block";
    await loadReportedSqueals().catch((error) => console.log(error));
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
  DOMelements.usersLoadMoreButton.style.display = "none";
  DOMelements.channelsLoadMoreButton.style.display = "none";
  DOMelements.squealsLoadMoreButton.style.display = "none";
  DOMelements.usersSearchError.style.display = "none";
  DOMelements.channelsSearchError.style.display = "none";
  DOMelements.squealsSearchError.style.display = "none";
  DOMelements.reportsSearchError.style.display = "none";
});

//CHANNELS -------------------------------------------------------------------------------------
async function loadChannel(channel) {
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
          await loadChannel(channel._id);
        });
      });
    }
    const unbanButton = document.getElementById("unbanChannelButton-" + channel._id);
    if (unbanButton) {
      unbanButton.addEventListener("click", async function () {
        await banChannel(channel._id, false).then(async () => {
          await loadChannel(channel._id);
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
    const changeNameButton = document.getElementById("newChannelName-" + channel._id);
    const newNameInput = document.getElementById("newChannelNameInput-" + channel._id);
    if (changeNameButton) {
      changeNameButton.addEventListener("click", async function () {
        await changeChannelName(channel._id, newNameInput.value).then(async () => {
          await loadChannel(channel._id);
          const resultDiv = document.getElementById("updateChannelResult");
          if (resultDiv) resultDiv.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i><span class="text-success">Channel name updated successfully</span>`;
        });
      });
    }
  });
  return channel;
}

async function searchChannels(load_more = false) {
  let apiUrl = "channels?";
  if ((DOMelements.channelsSelectSortBy.value != "none") ^ (DOMelements.channelsSelectSortType.value != "none")) {
    throw new Error("You must select both sort by and sort type");
  }
  if (DOMelements.channelInput.value) apiUrl += "name=" + DOMelements.channelInput.value + "&";
  if (DOMelements.channelOwnerInputCheckbox.checked) {
    let owner = DOMelements.channelOwnerInput.value;
    if (owner.replace(/\s/g, "") != "") apiUrl += "owner=" + owner + "&";
  }
  if (DOMelements.channelsSelectSortBy.value != "none") apiUrl += "sort_by=" + DOMelements.channelsSelectSortBy.value + "&";
  if (DOMelements.channelsSelectSortType.value != "none") apiUrl += "sort_order=" + DOMelements.channelsSelectSortType.value + "&";
  if (DOMelements.channelsOfficialRadio.checked) apiUrl += "is_official=true&";
  else if (DOMelements.channelsUnofficialRadio.checked) apiUrl += "is_official=false&";
  if (DOMelements.minSubsCheckbox.checked) {
    let min_subs = DOMelements.minSubsInput.value;
    if (min_subs.replace(/\s/g, "") != "") apiUrl += "min_subscribers=" + min_subs + "&";
  }
  if (DOMelements.minPostsCheckbox.checked) {
    let min_posts = DOMelements.minPostsInput.value;
    if (min_posts.replace(/\s/g, "") != "") apiUrl += "min_squeals=" + min_posts + "&";
  }

  if (load_more) apiUrl += "last_loaded=" + last_of_arrays.last_user_list + "&";
  apiUrl = apiUrl.slice(0, -1);
  let result;
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        //error
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
      if (result?.length > 0) last_of_arrays.last_user_list = result[result.length - 1]._id;
    });
  return result;
}

async function loadChannels(load_more = false) {
  DOMelements.channelsLoadMoreButton.style.display = "block";
  await searchChannels(load_more)
    .then(async (channels) => {
      if (!channels || !channels.length || channels.length <= 0) {
        if (!load_more) DOMelements.channelsList.innerHTML = "<div class='text-center text-danger h5 pt-3'>No channels found</div>";
        DOMelements.channelsLoadMoreButton.style.display = "none";
        return;
      }
      if (!load_more) DOMelements.channelsList.innerHTML = "";
      channels.forEach(async (channel) => {
        DOMelements.channelsList.appendChild(channelTemplates.channel_in_list(channel));
      });
      channels.forEach(async (channel) => {
        document.getElementById("channel_in_list-" + channel._id).addEventListener("click", async function () {
          await loadChannel(channel._id).catch((error) => alert(error));
        });
      });
      DOMelements.channelsSearchError.style.display = "none";
    })
    .catch((error) => {
      DOMelements.channelsSearchError.style.display = "block";
      DOMelements.channelsLoadMoreButton.style.display = "none";
      DOMelements.channelsSearchError.innerHTML = error;
    });
}

//USERS ----------------------------------------------------------------------------------------
async function loadUser(username) {
  selected.user = username;
  return await getUser(username).then(async (user) => {
    const vipsExist = user.managed_accounts?.length > 0;
    const channelsExist = user.owned_channels?.length > 0;
    const editorsExist = user.editor_channels?.length > 0;

    if (user.smm) {
      user.smm = await getUsername(user.smm);
    }

    DOMelements.userCard.innerHTML = userTemplates.user_card(user);
    let channelsListDiv = "";
    let VIPlistDiv = "";
    let editorListDiv = "";

    //VIPs get
    if (vipsExist) {
      if (user.managed_accounts.length == 0) {
        VIPlistDiv = "No VIPs managed by this user";
      }

      const VIPusers = [];
      user.managed_accounts.forEach(async (vip) => {
        VIPusers.push(getUsername(vip));
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
      const channelsList = [];
      user.owned_channels.forEach(async (channel) => {
        channelsList.push(getChannel(channel));
      });
      await Promise.all(channelsList).then((channels) => {
        channels.forEach((channel) => {
          channelsListDiv += userTemplates.channelDiv(channel);
        });
      });
      document.getElementById("channelUserCard").innerHTML = channelsListDiv;
    } else {
      channelsListDiv = "No channels managed by this user";
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
    //EVENT LISTENERS
    const banButton = document.getElementById("banButton-" + user._id) || undefined;
    const unbanButton = document.getElementById("unbanButton-" + user._id) || undefined;
    const confirmChangesButton = document.getElementById("confirmChangesButton-" + user._id) || undefined;
    DOMelements.daily_input = document.getElementById("daily-input-" + user._id);
    DOMelements.weekly_input = document.getElementById("weekly-input-" + user._id);
    DOMelements.monthly_input = document.getElementById("monthly-input-" + user._id);
    DOMelements.popularity_score_input = document.getElementById("popularity-score-input-" + user._id);

    if (banButton) {
      banButton.addEventListener("click", async function () {
        await banUser(user.username, true)
          .then(async () => {
            await loadUser(username);
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
            await loadUser(username);
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
            await loadUser(username);
          })
          .catch((error) => {
            document.getElementById("userErrorMessage").innerHTML = error;
          });
      });
    }
    return user;
  });
}

async function searchUsers(load_more = false) {
  let apiUrl = "users?";
  if ((DOMelements.usersSelectSortBy.value != "none") ^ (DOMelements.usersSelectSortType.value != "none")) {
    throw new Error("You must select both sort by and sort type");
  }
  if (DOMelements.usersSelectSortBy.value != "none") apiUrl += "sort_by=" + DOMelements.usersSelectSortBy.value + "&";
  if (DOMelements.usersSelectSortType.value != "none") apiUrl += "sort_order=" + DOMelements.usersSelectSortType.value + "&";
  if (DOMelements.usersVipRadio.checked) apiUrl += "account_type=professional&professional_type=VIP&";
  else if (DOMelements.usersSmmRadio.checked) apiUrl += "account_type=professional&professional_type=SMM&";
  else if (DOMelements.usersVerifiedRadio.checked) apiUrl += "account_type=verified&professional_type=none&";
  else if (DOMelements.usersStandardRadio.checked) apiUrl += "account_type=standard&professional_type=none&";
  if (DOMelements.usernameInput.value) apiUrl += "username=" + DOMelements.usernameInput.value + "&";
  if (load_more) apiUrl += "last_loaded=" + last_of_arrays.last_user_list + "&";

  apiUrl = apiUrl.slice(0, -1);
  let result;
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        //error
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
      if (result?.length > 0) last_of_arrays.last_user_list = result[result.length - 1]._id;
    });
  return result;
}

async function loadUsers(load_more = false) {
  DOMelements.usersLoadMoreButton.style.display = "block";
  await searchUsers(load_more)
    .then(async (users) => {
      if (!users || !users.length || users.length <= 0) {
        if (!load_more) DOMelements.usersList.innerHTML = "<div class='text-center text-danger h5 pt-3'>No users found</div>";
        DOMelements.usersLoadMoreButton.style.display = "none";
        return;
      }
      if (!load_more) DOMelements.usersList.innerHTML = "";
      users.forEach(async (user) => {
        DOMelements.usersList.appendChild(userTemplates.user_in_list(user));
      });
      users.forEach(async (user) => {
        document.getElementById("user_in_list-" + user._id).addEventListener("click", async function () {
          await loadUser(user.username).catch((error) => alert(error));
        });
      });
      DOMelements.usersSearchError.style.display = "none";
    })
    .catch((error) => {
      DOMelements.usersSearchError.style.display = "block";
      DOMelements.usersLoadMoreButton.style.display = "none";
      DOMelements.usersSearchError.innerHTML = error;
    });
}

//SQUEALS ----------------------------------------------------------------------------------------
async function loadSqueal(squeal) {
  return await getSqueal(squeal._id)
    .then(async (full_squeal) => {
      DOMelements.squealCard.innerHTML = squealTemplates.squeal_card(full_squeal);
      const userAccordion = document.getElementById("userRecipientsAccordion");
      const channelAccordion = document.getElementById("channelRecipientsAccordion");
      const keywordAccordion = document.getElementById("keywordRecipientsAccordion");
      const deleteSquealButton = document.getElementById("deleteSquealButton-" + full_squeal._id);
      const confirmChangesButton = document.getElementById("confirmChangesButton-" + full_squeal._id);
      recipients.users = [];
      recipients.channels = [];
      recipients.keywords = [];
      if (userAccordion) userAccordion.innerHTML = "";
      if (channelAccordion) channelAccordion.innerHTML = "";
      if (keywordAccordion) keywordAccordion.innerHTML = "";
      const users = [];
      full_squeal.recipients.users.forEach(async (user) => {
        users.push(getUsername(user));
      });
      await Promise.all(users).then((users) => {
        users.forEach((user) => {
          if (userAccordion) {
            userAccordion.appendChild(squealTemplates.elementRecipientDiv(user, "user"));
            recipients.users.push(user);
            addEventListenerToListElements(user, "user");
          }
        });
      });
      const channels = [];
      full_squeal.recipients.channels.forEach(async (channel) => {
        channels.push(getChannel(channel));
      });
      await Promise.all(channels).then((channels) => {
        channels.forEach((channel) => {
          if (channelAccordion) {
            channelAccordion.appendChild(squealTemplates.elementRecipientDiv(channel.name, "channel"));
            recipients.channels.push(channel.name);
            addEventListenerToListElements(channel.name, "channel");
          }
        });
      });
      full_squeal.recipients.keywords.forEach(async (keyword) => {
        recipients.keywords.push(keyword);
        if (keywordAccordion) {
          keywordAccordion.appendChild(squealTemplates.elementRecipientDiv(keyword, "keyword"));
          addEventListenerToListElements(keyword, "keyword");
        }
      });

      //LISTENERS FOR ADDING/REMOVING RECIPIENTS
      const addUserButton = document.getElementById("add-User-button");
      const addChannelButton = document.getElementById("add-Channel-button");
      const addKeywordButton = document.getElementById("add-Keyword-button");

      if (addUserButton)
        addUserButton.addEventListener("click", async function () {
          const userInput = document.getElementById("add-User-input");
          const username = userInput?.value;
          if (recipients.users.includes(username) || username.replace(/\s/g, "") == "") {
            userInput.value = "";
            return;
          }
          userAccordion.appendChild(squealTemplates.elementRecipientDiv(username, "user", username));
          recipients.users.push(username);
          addEventListenerToListElements(username, "user");
        });
      if (addChannelButton)
        addChannelButton.addEventListener("click", async function () {
          const channelInput = document.getElementById("add-Channel-input");
          const channel_name = channelInput?.value;
          if (recipients.channels.includes(channel_name) || channel_name.replace(/\s/g, "") == "") {
            channelInput.value = "";
            return;
          }
          channelAccordion.appendChild(squealTemplates.elementRecipientDiv(channel_name, "channel", channel_name));
          recipients.channels.push(channel_name);
          addEventListenerToListElements(channel_name, "channel");
        });
      if (addKeywordButton)
        addKeywordButton.addEventListener("click", async function () {
          const keywordInput = document.getElementById("add-Keyword-input");
          const keyword = keywordInput?.value;
          if (recipients.keywords.includes(keyword) || keyword.replace(/\s/g, "") == "") {
            keywordInput.value = "";
            return;
          }
          keywordAccordion.appendChild(squealTemplates.elementRecipientDiv(keyword, "keyword", keyword));
          recipients.keywords.push(keyword);
          addEventListenerToListElements(keyword, "keyword");
        });

      //LISTENER FOR BUTTONS
      if (deleteSquealButton) {
        deleteSquealButton.addEventListener("click", async function () {
          await deleteSqueal(full_squeal._id).then(async () => {
            await loadSqueal(full_squeal);
          });
        });
      }

      if (confirmChangesButton) {
        confirmChangesButton.addEventListener("click", async function () {
          const reactions = {};
          reactions.like = document.getElementById("like-input-" + full_squeal._id).value;
          reactions.dislike = document.getElementById("dislike-input-" + full_squeal._id).value;
          reactions.love = document.getElementById("love-input-" + full_squeal._id).value;
          reactions.disgust = document.getElementById("disgust-input-" + full_squeal._id).value;
          reactions.laugh = document.getElementById("laugh-input-" + full_squeal._id).value;
          reactions.disagree = document.getElementById("disagree-input-" + full_squeal._id).value;
          await updateSqueal(full_squeal._id, reactions).then(async () => {
            await loadSqueal(full_squeal);
            const resultDiv = document.getElementById("updateSquealResult");
            if (resultDiv) resultDiv.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i><span class="text-success">Squeal updated successfully</span>`;
          });
        });
      }
    })
    .catch((error) => console.log(error));
}

function addEventListenerToListElements(new_element, type) {
  document.getElementById("remove-" + type + "-" + new_element).addEventListener("click", () => {
    recipients[type + "s"].splice(recipients[type + "s"].indexOf(new_element), 1);
    document.getElementById(`${type}Element-${new_element}`).remove();
  });
}

async function searchSqueals(load_more = false) {
  let apiUrl;
  if (DOMelements.squealHexInputCheckbox.checked) {
    //hex and sender request
    const squeal_hex = DOMelements.squealHexInput.value;
    const sender = DOMelements.squealSenderInput.value;

    if (!squeal_hex || squeal_hex == "" || sender.replace(/\s/g, "") == "") throw new Error("You must enter a hex and a sender");
    apiUrl = `squeals/user_id/${sender}/hex/${squeal_hex}`;
  } else {
    //normal request
    apiUrl = "squeals?";
    if ((DOMelements.squealsSelectSortBy.value != "none") ^ (DOMelements.squealsSelectSortType.value != "none")) {
      DOMelements.squealsList.innerHTML = "";
      throw new Error("You must select both sort by and sort type");
    }

    const words = DOMelements.squealInput.value.replace(/#/g, "");

    const keywords = words.replace(/\s/g, "") != "" ? words.split(" ") : [];
    if (keywords.length > 0) {
      keywords.forEach((keyword) => {
        apiUrl += "keywords=" + keyword + "&";
      });
    }
    if (DOMelements.squealSenderInput.value) apiUrl += "sender=" + DOMelements.squealSenderInput.value + "&";
    if (DOMelements.squealRecipientInput.value) apiUrl += "recipient=" + DOMelements.squealRecipientInput.value + "&";
    if (DOMelements.squealsSelectSortBy.value != "none") apiUrl += "sort_by=" + DOMelements.squealsSelectSortBy.value + "&";
    if (DOMelements.squealsSelectSortType.value != "none") apiUrl += "sort_order=" + DOMelements.squealsSelectSortType.value + "&";
    if (DOMelements.squealsOfficialRadio.checked) apiUrl += "is_in_official_channel=true&";
    else if (DOMelements.squealsUnofficialRadio.checked) apiUrl += "is_in_official_channel=false&";
    if (load_more) apiUrl += "last_loaded=" + last_of_arrays.last_user_list + "&";
    if (DOMelements.createdAfterCheckbox.checked) {
      const date = DOMelements.createdAfterInput.value;
      if (date != undefined && date.replace(/\s/g, "") != "") apiUrl += "created_after=" + date + "&";
    }
    if (DOMelements.createdBeforeCheckbox.checked) {
      const date = DOMelements.createdBeforeInput.value;
      if (date != undefined && date.replace(/\s/g, "") != "") apiUrl += "created_before=" + date + "&";
    }

    apiUrl = apiUrl.slice(0, -1);
  }
  let result;
  await fetch(apiUrl, options(user.auth))
    .then((response) => {
      if (!response.ok) {
        //error
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
      if (result?.length > 0) last_of_arrays.last_user_list = result[result.length - 1]._id;
      if (DOMelements.squealHexInputCheckbox.checked) {
        DOMelements.squealsLoadMoreButton.style.display = "none";
      }
    });
  return result;
}

async function loadSqueals(load_more = false) {
  DOMelements.squealsLoadMoreButton.style.display = "block";
  await searchSqueals(load_more)
    .then(async (squeals) => {
      if (!squeals || !squeals.length || squeals.length <= 0) {
        if (!load_more) DOMelements.squealsList.innerHTML = "<div class='text-center text-danger h5 pt-3'>No squeals found</div>";
        DOMelements.squealsLoadMoreButton.style.display = "none";
        DOMelements.squealsSearchError.style.display = "none";
        return;
      }
      if (!load_more) DOMelements.squealsList.innerHTML = "";
      squeals.forEach(async (squeal) => {
        DOMelements.squealsList.appendChild(squealTemplates.squeal_in_list(squeal));
      });
      squeals.forEach(async (squeal) => {
        document.getElementById("squeal_in_list-" + squeal._id).addEventListener("click", async function () {
          await loadSqueal(squeal).catch((error) => alert(error));
        });
      });
      DOMelements.squealsSearchError.style.display = "none";
    })
    .catch((error) => {
      DOMelements.squealsSearchError.style.display = "block";
      DOMelements.squealsLoadMoreButton.style.display = "none";
      DOMelements.squealsSearchError.innerHTML = error;
    });
}
//-----------------------------------------------------------------------------------------------------------------------------
//REPORTED SQUEALS
async function loadReportedSqueals(load_more = false) {
  if (!load_more) DOMelements.reportedSquealCards.innerHTML = "";
  getReports(load_more)
    .then((squeals) => {
      DOMelements.reportsSearchError.style.display = "none";
      if (!squeals || squeals.length <= 0) {
        const noSquealsMessage = document.createElement("div");
        noSquealsMessage.className = "text-white text-center pb-3";
        noSquealsMessage.innerHTML = "No squeals reported";
        DOMelements.reportedSquealCards.appendChild(noSquealsMessage);
        DOMelements.reportsLoadMoreButton.style.display = "none";
        return;
      }
      last_of_arrays.last_reported_squeal = squeals[squeals.length - 1]._id;
      squeals.forEach(async (squeal) => {
        DOMelements.reportedSquealCards.appendChild(squealTemplates.reported_squeal_card(squeal));
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
    })
    .catch((error) => {
      DOMelements.reportsSearchError.style.display = "block";
      DOMelements.requestsLoadMoreButton.style.display = "none";
      DOMelements.reportsSearchError.innerHTML = error;
    });
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

//-----------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------API REQUESTS------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------

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

async function getSqueal(squeal_id) {
  if (!squeal_id || squeal_id == "") return undefined;
  const apiUrl = "squeals/" + squeal_id;
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
      data[0] ? (result = data[0]) : (result = data);
    });

  return result;
}

async function getReports(load_more = false, checked = false) {
  let apiUrl = "squeals/reported?checked=" + checked;
  if ((DOMelements.reportedSquealsSelectSortBy.value != "none") ^ (DOMelements.reportedSquealsSelectSortType.value != "none")) {
    throw new Error("You must select both sort by and sort type");
  }
  if (load_more) apiUrl += "&last_loaded=" + last_of_arrays.last_reported_squeal;
  if (DOMelements.reportedSquealsSelectSortBy.value != "none") apiUrl += "&sort_by=" + DOMelements.reportedSquealsSelectSortBy.value;
  if (DOMelements.reportedSquealsSelectSortType.value != "none") apiUrl += "&sort_order=" + DOMelements.reportedSquealsSelectSortType.value;

  let result;
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

async function updateSqueal(squealId, reactions) {
  const apiUrl = `squeals/${squealId}`;
  const body = {
    recipients: recipients,
    reactions: reactions,
  };
  let result;
  const resultDiv = document.getElementById("updateSquealResult");

  // Make a PATCH request
  await fetch(apiUrl, options(user.auth, "PATCH", body))
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.text();
        if (resultDiv) resultDiv.innerHTML = `<i class="bi bi-exclamation-circle-fill text-danger"></i><span class="text-danger">${JSON.parse(error).error}</span>`;
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

async function updatePopularityScore(userId, score) {
  const apiUrl = `users/${userId}/popularity-score`;
  let result;
  const body = { popularity_score: score };
  // Make a PATCH request
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
      document.getElementById("popularity_in_list-" + userId).innerHTML = score;
      result = data;
    });
  return result;
}

async function changeChannelName(channelId, newName) {
  const apiUrl = `channels/${channelId}`;
  const body = {
    new_name: newName,
  };
  let result;
  const resultDiv = document.getElementById("updateChannelResult");

  // Make a PATCH request
  await fetch(apiUrl, options(user.auth, "PATCH", body))
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.text();
        if (resultDiv) resultDiv.innerHTML = `<i class="bi bi-exclamation-circle-fill text-danger"></i><span class="text-danger">${JSON.parse(error).error}</span>`;
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
  const charUpdateUrl = `users/characters`;
  if (accountType && professionalType && (accountType != userToUpdate.account_type || professionalType != userToUpdate.professional_type)) {
    const body = {};
    body.account_type = accountType;
    body.professional_type = professionalType;

    //modifying account type
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
        document.getElementById("account_type_in_list-" + userToUpdate._id).innerHTML = accountType || userToUpdate.account_type;
        document.getElementById("professional_type_in_list-" + userToUpdate._id).innerHTML = professionalType || userToUpdate.professional_type;
      });
  }
  console.log(DOMelements.daily_input, DOMelements.weekly_input, DOMelements.monthly_input);
  if (DOMelements.daily_input != undefined && DOMelements.weekly_input != undefined && DOMelements.monthly_input != undefined) {
    //updating characters
    const daily_changed = DOMelements.daily_input.value != userToUpdate.char_quota.daily;
    const weekly_changed = DOMelements.weekly_input.value != userToUpdate.char_quota.weekly;
    const monthly_changed = DOMelements.monthly_input.value != userToUpdate.char_quota.monthly;
    //if something changed, update it
    console.log(daily_changed, weekly_changed, monthly_changed);
    if (daily_changed || weekly_changed || monthly_changed) {
      const body_char = {
        identifier: userToUpdate._id,
        char_quota_daily: daily_changed ? DOMelements.daily_input.value : undefined,
        char_quota_weekly: weekly_changed ? DOMelements.weekly_input.value : undefined,
        char_quota_monthly: monthly_changed ? DOMelements.monthly_input.value : undefined,
      };
      await fetch(charUpdateUrl, options(user.auth, "PATCH", body_char)).then(async (response) => {
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Network response was not ok");
        }
      });
    }
  }
  if (DOMelements.popularity_score_input != undefined && DOMelements.popularity_score_input.value != userToUpdate.popularity_score) {
    await updatePopularityScore(userToUpdate._id, DOMelements.popularity_score_input.value);
  }
  //button become green for 2 seconds

  return;
}

async function resetCharacter(type) {
  const apiUrl = `users/default-quota/${type}`;
  let result;
  await fetch(apiUrl, options(user.auth, "PATCH"))
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
      loadUser(selected.user);
    });
  return result;
}

//-------------------- DELETE --------------------//

async function deleteSqueal(squealId) {
  const apiUrl = `squeals/${squealId}`;
  let result;
  const resultDiv = document.getElementById("updateSquealResult");

  await fetch(apiUrl, options(user.auth, "DELETE"))
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.text();
        if (resultDiv) resultDiv.innerHTML = `<i class="bi bi-exclamation-circle-fill text-danger"></i><span class="text-danger">${JSON.parse(error).error}</span>`;
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
      DOMelements.channelsList?.removeChild(document.getElementById("channel_in_list-" + channelId));
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
}
