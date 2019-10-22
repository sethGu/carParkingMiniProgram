// pages/w_my/w_my.js
const app = getApp()
const db = wx.cloud.database()
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    member: app.globalData.member,
    member_dengji: app.globalData.member_dengji,
    member_point: app.globalData.member_point,
    member_tel: app.globalData.member_tel,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getDetailedInfo()
    this.queryCouponStatus()
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
        //这一步很重要，给member_point赋值，没有这一步的话，前台就不会显示值      
        this.setData({
          member_point: res.data[0].member_point
        })
      }
    })
  },
  
  // 签到
  signIn: function () {
    this.queryUserPoint();
  },

  queryUserPoint() {
    db.collection('signIn').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        // 根据openid查询到记录
        // 根据openid查询到记录id
        // 将this.queryRecordId()迁移到index.js，详情见release2文档 业务逻辑第四点
        var currentDate = new Date();
        app.globalData.updatedSignInDate = res.data[0].signInRecord.concat(currentDate)

        // 同时命名库中最近的一次记录为
        app.globalData.newestRecordTime = res.data[0].signInRecord[res.data[0].signInRecord.length - 1]
        console.log('newestRecord:', app.globalData.newestRecordTime)
        // 将Date()表示为天
        if (!app.globalData.newestRecordTime) {
          var newestDate = currentDate.valueOf()
          newestDate = newestDate - 90 * 24 * 60 * 60 * 1000
          newestDate = new Date(newestDate)
        } else {
          var newestDate = app.globalData.newestRecordTime.getYear() + '-' + app.globalData.newestRecordTime.getMonth() + '-' + app.globalData.newestRecordTime.getDate()
        }
        let currentDay = currentDate.getYear() + '-' + currentDate.getMonth() + '-' + currentDate.getDate()
        console.log('newestDate',newestDate,'currentDay',currentDay)
        // 判断最近一次签到是否在当天，若不是则可以签到获取积分
        if (currentDay == newestDate) {
          wx.showToast({
            icon: 'none',
            title: '不能重复签到'
          })
        } else {
          this.updateRecord()
          this.updatePoint()          
        }
        console.log('[数据库] [查询签到具体记录] 成功: ', res.data[0].signInRecord)
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

  updateRecord () {
    db.collection('signIn').doc(app.globalData.recordId).update({
      data: {
        signInRecord: app.globalData.updatedSignInDate
      },
      success: function (res) {
        console.log('[签到] updateRecord成功')
        wx.showToast({
          icon: 'sucess',
          title: '积分+10'
        })
      }
    })
  },

  updatePoint() {
    var point = app.globalData.member_point+10
    db.collection('user').doc(app.globalData.user._id).update({
      data: {
        member_point: point
      },
      success: function (res) {
        console.log('[签到] updatePoint成功',point)
      }
    })
    this.setData({
      member_point: point
    })
  },

  getDetailedInfo() {
    wx.cloud.callFunction({
      name: 'getUser',
    }).then((res) => {
      if (res.result.data.length) {
        this.setData({
          user: res.result.data[0]
        })
        app.globalData.user = res.result.data[0];
        app.globalData.member = res.result.data[0].member;
        app.globalData.member_dengji = res.result.data[0].member_dengji;
        app.globalData.member_point = res.result.data[0].member_point;
        // 把电话挡掉4位，并把基本数据（不包含 券、车牌、历史）传入
        if (res.result.data[0].member_tel) {
          var tel = res.result.data[0].member_tel;
          var hidden_tel = tel.substr(0, 3) + "****" + tel.substr(7);
          app.globalData.member_tel = hidden_tel;
        } else {
          app.globalData.member_tel = res.result.data[0].member_tel;
        }
      }
    })
  },

  /********************** 停车优惠券 ************************/
  my_list4: function (e) {
    if (this.data.member != true) {
      this.onLoad();
    } else {
      wx.navigateTo({
        url: "/pages/w_my_park_coupon/w_my_park_coupon"
      })
    }
  },

  queryCouponStatus () {
    var tmpCurrent = new Date()
    var currentDate = tmpCurrent.valueOf()
    db.collection('coupon').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        // 做完停车优惠券分类，未使用couponAbleAmount，使用记录couponUsedAmount，已过期couponExpiredAmount
        app.globalData.coupon = res.data[0]
        app.globalData.couponAmount = res.data[0].coupon.length
        var tmpStatus = res.data[0].couponStatus
        var counterT = 0
        var counterF = 0
        var counterE = 0
        var indexT = []
        var indexF = []
        var indexE = []
        var expiredDate = res.data[0].couponEnd
        for (var i=0, length=tmpStatus.length; i<length; i++) {
          if (tmpStatus[i]==true) {
            if (currentDate>expiredDate[i].valueOf()) {
              counterE++
              indexE = indexE.concat(i)
            }
            else {
              counterT++
              indexT = indexT.concat(i)
            }
          }
          if (tmpStatus[i]==false) {
            counterF++
            indexF = indexF.concat(i)
          }
        }
        app.globalData.couponAbleAmount = counterT
        app.globalData.couponExpiredAmount = counterE
        app.globalData.couponUsedAmount = counterF
        app.globalData.couponAbleIndex = indexT
        app.globalData.couponExpiredIndex = indexE
        app.globalData.couponUsedIndex = indexF
        console.log('qweqweqwe', res.data[0].coupon.length, counterF, counterT, counterE, indexT, indexF,indexE)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },

  my_list5: function (e) {
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