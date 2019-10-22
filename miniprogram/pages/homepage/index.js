// pages/homepage/index.js
const app = getApp()
const db = wx.cloud.database()  // 创建数据库实例


Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    // index elements
    imgUrls: [
      '/images/tu1.png',
      '/images/tu2.jpg',
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,//从data开始的值到此是轮播
    hasUserInfo: false,//是否已授权
    canIUse: wx.canIUse('button.open-type.getUserInfo'),//判断是否可用
    member: false,//是否是会员
    member_tel: "",//会员手机号,默认无
    member_dengji: "",//会员等级，默认无
    show: "",//卷码扫描值
    history: null,//历史记录值
    showModalStatus: false,//搜索面板显示，默认隐藏
    search_result: null,//搜索结果
    keyboardShow: null,//搜索车牌的值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      simpleKeyboard: this.selectComponent("#simpleKeyboard"),//获取传值
    })
    this.queryCouponId()
    this.queryUserId()
  },

  getUserInfo () {
    //调用云函数，直接获取openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          // 跳转到网络连接失败页
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  queryUserInfo () {
    db.collection('user').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.setData({
          queryResult: JSON.stringify(res.data, null, 2),
        })
        console.log('[数据库] [查询记录] 成功: ', res.data[0])
        // 判断是否为新用户 （而不包含 券、车牌、历史）
        if (res.data[0]) {
          console.log('不是新用户（基本信息都是非空），用户id为', res.data[0]._openid)
        } else {
          console.log('是新用户,新增记录')
          this.onAddNew()
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

  // 从云函数getUser异步获取用户具体信息(使用es7的async-await作为异步传值方法)
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

  // 添加新用户至云数据库
  onAddNew () {
    const db = wx.cloud.database()
    db.collection('user').add({
      data: {
        member: true,
        // member_tel: "12345678901",
        member_tel: null,
        member_dengji: 1,
        member_point: 500,        
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '欢迎首次使用！',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
    db.collection('signIn').add({
      data: {
        signInRecord: [],
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
    db.collection('coupon').add({
      data: {
        coupon: [],
        couponEnd: [],
        couponStart: [],
        couponStatus: []
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  queryRecordId() {
    db.collection('signIn').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        app.globalData.recordId = res.data[0]._id
        console.log('[数据库] [查询用户的签到记录id] 成功: ', app.globalData.recordId)
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

  queryCouponId() {
    // 查询当前用户所有的 coupon
    db.collection('coupon').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        app.globalData.couponId = res.data[0]._id
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },

  queryUserId() {
    db.collection('user').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        // console.log('[数据库] [查询用户的签到记录id] 成功: ', res.data[0])
        app.globalData.userId = res.data[0]._id
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.queryUserInfo();
    this.getUserInfo();
    this.getDetailedInfo();
    this.queryRecordId();
    // 判断是否会员
    if (app.globalData.member) {
      this.setData({
        member: app.globalData.member,
        history: app.globalData.history,
      })
    } 
    // else {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.memberReadyCallback = res => {
    //     that.shuju();
    //   }
    // }
    // 测试有无值
    setTimeout(function(){
      console.log('用户是否为会员', app.globalData.user);
    }, 3000)
    
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

  },

  /** 
   * 业务逻辑
   */
  
  // 搜索查询 -- 见index/index中数据库实例
  toSearch: function (e) {
    this.data.simpleKeyboard.hide()
    var o = this.data.simpleKeyboard.getContent()
    let data;
    let localStorageValue = [];
    var that = this;
    if (o != '' && o.length >= 4) {
      //调用API从本地缓存中获取数据  
      // var searchData = wx.getStorageSync('searchData') || []
      // searchData.push(this.data.inputValue)
      // wx.setStorageSync('searchData', searchData)


      wx.request({
        url: app.globalData.host + '/wxpay/getparkingbykeyword',//这里填写后台给你的搜索接口  
        data: { keyword: o },
        header: {
          'content-type': 'application/json',
          'Cookie': 'LXPARKINGID=' + app.globalData.loginMess
        },
        success: function (res) {
          console.log(res)
          if (res.data.code === 1200) {
            wx.showModal({
              title: "提示",
              content: "" + res.data.msg,
              confirmColor: "#4fafc9",
              confirmText: "我知道了",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                }
              }
            })
          } else {
            if (res.data.code === 1001) {
              for (var i = 0; i < res.data.data.data.length; i++) {
                var str = res.data.data.data[i].carnumber;
                var str2 = str.substring(0, 2) + "·" + str.substring(2);
                res.data.data.data[i].carnumber = str2;
              }
              that.setData({
                search_result: res.data.data.data,
              });
              that.showModal()
              console.log(that.data.search_result)
            } else {
              wx.showModal({
                title: "搜索提示",
                content: "" + res.data.msg,
                confirmColor: "#4fafc9",
                confirmText: "我知道了",
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                  }
                }
              })
            }
          }
        },
        fail: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        },
      });
    } else {
      wx.showModal({
        title: "无法查询",
        content: "查询值不能为空或长度低于4位",
        confirmColor: "#4fafc9",
        confirmText: "我知道了",
        showCancel: false,
      })
    }

  },
  // 缴费规则
  tapRule: function (e) {
    wx.navigateTo({
      url: "/pages/w_index_rule/w_index_rule",
    })
  },
  //绑定会员
  tapBindmember: function (e) {
    var that = this;
    that.data.simpleKeyboard.hide()
    wx.navigateTo({
      url: "../w_my_bind_member/w_my_bind_member",
    })
  },

  //卷码扫描
  scan: function () {
    var that = this;
    var show;
    wx.scanCode({
      success: (res) => {
        this.show = "--result:" + res.result
        that.setData({
          show: this.show
        })
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
        //获取成功向后台保存获取的值
      },
      fail: (res) => {
        wx.showModal({
          title: "未获取成功",
          content: "未成功扫描二维码",
          confirmColor: "#4fafc9",
          confirmText: "我知道了",
          showCancel: false,
        })
        // wx.showToast({
        //   title: '未获取成功',
        //   image: '/images/tishi.png',
        //   duration: 2000
        // })
      },
      complete: (res) => {
      }
    })
  },
  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  //搜索结果跳支付
  search_pay: function (e) {
    var str = e.currentTarget.dataset.text.replace("·", "")
    if (app.globalData.loginMess && app.globalData.loginMess != "") {
      wx.request({
        url: app.globalData.host + '/wxpay/getparkinginfo',//这里填写后台给你的搜索接口
        data: { carnumber: str },
        header: {
          'content-type': 'application/json',
          'Cookie': 'NWRZPARKINGID=' + app.globalData.loginMess
        },
        success: function (res) {
          console.log(res)
          if (res.data.code === 1200) {
            wx.showModal({
              title: "提示",
              content: "" + res.data.msg,
              confirmColor: "#4fafc9",
              confirmText: "我知道了",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                }
              }
            })
          } else {
            if (res.data.code === 1001) {
              wx.showModal({
                title: "提示",
                content: "" + res.data.msg,
                confirmColor: "#4fafc9",
                confirmText: "我知道了",
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                  }
                }
              })
            } else {
              wx.navigateTo({
                url: "/pages/w_payment/w_payment?title=" + str
              })
            }
          }
        },
        fail: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        },
      });
    } else {
      wx.showModal({
        title: "提示",
        content: "当前网络延迟，未获取到相关信息，请重新尝试",
        confirmColor: "#4fafc9",
        confirmText: "我知道了",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    }
  },



  cloudCenter: function() {
    wx.navigateTo({
      url: "../index/index",
    })
  }
})