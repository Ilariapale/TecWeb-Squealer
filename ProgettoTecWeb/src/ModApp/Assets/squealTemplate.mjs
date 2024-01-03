// File: squealTemplate.js

export const reported_squeal_comment_collapse = (squeal) => `
`;

export const reported_squeal_content = (squeal) => {
  if (squeal.content_type === "text") {
    return `<p class="card-text">${squeal.content}</p>`;
  } else if (squeal.content_type === "image") {
    if (squeal.content.includes("http")) return `<img src="${squeal.content}" onerror="this.src='/../media/image/not-found.png'" class="card-img-top" alt="...">`;
    else return `<img src="/../media/image/${squeal.content || "squealer.png"}" onerror="this.src='/../media/image/not-found.png'" class="card-img-top" alt="...">`;
  } else if (squeal.content_type === "video") {
    return `<video class="ratio ratio-16x9" controls> <source src="/../media/video/${squeal.content}"></video>`;
  } else if (squeal.content_type === "position") {
    `<p class="card-text">[position]</p>`;
  } else {
    return `<p class="card-text">[deleted]</p>`;
  }
};

export const squeal_in_list_content = (squeal) => {
  if (squeal.content_type === "text") return `<p class="card-text">${squeal.content}</p>`;
  return `<p class="card-text">[${squeal.content_type}]</p>`;
};

export const official_squeal_in_list = (squeal) => {
  if (squeal.is_in_official_channel) {
    return `<i class="bi bi-award-fill text-warning"></i>`;
  } else {
    return ``;
  }
};

export const squeal_in_list = (squeal) => {
  const div = document.createElement("div");
  div.id = `squeal_in_list-${squeal._id}`;
  div.className = "row mt-1 col-11";
  div.innerHTML = `
    <div class="card clickable mb-3 mt-2 datacard ">
        <div id="squeal-body-${squeal._id}" class="row g-0">
            <div class="col">
                <div class="card-body">
                    <div class="d-flex"><b class="me-auto">@${squeal?.username || "username"}</b>${official_squeal_in_list(squeal)}</div>
                    <div class="text-muted">Created: ${new Date(squeal?.created_at).toLocaleString()}</div>
                    <div>${squeal_in_list_content(squeal)}</div>
                </div>
            </div>
            </div>
        </div>
    </div>
    `;
  return div;
};

export const squeal_content = (squeal) => {
  if (squeal.content_type === "text") {
    return `<p class="card-text of-auto text-break max-vh-10 border rounded">${squeal.content}</p>`;
  } else if (squeal.content_type === "position") {
    return `
    <p class="card-text">
      <a href="squeal/${squeal._id}" target="_blank">[position] 
        <i class="bi bi-box-arrow-up-right"></i>
      </a>
    </p>`;
  } else if (squeal.content_type === "deleted") {
    return `<p class="card-text">[deleted]</p>`;
  } else {
    if (squeal.content.includes("http"))
      return `<p class="card-text"><a href="${squeal.content}" target="_blank">[${squeal.content_type}] <i class="bi bi-box-arrow-up-right"></i></a></p>`;
    return `<p class="card-text"><a href="/media/${squeal.content_type}/${squeal.content}" target="_blank">[${squeal.content_type}] <i class="bi bi-box-arrow-up-right"></i></a></p>`;
  }
};

