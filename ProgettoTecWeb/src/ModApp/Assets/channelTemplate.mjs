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

export const channel_card = (channel, channel_owner, editor_list_html) => `
<div class="col"></div>
    <div class="card datacard mb-3 mt-4 col-8">
        <div class="card-body">
            <div class="row">
                <div class="col-6">
                    <h4 class="card-title me-2">§${channel.name} ${channel_ban_status(channel)}</h4>
                </div>
                <div class="col">
                    <h4>Owner: ${channel_owner} </h4>
                </div>
            </div>
            <div class="card-subtitle mb-3">Online Since ${new Date(channel.created_at).toLocaleString()}</div>
            <div class="row card-text mb-4">
                <div class="col">
                    <h6 class="card-title">${channel.description} </h6>
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
<div class="col"></div>`;

export const channel_card_editor = (editor) => `
    <li class="list-group-item">${editor}</li>
`;
