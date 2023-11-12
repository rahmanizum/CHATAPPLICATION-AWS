$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

const socket = io(window.location.origin);
socket.on('connect', () => {
    console.log(`You are connected with id : ${socket.id}`);
})
socket.on('common-message', () => {
    if (elements.message_btn.id == 0) {
        ShowCommonChats();
    }

})
socket.on('group-message', (groupId) => {
    if (elements.message_btn.id == groupId) {
        showGroupChats(groupId)
    }
})


const elements = {
    messageInput: message_form.querySelector('input[name="Message"]'),
    message_btn: message_form.querySelector('input[type="submit"]'),
    flexSwitch:message_form.querySelector('#flexSwitch'),
    flexLabel:message_form.querySelector('label'),
    flexInput:message_form.querySelector('#flexInput')
}
const modelElements = {
    groupName: create_group_model.querySelector('input[name="group_name"]'),
    searchBar: create_group_model.querySelector('input[name="search_bar"]'),
    groupDesription: create_group_model.querySelector('textarea[name="group_description"]'),
    editStatus: create_group_model.querySelector('input[name="edit_status"]')
}
const profileModel = {
    name:profile_modal.querySelector('#profile_name'),
    email:profile_modal.querySelector('#profile_email'),
    phoneNumber:profile_modal.querySelector('#profile_number'),
    image:profile_modal.querySelector('#profile_image')
    
}

elements.flexSwitch.addEventListener('change',()=>{
    if(elements.flexLabel.innerText === "text"){
        elements.flexLabel.innerText = "image";
        elements.flexInput.setAttribute('accept','image/*');
        elements.flexInput.type="file"
    }else{
        elements.flexLabel.innerText = "text"
        elements.flexInput.removeAttribute('accept');
        elements.flexInput.type="text"
    }
})

const group_editbtn = group_headContainer.querySelector('input[type="submit"]');
elements.message_btn.addEventListener('click', on_SendMessage);
create_groupBtn.addEventListener('click', showingAllUser)
group_editbtn.addEventListener('click', showingGroupDetails)
modelElements.searchBar.addEventListener('keyup', searchUser);
model_submibtn.addEventListener('click', createGroup)
group_body.addEventListener('click', showGroupChat)

function showChatOnScreen(chatHistory, userId) {
    chat_body.innerHTNL = "";
    let messageText = "";
    chatHistory.forEach((ele) => {
        const date = new Date(ele.date_time);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = date.toLocaleString('en-US', options);

        if (ele.userId == userId) {
            if(ele.isImage){
                messageText+=`      
            <div class="col-12 mb-2 pe-0">
                <div class="card p-2 float-end rounded-4 self-chat-class">
                    <p class="text-primary my-0"><small>${ele.name}</small></p>
                    <a href="${ele.message}" target="_blank">
                      <img src="${ele.message}" class="chat-image">
                    </a>
                    <small class="text-muted text-end">${formattedDate}</small>
                </div>
            </div>
                `
            }else{
                messageText += `                            
                <div class="col-12 mb-2 pe-0">
                    <div class="card p-2 float-end rounded-4 self-chat-class">
                        <p class="text-primary my-0"><small>${ele.name}</small></p>
                        <p class="my-0">${ele.message}</p>
                        <small class="text-muted text-end">${formattedDate}</small>
                    </div>
                </div>`
            }
        } else {
            if(ele.isImage){
                messageText += `                            
                <div class="col-12 mb-2 pe-0">
                    <div class="card p-2 float-start rounded-4 chat-class">
                        <p class="text-danger my-0"><small>${ele.name}</small></p>
                        <a href="${ele.message}" target="_blank">
                        <img src="${ele.message}" class="chat-image">
                      </a>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                </div>`

            }else{
                messageText += `                            
                <div class="col-12 mb-2 pe-0">
                    <div class="card p-2 float-start rounded-4 chat-class">
                        <p class="text-danger my-0"><small>${ele.name}</small></p>
                        <p class="my-0">${ele.message}</p>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                </div>`
            }
        }

    })
    chat_body.innerHTML = messageText;
    chat_container.scrollTop = chat_container.scrollHeight;
}
function searchUser(e) {
    const text = e.target.value.toLowerCase();
    const items = user_list.querySelectorAll('li');
    const usersArr = Array.from(items);
    usersArr.forEach(blockdisplay);
    function blockdisplay(value) {
        const userName = value.querySelector('h6').textContent;
        if (userName.toLowerCase().indexOf(text) != -1) {
            value.classList.add('d-flex');
            value.style.display = 'block';
        }
        else {
            value.classList.remove('d-flex');
            value.style.display = 'none';
        }
    }
}
async function ShowGroup() {
    try {
        const groupsResponse = await axios(`user/get-mygroups`);
        const { groups } = groupsResponse.data;
        group_body.innerHTML = `
        <button class="list-group-item list-group-item-action py-2" 
            data-bs-toggle="list">
            <div class="d-flex w-100 align-items-center justify-content-between" id="0">
                <img src="https://picsum.photos/seed/common/200" alt="Profile Picture" class="rounded-circle"
                    style="width: 50px; height: 50px;">
                <strong class="mb-1">Common-group</strong>
                <small>All Members</small>
            </div>
        </button>
        `
        let html = "";
        groups.forEach((ele) => {
            const date = new Date(ele.date);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = date.toLocaleString('en-US', options);
            html += `               
        <button class="list-group-item list-group-item-action py-2" 
            data-bs-toggle="list">
            <div class="d-flex w-100 align-items-center justify-content-between" id="${ele.id}">
                <img src="https://picsum.photos/seed/${ele.id}/200" alt="Profile Picture" class="rounded-circle"
                    style="width: 50px; height: 50px;">
                <strong class="mb-1">${ele.name}</strong>
                <small>${ele.membersNo} Members</small>
            </div>
        </button>`
        })
        group_body.innerHTML += html;

    } catch (error) {
        console.log(error);
    }
}
async function on_SendMessage(e) {
    try {
        if (e.target && message_form.checkValidity()) {
            e.preventDefault();
            const groupId = e.target.id;
            if(elements.flexLabel.innerText === "text"){
                const data = {
                    message: elements.messageInput.value,
                    GroupId: groupId
                }
                await axios.post('user/post-message', data);
            }else{
                const file = elements.messageInput.files[0]
                if (file && file.type.startsWith('image/')){
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('GroupId',groupId)
                    const imageResponse = await axios.post('user/post-image',formData)
                }else{
                    alert('Please select a valid image file.');
                }              
            }           
            message_form.reset();
            if (groupId == 0) {
                socket.emit('new-common-message')
                ShowCommonChats();

            } else {
                socket.emit('new-group-message', groupId)
                showGroupChats(groupId)
            }


        }
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }

}

