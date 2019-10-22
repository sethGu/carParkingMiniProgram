// pages/w_my_park_coupon/w_my_park_coupon.js
const app = getApp()
const db = wx.cloud.database()  // 创建数据库实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: app.globalData.member,
    tar: 1,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.couponAbleAmount,app.globalData.couponUsedAmount)
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
    var _this = this;
    //1、引用数据库   
    const db = wx.cloud.database({
      //这个是环境ID不是环境名称     
      env: 'cloud-demo-5ax3d'
    })
    //2、开始查询数据了  news对应的是集合的名称   
    db.collection('coupon').get({
      //如果查询成功的话    
      success: res => {     
        // 分类未使用，使用记录，已过期的券
        var ableStart = []
        var ableEnd = []
        var usedStart = []
        var usedEnd = []
        var expiredStart = []
        var expiredEnd = []
        var ableMoney = [], usedMoney = [], expiredMoney = []
        for (var i of app.globalData.couponAbleIndex) {
          ableStart = ableStart.concat(app.globalData.coupon.couponStart[i])
          ableEnd = ableEnd.concat(app.globalData.coupon.couponEnd[i])
          ableMoney = ableMoney.concat(app.globalData.coupon.coupon[i])
        }
        for (var i of app.globalData.couponUsedIndex) {
          usedStart = usedStart.concat(app.globalData.coupon.couponStart[i])
          usedEnd = usedEnd.concat(app.globalData.coupon.couponEnd[i])
          usedMoney = usedMoney.concat(app.globalData.coupon.coupon[i])
        }
        for (var i of app.globalData.couponExpiredIndex) {
          expiredStart = expiredStart.concat(app.globalData.coupon.couponStart[i])
          expiredEnd = expiredEnd.concat(app.globalData.coupon.couponEnd[i])
          expiredMoney = expiredMoney.concat(app.globalData.coupon.coupon[i])
        }
        var ableArray = []
        var usedArray = []
        var expiredArray = []
        var ableStartYear = [], ableEndYear = []
        var ableStartMonth = [], ableEndMonth = []
        var ableStartDay = [], ableEndDay = []
        var usedStartYear = [], usedEndYear = []
        var usedStartMonth = [], usedEndMonth = []
        var usedStartDay = [], usedEndDay = []
        var expiredStartYear = [], expiredEndYear = []
        var expiredStartMonth = [], expiredEndMonth = []
        var expiredStartDay = [], expiredEndDay = []
        
        for (var i of ableStart) {
          ableStartDay = ableStartDay.concat(i.getDate())
          ableStartMonth = ableStartMonth.concat(i.getMonth())
          ableStartYear = ableStartYear.concat(i.getFullYear())
        }
        
        for (var i of ableEnd) {
          ableEndDay = ableEndDay.concat(i.getDate())
          ableEndMonth = ableEndMonth.concat(i.getMonth())
          ableEndYear = ableEndYear.concat(i.getFullYear())
        }
        for (var i = 0, length = ableEnd.length; i < length; i++) {
          var ableObj = {}
          ableObj.startyear = ableStartYear[i]
          ableObj.startmonth = ableStartMonth[i]
          ableObj.startday = ableStartDay[i]
          ableObj.money = ableMoney[i]
          ableObj.endyear = ableEndYear[i]
          ableObj.endmonth = ableEndMonth[i]
          ableObj.endday = ableEndDay[i]
          ableArray.push(ableObj)
        }
        console.log('ableArray:',ableArray)
        for (var i of usedStart) {
          usedStartDay = usedStartDay.concat(i.getDate())
          usedStartMonth = usedStartMonth.concat(i.getMonth())
          usedStartYear = usedStartYear.concat(i.getFullYear())
        }
        for (var i of usedEnd) {
          usedEndDay = usedEndDay.concat(i.getDate())
          usedEndMonth = usedEndMonth.concat(i.getMonth())
          usedEndYear = usedEndYear.concat(i.getFullYear())
        }
        for (var i = 0, length = usedEnd.length; i < length; i++) {
          var usedObj = {}
          usedObj.startyear = usedStartYear[i]
          usedObj.startmonth = usedStartMonth[i]
          usedObj.startday = usedStartDay[i]
          usedObj.money = usedMoney[i]
          usedObj.endyear = usedEndYear[i]
          usedObj.endmonth = usedEndMonth[i]
          usedObj.endday = usedEndDay[i]
          usedArray.push(usedObj)
        }
        console.log('usedArray:',usedArray)
        for (var i of expiredStart) {
          expiredStartDay = expiredStartDay.concat(i.getDate())
          expiredStartMonth = expiredStartMonth.concat(i.getMonth())
          expiredStartYear = expiredStartYear.concat(i.getFullYear())
        }
        for (var i of expiredEnd) {
          expiredEndDay = expiredEndDay.concat(i.getDate())
          expiredEndMonth = expiredEndMonth.concat(i.getMonth())
          expiredEndYear = expiredEndYear.concat(i.getFullYear())
        }
        for (var i = 0, length = expiredEnd.length; i < length; i++) {
          var expiredObj = {}
          expiredObj.expiredyear = expiredStartYear[i]
          expiredObj.expiredmonth = expiredStartMonth[i]
          expiredObj.expiredday = expiredStartDay[i]
          expiredObj.money = expiredMoney[i]
          expiredObj.endyear = expiredEndYear[i]
          expiredObj.endmonth = expiredEndMonth[i]
          expiredObj.endday = expiredEndDay[i]
          expiredArray.push(expiredObj)
        }
        console.log('123321123')
        this.setData({
          coupon: res.data[0].coupon.length,
          tar1: app.globalData.couponAbleAmount,
          tar2: app.globalData.couponUsedAmount,
          tar3: app.globalData.couponExpiredAmount,
          ableArray: ableArray,
          usedArray: usedArray,
          expiredArray: expiredArray,
          
          // ableMoney: ableMoney,
          // ableStartDay: ableStartDay,
          // ableStartMonth: ableStartMonth,
          // ableStartYear: ableStartYear,
          // ableEndDay: ableEndDay,
          // ableEndMonth: ableEndMonth,
          // ableEndYear: ableEndYear, // 有效券
          // usedMoney: usedMoney,
          // usedStartDay: usedStartDay,
          // usedStartMonth: usedStartMonth,
          // usedStartYear: usedStartYear,
          // usedEndDay: usedEndDay,
          // usedEndMonth: usedEndMonth,
          // usedEndYear: usedEndYear, // 使用记录券
          // expiredMoney: expiredMoney,
          // expiredStartDay: expiredStartDay,
          // expiredStartMonth: expiredStartMonth,
          // expiredStartYear: expiredStartYear,
          // expiredEndDay: expiredEndDay,
          // expiredEndMonth: expiredEndMonth,
          // expiredEndYear: expiredEndYear, // 过期券
        })
        console.log('46436457568',res.data[0].coupon.length, tar1, app.globalData.couponAbleIndex)
      }
    })
  },

  list1: function () {
    // 切换使用记录，查询数据
    this.setData({
      tar: "1",
    })
  },

  list2: function () {
    // 切换使用记录，查询数据
    this.setData({
      tar: "2",
    })
  },

  list3: function () {
    // 切换使用记录，查询数据
    this.setData({
      tar: "3",
    })
  },

  exchangeCoupon: function (e) {
    if (this.data.member != true) {
      this.onLoad();
    } else {
      wx.navigateTo({
        url: "/pages/w_my_exchange_coupon/w_my_exchange_coupon"
      })
    }
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