const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  var currentTime = new Date()
  try {
    return await db.collection('signIn').where({
      _openid: event.userInfo.openId
    })
    .update({
      data: {
        signInRecord: _.unshift(currentTime)
      },
    })
  } catch(e) {
    console.error(e)
  }
}
