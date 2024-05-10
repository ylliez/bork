console.log(`[TBD] landing...`);

const socket = io("/");
socket.on("connect", () => {
    console.log(`Landed. client ID: ${socket.id}`);
});

