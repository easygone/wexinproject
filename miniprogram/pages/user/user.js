// miniprogram/pages/user/user.js

const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto: "/images/user/user-unlogin.png",
    nickName: "小喵喵",
    logged: false,
    disabled: true,
    id: '',
    projectMessage: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

    this.getLocation();

    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {
      //console.log(res);
      db.collection('users').where({
        _openid: res.result.openid
      }).get().then((res) => {
        if (res.data.length) {
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            id: app.userInfo._id
          });
          //  this.getMessage();
          this.isJoind();
          this.getMessagep();
          this.getJoinList();

        } else {
          this.setData({
            disabled: false
          });
        }
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      userPhoto: app.userInfo.userPhoto,
      nickName: app.userInfo.nickName,
      id: app.userInfo._id
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindGetUserInfo(ev) {
    //console.log(ev);
    let userInfo = ev.detail.userInfo;
    if (!this.data.logged && userInfo) {
      db.collection('users').add({
        data: {
          userPhoto: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          signature: '',
          phoneNumber: '',
          weixinNumber: '',
          links: 0,
          time: new Date(),
          isLocation: true,
          longitude: this.longitude,
          latitude: this.latitude,
          location: db.Geo.Point(this.longitude, this.latitude),
          friendList: [],
          joinList: []
        }
      }).then((res) => {
        db.collection('users').doc(res._id).get().then((res) => {
          //console.log(res.data);
          app.userInfo = Object.assign(app.userInfo, res.data);
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            id: app.userInfo._id
          });
        });
      });
    }
  },
  getMessage() {
    db.collection('message').where({
      userId: app.userInfo._id
    }).watch({
      onChange: function(snapshot) {
        if (snapshot.docChanges.length) {
          let list = snapshot.docChanges[0].doc.list;
          if (list.length) {
            wx.showTabBarRedDot({
              index: 3
            });
            app.userMessage = list;
          } else {
            wx.hideTabBarRedDot({
              index: 3
            })
            app.userMessage = [];
          }
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    });
  },
  //获取申请列表
  getMessagep() {
    var that = this
    //获取我创建的项目
    db.collection('project').where({
      userId: app.userInfo._id
    }).get().then((res) => {
      //循环监听
      app.myProjectList = res.data
      var style = {
        projectId: 123,
        projectMessage: 123
      }
      var style_array = {}
      for (var i = 0; i < res.data.length; i++) {
        let projectId = res.data[i]._id
        db.collection('messagep').where({
          userId: app.userInfo._id,
          projectId: res.data[i]._id
        }).watch({
          onChange: function(snapshot) {
            if (snapshot.docChanges.length) {
              let list = snapshot.docChanges[0].doc.list;
              if (list.length) {
                wx.showTabBarRedDot({
                  index: 3
                });
                style = {}
                style.projectId = projectId
                style.projectMessage = list
                app.projectMessage[i] = style
                //Object.assign(projectId,list)
           
               
              } else {
                wx.hideTabBarRedDot({
                  index: 3
                })
                app.projectMessage = {};
              }
            }
          },
          onError: function(err) {
            console.error('the watch closed because of error', err)
          }

        });


      }
    

    })
    
  },
  getJoinList() {
    db.collection('users').where({
      _id: app.userInfo._id
    }).watch({
      onChange: function(snapshot) {
        if (snapshot.docChanges.length) {
          console.log(snapshot.docChanges[0].doc.joinList)
          let list = snapshot.docChanges[0].doc.joinList;
          if (list.length) {
            wx.showTabBarRedDot({
              index: 1
            });
            app.joinList = list;

          } else {
            wx.hideTabBarRedDot({
              index: 1
            })
            app.joinList = [];
          }
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    });
  },
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.latitude = res.latitude
        this.longitude = res.longitude
      }
    })
  },
  isJoind() {
    var that = this
    if (app.userInfo._id) {
      db.collection('users').where({
        _id: app.userInfo._id
      }).get().then((res) => {
        if (res.data.length) { // 更新
          app.joinTeam = res.data[0].joinList
          db.collection('users').where({
            _id: res.data[0].joinList
          }).watch({
            onChange: function(snapshot) {
              //  console.log(snapshot)
              if (snapshot.docChanges.length) {
                // console.log(snapshot.docChanges[0].doc)
                let list = snapshot.docChanges[0].doc.joinList;
                if (list) {

                  app.isJoin = true;
                } else {

                  app.isJoin = false
                }
              }
            },
            onError: function(err) {
              console.error('the watch closed because of error', err)
            }
          })
          if (res.data[0].joinList) {
            db.collection('users').where({
              _id: res.data[0].joinList
            }).watch({
              onChange: function(snapshot) {

                if (snapshot.docChanges.length) {
                  // console.log(snapshot.docChanges[0].doc)
                  let list = snapshot.docChanges[0].doc.TeamList;
                  if (list.length) {
                    wx.showTabBarRedDot({
                      index: 0
                    });
                    app.teamList = list;
                  } else {
                    wx.hideTabBarRedDot({
                      index: 0
                    })
                    app.teamList = [];
                  }
                }
              },
              onError: function(err) {
                console.error('the watch closed because of error', err)
              }
            })


            app.isJoin = true

          } else {

            app.isJoin = false

          }
        } else { // 添加 
          app.isJoin = false
        }
      });
    } else {
      wx.showToast({
        title: '请先登录',
        duration: 2000,
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user'
            })
          }, 2000);
        }
      })
    }
  }
})