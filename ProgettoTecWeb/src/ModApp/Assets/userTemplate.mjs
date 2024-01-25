// File: userTemplate.js

export const not_found = (type) => `
<div class="col m-5 text-center">${type} not found</div>
`;

export const banned_status = (user) => {
  if (user.is_active) {
    return `
     <b>Banned </b>
    <span class="me-auto ms-2"> ${!user.is_active}</span>
    <button id="banButton-${user._id}" class="btn btn-danger">BAN USER</button>
  `;
  } else {
    return `
    <b>Banned </b> 
     <span class="me-auto ms-2">${!user.is_active}</span>
    <button id="unbanButton-${user._id}" class="btn btn-success">UNBAN USER</button>
    
  `;
  }
};

export const professional_type_row = (user) => `

  <b>Professional Type</b>
  ${user.professional_type || "professional_type"}
  <select id="professionalType-${user._id}" class="form-select" aria-label="Professional-type selector">
          <option value="VIP"  ${user.professional_type == "VIP" ? "selected" : ""}>VIP</option>
          <option value="SMM"  ${user.professional_type == "SMM" ? "selected" : ""}>SMM</option>
          <option value="none" ${user.professional_type == "none" ? "selected" : ""}>None</option>
      </select>
`;

export const account_type_row = (user) => `

  <b>Account Type</b>
  ${user.account_type || "account_type"}
    <select id="accountType-${user._id}" class="form-select" aria-label="Account-type selector">
      <option value="standard" ${user.account_type == "standard" ? "selected" : ""}>Standard</option>
      <option value="professional" ${user.account_type == "professional" ? "selected" : ""}>Professional</option>
      <option value="verified" ${user.account_type == "verified" ? "selected" : ""}>Verified</option>
      <option value="moderator" class="text-danger" ${user.account_type == "moderator" ? "selected" : ""}>Moderator</option>
    </select>
`;

export const popularity_score_row = (user) => `<div class="input-group mb-3">
  <span class="input-group-text" id="popularity_score_label">Popularity Score</span>
  <input type="number" value="${user.reaction_metrics?.popularity_score || "0"}" placeholder="${
  user.reaction_metrics?.popularity_score || "0"
}"class="form-control" aria-label="Sizing example input" aria-describedby="popularity_score_label" id="popularity-score-input-${user._id}">
</div>
`;

export const email_row = (email) => `
  <b>Email</b> ${email || "email"}
`;

export const total_squeals_row = (total_squeals) => `
<b>Total Squeals:</b> ${total_squeals || 0}`;

export const char_quota_row = (user) => `
<div class="d-flex pb-2">
  <div class="me-auto"><b>Char Quota</b></div>
  <div class="">Extra characters: ${user.char_quota?.extra_daily || 0}</div>
</div>
<div class="input-group mb-2">
  <span class="input-group-text" id="dailyCharInput">D</span>
  <input id="daily-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.daily || 0}" 
    value=${user.char_quota?.daily || 0} aria-label="Daily" aria-describedby="Daily character quota" min=0>
  <span class="input-group-text" id="weeklyCharInput">W</span>
  <input id="weekly-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.weekly || 0}" 
    value="${user.char_quota?.weekly || 0}" aria-label="Weekly" aria-describedby="Weekly character quota" min=0>
  <span class="input-group-text" id="monthlyCharInput">M</span>
  <input id="monthly-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.monthly || 0}" 
    value="${user.char_quota?.monthly || 0}" aria-label="Monthly" aria-describedby="Monthly character quota" min=0>
</div>
`;

export const smm_row = (smm) => `
  <b>Social Media Manager: </b>
  <div>${smm ? " @" : ""}${smm || "none"}</div>`;

export const VIPDiv = (VIP) => `
<li><a class="dropdown-item px-1"><h5><i class="bi bi-dot text-danger"></i>@${VIP || "vip_username"}</h5></div></a></li>`;