export const elementRecipientDiv = (element, type) => {
  const div = document.createElement("div");
  div.id = `${type}Element-${element}`;
  div.className = "row";
  div.innerHTML = `
  <div class="d-flex">
    <i class="bi bi-dot text-danger"></i>${element || "list element"}
    <button type="button" class="btn-close ms-auto" aria-label="Close" id="remove-${type}-${element}"></button>
  </div>
  <hr class="my-0">`;
  return div;
};
export const recipient_accordion = (type) => {
  if (type) type = type.charAt(0).toUpperCase() + type.slice(1);
  const special_char = type === "User" ? "@" : type === "Channel" ? "§" : "#";

  const input = `
  <div class="input-group">
    <div class="input-group-text" id="basic-addon1">
      <span class="h4 m-0 px-1">${special_char}</span>
    </div>
    <input type="text" class="form-control" id="add-${type}-input" placeholder="${type}" aria-label="${type}-input" aria-describedby="basic-addon1">
    <button class="btn btn-outline-secondary" type="submit" id="add-${type}-button">+</button>
  </div>`;

  return `
    ${input}
    <div class="accordion accordion-flush" id="accordionFlush${type}Recipient">
      <div class="accordion-item">
          <h2 class="accordion-header" id="flush-${type}s-Recipients">
              <button class="accordion-button collapsed" type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapse${type}Recipient"
                  aria-expanded="false"
                  aria-controls="flush-collapse${type}Recipient">
                  <b>${type}s</b>
              </button>
          </h2>
          
          <div id="flush-collapse${type}Recipient"
              class="accordion-collapse collapse show pb-2""
              aria-labelledby="flush-heading${type}Recipient"
              data-bs-parent="#accordionFlush${type}Recipient">
              <div class="accordion-body recipient-list">
              <div id="${type.toLowerCase()}RecipientsAccordion">       
              </div>
              </div>
          </div>
      </div>
    </div>`;
};

export const squeal_card = (squeal) => `
<div class="card mb-3 mt-4 datacard col-11 ">

  <div class="row g-0">

    <div class="col">
      <div class="card-body card-container">
        <div class="card-title row">
          <div class="col-5 me-auto">
           
            <h3 class="row">
              <div class="col-2">
                <img src="./../media/propic/squealer.png"
                class="img-fluid rounded-start rounded" onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                alt="squealer"> 
              </div>
              
              <div class="col-auto">
                @${squeal.username || "Squeal User"}
              </div>
            </h3>
          </div>
          <div class="col-3">
            HEX: ${squeal.hex_id} <b>|</b>
            Comments: ${squeal.comments_count} <b>|</b>
            Impressions: ${squeal.impressions}
          </div>
          <div class="col-2 text-end">
            <button id="deleteSquealButton-${squeal._id}" class="btn btn-danger">DELETE SQUEAL</button>
          </div>
          <div class="col-2 text-end">
            <button id="confirmChangesButton-${squeal._id}" class="btn btn-primary">CONFIRM CHANGES</button>
          </div>
        </div>
        <div id="squeal-body-${squeal._id}" class="pb-2">
        ${squeal_content(squeal)}
        </div>

        <div id="updateSquealResult">
        </div>

        <div class="row pb-4">
          <div class="col-4">
            ${recipient_accordion("user")}
            </div>
            <div class="col-4">
              ${recipient_accordion("channel")}
            </div>
            <div class="col-4">
              ${recipient_accordion("keyword")}
            </div>
        </div>

        <div class="row-1">
          <p class="text-danger m-0" id="squealErrorMessage"></p>
        </div>
      </div>
    </div>
    
    <div class="vr col-1 mb-5"></div>
    <div class="col-2 p-2 my-2 pb-5 ps-3"> 

        <div class="input-group mb-3">
          <span class="input-group-text">👍</span>
          <input min=0 value="${squeal.reactions.like}" placeholder="${squeal.reactions.like}" id="like-input-${squeal._id}" type="number" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">😍</span>
          <input min=0 value="${squeal.reactions.love}" placeholder="${squeal.reactions.love}" id="love-input-${squeal._id}" type="number" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">😂</span>
          <input min=0 value="${squeal.reactions.laugh}" placeholder="${squeal.reactions.laugh}" id="laugh-input-${squeal._id}" type="number" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">👎</span>
          <input min=0 value="${squeal.reactions.dislike}" placeholder="${squeal.reactions.dislike}" id="dislike-input-${squeal._id}" type="number" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">🤮</span>
          <input min=0 value="${squeal.reactions.disgust}" placeholder="${squeal.reactions.disgust}" id="disgust-input-${squeal._id}" type="number" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">🙅‍♂️</span>
          <input min=0 value="${squeal.reactions.disagree}" placeholder="${squeal.reactions.disagree}" id="disagree-input-${squeal._id}" type="number" class="form-control ">
        </div>

    </div>
  </div>

  <div  class="d-flex card-footer clickable position-bottom-card">
      <div class=" mb-2 text-muted me-auto">
        Created: ${new Date(squeal?.created_at).toLocaleString()} 
      </div>
      <a href="squeal/${squeal._id}" target="_blank"><i class="bi bi-box-arrow-up-right"></i></a>
      <div class=" mb-2 text-muted ms-auto">
        Last modified: ${new Date(squeal?.last_modified).toLocaleString()}
      </div>
    </div>
</div>
`;