async function ShowCommonChats() {
    try {
        let savingChats
        const chats = localStorage.getItem('chatHistory');
        if (chats) {
            const parsedChatHistory = JSON.parse(chats);
            const lastMessageId = parsedChatHistory[parsedChatHistory.length - 1].messageId;
            const APIresponse = await axios(`user/get-messages?lastMessageId=${lastMessageId}`);
            const apiChats = APIresponse.data.chats
            const mergedChats = [...parsedChatHistory, ...apiChats];
            savingChats = mergedChats.slice(-1000);
        } else {
            const APIresponse = await axios(`user/get-messages?lastMessageId=0`);
            const apiChats = APIresponse.data.chats
            savingChats = apiChats.slice(-1000);
        }
        const getUserResponse = await axios.get('/user/get-user');
        const userId = getUserResponse.data.userId
        localStorage.setItem("chatHistory", JSON.stringify(savingChats));
        showChatOnScreen(savingChats, userId)

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
        window.location = '/';
    }
}
async function showGroupChats(groupId) {
    try {
        const APIresponse = await axios.get(`user/get-group-messages?groupId=${groupId}`);
        const apiChats = APIresponse.data.chats
        const getUserResponse = await axios.get('/user/get-user');
        const userId = getUserResponse.data.userId
        showChatOnScreen(apiChats, userId)
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}
async function showingAllUser() {
    try {
        user_list.parentElement.classList.remove('d-none');
        const usersResponse = await axios.get('user/get-users');
        user_list.innerHTML = "";
        let text = ""
        const { users } = usersResponse.data;
        users.forEach((user) => {
            text += `                                    
        <li class="list-group-item  d-flex  justify-content-between">
            <div class="d-flex  align-items-center justify-content-between">
                <img src="https://picsum.photos/seed/${user.imageUrl}/200" alt="Profile Picture"
                    class="rounded-circle me-3" style="width: 35px; height: 35px;">
                <h6><strong class="mb-1">${user.name}</strong></h6>
            </div>
            <input type="checkbox" class="form-check-inline" name="users" value="${user.id}">
        </li>`
        })
        user_list.innerHTML = text;


    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}

async function showingGroupDetails(e) {
    try {
        const groupId = e.target.id
        user_list.parentElement.classList.remove('d-none');
        const usersResponse = await axios.get('user/get-users');
        const memberApi = await axios(`user/get-group-members?groupId=${groupId}`);
        const groupMebers = memberApi.data.users;
        const idSet = new Set(groupMebers.map(item => item.id));
        user_list.innerHTML = "";
        let text = ""
        const { users } = usersResponse.data;
        users.forEach((user) => {
            if (idSet.has(user.id)) {
                text += `                                    
                <li class="list-group-item  d-flex  justify-content-between">
                    <div class="d-flex  align-items-center justify-content-between">
                        <img src="https://picsum.photos/seed/${user.imageUrl}/200" alt="Profile Picture"
                            class="rounded-circle me-3" style="width: 35px; height: 35px;">
                        <h6><strong class="mb-1">${user.name}</strong></h6>
                    </div>
                    <input type="checkbox" class="form-check-inline" name="users" value="${user.id}" checked>
                </li>`
            } else {
                text += `                                    
                <li class="list-group-item  d-flex  justify-content-between">
                    <div class="d-flex  align-items-center justify-content-between">
                        <img src="https://picsum.photos/seed/${user.imageUrl}/200" alt="Profile Picture"
                            class="rounded-circle me-3" style="width: 35px; height: 35px;">
                        <h6><strong class="mb-1">${user.name}</strong></h6>
                    </div>
                    <input type="checkbox" class="form-check-inline" name="users" value="${user.id}">
                </li>`
            }

        })
        user_list.innerHTML = text;

        const GroupApiresponse = await axios(`user/get-group?groupId=${groupId}`);
        const { group } = GroupApiresponse.data;
        modelElements.groupName.value = group.name;
        model_submibtn.innerHTML = "Update Details";
        model_heading.innerHTML = `Update ${group.name} Details`;
        modelElements.editStatus.value = groupId
        modal_closeBtn.classList.add("d-none")
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}



async function createGroup(e) {
    try {
        if (create_group_form.checkValidity()) {
            e.preventDefault();
            const groupName = create_group_form.querySelector('#group_name').value;
            const selectedUsers = Array.from(user_list.querySelectorAll('input[name="users"]:checked'))
                .map(checkbox => checkbox.value);
            const data = {
                name: groupName,
                membersNo: selectedUsers.length + 1,
                membersIds: selectedUsers
            }
            if (modelElements.editStatus.value == "false") {
                await axios.post('user/create-group', data);
                alert("Group successfully created")

            } else {
                const groupId = modelElements.editStatus.value
                await axios.post(`user/update-group?groupId=${groupId}`, data);

                model_submibtn.innerHTML = "Create Group";
                model_heading.innerHTML = `Create new group`;
                modelElements.editStatus.value = "false"
                modal_closeBtn.classList.remove("d-none")
                alert("Group successfully updated")

            }
            create_group_form.reset();
            $('#create_group_model').modal('hide');
            ShowGroup();
        } else {
            alert('fill all details ')
        }

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}

async function showGroupChat(e) {
    try {
        const groupId = e.target.id
        const getUserResponse = await axios.get('/user/get-user');
        const userId = getUserResponse.data.userId
        if (groupId && groupId != "group_body") {
            setupGroup(groupId, userId)
            if (groupId == 0) {
                ShowCommonChats();
            } else {
                const APIresponse = await axios(`user/get-group-messages?groupId=${groupId}`);
                const apiChats = APIresponse.data.chats
                showChatOnScreen(apiChats, userId)
            }
        } else {
            console.log("no group id");
        }

    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
        // window.location = '/';
    }
}

async function setupGroup(groupId, userId) {
    try {
        if (groupId == 0) {
            group_img.src = `https://picsum.photos/seed/common/200`;
            group_heading.innerHTML = `Common Group`;
            group_members.innerHTML = ` All Members`;
            group_members.setAttribute("data-bs-original-title", `All Members can access this group !`);
            elements.message_btn.id = groupId;
            group_editbtn.classList.add('d-none')

        } else {
            const APIresponse = await axios(`user/get-group?groupId=${groupId}`);
            const { group } = APIresponse.data;
            group_img.src = `https://picsum.photos/seed/${groupId}/200`;
            group_heading.innerHTML = `${group.name}`;
            group_members.innerHTML = ` ${group.membersNo} Members`;
            const memberApi = await axios(`user/get-group-members?groupId=${groupId}`);
            const { users } = memberApi.data;
            const usersString = users.map(item => item.name.trim()).join(',');
            group_members.setAttribute("data-bs-original-title", `${usersString}`);
            elements.message_btn.id = groupId
            if (group.AdminId == userId) {
                group_editbtn.id = groupId;
                group_editbtn.classList.remove('d-none')
            } else {
                group_editbtn.classList.add('d-none')
            }
        }


    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}
async function setupProfile() {
    try {
        const getUserResponse = await axios.get('/user/get-user');
        const {name,email,phonenumber,imageUrl} = getUserResponse.data.user;
        profileModel.name.innerText = name,
        profileModel.email.innerText = email,
        profileModel.phoneNumber.innerText = phonenumber,
        profileModel.image.src = `https://picsum.photos/seed/${imageUrl}/200`
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}
ShowGroup();
ShowCommonChats();
setupProfile();

