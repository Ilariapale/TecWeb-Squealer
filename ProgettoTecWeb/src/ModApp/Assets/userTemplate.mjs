// File: userTemplate.js

export const not_found = (type) => `
<div class="col m-5 text-center">${type} not found</div>
`;

export const banned_status = (user) => {
  if (user.is_active) {
    return `
    <tr id="bannedRow">
    <th scope="row"><b>Banned</b></th>
    <td>${!user.is_active} <span class="text-end"></span></td>
    <td><button id="banButton-${user._id}" class="btn btn-danger">BAN USER</button></td>
    </tr>`;
  } else {
    return `
    <tr id="bannedRow">
    <th scope="row"><b>Banned</b></th>
    <td>${!user.is_active} <span class="text-end"></span></td>
    <td><button id="unbanButton-${user._id}" class="btn btn-success">UNBAN USER</button></td>
    </tr>
  `;
  }
};

export const professional_type_row = (user) => `
<tr>
  <th scope="row"><b>Professional Type</b></th>
  <td>${user.professional_type || "professional_type"}</td>
  <td><select id="professionalType-${user._id}" class="form-select" aria-label="Default select example">
          <option value="undefined" selected>CHANGE</option>
          <option value="VIP">VIP</option>
          <option value="SMM">SMM</option>
          <option value="none">None</option>
      </select></td>
</tr>`;

export const account_type_row = (user) => `
<tr>
  <th scope="row"><b>Account Type</b></th>
  <td>${user.account_type || "account_type"}</td>
  <td>
    <select id="accountType-${user._id}" class="form-select" aria-label="Default select example">
      <option value="undefined" selected>CHANGE</option>
      <option value="standard">Standard</option>
      <option value="professional">Professional</option>
      <option value="verified">Verified</option>
      <option value="moderator" class="text-danger">Moderator</option>
    </select></td>
</tr>`;

export const email_row = (email) => `
<tr>
  <th scope="row"><b>Email</b></th>
  <td colspan="2">${email || "email"}</td>
</tr>`;

export const total_squeals_row = (total_squeals) => `
<tr>
  <th scope="row"><b>Total Squeals</b></th>
  <td colspan="2">${total_squeals || 0}</td>
</tr>`;

export const char_quota_row = (user) => `
<tr>
  <th scope="row"><b>Char Quota</b></th>
    <td colspan="2">
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1">D</span>
      <input id="daily-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.daily || 0}" 
        value=${user.char_quota?.daily || 0} aria-label="Daily" aria-describedby="Daily character quota" min=0>
      <span class="input-group-text" id="basic-addon1">W</span>
      <input id="weekly-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.weekly || 0}" 
        value="${user.char_quota?.weekly || 0}" aria-label="Weekly" aria-describedby="Weekly character quota" min=0>
      <span class="input-group-text" id="basic-addon1">M</span>
      <input id="monthly-input-${user._id}" type="number" class="form-control" placeholder="${user.char_quota?.monthly || 0}" 
        value="${user.char_quota?.monthly || 0}" aria-label="Monthly" aria-describedby="Monthly character quota" min=0>
    </div>
    <hr class="mb-1" >
    Extra characters: ${user.char_quota?.extra_daily || 0}
  </td>
</tr>`;

export const smm_row = (smm) => `
<tr>
  <th scope="row"><b>Social Media Manager</b></th>
  <td colspan="2">${smm || "none"}</td>
</tr>`;

export const VIPDiv = (VIP) => `
<div><h5><i class="bi bi-dot text-danger"></i>${VIP || "vip_username"}</h5></div><hr class="my-0">`;

export const managed_accounts_accordion = (managed_accounts) => {
  if (managed_accounts && managed_accounts.length == 0) {
    console.log(managed_accounts);
    console.log(managed_accounts.length);
    console.log("no managed accounts");
    return "";
  } else {
    console.log(managed_accounts);
    console.log(managed_accounts.length);
    console.log("managed accounts");
    return `
  <tr>
    <td colspan="3">
      <div class="accordion accordion-flush" id="accordionFlushVIPs">
          <div class="accordion-item">
              <h2 class="accordion-header" id="flush-VIP">
                  <button class="accordion-button collapsed" type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseVIP"
                      aria-expanded="false"
                      aria-controls="flush-collapseVIP">
                      <b>VIP List</b>
                  </button>
              </h2>
              <div id="flush-collapseVIP"
                  class="accordion-collapse collapse"
                  aria-labelledby="flush-headingVIP"
                  data-bs-parent="#accordionFlushVIP">
                  <div class="accordion-body">
                  <div id="VIPUserCard">            
                  </div> 
                  </div>
              </div>
          </div>
      </div>
    </td>
  </tr>`;
  }
};

