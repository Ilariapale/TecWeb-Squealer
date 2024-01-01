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

export const squeal_card = (squeal) => `

<div class="card mb-3 mt-4 datacard col-11 ">

<div class="col">
    <div class="card-body">
        <h3 class="card-title row">
            <div class="col-md-1 col-2">
                <img src="./../media/propic/squealer.png"
                class="img-fluid rounded-start rounded" onerror="if (this.src != 'Assets/logo.png') this.src = 'assets/logo.png'"
                alt="squealer">
            </div>
            @${squeal.username || "Squeal User"}
        </h3>
        ${squeal.content}
        <h6 class="card-subtitle mb-2 text-muted">Created: ${new Date(squeal?.created_at).toLocaleString()}</h6>
        <div class="row-1">
            <p class="text-danger m-0" id="squealErrorMessage"></p>
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
                                <a  href="/squeal/${squeal._id}" target="_blank" id="commentButton" type="button"
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