export const managed_accounts_dropdown = (managed_accounts) => {
  if (managed_accounts && managed_accounts.length == 0) {
    return `<div class="p-3"><b>Managed Accounts:</b> none</div>`;
  } else {
    return `
      <div class="dropup-center dropup">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Managed Accounts
        </button>
        <ul class="dropdown-menu py-1" id="VIPUserCard">
        </ul>
      </div>`;
  }
};

export const professional_status = (user) => {
  if (user.professional_type == "VIP") {
    return ` 
    <div class="row">
      <div class="col-6 py-2 d-flex justify-content-center align-items-center">${smm_row(user.smm)}</div>
      <div class="vr p-0"></div>
    </div>
    <hr class="m-0">`;
  } else if (user.professional_type == "SMM") {
    return `
    <div class="row"> 
      <div class="col-6 py-2 "></div>
      <div class="vr p-0"></div>
      <div class="col py-2 d-flex justify-content-center align-items-center">${managed_accounts_dropdown(user?.managed_accounts)}</div>
      
    </div>
    <hr class="m-0">`;
  } else {
    return ``;
  }
};

export const channelDiv = (channel) => `
<li><a class="dropdown-item px-1"><h5><i class="bi bi-dot text-danger"></i>§${channel?.name || "channel_name"}</h5></div></a></li>`;

export const owned_channels_dropdown = (owned_channels) => {
  if (owned_channels && owned_channels.length == 0) {
    return `<div class="p-3"><b>Owned Channels:</b> none</div>`;
  } else {
    return `
      <div class="dropup-center dropup">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Owned Channels
        </button>
        <ul class="dropdown-menu py-1" id="channelUserCard">
        </ul>
      </div>`;
  }
};

export const editorDiv = (channel) => `
<li><a class="dropdown-item px-1"><h5><i class="bi bi-dot text-danger"></i>§${channel?.name || "channel_name"}</h5></div></a></li>`;

export const editor_channels_dropdown = (editor_channels) => {
  if (editor_channels && editor_channels.length == 0) {
    return `<div class="p-3"><b>Editor Channels:</b> none</div>`;
  } else {
    return `
      <div class="dropup-center dropup">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Editor Channels
        </button>
        <ul class="dropdown-menu py-1" id="editorUserCard">
        </ul>
      </div>`;
  }
};

export const user_in_list = (user) => {
  const div = document.createElement("div");
  div.id = `user_in_list-${user._id}`;
  div.className = "row mt-1 col-11";
  div.innerHTML = `
  <div class="card clickable mb-3 mt-2 datacard ">
      <div id="user-body-${user._id}" class="row g-0">
          <div class="col-md-4 align-items-center d-flex">
              <img src="./../media/propic/${
                user?.profile_picture || "squealer.png"
              }" class="img-fluid rounded propic " onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                  alt="${user?.profile_picture || ""}">
          </div>
          <div class="col">
              <div class="card-body">
                  <div><b>@${user?.username || "username"}</b></div>
                  <div class="text-muted">User since: ${new Date(user?.created_at).toLocaleString()}</div>
                  <div><b>Number of Squeals:</b> ${user.squeals_count || "0"}  </div>
                  <div><b>Popularity score:</b> <span id="popularity_in_list-${user._id}">${user.reaction_metrics?.popularity_score || "0"}</span></div>
                  <div><b>Account type:</b> <span id="account_type_in_list-${user._id}">${user.account_type}</span></div>
                  <div><b>Professional type:</b> <span id="professional_type_in_list-${user._id}">${user.professional_type}</span></div>
              </div>
          </div>
        </div>
  </div>
  `;
  return div;
};

