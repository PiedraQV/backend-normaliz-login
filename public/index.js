const socket = io();

document.getElementById("chat").style.background =
  "#fafafa";

socket.on("msg_back", (data) => {
  console.log(data);
  render(data);
});

socket.on("data_ready", (data) => {
  render2(data);
});

const render = (data) => {
  let content = data
    .map((item) => {
      return `<p> <strong>${item.author.id} at </strong> <span>[${new Date().toLocaleString()}]</span> : ${item.messages.msg} `;
    })
    .join(" ");

  document.querySelector("#chat").innerHTML = content;
};

const render2 = (data) => {
  let content = data
    .map((item) => {
      return `
      <tr>
        <td>${item.title}</td>
        <td>${item.price}</td>
        <td> <img src=${item.thumbnail} alt=${item.title} width="100" height="100"/> </td>
      </tr>`;
    })
    .join(" ");

  document.querySelector("#tabla").innerHTML = content;
};

const addMsg = () => {
  let info = {
    author: {
      id: document.querySelector("#inpmail").value,
      name: document.querySelector("#inpname").value,
      lastname: document.querySelector("#inplname").value,
      age: document.querySelector("#inpage").value,
      nickname: document.querySelector("#inpnick").value,
      avatar: document.querySelector("#inpurl").value,
    },
    messages: {
      msg: document.querySelector("#inpmsg").value,
      id: document.querySelector("#inpmail").value,
    },
  };

  socket.emit("data_client", info);

  document.querySelector("#inpmsg").value = "";
  document.querySelector("#inpmail").disabled = true;

  return false;
};
const anotherName = () => {
  let info = {
    title: document.querySelector("#inputName").value,
    price: document.querySelector("#inputPrice").value,
    thumbnail: document.querySelector("#inputThumb").value,
  };

  socket.emit("data_array", info);

  return false;
};