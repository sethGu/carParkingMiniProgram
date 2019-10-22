// pages/w_my_exchange_coupon/w_my_exchange_coupon.js
const app = getApp()
const db = wx.cloud.database()  // 创建数据库实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ne:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    //1、引用数据库   
    const db = wx.cloud.database({
      //这个是环境ID不是环境名称     
      env: 'cloud-demo-5ax3d'
    })
    //2、开始查询数据了  news对应的是集合的名称   
    db.collection('user').get({
      //如果查询成功的话    
      success: res => {
        console.log(res.data)
        //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值      
        this.setData({
          ne: res.data[0]
        })
      }
    })
  },

  exchange_5: function (e) {
    this.addUserCoupon(100, 5)
  },

  exchange_10: function (e) {
    this.addUserCoupon(180, 10)
  },

  exchange_20: function (e) {
    this.addUserCoupon(330, 20)
  },

  exchange_50: function (e) {
    this.addUserCoupon(780, 50)
  },

  addUserCoupon(point, money) {
    db.collection('coupon').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        
        // 根据openid查询到记录id
        // 将this.queryRecordId()迁移到index.js，详情见release2文档 业务逻辑第四点
        var currentDate = new Date();
        var updatedStartDate = res.data[0].couponStart.concat(currentDate)

        // 将Date()转化为数值，方便后续计算优惠券是否可用 
        // endDate计算日期+90
        var endDate = currentDate.valueOf()
        endDate = endDate + 90 * 24 * 60 * 60 * 1000
        endDate = new Date(endDate)
        console.log('结束日期为', endDate)
        var updatedEndDate = res.data[0].couponEnd.concat(endDate)
        var updatedMoney = res.data[0].coupon.concat(money)
        var updatedStatus = res.data[0].couponStatus.concat(true)
        console.log(updatedMoney)
        // 兑换优惠券
        
        if (app.globalData.member_point > point) {
          db.collection('coupon').doc(app.globalData.couponId).update({            
            data: {
              couponEnd: updatedEndDate,
              couponStart: updatedStartDate,
              coupon: updatedMoney,
              couponStatus: updatedStatus
            },
            success: function (res) {              
              console.log(point)
              var memberPoint = app.globalData.member_point
              memberPoint = memberPoint - point
              console.log(memberPoint, app.globalData.userId)
              // 兑换新券
              db.collection('user').doc(app.globalData.userId).update({
                data: {
                  member_point: memberPoint,
                },
                success: function (res) {
                  console.log('[优惠券]] 兑换成功')
                  app.globalData.member_point = memberPoint // 更新全局变量中的用户积分
                }
              })
              wx.showToast({
                icon: 'sucess',
                title: '兑换成功'
              })
              // wx.navigateTo({
              //   url: "/pages/w_my_park_coupon/w_my_park_coupon"
              // })
            }
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '积分不足'
          })
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  

  updateMemberPoint() {
    db.collection('user').doc(app.globalData.userId).update({
      data: {
        member_point: app.globalData.member_point,
      },
      success: function (res) {
        console.log('[优惠券]] 兑换成功')
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})