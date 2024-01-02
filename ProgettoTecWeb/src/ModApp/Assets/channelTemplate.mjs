export const channel_ban_status = (channel) => {
  if (channel.is_blocked) {
    return `
<button id="unbanChannelButton-${channel._id}" class="btn btn-success">UNBAN CHANNEL</button>
`;
  } else {
    return `
<button id="banChannelButton-${channel._id}" class="btn btn-danger">BAN CHANNEL</button>`;
  }
};

export const channel_in_list = (channel) => {
  const div = document.createElement("div");
  div.id = `channel_in_list-${channel._id}`;
  div.className = "row mt-1 col-11";
  div.innerHTML = `
  
    <div class="card clickable mb-3 mt-2 datacard ">
        <div id="channel-body-${channel._id}" class="row g-0">
            <div class="col">
                <div class="card-body">
                    <div ><b>@${channel?.name || "username"}</b></div>
                    <div class="text-muted">Online since: ${new Date(channel?.created_at).toLocaleString()}</div>
                    <div class="d-flex"><div class="me-auto"><b>Number of Squeals:</b> ${channel.squeals_count || "0"}<b></div> <div>Subscriber Count:</b> ${
    channel.subscribers_count || "0"
  }</div>  </div>
                </div>
            </div>
          </div>
    </div>
    `;
  return div;
};

/*
    <div class="card datacard mb-3 mt-4 col-11">
        <div class="col">
            <div class="card-body">
                <div class="row">
                    <div class="col-6">
                        <h4 class="card-title me-2">§${channel.name}</h4>
                    
                    </div>
                    <div class="col-6">
                        <h4>Owner: ${channel_owner} </h4>
                    </div>
                </div>
                <div>
                <div class="card-subtitle text-muted mb-3">Online Since ${new Date(channel.created_at).toLocaleString()}</div>
                </div>
                <div class="col">
                    <h6 class="card-text">${channel.description} </h6>
                </div>
                <div class="row card-text mb-4">
                    <div class="col-6">
                ${channel_ban_status(channel)}
                    </div>
                    <div class="col-6">
                        <h6><button class="btn btn-danger" id="deleteChannelButton-${channel._id}">Delete Channel</button></h6>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-6 justify-content-center">
                    Editors: 
                    <ul class="list-group list-group-flush">
                        ${editor_list_html}
                    </ul>
                    </div>
                    <div class="col-6 justify-content-center">
                    Subscribers: ${channel.subscribers.length}
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
*/

export const channel_card = (channel, channel_owner, editor_list_html) => `
<div class="card mb-3 mt-4 datacard col-11 ">

    <div class="col">
        <div class="card-body">
            <h3 class="card-title row">
                <div class="col-md-1 col-2">
                    <img src="./../media/propic/squealer.png"
                    class="img-fluid rounded-start rounded" onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                    alt="squealer">
                </div>
                §${channel.name || "Channel Name"}
                <div class="text-end col p-2">
                    ${channel_ban_status(channel)}
                
                    <button class="btn btn-danger" id="deleteChannelButton-${channel._id}">Delete Channel</button>
                </div>
            </h3>

            <div class="input-group mb-3 col-3">
                <input type="text" class="form-control" 
                id="newChannelNameInput-${channel._id}" placeholder="New Channel Name" aria-label="Channel" aria-describedby="button-addon2">
                <button class="btn btn-outline-secondary" type="button" id="newChannelName-${channel._id}">Change Name</button>
            </div>
            <div id="updateChannelResult">
            </div>

            <h6 class="card-subtitle mb-2 text-muted pt-2">User since: ${new Date(channel?.created_at).toLocaleString()}</h6>
            <div class="row-1">
                <p class="text-danger m-0" id="userErrorMessage"></p>
            </div>
            <h5 class="card-body">"${channel.description || "Channel Description"}"</h5>
            <div class="col-6 py-2"><b>Channel Owner:</b> ${channel_owner}</div>

            <div class="col">
                <div class="row">
                    <div class="col-6 py-2"><b>Squeals count:</b> ${channel.squeals.length}</div>
                    <div class="vr p-0"></div>
                    <div class="col py-2"><b>Subscribers count:</b> ${channel.subscribers.length}</div>
                </div>
                <hr class="m-0">
                <div class="row">
                    <ul class="list-group list-group-flush">
                    ${editor_list_html == "" ? `<li class="list-group-item">No Editors</li>` : editor_list_html}
                    </ul>
                </div>
                </div>
                </div>
            </div>
        </div>
    `;

export const channel_card_editor = (editor) => {
  return `<li class="list-group-item">${editor}</li>`;
};
