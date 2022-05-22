#! /usr/bin/env node

(async () => {
    const { TakoyakiServer } = require("../dist/index");
    const takoyakiServer = new TakoyakiServer();
    takoyakiServer.run();
})();
