var Routes = require('./Routes.json');

module.exports = {
    recognizeServer(game, uid) {
        var server;
        if (game.startsWith('genshin')) {
            server = {
                "1": "cn_gf01",
                "2": "cn_gf01",
                "5": "cn_qd01",
                "6": "os_usa",
                "7": "os_euro",
                "8": "os_asia",
                "9": "os_cht",
            }.includes(uid[0])
            if (server) return server[uid[0]];
            else throw new Error("UID", uid, "isn't associated with any server, please try again!");
        } else if (game.startsWith("starrail")) {
            server = {
                "1": "prod_gf_cn",
                "2": "prod_gf_cn",
                "6": "prod_official_usa",
                "7": "prod_official_eur",
                "8": "prod_official_asia",
                "9": "prod_official_cht",
            }.includes(uid[0]);
            if (server) return server[uid[0]];
            else throw new Error("UID", uid, "isn't associated with any server, please try again!");
        }
    },
    recognizeGame(game) {
        if (!Routes.gameCode[game]) throw new Error("Game", game, "doesn't on database list!");
        else return Routes.gameCode[game];
    },
}