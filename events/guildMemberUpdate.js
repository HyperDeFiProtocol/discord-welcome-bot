const countMembers = require('../actions/countMembers');
const {sendError, sendMessage} = require("../actions/notify");
const builders = require("@discordjs/builders");


const filterOutRoles = function (oldRoles, newRoles) {
    let rolesRemoved = []
    let rolesAdded = []
    let rolesRemovedTextArray = []
    let rolesAddedTextArray = []

    for (const key in oldRoles) {
        if (!isInRoles(oldRoles[key], newRoles)) rolesRemoved.push(oldRoles[key])
    }

    for (const key in newRoles) {
        if (!isInRoles(newRoles[key], oldRoles)) rolesAdded.push(newRoles[key])
    }

    for (const key in rolesRemoved) {
        rolesRemovedTextArray.push(builders.inlineCode(rolesRemoved[key]['name']))
    }

    for (const key in rolesAdded) {
        rolesAddedTextArray.push(builders.inlineCode(rolesAdded[key]['name']))
    }


    return [rolesRemoved, rolesAdded, rolesRemovedTextArray.join(', '), rolesAddedTextArray.join(', ')]
}

const isInRoles = function (role, roles) {
    for (const key in roles) {
        if (role === roles[key]) return true
    }
    return false
}

const execute = async function (oldMember, newMember) {
    try {
        await countMembers()
        // if (debug) return console.log('... guildMemberUpdate')

        let oldMemberRoles = []
        let newMemberRoles = []
        oldMember.roles.cache.each(role => oldMemberRoles.push(role))
        newMember.roles.cache.each(role => newMemberRoles.push(role))

        // filter out
        const roles = filterOutRoles(oldMemberRoles, newMemberRoles)
        const rolesRemoved = roles[0]
        const rolesAdded = roles[1]

        // no role added/removed
        if (rolesAdded.length === 0 && rolesRemoved.length === 0) return;

        // role name(s) text
        const rolesRemovedText = roles[2]
        const rolesAddedText = roles[3]

        // notify
        if (rolesRemoved.length) {
            const text = `🏐 ${newMember.user} ${builders.inlineCode('LOST')}`
                + ` ${rolesRemoved.length > 1 ? 'roles' : 'role'}:`
                + ` ${rolesRemovedText}`

            await sendMessage('moderator', text)
        }

        if (rolesAdded.length) {
            const text = `⚽️ ${newMember.user} ${builders.inlineCode('GAINED')}`
                + ` ${rolesAdded.length > 1 ? 'roles' : 'role'}:`
                + ` ${rolesAddedText}`

            await sendMessage('moderator', text)
        }
    } catch (e) {
        await sendError(e)
    }

}

module.exports = {
    name: 'guildMemberUpdate',
    execute,
}
