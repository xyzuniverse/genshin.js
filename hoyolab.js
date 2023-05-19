const axios = require('axios');
const Routes = require('./Routes.json');
const Handler = require('./handler');
const Errors = require('./Errors.json');

/**
 * Create a new client sessions
 */
class Client {
    constructor(account_id, cookie_token, game, server) {
        this.account_id = account_id;
        this.cookie_token = cookie_token;
        this.cookieToken = ['account_id=' + account_id, 'cookie_token=' + cookie_token].join('; ');
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
        if (result.data.list) return result.data.list;
        else return result
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

    async genshinBattleChronicle() {
        var userinfo = await (await this.getUserInformation()).find(v => v.region.includes(this.server.toLowerCase()));
        try {
            var attempt = 0;
            var retry = function(data) {
                if (attempt > 3) {
                    throw new Error("Error when trying to get data, please recheck your cookie token or uid!")
                }
                if (data.retcode === -10001) {
                    return attempt += 1
                }
            }
            do {
                const { data } = await axios("https://bbs-api-os.hoyolab.com/game_record/genshin/api/index", {
                    method: "GET",
                    headers: {
                        'cookie': this.cookieToken,
                        'user-agent': Routes['user-agent'],
                        'ds': this.generateDSToken(),
                        'x-rpc-app_version': '1.5.0',
                        'x-rpc-client_type': '5',
                        'x-rpc-language': 'en-us'
                    },
                    params: {
                        server: userinfo.region,
                        role_id: userinfo.game_uid
                    }
                })
                return data;
            } while(retry(data))
        } catch (e) {
            console.error(e)
        }
    }

    generateDSToken() {
        const DS_SALT = '6s25p5ox5y14umn1p61aqyyvbvvl3lrt'
        var date = new Date()
        var time = Math.floor(date.getTime()/1000)
        const r = (Math.random() + 1).toString(36).substring(6);
        var hash = require('crypto').createHash('md5').update(`salt=${DS_SALT}&t=${time}&r=${r}`).digest('hex');
        return `${time},${r},${hash}`
    }
}

module.exports = { Client };