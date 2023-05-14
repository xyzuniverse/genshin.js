const axios = require('axios');
const Routes = require('./Routes.json');
const Handler = require('./handler');
const Errors = require('./Errors.json');

/**
 * Create a new client sessions
 */
class Client {
    constructor(cookieToken, game, server) {
        this.cookieToken = cookieToken;
        this.game = game;
        this.server = server;
    };

    async getUserInformation() {
        const { data: result } = await axios(Routes.web_api.userInfo, {
            method: "GET",
            headers: {
                'cookie': this.cookieToken,
                'user-agent': Routes['user-agent'],
            },
            params: {
                game_biz: Handler.recognizeGame(this.game),
            }
        });
        return result?.data?.list;
    };

    async claimRedeemCode(code) {
        if (!this.game) throw new Error("Name game not defined.")
        if (!code) throw new Error("Redemption code not defined.")
        // Get user info first
        var userinfo = await (await this.getUserInformation()).find(v => v.region.includes(this.server.toLowerCase()));
        const { data: result } = await axios(Routes.code_url[this.game], {
            method: "GET",
            headers: {
                'cookie': this.cookieToken,
                'user-agent': Routes['user-agent'],
            },
            params: {
                lang: 'en',
                uid: userinfo.game_uid,
                region: userinfo.region,
                cdkey: code,
                game_biz: Handler.recognizeGame(this.game)
            }
        })
        if (Errors[result.retcode]) return result.message;
        else return result;
    };

    async claimDailyCheckIn() {
        const { data: result } = await axios(Routes.reward_url[this.game] + "sign", {
            method: "POST",
            headers: {
                'cookie': this.cookieToken,
                'user-agent': Routes['user-agent'],
            },
            params: {
                lang: 'en',
                act_id: Routes.act_id[this.game]
            }
        })
        return result;
    }

    async getDiaryHistory(month) {
        var userinfo = await (await this.getUserInformation()).find(v => v.region.includes(this.server.toLowerCase()));
        const { data: result } = await axios(Routes.info_ledger_url, {
            method: "GET",
            headers: {
                'cookie': this.cookieToken,
                'user-agent': Routes['user-agent'],
            },
            params: {
                lang: 'en',
                uid: userinfo.game_uid,
                region: userinfo.region,
                month: month ? month : new Date().getMonth()
            }
        })
        return result;
    }
}

module.exports = { Client };