export const user_card = (user) => `
<div class="card mb-3 mt-4 datacard col-11 ">
  <div class="col">
    <div class="card-body">
      <h3 class="card-title row">
        <div class="col-md-1 col-2">
          <img src="./../media/propic/${user?.profile_picture || "squealer.png"}" 
            class="img-fluid rounded-start rounded" onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
            alt="${user?.profile_picture || "squealer"}">
        </div>
        <div class="col d-flex align-items-center">
          <a class="unstyled-a" href="/profile/${user.username}">@${user?.username || "username"}</a>
        </div>
        <div class="text-end col p-1">
          <button id="confirmChangesButton-${user._id}" class="btn btn-primary">CONFIRM CHANGES</button>
        </div>
      </h3>
      <div class="row">
        <h6 class="col-4 card-subtitle mb-2 text-muted text-start">User since: ${new Date(user?.created_at).toLocaleString()}</h6>
        <div class="col"></div>
        <h6 class="col-auto card-subtitle mb-2 text-muted text-end row">
          <div class='col-auto' title="Earned char quota">
            <i class="bi bi-trophy"></i> ${user.char_quota.earned_daily} D<i class="bi bi-dot"></i>${user.char_quota.earned_weekly} W <i class="bi bi-trophy"></i>
          </div>
          <div class='col text-center'><i class="bi bi-dash-lg"></i></div>
          <div class='col-auto' title="Bought char quota">
            <i class="bi bi-coin"></i>
            ${user.char_quota.bought_daily} D<i class="bi bi-dot"></i>
            ${user.char_quota.bought_weekly} W<i class="bi bi-dot"></i>
            ${user.char_quota.bought_monthly} M <i class="bi bi-coin"></i>
          </div>
        </h6>
      </div>
      <div class="row-1">
        <p class="text-danger m-0" id="userErrorMessage"></p>
      </div>
      <h5 class="card-body">"${user?.profile_info || "profile info"}"</h5>
      <div class="col">
        <div class="row">
          <div class="col-6 py-2">${email_row(user?.email)}</div>
          <div class="vr p-0"></div>
          <div class="col py-2 d-flex">${banned_status(user)}</div>
        </div>
        <hr class="m-0">
        <div class="row">
          <div class="col-6 py-2">${account_type_row(user)}</div>
          <div class="vr p-0"></div>
          <div class="col py-2">${professional_type_row(user)}</div>
        </div>
        <hr class="m-0">
        <div class="row">
          <div class="col-6 py-0">
            <div class="py-2">${total_squeals_row(user?.squeals.posted.length)}</div>
            <div class="py-0 mb-2">${popularity_score_row(user)}</div>
          </div>
          <div class="vr p-0"></div>
          <div class="col py-2">${char_quota_row(user)}</div>
        </div>
        <hr class="m-0">
        ${professional_status(user)}
        <div class="row">
          <div class="col-6 py-2 d-flex justify-content-center align-items-center">${owned_channels_dropdown(user?.owned_channels)}</div>
          <div class="vr p-0"></div>
          <div class="col py-2 d-flex justify-content-center align-items-center">${editor_channels_dropdown(user?.editor_channels)}</div>
        </div>
      </div>
    </div>
  </div>
</div>`;

export const request_card = (request) => {
  const div = document.createElement("div");
  div.id = `request-${request._id}`;
  div.className = "row mt-1";
  div.innerHTML = `

  <div class="col-3"></div>
  <div class="card clickable mb-3 mt-2 datacard col">
      <div id="request-body-${request._id}" class="row g-0">
          <div class="col-md-4 align-items-center d-flex">
              <img src="./../media/propic/${
                request?.profile_picture || "squealer.png"
              }" class="img-fluid rounded-start propic " onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                  alt="${request?.profile_picture || ""}">
          </div>
          <div class="col">
              <div class="card-body">
                  <div class="h6" >@${request?.username || "username"}</div>
                  <div class="h5">Wants to become a <b>${request?.type || "request_type"}</b> account </div>
                  <div class="h6 text-muted">Date: ${new Date(request?.created_at).toLocaleString()}</div>
              </div>
          </div>
          </div>
          <div class="card-footer">
              <div class="row">
                  <div id="acceptRequestButton-${request._id}" class="col-6 text-center">
                      <button  class="btn btn-success">ACCEPT</button>
                  </div>
                  <div id="declineRequestButton-${request._id}" class="col-6 text-center">
                      <button class="btn btn-danger">DECLINE</button>
                  </div>
              </div>
          </div>
  </div>
  <div class="col-3"></div>`;
  return div;
};
