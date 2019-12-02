const app = getApp()
const db = wx.cloud.database()

// miniprogram/pages/projectList/projectList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    project: [],
    teamList: [],
    isJoin: false,
    isCreater: false
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
    //this.getproject();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getproject();

    if (app.userInfo._id == app.joinTeam) {
      this.setData({
        isCreater: true
      })
    }
    this.getproject(),
      this.setData({
        isJoin: app.isJoin,
        teamList: app.teamList
      })
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
  getproject() {
    var that = this
    db.collection('project').get({
      success: function(res) {
        // res.data 包含该记录的数据
        that.setData({
          project: res.data
        })
      }
    })
  },
  joinProject: function(e) {
    console.log(e)
    if (app.userInfo._id) {
      if (e.currentTarget.dataset.id == app.userInfo._id) {
        wx.showToast({
          title: '不能自己申请自己'
        })
      } else {
        db.collection('messagep').where({
          userId: e.currentTarget.dataset.id,
          projectId: e.currentTarget.dataset.projectid
        }).get().then((res) => {
          if (res.data.length) { // 更新
            if (res.data[0].list.includes(app.userInfo._id)) {
              wx.showToast({
                title: '已申请过!'
              })
            } else {
              wx.cloud.callFunction({
                name: 'update',
                data: {
                  collection: 'messagep',
                  where: {
                    userId: e.currentTarget.dataset.id,
                    projectId: e.currentTarget.dataset.projectid
                  },
                  data: `{list : _.unshift('${app.userInfo._id}')}`
                }
              }).then((res) => {
                wx.showToast({
                  title: '申请成功~'
                })
              });
            }
          } else { // 添加 
            db.collection('messagep').add({
              data: {
                userId: e.currentTarget.dataset.id,
                projectId: e.currentTarget.dataset.projectid,
                list: [app.userInfo._id],
              }
            }).then((res) => {
              wx.showToast({
                title: '申请成功'
              })
            });
          }
        });
      }
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
  },
  onMyEvent(ev) {
    this.setData({
      teamList: []
    }, () => {
      this.setData({
        teamList: ev.detail
      });
    });
  },
  exitTeam(e) {
    db.collection('users').doc(app.userInfo._id).get().then((res) => {
      console.log(res.data.joinList)
      let joinList = res.data.joinList
      db.collection('users').doc(res.data.joinList).get().then((res) => {

        let TeamList = res.data.TeamList;

        TeamList = TeamList.filter((val, i) => {
          return val != app.userInfo._id
        });
        wx.cloud.callFunction({
          name: 'update',
          data: {
            collection: 'users',
            doc: joinList,
            data: {
              TeamList: TeamList
            }
          }
        }).then((res) => {
          db.collection('users').doc(app.userInfo._id).update({
              data: {
                joinList: ''
              }
            })
            .then((res) => {
              this.setData({
                isJoin: false
              })

            })
        })

      })


    })
  },
  dismissTeam(e) {
    db.collection('users').doc(app.userInfo._id).get().then((res) => {
      console.log(res.data.joinList)
      let joinList = res.data.joinList
      db.collection('users').doc(res.data.joinList).get().then((res) => {
        console.log(res)
        let TeamList = res.data.TeamList;
        wx.cloud.callFunction({
          name: 'update',
          data: {
            collection: 'users',
            doc: joinList,
            data: {
              TeamList: []
            }
          }
        }).then((res) => {
          console.log(res)
             includes


            })
       

      })


    })
  }

  //是否申请过

})