export const reported_squeal_card = (squeal) => {
  const div = document.createElement("div");
  div.id = `squeal-${squeal._id}`;
  div.className = "container pb-3";
  div.innerHTML = `
    <div class="row justify-content-center">
        <div class="col-10 col-md-8">
            <div class="squeal card text-center shadow-0">
                <div class=" bg-image hover-overlay ripple">
                    <a>
                        <div class="mask" style="background-color: rgba(251, 251, 251, 0.15)">
                        </div>
                    </a>
                </div>
                <a class="card-header clickable" href="/squeal/${squeal._id}" target="_blank">
                    <div class="row">
                        <div class="col">
                        </div>
                        <div class="col text-dark">
                            HEX: ${squeal.hex_id} Reported ${squeal.reported.by.length} ${squeal.reported.by.length == 1 ? "time" : "times"}
                        </div>
                        <div class="col">
                        </div>
                    </div>
                </a>
                <div class="card-body p-2">
                    <h5 class="card-title"><a class="text-dark" href="/profile/${squeal.username}" target="_blank">@${squeal.username || username}</a></h5>
                    ${reported_squeal_content(squeal)}
                    <div class="card-icons container">
                        <div class="row flex-nowrap justify-content-between d-flex align-items-center my-2">
                            <div class="col-5 px-1">
                                <a  href="/squeal/${squeal._id}" target="_blank" id="commentButton-${squeal._id}" type="button"
                                    class="btn btn-outline-secondary btn-outline-rounded px-2">
                                    <i class="bi bi-chat-dots-fill"></i>
                                    <p class="badge bg-danger ms-2 my-auto"> ${squeal.comments_count}</p>
                                </a>
                            </div>
                            <div class="col-5 px-1">
                                <button type="button"
                                    class="btn btn-outline-success btn-outline-rounded px-4 py-2" type="button" id="squealSafeButton-${squeal._id}">
                                    <i class="bi bi-flag-fill"></i> FLAG AS SAFE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${reported_squeal_card_actions(squeal)}
    </div>
    <hr>
`;
  return div;
};

export const reported_squeal_card_actions = (squeal) => `
<div class="col-2 col-md-4 d-flex flex-column justify-content-center align-items-center">
    <div class="d-flex row">
        <button type="button" class="btn btn-outline-danger btn-outline-lg px-4 mb-5 flex-fill" id="banButton-${squeal._id}">BAN USER</button>
    </div>
    <div class="d-flex row">
        <button type="button" class="btn btn-outline-primary btn-outline-lg px-4 flex-fill" id="deleteSquealButton-${squeal._id}">DELETE SQUEAL</button>
    </div>
</div>
`;

/*
<ul class="list-group">
  <li class="list-group-item d-flex justify-content-between align-items-center">
    A list item
    <span class="badge bg-primary rounded-pill">14</span>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-center">
    A second list item
    <span class="badge bg-primary rounded-pill">2</span>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-center">
    A third list item
    <span class="badge bg-primary rounded-pill">1</span>
  </li>
</ul>


*/
