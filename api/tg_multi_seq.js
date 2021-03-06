const {Client} = require('tglib')
var pgapi = require('../api/pg_api')
var db = require('../db_seq/db_init')

async function initClients() {
    const clients = {}
    const credentials = {
        agent_tp0:{type: 'user', value: '+79069624310'},
        //agent_tp1: {type: 'user', value: '+79967090026'},
        //agent_tp2: {type: 'user', value: '+79021419412'},
        //agent_tp3: {type: 'user', value: '+79021419479'},
        //agent_tp4: {type: 'user', value: '+79021423788'}
    }
    for (const key in credentials) {
        try {
            const client = new Client({
                apiId: '363213',
                apiHash: 'a10073265584d54055a4c3ad0e16af62',
                auth: credentials[key]
            })
            await client.ready
            clients[key] = client
        } catch (e) {
            console.log(`Cannot create ${key}: `, e.message)
        }
    }

    return clients

}

async function call() {
    const clients = await initClients()

    //const chat2 = await clients.agent_tp0.tg.getChat({ chat_id: '-1001006653226' })
    // const Sequelize = require('sequelize');
    // const Op = Sequelize.Op;
    // let restest = await db.Message_in_Group.findAll()
    //
    // for (let i=0;i < restest.length; i++)
    // {
    //     console.log(restest.length)
    //     let g = await db.Message_in_Group.destroy({
    //         where:{
    //             message_id: restest[i].dataValues.message_id,
    //             id:{[Op.ne]: restest[i].dataValues.id},
    //             text: restest[i].dataValues.text
    //         }
    //     })
    //         .catch((err) => {
    //             console.log(err)
    //         });
    //     restest = await db.Message_in_Group.findAll()
    // }
    console.log('telegram loaded')
    for (const cl in clients) {
        console.log(cl,' loaded')
        //if (!object.hasOwnProperty(key)) continue;
        clients[cl].registerCallback('td:update', async (update) => {
            if (update['@type'] === 'updateNewMessage' && update['message']['content']['@type'] === 'messageText') {
                let repl_time = undefined

                console.log('Got update:', JSON.stringify(update, null, 2))
                if (update['message']['reply_to_message_id'] != 0 && update['message']['is_outgoing']) {
                    await db.Message_in_Group.findAll({
                        where: {
                            chat_id: update['message']['chat_id'],
                            message_id: update['message']['reply_to_message_id']
                        }
                        }).then(function (res) {
                            //баг
                        repl_time = update['message']['date'] - res["0"].dataValues.timest
                        console.log(repl_time)
                    })
                        .catch(e =>
                            console.error(e.stack))
                    // await pgapi.pool.query('select new_schema.messages_group.timestamp from new_schema.messages_group where id = $1', [update['message']['reply_to_message_id']])
                    //     .then(res =>
                    //         repl_time = update['message']['date'] - res.rows[0].timestamp)
                    //     .catch(e =>
                    //         console.error(e.stack))
                    //console.log(err, res)
                    // pgapi.pool.query('INSERT INTO new_schema.messages_group(react_time) VALUES($1)', [update['message']['date']-res.rows[0].timestamp], (err, res) => {
                    //     console.log(err, res)
                    // })


                }
                if (update['message']['chat_id'] > 0) {
                    await db.Message.create({
                        message_id: update['message']['id'],
                        sender_user_id: update['message']['sender_user_id'],
                        data: new Date(update['message']['date'] * 1000),
                        text: update['message']['content']['text']['text'],
                        to_id: clients[cl].options.auth.value,
                        chat_id: update['message']['chat_id'],
                        from_tp: update['message']['is_outgoing'],
                        timest: update['message']['date'],
                        react_time: repl_time,
                        reply_to: update['message']['reply_to_message_id']
                    })
                    // await pgapi.pool.query('INSERT INTO new_schema.messages(id, sender_user_id, data, text, to_id, chat_id, from_tp, timestamp, react_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [update['message']['id'],
                    //     update['message']['sender_user_id'], new Date(update['message']['date'] * 1000), update['message']['content']['text']['text'],
                    //     clients[cl].options.auth.value, update['message']['chat_id'], update['message']['is_outgoing'], update['message']['date'], repl_time], (err, res) => {
                    //     console.log(err, res)
                    // })
                } else {
                    await db.Project.findAll({
                        where:{
                            chat_id:update['message']['chat_id']
                        }
                    }).then(async function (res) {
                        if (res.length === 0) {
                            let name = await clients[cl].tg.getChat({ chat_id: update['message']['chat_id'] })
                            let link = await clients[cl].fetch({
                                '@type': 'getSupergroupFullInfo',
                                'supergroup_id': name.type.supergroup_id,

                            })
                                .catch(e =>
                                    console.error(e))
                            // let test = await clients[cl].fetch({
                            //     '@type': 'getSupergroupMembers',
                            //     'offset': 0,
                            //     'limit':1000,
                            //     'supergroup_id': name.type.supergroup_id,
                            //
                            // })
                            //     .catch(e =>
                            //         console.error(e))
                            // let test1 = await clients[cl].fetch({
                            //     '@type': 'getUserFullInfo',
                            //     'user_id': 181082604,
                            //
                            // })
                            //     .catch(e =>
                            //         console.error(e))
                            // const { TextStruct } = require('tglib/structs')
                            // let test2 = await clients[cl].tg.sendTextMessage({
                            //     '$text': new TextStruct('`Hello` world!', 'textParseModeMarkdown'),
                            //     'chat_id': 181082604,
                            //     'disable_notification': true,
                            //     'clear_draft': false,
                            // })
                            //     .catch(e =>
                            //         console.error(e))
                            // let test3 = await clients[cl].fetch({
                            //         '@type': 'addChatMember',
                            //         'user_id': 181082604,//igor
                            //         'chat_id':-213406993,//offroad brn
                            //         'forward_limit':0
                            //
                            //     })
                            //         .catch(e =>
                            //             console.error(e))

                            await db.Project.create({
                                name:name.title,
                                chat_id: update['message']['chat_id'],
                                invite_link: link.invite_link
                            })

                        }
                    })
                    // await pgapi.pool.query('select exists(select * from new_schema.list_projects where chat_id = $1);', [update['message']['chat_id']], (err, res) => {
                    //     if (res.rows[0].exists === false) {
                    //         pgapi.pool.query('INSERT INTO new_schema.list_projects(name, chat_id) VALUES($1, $2) RETURNING *', ['undef', update['message']['chat_id']], (err, res) => {
                    //             console.log(err, res)
                    //         })
                    //     }
                    //     console.log(err, res)
                    // })
                    // Удалено за ненадобностью
                    // if (update['message']['is_outgoing'] === false) {
                    //     await
                    //     await pgapi.pool.query('delete from new_schema.messages_group where id = $1 and from_tp = false', [update['message']['id']], (err, res) => {
                    //         console.log(err, res)
                    //     })
                    // }


                    let res = await db.Message_in_Group.findAll({
                        where: {
                            message_id: update['message']['id'],
                            text: update['message']['content']['text']['text']
                        }
                    })
                    if(res.length===0) {
                        await db.Message_in_Group.create({
                            message_id: update['message']['id'],
                            sender_user_id: update['message']['sender_user_id'],
                            data: new Date(update['message']['date'] * 1000),
                            text: update['message']['content']['text']['text'],
                            to_id: clients[cl].options.auth.value,
                            chat_id: update['message']['chat_id'],
                            from_tp: update['message']['is_outgoing'],
                            timest: update['message']['date'],
                            react_time: repl_time,
                            reply_to: update['message']['reply_to_message_id']
                        })
                    }
                    // await pgapi.pool.query('INSERT INTO new_schema.messages_group(id, sender_user_id, data, text, to_id, chat_id, from_tp, timestamp, react_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [update['message']['id'],
                    //     update['message']['sender_user_id'], new Date(update['message']['date'] * 1000), update['message']['content']['text']['text'],
                    //     clients[cl].options.auth.value, update['message']['chat_id'], update['message']['is_outgoing'], update['message']['date'], repl_time], (err, res) => {
                    //     console.log(err, res)
                    // })
                }
            }
        })

        clients[cl].registerCallback('td:error', (update) => {
            console.error('Got error:', JSON.stringify(update, null, 2))
        })
    }
    // pgapi.pool.end();
    // }
}

module.exports.call = call