export const channelDiv = (channel) => `
<div><h5><i class="bi bi-dot text-danger"></i>${channel?.name || "channel_name"}</h5></div><hr class="my-0">`;

export const owned_channels_accordion = (owned_channels) => {
  if (owned_channels && owned_channels.length == 0) {
    console.log(owned_channels);
    console.log(owned_channels.length);
    console.log("no owned channels");
    return "";
  } else {
    console.log(owned_channels);
    console.log(owned_channels.length);
    console.log("owned channels");
    return `<tr>
    <td colspan="3">
        <div class="accordion accordion-flush" id="accordionFlushChannels">
            <div class="accordion-item">
                <h2 class="accordion-header" id="flush-Owned">
                    <button class="accordion-button collapsed" type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseOwned"
                        aria-expanded="false"
                        aria-controls="flush-collapseOwned">
                        <b>Owned Channels</b>
                    </button>
                </h2>
                <div id="flush-collapseOwned"
                    class="accordion-collapse collapse"
                    aria-labelledby="flush-headingOwned"
                    data-bs-parent="#accordionFlushOwned">
                    <div class="accordion-body">
                    <div id="channelUserCard">            
                    </div> 
                    </div>
                </div>
            </div>
        </div>
    </td>
</tr>`;
  }
};

export const editorDiv = (channel) => `
<div><h5><i class="bi bi-dot text-danger"></i>${channel?.name || "channel_name"}</h5></div><hr class="my-0">`;

export const editor_channels_accordion = (editor_channels) => {
  if (editor_channels && editor_channels.length == 0) {
    console.log(editor_channels);
    console.log(editor_channels.length);
    console.log("no edited channels");
    return "";
  } else {
    console.log(editor_channels);
    console.log(editor_channels.length);
    console.log("edited channels");
    return `<tr>
    <td colspan="3">
        <div class="accordion accordion-flush" id="accordionFlushEditor">
            <div class="accordion-item">
                <h2 class="accordion-header" id="flush-Editor">
                    <button class="accordion-button collapsed" type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseEditor"
                        aria-expanded="false"
                        aria-controls="flush-collapseEditor">
                        <b>Editor Channels</b>
                    </button>
                </h2>
                <div id="flush-collapseEditor"
                    class="accordion-collapse collapse"
                    aria-labelledby="flush-headingEditor"
                    data-bs-parent="#accordionFlushEditor">
                    <div class="accordion-body">
                    <div id="editorUserCard">            
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </td>
  </tr>`;
  }
};

export const user_card = (user) => `<div class="col"></div>
  <div class="card mb-3 mt-4 datacard col-8">
      <div class="row g-0">
        <div class="col-md-4 py-3">
          <div class="row-6">
              <img src="./../media/propic/${
                user?.profile_picture || "squealer.png"
              }" class="img-fluid rounded-start rounded" onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                  alt="${user?.profile_picture || "squealer"}">
          </div>
        <div class="row p-3">
          <button id="confirmChangesButton-${user._id}" class="btn btn-primary">CONFIRM CHANGES</button>
        </div>
        <div class="row-1">
          <p class="text-danger" id="userErrorMessage"></p>
        </div>
      </div>
          <div class="col-md-8">
              <div class="card-body">
                  <h3 class="card-title">@${user?.username || "username"}</h3>
                  <h6 class="card-subtitle mb-2 text-muted">User since: ${new Date(user?.created_at).toLocaleString()}</h6>
                  <h5 class="card-body">${user?.profile_info || "profile info"}</h5>
                  <table class="table" aria-label="userData">
                      <tbody>
                          ${banned_status(user)}
                          ${account_type_row(user)}
                          ${professional_type_row(user)}
                          ${email_row(user?.email)}
                          ${total_squeals_row(user?.squeals.posted.length)}
                          ${char_quota_row(user)}
                          ${smm_row(user?.smm)}
                          ${managed_accounts_accordion(user?.managed_accounts)}
                          ${owned_channels_accordion(user?.owned_channels)}
                          ${editor_channels_accordion(user?.editor_channels)}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  </div>
  <div class="col"></div>`;

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
          <div class="col-md-8">
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
